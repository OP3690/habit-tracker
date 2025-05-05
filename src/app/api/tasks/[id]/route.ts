import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth';
import connectToDatabase from '@/lib/db';
import Task from '@/models/Task';
import BookReadingGoal from '@/models/BookReadingGoal';
import ExerciseGoal from '@/models/ExerciseGoal';

export async function PATCH(
  req: Request,
  context: any
) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json({ error: 'Unauthorized: No user session found.' }, { status: 401 });
    }

    const taskId = context.params.id;
    if (!taskId) {
      return NextResponse.json(
        { error: 'Task ID is required.' },
        { status: 400 }
      );
    }

    const body = await req.json();
    
    await connectToDatabase();

    // Get the current task
    const currentTask = await Task.findOne({ _id: taskId, userId: session.user.id });
    if (!currentTask) {
      return NextResponse.json(
        { error: 'Task not found for this user.' },
        { status: 404 }
      );
    }

    const updateData = {
      ...body,
      updatedAt: new Date(),
    };

    // Handle status changes
    if (body.status && currentTask.status !== body.status) {
      // If task is marked as in-progress
      if (body.status === 'in-progress') {
        // Create a copy for tomorrow if it doesn't exist
        const existingTomorrowTask = await Task.findOne({
          userId: session.user.id,
          title: currentTask.title,
          scheduledFor: 'tomorrow'
        });

        if (!existingTomorrowTask) {
          await Task.create({
            userId: session.user.id,
            title: currentTask.title,
            description: currentTask.description,
            category: currentTask.category,
            priority: currentTask.priority,
            status: 'not-started',
            date: new Date(new Date().setDate(new Date().getDate() + 1)).toISOString().split('T')[0],
            scheduledFor: 'tomorrow',
            isAutoCopied: true
          });
        }
      }
      
      // If task is marked as achieved or not-required
      if (['achieved', 'not-required'].includes(body.status)) {
        // Remove only the auto-copied version from tomorrow's tasks
        await Task.deleteMany({
          userId: session.user.id,
          title: currentTask.title,
          scheduledFor: 'tomorrow',
          isAutoCopied: true
        });
      }

      // Update pendingSince for not-started tasks
      if (body.status === 'not-started' && !currentTask.pendingSince) {
        updateData.pendingSince = new Date();
      } else if (body.status !== 'not-started') {
        updateData.pendingSince = null;
      }
    }

    // Update the current task without changing its scheduledFor value
    const task = await Task.findOneAndUpdate(
      { _id: taskId, userId: session.user.id },
      { 
        ...updateData,
        scheduledFor: currentTask.scheduledFor // Ensure scheduledFor remains unchanged
      },
      { new: true, runValidators: true }
    );

    if (!task) {
      return NextResponse.json(
        { error: 'Failed to update task' },
        { status: 500 }
      );
    }

    // If this is a goal-linked task, update goal status based on mapping
    if (task.goalId && task.goalType) {
      let GoalModel = null;
      if (task.goalType === 'Book Reading') GoalModel = BookReadingGoal;
      if (task.goalType === 'Exercise') GoalModel = ExerciseGoal;
      if (GoalModel) {
        const goal = await GoalModel.findById(task.goalId);
        if (goal) {
          // Map Today's Task status to Goal status
          let newGoalStatus = goal.status;
          if (body.status === 'done' || body.status === 'Done' || body.status === 'achieved') {
            // If before due date, set In Progress; if last date, set Completed
            const todayStr = new Date().toISOString().slice(0, 10);
            if (todayStr < goal.endDate) {
              newGoalStatus = 'Active'; // In Progress
            } else {
              newGoalStatus = 'Completed';
            }
            // Mark progress for this date
            const dateStr = task.date;
            let found = false;
            for (const entry of goal.progress) {
              if (entry.date === dateStr) {
                entry.completed = true;
                found = true;
              }
            }
            if (!found) {
              goal.progress.push({ date: dateStr, completed: true, notes: '' });
            }
          } else if (body.status === 'in-progress') {
            newGoalStatus = 'Active';
          } else if (body.status === 'not-started') {
            newGoalStatus = 'Planned'; // No Progress
          } else if (body.status === 'not-required') {
            newGoalStatus = 'Discarded';
          }
          goal.status = newGoalStatus;
          await goal.save();
        }
      }
    }

    // Return only the updated task object for frontend compatibility
    return NextResponse.json(task);
  } catch (error) {
    console.error('Error updating task:', error);
    
    // Handle validation errors
    if (error instanceof Error && 'name' in error && error.name === 'ValidationError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.message },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { error: error instanceof Error ? error.message : 'Failed to update task (unknown error)' },
      { status: 500 }
    );
  }
} 