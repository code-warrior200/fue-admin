/* eslint-disable @typescript-eslint/no-unused-vars */
'use client';

import { useRouter } from 'next/navigation';
import { clearToken } from '@/lib/api';
import {
  LogOut,
  LayoutDashboard,
  Users,
  UserPlus,
  BarChart3,
  Menu,
  X,
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AdminSidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleSignOut = () => {
    if (confirm('Sign out of the admin dashboard?')) {
      clearToken();
      router.push('/');
    }
  };

  const menuItems = [
    { name: 'Dashboard', icon: LayoutDashboard, onClick: () => router.push('/dashboard') },
    { name: 'Candidates', icon: UserPlus, onClick: () => router.push('/dashboard/candidates') },
    { name: 'Summary', icon: BarChart3, onClick: () => router.push('/dashboard/summary') },
  ];

  const SidebarContent = (
    <div className="flex flex-col h-full justify-between">
      {/* Logo / Title */}
      <div className="flex items-center justify-between p-5">
        <h1
          className={`font-bold text-xl text-gray-800 dark:text-gray-100 transition-opacity duration-200 ${
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}
        >
          🎓 FUE-Admin
        </h1>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-700 hidden md:block"
          aria-label="Toggle sidebar"
        >
          {collapsed ? '➡️' : '⬅️'}
        </button>
      </div>

      {/* Menu Items */}
      <nav className="flex-1 mt-6 space-y-1 px-3">
        {menuItems.map(({ name, icon: Icon, onClick }) => (
          <button
            key={name}
            onClick={onClick}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg 
              text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800 
              transition-colors duration-150`}
          >
            <Icon className="w-5 h-5 shrink-0" />
            {!collapsed && <span className="text-sm font-medium">{name}</span>}
          </button>
        ))}
      </nav>

      {/* Footer / Logout */}
      <div className="border-t border-gray-200 dark:border-gray-700 p-4">
        <button
          onClick={handleSignOut}
          className="w-full flex items-center gap-3 px-4 py-3 rounded-lg 
            text-red-600 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors duration-150"
        >
          <LogOut className="w-5 h-5" />
          {!collapsed && <span className="text-sm font-medium">Sign Out</span>}
        </button>
      </div>
    </div>
  );

  return (
    <>
      {/* Mobile Hamburger */}
      <div className="md:hidden fixed top-4 left-4 z-50">
        <button
          onClick={() => setMobileOpen(true)}
          className="p-2 rounded bg-white dark:bg-gray-900 shadow-md"
          aria-label="Open sidebar"
        >
          <Menu className="w-6 h-6 text-gray-800 dark:text-gray-100" />
        </button>
      </div>

      {/* Desktop Sidebar */}
      <motion.aside
        initial={{ x: -200, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        transition={{ duration: 0.4 }}
        className={`hidden md:flex h-screen fixed top-0 left-0 z-40 flex-col justify-between 
          bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700
          transition-all duration-300 ease-in-out ${collapsed ? 'w-20' : 'w-64'}`}
      >
        {SidebarContent}
      </motion.aside>

      {/* Mobile Sidebar Overlay */}
      {mobileOpen && (
        <motion.div
          initial={{ x: '-100%' }}
          animate={{ x: 0 }}
          exit={{ x: '-100%' }}
          transition={{ duration: 0.3 }}
          className="fixed inset-0 z-50 flex bg-white dark:bg-gray-900 shadow-lg w-64 flex-col"
        >
          <div className="flex items-center justify-between p-5 border-b border-gray-200 dark:border-gray-700">
            <button
              onClick={() => setMobileOpen(false)}
              aria-label="Close sidebar"
              className="text-gray-500 dark:text-gray-300 hover:text-gray-700"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          {SidebarContent}
        </motion.div>
      )}

      {/* Mobile overlay backdrop */}
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-black/30 z-40"
          onClick={() => setMobileOpen(false)}
        ></div>
      )}
    </>
  );
}
