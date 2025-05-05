const path = require('path');
const dotenv = require('dotenv');
dotenv.config({ path: path.resolve(__dirname, '../.env') });
console.log('ENV:', process.env);
// import 'dotenv/config';
const dbConnect = require('../src/lib/db').default;
const StatusConfig = require('../src/models/StatusConfig').default;
const mongoose = require('mongoose');

const DEMO_USER_ID = '68144435f74e9d8077904b14';

const STATUS_CONFIG = [
  { status: 'Done', icon: 'CheckCircleIcon', allPages: true, todo: true, goals: true, habit: true, enabled: true, isCustom: false },
  { status: 'In Progress', icon: 'ArrowPathIcon', allPages: true, todo: true, goals: true, habit: true, enabled: true, isCustom: false },
  { status: 'Not Started', icon: 'ClockIcon', allPages: true, todo: true, goals: true, habit: true, enabled: true, isCustom: false },
  { status: 'Not Required', icon: 'XCircleIcon', allPages: true, todo: true, goals: true, habit: true, enabled: true, isCustom: false },
  // The rest are disabled
  { status: 'On Hold', icon: 'PauseCircleIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
  { status: 'Blocked', icon: 'ExclamationCircleIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
  { status: 'To Do', icon: 'EyeIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
  { status: 'Review', icon: 'EyeSlashIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
  { status: 'Canceled', icon: 'DocumentCheckIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
  { status: 'Deferred', icon: 'DocumentTextIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
  { status: 'In Review', icon: 'DocumentMagnifyingGlassIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
  { status: 'Pending', icon: 'ArrowTrendingUpIcon', allPages: false, todo: false, goals: false, habit: false, enabled: false, isCustom: false },
];

async function main() {
  console.log('MONGODB_URI:', process.env.MONGODB_URI);
  await dbConnect();
  await StatusConfig.findOneAndUpdate(
    { userId: DEMO_USER_ID },
    { statuses: STATUS_CONFIG },
    { upsert: true, new: true }
  );
  console.log('Status config preconfigured for user', DEMO_USER_ID);
  await mongoose.disconnect();
}

main(); 