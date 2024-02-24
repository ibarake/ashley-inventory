import type { ActionFunction } from '@remix-run/node';
import { redirect, unstable_parseMultipartFormData } from '@remix-run/node';
import { csvQueue } from '~/utils/queue'; // Adjust the path as necessary
import { allowedMimeTypes, isUploadedFile, uploadHandler } from '~/utils/upload-handler';
import db from '../db.server';

export const action: ActionFunction = async ({ request }) => {
  console.log('Deleting all status data');
  // Consider moving or adjusting this operation based on your data retention policy
  await db.statusData.deleteMany({});

  const formData = await unstable_parseMultipartFormData(request, uploadHandler);
  const file = formData.get('upload-file');

  if (!isUploadedFile(file) || file.type !== allowedMimeTypes.csv) {
    throw new Error('CSV files only');
  }

  console.log('Enqueuing CSV data for background processing');
  console.log(csvQueue)
  csvQueue.add({ filepath: file.filepath });

  return redirect('/app/status-import');
};
