"use client";

import { useEffect, useState } from "react";
import ExerciseGoal from '@/models/ExerciseGoal';
import TravelGoal from '@/models/TravelGoal';
import { format } from 'date-fns';

// Types
interface ProgressEntry {
  date: string;
  read: boolean;
  notes: string;
}
interface BookGoal {
  _id: string;
  bookTitle: string;
  startDate: string;
  endDate: string;
  progress: ProgressEntry[];
  status: "Active" | "Completed" | "Not Required" | "Planned" | "Discarded";
}

// Add Task type for Book Reading tasks
interface BookReadingTask {
  _id: string;
  title: string;
  status: string;
  date: string;
  updatedAt?: string;
  goalId?: string;
  goalFlag?: string;
}

// Add Task type for Exercise tasks
interface ExerciseTask {
  _id: string;
  title: string;
  status: string;
  date: string;
  updatedAt?: string;
  goalId?: string;
  goalFlag?: string;
}

const GOAL_TYPES = [
  { key: "all", label: "All Goals" },
  { key: "book", label: "Book Reading" },
  { key: "exercise", label: "Exercise" },
  { key: "travel", label: "Travel" },
];

const CATEGORY_OPTIONS = [
  { key: "book", label: "Book Reading" },
  { key: "exercise", label: "Exercise" },
  { key: "travel", label: "Travel" },
];

const EXERCISE_MEASUREMENTS = [
  { key: "repsets", label: "Reps/Sets" },
  { key: "minutes", label: "Minutes" },
  { key: "seconds", label: "Seconds" },
];

const EXERCISE_FREQUENCY = [
  { key: "daily", label: "Daily" },
  { key: "weekly", label: "Weekly" },
  { key: "custom", label: "Custom" },
];

