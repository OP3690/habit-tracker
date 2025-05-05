import mongoose, { Schema, Document, Types } from 'mongoose';

export interface IWeightLog {
  date: string; // YYYY-MM-DD
  weight: number;
}

export interface IWeightGoal extends Document {
  userId: Types.ObjectId;
  age: number;
  height: number;
  startWeight: number;
  targetWeight: number;
  targetDate: string;
  unit: 'kg' | 'lbs';
  isActive: boolean;
  startDate?: string;
  logs: IWeightLog[];
  status: string;
  createdAt: Date;
  updatedAt: Date;
}

const WeightLogSchema = new Schema<IWeightLog>({
  date: { type: String, required: true },
  weight: { type: Number, required: true },
});

const WeightGoalSchema = new Schema<IWeightGoal>({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
  age: { type: Number, required: true },
  height: { type: Number, required: true },
  startWeight: { type: Number, required: true },
  targetWeight: { type: Number, required: true },
  targetDate: { type: String, required: true },
  unit: { type: String, enum: ['kg', 'lbs'], default: 'kg' },
  isActive: { type: Boolean, default: true },
  startDate: { type: String },
  logs: [WeightLogSchema],
  status: { type: String, enum: ['ongoing', 'achieved', 'not_achieved', 'discarded'], default: 'ongoing' },
}, { timestamps: true });

if (mongoose.models.WeightGoal) {
  delete mongoose.models.WeightGoal;
}
const WeightGoal = mongoose.model<IWeightGoal>('WeightGoal', WeightGoalSchema);

export default WeightGoal; 