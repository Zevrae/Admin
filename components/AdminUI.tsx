import React from 'react';
import { motion } from 'motion/react';
import { Plus, X } from 'lucide-react';

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
