import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import ExerciseGoal from '@/models/ExerciseGoal';
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

// GET: Fetch all exercise goals
export async function GET() {
  await dbConnect();
  const goals = await ExerciseGoal.find({});
  return NextResponse.json(goals);
}

// POST: Create a new exercise goal
export async function POST(req: NextRequest) {
  await dbConnect();
  const session = await getServerSession(authOptions);
  if (!session?.user?.id) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  const body = await req.json();
  const { exerciseName, frequency, measurementType, rep, set, minutes, seconds, startDate, endDate } = body;
  if (!exerciseName || !measurementType || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const newGoal = await ExerciseGoal.create({
    exerciseName,
    frequency,
    measurementType,
    rep,
    set,
    minutes,
    seconds,
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
          title: exerciseName,
          goalId: newGoal._id,
          goalType: 'Exercise',
          goalFlag: 'Exercise - Goal',
          date: dateStr,
          status: 'not-started',
          category: 'health',
          priority: 'high',
          scheduledFor,
        });
      }
    }
  }
  return NextResponse.json(newGoal, { status: 201 });
}

// PATCH: Update an exercise goal (edit fields or mark as complete)
export async function PATCH(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { id, exerciseName, frequency, measurementType, rep, set, minutes, seconds, startDate, endDate, status } = body;
  if (!id) return NextResponse.json({ error: 'Goal ID is required' }, { status: 400 });
  const update: any = {};
  if (exerciseName !== undefined) update.exerciseName = exerciseName;
  if (frequency !== undefined) update.frequency = frequency;
  if (measurementType !== undefined) update.measurementType = measurementType;
  if (rep !== undefined) update.rep = rep;
  if (set !== undefined) update.set = set;
  if (minutes !== undefined) update.minutes = minutes;
  if (seconds !== undefined) update.seconds = seconds;
  if (startDate !== undefined) update.startDate = startDate;
  if (endDate !== undefined) update.endDate = endDate;
  if (status !== undefined) update.status = status;
  const updatedGoal = await ExerciseGoal.findByIdAndUpdate(id, update, { new: true });
  if (!updatedGoal) return NextResponse.json({ error: 'Goal not found' }, { status: 404 });
  if (status && ['Completed', 'Done', 'Discarded'].includes(status)) {
    const todayStr = new Date().toISOString().slice(0, 10);
    await import('@/models/Task').then(async ({ default: Task }) => {
      await Task.deleteMany({
        goalId: id,
        date: { $gte: todayStr }
      });
    });
    // Update progress array for today
    let found = false;
    for (const entry of updatedGoal.progress) {
      if (entry.date === todayStr) {
        entry.completed = true;
        found = true;
      }
    }
    if (!found) {
      updatedGoal.progress.push({ date: todayStr, completed: true, notes: '' });
    }
    // Calculate percent complete
    const totalDays = (new Date(updatedGoal.endDate).getTime() - new Date(updatedGoal.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
    const completed = updatedGoal.progress.filter((p: any) => p.completed).length;
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