import Bull from 'bull';
import { processCSVJob } from './process-csv-job'; // You will create this function next

// Create a new Bull queue for CSV processing using a Redis URL
export const csvQueue = new Bull('csv-processing', {
    redis: process.env.REDIS_URL,
  });

// Process jobs in concurrency, adjust '5' to your needs
csvQueue.process(5, async (job) => {
  return processCSVJob(job);
});