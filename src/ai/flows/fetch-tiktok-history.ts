
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
import { z } from 'genkit';
import axios from 'axios';
import { initializeFirebase } from '@/firebase';
import { collection, doc, writeBatch } from 'firebase/firestore';

const FetchTikTokHistoryInputSchema = z.object({
  userId: z.string().describe('The Firebase User ID.'),
  tiktokAccountId: z.string().describe("The user's unique identifier on TikTok (open_id)."),
  accessToken: z.string().describe('The TikTok access token.'),
});

export type FetchTikTokHistoryInput = z.infer<typeof FetchTikTokHistoryInputSchema>;

const TIKTOK_VIDEOLIST_URL = 'https://open.tiktokapis.com/v2/video/list/';

export async function fetchTikTokHistory(input: FetchTikTokHistoryInput): Promise<void> {
  return fetchTikTokHistoryFlow(input);
}

const fetchTikTokHistoryFlow = ai.defineFlow(
  {
    name: 'fetchTikTokHistoryFlow',
    inputSchema: FetchTikTokHistoryInputSchema,
    outputSchema: z.void(),
  },
  async ({ userId, tiktokAccountId, accessToken }) => {
    const { firestore } = initializeFirebase();
    const accountRef = doc(firestore, 'users', userId, 'tiktokAccounts', tiktokAccountId);
    
    // Set status to 'syncing'
    await updateDoc(accountRef, { lastSyncStatus: 'syncing' });

    try {
      const videoFields = [
        "id", "title", "cover_image_url", "share_url", "view_count",
        "like_count", "comment_count", "share_count", "create_time"
      ];
      
      let cursor: string | undefined = undefined; // Cursor is a string
      let hasMore = true;
      let totalFetched = 0;

      while (hasMore) {
        const body = {
            fields: videoFields,
            max_count: 20, // Max allowed by TikTok API
            cursor: cursor,
        };

        const response = await axios.post(
          TIKTOK_VIDEOLIST_URL,
          JSON.stringify(body),
          { 
              headers: { 
                  'Authorization': `Bearer ${accessToken}`, 
                  'Content-Type': 'application/json; charset=utf-8',
              } 
          }
        );

        if (response.data.error.code !== 'ok') {
          throw new Error(`Failed to fetch video list page: ${response.data.error.message} - ${JSON.stringify(response.data)}`);
        }

        const { videos, cursor: newCursor, has_more } = response.data.data;
        
        if (videos && videos.length > 0) {
            const batch = writeBatch(firestore);
            const videosCollectionRef = collection(accountRef, 'videos');
            
            videos.forEach((video: any) => {
                const videoDocRef = doc(videosCollectionRef, video.id);
                batch.set(videoDocRef, video);
            });
            
            await batch.commit();
            totalFetched += videos.length;
        }

        cursor = newCursor;
        hasMore = has_more;
        
        if (!hasMore) break;
      }
      
      // Update status to 'success' after fetching all pages
      await updateDoc(accountRef, { lastSyncStatus: 'success', lastSyncTime: new Date().toISOString() });
      console.log(`Successfully fetched ${totalFetched} videos for user ${userId}.`);

    } catch (err: any) {
       // Update status to 'error'
      await updateDoc(accountRef, { lastSyncStatus: 'error', lastSyncError: err.message });
      console.error("Error during TikTok history fetch:", err);
      // Re-throw the error so the caller knows the flow failed
      if (axios.isAxiosError(err) && err.response) {
        throw new Error(`API Request Failed: ${err.response.status} ${err.response.statusText} - ${JSON.stringify(err.response.data)}`);
      }
      throw err;
    }
  }
);

// Helper function to update a doc without using our hook-based non-blocking updater
async function updateDoc(docRef: any, data: any) {
    const { setDoc } = await import('firebase/firestore');
    return setDoc(docRef, data, { merge: true });
}

    