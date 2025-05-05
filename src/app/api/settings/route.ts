import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import StatusConfig from '@/models/StatusConfig';

// For now, use a hardcoded userId for testing
const USER_ID = '68144435f74e9d8077904b14';

export async function GET(req: NextRequest) {
  await connectToDatabase();
  const user = await User.findById(USER_ID);
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  const statusConfig = await StatusConfig.findOne({ userId: USER_ID });
  return NextResponse.json({
    categories: user.categories,
    priorities: user.priorities,
    statusConfigs: statusConfig ? statusConfig.statuses : []
  });
}

export async function PUT(req: NextRequest) {
  await connectToDatabase();
  const { categories, priorities } = await req.json();
  const user = await User.findByIdAndUpdate(
    USER_ID,
    { categories, priorities },
    { new: true }
  );
  if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });
  return NextResponse.json({ categories: user.categories, priorities: user.priorities });
} 