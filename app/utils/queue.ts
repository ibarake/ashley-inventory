import Bull from 'bull';
import { processCSVJob } from './process-csv-job'; // You will create this function next

// Configure your Redis connection details
const redisConfig = {
  host: '127.0.0.1',
  port: 6379,
  // if you use Redis with password
  // password: 'your-redis-password',
};

// Create a new Bull queue for CSV processing
export const csvQueue = new Bull('csv-processing', { redis: redisConfig });

// Process jobs in concurrency, adjust '5' to your needs
csvQueue.process(5, async (job) => {
  return processCSVJob(job);
});