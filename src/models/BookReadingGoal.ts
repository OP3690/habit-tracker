import mongoose, { Schema, models, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const ProgressSchema = new Schema({
  date: { type: String, required: true }, // ISO date string
  read: { type: Boolean, required: true },
  notes: { type: String, default: '' },
}, { _id: false });

const BookReadingGoalSchema = new Schema({
  type: { type: String, default: 'BookReading' },
  bookTitle: { type: String, required: true },
  startDate: { type: String, required: true }, // ISO date string
  endDate: { type: String, required: true }, // ISO date string
  progress: { type: [ProgressSchema], default: [] },
  status: { type: String, enum: ['Active', 'Completed', 'Not Required', 'Planned', 'Discarded'], default: 'Active' },
  taskId: { type: String },
});

export default models.BookReadingGoal || model('BookReadingGoal', BookReadingGoalSchema); 