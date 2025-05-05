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
    return NextResponse.json({ success: true, goal });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function PUT(req: Request, context: { params: Promise<{ goalId: string }> }) {
  await connectToDatabase();
  const { goalId } = await context.params;
  const body = await req.json();
  // If archiving, also set isActive: false
  let updateBody = { ...body };
  if (["achieved", "not_achieved", "discarded"].includes(body.status)) {
    updateBody.isActive = false;
  }
  try {
    const updated = await WeightGoal.findByIdAndUpdate(goalId, updateBody, { new: true });
    return NextResponse.json({ success: true, goal: updated });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function DELETE(req: Request, context: { params: Promise<{ goalId: string }> }) {
  await connectToDatabase();
  const { goalId } = await context.params;
  try {
    await WeightGoal.findByIdAndDelete(goalId);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 