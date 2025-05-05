import { startCronJobs } from '@/lib/cron';

// Only start cron jobs in production to avoid multiple instances in development
if (process.env.NODE_ENV === 'production') {
  startCronJobs();
}

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs'; 