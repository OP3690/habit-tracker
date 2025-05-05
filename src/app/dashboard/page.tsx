'use client';

import { useState, useEffect } from 'react';
import { PlusIcon, CalendarDaysIcon, ExclamationTriangleIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, MinusCircleIcon, ArrowDownTrayIcon } from '@heroicons/react/24/outline';
import AddTaskModal from '@/components/AddTaskModal';
import TaskStatusActions from '@/components/TaskStatusActions';
import {
  CheckCircleIcon,
  ClockIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CalendarIcon,
  FlagIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  PlayCircleIcon as PlayCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
} from '@heroicons/react/24/solid';
import { format } from 'date-fns';

interface Task {
  _id: string;
  title: string;
  description?: string;
  category: string;
  priority: string;
  status: string;
  date: string;
  scheduledFor: 'today' | 'tomorrow';
  pendingSince?: string;
  updatedAt?: string;
  goalFlag?: string;
  goalId?: string;
}

interface TasksTableProps {
  tasks: Task[];
  scheduledFor: 'today' | 'tomorrow';
  onAddTask: (scheduledFor: 'today' | 'tomorrow') => void;
}

type Priority = 'high' | 'medium' | 'low';
const priorityOrder: Record<Priority, number> = { high: 0, medium: 1, low: 2 };

const ICON_MAP = {
  CheckCircleIcon,
  ClockIcon,
  PlayCircleIcon,
  PauseCircleIcon,
  XCircleIcon,
  ExclamationCircleIcon,
  EyeIcon,
  EyeSlashIcon,
  DocumentCheckIcon,
  DocumentTextIcon,
  DocumentMagnifyingGlassIcon,
  ArrowPathIcon,
  ArrowTrendingUpIcon,
  ArrowTrendingDownIcon,
  ArrowUpCircleIcon,
  ArrowDownCircleIcon,
  StarIcon,
  FireIcon,
  BoltIcon,
  HeartIcon,
  GlobeAltIcon,
  UserGroupIcon,
  ChatBubbleLeftRightIcon,
  BellIcon,
  CalendarIcon,
  FlagIcon,
  BookmarkIcon,
  ShieldCheckIcon,
  WrenchScrewdriverIcon,
  LightBulbIcon,
  QuestionMarkCircleIcon
};

const statusMap = {
  'achieved': 'Done',
  'not-started': 'Not Started',
  // add other mappings if needed
};

