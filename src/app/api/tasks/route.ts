import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Task from '@/models/Task';

// GET /api/tasks - Get all tasks for the current user
export async function GET(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await connectToDatabase();

    // Get today's date in YYYY-MM-DD format
    const today = new Date().toISOString().split('T')[0];

    const tasks = await Task.find({
      userId: session.user.id,
    }).sort({ createdAt: -1 });

    return NextResponse.json(tasks);
  } catch (error) {
    console.error('Error fetching tasks:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

// POST /api/tasks - Create a new task
export async function POST(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    console.log('Session:', session); // Debug log

    if (!session?.user?.id) {
      console.log('No session or user ID found'); // Debug log
      return NextResponse.json({ error: 'Unauthorized - Please log in again' }, { status: 401 });
    }

    const body = await req.json();
    console.log('Request body:', body); // Debug log

    const { title, description, priority, category, scheduledFor } = body;

    // Validate required fields with detailed messages
    const validationErrors = [];
    if (!title) validationErrors.push('Title is required');
    if (!category) validationErrors.push('Category is required');
    if (!priority) validationErrors.push('Priority is required');
    if (!scheduledFor) validationErrors.push('scheduledFor is required');

    if (validationErrors.length > 0) {
      console.log('Validation errors:', validationErrors); // Debug log
      return NextResponse.json(
        { error: 'Validation failed', details: validationErrors },
        { status: 400 }
      );
    }

    await connectToDatabase();
    console.log('Database connected'); // Debug log

    // Normalize the data
    const normalizedCategory = category.toLowerCase();
    const normalizedPriority = priority.toLowerCase();
    const normalizedStatus = 'not-started';

    // Validate enum values
    const validCategories = ['work', 'personal', 'health', 'learning'];
    const validPriorities = ['low', 'medium', 'high'];
    const validScheduledFor = ['today', 'tomorrow'];

    if (!validCategories.includes(normalizedCategory)) {
      return NextResponse.json(
        { error: 'Invalid category', details: `Category must be one of: ${validCategories.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validPriorities.includes(normalizedPriority)) {
      return NextResponse.json(
        { error: 'Invalid priority', details: `Priority must be one of: ${validPriorities.join(', ')}` },
        { status: 400 }
      );
    }

    if (!validScheduledFor.includes(scheduledFor)) {
      return NextResponse.json(
        { error: 'Invalid scheduledFor', details: `scheduledFor must be one of: ${validScheduledFor.join(', ')}` },
        { status: 400 }
      );
    }

    // Prepare task data
    const taskData = {
      userId: session.user.id,
      title: title.trim(),
      description: description?.trim(),
      priority: normalizedPriority,
      category: normalizedCategory,
      status: normalizedStatus,
      scheduledFor,
      date: new Date().toISOString().split('T')[0],
    };
    console.log('Task data to be created:', taskData); // Debug log

    const task = await Task.create(taskData);
    console.log('Task created:', task); // Debug log

    return NextResponse.json(task, { status: 201 });
  } catch (error) {
    console.error('Detailed error:', {
      message: error instanceof Error ? error.message : 'Unknown error',
      name: error instanceof Error ? error.name : 'Unknown',
      stack: error instanceof Error ? error.stack : undefined,
    });
    
    // Check if it's a validation error from Mongoose
    if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }

    // Check if it's a MongoDB duplicate key error
    if (error instanceof Error && 'code' in error && (error as any).code === 11000) {
      return NextResponse.json(
        { error: 'Duplicate task', details: 'A similar task already exists' },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { 
        error: 'Failed to create task', 
        details: error instanceof Error ? error.message : 'Unknown error',
        type: error instanceof Error ? error.name : 'Unknown'
      },
      { status: 500 }
    );
  }
}

// PATCH /api/tasks/:id - Update a task
export async function PATCH(req: Request) {
  let body: any = undefined;
  let taskId: string | undefined = undefined;
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Extract taskId from the URL path instead of search params
    taskId = req.url.split('/tasks/')[1]?.split('?')[0];

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    body = await req.json();
    
    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    await connectToDatabase();

    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: session.user.id },
      updateData,
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    console.error('Request body:', body);
    console.error('Task ID:', taskId);
    // Handle validation errors
    if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message, stack: error.stack },
        { status: 400 }
      );
    }
    return NextResponse.json(
      { error: error instanceof Error ? error.message : JSON.stringify(error), stack: error instanceof Error ? error.stack : undefined },
      { status: 500 }
    );
  }
}

// DELETE /api/tasks/:id - Delete a task
export async function DELETE(req: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(req.url);
    const taskId = searchParams.get('id');

    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required' },
        { status: 400 }
      );
    }

    await connectToDatabase();

    const task = await Task.findOneAndDelete({
      _id: taskId,
      userId: session.user.id,
    });

    if (!task) {
      return NextResponse.json(
        { error: 'Task not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({ message: 'Task deleted successfully' });
  } catch (error) {
    console.error('Error deleting task:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
} 