import { NextResponse } from 'next/server';
import bcrypt from 'bcryptjs';
import connectToDatabase from '@/lib/db';
import User from '@/models/User';
import { sendWelcomeEmail } from '@/lib/email';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';

export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization',
    },
  });
}

export async function POST(req: Request) {
  try {
    const { name, email, password, mobile, countryCode, countryIsoCode, countryName } = await req.json();

    if (!name || !email || !password || !mobile || !countryCode || !countryIsoCode || !countryName) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    // Check if user already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return NextResponse.json(
        { error: 'User already exists' },
        { status: 400 }
      );
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      mobile,
      countryCode,
      countryIsoCode,
      countryName,
    });

    // Send welcome email
    let emailError = null;
    try {
      await sendWelcomeEmail(email, name);
    } catch (error) {
      console.error('Error sending welcome email:', error);
      emailError = 'Failed to send welcome email';
    }

    // Create session for automatic login
    const session = await getServerSession(authOptions);
    
    return NextResponse.json(
      { 
        message: 'User created successfully',
        emailStatus: emailError ? 'Email failed' : 'Email sent',
        emailError,
        user: {
          id: user._id,
          name: user.name,
          email: user.email
        }
      },
      {
        status: 201,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, Authorization',
        },
      }
    );
  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 