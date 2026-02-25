import { AnalyticsModel } from '../models/Analytics';

type AnalyticsQueueJob =
  | { type: 'read'; articleId: string; readerId: string | null }
  | { type: 'aggregate'; date: Date };

const queue: AnalyticsQueueJob[] = [];
let workerRunning = false;

const runQueue = async (): Promise<void> => {
  if (workerRunning) {
    return;
  }

  workerRunning = true;
  while (queue.length > 0) {
    const job = queue.shift()!;
    try {
      if (job.type === 'read') {
        await AnalyticsModel.logRead(job.articleId, job.readerId);
      } else {
        await AnalyticsModel.aggregateDailyViews(job.date);
      }
    } catch (error) {
      console.error('Analytics queue job failed:', error);
    }
  }
  workerRunning = false;
};

const triggerWorker = () => {
  setImmediate(() => {
    runQueue().catch((error) => {
      console.error('Analytics queue worker failed:', error);
    });
  });
};

export const enqueueReadLog = (articleId: string, readerId: string | null) => {
  queue.push({ type: 'read', articleId, readerId });
  triggerWorker();
};

export const enqueueDailyAggregation = (date: Date) => {
  queue.push({ type: 'aggregate', date });
  triggerWorker();
};
