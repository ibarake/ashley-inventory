import db from '../db.server';
import { Job } from 'bull';
import { parseCSVFromFileStatus } from './parse-csv-status';
import { parseCSVFromFile } from './parse-csv';

export async function processCSVJob(job: Job<any>) {
  const { filepath, parse } = job.data;
  
  console.log('Processing CSV file:', filepath);

  try {
    // Assuming parseCSVFromFileStatus is an async function
    if (parse === 'status') {
      await parseCSVFromFileStatus(filepath);
    }
    if (parse === 'inv') {
      await parseCSVFromFile(filepath);
    }
    return { success: true, filepath };
  } catch (error) {
    console.error('Failed to process CSV file:', error);
    throw error;
  }
}
