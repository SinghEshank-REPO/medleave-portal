'use client';

import { useState, useEffect } from 'react';
import NavbarFrame from '@/components/NavbarFrame';
import { api } from '@/lib/api';
import { Users, Mail, Shield, Calendar } from 'lucide-react';

export default function AdminUsersPage() {
  const [users, setUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    async function loadData() {
      try {
        const list = await api.getUsers();
        setUsers(list);
      } catch (err: any) {
        console.error(err);
        setError('Failed to fetch user list.');
      } finally {
        setLoading(false);
      }
    }
    loadData();
  }, []);

  const getRoleBadge = (role: string) => {
    const rolesMap: Record<string, string> = {
      ADMIN: 'bg-red-500/10 text-red-400 border-red-500/20',
      MED_OFFICER: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
      WARDEN: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
      ADVISOR: 'bg-purple-500/10 text-purple-400 border-purple-500/20',
      HOD: 'bg-pink-500/10 text-pink-400 border-pink-500/20',
      FACULTY: 'bg-blue-500/10 text-blue-400 border-blue-500/20',
      STUDENT: 'bg-slate-500/10 text-slate-400 border-slate-500/20',
    };
    return (
      <span className={`px-2 py-0.5 rounded-full border text-[9px] font-bold uppercase ${rolesMap[role] || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
        {role.replace(/_/g, ' ')}
      </span>
    );
  };

  return (
    <NavbarFrame>
      <div className="space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-white tracking-tight">System Users Management</h1>
          <p className="text-slate-400 text-xs mt-1">Audit active student profiles, warden allocations, and academic faculty roles</p>
        </div>

        {error && (
          <div className="p-4 rounded-xl bg-red-500/10 border border-red-500/20 text-red-400 text-xs">
            {error}
          </div>
        )}

        {/* Users Table */}
        <div className="glass-panel p-6 rounded-2xl border border-white/5">
          <div className="flex items-center gap-2 mb-6 text-left">
            <Users className="w-5 h-5 text-medical-400" />
            <h2 className="font-bold text-white text-base">Registered System Users ({users.length})</h2>
          </div>

          {loading ? (
            <div className="py-12 text-center text-slate-500 text-xs">Loading accounts database...</div>
          ) : users.length === 0 ? (
            <div className="py-12 text-center text-slate-500 text-xs">No registered users located.</div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold">
                    <th className="pb-3 pl-4">Full Name</th>
                    <th className="pb-3">Email Address</th>
                    <th className="pb-3">System Role</th>
                    <th className="pb-3">Created On</th>
                    <th className="pb-3 pr-4 text-right">Account ID</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  {users.map((u) => (
                    <tr key={u.id} className="hover:bg-slate-800/20 transition">
                      <td className="py-4 pl-4 font-bold text-white">{u.name}</td>
                      <td className="py-4 text-slate-400 font-mono flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> {u.email}</td>
                      <td className="py-4">{getRoleBadge(u.role)}</td>
                      <td className="py-4 text-slate-400 flex items-center gap-1.5"><Calendar className="w-3.5 h-3.5" /> {new Date(u.createdAt).toLocaleDateString()}</td>
                      <td className="py-4 pr-4 text-right font-mono text-slate-500">#{u.id.substring(0, 13)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </NavbarFrame>
  );
}
