'use client';

import { Fragment, useState } from 'react';
import { Dialog, Transition } from '@headlessui/react';
import { XMarkIcon } from '@heroicons/react/24/outline';

interface AddTaskModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAddTask: (task: any) => void;
  scheduledFor: 'today' | 'tomorrow';
  categories: string[];
  priorities: string[];
}

export default function AddTaskModal({ isOpen, onClose, onAddTask, scheduledFor, categories, priorities }: AddTaskModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: '',
    priority: '',
  });
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!formData.title || !formData.category || !formData.priority) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      const response = await fetch('/api/tasks', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          status: 'not-started',
          scheduledFor,
          date: new Date().toISOString().split('T')[0],
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        if (response.status === 401) {
          setError('Your session has expired. Please log in again.');
          // Optionally redirect to login page
          return;
        }
        
        if (data.details) {
          setError(Array.isArray(data.details) ? data.details.join(', ') : data.details);
        } else {
          setError(data.error || 'Failed to create task');
        }
        return;
      }

      onAddTask(data);
      onClose();
      setFormData({ title: '', description: '', category: '', priority: '' });
    } catch (error) {
      console.error('Error creating task:', error);
      setError('Failed to create task. Please try again.');
    }
  };

  return (
    <Transition.Root show={isOpen} as={Fragment}>
      <Dialog as="div" className="relative z-50" onClose={onClose}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0"
        >
          <div className="fixed inset-0 bg-gray-500 bg-opacity-75 transition-opacity" />
        </Transition.Child>

        <div className="fixed inset-0 z-10 overflow-y-auto">
          <div className="flex min-h-full items-end justify-center p-4 text-center sm:items-center sm:p-0">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
              enterTo="opacity-100 translate-y-0 sm:scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 translate-y-0 sm:scale-100"
              leaveTo="opacity-0 translate-y-4 sm:translate-y-0 sm:scale-95"
            >
              <Dialog.Panel className="relative transform overflow-hidden rounded-lg bg-white px-4 pb-4 pt-5 text-left shadow-xl transition-all sm:my-8 sm:w-full sm:max-w-lg sm:p-6">
                <div className="absolute right-0 top-0 hidden pr-4 pt-4 sm:block">
                  <button
                    type="button"
                    className="rounded-md bg-white text-gray-400 hover:text-gray-500 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                    onClick={onClose}
                  >
                    <span className="sr-only">Close</span>
                    <XMarkIcon className="h-6 w-6" aria-hidden="true" />
                  </button>
                </div>

                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <Dialog.Title as="h3" className="text-lg font-semibold leading-6 text-gray-900">
                      {scheduledFor === 'today' ? "Add Today's Task" : "Add Tomorrow's Task"}
                    </Dialog.Title>

                    {error && (
                      <div className="mt-2 rounded-md bg-red-50 p-3">
                        <div className="text-sm text-red-700">{error}</div>
                      </div>
                    )}

                    <form onSubmit={handleSubmit} className="mt-6 space-y-6">
                      {/* Category Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Category <span className="text-red-500">*</span>
                        </label>
                        {categories.length > 4 ? (
                          <select
                            className="w-full border rounded px-2 py-2 text-sm"
                            value={formData.category}
                            onChange={e => setFormData({ ...formData, category: e.target.value })}
                            required
                          >
                            <option value="">Select Category</option>
                            {categories.map(category => (
                              <option key={category} value={category}>{category.charAt(0).toUpperCase() + category.slice(1)}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {categories.map((category) => (
                              <button
                                key={category}
                                type="button"
                                onClick={() => setFormData({ ...formData, category })}
                                className={`${
                                  formData.category === category
                                    ? 'bg-blue-100 text-blue-800 ring-2 ring-offset-2 ring-green-500'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                } p-3 rounded-lg text-sm font-medium transition-all`}
                              >
                                {category.charAt(0).toUpperCase() + category.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Task Title */}
                      <div>
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700">
                          Task Title <span className="text-red-500">*</span>
                        </label>
                        <input
                          type="text"
                          id="title"
                          value={formData.title}
                          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                          placeholder="Enter your task"
                          required
                        />
                      </div>

                      {/* Task Description */}
                      <div>
                        <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                          Description <span className="text-gray-500 text-xs">(optional)</span>
                        </label>
                        <textarea
                          id="description"
                          value={formData.description}
                          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                          rows={3}
                          className="mt-1 block w-full rounded-lg border border-gray-300 px-3 py-2 text-gray-900 placeholder-gray-500 focus:border-green-500 focus:outline-none focus:ring-green-500 sm:text-sm"
                          placeholder="Add more details about your task"
                        />
                      </div>

                      {/* Priority Selection */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Priority <span className="text-red-500">*</span>
                        </label>
                        {priorities.length > 3 ? (
                          <select
                            className="w-full border rounded px-2 py-2 text-sm"
                            value={formData.priority}
                            onChange={e => setFormData({ ...formData, priority: e.target.value })}
                            required
                          >
                            <option value="">Select Priority</option>
                            {priorities.map(priority => (
                              <option key={priority} value={priority}>{priority.charAt(0).toUpperCase() + priority.slice(1)}</option>
                            ))}
                          </select>
                        ) : (
                          <div className="flex space-x-2">
                            {priorities.map((priority) => (
                              <button
                                key={priority}
                                type="button"
                                onClick={() => setFormData({ ...formData, priority })}
                                className={`${
                                  formData.priority === priority
                                    ? 'bg-yellow-100 text-yellow-800 ring-2 ring-offset-2 ring-green-500'
                                    : 'bg-gray-50 text-gray-700 hover:bg-gray-100'
                                } flex-1 p-2 rounded-lg text-sm font-medium transition-all`}
                              >
                                {priority.charAt(0).toUpperCase() + priority.slice(1)}
                              </button>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* Submit Button */}
                      <div className="mt-5 sm:mt-4 sm:flex sm:flex-row-reverse">
                        <button
                          type="submit"
                          className="inline-flex w-full justify-center rounded-lg bg-green-600 px-3 py-2 text-sm font-semibold text-white shadow-sm hover:bg-green-500 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-green-600 sm:ml-3 sm:w-auto"
                        >
                          Add Task
                        </button>
                        <button
                          type="button"
                          className="mt-3 inline-flex w-full justify-center rounded-lg bg-white px-3 py-2 text-sm font-semibold text-gray-900 shadow-sm ring-1 ring-inset ring-gray-300 hover:bg-gray-50 sm:mt-0 sm:w-auto"
                          onClick={onClose}
                        >
                          Cancel
                        </button>
                      </div>
                    </form>
                  </div>
                </div>
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition.Root>
  );
} 