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
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useState } from 'react';

export default function AdminSidebar() {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(false);

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

  return (
    <motion.aside
      initial={{ x: -200, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      transition={{ duration: 0.4 }}
      className={`h-screen fixed top-0 left-0 z-40 flex flex-col justify-between 
        bg-white dark:bg-gray-900 shadow-lg border-r border-gray-200 dark:border-gray-700
        transition-all duration-300 ease-in-out
        ${collapsed ? 'w-20' : 'w-64'}`}
    >
      {/* Logo / Title */}
      <div className="flex items-center justify-between p-5">
        <h1
          className={`font-bold text-xl text-gray-800 dark:text-gray-100 transition-opacity duration-200 ${
            collapsed ? 'opacity-0 w-0 overflow-hidden' : 'opacity-100'
          }`}
        >
          🎓 Student Voting
        </h1>

        <button
          onClick={() => setCollapsed(!collapsed)}
          className="text-gray-500 dark:text-gray-300 hover:text-gray-700"
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
    </motion.aside>
  );
}
