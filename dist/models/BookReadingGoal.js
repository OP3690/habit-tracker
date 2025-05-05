"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var uuid_1 = require("uuid");
var ProgressSchema = new mongoose_1.Schema({
    date: { type: String, required: true }, // ISO date string
    read: { type: Boolean, required: true },
    notes: { type: String, default: '' },
}, { _id: false });
var BookReadingGoalSchema = new mongoose_1.Schema({
    goalId: { type: String, default: uuid_1.v4, unique: true },
    type: { type: String, default: 'BookReading' },
    bookTitle: { type: String, required: true },
    startDate: { type: String, required: true }, // ISO date string
    endDate: { type: String, required: true }, // ISO date string
    progress: { type: [ProgressSchema], default: [] },
    status: { type: String, enum: ['Active', 'Completed'], default: 'Active' },
    taskId: { type: String },
});
exports.default = mongoose_1.models.BookReadingGoal || (0, mongoose_1.model)('BookReadingGoal', BookReadingGoalSchema);
