"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var taskSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
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
// Ensure model is not redefined and force reload to avoid old enum issues
if (mongoose_1.default.models.Task) {
    delete mongoose_1.default.models.Task;
}
var Task = mongoose_1.default.model('Task', taskSchema);
exports.default = Task;
