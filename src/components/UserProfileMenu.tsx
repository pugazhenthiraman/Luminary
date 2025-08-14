import React, { useEffect, useRef, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import { useAuthStore } from '../stores/useAuthStore';
import Avatar from './Avatar';
import { FaChevronDown, FaSignOutAlt, FaUserCircle } from 'react-icons/fa';

type Profile = {
  id?: string;
  email?: string;
  firstName?: string;
  lastName?: string;
  role?: 'ADMIN' | 'COACH' | 'PARENT' | string;
  avatar?: string | null;
};

const roleLabel = (r?: string) =>
  r === 'ADMIN' ? 'Admin' : r === 'COACH' ? 'Coach' : r === 'PARENT' ? 'Parent' : (r || 'User');

type UserProfileMenuProps = {
  // When set to 'icon', show the legacy profile icon as the trigger; otherwise show avatar+name.
  triggerVariant?: 'icon' | 'default';
};

const UserProfileMenu: React.FC<UserProfileMenuProps> = ({ triggerVariant = 'default' }) => {
  const { handleGetProfile, handleLogout } = useAuth();
  const { user } = useAuthStore();
  const navigate = useNavigate();
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [loading, setLoading] = useState(false);
  const loadedOnceRef = useRef(false);

  // Close on route change or outside click
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    function onDocClick(e: MouseEvent) {
      const target = e.target as HTMLElement;
      if (target.closest('#user-profile-menu')) return;
      setOpen(false);
    }
    if (open) document.addEventListener('click', onDocClick);
    return () => document.removeEventListener('click', onDocClick);
  }, [open]);

  // Prevent background scroll when the menu is open (helps on mobile sheet)
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => { document.body.style.overflow = prev; };
  }, [open]);

  const fetchProfile = async () => {
    if (loadedOnceRef.current) return;
    setLoading(true);
    const data = await handleGetProfile();
    setLoading(false);
    if (data) {
      setProfile(data.user || data);
      loadedOnceRef.current = true;
    }
  };

  const onToggle = async () => {
    const newOpen = !open;
    setOpen(newOpen);
    if (newOpen) await fetchProfile();
  };

  const doLogout = async () => {
    const roleNow = (profile?.role || user?.role) as string | undefined;
    await handleLogout();
    // Redirect per role
    if (roleNow === 'PARENT') navigate('/loginParent');
    else if (roleNow === 'COACH') navigate('/loginCoach');
    else if (roleNow === 'ADMIN') navigate('/loginAdmin');
    else navigate('/login');
    setOpen(false);
  };

  const fullName = `${profile?.firstName ?? user?.firstName ?? ''} ${profile?.lastName ?? user?.lastName ?? ''}`.trim() || 'User';
  const email = profile?.email ?? user?.email ?? '';
  const role = (profile?.role ?? user?.role) as string | undefined;

  return (
    <div id="user-profile-menu" className="relative">
    {triggerVariant === 'icon' ? (
        <button
          onClick={onToggle}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          aria-haspopup="menu"
          aria-expanded={open}
          title="Profile"
        >
      {/* Legacy profile icon trigger (FaUserCircle) */}
      <FaUserCircle className="w-7 h-7 text-gray-700" />
        </button>
      ) : (
        <button
          onClick={onToggle}
          className="flex items-center gap-2 px-2 py-1.5 rounded-xl border border-gray-200 hover:border-gray-300 bg-white shadow-sm/0 hover:shadow-sm transition-all"
          aria-haspopup="menu"
          aria-expanded={open}
        >
          <div className="relative">
            <Avatar
              name={fullName}
              imageUrl={(profile?.avatar as string) || (user as any)?.avatar || ''}
              size={34}
              className="ring-2 ring-violet-300/60"
            />
            <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white"></span>
          </div>
          <div className="hidden md:flex flex-col text-left leading-tight">
            <span className="text-sm font-semibold text-slate-800">{fullName}</span>
            <span className="text-[11px] text-slate-500">{roleLabel(role)}</span>
          </div>
          <FaChevronDown className={`text-slate-500 text-xs transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
      )}

      {open && (
        <>
        {/* Mobile overlay */}
        <div className="fixed inset-0 bg-black/20 sm:hidden z-40" onClick={() => setOpen(false)} />
        <div
          className="
            fixed top-16 left-1/2 -translate-x-1/2 w-[92vw] max-w-[92vw]
            sm:absolute sm:top-auto sm:left-auto sm:right-0 sm:mt-2 sm:translate-x-0 sm:w-80 sm:max-w-[85vw]
            bg-white rounded-2xl shadow-2xl border border-gray-200 overflow-hidden z-50 transition-all
          "
        >
          {/* Accent header (non-blue) */}
          <div className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-rose-500 text-white p-4">
            <div className="flex items-center gap-3">
              <Avatar
                name={fullName}
                imageUrl={(profile?.avatar as string) || (user as any)?.avatar || ''}
                size={40}
                className="ring-2 ring-white/60"
              />
              <div className="min-w-0">
                <div className="font-semibold truncate">{fullName}</div>
                <div className="text-white/90 text-xs truncate">{email}</div>
              </div>
            </div>
          </div>

          {/* Scrollable content area with sticky footer for logout */}
          <div className="max-h-[65vh] sm:max-h-[70vh] overflow-y-auto">
            <div className="p-4 space-y-3">
              {loading ? (
                <div className="text-sm text-slate-500">Loading profile…</div>
              ) : (
                <>
                  {/* Common quick stats */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-[11px] text-slate-500">Role</div>
                      <div className="text-sm font-semibold text-slate-800">{roleLabel(role)}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-[11px] text-slate-500">User ID</div>
                      <div className="text-sm font-semibold text-slate-800 truncate">{(profile?.id ?? user?.id) || '—'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-[11px] text-slate-500">Status</div>
                      <div className="text-sm font-semibold text-emerald-600">Active</div>
                    </div>
                  </div>

                  {/* Details */}
                  <div className="bg-slate-50 rounded-xl p-3">
                    <div className="text-[11px] text-slate-500">Email</div>
                    <div className="text-sm font-semibold text-slate-800 break-all">{email || '—'}</div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="text-[11px] text-slate-500">First name</div>
                      <div className="text-sm font-semibold text-slate-800">{(profile?.firstName ?? user?.firstName) || '—'}</div>
                    </div>
                    <div className="bg-slate-50 rounded-xl p-3">
                      <div className="text-[11px] text-slate-500">Last name</div>
                      <div className="text-sm font-semibold text-slate-800">{(profile?.lastName ?? user?.lastName) || '—'}</div>
                    </div>
                  </div>

                  {/* Role-specific extras */}
                  {role === 'PARENT' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-[11px] text-slate-500">Children</div>
                        <div className="text-sm font-semibold text-slate-800">{Array.isArray((profile as any)?.children) ? (profile as any).children.length : '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-[11px] text-slate-500">Enrollments</div>
                        <div className="text-sm font-semibold text-slate-800">—</div>
                      </div>
                    </div>
                  )}

                  {role === 'COACH' && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-[11px] text-slate-500">Domain</div>
                        <div className="text-sm font-semibold text-slate-800">{(profile as any)?.domain || (profile as any)?.coach?.domain || '—'}</div>
                      </div>
                      <div className="bg-slate-50 rounded-xl p-3 text-center">
                        <div className="text-[11px] text-slate-500">Experience</div>
                        <div className="text-sm font-semibold text-slate-800">{(profile as any)?.experience || (profile as any)?.coach?.experience || '—'}</div>
                      </div>
                    </div>
                  )}

                  {role === 'ADMIN' && (
                    <div className="bg-slate-50 rounded-xl p-3 text-center">
                      <div className="text-[11px] text-slate-500">Permissions</div>
                      <div className="text-sm font-semibold text-slate-800">All access</div>
                    </div>
                  )}

                  <div className="text-[11px] text-slate-500 text-center pt-1">Profile powered by /auth/profile</div>
                </>
              )}
            </div>
          </div>

          {/* Sticky footer */}
          <div className="sticky bottom-0 bg-white border-t border-gray-200 p-3 pb-[calc(0.75rem+env(safe-area-inset-bottom))]">
            <button
              onClick={doLogout}
              className="w-full inline-flex items-center justify-center gap-2 rounded-xl px-4 py-2.5 text-sm font-semibold text-white bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-700 hover:to-rose-800 shadow-lg shadow-rose-500/20"
            >
              <FaSignOutAlt /> Logout
            </button>
          </div>
        </div>
        </>
      )}
    </div>
  );
};

export default UserProfileMenu;
