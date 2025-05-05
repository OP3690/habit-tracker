import { NextResponse } from 'next/server';
import mongoose from 'mongoose';
import dbConnect from '@/lib/db';

export async function GET() {
  try {
    console.log('Testing MongoDB connection...');
    await dbConnect();
    
    // Get list of collections
    const collections = await mongoose.connection.db.listCollections().toArray();
    console.log('Available collections:', collections.map(c => c.name));
    
    // Get database name
    const dbName = mongoose.connection.db.databaseName;
    console.log('Connected to database:', dbName);
    
    // Get connection status
    const readyState = mongoose.connection.readyState;
    const states = ['disconnected', 'connected', 'connecting', 'disconnecting'];
    console.log('Connection status:', states[readyState]);

    return NextResponse.json({
      status: 'success',
      message: 'MongoDB connection test successful',
      database: dbName,
      collections: collections.map(c => c.name),
      connectionState: states[readyState]
    });
  } catch (error: any) {
    console.error('MongoDB test error:', {
      name: error.name,
      message: error.message,
      stack: error.stack
    });
    
    return NextResponse.json({
      status: 'error',
      error: error.message
    }, { status: 500 });
  }
} 