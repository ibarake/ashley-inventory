import db from '../db.server';
import { Job } from 'bull';

export async function processCSVJob(job: Job<any>) {
  const { filepath, callbackfnc } = job.data;
  
  console.log('Processing CSV file:', filepath);

  try {
    // Assuming parseCSVFromFileStatus is an async function
    const data: any = await callbackfnc(filepath);
    return { success: true, filepath };
  } catch (error) {
    console.error('Failed to process CSV file:', error);
    throw error;
  }
}
