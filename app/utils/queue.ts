import Bull from 'bull';
import { processCSVJob } from './process-csv-job'; // You will create this function next

// Configure your Redis connection details
const redisConfig = {
  host: process.env.REDIS_HOST || 'localhost',
  port: process.env.REDIS_PORT ? parseInt(process.env.REDIS_PORT) : 6379,
  password: process.env.REDIS_PASSWORD || undefined,
  tls: {
    rejectUnauthorized: false, // This is often necessary for Heroku Redis connections
  },
};

// Create a new Bull queue for CSV processing
export const csvQueue = new Bull('csv-processing', { redis: redisConfig });

// Process jobs in concurrency, adjust '5' to your needs
csvQueue.process(5, async (job) => {
  return processCSVJob(job);
});