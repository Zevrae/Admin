import React, { useState, useRef, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { Plus, X, ChevronLeft, ChevronRight, ChevronsLeft, ChevronsRight, Calendar } from 'lucide-react';

export const baseInputCls =
  'bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm px-3 text-[12px] text-[var(--theme-text)] font-mono placeholder:text-[rgba(var(--theme-text-rgb),0.2)] focus:outline-none focus:border-[rgba(var(--theme-accent-rgb),0.4)] transition-colors';

export const inputCls = `w-full py-2.5 ${baseInputCls}`;
export const selectCls = `${inputCls} cursor-pointer`;

export function SectionHeader({
  title,
  action,
  onAction,
}: {
  title: string;
  action?: string;
  onAction?: () => void;
}) {
  return (
    <div className="flex items-center justify-between mb-6">
      <h2 className="text-[13px] uppercase tracking-[0.2em] font-sans text-[var(--theme-text)]">{title}</h2>
      {action && (
        <button
          onClick={onAction}
          className="flex items-center gap-2 px-4 py-2 text-[10px] uppercase tracking-[0.15em] font-sans bg-[var(--theme-accent)] text-[var(--theme-bg)] hover:brightness-110 transition-colors duration-200 rounded-sm"
        >
          <Plus size={12} />
          {action}
        </button>
      )}
    </div>
  );
}

export function Badge({
  label,
  variant,
}: {
  label: string;
  variant:
    | 'active'
    | 'inactive'
    | 'draft'
    | 'expired'
    | 'pending'
    | 'paid'
    | 'cod'
    | 'placed'
    | 'processing'
    | 'shipped'
    | 'delivered'
    | 'cancelled'
    | 'failed'
    | 'refunded'
    | 'online'
    | 'Active'
    | 'Expired';
}) {
  const styles: Record<string, string> = {
    active: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    Active: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    inactive: 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.4)] border-[rgba(var(--theme-text-rgb),0.1)]',
    draft: 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.4)] border-[rgba(var(--theme-text-rgb),0.1)]',
    expired: 'bg-red-900/20 text-red-400 border-red-900/30',
    Expired: 'bg-red-900/20 text-red-400 border-red-900/30',
    pending: 'bg-amber-900/20 text-amber-400 border-amber-900/30',
    paid: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    cod: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
    online: 'bg-purple-900/20 text-purple-400 border-purple-900/30',
    placed: 'bg-amber-900/20 text-amber-400 border-amber-900/30',
    processing: 'bg-blue-900/20 text-blue-400 border-blue-900/30',
    shipped: 'bg-purple-900/20 text-purple-400 border-purple-900/30',
    delivered: 'bg-emerald-900/25 text-emerald-400 border-emerald-900/40',
    cancelled: 'bg-red-900/20 text-red-400 border-red-900/30',
    failed: 'bg-red-900/20 text-red-400 border-red-900/30',
    refunded: 'bg-[var(--theme-surface)] text-[rgba(var(--theme-text-rgb),0.4)] border-[rgba(var(--theme-text-rgb),0.1)]',
  };
  return (
    <span className={`px-2 py-0.5 text-[9px] uppercase tracking-wider font-sans rounded-sm border ${styles[variant] || styles.inactive}`}>
      {label}
    </span>
  );
}

export function FormField({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <label className="block text-[10px] uppercase tracking-[0.15em] font-sans text-[rgba(var(--theme-text-rgb),0.5)] mb-2">
        {label}
      </label>
      {children}
    </div>
  );
}

