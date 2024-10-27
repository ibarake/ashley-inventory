import Bull from 'bull';
import { processCSVJob } from './process-csv-job'; // You will create this function next

// Configure your Redis connection details
const redisConfig = {
  username: "default",
  host: "redis-16660.c13.us-east-1-3.ec2.redns.redis-cloud.com",
  port: 16660,
  password: "xrmPXn88K0VgdJV4MFeuBundtQAjjFLy",
};

// Create a new Bull queue for CSV processing
export const csvQueue = new Bull('csv-processing', { redis: redisConfig });
csvQueue.on('error', (error) => {
  console.log("ERROR",error);
})

// Process jobs in concurrency, adjust '5' to your needs
csvQueue.process(5, async (job) => {
  console.log("a ver")
  return processCSVJob(job);
});