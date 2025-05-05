import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BookGoal from '@/models/BookReadingGoal';
import ExerciseGoal from '@/models/ExerciseGoal';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session || !session.user || !session.user.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const userId = session.user.id;
  const today = new Date().toISOString().slice(0, 10);

  // Book Reading Goals
  const bookGoals = await BookGoal.find({ userId, status: 'Active', startDate: { $lte: today }, endDate: { $gte: today } });
  for (const goal of bookGoals) {
    const existing = await Task.findOne({ userId, goalId: goal._id, goalFlag: 'Book Reading', date: today });
    if (!existing) {
      await Task.create({
        userId,
        title: goal.bookTitle,
        goalId: goal._id,
        goalFlag: 'Book Reading',
        status: 'not-started',
        date: today,
        scheduledFor: 'today',
        category: 'learning',
        priority: 'medium',
      });
    }
  }

  // Exercise Goals
  const exerciseGoals = await ExerciseGoal.find({ userId, status: 'Active', startDate: { $lte: today }, endDate: { $gte: today } });
  for (const goal of exerciseGoals) {
    const existing = await Task.findOne({ userId, goalId: goal._id, goalFlag: 'Exercise', date: today });
    if (!existing) {
      let desc = '';
      if (goal.measurementType === 'repsets') desc = `${goal.rep || '-'} reps × ${goal.set || '-'} sets`;
      if (goal.measurementType === 'minutes') desc = `${goal.minutes || '-'} min`;
      if (goal.measurementType === 'seconds') desc = `${goal.seconds || '-'} sec`;
      await Task.create({
        userId,
        title: goal.exerciseName,
        description: desc,
        goalId: goal._id,
        goalFlag: 'Exercise',
        status: 'not-started',
        date: today,
        scheduledFor: 'today',
        category: 'health',
        priority: 'medium',
      });
    }
  }

  return NextResponse.json({ success: true });
} 