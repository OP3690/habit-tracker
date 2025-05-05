import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WeightGoal from '@/models/WeightGoal';

export async function GET(req: Request, context: { params: Promise<{ goalId: string }> }) {
  await connectToDatabase();
  const { goalId } = await context.params;
  try {
    const goal = await WeightGoal.findById(goalId);
    if (!goal) {
      return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 });
    }
    // Return logs array from the goal document
    return NextResponse.json({ success: true, logs: goal.logs });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request, context: { params: Promise<{ goalId: string }> }) {
  await connectToDatabase();
  const { goalId } = await context.params;
  const body = await req.json();
  try {
    const goal = await WeightGoal.findById(goalId);
    if (!goal) {
      return NextResponse.json({ success: false, error: 'Goal not found' }, { status: 404 });
    }
    goal.logs.push(body);
    await goal.save();
    return NextResponse.json({ success: true, log: body });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 