export default function GoalsPage() {
  const [activeTab, setActiveTab] = useState("all");
  const [goals, setGoals] = useState<BookGoal[]>([]);
  const [exerciseGoals, setExerciseGoals] = useState<any[]>([]);
  const [travelGoals, setTravelGoals] = useState<any[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [goalCategory, setGoalCategory] = useState("book");
  const [exerciseMeasurement, setExerciseMeasurement] = useState("repsets");
  const [exerciseFrequency, setExerciseFrequency] = useState("daily");
  const [form, setForm] = useState({
    bookTitle: "",
    author: "",
    exerciseName: "",
    frequency: "daily",
    rep: "",
    set: "",
    minutes: "",
    seconds: "",
    destination: "",
    ticketBooked: "no",
    remarks: "",
    startDate: new Date().toISOString().slice(0, 10),
    endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [search, setSearch] = useState("");
  const [expand, setExpand] = useState({
    book: true,
    exercise: true,
    travel: true,
  });
  const [bookTasksToday, setBookTasksToday] = useState<BookReadingTask[]>([]);
  const [exerciseTasksToday, setExerciseTasksToday] = useState<ExerciseTask[]>([]);
  // Pagination state for each group
  const [bookPage, setBookPage] = useState(1);
  const [exercisePage, setExercisePage] = useState(1);
  const [travelPage, setTravelPage] = useState(1);
  const PAGE_SIZE = 10;

  // Fetch book reading, exercise, and travel goals, and today's Book Reading and Exercise tasks
  useEffect(() => {
    fetch("/api/goals/book-reading").then((res) => res.json()).then(setGoals);
    fetch("/api/goals/exercise").then((res) => res.json()).then(setExerciseGoals);
    fetch("/api/goals/travel").then((res) => res.json()).then(setTravelGoals);
    // Fetch today's Book Reading and Exercise tasks with credentials
    const today = new Date().toISOString().split('T')[0];
    fetch("/api/tasks", { credentials: "include" })
      .then(res => res.json())
      .then((tasks: (BookReadingTask|ExerciseTask)[]) => {
        setBookTasksToday(tasks.filter(t => t.goalFlag?.includes('Book Reading') && t.date === today));
        setExerciseTasksToday(tasks.filter(t => t.goalFlag?.includes('Exercise') && t.date === today));
      });
  }, []);

  const handleAddGoal = async (e: any) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    let url = "/api/goals/book-reading";
    let payload: any = {};
    if (goalCategory === "book") {
      url = "/api/goals/book-reading";
      payload = {
        bookTitle: form.bookTitle,
        author: form.author,
        startDate: form.startDate,
        endDate: form.endDate,
      };
    } else if (goalCategory === "exercise") {
      url = "/api/goals/exercise";
      payload = {
        exerciseName: form.exerciseName,
        frequency: form.frequency,
        measurementType: exerciseMeasurement,
        rep: form.rep ? Number(form.rep) : undefined,
        set: form.set ? Number(form.set) : undefined,
        minutes: form.minutes ? Number(form.minutes) : undefined,
        seconds: form.seconds ? Number(form.seconds) : undefined,
        startDate: form.startDate,
        endDate: form.endDate,
      };
    } else if (goalCategory === "travel") {
      url = "/api/goals/travel";
      payload = {
        destination: form.destination,
        startDate: form.startDate,
        endDate: form.endDate,
        ticketBooked: form.ticketBooked === "yes",
        remarks: form.remarks,
      };
    }
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });
    if (!res.ok) {
      setError("Failed to add goal");
      setLoading(false);
      return;
    }
    // Always re-fetch all goals after adding
    fetch("/api/goals/book-reading").then((res) => res.json()).then(setGoals);
    fetch("/api/goals/exercise").then((res) => res.json()).then(setExerciseGoals);
    fetch("/api/goals/travel").then((res) => res.json()).then(setTravelGoals);
    setShowForm(false);
    setForm({
      bookTitle: "",
      author: "",
      exerciseName: "",
      frequency: "daily",
      rep: "",
      set: "",
      minutes: "",
      seconds: "",
      destination: "",
      ticketBooked: "no",
      remarks: "",
      startDate: new Date().toISOString().slice(0, 10),
      endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().slice(0, 10),
    });
    setLoading(false);
  };

  // Status change handler
  const handleStatusChange = async (goal: any, status: string) => {
    let url = '';
    if (goal.bookTitle) {
      url = `/api/goals/book-reading/${goal._id}`;
    } else if (goal.exerciseName) {
      url = `/api/goals/exercise/${goal._id}`;
    } else if (goal.destination) {
      url = `/api/goals/travel/${goal._id}`;
    }
    const res = await fetch(url, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status }),
    });
    if (res.ok) {
      // Always re-fetch all goals after update to ensure state is correct
      if (goal.bookTitle) {
        const updatedGoals = await fetch("/api/goals/book-reading").then(res => res.json());
        setGoals(updatedGoals);
      } else if (goal.exerciseName) {
        const updatedGoals = await fetch("/api/goals/exercise").then(res => res.json());
        setExerciseGoals(updatedGoals);
      } else if (goal.destination) {
        const updatedGoals = await fetch("/api/goals/travel").then(res => res.json());
        setTravelGoals(updatedGoals);
      }
    }
  };

  // Filtered goals by search
  const filteredGoals = goals.filter(g =>
    g.bookTitle.toLowerCase().includes(search.toLowerCase())
  );

  // Status badge color
  const statusColor = (status: BookGoal["status"]) => {
    switch (status) {
      case "Completed": return "bg-green-100 text-green-800";
      case "Active": return "bg-yellow-100 text-yellow-800";
      case "Planned": return "bg-gray-100 text-gray-800";
      case "Not Required": return "bg-gray-100 text-gray-800";
      case "Discarded": return "bg-red-100 text-red-800";
      default: return "bg-gray-100 text-gray-800";
    }
  };

  // Progress bar color (distinct, not used elsewhere)
  const progressBarColor = "bg-indigo-500";

  // Dynamic greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  // Get current month range
  const now = new Date();
  const monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
  const monthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0);

  // Filter goals for current month
  const isInCurrentMonth = (goal: BookGoal) => {
    const start = new Date(goal.startDate);
    const end = new Date(goal.endDate);
    return (
      (start <= monthEnd && end >= monthStart)
    );
  };

  // Filtered by tab/category
  const categoryKey = activeTab === 'all' ? null : activeTab;
  const goalsInCategory = categoryKey ? goals.filter(g => categoryKey === 'book') : goals;
  // For now, only Book Reading is implemented, so filter for 'book' or all
  const goalsForCards = goals.filter(g => isInCurrentMonth(g) && (!categoryKey || categoryKey === 'book'));

  // Stats for cards
  const allGoals = [
    ...goals,
    ...exerciseGoals,
    ...travelGoals,
  ];
  const activeCount = allGoals.filter(g => g.status === 'Active').length;
  const completedCount = allGoals.filter(g => g.status === 'Completed').length;
  // Streak calculation (across all types, for now Book Reading and Exercise only)
  const streak = 5; // Replace with real streak logic if you track daily completions
  const streakMilestones = [21, 42, 90];

  // Sort helper for status order
  const statusOrder = (status: string) => {
    if (status === 'Active') return 0;
    if (status === 'Completed') return 1;
    if (status === 'Discarded') return 2;
    return 3;
  };

  // Exercise Table
  function ExerciseTable({ goals }: { goals: any[] }) {
    const sortedGoals = goals.slice().sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
    return (
      <table className="w-full border-separate border-spacing-y-1">
        <thead>
          <tr className="bg-blue-50 text-green-700 text-sm">
            <th className="px-3 py-2 font-semibold text-left">Exercise</th>
            <th className="px-3 py-2 font-semibold text-left">Frequency</th>
            <th className="px-3 py-2 font-semibold text-left">Measurement</th>
            <th className="px-3 py-2 font-semibold text-left">Start Date</th>
            <th className="px-3 py-2 font-semibold text-left">Due Date</th>
            <th className="px-3 py-2 font-semibold text-left">Progress</th>
            <th className="px-3 py-2 font-semibold text-left">Current Status</th>
            <th className="px-6 py-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedGoals.length === 0 && (
            <tr>
              <td colSpan={8} className="text-gray-400 text-center py-4">No exercise goals yet.</td>
            </tr>
          )}
          {sortedGoals.map((goal) => {
            let measure = '';
            if (goal.measurementType === 'repsets') measure = `${goal.rep || '-'} reps × ${goal.set || '-'} sets`;
            if (goal.measurementType === 'minutes') measure = `${goal.minutes || '-'} min`;
            if (goal.measurementType === 'seconds') measure = `${goal.seconds || '-'} sec`;
            // Progress bar logic
            const totalDays = (new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
            const completed = (goal.progress || []).filter((p: any) => p.completed).length;
            const percent = Math.round((completed / totalDays) * 100);
            const today = format(new Date(), 'yyyy-MM-dd');
            const alreadyMarkedToday = (goal.progress || []).some((p: any) => p.date === today && p.completed);
            // Cross-disabling logic: check if a related Exercise task for today is already marked as done
            const relatedTaskDoneToday = exerciseTasksToday.some(
              t => t.goalId === goal.goalId && ['achieved', 'done', 'completed'].includes((t.status || '').toLowerCase()) && t.updatedAt && t.updatedAt.split('T')[0] === today
            );
            const disableMarkAsDone = alreadyMarkedToday || relatedTaskDoneToday;
            const tooltipMsg = alreadyMarkedToday
              ? 'Already marked as done for today'
              : relatedTaskDoneToday
                ? 'Task already marked as done for today'
                : 'Mark today as done';
            return (
              <tr key={goal._id} className="bg-white border border-green-100 rounded-xl shadow-sm align-middle hover:bg-green-50 transition">
                <td className="px-3 py-2 font-medium text-green-900 text-sm max-w-[180px] truncate">{goal.exerciseName}</td>
                <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.frequency}</td>
                <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{measure}</td>
                <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.startDate}</td>
                <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.endDate}</td>
                <td className="px-3 py-2 text-sm">
                  <div className="flex items-center gap-2">
                    <div className="h-2 w-20 bg-green-100 rounded-full overflow-hidden">
                      <div className={`h-2 rounded-full bg-green-400`} style={{ width: `${percent}%` }}></div>
                    </div>
                    <span className="text-green-700 text-xs font-medium">{percent}%</span>
                  </div>
                </td>
                <td className="px-3 py-2 text-sm">
                  <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(goal.status)}`}>{goal.status}</span>
                </td>
                <td className="px-6 py-2 text-right text-sm">
                  <div className="flex justify-end gap-2">
                    {/* Mark as Done button (optional, if you want to add it) */}
                    <div className="relative group">
                      <button
                        className="p-2 rounded hover:bg-green-100 transition"
                        onClick={() => handleMarkExerciseDone(goal)}
                        disabled={disableMarkAsDone}
                      >
                        <span role="img" aria-label="Mark as Done">🏁</span>
                      </button>
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                        {tooltipMsg}
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-2 rounded hover:bg-green-100 transition" onClick={() => handleStatusChange(goal, 'Completed')}>
                        <span role="img" aria-label="Mark Complete">✅</span>
                      </button>
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                        Mark this goal as completed
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-2 rounded hover:bg-green-100 transition" onClick={() => handleStatusChange(goal, 'Planned')}>
                        <span role="img" aria-label="Plan">📝</span>
                      </button>
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                        Move this goal to planned
                      </div>
                    </div>
                    <div className="relative group">
                      <button className="p-2 rounded hover:bg-green-100 transition" onClick={() => handleStatusChange(goal, 'Discarded')}>
                        <span role="img" aria-label="Discard">🗑️</span>
                      </button>
                      <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                        Discard this goal
                      </div>
                    </div>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  }

  // Travel Table
  function TravelTable({ goals }: { goals: any[] }) {
    const sortedGoals = goals.slice().sort((a, b) => statusOrder(a.status) - statusOrder(b.status));
    return (
      <table className="w-full border-separate border-spacing-y-1">
        <thead>
          <tr className="bg-blue-50 text-green-700 text-sm">
            <th className="px-3 py-2 font-semibold text-left">Destination</th>
            <th className="px-3 py-2 font-semibold text-left">Start Date</th>
            <th className="px-3 py-2 font-semibold text-left">Due Date</th>
            <th className="px-3 py-2 font-semibold text-left">Ticket Booked?</th>
            <th className="px-3 py-2 font-semibold text-left">Remarks</th>
            <th className="px-3 py-2 font-semibold text-left">Current Status</th>
            <th className="px-6 py-2 font-semibold text-right">Actions</th>
          </tr>
        </thead>
        <tbody>
          {sortedGoals.length === 0 && (
            <tr>
              <td colSpan={7} className="text-gray-400 text-center py-4">No travel goals yet.</td>
            </tr>
          )}
          {sortedGoals.map((goal) => (
            <tr key={goal._id} className="bg-white border border-green-100 rounded-xl shadow-sm align-middle hover:bg-green-50 transition">
              <td className="px-3 py-2 font-medium text-green-900 text-sm max-w-[180px] truncate">{goal.destination}</td>
              <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.startDate}</td>
              <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.endDate}</td>
              <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.ticketBooked ? 'Yes' : 'No'}</td>
              <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.remarks}</td>
              <td className="px-3 py-2 text-sm">
                <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(goal.status)}`}>
                  {goal.status}
                </span>
              </td>
              <td className="px-6 py-2 text-right text-sm">
                <div className="flex justify-end gap-2">
                  <div className="relative group">
                    <button className="p-2 rounded hover:bg-green-100 transition">
                      <span role="img" aria-label="Completed">✅</span>
                    </button>
                    <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                      Mark as completed
                    </div>
                  </div>
                  <div className="relative group">
                    <button className="p-2 rounded hover:bg-green-100 transition">
                      <span role="img" aria-label="Reschedule">🔄</span>
                    </button>
                    <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                      Reschedule
                    </div>
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    );
  }

  // Add a handler to mark a book as read for today
  const handleMarkAsRead = async (goal: BookGoal) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const alreadyMarkedToday = (goal.progress || []).some(p => p.date === today && p.read);
    await fetch(`/api/goals/book-reading/${goal._id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, read: !alreadyMarkedToday }),
    });
    // Re-fetch all goals to update progress
    const updatedGoals = await fetch("/api/goals/book-reading").then(res => res.json());
    setGoals(updatedGoals);
  };

  // Add a handler to mark an exercise as done for today
  const handleMarkExerciseDone = async (goal: any) => {
    const today = format(new Date(), 'yyyy-MM-dd');
    const alreadyMarkedToday = (goal.progress || []).some((p: any) => p.date === today && p.completed);
    await fetch(`/api/goals/exercise/${goal._id}/progress`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ date: today, completed: !alreadyMarkedToday }),
    });
    // Re-fetch all goals to update progress
    const updatedGoals = await fetch("/api/goals/exercise").then(res => res.json());
    setExerciseGoals(updatedGoals);
  };

  // Book Reading pagination
  const pagedBookGoals = filteredGoals.slice((bookPage - 1) * PAGE_SIZE, bookPage * PAGE_SIZE);
  const totalBookPages = Math.ceil(filteredGoals.length / PAGE_SIZE);
  // Exercise pagination
  const pagedExerciseGoals = exerciseGoals.slice((exercisePage - 1) * PAGE_SIZE, exercisePage * PAGE_SIZE);
  const totalExercisePages = Math.ceil(exerciseGoals.length / PAGE_SIZE);
  // Travel pagination
  const pagedTravelGoals = travelGoals.slice((travelPage - 1) * PAGE_SIZE, travelPage * PAGE_SIZE);
  const totalTravelPages = Math.ceil(travelGoals.length / PAGE_SIZE);

  return (
    <div className="w-full max-w-5xl mx-auto min-h-screen px-4 py-6 flex flex-col gap-6 bg-white">
      {/* Header with dynamic greeting */}
      <div className="mb-2">
        <div className="text-2xl font-bold text-gray-900">{getGreeting()}, Om!</div>
        {/* Summary Cards */}
        <div className="flex flex-wrap gap-4 mt-4 mb-2">
          {/* Active Card */}
          <div className="flex-1 min-w-[120px] bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-4 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500 mb-1">Active</div>
            <div className="text-2xl font-bold text-blue-700">{activeCount}</div>
            <div className="text-xs text-gray-400 mt-1">This month</div>
          </div>
          {/* Completed Card */}
          <div className="flex-1 min-w-[120px] bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-4 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500 mb-1">Completed</div>
            <div className="text-2xl font-bold text-green-700">{completedCount}</div>
            <div className="text-xs text-gray-400 mt-1">This month</div>
          </div>
          {/* Streak Card */}
          <div className="flex-1 min-w-[120px] bg-white border border-gray-100 rounded-xl shadow-sm px-6 py-4 flex flex-col items-center justify-center">
            <div className="text-sm text-gray-500 mb-1">Streak</div>
            <div className="text-2xl font-bold text-yellow-700">{streak} Days</div>
            <div className="flex gap-1 mt-2">
              {streakMilestones.map(milestone => (
                <span key={milestone} className={`px-2 py-1 rounded-full text-xs font-semibold border ${streak >= milestone ? 'bg-yellow-200 text-yellow-800 border-yellow-400' : 'bg-gray-100 text-gray-400 border-gray-200'}`}>{milestone}d</span>
              ))}
            </div>
            <div className="text-xs text-gray-400 mt-1">Across all goals</div>
          </div>
        </div>
      </div>
      {/* Tabs */}
      <div className="flex gap-2 border-b border-gray-200 mb-2 items-center">
        {GOAL_TYPES.map((tab) => (
          <button
            key={tab.key}
            className={`px-4 py-2 text-base font-semibold border-b-2 transition-all ${activeTab === tab.key ? "border-indigo-500 text-indigo-700" : "border-transparent text-gray-500 hover:text-indigo-600"}`}
            onClick={() => setActiveTab(tab.key)}
          >
            {tab.label}
          </button>
        ))}
        <div className="flex-1"></div>
        <button
          className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-full font-bold text-base shadow ml-auto"
          onClick={() => setShowForm(true)}
        >
          + New Goal
        </button>
      </div>
      {/* Book Reading Group */}
      {(activeTab === "all" || activeTab === "book") && (
        <div className="w-full">
          <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-indigo-400 px-3 py-2 font-bold text-gray-900 text-lg mb-2 cursor-pointer select-none" onClick={() => setExpand(e => { const next = { ...e, book: !e.book }; if (!e.book) setBookPage(1); return next; })}>
            <span className="text-xl">📚</span> Book Reading
            <span className="ml-auto text-sm font-normal text-gray-500">{filteredGoals.length} goals</span>
            <span className="ml-2">{expand.book ? "▼" : "►"}</span>
          </div>
          {expand.book && (
            <div className="w-full">
              <table className="w-full border-separate border-spacing-y-1">
                <thead>
                  <tr className="bg-blue-50 text-green-700 text-sm">
                    <th className="px-3 py-2 font-semibold text-left">Book Title</th>
                    <th className="px-3 py-2 font-semibold text-left">Start Date</th>
                    <th className="px-3 py-2 font-semibold text-left">Due Date</th>
                    <th className="px-3 py-2 font-semibold text-left">Progress</th>
                    <th className="px-3 py-2 font-semibold text-left">Current Status</th>
                    <th className="px-6 py-2 font-semibold text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagedBookGoals.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-gray-400 text-center py-4">No book reading goals yet.</td>
                    </tr>
                  )}
                  {pagedBookGoals
                    .slice()
                    .sort((a, b) => statusOrder(a.status) - statusOrder(b.status))
                    .map((goal) => {
                      // Debug: Log bookTasksToday and goal._id
                      console.log('BookTasksToday:', bookTasksToday);
                      console.log('Current Goal ID:', goal._id);
                      const totalDays = (new Date(goal.endDate).getTime() - new Date(goal.startDate).getTime()) / (1000 * 60 * 60 * 24) + 1;
                      const completed = (goal.progress || []).filter((p) => p.read).length;
                      const percent = Math.round((completed / totalDays) * 100);
                      const today = format(new Date(), 'yyyy-MM-dd');
                      const alreadyMarkedToday = (goal.progress || []).some(p => p.date === today && p.read);
                      // Check for any completed status value
                      const relatedTaskDoneToday = bookTasksToday.some(
                        t => t.goalId === goal._id && ['achieved', 'done', 'completed'].includes((t.status || '').toLowerCase()) && t.updatedAt && t.updatedAt.split('T')[0] === today
                      );
                      const disableMarkAsRead = alreadyMarkedToday || relatedTaskDoneToday;
                      const tooltipMsg = alreadyMarkedToday
                        ? 'Already marked as read for today'
                        : relatedTaskDoneToday
                          ? 'Task already marked as done for today'
                          : 'Mark today as read';
                      return (
                        <tr key={goal._id} className="bg-white border border-green-100 rounded-xl shadow-sm align-middle hover:bg-green-50 transition">
                          <td className="px-3 py-2 font-medium text-green-900 text-sm max-w-[180px] truncate">{goal.bookTitle}</td>
                          <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.startDate}</td>
                          <td className="px-3 py-2 text-green-800 text-sm whitespace-nowrap">{goal.endDate}</td>
                          <td className="px-3 py-2 text-sm">
                            <div className="flex items-center gap-2">
                              <div className="h-2 w-20 bg-green-100 rounded-full overflow-hidden">
                                <div className={`h-2 rounded-full bg-green-400`} style={{ width: `${percent}%` }}></div>
                              </div>
                              <span className="text-green-700 text-xs font-medium">{percent}%</span>
                            </div>
                          </td>
                          <td className="px-3 py-2 text-sm">
                            <span className={`px-2 py-1 rounded text-xs font-semibold ${statusColor(goal.status)}`}>
                              {goal.status}
                            </span>
                          </td>
                          <td className="px-6 py-2 text-right text-sm">
                            <div className="flex justify-end gap-2">
                              {/* Mark as Read button */}
                              <div className="relative group">
                                <button
                                  className="p-2 rounded hover:bg-green-100 transition"
                                  onClick={() => handleMarkAsRead(goal)}
                                  disabled={disableMarkAsRead}
                                >
                                  <span role="img" aria-label="Mark as Read">📖</span>
                                </button>
                                <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                                  {tooltipMsg}
                                </div>
                              </div>
                              <div className="relative group">
                                <button className="p-2 rounded hover:bg-green-100 transition" onClick={() => handleStatusChange(goal, 'Completed')}>
                                  <span role="img" aria-label="Mark Complete">✅</span>
                                </button>
                                <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                                  Mark this goal as completed
                                </div>
                              </div>
                              <div className="relative group">
                                <button className="p-2 rounded hover:bg-green-100 transition" onClick={() => handleStatusChange(goal, 'Planned')}>
                                  <span role="img" aria-label="Plan">📝</span>
                                </button>
                                <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                                  Move this goal to planned
                                </div>
                              </div>
                              <div className="relative group">
                                <button className="p-2 rounded hover:bg-green-100 transition" onClick={() => handleStatusChange(goal, 'Discarded')}>
                                  <span role="img" aria-label="Discard">🗑️</span>
                                </button>
                                <div className="absolute right-1/2 translate-x-1/2 top-full mt-1 z-20 opacity-0 group-hover:opacity-100 pointer-events-none transition bg-green-700 text-white text-xs rounded px-2 py-1 shadow-lg whitespace-nowrap">
                                  Discard this goal
                                </div>
                              </div>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                </tbody>
              </table>
              {/* Pagination controls for Book Reading */}
              {totalBookPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-2">
                  <button onClick={() => setBookPage(p => Math.max(1, p - 1))} disabled={bookPage === 1} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Prev</button>
                  <span className="font-medium">Page {bookPage} of {totalBookPages}</span>
                  <button onClick={() => setBookPage(p => Math.min(totalBookPages, p + 1))} disabled={bookPage === totalBookPages} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Next</button>
                </div>
              )}
            </div>
          )}
        </div>
      )}
      {/* Exercise Group */}
      {(activeTab === "all" || activeTab === "exercise") && (
        <div className="w-full">
          <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-blue-400 px-3 py-2 font-bold text-gray-900 text-lg mb-2 cursor-pointer select-none" onClick={() => setExpand(e => { const next = { ...e, exercise: !e.exercise }; if (!e.exercise) setExercisePage(1); return next; })}>
            <span className="text-xl">🏋️</span> Exercise
            <span className="ml-auto text-sm font-normal text-gray-500">{exerciseGoals.length} goals</span>
            <span className="ml-2">{expand.exercise ? "▼" : "►"}</span>
          </div>
          {expand.exercise && (
            <>
              <ExerciseTable goals={pagedExerciseGoals} />
              {/* Pagination controls for Exercise */}
              {totalExercisePages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-2">
                  <button onClick={() => setExercisePage(p => Math.max(1, p - 1))} disabled={exercisePage === 1} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Prev</button>
                  <span className="font-medium">Page {exercisePage} of {totalExercisePages}</span>
                  <button onClick={() => setExercisePage(p => Math.min(totalExercisePages, p + 1))} disabled={exercisePage === totalExercisePages} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {/* Travel Group */}
      {(activeTab === "all" || activeTab === "travel") && (
        <div className="w-full">
          <div className="flex items-center gap-2 bg-gray-50 border-l-4 border-pink-400 px-3 py-2 font-bold text-gray-900 text-lg mb-2 cursor-pointer select-none" onClick={() => setExpand(e => { const next = { ...e, travel: !e.travel }; if (!e.travel) setTravelPage(1); return next; })}>
            <span className="text-xl">✈️</span> Travel
            <span className="ml-auto text-sm font-normal text-gray-500">{travelGoals.length} goals</span>
            <span className="ml-2">{expand.travel ? "▼" : "►"}</span>
          </div>
          {expand.travel && (
            <>
              <TravelTable goals={pagedTravelGoals} />
              {/* Pagination controls for Travel */}
              {totalTravelPages > 1 && (
                <div className="flex justify-center items-center gap-2 mt-2">
                  <button onClick={() => setTravelPage(p => Math.max(1, p - 1))} disabled={travelPage === 1} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Prev</button>
                  <span className="font-medium">Page {travelPage} of {totalTravelPages}</span>
                  <button onClick={() => setTravelPage(p => Math.min(totalTravelPages, p + 1))} disabled={travelPage === totalTravelPages} className="px-3 py-1 rounded bg-gray-100 hover:bg-gray-200 disabled:opacity-50">Next</button>
                </div>
              )}
            </>
          )}
        </div>
      )}
      {/* Add Goal Modal */}
      {showForm && (
        <div className="fixed inset-0 z-30 flex items-center justify-center bg-black/20">
          <form onSubmit={handleAddGoal} className="bg-white rounded-2xl shadow-2xl p-6 border border-indigo-200 flex flex-col gap-4 w-full max-w-md mx-auto min-w-[320px]">
            <div className="font-bold text-indigo-700 mb-1 text-center text-lg">Add Goal</div>
            {/* Category Selector */}
            <div className="flex justify-center gap-2 mb-2">
              {CATEGORY_OPTIONS.map(opt => (
                <button
                  type="button"
                  key={opt.key}
                  className={`px-4 py-2 rounded-full font-semibold border transition text-sm ${goalCategory === opt.key ? 'bg-indigo-600 text-white border-indigo-600' : 'bg-gray-100 text-gray-700 border-gray-200 hover:bg-indigo-50'}`}
                  onClick={() => { setGoalCategory(opt.key); setExerciseMeasurement('repsets'); setExerciseFrequency('daily'); }}
                >
                  {opt.label}
                </button>
              ))}
            </div>
            {/* Dynamic Fields */}
            {goalCategory === 'book' && (
              <>
                <label className="block text-sm font-medium">Book Name</label>
                <input type="text" className="border rounded px-3 py-2 text-base" required value={form.bookTitle} onChange={e => setForm(f => ({ ...f, bookTitle: e.target.value }))} />
                <label className="block text-sm font-medium">Author</label>
                <input type="text" className="border rounded px-3 py-2 text-base" required value={form.author} onChange={e => setForm(f => ({ ...f, author: e.target.value }))} />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-medium">Start Date</label>
                    <input type="date" className="border rounded px-3 py-2 w-full text-base" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-medium">End Date</label>
                    <input type="date" className="border rounded px-3 py-2 w-full text-base" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
              </>
            )}
            {goalCategory === 'exercise' && (
              <>
                <label className="block text-sm font-medium">Exercise Name</label>
                <input type="text" className="border rounded px-3 py-2 text-base" required value={form.exerciseName} onChange={e => setForm(f => ({ ...f, exerciseName: e.target.value }))} />
                <label className="block text-sm font-medium">Frequency</label>
                <select className="border rounded px-3 py-2 text-base" value={exerciseFrequency} onChange={e => { setExerciseFrequency(e.target.value); setForm(f => ({ ...f, frequency: e.target.value })); }}>
                  {EXERCISE_FREQUENCY.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                </select>
                <label className="block text-sm font-medium">Measurement Type</label>
                <select className="border rounded px-3 py-2 text-base" value={exerciseMeasurement} onChange={e => setExerciseMeasurement(e.target.value)}>
                  {EXERCISE_MEASUREMENTS.map(opt => <option key={opt.key} value={opt.key}>{opt.label}</option>)}
                </select>
                {exerciseMeasurement === 'repsets' && (
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <label className="block text-xs mb-1 font-medium">Rep</label>
                      <input type="number" min="1" className="border rounded px-3 py-2 w-full text-base" value={form.rep} onChange={e => setForm(f => ({ ...f, rep: e.target.value }))} />
                    </div>
                    <div className="flex-1">
                      <label className="block text-xs mb-1 font-medium">Set</label>
                      <input type="number" min="1" className="border rounded px-3 py-2 w-full text-base" value={form.set} onChange={e => setForm(f => ({ ...f, set: e.target.value }))} />
                    </div>
                  </div>
                )}
                {exerciseMeasurement === 'minutes' && (
                  <div>
                    <label className="block text-xs mb-1 font-medium">Minutes</label>
                    <input type="number" min="1" className="border rounded px-3 py-2 w-full text-base" value={form.minutes} onChange={e => setForm(f => ({ ...f, minutes: e.target.value }))} />
                  </div>
                )}
                {exerciseMeasurement === 'seconds' && (
                  <div>
                    <label className="block text-xs mb-1 font-medium">Seconds</label>
                    <input type="number" min="1" className="border rounded px-3 py-2 w-full text-base" value={form.seconds} onChange={e => setForm(f => ({ ...f, seconds: e.target.value }))} />
                  </div>
                )}
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-medium">Start Date</label>
                    <input type="date" className="border rounded px-3 py-2 w-full text-base" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-medium">End Date</label>
                    <input type="date" className="border rounded px-3 py-2 w-full text-base" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
              </>
            )}
            {goalCategory === 'travel' && (
              <>
                <label className="block text-sm font-medium">Destination</label>
                <input type="text" className="border rounded px-3 py-2 text-base" required value={form.destination} onChange={e => setForm(f => ({ ...f, destination: e.target.value }))} />
                <div className="flex gap-3">
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-medium">Start Date</label>
                    <input type="date" className="border rounded px-3 py-2 w-full text-base" required value={form.startDate} onChange={e => setForm(f => ({ ...f, startDate: e.target.value }))} />
                  </div>
                  <div className="flex-1">
                    <label className="block text-xs mb-1 font-medium">End Date</label>
                    <input type="date" className="border rounded px-3 py-2 w-full text-base" required value={form.endDate} onChange={e => setForm(f => ({ ...f, endDate: e.target.value }))} />
                  </div>
                </div>
                <label className="block text-sm font-medium">Ticket Booked?</label>
                <select className="border rounded px-3 py-2 text-base" value={form.ticketBooked} onChange={e => setForm(f => ({ ...f, ticketBooked: e.target.value }))}>
                  <option value="no">No</option>
                  <option value="yes">Yes</option>
                </select>
                <label className="block text-sm font-medium">Remarks</label>
                <input type="text" className="border rounded px-3 py-2 text-base" value={form.remarks} onChange={e => setForm(f => ({ ...f, remarks: e.target.value }))} />
              </>
            )}
            <div className="flex gap-2 mt-2">
              <button
                type="submit"
                className="flex-1 bg-indigo-600 text-white px-2 py-2 rounded-full hover:bg-indigo-700 font-bold text-base shadow"
                disabled={loading}
              >
                {loading ? "Adding..." : "Add Goal"}
              </button>
              <button
                type="button"
                className="flex-1 bg-gray-200 text-gray-700 px-2 py-2 rounded-full font-bold text-base shadow hover:bg-gray-300"
                onClick={() => setShowForm(false)}
              >
                Cancel
              </button>
            </div>
            {error && <div className="text-red-600 font-medium mt-1 text-base">{error}</div>}
          </form>
        </div>
      )}
    </div>
  );
} 