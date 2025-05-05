"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var StatusSchema = new mongoose_1.Schema({
    status: { type: String, required: true },
    icon: { type: String, required: true },
    allPages: { type: Boolean, default: true },
    todo: { type: Boolean, default: true },
    goals: { type: Boolean, default: true },
    habit: { type: Boolean, default: true },
    enabled: { type: Boolean, default: true },
    isCustom: { type: Boolean, default: false },
});
var StatusConfigSchema = new mongoose_1.Schema({
    userId: { type: mongoose_1.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
    statuses: [StatusSchema],
});
exports.default = mongoose_1.models.StatusConfig || (0, mongoose_1.model)('StatusConfig', StatusConfigSchema);
