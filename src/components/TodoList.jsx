import React, { useState } from 'react';
import { CheckCircle2, Circle, Plus, Trash2, ListTodo, AlertCircle } from 'lucide-react';
import { usePrep } from '../context/PrepContext';

export default function TodoList() {
  const { state, addTodo, toggleTodo, deleteTodo } = usePrep();
  const [inputText, setInputText] = useState('');
  const [priority, setPriority] = useState('medium'); // 'high' | 'medium' | 'low'
  const [filter, setFilter] = useState('all'); // 'all' | 'pending' | 'completed'

  const todos = state.todos || [];

  const handleAdd = (e) => {
    e.preventDefault();
    if (!inputText.trim()) return;
    addTodo(inputText, priority);
    setInputText('');
  };

  const filteredTodos = todos.filter((t) => {
    if (filter === 'pending') return !t.completed;
    if (filter === 'completed') return t.completed;
    return true;
  });

  const completedCount = todos.filter((t) => t.completed).length;

  const priorityColor = {
    high: 'text-[#f97316] bg-[#f97316]/10 border-[#f97316]/30',
    medium: 'text-amber-400 bg-amber-400/10 border-amber-400/30',
    low: 'text-zinc-400 bg-zinc-800 border-zinc-700',
  };

  return (
    <div className="sleek-card p-6 space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <ListTodo className="w-4 h-4 text-[#55e357]" />
          <h3 className="font-bold text-white text-sm tracking-tight">Daily Prep To-Do</h3>
        </div>
        <span className="text-[11px] font-mono text-zinc-400">
          <span className="text-[#55e357] font-bold">{completedCount}</span>/{todos.length} done
        </span>
      </div>

      {/* Add To-Do Input Capsule */}
      <form onSubmit={handleAdd} className="space-y-2">
        <div className="flex items-center gap-2 bg-[#14161c] p-1.5 rounded-full border border-white/5">
          <input
            type="text"
            placeholder="Add task (e.g. 50 Optics MCQs, Revise Botany)..."
            value={inputText}
            onChange={(e) => setInputText(e.target.value)}
            className="flex-1 bg-transparent px-3 text-xs text-white placeholder-zinc-500 focus:outline-none"
          />

          {/* Priority Pill */}
          <select
            value={priority}
            onChange={(e) => setPriority(e.target.value)}
            className="bg-[#262a34] text-[10px] font-bold text-zinc-300 rounded-full px-2 py-1 border border-white/5 focus:outline-none cursor-pointer"
          >
            <option value="high" className="bg-[#1a1d24] text-[#f97316]">High</option>
            <option value="medium" className="bg-[#1a1d24] text-amber-300">Med</option>
            <option value="low" className="bg-[#1a1d24] text-zinc-400">Low</option>
          </select>

          <button
            type="submit"
            className="w-7 h-7 rounded-full bg-[#55e357] text-black flex items-center justify-center font-bold hover:bg-[#42ca44] transition shadow-glow-lime flex-shrink-0"
            title="Add task"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </form>

      {/* Filter Tabs */}
      <div className="flex items-center justify-between text-[11px] pt-1 border-b border-white/5 pb-2">
        <div className="flex items-center gap-2">
          <button
            onClick={() => setFilter('all')}
            className={`font-semibold transition ${
              filter === 'all' ? 'text-[#55e357]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            All ({todos.length})
          </button>
          <span className="text-zinc-700">•</span>
          <button
            onClick={() => setFilter('pending')}
            className={`font-semibold transition ${
              filter === 'pending' ? 'text-[#55e357]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Active ({todos.length - completedCount})
          </button>
          <span className="text-zinc-700">•</span>
          <button
            onClick={() => setFilter('completed')}
            className={`font-semibold transition ${
              filter === 'completed' ? 'text-[#55e357]' : 'text-zinc-500 hover:text-zinc-300'
            }`}
          >
            Done ({completedCount})
          </button>
        </div>
      </div>

      {/* Tasks List */}
      {filteredTodos.length === 0 ? (
        <div className="text-center py-6 text-xs text-zinc-500">
          No tasks found. Add a study goal above!
        </div>
      ) : (
        <div className="space-y-2 max-h-64 overflow-y-auto pr-1">
          {filteredTodos.map((todo) => (
            <div
              key={todo.id}
              className={`p-3 rounded-2xl border transition-all flex items-center justify-between gap-2.5 group ${
                todo.completed
                  ? 'bg-[#14161c]/50 border-white/[0.02] opacity-60'
                  : 'bg-[#14161c] border-white/5 hover:border-white/10'
              }`}
            >
              <button
                onClick={() => toggleTodo(todo.id)}
                className="flex items-center gap-2.5 text-left flex-1 min-w-0"
              >
                {todo.completed ? (
                  <CheckCircle2 className="w-4 h-4 text-[#55e357] flex-shrink-0" />
                ) : (
                  <Circle className="w-4 h-4 text-zinc-500 group-hover:text-zinc-300 flex-shrink-0" />
                )}
                <span
                  className={`text-xs font-medium truncate ${
                    todo.completed ? 'line-through text-zinc-500' : 'text-white'
                  }`}
                >
                  {todo.text}
                </span>
              </button>

              <div className="flex items-center gap-2 flex-shrink-0">
                <span
                  className={`text-[9px] uppercase font-bold px-2 py-0.5 rounded-full border ${
                    priorityColor[todo.priority] || priorityColor.medium
                  }`}
                >
                  {todo.priority}
                </span>

                <button
                  onClick={() => deleteTodo(todo.id)}
                  className="opacity-0 group-hover:opacity-100 p-1 text-zinc-500 hover:text-rose-400 transition"
                  title="Delete task"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
