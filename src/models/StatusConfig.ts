import mongoose, { Schema, models, model } from 'mongoose';

const StatusSchema = new Schema({
  status: { type: String, required: true },
  icon: { type: String, required: true },
  allPages: { type: Boolean, default: true },
  todo: { type: Boolean, default: true },
  goals: { type: Boolean, default: true },
  habit: { type: Boolean, default: true },
  enabled: { type: Boolean, default: true },
  isCustom: { type: Boolean, default: false },
});

const StatusConfigSchema = new Schema({
  userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  statuses: [StatusSchema],
});

export default models.StatusConfig || model('StatusConfig', StatusConfigSchema); 