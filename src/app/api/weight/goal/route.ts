import { NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import WeightGoal from '@/models/WeightGoal';

export async function GET(req: Request) {
  await connectToDatabase();
  const { searchParams } = new URL(req.url);
  const userId = searchParams.get('userId');
  if (!userId) {
    return NextResponse.json({ success: false, error: 'Missing userId' }, { status: 400 });
  }
  try {
    const goals = await WeightGoal.find({ userId }).sort({ targetDate: -1 });
    return NextResponse.json({ success: true, goals });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
}

export async function POST(req: Request) {
  await connectToDatabase();
  const body = await req.json();
  try {
    const goal = await WeightGoal.create(body);
    return NextResponse.json({ success: true, goal });
  } catch (error) {
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 });
  }
} 