"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var mongoose_1 = require("mongoose");
var CountrySchema = new mongoose_1.Schema({
    name: { type: String, required: true },
    isoCode: { type: String, required: true },
    dialCode: { type: String, required: true },
    flagEmoji: { type: String },
    flagSvgUrl: { type: String }
});
exports.default = mongoose_1.models.Country || (0, mongoose_1.model)('Country', CountrySchema);
