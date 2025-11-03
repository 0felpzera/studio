'use server';
/**
 * @fileOverview Exchanges a TikTok authorization code for an access token and fetches user info.
 * 
 * - exchangeTikTokCode - The main flow function.
 * - ExchangeTikTokCodeInput - Input schema for the flow.
 * - ExchangeTikTokCodeOutput - Output schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'genkit';
import axios from 'axios';

const ExchangeTikTokCodeInputSchema = z.object({
    code: z.string().describe('The authorization code returned from TikTok OAuth.'),
});

export type ExchangeTikTokCodeInput = z.infer<typeof ExchangeTikTokCodeInputSchema>;

// Based on the user.info.basic and user.info.stats scopes
const ExchangeTikTokCodeOutputSchema = z.object({
    open_id: z.string().describe("The user's unique identifier on TikTok."),
    union_id: z.string().describe("The user's unique identifier across TikTok platforms."),
    avatar_url: z.string().url().describe("URL for the user's profile picture."),
    display_name: z.string().describe("The user's public display name."),
    follower_count: z.number().describe("The number of followers the user has."),
    following_count: z.number().describe("The number of users the user is following."),
    likes_count: z.number().describe("The number of likes the user has received."),
});

export type ExchangeTikTokCodeOutput = z.infer<typeof ExchangeTikTokCodeOutputSchema>;

const TIKTOK_TOKEN_URL = 'https://open.tiktokapis.com/v2/oauth/token/';
const TIKTOK_USERINFO_URL = 'https://open.tiktokapis.com/v2/user/info/';

export async function exchangeTikTokCode(input: ExchangeTikTokCodeInput): Promise<ExchangeTikTokCodeOutput> {
    return exchangeTikTokCodeFlow(input);
}


const exchangeTikTokCodeFlow = ai.defineFlow(
    {
        name: 'exchangeTikTokCodeFlow',
        inputSchema: ExchangeTikTokCodeInputSchema,
        outputSchema: ExchangeTikTokCodeOutputSchema,
    },
    async ({ code }) => {
        const clientKey = process.env.TIKTOK_CLIENT_KEY;
        const clientSecret = process.env.TIKTOK_CLIENT_SECRET;

        if (!clientKey || !clientSecret) {
            throw new Error('TikTok client key or secret is not configured in environment variables.');
        }

        try {
            // Step 1: Exchange authorization code for an access token
            const tokenParams = new URLSearchParams();
            tokenParams.append('client_key', clientKey);
            tokenParams.append('client_secret', clientSecret);
            tokenParams.append('code', code);
            tokenParams.append('grant_type', 'authorization_code');
            tokenParams.append('redirect_uri', 'https://9000-firebase-studio-1761913155594.cluster-gizzoza7hzhfyxzo5d76y3flkw.cloudworkstations.dev/auth/tiktok/callback');

            const tokenResponse = await axios.post(TIKTOK_TOKEN_URL, tokenParams, {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded',
                },
            });

            const { access_token, open_id, error, error_description } = tokenResponse.data;
            
            if (error) {
                throw new Error(`TikTok API Error: ${error} - ${error_description}`);
            }

            if (!access_token) {
                throw new Error('Failed to retrieve access token from TikTok.');
            }
            
            // Step 2: Use the access token to fetch user information
            const fields = 'open_id,union_id,avatar_url,display_name,follower_count,following_count,likes_count';
            const userInfoUrlWithParams = `${TIKTOK_USERINFO_URL}?fields=${fields}`;

            const userInfoResponse = await axios.get(userInfoUrlWithParams, {
                headers: {
                    'Authorization': `Bearer ${access_token}`,
                },
            });

            if (userInfoResponse.data.error.code !== 'ok') {
                throw new Error(`Failed to fetch user info: ${userInfoResponse.data.error.message}`);
            }

            const userInfo = userInfoResponse.data.data.user;

            return {
                open_id: userInfo.open_id,
                union_id: userInfo.union_id,
                avatar_url: userInfo.avatar_url,
                display_name: userInfo.display_name,
                follower_count: userInfo.follower_count,
                following_count: userInfo.following_count,
                likes_count: userInfo.likes_count,
            };
        } catch (err: any) {
            if (axios.isAxiosError(err) && err.response) {
                console.error("Axios Error Details:", err.response.data);
                throw new Error(`API Request Failed: ${err.response.status} ${err.response.statusText} - ${JSON.stringify(err.response.data)}`);
            }
            throw err; // Re-throw other errors
        }
    }
);
