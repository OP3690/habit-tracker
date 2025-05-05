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
var _this = this;
(function () { return __awaiter(_this, void 0, void 0, function () {
    var path, connectToDatabase, Task, BookReadingGoal, userId, today, endDate, goal, task, statuses, _i, statuses_1, status_1, updatedTask, updatedGoal;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                path = require('path');
                require('dotenv').config({ path: path.resolve(__dirname, '../.env.local') });
                connectToDatabase = require('../src/lib/db').default;
                Task = require('../src/models/Task').default;
                BookReadingGoal = require('../src/models/BookReadingGoal').default;
                return [4 /*yield*/, connectToDatabase()];
            case 1:
                _a.sent();
                userId = '68144435f74e9d8077904b14';
                today = new Date().toISOString().slice(0, 10);
                endDate = today;
                return [4 /*yield*/, BookReadingGoal.create({
                        bookTitle: 'Test Book',
                        startDate: today,
                        endDate: endDate,
                        progress: [],
                        status: 'Active',
                    })];
            case 2:
                goal = _a.sent();
                return [4 /*yield*/, Task.create({
                        userId: userId,
                        title: 'Read Test Book',
                        description: 'Read a test book',
                        category: 'learning',
                        priority: 'high',
                        status: 'not-started',
                        date: today,
                        scheduledFor: 'today',
                        goalId: goal._id,
                        goalType: 'Book Reading',
                        goalFlag: 'Book Reading - Goal',
                    })];
            case 3:
                task = _a.sent();
                statuses = ['done', 'in-progress', 'not-started', 'not-required'];
                _i = 0, statuses_1 = statuses;
                _a.label = 4;
            case 4:
                if (!(_i < statuses_1.length)) return [3 /*break*/, 8];
                status_1 = statuses_1[_i];
                return [4 /*yield*/, Task.findByIdAndUpdate(task._id, { status: status_1 }, { new: true })];
            case 5:
                updatedTask = _a.sent();
                return [4 /*yield*/, BookReadingGoal.findById(goal._id)];
            case 6:
                updatedGoal = _a.sent();
                console.log("\nAfter marking task as '".concat(status_1, "':"));
                console.log('Goal status:', updatedGoal.status);
                console.log('Goal progress:', updatedGoal.progress);
                _a.label = 7;
            case 7:
                _i++;
                return [3 /*break*/, 4];
            case 8: 
            // Cleanup
            return [4 /*yield*/, Task.deleteOne({ _id: task._id })];
            case 9:
                // Cleanup
                _a.sent();
                return [4 /*yield*/, BookReadingGoal.deleteOne({ _id: goal._id })];
            case 10:
                _a.sent();
                process.exit(0);
                return [2 /*return*/];
        }
    });
}); })();
