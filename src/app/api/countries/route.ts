import { NextResponse } from 'next/server';
import dbConnect from '@/lib/db';
import Country from '@/models/Country';

export async function GET() {
  await dbConnect();
  const countries = await Country.find({});
  return NextResponse.json(countries);
} 