import React, { useState, useEffect } from 'react';
import { DataService } from '@/services/dataService';
import { Profile } from '@/types';
import { Users, Shield, User, Phone, Calendar, Sparkles } from 'lucide-react';

export const SuperadminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<Profile[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    DataService.getAllUsers()
      .then(setUsers)
      .finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-6 pb-20">
      <div>
        <div className="flex items-center gap-2 text-xs font-extrabold text-primary uppercase tracking-wider mb-1">
          <Users className="w-4 h-4 text-primary" />
          <span>User Directory</span>
        </div>
        <h1 className="text-3xl font-extrabold text-foreground tracking-tight">
          Platform User Directory
        </h1>
        <p className="text-xs sm:text-sm text-muted mt-1 font-medium">
          Review registered driver, host, and administrative accounts with contact information and roles.
        </p>
      </div>

      {loading ? (
        <div className="py-16 text-center text-xs sm:text-sm text-muted animate-pulse">
          <div className="w-10 h-10 border-[3px] border-primary border-t-transparent rounded-full animate-spin mx-auto mb-3"></div>
          <span>Loading platform user records...</span>
        </div>
      ) : (
        <div className="bg-white rounded-3xl border border-border overflow-hidden shadow-card">
          {/* Mobile Card View (< 768px) */}
          <div className="block md:hidden divide-y divide-border/80">
            {users.map(u => (
              <div key={u.id} className="p-5 space-y-3.5">
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-10 h-10 shrink-0 rounded-2xl bg-primary text-white flex items-center justify-center font-bold text-sm shadow-xs">
                      {u.display_name.charAt(0)}
                    </div>
                    <div className="min-w-0">
                      <div className="font-extrabold text-foreground text-base truncate">{u.display_name}</div>
                      <div className="text-[11px] font-mono text-muted truncate">ID: {u.id.slice(0, 8)}</div>
                    </div>
                  </div>
                  <span
                    className={`shrink-0 inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                      u.role === 'superadmin'
                        ? 'bg-purple-100 text-purple-900 border border-purple-200'
                        : u.role === 'admin'
                        ? 'bg-primary-50 text-primary border border-primary-200'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {u.role === 'superadmin' && <Shield className="w-3.5 h-3.5" />}
                    <span>{u.role === 'admin' ? 'HOST' : u.role.toUpperCase()}</span>
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs text-muted pt-2 border-t border-border/60">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Direct Phone</span>
                    {u.phone ? (
                      <a href={`tel:${u.phone}`} className="flex items-center gap-1.5 text-primary font-bold mt-0.5">
                        <Phone className="w-3.5 h-3.5 shrink-0" />
                        <span className="truncate">{u.phone}</span>
                      </a>
                    ) : (
                      <span className="text-gray-400 mt-0.5 block">—</span>
                    )}
                  </div>
                  <div>
                    <span className="text-[10px] uppercase font-bold text-muted block">Account Created</span>
                    <span className="flex items-center gap-1.5 mt-0.5 font-medium text-foreground">
                      <Calendar className="w-3.5 h-3.5 shrink-0 text-primary" />
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
              <thead className="bg-background text-muted text-xs font-extrabold uppercase tracking-wider border-b border-border">
                <tr>
                  <th className="py-4 px-6">User / Display Name</th>
                  <th className="py-4 px-4">Role Classification</th>
                  <th className="py-4 px-4">Contact Phone</th>
                  <th className="py-4 px-6">Account Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border/80">
                {users.map(u => (
                  <tr key={u.id} className="hover:bg-gray-50/70 transition">
                    <td className="py-4 px-6">
                      <div className="font-extrabold text-foreground flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl bg-primary text-accent flex items-center justify-center font-bold text-xs shadow-2xs">
                          {u.display_name.charAt(0)}
                        </div>
                        <div>
                          <div>{u.display_name}</div>
                          <div className="text-[11px] font-mono text-muted font-normal">{u.id}</div>
                        </div>
                      </div>
                    </td>

                    <td className="py-4 px-4">
                      <span
                        className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold ${
                          u.role === 'superadmin'
                            ? 'bg-purple-100 text-purple-900 border border-purple-200'
                            : u.role === 'admin'
                            ? 'bg-primary-50 text-primary border border-primary-200'
                            : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {u.role === 'superadmin' && <Shield className="w-3.5 h-3.5" />}
                        <span>{u.role === 'admin' ? 'HOST' : u.role.toUpperCase()}</span>
                      </span>
                    </td>

                    <td className="py-4 px-4 font-bold text-primary">
                      {u.phone ? (
                        <a href={`tel:${u.phone}`} className="hover:underline flex items-center gap-1.5">
                          <Phone className="w-3.5 h-3.5" />
                          <span>{u.phone}</span>
                        </a>
                      ) : (
                        <span className="text-gray-400 font-normal">—</span>
                      )}
                    </td>

                    <td className="py-4 px-6 text-xs text-muted font-medium">
                      {u.created_at ? new Date(u.created_at).toLocaleDateString([], { dateStyle: 'medium' }) : 'Verified Profile'}
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
