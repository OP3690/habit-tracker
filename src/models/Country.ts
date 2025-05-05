import mongoose, { Schema, models, model } from 'mongoose';

const CountrySchema = new Schema({
  name: { type: String, required: true },
  isoCode: { type: String, required: true },
  dialCode: { type: String, required: true },
  flagEmoji: { type: String },
  flagSvgUrl: { type: String }
});

export default models.Country || model('Country', CountrySchema); 