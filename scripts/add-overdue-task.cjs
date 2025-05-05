const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
console.log('MONGODB_URI:', process.env.MONGODB_URI);

const connectToDatabase = require(path.join(__dirname, '../src/lib/db')).default;
const Task = require(path.join(__dirname, '../src/models/Task')).default;

(async () => {
  await connectToDatabase();

  // Insert a test overdue task
  const task = await Task.create({
    userId: 'test-overdue-user',
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