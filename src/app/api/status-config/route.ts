import { NextRequest, NextResponse } from 'next/server';
import dbConnect from '../../../lib/db';
import StatusConfig from '../../../models/StatusConfig';

const DEMO_USER_ID = '68144435f74e9d8077904b14';

export async function GET(req: NextRequest) {
  await dbConnect();
  let config = await StatusConfig.findOne({ userId: DEMO_USER_ID });
  if (!config) {
    config = await StatusConfig.create({ userId: DEMO_USER_ID, statuses: [] });
  }
  return NextResponse.json(config);
}

export async function PUT(req: NextRequest) {
  await dbConnect();
  const body = await req.json();
  const { statuses } = body;
  let config = await StatusConfig.findOneAndUpdate(
    { userId: DEMO_USER_ID },
    { statuses },
    { new: true, upsert: true }
  );
  return NextResponse.json(config);
} 