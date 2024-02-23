import type { ActionFunction } from "@remix-run/node";
import { redirect } from "@remix-run/node";
import db from "../db.server";

export const action: ActionFunction = async ({ request }) => {
  // New logic to enforce status rules for repeated IDs
  // Find IDs with at least one 'active' status
  const recordsWithActiveStatus = await db.statusData.findMany({
    where: {
      status: 'Active',
    },
    select: {
      id: true, // Select only the ID
    },
  });

  console.log(recordsWithActiveStatus)

  // Extract unique IDs
  const uniqueActiveIds = Array.from(new Set(recordsWithActiveStatus.map(record => record.id)));

  // Update all entries for these IDs to 'active' status, if not already
  const update = await db.statusData.updateMany({
    where: {
      id: {
        in: uniqueActiveIds,
      },
      status: {
        not: 'Active',
      },
    },
    data: {
      status: 'Active',
    },
  });

  console.log(update)

  return update;
};
