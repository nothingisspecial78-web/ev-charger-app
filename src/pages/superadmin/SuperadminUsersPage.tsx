import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';
import { Profile } from '@/types';
import { Users, Shield, User, Phone, Calendar } from 'lucide-react';

export const SuperadminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-16">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold text-[#17231F] tracking-tight">
          Platform User Directory
        </h1>
        <p className="text-sm text-[#66736D] mt-1">
          Review registered driver, host, and administrative accounts.
        </p>
      </div>

      {loading ? (
        <div className="py-12 text-center text-[#66736D] animate-pulse">Loading directory...</div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-subtle">
          {/* Mobile Card View (< 768px) */}
          <div className="block md:hidden divide-y divide-border/80">
            {users.map(u => (
              <div key={u.id} className="p-4 space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 shrink-0 rounded-full bg-[#174D3A] text-white flex items-center justify-center font-bold text-xs">
                      {u.display_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-bold text-[#17231F] text-sm truncate">{u.display_name}</div>
                      <div className="text-[11px] font-mono text-[#66736D] truncate">{u.id}</div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${
                      u.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-800'
                        : u.role === 'admin'
                        ? 'bg-[#EAF3EF] text-[#174D3A]'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {u.role === 'superadmin' && <Shield className="w-3 h-3" />}
                    {u.role.toUpperCase()}
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-[#66736D] pt-1 border-t border-border/40">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C9B94] block">Contact</span>
                    {u.phone ? (
                      <a href={`tel:${u.phone}`} className="flex items-center gap-1 text-[#174D3A] font-medium mt-0.5">
                        <Phone className="w-3 h-3 shrink-0" />
                        <span className="truncate">{u.phone}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400">—</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-[#8C9B94] block">Registered</span>
                    <span className="flex items-center gap-1 mt-0.5">
                      <Calendar className="w-3 h-3 shrink-0" />
                      <span className="truncate">{u.created_at ? new Date(u.created_at).toLocaleDateString() : 'System Seed'}</span>
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Desktop Table View (>= 768px) */}
          <div className="hidden md:block overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="bg-[#F5F7F4] text-[#66736D] text-xs font-bold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-4 px-6">User / Display Name</th>
                  <th className="py-4 px-4">Role</th>
                  <th className="py-4 px-4">Contact</th>
                  <th className="py-4 px-6">Registered</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/80 transition">
                    <td className="py-4 px-6">
                      <div className="font-bold text-[#17231F] flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#174D3A] text-white flex items-center justify-center font-bold text-xs">
                          {u.display_name.charAt(0)}
                        </div>
                        <div>
                          <div>{u.display_name}</div>
                          <div className="text-[11px] font-mono text-[#66736D]">{u.id}</div>
                        </div>
                      </div>
                    </td>
                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold ${
                          u.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-800'
                            : u.role === 'admin'
                            ? 'bg-[#EAF3EF] text-[#174D3A]'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {u.role === 'superadmin' && <Shield className="w-3 h-3" />}
                        {u.role.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-4 px-4 text-xs text-[#66736D]">
                      {u.phone ? (
                        <a href={`tel:${u.phone}`} className="flex items-center gap-1 text-[#174D3A] hover:underline">
                          <Phone className="w-3 h-3 text-[#174D3A]" />
                          {u.phone}
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    <td className="py-4 px-6 text-xs text-[#66736D]">
                      <span className="flex items-center gap-1">
                        <Calendar className="w-3 h-3" />
                        {u.created_at ? new Date(u.created_at).toLocaleDateString() : 'System Seed'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
