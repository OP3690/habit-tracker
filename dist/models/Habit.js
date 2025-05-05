"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var habitSchema = new mongoose_1.Schema({
    userId: {
        type: mongoose_1.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Habit title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    frequency: {
        type: {
            type: String,
            enum: ['daily', 'weekly', 'monthly'],
            required: [true, 'Frequency type is required'],
        },
        days: [{
                type: Number,
                min: 0,
                max: 6,
            }],
        dates: [{
                type: Number,
                min: 1,
                max: 31,
            }],
    },
    timeOfDay: {
        hour: {
            type: Number,
            min: 0,
            max: 23,
        },
        minute: {
            type: Number,
            min: 0,
            max: 59,
        },
    },
    startDate: {
        type: Date,
        required: true,
        default: Date.now,
    },
    endDate: {
        type: Date,
    },
    color: {
        type: String,
        default: '#4CAF50', // Default green color
    },
    icon: {
        type: String,
    },
    isArchived: {
        type: Boolean,
        default: false,
    },
    streak: {
        type: Number,
        default: 0,
    },
    longestStreak: {
        type: Number,
        default: 0,
    },
    completedDates: [{
            type: Date,
        }],
}, {
    timestamps: true, // Automatically add createdAt and updatedAt
});
// Index for faster queries
habitSchema.index({ userId: 1, isArchived: 1 });
habitSchema.index({ userId: 1, 'frequency.type': 1 });
// Method to check if habit is completed for a specific date
habitSchema.methods.isCompletedForDate = function (date) {
    return this.completedDates.some(function (completedDate) {
        return completedDate.toISOString().split('T')[0] === date.toISOString().split('T')[0];
    });
};
// Method to update streak when marking habit as complete
habitSchema.methods.updateStreak = function () {
    var today = new Date();
    var yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    var isCompletedToday = this.isCompletedForDate(today);
    var wasCompletedYesterday = this.isCompletedForDate(yesterday);
    if (isCompletedToday) {
        if (wasCompletedYesterday) {
            this.streak += 1;
        }
        else {
            this.streak = 1;
        }
        if (this.streak > this.longestStreak) {
            this.longestStreak = this.streak;
        }
    }
    else {
        this.streak = 0;
    }
};
var Habit = mongoose_1.default.models.Habit || mongoose_1.default.model('Habit', habitSchema);
exports.default = Habit;
