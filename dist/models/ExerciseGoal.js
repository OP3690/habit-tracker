"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var uuid_1 = require("uuid");
var ExerciseProgressSchema = new mongoose_1.Schema({
    date: { type: String, required: true }, // ISO date string
    completed: { type: Boolean, required: true },
    notes: { type: String, default: '' },
}, { _id: false });
var ExerciseGoalSchema = new mongoose_1.Schema({
    goalId: { type: String, default: uuid_1.v4, unique: true },
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
exports.default = mongoose_1.models.ExerciseGoal || (0, mongoose_1.model)('ExerciseGoal', ExerciseGoalSchema);
