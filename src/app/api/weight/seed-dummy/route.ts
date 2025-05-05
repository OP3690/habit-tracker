import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import WeightGoal from '@/models/WeightGoal';

// Connect to MongoDB (adjust path if you have a custom db connection helper)
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit_tracker';

async function dbConnect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function POST() {
  await dbConnect();
  const userId = '68144435f74e9d8077904b14';
  const goal = {
    userId,
    age: 33,
    height: 165,
    startWeight: 78,
    targetWeight: 65,
    targetDate: '2025-08-01',
    unit: 'kg',
    isActive: true,
    startDate: '2025-01-03',
    logs: [
      { date: '2025-01-03', weight: 82.0 },
      { date: '2025-01-04', weight: 81.8 },
      { date: '2025-01-05', weight: 81.9 },
      { date: '2025-01-06', weight: 81.7 },
      { date: '2025-01-07', weight: 81.5 },
      { date: '2025-01-08', weight: 81.6 },
      { date: '2025-01-09', weight: 81.4 },
      { date: '2025-01-10', weight: 81.2 },
      { date: '2025-01-11', weight: 81.3 },
      { date: '2025-01-12', weight: 81.1 },
      { date: '2025-01-13', weight: 81.0 },
      { date: '2025-01-15', weight: 80.8 },
      { date: '2025-01-16', weight: 80.7 },
      { date: '2025-01-17', weight: 80.5 },
      { date: '2025-01-18', weight: 80.6 },
      { date: '2025-01-19', weight: 80.4 },
      { date: '2025-01-20', weight: 80.3 },
      { date: '2025-01-21', weight: 80.2 },
      { date: '2025-01-22', weight: 80.0 },
      { date: '2025-01-23', weight: 80.1 },
      { date: '2025-01-24', weight: 79.9 },
      { date: '2025-01-26', weight: 79.7 },
      { date: '2025-01-27', weight: 79.6 },
      { date: '2025-01-28', weight: 79.5 },
      { date: '2025-01-29', weight: 79.4 },
      { date: '2025-01-30', weight: 79.3 },
      { date: '2025-01-31', weight: 79.2 },
      { date: '2025-02-01', weight: 79.0 },
      { date: '2025-02-02', weight: 79.1 },
      { date: '2025-02-03', weight: 78.9 },
      { date: '2025-02-04', weight: 78.8 },
      { date: '2025-02-05', weight: 78.7 },
      { date: '2025-02-07', weight: 78.6 },
      { date: '2025-02-08', weight: 78.5 },
      { date: '2025-02-09', weight: 78.4 },
      { date: '2025-02-10', weight: 78.3 },
      { date: '2025-02-11', weight: 78.2 },
      { date: '2025-02-12', weight: 78.1 },
      { date: '2025-02-13', weight: 78.0 },
      { date: '2025-02-14', weight: 77.9 },
      { date: '2025-02-15', weight: 77.8 },
      { date: '2025-02-16', weight: 77.7 },
      { date: '2025-02-18', weight: 77.6 },
      { date: '2025-02-19', weight: 77.5 },
      { date: '2025-02-20', weight: 77.4 },
      { date: '2025-02-21', weight: 77.3 },
      { date: '2025-02-22', weight: 77.2 },
      { date: '2025-02-23', weight: 77.1 },
      { date: '2025-02-24', weight: 77.0 },
      { date: '2025-02-25', weight: 76.9 },
      { date: '2025-02-26', weight: 76.8 },
      { date: '2025-02-27', weight: 76.7 },
      { date: '2025-03-01', weight: 76.6 },
      { date: '2025-03-02', weight: 76.5 },
      { date: '2025-03-03', weight: 76.4 },
      { date: '2025-03-04', weight: 76.3 },
      { date: '2025-03-05', weight: 76.2 },
      { date: '2025-03-06', weight: 76.1 },
      { date: '2025-03-07', weight: 76.0 },
      { date: '2025-03-08', weight: 75.9 },
      { date: '2025-03-09', weight: 75.8 },
      { date: '2025-03-10', weight: 75.7 },
      { date: '2025-03-12', weight: 75.6 },
      { date: '2025-03-13', weight: 75.5 },
      { date: '2025-03-14', weight: 75.4 },
      { date: '2025-03-15', weight: 75.3 },
      { date: '2025-03-16', weight: 75.2 },
      { date: '2025-03-17', weight: 75.1 },
      { date: '2025-03-18', weight: 75.0 },
      { date: '2025-03-19', weight: 74.9 },
      { date: '2025-03-20', weight: 74.8 },
      { date: '2025-03-21', weight: 74.7 },
      { date: '2025-03-23', weight: 74.6 },
      { date: '2025-03-24', weight: 74.5 },
      { date: '2025-03-25', weight: 74.4 },
      { date: '2025-03-26', weight: 74.3 },
      { date: '2025-03-27', weight: 74.2 },
      { date: '2025-03-28', weight: 74.1 },
      { date: '2025-03-29', weight: 74.0 },
      { date: '2025-03-30', weight: 73.9 },
      { date: '2025-03-31', weight: 73.8 },
      { date: '2025-04-01', weight: 73.7 },
      { date: '2025-04-03', weight: 73.6 },
      { date: '2025-04-04', weight: 73.5 },
      { date: '2025-04-05', weight: 73.4 },
      { date: '2025-04-06', weight: 73.3 },
      { date: '2025-04-07', weight: 73.2 },
      { date: '2025-04-08', weight: 73.1 },
      { date: '2025-04-09', weight: 73.0 },
      { date: '2025-04-10', weight: 72.9 },
      { date: '2025-04-11', weight: 72.8 },
      { date: '2025-04-12', weight: 72.7 },
      { date: '2025-04-14', weight: 72.6 },
      { date: '2025-04-15', weight: 72.5 },
      { date: '2025-04-16', weight: 72.4 },
      { date: '2025-04-17', weight: 72.3 },
      { date: '2025-04-18', weight: 72.2 },
      { date: '2025-04-19', weight: 72.1 },
      { date: '2025-04-20', weight: 72.0 },
      { date: '2025-04-21', weight: 71.9 },
      { date: '2025-04-22', weight: 71.8 },
      { date: '2025-04-24', weight: 71.7 },
      { date: '2025-04-25', weight: 71.6 },
      { date: '2025-04-26', weight: 71.5 },
      { date: '2025-04-27', weight: 71.4 },
      { date: '2025-04-28', weight: 71.3 },
      { date: '2025-04-29', weight: 71.2 },
      { date: '2025-04-30', weight: 71.1 },
      { date: '2025-05-01', weight: 71.0 },
      { date: '2025-05-02', weight: 78.0 },
      { date: '2025-05-03', weight: 76.0 },
    ],
  };

  try {
    // Remove any existing goal for this user (for idempotency)
    await WeightGoal.deleteMany({ userId });
    // Insert new goal
    await WeightGoal.create(goal);
    return NextResponse.json({ success: true });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message });
  }
} 