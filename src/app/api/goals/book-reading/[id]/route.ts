import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BookReadingGoal from '@/models/BookReadingGoal';

// PATCH: Update a book reading goal (edit fields or mark as complete)
export async function PATCH(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const body = await req.json();
  const { bookTitle, startDate, endDate, status } = body;
  const update: any = {};
  if (bookTitle !== undefined) update.bookTitle = bookTitle;
  if (startDate !== undefined) update.startDate = startDate;
  if (endDate !== undefined) update.endDate = endDate;
  if (status !== undefined) update.status = status;
  const updatedGoal = await BookReadingGoal.findByIdAndUpdate(params.id, update, { new: true });
  if (!updatedGoal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  if (status && ['Completed', 'Done', 'Discarded'].includes(status)) {
    const todayStr = new Date().toISOString().slice(0, 10);
    // Delete future tasks
    await import('@/models/Task').then(async ({ default: Task }) => {
      await Task.deleteMany({
        // goalId: params.id, // Not needed, use _id
        date: { $gte: todayStr }
      });
    });
    // Update progress array for today
    let found = false;
    for (const entry of updatedGoal.progress) {
      if (entry.date === todayStr) {
        entry.read = true;
        found = true;
      }
    }
    if (!found) {
      updatedGoal.progress.push({ date: todayStr, read: true, notes: '' });
    }
    // Calculate percent complete
    const totalDays = (new Date(updatedGoal.endDate).getTime() - new Date(updatedGoal.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
    const completed = (updatedGoal.progress || []).filter((p: any) => p.read).length;
    const percent = completed / totalDays;
    if (percent >= 0.8 && todayStr >= updatedGoal.endDate) {
      updatedGoal.status = 'Completed';
    } else if (todayStr >= updatedGoal.endDate && percent < 0.8) {
      updatedGoal.status = 'Not Done';
    }
    await updatedGoal.save();
  }
  return NextResponse.json(updatedGoal);
}

// DELETE: Remove a book reading goal
export async function DELETE(req: NextRequest, { params }: { params: { id: string } }) {
  await dbConnect();
  const deleted = await BookReadingGoal.findByIdAndDelete(params.id);
  if (!deleted) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  return NextResponse.json({ success: true });
} 