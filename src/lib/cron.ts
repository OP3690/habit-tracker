import { CronJob } from 'cron';
import connectToDatabase from './db';
import Task from '@/models/Task';

// Function to handle tasks that were not completed today
async function rolloverTasks() {
  try {
    await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Find all tasks scheduled for today that are in progress or not started
    const tasksToRollover = await Task.find({
      scheduledFor: 'today',
      status: { $in: ['in-progress', 'not-started'] },
      date: { $lt: today }
    });

    // Mark these tasks as missed and move them to today
    for (const task of tasksToRollover) {
      await Task.findByIdAndUpdate(task._id, {
        status: 'missed',
        date: today
      });
    }

    console.log(`Rolled over ${tasksToRollover.length} tasks`);
  } catch (error) {
    console.error('Error in rollover tasks cron:', error);
  }
}

// Function to move tomorrow's tasks to today
async function moveTomorrowTasksToToday() {
  try {
    await connectToDatabase();
    const today = new Date().toISOString().split('T')[0];

    // Update all tasks scheduled for tomorrow to be for today
    const result = await Task.updateMany(
      { scheduledFor: 'tomorrow' },
      { 
        $set: { 
          scheduledFor: 'today',
          date: today
        }
      }
    );

    console.log(`Moved ${result.modifiedCount} tasks from tomorrow to today`);
  } catch (error) {
    console.error('Error in moving tomorrow tasks cron:', error);
  }
}

// Create cron jobs
const rolloverCron = new CronJob('59 23 * * *', rolloverTasks); // Runs at 23:59 every day
const tomorrowTasksCron = new CronJob('1 0 * * *', moveTomorrowTasksToToday); // Runs at 00:01 every day

export function startCronJobs() {
  rolloverCron.start();
  tomorrowTasksCron.start();
  console.log('Task management cron jobs started');
} 