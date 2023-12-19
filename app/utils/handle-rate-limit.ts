const RATE_LIMIT_DELAY = 1100; // 2 seconds delay
const MAX_RETRIES = 10; // Maximum number of retries for a throttled request
const sleep = (ms: number | undefined) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export const handleRateLimit: any = async (
  fn: any,
  args: any,
  retries = MAX_RETRIES
) => {
  try {
    return await fn(...args);
  } catch (error) {
    if ((error as Error).message === "Throttled" && retries > 0) {
      await sleep(RATE_LIMIT_DELAY);
      return handleRateLimit(fn, args, retries - 1);
    } else {
      throw error;
    }
  }
};
