(async () => {
  const path = require('path');
  require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
  const connectToDatabase = require('../src/lib/db').default;
  const Task = require('../src/models/Task').default;
  const BookReadingGoal = require('../src/models/BookReadingGoal').default;

  await connectToDatabase();

  const userId = '68144435f74e9d8077904b14';
  const today = new Date().toISOString().slice(0, 10);
  const endDate = today;

  // 1. Create a BookReadingGoal
  const goal = await BookReadingGoal.create({
    bookTitle: 'Test Book',
    startDate: today,
    endDate,
    progress: [],
    status: 'Active',
  });

  // 2. Create a linked Task for today
  const task = await Task.create({
    userId,
    title: 'Read Test Book',
    description: 'Read a test book',
    category: 'learning',
    priority: 'high',
    status: 'not-started',
    date: today,
    scheduledFor: 'today',
    goalId: goal._id,
    goalType: 'Book Reading',
    goalFlag: 'Book Reading - Goal',
  });

  const statuses = ['done', 'in-progress', 'not-started', 'not-required'];

  for (const status of statuses) {
    // Update the task status
    const updatedTask = await Task.findByIdAndUpdate(task._id, { status }, { new: true });
    // Fetch the updated goal
    const updatedGoal = await BookReadingGoal.findById(goal._id);
    console.log(`\nAfter marking task as '${status}':`);
    console.log('Goal status:', updatedGoal.status);
    console.log('Goal progress:', updatedGoal.progress);
  }

  // Cleanup
  await Task.deleteOne({ _id: task._id });
  await BookReadingGoal.deleteOne({ _id: goal._id });
  process.exit(0);
})(); 