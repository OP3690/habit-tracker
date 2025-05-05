import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import WeightGoal from '@/models/WeightGoal';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/habit_tracker';

async function dbConnect() {
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(MONGODB_URI);
  }
}

export async function GET(req: Request) {
  await dbConnect();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
  }
  try {
    const goal = await WeightGoal.findOne({ userId }).lean();
    if (!goal) {
      return NextResponse.json({ success: false, error: 'No goal found for user' }, { status: 404 });
    }
    return NextResponse.json({ success: true, goal });
  } catch (error) {
    const err = error as Error;
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
} 