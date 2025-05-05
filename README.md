# To-Do List Dashboard

A comprehensive task management and habit tracking application built with Next.js, TypeScript, and MongoDB.

## Features

- **Task Management**: Create, update, and delete tasks with priorities and categories
- **Goal Setting**: Set and track personal and professional goals
- **Habit Tracking**: Monitor daily habits and build consistency
- **Daily Journal & Gratitude**: Record daily reflections and gratitude entries
- **Analytics**: Visualize progress and patterns in task completion and habit formation
- **User Authentication**: Secure user accounts and data isolation

## Tech Stack

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS
- **Backend**: Next.js API Routes
- **Database**: MongoDB with Mongoose
- **Authentication**: NextAuth.js
- **Scheduling**: Node-cron for task rollover
- **UI Components**: Heroicons, Framer Motion

## Getting Started

1. Clone the repository
2. Install dependencies:
   ```bash
   npm install
   ```
3. Set up environment variables:
   Create a `.env.local` file with:
   ```
   MONGODB_URI=your_mongodb_connection_string
   NEXTAUTH_SECRET=your_nextauth_secret
   NEXTAUTH_URL=http://localhost:3000
   ```
4. Run the development server:
   ```bash
   npm run dev
   ```
5. Open [http://localhost:3000](http://localhost:3000) in your browser

## Project Structure

```
src/
├── app/
│   ├── api/         # API routes
│   ├── dashboard/   # Dashboard pages
│   └── auth/        # Authentication pages
├── components/      # Reusable components
├── lib/            # Utility functions
├── models/         # MongoDB models
└── types/          # TypeScript types
```

## Features in Detail

### Task Management
- Priority levels (Low, Medium, High)
- Categories for organization
- Due dates and times
- Status tracking
- Automatic task rollover at midnight

### Goal Setting
- Long-term and short-term goals
- Progress tracking
- Goal categories
- Milestone setting

### Habit Tracking
- Daily habit checklist
- Streak counting
- Habit categories
- Progress visualization

### Analytics
- Task completion rates
- Habit formation progress
- Goal achievement metrics
- Time management insights

## Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a Pull Request

## License

This project is licensed under the MIT License - see the LICENSE file for details.
