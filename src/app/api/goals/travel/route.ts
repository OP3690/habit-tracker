import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import TravelGoal from '@/models/TravelGoal';

// GET: Fetch all travel goals
export async function GET() {
  await dbConnect();
  const goals = await TravelGoal.find({});
  return NextResponse.json(goals);
}

// POST: Create a new travel goal
export async function POST(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { destination, startDate, endDate, ticketBooked, remarks } = body;
  if (!destination || !startDate || !endDate) {
    return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
  }
  const newGoal = await TravelGoal.create({
    destination,
    startDate,
    endDate,
    ticketBooked,
    remarks,
  });
  return NextResponse.json(newGoal, { status: 201 });
} 