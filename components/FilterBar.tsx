"use client";

import { motion } from "framer-motion";
import { Filter, X } from "lucide-react";

interface FilterBarProps {
  months: string[];
  statuses: string[];
  services: string[];
  selectedMonth: string;
  selectedStatus: string;
  selectedService: string;
  onMonthChange: (val: string) => void;
  onStatusChange: (val: string) => void;
  onServiceChange: (val: string) => void;
  onClear: () => void;
}

function SelectFilter({ label, value, options, onChange }: { label: string; value: string; options: string[]; onChange: (v: string) => void }) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-[10px] text-gray-600 font-mono uppercase tracking-wider">{label}</label>
      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="bg-transparent border border-matrix-pink/20 rounded-lg px-3 py-1.5 text-xs font-mono text-gray-300 focus:border-matrix-pink/50 focus:outline-none appearance-none cursor-pointer hover:border-matrix-pink/30 transition-colors"
        style={{ background: "rgba(10,5,20,0.8)" }}
      >
        <option value="">Todos</option>
        {options.map((opt) => (
          <option key={opt} value={opt}>{opt}</option>
        ))}
      </select>
    </div>
  );
}

export default function FilterBar({
  months, statuses, services,
  selectedMonth, selectedStatus, selectedService,
  onMonthChange, onStatusChange, onServiceChange, onClear,
}: FilterBarProps) {
  const hasFilters = selectedMonth || selectedStatus || selectedService;

  return (
    <motion.div
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-panel p-4 flex flex-wrap items-end gap-4"
    >
      <div className="flex items-center gap-2 text-matrix-pink">
        <Filter size={14} />
        <span className="text-xs font-display tracking-wider">FILTROS</span>
      </div>

      <SelectFilter label="Mês" value={selectedMonth} options={months} onChange={onMonthChange} />
      <SelectFilter label="Status" value={selectedStatus} options={statuses} onChange={onStatusChange} />
      <SelectFilter label="Serviço" value={selectedService} options={services} onChange={onServiceChange} />

      {hasFilters && (
        <button
          onClick={onClear}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-matrix-pink transition-colors px-2 py-1.5 rounded border border-transparent hover:border-matrix-pink/20"
        >
          <X size={12} />
          Limpar
        </button>
      )}
    </motion.div>
  );
}
