// scripts/add-overdue-task.ts
import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
console.log('MONGODB_URI:', process.env.MONGODB_URI);

(async () => {
  // Dynamically import after dotenv loads
  const connectToDatabase = (await import('../src/lib/db')).default;
  const Task = (await import('../src/models/Task')).default;

  await connectToDatabase();

  // Insert a test overdue task
  const task = await Task.create({
    userId: '68144435f74e9d8077904b14',
    title: 'Overdue Test',
    description: 'This is an overdue test task',
    category: 'work',
    priority: 'medium',
    status: 'not-started',
    date: '2023-01-01',
    scheduledFor: 'today',
  });

  console.log('Inserted overdue test task:', task);
  process.exit(0);
})(); 