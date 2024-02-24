import Bull from 'bull';
import { processCSVJob } from './process-csv-job'; // You will create this function next

// Use the Heroku Redis URL from your environment variables
const redisUrl = process.env.REDIS_URL; // Make sure this is set in your environment

const connectionOptions = {
  redis: {
    url: redisUrl,
    tls: {
      rejectUnauthorized: false, // This is often necessary for Heroku Redis connections
    },
  },
};

// Create a new Bull queue for CSV processing with the connection options
export const csvQueue = new Bull('csv-processing', connectionOptions);

// Process jobs in concurrency, adjust '5' to your needs
csvQueue.process(5, async (job) => {
    console.log('Processing CSV job:', job.id);
  return processCSVJob(job);
});