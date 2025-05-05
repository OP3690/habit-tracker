import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExerciseGoal from '@/models/ExerciseGoal';

export async function POST(req: NextRequest, context: any) {
  await dbConnect();
  const { id } = context.params;
  const { date, completed } = await req.json();

  if (!date) {
    return NextResponse.json({ error: 'Date is required' }, { status: 400 });
  }

  // Add or update the progress entry for the given date
  const goal = await ExerciseGoal.findById(id);
  if (!goal) {
    return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  }

  let updated = false;
  if (!goal.progress) goal.progress = [];
  const entry = goal.progress.find((p: any) => p.date === date);
  if (entry) {
    entry.completed = completed;
    updated = true;
  } else {
    goal.progress.push({ date, completed });
    updated = true;
  }
  if (updated) await goal.save();

  return NextResponse.json({ success: true, progress: goal.progress });
} 