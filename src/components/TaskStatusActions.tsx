'use client';

import {
  CheckCircleIcon,
  PlayCircleIcon,
  XCircleIcon,
  ClockIcon,
} from '@heroicons/react/24/outline';
import {
  CheckCircleIcon as CheckCircleSolidIcon,
  PlayCircleIcon as PlayCircleSolidIcon,
  XCircleIcon as XCircleSolidIcon,
  ClockIcon as ClockSolidIcon,
} from '@heroicons/react/24/solid';

interface TaskStatusActionsProps {
  taskId: string;
  currentStatus: string;
  onStatusChange: (taskId: string, newStatus: string) => void;
  statusConfigs: any[];
  disabled?: boolean;
}

const statusConfig = [
  {
    status: 'achieved',
    icon: CheckCircleIcon,
    solidIcon: CheckCircleSolidIcon,
    tooltip: 'Achieved',
    activeColor: 'text-green-500 hover:text-green-600',
    inactiveColor: 'text-gray-400 hover:text-gray-500',
  },
  {
    status: 'in-progress',
    icon: PlayCircleIcon,
    solidIcon: PlayCircleSolidIcon,
    tooltip: 'In Progress',
    activeColor: 'text-blue-500 hover:text-blue-600',
    inactiveColor: 'text-gray-400 hover:text-gray-500',
  },
  {
    status: 'not-required',
    icon: XCircleIcon,
    solidIcon: XCircleSolidIcon,
    tooltip: 'Not Required',
    activeColor: 'text-red-500 hover:text-red-600',
    inactiveColor: 'text-gray-400 hover:text-gray-500',
  },
  {
    status: 'not-started',
    icon: ClockIcon,
    solidIcon: ClockSolidIcon,
    tooltip: 'Not Started',
    activeColor: 'text-yellow-500 hover:text-yellow-600',
    inactiveColor: 'text-gray-400 hover:text-gray-500',
  },
];

export default function TaskStatusActions({ taskId, currentStatus, onStatusChange, statusConfigs, disabled }: TaskStatusActionsProps) {
  const todoStatusActions = (statusConfigs || []).filter(cfg => cfg.enabled && cfg.todo);
  return (
    <div className="flex items-center space-x-2">
      {todoStatusActions.map(cfg => {
        const Icon = cfg.icon;
        return (
          <div key={cfg.status} className="relative group">
            <button
              onClick={() => !disabled && onStatusChange(taskId, cfg.status)}
              className={`p-1.5 rounded-full transition-colors ${currentStatus === cfg.status ? cfg.color : 'text-gray-400 hover:text-gray-500'} ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
              disabled={disabled}
            >
              <Icon className="w-5 h-5" />
            </button>
            <div className="absolute left-1/2 transform -translate-x-1/2 bottom-full mb-2 px-2 py-1 text-xs font-medium text-white bg-gray-800 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap z-10">
              {cfg.tooltip || cfg.status}
              <div className="absolute left-1/2 transform -translate-x-1/2 top-full border-4 border-transparent border-t-gray-800" />
            </div>
          </div>
        );
      })}
    </div>
  );
} 