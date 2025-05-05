"use strict";
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
Object.defineProperty(exports, "__esModule", { value: true });
exports.sendWelcomeEmail = sendWelcomeEmail;
var resend_1 = require("resend");
var nodemailer_1 = require("nodemailer");
var resendApiKey = process.env.RESEND_API_KEY;
var smtpHost = process.env.EMAIL_SERVER_HOST || 'smtp.gmail.com';
var smtpPort = parseInt(process.env.EMAIL_SERVER_PORT || '587', 10);
var smtpUser = process.env.EMAIL_SERVER_USER;
var smtpPass = process.env.EMAIL_SERVER_PASSWORD;
var emailFrom = process.env.EMAIL_FROM || 'noreply@habitflow.com';
// Initialize email clients
var smtpTransport = nodemailer_1.default.createTransport({
    host: smtpHost,
    port: smtpPort,
    secure: smtpPort === 465,
    auth: {
        user: smtpUser,
        pass: smtpPass,
    },
});
var resend = resendApiKey ? new resend_1.Resend(resendApiKey) : null;
var getWelcomeEmailTemplate = function (name) { return "\n<!DOCTYPE html>\n<html>\n<head>\n  <meta charset=\"utf-8\">\n  <meta name=\"viewport\" content=\"width=device-width, initial-scale=1.0\">\n  <title>Welcome to HabitFlow</title>\n  <style>\n    body {\n      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;\n      line-height: 1.6;\n      color: #333;\n      margin: 0;\n      padding: 0;\n    }\n    .container {\n      max-width: 600px;\n      margin: 0 auto;\n      padding: 20px;\n    }\n    .header {\n      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);\n      color: white;\n      text-align: center;\n      padding: 40px 20px;\n      border-radius: 10px 10px 0 0;\n    }\n    .content {\n      background: white;\n      padding: 30px;\n      border-radius: 0 0 10px 10px;\n      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);\n    }\n    .button {\n      display: inline-block;\n      background: linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%);\n      color: white;\n      text-decoration: none;\n      padding: 12px 24px;\n      border-radius: 6px;\n      margin: 20px 0;\n      font-weight: 600;\n    }\n    .quote {\n      font-style: italic;\n      color: #666;\n      border-left: 4px solid #8b5cf6;\n      padding-left: 20px;\n      margin: 20px 0;\n    }\n    .footer {\n      text-align: center;\n      color: #666;\n      font-size: 14px;\n      margin-top: 30px;\n    }\n  </style>\n</head>\n<body>\n  <div class=\"container\">\n    <div class=\"header\">\n      <h1>Welcome to HabitFlow!</h1>\n    </div>\n    <div class=\"content\">\n      <h2>Hi ".concat(name, ",</h2>\n      <p>Welcome to HabitFlow! We're thrilled to have you join our community of motivated individuals committed to building better habits and achieving their goals.</p>\n      \n      <div class=\"quote\">\n        \"Success is not final, failure is not fatal: it is the courage to continue that counts.\" - Winston Churchill\n      </div>\n      \n      <p>Here's what you can do with HabitFlow:</p>\n      <ul>\n        <li>Track your daily habits and build streaks</li>\n        <li>Set and monitor your personal goals</li>\n        <li>Journal your thoughts and gratitude</li>\n        <li>Analyze your progress with beautiful charts</li>\n      </ul>\n      \n      <p>Ready to start your journey?</p>\n      <a href=\"http://localhost:3003\" class=\"button\">Get Started Now</a>\n      \n      <p>Need help getting started? Here are some quick tips:</p>\n      <ul>\n        <li>Start small - choose 1-2 habits to focus on</li>\n        <li>Set realistic goals</li>\n        <li>Track your progress daily</li>\n        <li>Celebrate small wins</li>\n      </ul>\n      \n      <div class=\"footer\">\n        <p>If you have any questions, just reply to this email - we're always happy to help.</p>\n        <p>Best regards,<br>The HabitFlow Team</p>\n      </div>\n    </div>\n  </div>\n</body>\n</html>\n"); };
function sendWelcomeEmail(email, name) {
    return __awaiter(this, void 0, void 0, function () {
        var subject, html, error_1;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0:
                    subject = '🎉 Welcome to HabitFlow - Start Your Journey!';
                    html = getWelcomeEmailTemplate(name);
                    _a.label = 1;
                case 1:
                    _a.trys.push([1, 6, , 7]);
                    if (!(smtpUser && smtpPass)) return [3 /*break*/, 3];
                    return [4 /*yield*/, smtpTransport.sendMail({
                            from: emailFrom,
                            to: email,
                            subject: subject,
                            html: html,
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 3:
                    if (!resend) return [3 /*break*/, 5];
                    return [4 /*yield*/, resend.emails.send({
                            from: emailFrom,
                            to: email,
                            subject: subject,
                            html: html,
                        })];
                case 4:
                    _a.sent();
                    return [2 /*return*/, { success: true }];
                case 5: throw new Error('No email service configured');
                case 6:
                    error_1 = _a.sent();
                    console.error('Failed to send welcome email:', error_1);
                    return [2 /*return*/, {
                            success: false,
                            error: error_1 instanceof Error ? error_1.message : 'Unknown error'
                        }];
                case 7: return [2 /*return*/];
            }
        });
    });
}
