import mongoose, { Schema, models, model } from 'mongoose';
import { v4 as uuidv4 } from 'uuid';

const TravelProgressSchema = new Schema({
  date: { type: String, required: true }, // ISO date string
  completed: { type: Boolean, required: true },
  notes: { type: String, default: '' },
}, { _id: false });

const TravelGoalSchema = new Schema({
  goalId: { type: String, default: uuidv4, unique: true },
  type: { type: String, default: 'Travel' },
  destination: { type: String, required: true },
  startDate: { type: String, required: true },
  endDate: { type: String, required: true },
  ticketBooked: { type: Boolean, default: false },
  remarks: { type: String, default: '' },
  progress: { type: [TravelProgressSchema], default: [] },
  status: { type: String, enum: ['Yet to plan', 'Ticket Booked', 'Reschedule', 'Completed'], default: 'Yet to plan' },
  taskId: { type: String },
});

export default models.TravelGoal || model('TravelGoal', TravelGoalSchema); 