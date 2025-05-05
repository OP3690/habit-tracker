"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var WeightLogSchema = new mongoose_1.Schema({
    date: { type: String, required: true },
    weight: { type: Number, required: true },
});
var WeightGoalSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, index: true },
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
if (mongoose_1.default.models.WeightGoal) {
    delete mongoose_1.default.models.WeightGoal;
}
var WeightGoal = mongoose_1.default.model('WeightGoal', WeightGoalSchema);
exports.default = WeightGoal;
