const mongoose = require('mongoose');

const uri = process.env.MONGODB_URI || 'mongodb+srv://global5665:test123@cluster0.wigbba7.mongodb.net/Habit_tracker_new?retryWrites=true&w=majority&appName=Cluster0';

async function dropIndex() {
  try {
    await mongoose.connect(uri);
    await mongoose.connection.db.collection('bookreadinggoals').dropIndex('goalId_1');
    console.log('Dropped index goalId_1 from bookreadinggoals collection.');
  } catch (err) {
    console.error('Error dropping index:', err.message);
  } finally {
    await mongoose.disconnect();
  }
}

dropIndex(); 