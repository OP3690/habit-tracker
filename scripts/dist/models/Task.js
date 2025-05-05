"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g = Object.create((typeof Iterator === "function" ? Iterator : Object).prototype);
    return g.next = verb(0), g["throw"] = verb(1), g["return"] = verb(2), typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (g && (g = 0, op[0] && (_ = 0)), _) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = __importStar(require("mongoose"));
var BookReadingGoal_1 = __importDefault(require("./BookReadingGoal"));
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
// Post-update hook to update BookReadingGoal status and progress
// Only for Book Reading goals
taskSchema.post('findOneAndUpdate', function (doc) {
    return __awaiter(this, void 0, void 0, function () {
        var Task, tasks, allDone, allNotRequired, anyInProgress, newStatus, progress;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    if (!doc)
                        return [2 /*return*/];
                    if (!doc.goalId || doc.goalType !== 'Book Reading')
                        return [2 /*return*/];
                    Task = mongoose_1.default.model('Task');
                    return [4 /*yield*/, Task.find({ goalId: doc.goalId, goalType: 'Book Reading' })];
                case 1:
                    tasks = _a.sent();
                    if (!tasks.length)
                        return [2 /*return*/];
                    allDone = tasks.every(function (t) { return t.status === 'done'; });
                    allNotRequired = tasks.every(function (t) { return t.status === 'not-required'; });
                    anyInProgress = tasks.some(function (t) { return t.status === 'in-progress'; });
                    newStatus = 'Active';
                    if (allDone)
                        newStatus = 'Completed';
                    else if (allNotRequired)
                        newStatus = 'Not Required';
                    else if (anyInProgress)
                        newStatus = 'Active';
                    progress = tasks.map(function (t) { return ({ date: t.date, read: t.status === 'done', notes: '' }); });
                    // @ts-ignore
                    return [4 /*yield*/, BookReadingGoal_1.default.findByIdAndUpdate(doc.goalId, { status: newStatus, progress: progress }, { new: true })];
                case 2:
                    // @ts-ignore
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    });
});
// Ensure model is not redefined and force reload to avoid old enum issues
if (mongoose_1.default.models.Task) {
    delete mongoose_1.default.models.Task;
}
var Task = mongoose_1.default.model('Task', taskSchema);
exports.default = Task;
