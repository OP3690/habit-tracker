"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var uuid_1 = require("uuid");
var TravelProgressSchema = new mongoose_1.Schema({
    date: { type: String, required: true }, // ISO date string
    completed: { type: Boolean, required: true },
    notes: { type: String, default: '' },
}, { _id: false });
var TravelGoalSchema = new mongoose_1.Schema({
    goalId: { type: String, default: uuid_1.v4, unique: true },
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
exports.default = mongoose_1.models.TravelGoal || (0, mongoose_1.model)('TravelGoal', TravelGoalSchema);
