import path from 'path';
import dotenv from 'dotenv';
dotenv.config({ path: path.resolve(__dirname, '../.env.local') });
console.log('MONGODB_URI:', process.env.MONGODB_URI); 