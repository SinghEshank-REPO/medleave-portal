'use client';

import { useState, useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { 
  Activity, Bell, LogOut, Moon, Sun, LayoutDashboard, 
  FilePlus, ClipboardCheck, Users, ScrollText, CheckSquare, 
  Menu, X, ChevronRight, User as UserIcon
} from 'lucide-react';

interface NavbarFrameProps {
  children: React.ReactNode;
}

export default function NavbarFrame({ children }: NavbarFrameProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [user, setUser] = useState<any>(null);
  const [notifications, setNotifications] = useState<any[]>([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [darkMode, setDarkMode] = useState(true);

  // Fetch current user details
  useEffect(() => {
    async function loadUser() {
      try {
        const profile = await api.me();
        setUser(profile);
      } catch (err) {
        console.error('Failed to load profile, redirecting to login:', err);
        router.push('/login');
      }
    }
    loadUser();
  }, [router]);

  // Load and poll notifications
  useEffect(() => {
    if (!user) return;
    
    async function loadNotifications() {
      try {
        const list = await api.getNotifications();
        setNotifications(list);
      } catch (err) {
        console.error('Failed to fetch notifications:', err);
      }
    }

    loadNotifications();
    const interval = setInterval(loadNotifications, 10000); // poll every 10 seconds
    return () => clearInterval(interval);
  }, [user]);

  // Handle logout
  const handleLogout = () => {
    api.logout();
    router.push('/login');
  };

  // Toggle Dark Mode (Manipulate HTML element class list)
  const toggleDarkMode = () => {
    const html = document.documentElement;
    if (darkMode) {
      html.classList.remove('dark');
    } else {
      html.classList.add('dark');
    }
    setDarkMode(!darkMode);
  };

  const markRead = async (id: string) => {
    try {
      await api.markNotificationRead(id);
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, isRead: true } : n)
      );
    } catch (err) {
      console.error(err);
    }
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#0f172a] text-white">
        <div className="flex flex-col items-center gap-3">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-medical-500 to-indigo-500 flex items-center justify-center animate-pulse glow-medical">
            <Activity className="w-6 h-6" />
          </div>
          <span className="text-sm font-semibold text-slate-400">Loading Portal context...</span>
        </div>
      </div>
    );
  }

  // Determine sidebar navigation links based on user role
  const getNavLinks = () => {
    const role = user.role;
    const links = [];

    if (role === 'STUDENT') {
      links.push(
        { name: 'Dashboard', href: '/student/dashboard', icon: LayoutDashboard },
        { name: 'Apply Leave', href: '/student/apply', icon: FilePlus }
      );
    } else if (role === 'FACULTY') {
      links.push(
        { name: 'Approvals Queue', href: '/approver/dashboard', icon: ClipboardCheck },
        { name: 'Condonations', href: '/faculty/dashboard', icon: CheckSquare }
      );
    } else if (role === 'ADMIN') {
      links.push(
        { name: 'Dashboard', href: '/admin/dashboard', icon: LayoutDashboard },
        { name: 'Users', href: '/admin/users', icon: Users },
        { name: 'Audit Logs', href: '/admin/audit', icon: ScrollText }
      );
    } else {
      // HOD, WARDEN, MED_OFFICER
      links.push(
        { name: 'Approvals Queue', href: '/approver/dashboard', icon: ClipboardCheck }
      );
    }
    return links;
  };

  const navLinks = getNavLinks();
  const unreadCount = notifications.filter(n => !n.isRead).length;

  return (
    <div className={`min-h-screen ${darkMode ? 'dark text-slate-100 bg-[#0f172a]' : 'bg-slate-50 text-slate-900'} transition-colors duration-300`}>
      {/* Top Banner Grid background */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#8080800a_1px,transparent_1px),linear-gradient(to_bottom,#8080800a_1px,transparent_1px)] bg-[size:14px_24px] pointer-events-none" />

      {/* Header */}
      <header className="fixed top-0 left-0 right-0 h-16 glass-panel border-b border-white/5 flex items-center justify-between px-6 z-40 transition-colors">
        <div className="flex items-center gap-3">
          <button
            onClick={() => setSidebarOpen(!sidebarOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-slate-800/40 text-slate-400"
          >
            {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
          
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-medical-500 to-indigo-500 flex items-center justify-center glow-medical">
              <Activity className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="font-bold text-base bg-gradient-to-r from-white via-slate-300 to-medical-400 bg-clip-text text-transparent hidden sm:inline-block">
              MedLeave Portal
            </span>
          </div>
        </div>

        <div className="flex items-center gap-4">
          {/* Theme Toggle */}
          <button
            onClick={toggleDarkMode}
            className="p-2 rounded-xl border border-white/5 hover:bg-slate-800/40 text-slate-400 transition"
            title="Toggle theme"
          >
            {darkMode ? <Sun className="w-4 h-4 text-amber-400" /> : <Moon className="w-4 h-4" />}
          </button>

          {/* Notifications Center */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 rounded-xl border border-white/5 hover:bg-slate-800/40 text-slate-400 transition relative"
            >
              <Bell className="w-4.5 h-4.5" />
              {unreadCount > 0 && (
                <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full ring-2 ring-[#0a0f1d]" />
              )}
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-3 w-80 glass-panel border border-white/10 rounded-2xl shadow-xl py-3 z-50 text-xs max-h-96 overflow-y-auto">
                <div className="px-4 pb-2 border-b border-white/5 flex items-center justify-between font-semibold">
                  <span className="text-white">Notifications</span>
                  {unreadCount > 0 && <span className="text-red-400">{unreadCount} unread</span>}
                </div>
                <div className="divide-y divide-white/5">
                  {notifications.length === 0 ? (
                    <div className="px-4 py-6 text-center text-slate-500">No notifications yet</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n.id}
                        onClick={() => markRead(n.id)}
                        className={`p-3 hover:bg-slate-800/30 transition cursor-pointer flex flex-col gap-1 ${!n.isRead ? 'bg-medical-500/5' : ''}`}
                      >
                        <p className="text-slate-200 leading-normal">{n.message}</p>
                        <span className="text-[10px] text-slate-500">{new Date(n.createdAt).toLocaleTimeString()}</span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User profile capsule */}
          <div className="flex items-center gap-3 pl-3 border-l border-white/10">
            <div className="w-8 h-8 rounded-full bg-medical-500/20 text-medical-400 flex items-center justify-center font-bold text-xs border border-medical-500/30">
              {user.name.charAt(0)}
            </div>
            <div className="hidden md:flex flex-col text-left">
              <span className="text-xs font-semibold text-white leading-none mb-0.5">{user.name}</span>
              <span className="text-[10px] text-slate-500 font-medium tracking-wide uppercase">{user.role}</span>
            </div>
            <button
              onClick={handleLogout}
              className="p-2 rounded-lg text-slate-500 hover:text-red-400 transition"
              title="Sign Out"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </header>

      {/* Main Layout Grid */}
      <div className="pt-16 min-h-screen flex">
        {/* Sidebar Nav */}
        <aside className={`fixed md:sticky top-16 bottom-0 left-0 w-64 glass-panel border-r border-white/5 md:block transform transition-transform duration-300 z-30 ${sidebarOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}`}>
          <div className="flex flex-col justify-between h-[calc(100vh-4rem)] p-4">
            <div className="space-y-6">
              {/* Profile card summary */}
              <div className="p-4 rounded-xl bg-slate-900/40 border border-white/5 flex items-center gap-3">
                <div className="w-10 h-10 rounded-lg bg-medical-500/10 flex items-center justify-center text-medical-400">
                  <UserIcon className="w-5 h-5" />
                </div>
                <div className="text-left overflow-hidden">
                  <p className="text-xs font-bold text-white truncate leading-none mb-1">{user.name}</p>
                  <p className="text-[10px] text-slate-500 font-semibold truncate uppercase">{user.role.replace(/_/g, ' ')}</p>
                </div>
              </div>

              {/* Sidebar Links */}
              <nav className="space-y-1.5">
                {navLinks.map((link) => {
                  const LinkIcon = link.icon;
                  const isActive = pathname === link.href;
                  return (
                    <Link
                      key={link.name}
                      href={link.href}
                      onClick={() => setSidebarOpen(false)}
                      className={`flex items-center justify-between px-4 py-3 rounded-xl transition text-xs font-semibold ${isActive ? 'bg-gradient-to-r from-medical-600/20 to-indigo-600/10 border-l-4 border-medical-500 text-medical-400' : 'text-slate-400 hover:bg-slate-800/30 hover:text-white'}`}
                    >
                      <div className="flex items-center gap-3">
                        <LinkIcon className="w-4.5 h-4.5" />
                        <span>{link.name}</span>
                      </div>
                      <ChevronRight className={`w-3.5 h-3.5 opacity-50 ${isActive ? 'inline-block' : 'hidden'}`} />
                    </Link>
                  );
                })}
              </nav>
            </div>

            {/* Logout button bottom */}
            <button
              onClick={handleLogout}
              className="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-500 hover:bg-red-500/10 hover:text-red-400 transition text-xs font-semibold text-left w-full"
            >
              <LogOut className="w-4.5 h-4.5" />
              <span>Log Out</span>
            </button>
          </div>
        </aside>

        {/* Content Area */}
        <main className="flex-1 p-6 relative z-10 max-w-7xl mx-auto overflow-x-hidden">
          {children}
        </main>
      </div>
    </div>
  );
}
