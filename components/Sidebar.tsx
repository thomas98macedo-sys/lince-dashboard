"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BarChart3,
  TrendingUp,
  Lightbulb,
  DollarSign,
  Trophy,
  ChevronLeft,
  ChevronRight,
  Menu,
  X,
  Zap,
} from "lucide-react";

const navItems = [
  { id: "overview", label: "Overview", icon: LayoutDashboard },
  { id: "vendas", label: "Vendas & Churning", icon: Users },
  { id: "painel", label: "Painel KPIs", icon: BarChart3 },
  { id: "performance", label: "Performance", icon: TrendingUp },
  { id: "financeiro", label: "Financeiro", icon: DollarSign },
  { id: "insights", label: "Insights", icon: Lightbulb },
  { id: "ranking", label: "Ranking Vendas", icon: Trophy },
];

interface SidebarProps {
  activePage: string;
  onNavigate: (page: string) => void;
}

export default function Sidebar({ activePage, onNavigate }: SidebarProps) {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleNav = (id: string) => {
    onNavigate(id);
    setMobileOpen(false);
  };

  const sidebarContent = (
    <>
      {/* Logo */}
      <div className="p-4 flex items-center gap-3 border-b border-matrix-pink/10 min-h-[64px]">
        <div className="w-8 h-8 rounded-lg bg-matrix-pink/20 border border-matrix-pink/40 flex items-center justify-center flex-shrink-0">
          <Zap size={16} className="text-matrix-pink" />
        </div>
        <AnimatePresence>
          {!collapsed && (
            <motion.span
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -10 }}
              className="font-display text-sm text-matrix-pink font-bold tracking-wider whitespace-nowrap"
            >
              LINCE
            </motion.span>
          )}
        </AnimatePresence>
        {/* Mobile close */}
        <button
          onClick={() => setMobileOpen(false)}
          className="ml-auto lg:hidden text-gray-500 hover:text-matrix-pink"
        >
          <X size={18} />
        </button>
      </div>

      {/* Nav Items */}
      <nav className="flex-1 py-4 px-2 space-y-1 overflow-y-auto">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activePage === item.id;
          return (
            <button
              key={item.id}
              onClick={() => handleNav(item.id)}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all duration-200 group relative ${
                isActive
                  ? "bg-matrix-pink/15 text-matrix-pink"
                  : "text-gray-500 hover:text-gray-300 hover:bg-white/[0.03]"
              }`}
            >
              {isActive && (
                <motion.div
                  layoutId="sidebar-active"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-6 rounded-r-full bg-matrix-pink"
                  style={{ boxShadow: "0 0 8px #ff0088" }}
                />
              )}
              <Icon size={18} className="flex-shrink-0" />
              <AnimatePresence>
                {!collapsed && (
                  <motion.span
                    initial={{ opacity: 0, x: -5 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: -5 }}
                    className="text-sm font-mono whitespace-nowrap"
                  >
                    {item.label}
                  </motion.span>
                )}
              </AnimatePresence>
            </button>
          );
        })}
      </nav>

      {/* Collapse Toggle - desktop only */}
      <div className="p-3 border-t border-matrix-pink/10 hidden lg:block">
        <button
          onClick={() => setCollapsed(!collapsed)}
          className="w-full flex items-center justify-center p-2 rounded-lg text-gray-600 hover:text-matrix-pink hover:bg-matrix-pink/5 transition-colors"
        >
          {collapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
        </button>
      </div>
    </>
  );

  return (
    <>
      {/* Mobile hamburger */}
      <button
        onClick={() => setMobileOpen(true)}
        className="fixed top-4 left-4 z-50 lg:hidden p-2 rounded-lg bg-matrix-pink/10 border border-matrix-pink/30 text-matrix-pink"
      >
        <Menu size={20} />
      </button>

      {/* Mobile overlay */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setMobileOpen(false)}
            className="fixed inset-0 z-40 bg-black/70 lg:hidden"
          />
        )}
      </AnimatePresence>

      {/* Mobile sidebar */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.aside
            initial={{ x: -280 }}
            animate={{ x: 0 }}
            exit={{ x: -280 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed left-0 top-0 h-screen z-50 w-[240px] flex flex-col border-r border-matrix-pink/10 lg:hidden"
            style={{ background: "linear-gradient(180deg, rgba(5,0,15,0.98), rgba(10,5,20,0.98))" }}
          >
            {sidebarContent}
          </motion.aside>
        )}
      </AnimatePresence>

      {/* Desktop sidebar */}
      <motion.aside
        animate={{ width: collapsed ? 72 : 240 }}
        transition={{ duration: 0.3 }}
        className="fixed left-0 top-0 h-screen z-40 hidden lg:flex flex-col border-r border-matrix-pink/10"
        style={{ background: "linear-gradient(180deg, rgba(5,0,15,0.95), rgba(10,5,20,0.95))" }}
      >
        {sidebarContent}
      </motion.aside>
    </>
  );
}