export default function DashboardPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalScheduleFor, setModalScheduleFor] = useState<'today' | 'tomorrow'>('today');
  const [tasks, setTasks] = useState<Task[]>([]);
  const [statusConfigs, setStatusConfigs] = useState<any[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);

  useEffect(() => {
    fetchTasks();
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || []);
        setPriorities(data.priorities || []);
        setStatusConfigs(
          (data.statusConfigs || []).map((cfg: any) => {
            let normalizedStatus = cfg.status.toLowerCase().replace(/ /g, '-');
            if (normalizedStatus === 'done') normalizedStatus = 'achieved';
            if (normalizedStatus === 'not-started') normalizedStatus = 'not-started';
            return {
              ...cfg,
              status: normalizedStatus,
              icon: ICON_MAP[cfg.icon as keyof typeof ICON_MAP] || CheckCircleIcon,
              tooltip: normalizedStatus === 'not-started' ? 'Not Started' : cfg.status,
              color:
                normalizedStatus === 'achieved' ? 'text-green-500' :
                normalizedStatus === 'in-progress' ? 'text-blue-500' :
                normalizedStatus === 'not-required' ? 'text-red-500' :
                normalizedStatus === 'not-started' ? 'text-yellow-500' :
                'text-purple-500',
            };
          })
        );
      });
  }, []);

  const fetchTasks = async () => {
    try {
      console.log('Fetching tasks...');
      const response = await fetch('/api/tasks');
      
      if (!response.ok) {
        const errorData = await response.json();
        console.error('Failed to fetch tasks:', errorData);
        return;
      }
      
      const data = await response.json();
      console.log('Fetched tasks:', data);
      setTasks(data);
    } catch (error) {
      console.error('Error fetching tasks:', error);
    }
  };

  const handleAddTask = (newTask: Task) => {
    setTasks((prevTasks) => [...prevTasks, newTask]);
  };

  const handleUpdateTaskStatus = async (taskId: string, newStatus: string) => {
    try {
      const backendStatus = newStatus;
      const taskToUpdate = tasks.find(task => task._id === taskId);
      if (!taskToUpdate) return;

      setTasks(prevTasks =>
        prevTasks.map(task =>
          task._id === taskId
            ? { ...task, status: newStatus }
            : task
        )
      );

      const response = await fetch(`/api/tasks/${taskId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: backendStatus }),
      });

      if (newStatus === 'achieved' && taskToUpdate.goalFlag === 'Book Reading') {
        // Mark the goal as read for today
        const today = format(new Date(), 'yyyy-MM-dd');
        await fetch(`/api/goals/book-reading/${taskToUpdate.goalId}/progress`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ date: today, read: true }),
        });
      }

      if (!response.ok) {
        let errorData = {};
        try {
          errorData = await response.json();
        } catch (e) {
          errorData = { error: 'Unknown error (invalid JSON response)' };
        }
        console.error('Error updating task:', errorData);
        await fetchTasks();
        return;
      }
      await fetchTasks();
    } catch (error) {
      console.error('Error updating task:', error);
      await fetchTasks();
    }
  };

  const getCategoryColor = (category: string) => {
    const colors: { [key: string]: string } = {
      work: 'bg-blue-100 text-blue-800',
      personal: 'bg-purple-100 text-purple-800',
      health: 'bg-green-100 text-green-800',
      learning: 'bg-yellow-100 text-yellow-800',
    };
    return colors[category] || 'bg-gray-100 text-gray-800';
  };

  const getPriorityColor = (priority: string) => {
    const colors: { [key: string]: string } = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-yellow-100 text-yellow-800',
      high: 'bg-red-100 text-red-800',
    };
    return colors[priority] || 'bg-gray-100 text-gray-800';
  };

  const getStatusBackgroundColor = (status: string) => {
    const colors: { [key: string]: string } = {
      'achieved': 'bg-green-50',
      'in-progress': 'bg-yellow-50',
      'not-required': 'bg-red-50',
      'not-started': ''
    };
    return colors[status] || '';
  };

  const getPendingDays = (task: Task) => {
    if (!task.date || task.status === 'achieved' || task.status === 'not-required') return null;
    const today = new Date();
    const taskDate = new Date(task.date);
    const diffTime = today.getTime() - taskDate.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    return diffDays > 0 ? diffDays : null;
  };

  // Add this helper to get completed date (updatedAt or date)
  const getCompletedDate = (task: Task) => {
    // If you have a completedAt field, use it; otherwise, fallback to updatedAt
    return task.updatedAt || task.date;
  };

  // Add this helper to get number of days from created to completed
  const getDaysToComplete = (task: Task) => {
    const created = new Date(task.date);
    const completed = new Date(getCompletedDate(task));
    const diffTime = completed.getTime() - created.getTime();
    const diffDays = Math.max(1, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
    return diffDays;
  };

  // Helper to format date as DD-MM-YYYY
  const formatDate = (dateStr: string) => {
    if (!dateStr) return '-';
    const d = new Date(dateStr);
    const day = String(d.getDate()).padStart(2, '0');
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const year = d.getFullYear();
    return `${day}-${month}-${year}`;
  };

  const TasksTable = ({ tasks, scheduledFor, onAddTask }: TasksTableProps) => {
    // Filter and sort tasks based on scheduledFor and priority
    const filteredTasks = tasks
      .filter(task => task.scheduledFor === scheduledFor)
      .sort((a, b) => {
        const pa = priorityOrder[a.priority as Priority] ?? 99;
        const pb = priorityOrder[b.priority as Priority] ?? 99;
        if (pa !== pb) return pa - pb;
        return 0;
      });
    
    return (
      <div className="w-full">
        <div className="sm:flex sm:items-center">
          <div className="sm:flex-auto">
            <h2 className="text-xl font-semibold text-gray-900">
              {scheduledFor === 'today' ? "Today's Tasks" : "Tomorrow's Tasks"}
            </h2>
          </div>
          <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
            <button
              type="button"
              onClick={() => onAddTask(scheduledFor)}
              className="inline-flex items-center rounded-md bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500"
            >
              <PlusIcon className="-ml-0.5 mr-1.5 h-5 w-5" aria-hidden="true" />
              Add Task
            </button>
          </div>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-blue-50">
                <th scope="col" className="py-3.5 pl-4 pr-3 text-left text-sm font-semibold text-gray-900 sm:pl-0 w-[45%]">
                  Task
                </th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-[18%]">
                  Category
                </th>
                <th scope="col" className="px-3 py-3.5 text-center text-sm font-semibold text-gray-900 w-[18%]">
                  Priority
                </th>
                <th scope="col" className="pl-2 pr-6 py-3.5 text-center text-sm font-semibold text-gray-900 w-[19%]">
                  {scheduledFor === 'today' ? 'Update Status' : ''}
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredTasks.length === 0 ? (
                <tr>
                  <td 
                    colSpan={4} 
                    className="py-4 pl-4 pr-3 text-sm text-gray-500 text-center"
                  >
                    No tasks scheduled for {scheduledFor}
                  </td>
                </tr>
              ) : (
                filteredTasks.map((task) => {
                  const pendingDays = getPendingDays(task);
                  const isCompleted = isCompletedStatus(task.status);
                  const isBookReading = task.goalFlag === 'Book Reading';
                  const today = format(new Date(), 'yyyy-MM-dd');
                  const alreadyMarkedToday = !!(isBookReading && task.status === 'achieved' && task.updatedAt && task.updatedAt.split('T')[0] === today);
                  return (
                    <tr
                      key={task._id}
                      className={
                        `${getStatusBackgroundColor(task.status)} transition-colors duration-200 ` +
                        (isCompleted ? 'opacity-60 line-through' : '')
                      }
                    >
                      <td className="py-4 pl-4 pr-3 text-sm font-medium text-gray-900">
                        <div className="flex flex-col">
                          <span>
                            {/* Custom formatting for Exercise and Book Reading tasks */}
                            {task.goalFlag === 'Exercise' || task.goalFlag === 'Exercise - Goal' ? (
                              <>
                                {/* Extract measurement from description if present */}
                                {task.title} {task.description ? <span className="text-gray-500 font-normal">({task.description})</span> : null}
                                <span className="ml-2 inline-block px-2 py-0.5 rounded bg-blue-100 text-blue-700 text-xs font-semibold border border-blue-200 align-middle">
                                  Exercise - Goal
                                </span>
                              </>
                            ) : task.goalFlag === 'Book Reading' || task.goalFlag === 'Book Reading - Goal' ? (
                              <>
                                {task.title}
                                <span className="ml-2 inline-block px-2 py-0.5 rounded bg-green-100 text-green-700 text-xs font-semibold border border-green-200 align-middle">
                                  Book Reading - Goal
                                </span>
                              </>
                            ) : (
                              <>
                                {task.title}
                                {task.goalFlag && (
                                  <span className="ml-2 inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 align-middle">
                                    {task.goalFlag}
                                  </span>
                                )}
                              </>
                            )}
                          </span>
                          {pendingDays && (
                            <span className="mt-1 px-2 py-1 rounded bg-red-100 text-red-700 text-xs font-semibold w-fit">
                              Pending Since Last {pendingDays} Day{pendingDays > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-3 py-4 text-sm text-center">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(task.category)}`}>
                          {task.category}
                        </span>
                      </td>
                      <td className="px-3 py-4 text-sm text-center">
                        <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>
                          {task.priority}
                        </span>
                      </td>
                      {scheduledFor === 'today' ? (
                        <td className="pl-2 pr-6 py-4 text-sm">
                          <div className="flex justify-center items-center">
                            <TaskStatusActions
                              taskId={task._id}
                              currentStatus={task.status}
                              onStatusChange={handleUpdateTaskStatus}
                              statusConfigs={statusConfigs}
                              disabled={isCompleted || alreadyMarkedToday}
                            />
                            {alreadyMarkedToday && (
                              <span className="ml-2 text-xs text-gray-400" title="Status already marked for today">(Already marked for today)</span>
                            )}
                          </div>
                        </td>
                      ) : (
                        <td className="pl-2 pr-6 py-4 text-sm"></td>
                      )}
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    );
  };

  // Helper to determine if a status is completed
  const isCompletedStatus = (status: string) => {
    // Use statusConfigs to determine completed statuses, fallback to default
    const completedStatuses = [
      ...statusConfigs.filter(cfg => cfg.isCompleted).map(cfg => cfg.status),
      'achieved', 'not-required', 'done', 'not required'
    ];
    return completedStatuses.some(s => s.toLowerCase() === status.toLowerCase());
  };

  const todayStr = new Date().toISOString().split('T')[0];
  // Today's Tasks: Only tasks planned for today or completed today
  const todaysTasks = (tasks || []).filter(
    task =>
      task.date === todayStr ||
      (isCompletedStatus(task.status) && task.updatedAt && task.updatedAt.split('T')[0] === todayStr)
  );
  // Sort: Not Started tasks on top, ordered by priority (high, medium, low)
  const sortedTodaysTasks = [...todaysTasks].sort((a, b) => {
    if (a.status === 'not-started' && b.status !== 'not-started') return -1;
    if (a.status !== 'not-started' && b.status === 'not-started') return 1;
    if (a.status === 'not-started' && b.status === 'not-started') {
      return (priorityOrder[a.priority as Priority] ?? 99) - (priorityOrder[b.priority as Priority] ?? 99);
    }
    return 0;
  });
  // Completed Tasks: Only tasks completed before today
  const completedTasks = (tasks || []).filter(
    task =>
      isCompletedStatus(task.status) &&
      task.date < todayStr
  );

  // SummaryCards component
  const SummaryCards = ({ tasks }: { tasks: Task[] }) => {
    const totalToday = tasks.length;
    const achievedToday = tasks.filter(t => isCompletedStatus(t.status)).length;
    const overdue = tasks.filter(
      t => !isCompletedStatus(t.status) && t.date < todayStr
    );
    const overdueEligible = tasks.filter(
      t => !isCompletedStatus(t.status)
    );
    // Priority breakdowns
    const highTasks = tasks.filter(t => t.priority === 'high');
    const highAchieved = highTasks.filter(t => isCompletedStatus(t.status)).length;
    const mediumTasks = tasks.filter(t => t.priority === 'medium');
    const mediumAchieved = mediumTasks.filter(t => isCompletedStatus(t.status)).length;
    const lowTasks = tasks.filter(t => t.priority === 'low');
    const lowAchieved = lowTasks.filter(t => isCompletedStatus(t.status)).length;
    // Helper to format percent
    const percent = (num: number, denom: number) => denom === 0 ? '0%' : `${((num / denom) * 100).toFixed(2)}%`;

    const cards = [
      {
        label: 'Due for Today',
        value: { main: `${achievedToday}/${totalToday}`, percent: percent(achievedToday, totalToday) },
        icon: CalendarDaysIcon,
        color: 'bg-blue-100 text-blue-700',
      },
      {
        label: 'Overdue',
        value: { main: `${overdue.length}/${overdueEligible.length}`, percent: percent(overdue.length, overdueEligible.length) },
        icon: ExclamationTriangleIcon,
        color: 'bg-red-100 text-red-700',
      },
      {
        label: 'High Priority',
        value: { main: `${highAchieved}/${highTasks.length}`, percent: percent(highAchieved, highTasks.length) },
        icon: ArrowTrendingUpIcon,
        color: 'bg-red-100 text-red-700',
      },
      {
        label: 'Medium Priority',
        value: { main: `${mediumAchieved}/${mediumTasks.length}`, percent: percent(mediumAchieved, mediumTasks.length) },
        icon: MinusCircleIcon,
        color: 'bg-yellow-100 text-yellow-700',
      },
      {
        label: 'Low Priority',
        value: { main: `${lowAchieved}/${lowTasks.length}`, percent: percent(lowAchieved, lowTasks.length) },
        icon: ArrowTrendingDownIcon,
        color: 'bg-green-100 text-green-700',
      },
    ];

    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4 mb-8">
        {cards.map(card => (
          <div key={card.label} className={`flex items-center gap-4 rounded-xl p-4 shadow-sm ${card.color}`}>
            <card.icon className="w-8 h-8" />
            <div>
              <div className="text-lg font-bold">
                {card.value.main}
                <span className="text-xs ml-1 align-middle">({card.value.percent})</span>
              </div>
              <div className="text-xs font-medium uppercase tracking-wide">{card.label}</div>
            </div>
          </div>
        ))}
      </div>
    );
  };

  // Status icon config for reuse
  const statusConfig = [
    {
      status: 'achieved',
      icon: CheckCircleIcon,
      solidIcon: CheckCircleSolidIcon,
      tooltip: 'Achieved',
      color: 'text-green-500',
    },
    {
      status: 'in-progress',
      icon: PlayCircleIcon,
      solidIcon: PlayCircleSolidIcon,
      tooltip: 'In Progress',
      color: 'text-blue-500',
    },
    {
      status: 'not-required',
      icon: XCircleIcon,
      solidIcon: XCircleSolidIcon,
      tooltip: 'Not Required',
      color: 'text-red-500',
    },
    {
      status: 'not-started',
      icon: ClockIcon,
      solidIcon: ClockSolidIcon,
      tooltip: 'Not Started',
      color: 'text-yellow-500',
    },
  ];

  function StatusIconWithTooltip({ status }: { status: string }) {
    const config = statusConfig.find(s => s.status === status);
    if (!config) return null;
    const Icon = config.solidIcon;
    return (
      <div className="relative group flex justify-end">
        <Icon className={`w-5 h-5 ${config.color}`} />
        <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
          {config.tooltip}
          <div className="absolute left-1/2 transform -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800" />
        </div>
      </div>
    );
  }

  // Add CSV download helper
  function downloadCSV(data: Task[]) {
    const headers = ['Task', 'Category', 'Priority', 'Created Date', 'Completed Date', 'Days', 'Status'];
    const rows = data.map(task => [
      `${task.title}${task.description ? ' (' + task.description + ')' : ''}`,
      task.category,
      task.priority,
      formatDate(task.date),
      formatDate(getCompletedDate(task)),
      getDaysToComplete(task),
      task.status.replace('-', ' '),
    ]);
    const csvContent = [headers, ...rows].map(r => r.map(x => `"${x}"`).join(',')).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'completed_tasks.csv';
    a.click();
    URL.revokeObjectURL(url);
  }

  // Fix linter error: define filter keys as a union type
  const filterKeys = [
    'task',
    'category',
    'priority',
    'createdDate',
    'completedDate',
    'days',
    'status',
  ] as const;
  type FilterKey = typeof filterKeys[number];

  // CompletedTasksTable with filters and pagination
  const CompletedTasksTable = ({ tasks }: { tasks: Task[] }) => {
    // Filter state
    const [filter, setFilter] = useState({
      task: '',
      category: '',
      priority: '',
      createdDate: '',
      completedDate: '',
      days: '',
      status: '',
    });
    // Pagination state
    const [page, setPage] = useState(1);
    const pageSize = 10;

    // Unique values for dropdowns
    const uniqueCategories = Array.from(new Set(tasks.map(t => t.category)));
    const uniquePriorities = Array.from(new Set(tasks.map(t => t.priority)));
    const uniqueStatuses = Array.from(new Set(tasks.map(t => t.status)));

    // Filtering logic
    const filtered = tasks.filter(task => {
      const daysToComplete = getDaysToComplete(task).toString();
      const createdDateMatch = !filter.createdDate || new Date(task.date) >= new Date(filter.createdDate);
      const completedDateMatch = !filter.completedDate || new Date(getCompletedDate(task)) >= new Date(filter.completedDate);
      return (
        (filter.task === '' || (task.title + (task.description || '')).toLowerCase().includes(filter.task.toLowerCase())) &&
        (filter.category === '' || task.category === filter.category) &&
        (filter.priority === '' || task.priority === filter.priority) &&
        createdDateMatch &&
        completedDateMatch &&
        (filter.days === '' || daysToComplete === filter.days) &&
        (filter.status === '' || task.status === filter.status)
      );
    });

    // Pagination logic
    const totalPages = Math.ceil(filtered.length / pageSize);
    const paginated = filtered.slice((page - 1) * pageSize, page * pageSize);

    // Handlers
    const handleFilterChange = (key: string, value: string) => {
      setFilter(f => ({ ...f, [key]: value }));
      setPage(1); // Reset to first page on filter change
    };

    // Add a helper to check if a filter is active
    const isActive = (key: FilterKey) => filter[key] !== '';

    return (
      <div className="w-full mt-10">
        <div className="flex items-center justify-between mb-2">
          <h2 className="text-xl font-semibold text-gray-900">Completed Tasks / History</h2>
          <button
            className="flex items-center gap-1 px-2 py-1 rounded hover:bg-green-100 text-green-700 border border-green-200"
            title="Download CSV"
            onClick={() => downloadCSV(filtered)}
          >
            <ArrowDownTrayIcon className="w-5 h-5" />
          </button>
        </div>
        <div className="w-full overflow-x-auto">
          <table className="w-full divide-y divide-gray-300">
            <thead>
              <tr className="bg-green-50">
                <th className="py-3.5 pl-4 pr-6 text-left text-sm font-semibold text-gray-900 sm:pl-0 w-[32%]">Task</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-[12%]" style={{ minWidth: '90px' }}><span className="ml-2">Category</span></th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-[12%]">Priority</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-[14%]">Created Date</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-[14%]">Completed Date</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-[8%]">Days</th>
                <th className="px-3 py-3.5 text-right text-sm font-semibold text-gray-900 w-[8%]">Status</th>
              </tr>
              <tr className="bg-green-50">
                <th className="py-2 pl-4 pr-6 text-left">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Search..."
                      className={`w-full border rounded px-2 py-1 text-xs ${isActive('task') ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                      value={filter.task}
                      onChange={e => handleFilterChange('task', e.target.value)}
                    />
                    {isActive('task') && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 border-2 border-white z-10"
                        onClick={() => handleFilterChange('task', '')}
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-3 py-2 text-center">
                  <div className="relative flex items-center">
                    <select className={`w-full border rounded px-2 py-1 text-xs ${isActive('category') ? 'border-green-500 bg-green-50' : 'border-gray-300'}`} value={filter.category} onChange={e => handleFilterChange('category', e.target.value)}>
                      <option value="">All</option>
                      {uniqueCategories.map(c => <option key={c} value={c}>{c}</option>)}
                    </select>
                    {isActive('category') && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 border-2 border-white z-10"
                        onClick={() => handleFilterChange('category', '')}
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-3 py-2 text-center">
                  <div className="relative flex items-center">
                    <select className={`w-full border rounded px-2 py-1 text-xs ${isActive('priority') ? 'border-green-500 bg-green-50' : 'border-gray-300'}`} value={filter.priority} onChange={e => handleFilterChange('priority', e.target.value)}>
                      <option value="">All</option>
                      {uniquePriorities.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                    {isActive('priority') && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 border-2 border-white z-10"
                        onClick={() => handleFilterChange('priority', '')}
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-3 py-2 text-center">
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      className={`w-full border rounded px-2 py-1 text-xs ${isActive('createdDate') ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                      value={filter.createdDate}
                      onChange={e => handleFilterChange('createdDate', e.target.value)}
                    />
                    {isActive('createdDate') && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 border-2 border-white z-10"
                        onClick={() => handleFilterChange('createdDate', '')}
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-3 py-2 text-center">
                  <div className="relative flex items-center">
                    <input
                      type="date"
                      className={`w-full border rounded px-2 py-1 text-xs ${isActive('completedDate') ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                      value={filter.completedDate}
                      onChange={e => handleFilterChange('completedDate', e.target.value)}
                    />
                    {isActive('completedDate') && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 border-2 border-white z-10"
                        onClick={() => handleFilterChange('completedDate', '')}
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-3 py-2 text-center">
                  <div className="relative flex items-center">
                    <input
                      type="text"
                      placeholder="Days"
                      className={`w-full border rounded px-2 py-1 text-xs ${isActive('days') ? 'border-green-500 bg-green-50' : 'border-gray-300'}`}
                      value={filter.days}
                      onChange={e => handleFilterChange('days', e.target.value)}
                    />
                    {isActive('days') && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 border-2 border-white z-10"
                        onClick={() => handleFilterChange('days', '')}
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
                <th className="px-3 py-2 text-center">
                  <div className="relative flex items-center">
                    <select className={`w-full border rounded px-2 py-1 text-xs ${isActive('status') ? 'border-green-500 bg-green-50' : 'border-gray-300'}`} value={filter.status} onChange={e => handleFilterChange('status', e.target.value)}>
                      <option value="">All</option>
                      {uniqueStatuses.map(s => <option key={s} value={s}>{s.replace('-', ' ')}</option>)}
                    </select>
                    {isActive('status') && (
                      <button
                        className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center shadow hover:bg-red-700 border-2 border-white z-10"
                        onClick={() => handleFilterChange('status', '')}
                        tabIndex={-1}
                      >
                        ×
                      </button>
                    )}
                  </div>
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {paginated.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-4 pl-4 pr-3 text-sm text-gray-500 text-center">
                    No completed tasks yet
                  </td>
                </tr>
              ) : (
                paginated.map(task => (
                  <tr key={task._id}>
                    <td className="py-4 pl-4 pr-6 text-sm font-medium text-gray-900 w-[32%]">
                      <div className="flex flex-col">
                        <span>
                          {task.title}
                          {task.goalFlag && (
                            <span className="ml-2 inline-block px-2 py-0.5 rounded bg-gray-100 text-gray-700 text-xs font-semibold border border-gray-200 align-middle">
                              {task.goalFlag}
                            </span>
                          )}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-4 text-sm text-right w-[12%]" style={{ minWidth: '90px' }}><span className="ml-2"><span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getCategoryColor(task.category)}`}>{task.category}</span></span></td>
                    <td className="px-3 py-4 text-sm text-right w-[12%]">
                      <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${getPriorityColor(task.priority)}`}>{task.priority}</span>
                    </td>
                    <td className="px-3 py-4 text-sm text-right w-[14%]">{formatDate(task.date)}</td>
                    <td className="px-3 py-4 text-sm text-right w-[14%]">{formatDate(getCompletedDate(task))}</td>
                    <td className="px-3 py-4 text-sm text-right w-[8%]">{getDaysToComplete(task)}</td>
                    <td className="px-3 py-4 text-sm text-right capitalize w-[8%]">
                      <StatusIconWithTooltip status={task.status} />
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
          {/* Pagination Controls */}
          <div className="flex justify-end items-center mt-4 gap-2">
            <button
              className="px-2 py-1 rounded border text-xs disabled:opacity-50"
              onClick={() => setPage(p => Math.max(1, p - 1))}
              disabled={page === 1}
            >
              Previous
            </button>
            {Array.from({ length: totalPages }, (_, i) => (
              <button
                key={i + 1}
                className={`px-2 py-1 rounded border text-xs ${page === i + 1 ? 'bg-green-200 font-bold' : ''}`}
                onClick={() => setPage(i + 1)}
              >
                {i + 1}
              </button>
            ))}
            <button
              className="px-2 py-1 rounded border text-xs disabled:opacity-50"
              onClick={() => setPage(p => Math.min(totalPages, p + 1))}
              disabled={page === totalPages}
            >
              Next
            </button>
          </div>
        </div>
      </div>
    );
  };

  const handleAddTaskModal = (scheduledFor: 'today' | 'tomorrow') => {
    setModalScheduleFor(scheduledFor);
    setIsModalOpen(true);
  };

  return (
    <div className="w-full">
      <div className="sm:flex sm:items-center h-16">
        <div className="sm:flex-auto flex items-center h-full">
          <h1 className="text-2xl font-semibold text-gray-900">To-Do List Management</h1>
        </div>
        <div className="mt-4 sm:mt-0 sm:ml-16 sm:flex-none">
          {/* Removed Add Task button from here to avoid duplicate button at the top */}
        </div>
      </div>
      <p className="text-sm text-gray-700 mb-4">
        Manage and track your daily tasks
      </p>

      <SummaryCards tasks={sortedTodaysTasks} />

      <div className="mb-10">
        <TasksTable 
          tasks={sortedTodaysTasks} 
          scheduledFor="today" 
          onAddTask={handleAddTaskModal} 
        />
      </div>
      <TasksTable 
        tasks={completedTasks} 
        scheduledFor="tomorrow" 
        onAddTask={handleAddTaskModal} 
      />

      <CompletedTasksTable tasks={completedTasks} />

      <AddTaskModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onAddTask={handleAddTask}
        scheduledFor={modalScheduleFor}
        categories={categories}
        priorities={priorities}
      />
    </div>
  );
} 