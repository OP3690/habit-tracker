import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BookReadingGoal from '@/models/BookReadingGoal';

// POST: Add or update a daily progress entry for a book reading goal
export async function POST(req: NextRequest, context: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();
  const { date, read, notes } = body;
  if (!date || typeof read !== 'boolean') {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const goal = await BookReadingGoal.findById(context.params.id);
  if (!goal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  // Check if progress for this date exists
  const idx = goal.progress.findIndex((p: any) => p.date === date);
  if (idx >= 0) {
    // Update existing
    goal.progress[idx].read = read;
    goal.progress[idx].notes = notes || '';
  } else {
    // Add new
    goal.progress.push({ date, read, notes: notes || '' });
  }
  await goal.save();
  return NextResponse.json(goal);
} 