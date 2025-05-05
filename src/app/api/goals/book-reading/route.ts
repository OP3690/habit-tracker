import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import BookReadingGoal from '@/models/BookReadingGoal';
import Task from '@/models/Task';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

function getDatesBetween(start: string, end: string) {
  const dates = [];
  let current = new Date(start);
  const last = new Date(end);
  while (current <= last) {
    dates.push(new Date(current));
    current.setDate(current.getDate() + 1);
  }
  return dates;
}

// GET: Fetch all book reading goals
export async function GET() {
  await dbConnect();
  const goals = await BookReadingGoal.find({});
  return NextResponse.json(goals);
}

// POST: Create a new book reading goal
export async function POST(req: NextRequest) {
  try {
    await dbConnect();
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }
    const body = await req.json();
    const { bookTitle, author, startDate, endDate } = body;
    if (!bookTitle || !startDate || !endDate) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }
    const newGoal = await BookReadingGoal.create({
      bookTitle,
      ...(author ? { author } : {}),
      startDate,
      endDate,
    });
    // Only create daily tasks if the goal is not completed or discarded
    if (!['Completed', 'Done', 'Discarded'].includes(newGoal.status)) {
      // Automatically create daily tasks for each date in the range
      const todayStr = new Date().toISOString().slice(0, 10);
      const tomorrowStr = new Date(Date.now() + 24*60*60*1000).toISOString().slice(0, 10);
      const dates = getDatesBetween(startDate, endDate);
      for (const d of dates) {
        const dateStr = d.toISOString().slice(0, 10);
        let scheduledFor: 'today' | 'tomorrow' | null = null;
        if (dateStr === todayStr) scheduledFor = 'today';
        else if (dateStr === tomorrowStr) scheduledFor = 'tomorrow';
        else scheduledFor = null;
        if (scheduledFor) {
          await Task.create({
            userId: session.user.id,
            title: bookTitle,
            goalType: 'Book Reading',
            goalFlag: 'Book Reading - Goal',
            date: dateStr,
            status: 'not-started',
            category: 'learning',
            priority: 'high',
            scheduledFor,
            goalId: newGoal._id,
          });
        }
      }
    }
    return NextResponse.json(newGoal, { status: 201 });
  } catch (error) {
    console.error('Failed to add goal:', error);
    return NextResponse.json({ error: error instanceof Error ? error.message : String(error) }, { status: 500 });
  }
} 