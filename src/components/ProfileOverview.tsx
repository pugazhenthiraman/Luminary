import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import Avatar from './Avatar';

const ProfileOverview: React.FC = () => {
  const { handleGetProfile, handleLogout } = useAuth();
  const { user } = useAuthStore();
  const [profile, setProfile] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    (async () => {
      setLoading(true);
      const data = await handleGetProfile();
      setProfile(data?.user || data || null);
      setLoading(false);
    })();
  }, []);

  const fullName = `${profile?.firstName ?? user?.firstName ?? ''} ${profile?.lastName ?? user?.lastName ?? ''}`.trim() || 'User';
  const email = profile?.email ?? user?.email ?? '';
  const role = (profile?.role ?? user?.role) as string | undefined;

  const goHome = () => {
    if (role === 'PARENT') navigate('/parent/dashboard');
    else if (role === 'COACH') navigate('/coach/dashboard');
    else if (role === 'ADMIN') navigate('/admin/dashboard');
    else navigate('/');
  };

  const doLogout = async () => {
    await handleLogout();
    if (role === 'PARENT') navigate('/loginParent');
    else if (role === 'COACH') navigate('/loginCoach');
    else if (role === 'ADMIN') navigate('/admin/login');
    else navigate('/login');
  };

  return (
    <div className="min-h-[calc(100vh-64px)] md:min-h-[calc(100vh-80px)] bg-gradient-to-br from-violet-50 via-fuchsia-50 to-rose-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Hero card */}
        <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-200">
          <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 p-6 text-white">
            <div className="flex items-center gap-4">
              <Avatar
                name={fullName}
                imageUrl={(profile?.avatar as string) || (user as any)?.avatar || ''}
                size={56}
                className="ring-2 ring-white/60"
              />
              <div className="min-w-0">
                <div className="text-2xl font-extrabold truncate">{fullName}</div>
                <div className="text-white/90 text-sm truncate">{email}</div>
              </div>
              <div className="ml-auto flex gap-2">
                <button onClick={goHome} className="px-4 py-2 rounded-xl bg-white/15 hover:bg-white/20 text-white text-sm font-semibold backdrop-blur transition">Back to dashboard</button>
                <button onClick={doLogout} className="px-4 py-2 rounded-xl bg-white text-rose-600 hover:bg-rose-50 text-sm font-semibold transition">Logout</button>
              </div>
            </div>
          </div>
          <div className="bg-white p-6">
            {loading ? (
              <div className="text-slate-500">Loading profile…</div>
            ) : (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Role</div>
                    <div className="text-sm font-semibold text-slate-800">{role || '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500">User ID</div>
                    <div className="text-sm font-semibold text-slate-800 break-all">{profile?.id ?? user?.id ?? '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Status</div>
                    <div className="text-sm font-semibold text-emerald-600">Active</div>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500">First name</div>
                    <div className="text-sm font-semibold text-slate-800">{profile?.firstName ?? user?.firstName ?? '—'}</div>
                  </div>
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Last name</div>
                    <div className="text-sm font-semibold text-slate-800">{profile?.lastName ?? user?.lastName ?? '—'}</div>
                  </div>
                </div>

                {role === 'PARENT' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500">Children</div>
                      <div className="text-sm font-semibold text-slate-800">{Array.isArray(profile?.children) ? profile.children.length : '—'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500">Enrollments</div>
                      <div className="text-sm font-semibold text-slate-800">—</div>
                    </div>
                  </div>
                )}

                {role === 'COACH' && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500">Domain</div>
                      <div className="text-sm font-semibold text-slate-800">{profile?.domain || profile?.coach?.domain || '—'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-4">
                      <div className="text-xs text-slate-500">Experience</div>
                      <div className="text-sm font-semibold text-slate-800">{profile?.experience || profile?.coach?.experience || '—'}</div>
                    </div>
                  </div>
                )}

                {role === 'ADMIN' && (
                  <div className="bg-slate-50 rounded-xl p-4">
                    <div className="text-xs text-slate-500">Permissions</div>
                    <div className="text-sm font-semibold text-slate-800">All access</div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
