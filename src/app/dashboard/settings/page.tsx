'use client';
import React from "react";
import { useState, useEffect, useRef } from 'react';
import { Squares2X2Icon, TagIcon, AdjustmentsHorizontalIcon, TrophyIcon, ChevronRightIcon, PlusIcon, PencilIcon, TrashIcon, CheckIcon, ArrowDownTrayIcon, XMarkIcon, CheckCircleIcon, ClockIcon, PlayCircleIcon, PauseCircleIcon, XCircleIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon, DocumentCheckIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon, ArrowPathIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, StarIcon, FireIcon, BoltIcon, HeartIcon, GlobeAltIcon, UserGroupIcon, ChatBubbleLeftRightIcon, BellIcon, CalendarIcon, FlagIcon, BookmarkIcon, ShieldCheckIcon, WrenchScrewdriverIcon, LightBulbIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/outline';
import { useRouter, usePathname } from 'next/navigation';

const DEFAULT_CATEGORIES = ['Work', 'Personal', 'Health', 'Learning'];
const DEFAULT_PRIORITIES = ['High', 'Medium', 'Low'];

const SIDEBAR_TABS = [
  { key: 'todo', label: 'To-Do List Configurations', icon: TagIcon },
  { key: 'goals', label: 'Goals Configurations', icon: TrophyIcon },
  { key: 'status', label: 'Status Configurations', icon: CheckCircleIcon },
];

// Mock data for goals
const MOCK_GOAL_CATEGORIES = [
  {
    name: 'Fitness',
    subCategories: [
      {
        name: 'Cardio',
        descriptions: ['Run 5km', 'Cycle 10km'],
      },
      {
        name: 'Strength',
        descriptions: ['Pushups', 'Squats'],
      },
    ],
  },
  {
    name: 'Learning',
    subCategories: [
      {
        name: 'Programming',
        descriptions: ['Learn React', 'Practice Algorithms'],
      },
    ],
  },
];

// Add status list and icon options:
const STATUS_LIST = [
  'Not Started', 'In Progress', 'Done', 'On Hold', 'Not Required', 'Blocked', 'To Do', 'Review', 'Canceled', 'Deferred', 'In Review', 'Pending'
];
const ICON_OPTIONS = [
  CheckCircleIcon, ClockIcon, PlayCircleIcon, PauseCircleIcon, XCircleIcon, ExclamationCircleIcon, EyeIcon, EyeSlashIcon, DocumentCheckIcon, DocumentTextIcon, DocumentMagnifyingGlassIcon, ArrowPathIcon, ArrowTrendingUpIcon, ArrowTrendingDownIcon, ArrowUpCircleIcon, ArrowDownCircleIcon, StarIcon, FireIcon, BoltIcon, HeartIcon, GlobeAltIcon, UserGroupIcon, ChatBubbleLeftRightIcon, BellIcon, CalendarIcon, FlagIcon, BookmarkIcon, ShieldCheckIcon, WrenchScrewdriverIcon, LightBulbIcon, QuestionMarkCircleIcon
];

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

function IconDropdown({ value, options, onChange, disabled }: { value: any, options: any[], onChange: (icon: any) => void, disabled?: boolean }) {
  const [open, setOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  // Close dropdown on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClick);
    return () => document.removeEventListener('mousedown', handleClick);
  }, [open]);
  const selectedIdx = options.findIndex(opt => opt === value);
  return (
    <div className="relative inline-block w-8" ref={dropdownRef}>
      <button
        type="button"
        className="w-8 h-8 flex items-center justify-center border rounded bg-white hover:bg-gray-50 focus:outline-none"
        onClick={() => setOpen(o => !o)}
        disabled={disabled}
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        {value && React.createElement(value, { className: 'w-5 h-5 text-green-600' })}
      </button>
      {open && (
        <ul className="absolute z-10 mt-1 w-40 max-h-60 overflow-auto bg-white border rounded shadow-lg py-1 text-xs" role="listbox">
          {options.map((Icon, i) => (
            <li
              key={i}
              className={`flex items-center gap-2 px-2 py-1 cursor-pointer hover:bg-green-50 ${Icon === value ? 'bg-green-100' : ''}`}
              onClick={() => { onChange(Icon); setOpen(false); }}
              role="option"
              aria-selected={Icon === value}
            >
              <Icon className="w-5 h-5 text-green-600" />
              <span>{Icon.displayName || Icon.name}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function ToggleSwitch({ checked, onChange, disabled = false }: { checked: boolean, onChange: (checked: boolean) => void, disabled?: boolean }) {
  return (
    <button
      type="button"
      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
        checked ? 'bg-green-500' : 'bg-gray-300'
      } ${disabled ? 'opacity-50 cursor-not-allowed' : ''}`}
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
      disabled={disabled}
    >
      <span
        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
          checked ? 'translate-x-6' : 'translate-x-1'
        }`}
      />
    </button>
  );
}

export default function SettingsPage() {
  // To-Do List Configurations state
  const [categories, setCategories] = useState<string[]>([]);
  const [priorities, setPriorities] = useState<string[]>([]);
  const [newCategory, setNewCategory] = useState('');
  const [newPriority, setNewPriority] = useState('');
  const [editCategoryIdx, setEditCategoryIdx] = useState<number | null>(null);
  const [editPriorityIdx, setEditPriorityIdx] = useState<number | null>(null);
  const [editCategoryValue, setEditCategoryValue] = useState('');
  const [editPriorityValue, setEditPriorityValue] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [activeSidebar, setActiveSidebar] = useState('todo');

  // Goals Configurations state
  const [goalCategories, setGoalCategories] = useState(MOCK_GOAL_CATEGORIES);
  const [selectedGoalCatIdx, setSelectedGoalCatIdx] = useState(0);
  const [selectedSubCatIdx, setSelectedSubCatIdx] = useState(0);
  const [newGoalCat, setNewGoalCat] = useState('');
  const [editGoalCatIdx, setEditGoalCatIdx] = useState<number | null>(null);
  const [editGoalCatValue, setEditGoalCatValue] = useState('');
  const [newSubCat, setNewSubCat] = useState('');
  const [editSubCatIdx, setEditSubCatIdx] = useState<number | null>(null);
  const [editSubCatValue, setEditSubCatValue] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [editDescIdx, setEditDescIdx] = useState<number | null>(null);
  const [editDescValue, setEditDescValue] = useState('');

  // For each edit input, add a ref for the input and a ref for the save button
  const categoryEditRefs = useRef<(HTMLInputElement | null)[]>([]);
  const categorySaveBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const priorityEditRefs = useRef<(HTMLInputElement | null)[]>([]);
  const prioritySaveBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const goalCatEditRefs = useRef<(HTMLInputElement | null)[]>([]);
  const goalCatSaveBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const subCatEditRefs = useRef<(HTMLInputElement | null)[]>([]);
  const subCatSaveBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const descEditRefs = useRef<(HTMLInputElement | null)[]>([]);
  const descSaveBtnRefs = useRef<(HTMLButtonElement | null)[]>([]);
  const categorySaveClickedRef = useRef(false);
  const prioritySaveClickedRef = useRef(false);
  const goalCatSaveClickedRef = useRef(false);
  const subCatSaveClickedRef = useRef(false);
  const descSaveClickedRef = useRef(false);

  // Add state for delete confirmation:
  const [deleteConfirm, setDeleteConfirm] = useState<{ type: string, idx: number, parentIdx?: number } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const [statusConfigs, setStatusConfigs] = useState<{ status: string, icon: any, allPages: boolean, todo: boolean, goals: boolean, habit: boolean, enabled: boolean }[]>(
    STATUS_LIST.map((status, idx) => ({
      status,
      icon: ICON_OPTIONS[idx],
      allPages: true,
      todo: true,
      goals: true,
      habit: true,
      enabled: true,
    }))
  );

  const router = useRouter();
  const pathname = usePathname();

  const fetchStatusConfigs = () => {
    setLoading(true);
    fetch('/api/settings')
      .then(res => res.json())
      .then(data => {
        setCategories(data.categories || DEFAULT_CATEGORIES);
        setPriorities(data.priorities || DEFAULT_PRIORITIES);
        setStatusConfigs(
          (data.statusConfigs || []).map((cfg: any) => ({
            ...cfg,
            icon: ICON_MAP[cfg.icon as keyof typeof ICON_MAP] || CheckCircleIcon,
          }))
        );
        setLoading(false);
      })
      .catch(() => {
        setCategories(DEFAULT_CATEGORIES);
        setPriorities(DEFAULT_PRIORITIES);
        setStatusConfigs([]);
        setLoading(false);
      });
  };

  useEffect(() => {
    fetchStatusConfigs();
    // Re-fetch configs when the route changes
    // eslint-disable-next-line
  }, [pathname]);

  // To-Do List Configurations logic (same as before)
  const saveSettings = async (newCategories: string[], newPriorities: string[]) => {
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      const res = await fetch('/api/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ categories: newCategories, priorities: newPriorities }),
      });
      if (!res.ok) throw new Error('Failed to save');
      setSuccess('Settings saved!');
    } catch (e) {
      setError('Failed to save settings.');
    } finally {
      setSaving(false);
      setTimeout(() => setSuccess(''), 2000);
    }
  };
  const addCategory = () => {
    if (newCategory && !categories.includes(newCategory)) {
      const updated = [...categories, newCategory];
      setCategories(updated);
      setNewCategory('');
      saveSettings(updated, priorities);
    }
  };
  const removeCategory = (idx: number) => {
    const updated = categories.filter((_, i) => i !== idx);
    setCategories(updated);
    saveSettings(updated, priorities);
  };
  const startEditCategory = (idx: number) => {
    setEditCategoryIdx(idx);
    setEditCategoryValue(categories[idx]);
  };
  const saveEditCategory = () => {
    if (editCategoryIdx !== null && editCategoryValue) {
      const updated = categories.map((cat, i) => (i === editCategoryIdx ? editCategoryValue : cat));
      setCategories(updated);
      setEditCategoryIdx(null);
      setEditCategoryValue('');
      saveSettings(updated, priorities);
    }
  };
  const addPriority = () => {
    if (newPriority && !priorities.includes(newPriority)) {
      const updated = [...priorities, newPriority];
      setPriorities(updated);
      setNewPriority('');
      saveSettings(categories, updated);
    }
  };
  const removePriority = (idx: number) => {
    const updated = priorities.filter((_, i) => i !== idx);
    setPriorities(updated);
    saveSettings(categories, updated);
  };
  const startEditPriority = (idx: number) => {
    setEditPriorityIdx(idx);
    setEditPriorityValue(priorities[idx]);
  };
  const saveEditPriority = () => {
    if (editPriorityIdx !== null && editPriorityValue) {
      const updated = priorities.map((pri, i) => (i === editPriorityIdx ? editPriorityValue : pri));
      setPriorities(updated);
      setEditPriorityIdx(null);
      setEditPriorityValue('');
      saveSettings(categories, updated);
    }
  };

  // Goals Configurations logic
  // --- Goal Categories ---
  const addGoalCategory = () => {
    if (newGoalCat && !goalCategories.some(cat => cat.name === newGoalCat)) {
      setGoalCategories([...goalCategories, { name: newGoalCat, subCategories: [] }]);
      setNewGoalCat('');
    }
  };
  const removeGoalCategory = (idx: number) => {
    const updated = goalCategories.filter((_, i) => i !== idx);
    setGoalCategories(updated);
    setSelectedGoalCatIdx(0);
    setSelectedSubCatIdx(0);
  };
  const startEditGoalCategory = (idx: number) => {
    setEditGoalCatIdx(idx);
    setEditGoalCatValue(goalCategories[idx].name);
  };
  const saveEditGoalCategory = () => {
    if (editGoalCatIdx !== null && editGoalCatValue) {
      const updated = goalCategories.map((cat, i) => i === editGoalCatIdx ? { ...cat, name: editGoalCatValue } : cat);
      setGoalCategories(updated);
      setEditGoalCatIdx(null);
      setEditGoalCatValue('');
    }
  };
  // --- Sub Categories ---
  const addSubCategory = () => {
    if (!goalCategories[selectedGoalCatIdx]) return;
    if (newSubCat && !goalCategories[selectedGoalCatIdx].subCategories.some(sub => sub.name === newSubCat)) {
      const updated = goalCategories.map((cat, i) =>
        i === selectedGoalCatIdx
          ? { ...cat, subCategories: [...cat.subCategories, { name: newSubCat, descriptions: [] }] }
          : cat
      );
      setGoalCategories(updated);
      setNewSubCat('');
    }
  };
  const removeSubCategory = (idx: number) => {
    const updated = goalCategories.map((cat, i) =>
      i === selectedGoalCatIdx
        ? { ...cat, subCategories: cat.subCategories.filter((_, j) => j !== idx) }
        : cat
    );
    setGoalCategories(updated);
    setSelectedSubCatIdx(0);
  };
  const startEditSubCategory = (idx: number) => {
    setEditSubCatIdx(idx);
    setEditSubCatValue(goalCategories[selectedGoalCatIdx].subCategories[idx].name);
  };
  const saveEditSubCategory = () => {
    if (editSubCatIdx !== null && editSubCatValue) {
      const updated = goalCategories.map((cat, i) =>
        i === selectedGoalCatIdx
          ? {
              ...cat,
              subCategories: cat.subCategories.map((sub, j) =>
                j === editSubCatIdx ? { ...sub, name: editSubCatValue } : sub
              ),
            }
          : cat
      );
      setGoalCategories(updated);
      setEditSubCatIdx(null);
      setEditSubCatValue('');
    }
  };
  // --- Descriptions ---
  const addDescription = () => {
    if (!goalCategories[selectedGoalCatIdx]?.subCategories[selectedSubCatIdx]) return;
    if (newDesc && !goalCategories[selectedGoalCatIdx].subCategories[selectedSubCatIdx].descriptions.includes(newDesc)) {
      const updated = goalCategories.map((cat, i) =>
        i === selectedGoalCatIdx
          ? {
              ...cat,
              subCategories: cat.subCategories.map((sub, j) =>
                j === selectedSubCatIdx
                  ? { ...sub, descriptions: [...sub.descriptions, newDesc] }
                  : sub
              ),
            }
          : cat
      );
      setGoalCategories(updated);
      setNewDesc('');
    }
  };
  const removeDescription = (idx: number) => {
    const updated = goalCategories.map((cat, i) =>
      i === selectedGoalCatIdx
        ? {
            ...cat,
            subCategories: cat.subCategories.map((sub, j) =>
              j === selectedSubCatIdx
                ? { ...sub, descriptions: sub.descriptions.filter((_, k) => k !== idx) }
                : sub
            ),
          }
        : cat
    );
    setGoalCategories(updated);
  };
  const startEditDescription = (idx: number) => {
    setEditDescIdx(idx);
    setEditDescValue(goalCategories[selectedGoalCatIdx].subCategories[selectedSubCatIdx].descriptions[idx]);
  };
  const saveEditDescription = () => {
    if (editDescIdx !== null && editDescValue) {
      const updated = goalCategories.map((cat, i) =>
        i === selectedGoalCatIdx
          ? {
              ...cat,
              subCategories: cat.subCategories.map((sub, j) =>
                j === selectedSubCatIdx
                  ? {
                      ...sub,
                      descriptions: sub.descriptions.map((desc, k) =>
                        k === editDescIdx ? editDescValue : desc
                      ),
                    }
                  : sub
              ),
            }
          : cat
      );
      setGoalCategories(updated);
      setEditDescIdx(null);
      setEditDescValue('');
    }
  };

  // --- Renderers ---
  const renderToDoConfig = () => (
    <div className="flex flex-col md:flex-row gap-4 w-full">
      {/* Category Card */}
      <section className="flex-1 bg-gray-50 rounded-md border border-gray-100 p-3 flex flex-col min-w-[200px] max-w-[320px] mx-auto h-full">
        <h2 className="text-xs font-bold mb-2 tracking-wide uppercase text-gray-700 text-center">Category</h2>
        <div className="flex gap-1 mb-2">
          <input
            className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-200 bg-white/80 capitalize"
            placeholder="Add New Category"
            value={newCategory}
            onChange={e => setNewCategory(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addCategory()}
            disabled={saving}
            ref={el => { categoryEditRefs.current[0] = el; }}
            onBlur={() => { if (!categorySaveClickedRef.current) setEditCategoryIdx(null); categorySaveClickedRef.current = false; }}
          />
          <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition" onClick={addCategory} disabled={saving} ref={el => { categorySaveBtnRefs.current[0] = el; }} onMouseDown={() => categorySaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
        </div>
        <ul className="space-y-1">
          {categories.map((cat, idx) => (
            <li key={cat} className="flex items-center gap-1 bg-white/80 rounded px-2 py-1 text-xs border border-gray-100 hover:shadow-sm transition">
              {editCategoryIdx === idx ? (
                <>
                  <input
                    className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs capitalize"
                    value={editCategoryValue}
                    onChange={e => setEditCategoryValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEditCategory()}
                    disabled={saving}
                    ref={el => { categoryEditRefs.current[idx] = el; }}
                    onBlur={() => { if (!categorySaveClickedRef.current) setEditCategoryIdx(null); categorySaveClickedRef.current = false; }}
                  />
                  <button className="text-green-600 font-semibold text-xs" onClick={saveEditCategory} disabled={saving} ref={el => { categorySaveBtnRefs.current[idx] = el; }} onMouseDown={() => categorySaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
                  <button className="text-gray-500 text-xs" onClick={() => setEditCategoryIdx(null)} disabled={saving}><XMarkIcon className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="font-medium flex-1 capitalize">{cat}</span>
                  <button className="text-blue-600 hover:underline text-xs" onClick={() => startEditCategory(idx)} disabled={saving}><PencilIcon className="w-4 h-4" /></button>
                  <button className="text-red-600 hover:underline text-xs" onClick={() => setDeleteConfirm({ type: 'category', idx })} disabled={saving}><TrashIcon className="w-4 h-4" /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
      {/* Priority Card */}
      <section className="flex-1 bg-gray-50 rounded-md border border-gray-100 p-3 flex flex-col min-w-[200px] max-w-[320px] mx-auto h-full">
        <h2 className="text-xs font-bold mb-2 tracking-wide uppercase text-gray-700 text-center">Priority</h2>
        <div className="flex gap-1 mb-2">
          <input
            className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-200 bg-white/80 capitalize"
            placeholder="Add New Priority"
            value={newPriority}
            onChange={e => setNewPriority(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addPriority()}
            disabled={saving}
            ref={el => { priorityEditRefs.current[0] = el; }}
            onBlur={() => { if (!prioritySaveClickedRef.current) setEditPriorityIdx(null); prioritySaveClickedRef.current = false; }}
          />
          <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition" onClick={addPriority} disabled={saving} ref={el => { prioritySaveBtnRefs.current[0] = el; }} onMouseDown={() => prioritySaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
        </div>
        <ul className="space-y-1">
          {priorities.map((pri, idx) => (
            <li key={pri} className="flex items-center gap-1 bg-white/80 rounded px-2 py-1 text-xs border border-gray-100 hover:shadow-sm transition">
              {editPriorityIdx === idx ? (
                <>
                  <input
                    className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs capitalize"
                    value={editPriorityValue}
                    onChange={e => setEditPriorityValue(e.target.value)}
                    onKeyDown={e => e.key === 'Enter' && saveEditPriority()}
                    disabled={saving}
                    ref={el => { priorityEditRefs.current[idx] = el; }}
                    onBlur={() => { if (!prioritySaveClickedRef.current) setEditPriorityIdx(null); prioritySaveClickedRef.current = false; }}
                  />
                  <button className="text-green-600 font-semibold text-xs" onClick={saveEditPriority} disabled={saving} ref={el => { prioritySaveBtnRefs.current[idx] = el; }} onMouseDown={() => prioritySaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
                  <button className="text-gray-500 text-xs" onClick={() => setEditPriorityIdx(null)} disabled={saving}><XMarkIcon className="w-4 h-4" /></button>
                </>
              ) : (
                <>
                  <span className="font-medium flex-1 capitalize">{pri}</span>
                  <button className="text-blue-600 hover:underline text-xs" onClick={() => startEditPriority(idx)} disabled={saving}><PencilIcon className="w-4 h-4" /></button>
                  <button className="text-red-600 hover:underline text-xs" onClick={() => setDeleteConfirm({ type: 'priority', idx })} disabled={saving}><TrashIcon className="w-4 h-4" /></button>
                </>
              )}
            </li>
          ))}
        </ul>
      </section>
    </div>
  );

  const renderGoalsConfig = () => {
    const selectedCat = goalCategories[selectedGoalCatIdx] || { name: '', subCategories: [] };
    const selectedSubCat = selectedCat.subCategories[selectedSubCatIdx] || { name: '', descriptions: [] };
    return (
      <div className="flex flex-col md:flex-row gap-4 w-full">
        {/* Goal Categories */}
        <section className="flex-1 bg-gray-50 rounded-md border border-gray-100 p-3 flex flex-col min-w-[180px] max-w-[240px] mx-auto h-full">
          <h2 className="text-xs font-bold mb-2 tracking-wide uppercase text-gray-700 text-center">Category</h2>
          <div className="flex gap-1 mb-2">
            <input
              className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-200 bg-white/80 capitalize"
              placeholder="Add New Category"
              value={newGoalCat}
              onChange={e => setNewGoalCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addGoalCategory()}
              ref={el => { goalCatEditRefs.current[0] = el; }}
              onBlur={() => { if (!goalCatSaveClickedRef.current) setEditGoalCatIdx(null); goalCatSaveClickedRef.current = false; }}
            />
            <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition" onClick={addGoalCategory} ref={el => { goalCatSaveBtnRefs.current[0] = el; }} onMouseDown={() => goalCatSaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
          </div>
          <ul className="space-y-1">
            {goalCategories.map((cat, idx) => (
              <li key={cat.name} className={`flex items-center gap-1 rounded px-2 py-1 text-xs border border-gray-100 hover:bg-green-50 cursor-pointer ${selectedGoalCatIdx === idx ? 'bg-green-100' : 'bg-white/80'}`}
                onClick={() => { setSelectedGoalCatIdx(idx); setSelectedSubCatIdx(0); }}>
                {editGoalCatIdx === idx ? (
                  <>
                    <input
                      className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs capitalize"
                      value={editGoalCatValue}
                      onChange={e => setEditGoalCatValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditGoalCategory()}
                      ref={el => { goalCatEditRefs.current[idx] = el; }}
                      onBlur={() => { if (!goalCatSaveClickedRef.current) setEditGoalCatIdx(null); goalCatSaveClickedRef.current = false; }}
                    />
                    <button className="text-green-600 font-semibold text-xs" onClick={saveEditGoalCategory} ref={el => { goalCatSaveBtnRefs.current[idx] = el; }} onMouseDown={() => goalCatSaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
                    <button className="text-gray-500 text-xs" onClick={() => setEditGoalCatIdx(null)}><XMarkIcon className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="font-medium flex-1 capitalize">{cat.name}</span>
                    <button className="text-blue-600 hover:underline text-xs" onClick={e => { e.stopPropagation(); startEditGoalCategory(idx); }}><PencilIcon className="w-4 h-4" /></button>
                    <button className="text-red-600 hover:underline text-xs" onClick={() => setDeleteConfirm({ type: 'goalCategory', idx })} disabled={saving}><TrashIcon className="w-4 h-4" /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
        {/* Sub Categories */}
        <section className="flex-1 bg-gray-50 rounded-md border border-gray-100 p-3 flex flex-col min-w-[180px] max-w-[240px] mx-auto h-full">
          <h2 className="text-xs font-bold mb-2 tracking-wide uppercase text-gray-700 text-center">Sub Category</h2>
          <div className="flex gap-1 mb-2">
            <input
              className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-200 bg-white/80 capitalize"
              placeholder="Add New Sub Category"
              value={newSubCat}
              onChange={e => setNewSubCat(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addSubCategory()}
              ref={el => { subCatEditRefs.current[0] = el; }}
              onBlur={() => { if (!subCatSaveClickedRef.current) setEditSubCatIdx(null); subCatSaveClickedRef.current = false; }}
            />
            <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition" onClick={addSubCategory} ref={el => { subCatSaveBtnRefs.current[0] = el; }} onMouseDown={() => subCatSaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
          </div>
          <ul className="space-y-1">
            {selectedCat.subCategories.map((sub, idx) => (
              <li key={sub.name} className={`flex items-center gap-1 rounded px-2 py-1 text-xs border border-gray-100 hover:bg-green-50 cursor-pointer ${selectedSubCatIdx === idx ? 'bg-green-100' : 'bg-white/80'}`}
                onClick={() => setSelectedSubCatIdx(idx)}>
                {editSubCatIdx === idx ? (
                  <>
                    <input
                      className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs capitalize"
                      value={editSubCatValue}
                      onChange={e => setEditSubCatValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditSubCategory()}
                      ref={el => { subCatEditRefs.current[idx] = el; }}
                      onBlur={() => { if (!subCatSaveClickedRef.current) setEditSubCatIdx(null); subCatSaveClickedRef.current = false; }}
                    />
                    <button className="text-green-600 font-semibold text-xs" onClick={saveEditSubCategory} ref={el => { subCatSaveBtnRefs.current[idx] = el; }} onMouseDown={() => subCatSaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
                    <button className="text-gray-500 text-xs" onClick={() => setEditSubCatIdx(null)}><XMarkIcon className="w-4 h-4" /></button>
                  </>
                ) : (
                  <>
                    <span className="font-medium flex-1 capitalize">{sub.name}</span>
                    <button className="text-blue-600 hover:underline text-xs" onClick={e => { e.stopPropagation(); startEditSubCategory(idx); }}><PencilIcon className="w-4 h-4" /></button>
                    <button className="text-red-600 hover:underline text-xs" onClick={() => setDeleteConfirm({ type: 'subCategory', idx })} disabled={saving}><TrashIcon className="w-4 h-4" /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
        {/* Descriptions */}
        <section className="flex-1 bg-gray-50 rounded-md border border-gray-100 p-3 flex flex-col min-w-[180px] max-w-[240px] mx-auto h-full">
          <h2 className="text-xs font-bold mb-2 tracking-wide uppercase text-gray-700 text-center">Description</h2>
          <div className="flex gap-1 mb-2">
            <input
              className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs focus:outline-none focus:ring-1 focus:ring-green-200 bg-white/80 capitalize"
              placeholder="Add New Description"
              value={newDesc}
              onChange={e => setNewDesc(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && addDescription()}
              ref={el => { descEditRefs.current[0] = el; }}
              onBlur={() => { if (!descSaveClickedRef.current) setEditDescIdx(null); descSaveClickedRef.current = false; }}
            />
            <button className="bg-green-500 hover:bg-green-600 text-white px-2 py-1 rounded text-xs transition" onClick={addDescription} ref={el => { descSaveBtnRefs.current[0] = el; }} onMouseDown={() => descSaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
          </div>
          <ul className="space-y-1">
            {selectedSubCat.descriptions.map((desc, idx) => (
              <li key={desc} className="flex items-center gap-1 rounded px-2 py-1 text-xs border border-gray-100 hover:bg-green-50 cursor-pointer bg-white/80">
                {editDescIdx === idx ? (
                  <>
                    <input
                      className="border border-gray-300 rounded px-2 py-1 flex-1 text-xs"
                      value={editDescValue}
                      onChange={e => setEditDescValue(e.target.value)}
                      onKeyDown={e => e.key === 'Enter' && saveEditDescription()}
                      ref={el => { descEditRefs.current[idx] = el; }}
                      onBlur={() => { if (!descSaveClickedRef.current) setEditDescIdx(null); descSaveClickedRef.current = false; }}
                    />
                    <button className="text-green-600 font-semibold text-xs" onClick={saveEditDescription} ref={el => { descSaveBtnRefs.current[idx] = el; }} onMouseDown={() => descSaveClickedRef.current = true}><ArrowDownTrayIcon className="w-4 h-4" /></button>
                    <button className="text-gray-500 text-xs" onClick={() => setEditDescIdx(null)}>Cancel</button>
                  </>
                ) : (
                  <>
                    <span className="font-medium flex-1 capitalize">{desc}</span>
                    <button className="text-blue-600 hover:underline text-xs" onClick={e => { e.stopPropagation(); startEditDescription(idx); }}><PencilIcon className="w-4 h-4" /></button>
                    <button className="text-red-600 hover:underline text-xs" onClick={() => setDeleteConfirm({ type: 'description', idx })} disabled={saving}><TrashIcon className="w-4 h-4" /></button>
                  </>
                )}
              </li>
            ))}
          </ul>
        </section>
      </div>
    );
  };

  function renderStatusConfig() {
    // Get used icons
    const usedIcons = statusConfigs.map(cfg => cfg.icon);
    return (
      <div className="overflow-x-auto">
        <table className="min-w-full text-xs border rounded bg-white/90">
          <thead>
            <tr className="bg-gray-100 text-gray-700">
              <th className="px-3 py-2 text-left">Status</th>
              <th className="px-3 py-2 text-left">Icon</th>
              <th className="px-3 py-2">All Pages</th>
              <th className="px-3 py-2">To-Do List</th>
              <th className="px-3 py-2">Goals</th>
              <th className="px-3 py-2">Habit</th>
              <th className="px-3 py-2">Enabled</th>
            </tr>
          </thead>
          <tbody>
            {statusConfigs.map((cfg: any, idx: number) => {
              // Only show icons not already used by another status
              const availableIcons = ICON_OPTIONS.filter(icon => icon === cfg.icon || !usedIcons.includes(icon));
              return (
                <tr key={cfg.status} className="border-b hover:bg-green-50">
                  <td className="px-3 py-2 font-semibold capitalize">{cfg.status}</td>
                  <td className="px-3 py-2">
                    <div className="flex items-center gap-2">
                      <IconDropdown value={cfg.icon} options={availableIcons} onChange={icon => setStatusConfigs(configs => configs.map((c, i) => i === idx ? { ...c, icon } : c))} />
                    </div>
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={cfg.allPages === true} onChange={e => {
                      const checked = e.target.checked;
                      setStatusConfigs(configs => {
                        const updated = configs.map((c, i) => {
                          if (i !== idx) return c;
                          const newCfg = {
                            ...c,
                            allPages: checked,
                            todo: checked,
                            goals: checked,
                            habit: checked,
                          };
                          // If any are checked, enable; if all are unchecked, disable
                          newCfg.enabled = checked || newCfg.todo || newCfg.goals || newCfg.habit;
                          return newCfg;
                        });
                        saveStatusConfigs(updated);
                        return updated;
                      });
                    }} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={cfg.todo === true} disabled={cfg.allPages} onChange={e => {
                      const checked = e.target.checked;
                      setStatusConfigs(configs => {
                        const updated = configs.map((c, i) => {
                          if (i !== idx) return c;
                          const newCfg = {
                            ...c,
                            todo: checked,
                          };
                          // If any are checked, enable; if all are unchecked, disable
                          newCfg.enabled = newCfg.allPages || checked || newCfg.goals || newCfg.habit;
                          return newCfg;
                        });
                        saveStatusConfigs(updated);
                        return updated;
                      });
                    }} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={cfg.goals === true} disabled={cfg.allPages} onChange={e => {
                      const checked = e.target.checked;
                      setStatusConfigs(configs => {
                        const updated = configs.map((c, i) => {
                          if (i !== idx) return c;
                          const newCfg = {
                            ...c,
                            goals: checked,
                          };
                          newCfg.enabled = newCfg.allPages || newCfg.todo || checked || newCfg.habit;
                          return newCfg;
                        });
                        saveStatusConfigs(updated);
                        return updated;
                      });
                    }} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <input type="checkbox" checked={cfg.habit === true} disabled={cfg.allPages} onChange={e => {
                      const checked = e.target.checked;
                      setStatusConfigs(configs => {
                        const updated = configs.map((c, i) => {
                          if (i !== idx) return c;
                          const newCfg = {
                            ...c,
                            habit: checked,
                          };
                          newCfg.enabled = newCfg.allPages || newCfg.todo || newCfg.goals || checked;
                          return newCfg;
                        });
                        saveStatusConfigs(updated);
                        return updated;
                      });
                    }} />
                  </td>
                  <td className="px-3 py-2 text-center">
                    <ToggleSwitch
                      checked={cfg.enabled === true}
                      onChange={checked => handleStatusEnabledToggle(idx, checked)}
                    />
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    );
  }

  const saveStatusConfigs = async (configs: any[]) => {
    // Convert icon component back to string name
    const configsToSave = configs.map(cfg => ({
      ...cfg,
      icon: (Object.keys(ICON_MAP) as (keyof typeof ICON_MAP)[]).find(key => ICON_MAP[key] === cfg.icon) || cfg.icon,
    }));
    await fetch('/api/status-config', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ statuses: configsToSave }),
    });
  };

  const handleStatusEnabledToggle = (idx: number, enabled: boolean) => {
    setStatusConfigs(configs => {
      const updated = configs.map((c, i) =>
        i === idx
          ? enabled
            ? { ...c, enabled }
            : { ...c, enabled, allPages: false, todo: false, goals: false, habit: false }
          : c
      );
      saveStatusConfigs(updated);
      return updated;
    });
  };

  async function handleDeleteConfirmed() {
    if (!deleteConfirm) return;
    if (deleteConfirm.type === 'category') removeCategory(deleteConfirm.idx);
    if (deleteConfirm.type === 'priority') removePriority(deleteConfirm.idx);
    if (deleteConfirm.type === 'goalCategory') removeGoalCategory(deleteConfirm.idx);
    if (deleteConfirm.type === 'subCategory') removeSubCategory(deleteConfirm.idx);
    if (deleteConfirm.type === 'description') removeDescription(deleteConfirm.idx);
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-white flex flex-col items-center py-4">
      <div className="w-full max-w-6xl flex flex-col md:flex-row gap-4">
        {/* Sidebar Navigation */}
        <nav className="md:w-64 w-full md:h-auto flex md:flex-col flex-row bg-white/80 rounded-xl border border-gray-100 shadow-sm md:py-6 py-2 px-2 md:px-0 mb-2 md:mb-0">
          {SIDEBAR_TABS.map(tab => (
            <button
              key={tab.key}
              className={`flex items-center gap-2 md:gap-3 px-3 py-2 md:py-3 rounded-lg text-xs font-semibold transition-all w-full md:w-auto md:justify-start justify-center
                ${activeSidebar === tab.key ? 'bg-green-100 text-green-700 shadow' : 'hover:bg-gray-100 text-gray-500'}`}
              onClick={() => setActiveSidebar(tab.key)}
            >
              <tab.icon className={`w-4 h-4 ${activeSidebar === tab.key ? 'text-green-600' : 'text-gray-400'}`} />
              <span className="hidden md:inline">{tab.label}</span>
            </button>
          ))}
        </nav>
        {/* Main Content Card */}
        <div className="flex-1 bg-white/80 rounded-xl border border-gray-100 shadow-lg p-4 md:p-8 min-h-[350px] flex flex-col justify-start">
          <h1 className="text-base font-bold tracking-wide mb-4 uppercase text-center text-gray-700">
            {SIDEBAR_TABS.find(t => t.key === activeSidebar)?.label}
          </h1>
          {loading && activeSidebar === 'todo' ? (
            <div className="text-center py-10 text-xs text-gray-400">Loading...</div>
          ) : (
            <>
              {error && <div className="text-red-600 mb-2 text-center text-xs">{error}</div>}
              {success && <div className="text-green-600 mb-2 text-center text-xs">{success}</div>}
              {activeSidebar === 'todo' && renderToDoConfig()}
              {activeSidebar === 'goals' && renderGoalsConfig()}
              {activeSidebar === 'status' && renderStatusConfig()}
            </>
          )}
        </div>
      </div>
      {/* Render a modal at the root of the component if deleteConfirm is set: */}
      {deleteConfirm ? (
        <div className="fixed inset-0 flex items-center justify-center bg-black/30 backdrop-blur-sm z-50">
          <div className="bg-white rounded shadow-lg p-6 w-full max-w-xs text-center">
            {deleting ? (<div>Working...</div>) : (<>
              <div className="mb-4">Are you sure you want to delete <span className="font-semibold">{deleteConfirm.type === 'category' ? categories[deleteConfirm.idx] : deleteConfirm.type === 'priority' ? priorities[deleteConfirm.idx] : deleteConfirm.type === 'goalCategory' ? goalCategories[deleteConfirm.idx]?.name : deleteConfirm.type === 'subCategory' ? goalCategories[selectedGoalCatIdx]?.subCategories[deleteConfirm.idx]?.name : goalCategories[selectedGoalCatIdx]?.subCategories[selectedSubCatIdx]?.descriptions[deleteConfirm.idx]}</span> {deleteConfirm.type === 'category' ? 'Category' : deleteConfirm.type === 'priority' ? 'Priority' : deleteConfirm.type === 'goalCategory' ? 'Category' : deleteConfirm.type === 'subCategory' ? 'Sub Category' : 'Description'} from {deleteConfirm.type === 'category' || deleteConfirm.type === 'priority' ? 'To-Do List Configurations' : 'Goals Configurations'}?</div>
              <div className="flex justify-center gap-4">
                <button className="bg-red-500 text-white px-4 py-2 rounded" onClick={async () => { setDeleting(true); await handleDeleteConfirmed(); setDeleting(false); setDeleteConfirm(null); }}>Delete</button>
                <button className="bg-gray-200 px-4 py-2 rounded" onClick={() => setDeleteConfirm(null)}>Cancel</button>
              </div>
            </>)}
          </div>
        </div>
      ) : null}
    </div>
  );
} 