
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
    const tiktokAccountRef = firestore.doc(`users/${userId}/tiktokAccounts/${tiktokAccountId}`);

    try {
      await tiktokAccountRef.update({ lastSyncStatus: 'syncing', lastSyncTime: new Date().toISOString() });

      const videoFields = [
        "id", "title", "cover_image_url", "share_url", "view_count",
        "like_count", "comment_count", "share_count", "create_time"
      ].join(',');
      
      let cursor: string | number | undefined = 0; // Start with cursor 0
      let hasMore = true;
      let allVideos: any[] = [];
      let page = 0;

      while (hasMore) {
        page++;
        console.log(`Fetching page ${page} of TikTok videos for user ${userId}...`);
        
        const requestBody = {
            fields: videoFields,
            max_count: 20,
            cursor: cursor,
        };

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
                batch.set(videoDocRef, video, { merge: true }); // Use merge to be safe
            });
            await batch.commit();
            console.log(`Saved ${videos.length} videos to Firestore for user ${userId}.`);
        }

        cursor = newCursor;
        hasMore = has_more;
      }
      
      console.log(`Successfully fetched and saved ${allVideos.length} videos for user ${userId}.`);
      
      // Update the sync status and video count on the main document
      await tiktokAccountRef.update({
          lastSyncStatus: 'success',
          lastSyncTime: new Date().toISOString(),
          videoCount: allVideos.length, // Update with the final count
      });

    } catch (err: any) {
      console.error("Error during TikTok history fetch:", err.message);
       await tiktokAccountRef.update({
          lastSyncStatus: 'error',
          lastSyncError: err.message,
          lastSyncTime: new Date().toISOString()
      });
      // Do not re-throw, as we've logged the error and updated the status.
      // Re-throwing would cause the Genkit flow to show as failed in logs.
    }
  }
);