export function Modal({
  title,
  onClose,
  maxWidth = 'max-w-lg',
  children,
}: {
  title: string;
  onClose: () => void;
  maxWidth?: string;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm px-4 py-8"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 16 }}
        transition={{ duration: 0.2 }}
        className={`bg-[var(--theme-surface)] border border-[rgba(var(--theme-text-rgb),0.1)] rounded-sm w-full ${maxWidth} max-h-full flex flex-col`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-6 py-4 border-b border-[rgba(var(--theme-text-rgb),0.1)] flex-shrink-0">
          <h3 className="text-[11px] uppercase tracking-[0.2em] font-sans text-[var(--theme-accent)]">{title}</h3>
          <button
            onClick={onClose}
            className="text-[rgba(var(--theme-text-rgb),0.4)] hover:text-[var(--theme-text)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="p-6 overflow-y-auto flex-1">{children}</div>
      </motion.div>
    </motion.div>
  );
}

export interface PaginationProps {
  currentPage: number; // 1-indexed
  totalPages: number;
  totalItems: number;
  pageSize: number;
  pageSizeOptions?: number[];
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  itemLabel?: string;
}

export function Pagination({
  currentPage,
  totalPages,
  totalItems,
  pageSize,
  pageSizeOptions = [10, 20, 50, 100],
  onPageChange,
  onPageSizeChange,
  itemLabel = 'items',
}: PaginationProps) {
  const safeTotalPages = Math.max(1, totalPages);
  const startItem = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const endItem = Math.min(currentPage * pageSize, totalItems);

  // Generate page numbers with ellipses
  const getPageNumbers = (): (number | 'ellipsis-start' | 'ellipsis-end')[] => {
    if (safeTotalPages <= 7) {
      return Array.from({ length: safeTotalPages }, (_, i) => i + 1);
    }

    if (currentPage <= 4) {
      return [1, 2, 3, 4, 5, 'ellipsis-end', safeTotalPages];
    }

    if (currentPage >= safeTotalPages - 3) {
      return [1, 'ellipsis-start', safeTotalPages - 4, safeTotalPages - 3, safeTotalPages - 2, safeTotalPages - 1, safeTotalPages];
    }

    return [1, 'ellipsis-start', currentPage - 1, currentPage, currentPage + 1, 'ellipsis-end', safeTotalPages];
  };

  const pageNumbers = getPageNumbers();

  return (
    <div className="flex flex-col sm:flex-row items-center justify-between gap-4 px-4 py-3.5 border-t border-[rgba(var(--theme-text-rgb),0.08)] bg-[rgba(var(--theme-bg-rgb),0.3)]">
      {/* Left: Range text & page size selector */}
      <div className="flex flex-wrap items-center gap-3 text-[11px] font-sans text-[rgba(var(--theme-text-rgb),0.5)]">
        <span>
          Showing{' '}
          <span className="font-mono text-[var(--theme-text)] font-semibold">{startItem}</span>
          {'–'}
          <span className="font-mono text-[var(--theme-text)] font-semibold">{endItem}</span>
          {' of '}
          <span className="font-mono text-[var(--theme-text)] font-semibold">{totalItems}</span>
          {' '}{itemLabel}
        </span>

        {onPageSizeChange && (
          <div className="flex items-center gap-2 sm:border-l sm:border-[rgba(var(--theme-text-rgb),0.1)] sm:pl-3">
            <span className="text-[10px] uppercase tracking-wider text-[rgba(var(--theme-text-rgb),0.4)]">Per page:</span>
            <select
              value={pageSize}
              onChange={(e) => onPageSizeChange(Number(e.target.value))}
              aria-label="Items per page"
              className="bg-[var(--theme-bg)] border border-[rgba(var(--theme-text-rgb),0.15)] rounded-sm px-2 py-0.5 text-[11px] font-mono text-[var(--theme-text)] focus:outline-none focus:border-[var(--theme-accent)] transition-colors cursor-pointer"
            >
              {pageSizeOptions.map((opt) => (
                <option key={opt} value={opt} className="bg-[var(--theme-surface)] text-[var(--theme-text)]">
                  {opt}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Right: Page Navigation Controls */}
      <div className="flex items-center gap-1">
        {/* First page button */}
        <button
          type="button"
          onClick={() => onPageChange(1)}
          disabled={currentPage <= 1}
          title="First page"
          aria-label="First page"
          className="p-1.5 rounded-sm border border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:border-[rgba(var(--theme-accent-rgb),0.3)] hover:bg-[rgba(var(--theme-text-rgb),0.03)] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:text-[rgba(var(--theme-text-rgb),0.5)] disabled:hover:border-[rgba(var(--theme-text-rgb),0.1)] transition-colors"
        >
          <ChevronsLeft size={13} />
        </button>

        {/* Previous page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          title="Previous page"
          aria-label="Previous page"
          className="p-1.5 rounded-sm border border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:border-[rgba(var(--theme-accent-rgb),0.3)] hover:bg-[rgba(var(--theme-text-rgb),0.03)] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:text-[rgba(var(--theme-text-rgb),0.5)] disabled:hover:border-[rgba(var(--theme-text-rgb),0.1)] transition-colors"
        >
          <ChevronLeft size={13} />
        </button>

        {/* Page numbers */}
        <div className="flex items-center gap-1 mx-1">
          {pageNumbers.map((p, idx) => {
            if (p === 'ellipsis-start' || p === 'ellipsis-end') {
              return (
                <span
                  key={`${p}-${idx}`}
                  className="px-1 text-[11px] font-mono text-[rgba(var(--theme-text-rgb),0.3)] select-none"
                >
                  •••
                </span>
              );
            }

            const isActive = p === currentPage;
            return (
              <button
                key={p}
                type="button"
                onClick={() => onPageChange(p)}
                aria-current={isActive ? 'page' : undefined}
                className={`min-w-[28px] h-7 px-2 flex items-center justify-center text-[11px] font-mono rounded-sm transition-all duration-150 ${
                  isActive
                    ? 'bg-[var(--theme-accent)] text-[var(--theme-bg)] font-semibold border border-[var(--theme-accent)] shadow-sm'
                    : 'text-[rgba(var(--theme-text-rgb),0.6)] hover:text-[var(--theme-accent)] hover:border-[rgba(var(--theme-accent-rgb),0.3)] hover:bg-[rgba(var(--theme-text-rgb),0.04)] border border-[rgba(var(--theme-text-rgb),0.1)]'
                }`}
              >
                {p}
              </button>
            );
          })}
        </div>

        {/* Next page button */}
        <button
          type="button"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= safeTotalPages}
          title="Next page"
          aria-label="Next page"
          className="p-1.5 rounded-sm border border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:border-[rgba(var(--theme-accent-rgb),0.3)] hover:bg-[rgba(var(--theme-text-rgb),0.03)] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:text-[rgba(var(--theme-text-rgb),0.5)] disabled:hover:border-[rgba(var(--theme-text-rgb),0.1)] transition-colors"
        >
          <ChevronRight size={13} />
        </button>

        {/* Last page button */}
        <button
          type="button"
          onClick={() => onPageChange(safeTotalPages)}
          disabled={currentPage >= safeTotalPages}
          title="Last page"
          aria-label="Last page"
          className="p-1.5 rounded-sm border border-[rgba(var(--theme-text-rgb),0.1)] text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:border-[rgba(var(--theme-accent-rgb),0.3)] hover:bg-[rgba(var(--theme-text-rgb),0.03)] disabled:opacity-25 disabled:cursor-not-allowed disabled:hover:text-[rgba(var(--theme-text-rgb),0.5)] disabled:hover:border-[rgba(var(--theme-text-rgb),0.1)] transition-colors"
        >
          <ChevronsRight size={13} />
        </button>
      </div>
    </div>
  );
}

export interface DatePickerProps {
  value: string; // 'YYYY-MM-DD' or ''
  onChange: (value: string) => void;
  placeholder?: string;
}

export function DatePicker({
  value,
  onChange,
  placeholder = 'Filter by date',
}: DatePickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Parse current selected date or fallback to today for initial calendar month
  const parsedDate = value ? new Date(value + 'T00:00:00') : null;
  const initialYear = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getFullYear() : new Date().getFullYear();
  const initialMonth = parsedDate && !isNaN(parsedDate.getTime()) ? parsedDate.getMonth() : new Date().getMonth();

  const [viewYear, setViewYear] = useState(initialYear);
  const [viewMonth, setViewMonth] = useState(initialMonth);

  // Sync view when value changes
  useEffect(() => {
    if (value) {
      const d = new Date(value + 'T00:00:00');
      if (!isNaN(d.getTime())) {
        setViewYear(d.getFullYear());
        setViewMonth(d.getMonth());
      }
    }
  }, [value]);

  // Close popup on click outside
  useEffect(() => {
    const handleOutsideClick = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    if (isOpen) {
      document.addEventListener('mousedown', handleOutsideClick);
    }
    return () => {
      document.removeEventListener('mousedown', handleOutsideClick);
    };
  }, [isOpen]);

  // Navigate months
  const handlePrevMonth = () => {
    if (viewMonth === 0) {
      setViewMonth(11);
      setViewYear((y) => y - 1);
    } else {
      setViewMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (viewMonth === 11) {
      setViewMonth(0);
      setViewYear((y) => y + 1);
    } else {
      setViewMonth((m) => m + 1);
    }
  };

  // Month names
  const monthNames = [
    'January', 'February', 'March', 'April', 'May', 'June',
    'July', 'August', 'September', 'October', 'November', 'December'
  ];

  // Days in month & first day weekday
  const daysInMonth = new Date(viewYear, viewMonth + 1, 0).getDate();
  const firstDayWeekday = new Date(viewYear, viewMonth, 1).getDay(); // 0 = Sunday

  // Format display label
  const displayLabel = useMemo(() => {
    if (!value) return placeholder;
    const [y, m, d] = value.split('-');
    if (y && m && d) {
      const dateObj = new Date(Number(y), Number(m) - 1, Number(d));
      if (!isNaN(dateObj.getTime())) {
        return dateObj.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
      }
    }
    return value;
  }, [value, placeholder]);

  const selectDay = (day: number) => {
    const mStr = String(viewMonth + 1).padStart(2, '0');
    const dStr = String(day).padStart(2, '0');
    onChange(`${viewYear}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  const selectToday = () => {
    const today = new Date();
    const y = today.getFullYear();
    const mStr = String(today.getMonth() + 1).padStart(2, '0');
    const dStr = String(today.getDate()).padStart(2, '0');
    onChange(`${y}-${mStr}-${dStr}`);
    setIsOpen(false);
  };

  return (
    <div className="relative inline-block" ref={containerRef}>
      {/* Trigger Button */}
      <div
        className={`flex items-center gap-2 px-3 py-2 bg-[var(--theme-surface)] border rounded-sm transition-all duration-150 cursor-pointer ${
          value
            ? 'border-[var(--theme-accent)] text-[var(--theme-accent)] bg-[rgba(var(--theme-accent-rgb),0.08)] shadow-sm'
            : 'border-[rgba(var(--theme-text-rgb),0.12)] text-[rgba(var(--theme-text-rgb),0.6)] hover:border-[rgba(var(--theme-accent-rgb),0.3)] hover:text-[var(--theme-text)]'
        }`}
        onClick={() => setIsOpen(!isOpen)}
      >
        <Calendar size={13} className={value ? 'text-[var(--theme-accent)]' : 'text-[rgba(var(--theme-text-rgb),0.4)]'} />
        <span className="text-[11px] font-mono tracking-wide">{displayLabel}</span>
        {value && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onChange('');
            }}
            className="p-0.5 ml-1 text-[rgba(var(--theme-text-rgb),0.4)] hover:text-red-400 transition-colors rounded-sm"
            title="Clear date filter"
          >
            <X size={12} />
          </button>
        )}
      </div>

      {/* Calendar Popover */}
      {isOpen && (
        <div className="absolute left-0 top-full mt-1.5 z-50 w-64 bg-[#14120e] border border-[rgba(var(--theme-accent-rgb),0.25)] rounded-sm shadow-2xl p-3 text-[var(--theme-text)]">
          {/* Calendar Header */}
          <div className="flex items-center justify-between mb-3 pb-2 border-b border-[rgba(var(--theme-text-rgb),0.08)]">
            <button
              type="button"
              onClick={handlePrevMonth}
              className="p-1 rounded-sm text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-text-rgb),0.05)] transition-colors"
              title="Previous month"
            >
              <ChevronLeft size={14} />
            </button>
            <div className="text-[11px] font-sans uppercase tracking-[0.15em] text-[var(--theme-accent)] font-semibold">
              {monthNames[viewMonth]} {viewYear}
            </div>
            <button
              type="button"
              onClick={handleNextMonth}
              className="p-1 rounded-sm text-[rgba(var(--theme-text-rgb),0.5)] hover:text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-text-rgb),0.05)] transition-colors"
              title="Next month"
            >
              <ChevronRight size={14} />
            </button>
          </div>

          {/* Weekday Labels */}
          <div className="grid grid-cols-7 gap-1 text-center mb-1">
            {['Su', 'Mo', 'Tu', 'We', 'Th', 'Fr', 'Sa'].map((wd) => (
              <span key={wd} className="text-[9px] font-sans font-medium text-[rgba(var(--theme-text-rgb),0.3)]">
                {wd}
              </span>
            ))}
          </div>

          {/* Days Grid */}
          <div className="grid grid-cols-7 gap-1 text-center">
            {/* Empty slots before 1st day of month */}
            {Array.from({ length: firstDayWeekday }).map((_, i) => (
              <div key={`empty-${i}`} className="h-6 w-6" />
            ))}

            {/* Days of current month */}
            {Array.from({ length: daysInMonth }).map((_, i) => {
              const day = i + 1;
              const mStr = String(viewMonth + 1).padStart(2, '0');
              const dStr = String(day).padStart(2, '0');
              const dateString = `${viewYear}-${mStr}-${dStr}`;
              const isSelected = value === dateString;

              const today = new Date();
              const isToday =
                today.getFullYear() === viewYear &&
                today.getMonth() === viewMonth &&
                today.getDate() === day;

              return (
                <button
                  key={day}
                  type="button"
                  onClick={() => selectDay(day)}
                  className={`h-6 w-6 mx-auto flex items-center justify-center text-[10px] font-mono rounded-sm transition-all duration-150 ${
                    isSelected
                      ? 'bg-[var(--theme-accent)] text-[var(--theme-bg)] font-bold shadow-sm'
                      : isToday
                      ? 'border border-[rgba(var(--theme-accent-rgb),0.5)] text-[var(--theme-accent)] hover:bg-[rgba(var(--theme-accent-rgb),0.1)]'
                      : 'text-[rgba(var(--theme-text-rgb),0.7)] hover:bg-[rgba(var(--theme-text-rgb),0.08)] hover:text-[var(--theme-text)]'
                  }`}
                >
                  {day}
                </button>
              );
            })}
          </div>

          {/* Quick Actions Footer */}
          <div className="flex items-center justify-between pt-2.5 mt-2.5 border-t border-[rgba(var(--theme-text-rgb),0.08)] text-[9px] uppercase tracking-wider font-sans">
            <button
              type="button"
              onClick={selectToday}
              className="text-[var(--theme-accent)] hover:underline"
            >
              Today
            </button>
            {value && (
              <button
                type="button"
                onClick={() => {
                  onChange('');
                  setIsOpen(false);
                }}
                className="text-red-400 hover:underline"
              >
                Clear
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}


