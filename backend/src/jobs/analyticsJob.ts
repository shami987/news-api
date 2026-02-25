import cron from 'node-cron';
import { enqueueDailyAggregation } from './analyticsQueue';

// Daily analytics aggregation job - runs at midnight GMT
export const startAnalyticsJob = () => {
  // Run every day at 00:00 GMT (midnight)
  cron.schedule('0 0 * * *', async () => {
    try {
      console.log('Running daily analytics aggregation...');
      
      // Get yesterday's date in GMT
      const yesterday = new Date();
      yesterday.setUTCDate(yesterday.getUTCDate() - 1);
      yesterday.setUTCHours(0, 0, 0, 0);
      
      // Queue daily aggregation work so cron callback stays lightweight.
      enqueueDailyAggregation(yesterday);
      
      console.log(`Analytics aggregation queued for ${yesterday.toISOString().split('T')[0]}`);
    } catch (error) {
      console.error('Error aggregating analytics:', error);
    }
  }, {
    timezone: 'GMT'
  });
  
  console.log('Analytics job scheduled: Daily at 00:00 GMT');
};
