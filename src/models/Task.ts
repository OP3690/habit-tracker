import mongoose, { Document, Schema } from 'mongoose';
import BookReadingGoal from './BookReadingGoal';
import ExerciseGoal from './ExerciseGoal';

export interface ITask extends Document {
  userId: mongoose.Types.ObjectId;
  title: string;
  description?: string;
  priority: string;
  category: string;
  status: string;
  date: string;
  scheduledFor: 'today' | 'tomorrow';
  pendingSince?: Date;
  isAutoCopied?: boolean;
  createdAt: Date;
  updatedAt: Date;
  goalId: string;
  goalType: string;
  goalFlag: string;
}

const taskSchema = new Schema<ITask>({
  userId: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  title: {
    type: String,
    required: [true, 'Task title is required'],
    maxlength: [100, 'Task title cannot be more than 100 characters'],
  },
  description: {
    type: String,
    maxlength: [500, 'Task description cannot be more than 500 characters'],
  },
  priority: {
    type: String,
    enum: {
      values: ['low', 'medium', 'high'],
      message: '{VALUE} is not a valid priority'
    },
    default: 'low',
  },
  category: {
    type: String,
    enum: {
      values: ['work', 'personal', 'health', 'learning'],
      message: '{VALUE} is not a valid category'
    },
    required: [true, 'Category is required'],
  },
  status: {
    type: String,
    default: 'not-started',
    index: true,
  },
  date: {
    type: String,
    required: [true, 'Date is required'],
    index: true,
  },
  scheduledFor: {
    type: String,
    enum: ['today', 'tomorrow'],
    required: true,
    default: 'today',
    index: true,
  },
  pendingSince: {
    type: Date,
    default: null,
  },
  isAutoCopied: {
    type: Boolean,
    default: false,
  },
  goalId: {
    type: String,
    default: null,
  },
  goalType: {
    type: String,
    enum: ['Book Reading', 'Exercise', null],
    default: null,
  },
  goalFlag: {
    type: String,
    enum: ['Book Reading - Goal', 'Exercise - Goal', null],
    default: null,
  },
}, {
  timestamps: true,
});

// Create compound index for efficient querying
taskSchema.index({ userId: 1, date: 1, status: 1, scheduledFor: 1 });

// Post-update hook to update BookReadingGoal status and progress
// Only for Book Reading goals
taskSchema.post('findOneAndUpdate', async function(doc) {
  if (!doc) return;
  if (!doc.goalId || doc.goalType !== 'Book Reading') return;
  const Task = mongoose.model('Task');
  const tasks = await Task.find({ goalId: doc.goalId, goalType: 'Book Reading' });
  if (!tasks.length) return;

  // Helper to check done status
  const isDoneStatus = (status: string) => ['done', 'achieved', 'completed'].includes((status || '').toLowerCase());

  // Determine new status
  const allDone = tasks.every(t => isDoneStatus(t.status));
  const allNotRequired = tasks.every(t => t.status === 'not-required');
  const anyInProgress = tasks.some(t => t.status === 'in-progress');

  let newStatus: string = 'Active';
  if (allDone) newStatus = 'Completed';
  else if (allNotRequired) newStatus = 'Not Required';
  else if (anyInProgress) newStatus = 'Active';

  // Update progress array (date, read)
  const progress = tasks.map(t => ({ date: t.date, read: isDoneStatus(t.status), notes: '' }));

  // @ts-ignore
  await BookReadingGoal.findByIdAndUpdate(
    doc.goalId,
    { status: newStatus, progress },
    { new: true }
  );
});

// Post-update hook to update ExerciseGoal status and progress
// Only for Exercise goals
taskSchema.post('findOneAndUpdate', async function(doc) {
  if (!doc) return;
  const Task = mongoose.model('Task');

  // Exercise logic
  if (doc.goalId && doc.goalType === 'Exercise') {
    const tasks = await Task.find({ goalId: doc.goalId, goalType: 'Exercise' });
    if (tasks.length) {
      const isDoneStatus = (status: string) => ['done', 'achieved', 'completed'].includes((status || '').toLowerCase());
      const allDone = tasks.every(t => isDoneStatus(t.status));
      const allNotDone = tasks.every(t => t.status === 'not-done');
      const anyInProgress = tasks.some(t => t.status === 'in-progress');
      let newStatus: string = 'Active';
      if (allDone) newStatus = 'Completed';
      else if (allNotDone) newStatus = 'Not Done';
      else if (anyInProgress) newStatus = 'Active';
      const progress = tasks.map(t => ({ date: t.date, completed: isDoneStatus(t.status), notes: '' }));
      // @ts-ignore
      await ExerciseGoal.findOneAndUpdate(
        { goalId: doc.goalId },
        { status: newStatus, progress },
        { new: true }
      );
    }
  }
});

// Ensure model is not redefined and force reload to avoid old enum issues
if (mongoose.models.Task) {
  delete mongoose.models.Task;
}
const Task = mongoose.model<ITask>('Task', taskSchema);

export default Task; 