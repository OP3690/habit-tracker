import mongoose, { Schema, models, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ExerciseProgressSchema = new Schema({
  date: { type: String, required: true }, // ISO date string
  completed: { type: Boolean, required: true },
  notes: { type: String, default: '' },
}, { _id: false });

const ExerciseGoalSchema = new Schema({
  goalId: { type: String, default: uuidv4, unique: true },
  type: { type: String, default: 'Exercise' },
  exerciseName: { type: String, required: true },
  frequency: { type: String, default: 'daily' },
  measurementType: { type: String, enum: ['repsets', 'minutes', 'seconds'], required: true },
  rep: { type: Number },
  set: { type: Number },
  minutes: { type: Number },
  seconds: { type: Number },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  progress: { type: [ExerciseProgressSchema], default: [] },
  status: { type: String, enum: ['Active', 'Completed', 'Not Done'], default: 'Active' },
  taskId: { type: String },
});

export default models.ExerciseGoal || model('ExerciseGoal', ExerciseGoalSchema); 