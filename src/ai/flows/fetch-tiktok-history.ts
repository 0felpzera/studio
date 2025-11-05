
'use server';
/**
 * @fileOverview Fetches the entire video history for a TikTok account in the background.
 * This flow is designed to be triggered after the initial OAuth connection and fetches video
 * data in a paginated manner to avoid timeouts and handle large accounts.
 *
 * - fetchTikTokHistory - The main flow function.
 * - FetchTikTokHistoryInput - Input schema for the flow.
 */

import { ai } from '@/ai/genkit';
import { z } from 'zod';
import { getFirestore } from 'firebase-admin/firestore';
import { initializeAdminApp } from '@/firebase/admin';

const FetchTikTokHistoryInputSchema = z.object({
  userId: z.string().describe('The Firebase User ID.'),
  tiktokAccountId: z.string().describe("The user's unique identifier on TikTok (open_id)."),
  accessToken: z.string().describe('The TikTok access token.'),
});

export type FetchTikTokHistoryInput = z.infer<typeof FetchTikTokHistoryInputSchema>;

const TIKTOK_VIDEOLIST_URL = 'https://open.tiktokapis.com/v2/video/list/';

export async function fetchTikTokHistory(input: FetchTikTokHistoryInput): Promise<void> {
  await fetchTikTokHistoryFlow(input);
}

const fetchTikTokHistoryFlow = ai.defineFlow(
  {
    name: 'fetchTikTokHistoryFlow',
    inputSchema: FetchTikTokHistoryInputSchema,
    outputSchema: z.void(),
  },
  async ({ userId, tiktokAccountId, accessToken }) => {
    
    initializeAdminApp();
    const firestore = getFirestore();

    try {
      const videoFields = [
        "id", "title", "cover_image_url", "share_url", "view_count",
        "like_count", "comment_count", "share_count", "create_time"
      ].join(',');
      
      let cursor: string | number | undefined = undefined;
      let hasMore = true;
      let allVideos: any[] = [];
      let page = 0;

      while (hasMore) {
        page++;
        console.log(`Fetching page ${page} of TikTok videos for user ${userId}...`);
        
        const requestBody: { fields: string; max_count: number; cursor?: string | number } = {
            fields: videoFields,
            max_count: 20,
        };

        if (cursor) {
            requestBody.cursor = cursor;
        }

        const response = await fetch(TIKTOK_VIDEOLIST_URL, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${accessToken}`,
              'Content-Type': 'application/json',
            },
            body: JSON.stringify(requestBody),
        });
        
        const responseData = await response.json();

        if (responseData.error.code !== 'ok') {
          console.error('TikTok API Error on page fetch:', responseData.error);
          throw new Error(`Failed to fetch video list page: ${responseData.error.message}`);
        }

        const { videos, cursor: newCursor, has_more } = responseData.data;
        
        if (videos && videos.length > 0) {
            allVideos.push(...videos);
            const batch = firestore.batch();
            const videosCollectionRef = firestore.collection(`users/${userId}/tiktokAccounts/${tiktokAccountId}/videos`);
            videos.forEach((video: any) => {
                const videoDocRef = videosCollectionRef.doc(video.id);
                batch.set(videoDocRef, video);
            });
            await batch.commit();
            console.log(`Saved ${videos.length} videos to Firestore for user ${userId}.`);
        }

        cursor = newCursor;
        hasMore = has_more;
      }
      
      console.log(`Successfully fetched and saved ${allVideos.length} videos for user ${userId}.`);
      
      // Update the sync status
      const tiktokAccountRef = firestore.doc(`users/${userId}/tiktokAccounts/${tiktokAccountId}`);
      await firestore.batch().update(tiktokAccountRef, {
          lastSyncStatus: 'success',
          lastSyncTime: new Date().toISOString(),
          videoCount: allVideos.length
      }).commit();

    } catch (err: any) {
      console.error("Error during TikTok history fetch:", err.message);
       const tiktokAccountRef = firestore.doc(`users/${userId}/tiktokAccounts/${tiktokAccountId}`);
       await firestore.batch().update(tiktokAccountRef, {
          lastSyncStatus: 'error',
          lastSyncError: err.message,
          lastSyncTime: new Date().toISOString()
      }).commit();
      
      throw err;
    }
  }
);
