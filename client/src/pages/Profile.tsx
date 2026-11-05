import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, Field, Input, Modal, Alert, Spinner } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { logout, updateProfile, resendVerification, clearVerificationSent } from '@/store/slices/authSlice';
import { deleteAccountRequest } from '@/services/adminService';
import AnimatedBackground from '@/components/AnimatedBackground';
import ConfirmDialog from '@/components/ConfirmDialog';
import { Moon, Sun, LogOut, User, MapPin, Camera, Trash2, Award, Flame, Settings, Phone, FileText, Bell, Save, Calendar, Users, CheckCircle, ChevronRight, ShieldCheck, ShieldAlert, RefreshCw } from 'lucide-react';
import { cn } from '@/utils/cn';

export default function Profile() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { user, status, verificationSent } = useAppSelector((state) => state.auth);
  const { summary } = useAppSelector((state) => state.dashboard);
  const [isDarkMode, setIsDarkMode] = useState(document.documentElement.classList.contains('dark'));
  const [showEditModal, setShowEditModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState('');
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [editForm, setEditForm] = useState({ name: '', location: '', bio: '', phone: '' });
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [resending, setResending] = useState(false);

  // Persist dark mode preference
  useEffect(() => {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.documentElement.classList.add('dark');
      setIsDarkMode(true);
    } else if (savedTheme === 'light') {
      document.documentElement.classList.remove('dark');
      setIsDarkMode(false);
    }
  }, []);

  const toggleDarkMode = () => {
    const newMode = !isDarkMode;
    setIsDarkMode(newMode);
    localStorage.setItem('theme', newMode ? 'dark' : 'light');
    if (newMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  };

  const handleLogout = () => {
    dispatch(logout());
    navigate('/login');
  };

  const handleDeleteAccount = async () => {
    if (deleteConfirm !== 'DELETE') return;
    setDeleting(true);
    setDeleteError(null);
    try {
      await deleteAccountRequest();
      dispatch(logout());
      navigate('/login');
    } catch (err: unknown) {
      const error = err as { response?: { data?: { error?: string } } };
      setDeleteError(error.response?.data?.error || 'Failed to delete account');
      setDeleting(false);
    }
  };

  const openEditModal = () => {
    setEditForm({
      name: user?.name || '',
      location: user?.location || '',
      bio: user?.bio || '',
      phone: user?.phone || '',
    });
    setSaveSuccess(false);
    setShowEditModal(true);
  };

  const handleSaveProfile = async () => {
    try {
      await dispatch(updateProfile({
        name: editForm.name,
        location: editForm.location,
        bio: editForm.bio,
        phone: editForm.phone,
      })).unwrap();
      setSaveSuccess(true);
      setTimeout(() => setShowEditModal(false), 800);
    } catch {
      // Error is handled by Redux state
    }
  };

  const handleResendVerification = async () => {
    setResending(true);
    try {
      await dispatch(resendVerification()).unwrap();
    } catch {
      // Error handled by slice
    } finally {
      setResending(false);
    }
  };

  const formatDate = (dateString?: string) => {
    if (!dateString) return 'N/A';
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  // Get real stats from dashboard summary if available
  const peopleCount = summary?.innerCircleStats?.contactedThisWeek || 0;
  const actionsCount = summary?.metrics?.actionsThisWeek || 0;
  const streakDays = user?.streakDays || 0;

  return (
    <div
      className="relative min-h-screen"
      data-icod-id="src_pages_profile_tsx_0438">
      <AnimatedBackground variant="profile" data-icod-id="src_pages_profile_tsx_bc12" />
      <div
        className="relative z-10 space-y-6 p-4 pb-28 pt-safe max-w-2xl mx-auto"
        data-icod-id="src_pages_profile_tsx_1601">
        
        {/* Premium Header with curved bottom */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <h1
            className="text-3xl font-bold bg-gradient-to-r from-primary via-success to-accent bg-clip-text text-transparent"
            style={{ letterSpacing: 'var(--tracking-tight)' }}
            data-icod-id="src_pages_profile_tsx_a630">
            Profile
          </h1>
          <p
            className="text-muted-foreground font-medium mt-1"
            data-icod-id="src_pages_profile_tsx_e914">Manage your account & preferences</p>
        </motion.div>

        {/* User Info Card - Premium gradient header with smooth curve */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <Card
            glass
            glow
            className="overflow-hidden"
            data-icod-id="src_pages_profile_tsx_5f4d">
            {/* Gradient header band with curved bottom */}
            <div
              className="h-28 bg-gradient-to-r from-primary via-success to-accent opacity-90 relative"
              data-icod-id="src_pages_profile_tsx_f828">
              {/* Curved bottom using SVG */}
              <svg
                className="absolute bottom-0 left-0 right-0 w-full h-6 text-card"
                viewBox="0 0 100 10"
                preserveAspectRatio="none"
                fill="currentColor"
                data-icod-id="src_pages_profile_tsx_e57a">
                <path
                  d="M0 10 Q50 0 100 10 L100 10 L0 10 Z"
                  data-icod-id="src_pages_profile_tsx_eae2" />
              </svg>
            </div>
            
            <div className="px-6 pb-6" data-icod-id="src_pages_profile_tsx_9e30">
              {/* Avatar overlapping the gradient with clear ring border */}
              <div
                className="-mt-14 flex items-end gap-5"
                data-icod-id="src_pages_profile_tsx_1e77">
                <div className="relative" data-icod-id="src_pages_profile_tsx_5b2e">
                  {/* Glow effect behind avatar */}
                  <div
                    className="absolute inset-0 rounded-full bg-gradient-to-br from-primary to-success blur-xl opacity-40 scale-110"
                    data-icod-id="src_pages_profile_tsx_93e5" />
                  {/* Avatar with premium ring */}
                  <div
                    className="relative flex h-28 w-28 items-center justify-center rounded-full bg-gradient-to-br from-card to-card border-[3px] border-card overflow-hidden shadow-2xl ring-2 ring-primary/30"
                    data-icod-id="src_pages_profile_tsx_fc83">
                    {user?.photo ? (
                      <img
                        src={user.photo}
                        alt={user.name}
                        className="h-full w-full object-cover"
                        data-icod-id="src_pages_profile_tsx_67cf" />
                    ) : (
                      <div
                        className="h-full w-full bg-gradient-to-br from-primary/20 to-success/10 flex items-center justify-center"
                        data-icod-id="src_pages_profile_tsx_2a2b">
                        <User
                          className="h-14 w-14 text-primary"
                          data-icod-id="src_pages_profile_tsx_dd02" />
                      </div>
                    )}
                  </div>
                </div>
                
                <div className="flex-1 pb-2" data-icod-id="src_pages_profile_tsx_cd7c">
                  <h2
                    className="text-2xl font-bold text-foreground"
                    style={{ letterSpacing: 'var(--tracking-tight)' }}
                    data-icod-id="src_pages_profile_tsx_5d9b">{user?.name}</h2>
                  <p
                    className="text-muted-foreground font-medium text-sm"
                    data-icod-id="src_pages_profile_tsx_fe2a">{user?.email}</p>
                </div>
                
                <Button
                  variant="outline"
                  onClick={openEditModal}
                  className="rounded-xl mb-2"
                  data-icod-id="src_pages_profile_tsx_50f1">
                  Edit
                </Button>
              </div>

              {/* Personal Statistics Row — 3 elegant glass cards */}
              <div
                className="grid grid-cols-3 gap-3 mt-6"
                data-icod-id="src_pages_profile_tsx_4022">
                <div
                  className="text-center p-3 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/10 backdrop-blur-sm"
                  data-icod-id="src_pages_profile_tsx_62e6">
                  <Users
                    className="h-5 w-5 text-primary mx-auto mb-1"
                    data-icod-id="src_pages_profile_tsx_c84b" />
                  <p
                    className="text-2xl font-bold text-foreground"
                    style={{ letterSpacing: 'var(--tracking-tight)' }}
                    data-icod-id="src_pages_profile_tsx_367d">{peopleCount}</p>
                  <p
                    className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide"
                    data-icod-id="src_pages_profile_tsx_1b2e">People</p>
                </div>
                <div
                  className="text-center p-3 rounded-2xl bg-gradient-to-br from-success/10 to-success/5 border border-success/10 backdrop-blur-sm"
                  data-icod-id="src_pages_profile_tsx_5179">
                  <CheckCircle
                    className="h-5 w-5 text-success mx-auto mb-1"
                    data-icod-id="src_pages_profile_tsx_1f21" />
                  <p
                    className="text-2xl font-bold text-foreground"
                    style={{ letterSpacing: 'var(--tracking-tight)' }}
                    data-icod-id="src_pages_profile_tsx_161b">{actionsCount}</p>
                  <p
                    className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide"
                    data-icod-id="src_pages_profile_tsx_ac9c">Actions</p>
                </div>
                <div
                  className="text-center p-3 rounded-2xl bg-gradient-to-br from-accent/10 to-accent/5 border border-accent/10 backdrop-blur-sm"
                  data-icod-id="src_pages_profile_tsx_7799">
                  <Flame
                    className="h-5 w-5 text-accent mx-auto mb-1"
                    data-icod-id="src_pages_profile_tsx_4450" />
                  <p
                    className="text-2xl font-bold text-foreground"
                    style={{ letterSpacing: 'var(--tracking-tight)' }}
                    data-icod-id="src_pages_profile_tsx_2142">{streakDays}</p>
                  <p
                    className="text-[10px] text-muted-foreground font-medium uppercase tracking-wide"
                    data-icod-id="src_pages_profile_tsx_af50">Day Streak</p>
                </div>
              </div>

              {/* Bio section */}
              {user?.bio && (
                <div
                  className="mt-5 p-4 rounded-xl bg-muted/20 border border-border/20"
                  data-icod-id="src_pages_profile_tsx_12a8">
                  <div
                    className="flex items-start gap-2"
                    data-icod-id="src_pages_profile_tsx_722f">
                    <FileText
                      className="h-4 w-4 text-primary mt-0.5 shrink-0"
                      data-icod-id="src_pages_profile_tsx_4e32" />
                    <p
                      className="text-sm text-foreground/90 leading-relaxed"
                      style={{ lineHeight: 'var(--leading-relaxed)' }}
                      data-icod-id="src_pages_profile_tsx_4938">{user.bio}</p>
                  </div>
                </div>
              )}

              {/* Quick info row */}
              <div
                className="mt-4 flex flex-wrap gap-4 text-sm"
                data-icod-id="src_pages_profile_tsx_8693">
                {user?.location && (
                  <div
                    className="flex items-center gap-1.5 text-muted-foreground"
                    data-icod-id="src_pages_profile_tsx_cf65">
                    <MapPin className="h-4 w-4 text-accent" data-icod-id="src_pages_profile_tsx_1de5" />
                    <span data-icod-id="src_pages_profile_tsx_7d39">{user.location}</span>
                  </div>
                )}
                {user?.phone && (
                  <div
                    className="flex items-center gap-1.5 text-muted-foreground"
                    data-icod-id="src_pages_profile_tsx_d831">
                    <Phone className="h-4 w-4 text-accent" data-icod-id="src_pages_profile_tsx_e5f2" />
                    <span data-icod-id="src_pages_profile_tsx_32a0">{user.phone}</span>
                  </div>
                )}
                <div
                  className="flex items-center gap-1.5 text-muted-foreground"
                  data-icod-id="src_pages_profile_tsx_bc20">
                  <Calendar className="h-4 w-4 text-accent" data-icod-id="src_pages_profile_tsx_ee7a" />
                  <span data-icod-id="src_pages_profile_tsx_b1d8">Joined {formatDate(user?.createdAt)}</span>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Email Verification Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
        >
          {user?.isEmailVerified ? (
            <div
              className="flex items-center gap-3 p-4 rounded-xl bg-success/10 border border-success/20"
              data-icod-id="src_pages_profile_tsx_21c6">
              <ShieldCheck
                className="h-6 w-6 text-success"
                data-icod-id="src_pages_profile_tsx_933d" />
              <div className="flex-1" data-icod-id="src_pages_profile_tsx_0a5f">
                <p
                  className="text-sm font-semibold text-success"
                  data-icod-id="src_pages_profile_tsx_769e">Email Verified</p>
                <p
                  className="text-xs text-muted-foreground"
                  data-icod-id="src_pages_profile_tsx_270c">Your email address has been confirmed</p>
              </div>
            </div>
          ) : (
            <Card glass className="p-4" data-icod-id="src_pages_profile_tsx_7b90">
              <div
                className="flex items-start gap-3"
                data-icod-id="src_pages_profile_tsx_625a">
                <ShieldAlert
                  className="h-6 w-6 text-warning shrink-0 mt-0.5"
                  data-icod-id="src_pages_profile_tsx_d9b3" />
                <div className="flex-1" data-icod-id="src_pages_profile_tsx_b6e8">
                  <p
                    className="text-sm font-semibold text-warning"
                    data-icod-id="src_pages_profile_tsx_5bdc">Email Not Verified</p>
                  <p
                    className="text-xs text-muted-foreground mt-1"
                    data-icod-id="src_pages_profile_tsx_c879">
                    Please verify your email to receive notifications and secure your account.
                  </p>
                  {verificationSent ? (
                    <div
                      className="mt-3 p-3 rounded-lg bg-success/10 border border-success/20"
                      data-icod-id="src_pages_profile_tsx_042c">
                      <p
                        className="text-xs text-success font-medium flex items-center gap-2"
                        data-icod-id="src_pages_profile_tsx_8839">
                        <CheckCircle className="h-4 w-4" data-icod-id="src_pages_profile_tsx_fb3f" />
                        Verification email sent! Check your inbox.
                      </p>
                    </div>
                  ) : (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={handleResendVerification}
                      disabled={resending}
                      loading={resending}
                      className="mt-3"
                      data-icod-id="src_pages_profile_tsx_045e">
                      <RefreshCw
                        className={cn("h-4 w-4 mr-2", resending && "animate-spin")}
                        data-icod-id="src_pages_profile_tsx_ee88" />
                      Resend Verification Email
                    </Button>
                  )}
                </div>
              </div>
            </Card>
          )}
        </motion.div>

        {/* Badges Section */}
        {user?.badges && user.badges.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <Card glass className="p-5" data-icod-id="src_pages_profile_tsx_c428">
              <h3
                className="font-bold text-lg text-foreground mb-4 flex items-center gap-2"
                style={{ letterSpacing: 'var(--tracking-tight)' }}
                data-icod-id="src_pages_profile_tsx_8116">
                <Award className="h-5 w-5 text-accent" data-icod-id="src_pages_profile_tsx_2c9c" />
                Achievements
              </h3>
              <div
                className="flex flex-wrap gap-3"
                data-icod-id="src_pages_profile_tsx_4e1c">
                {user.badges.map(badge => (
                  <span
                    key={badge}
                    className="inline-flex items-center gap-2 rounded-xl bg-gradient-to-r from-accent/20 to-accent/10 px-4 py-2 text-sm font-semibold text-accent-foreground border border-accent/20 shadow-sm hover:border-accent/40 transition-all"
                    data-icod-id={`src_pages_profile_tsx_1787_${badge}`}>
                    <Award
                      className="h-4 w-4 text-accent"
                      data-icod-id={`src_pages_profile_tsx_f41c_${badge}`} />
                    {badge}
                  </span>
                ))}
              </div>
            </Card>
          </motion.div>
        )}

        {/* Settings Sections — organized with clear headers */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <Card
            glass
            className="overflow-hidden"
            data-icod-id="src_pages_profile_tsx_782b">
            
            {/* Appearance Section */}
            <div className="p-5 border-b border-border/20" data-icod-id="src_pages_profile_tsx_8a55">
              <h3
                className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground"
                data-icod-id="src_pages_profile_tsx_1e81">
                <Settings
                  className="h-4 w-4 text-primary"
                  data-icod-id="src_pages_profile_tsx_7389" />
                Preferences
              </h3>
              <button
                onClick={toggleDarkMode}
                className="flex w-full items-center justify-between p-3 rounded-xl hover:bg-white/5 transition-colors group min-h-[52px]"
                data-icod-id="src_pages_profile_tsx_c6e8">
                <div
                  className="flex items-center gap-4"
                  data-icod-id="src_pages_profile_tsx_73b9">
                  <div
                    className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-muted/70 transition-colors"
                    data-icod-id="src_pages_profile_tsx_92e3">
                    {isDarkMode ? <Sun
                      className="h-5 w-5 text-foreground"
                      data-icod-id="src_pages_profile_tsx_9520" /> : <Moon
                      className="h-5 w-5 text-foreground"
                      data-icod-id="src_pages_profile_tsx_71af" />}
                  </div>
                  <span
                    className="font-semibold text-foreground"
                    data-icod-id="src_pages_profile_tsx_889a">{isDarkMode ? 'Light Mode' : 'Dark Mode'}</span>
                </div>
                <div
                  className={`h-7 w-12 rounded-full p-1 transition-all duration-300 ${isDarkMode ? 'bg-gradient-to-r from-primary to-success' : 'bg-muted'}`}
                  data-icod-id="src_pages_profile_tsx_cc9f">
                  <div
                    className={`h-5 w-5 rounded-full bg-card shadow-md transition-transform duration-300 ${isDarkMode ? 'translate-x-5' : ''}`}
                    data-icod-id="src_pages_profile_tsx_a1a3" />
                </div>
              </button>
            </div>

            {/* Notifications Section */}
            <div className="p-5" data-icod-id="src_pages_profile_tsx_bd0a">
              <h3
                className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground"
                data-icod-id="src_pages_profile_tsx_b714">
                <Bell
                  className="h-4 w-4 text-primary"
                  data-icod-id="src_pages_profile_tsx_4ff2" />
                Notifications
              </h3>
              <div className="space-y-3" data-icod-id="src_pages_profile_tsx_0dfc">
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/20 min-h-[52px]"
                  data-icod-id="src_pages_profile_tsx_8f72">
                  <span
                    className="text-sm font-medium text-foreground"
                    data-icod-id="src_pages_profile_tsx_96d7">Email notifications</span>
                  <div
                    className="h-6 w-11 rounded-full bg-primary/80 p-0.5 cursor-pointer"
                    data-icod-id="src_pages_profile_tsx_9b64">
                    <div
                      className="h-5 w-5 rounded-full bg-card shadow-sm translate-x-5 transition-transform"
                      data-icod-id="src_pages_profile_tsx_32ba" />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/20 min-h-[52px]"
                  data-icod-id="src_pages_profile_tsx_be1e">
                  <span
                    className="text-sm font-medium text-foreground"
                    data-icod-id="src_pages_profile_tsx_d725">Push notifications</span>
                  <div
                    className="h-6 w-11 rounded-full bg-primary/80 p-0.5 cursor-pointer"
                    data-icod-id="src_pages_profile_tsx_f92f">
                    <div
                      className="h-5 w-5 rounded-full bg-card shadow-sm translate-x-5 transition-transform"
                      data-icod-id="src_pages_profile_tsx_b5c7" />
                  </div>
                </div>
                <div
                  className="flex items-center justify-between p-3 rounded-xl bg-muted/20 min-h-[52px]"
                  data-icod-id="src_pages_profile_tsx_e7cd">
                  <span
                    className="text-sm font-medium text-foreground"
                    data-icod-id="src_pages_profile_tsx_ff0b">Reminder alerts</span>
                  <div
                    className="h-6 w-11 rounded-full bg-primary/80 p-0.5 cursor-pointer"
                    data-icod-id="src_pages_profile_tsx_9fcf">
                    <div
                      className="h-5 w-5 rounded-full bg-card shadow-sm translate-x-5 transition-transform"
                      data-icod-id="src_pages_profile_tsx_a844" />
                  </div>
                </div>
              </div>
            </div>
          </Card>
        </motion.div>

        {/* Account Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
        >
          <Card
            glass
            className="overflow-hidden"
            data-icod-id="src_pages_profile_tsx_4319">
            <div className="p-5" data-icod-id="src_pages_profile_tsx_22d5">
              <h3
                className="font-semibold text-foreground mb-4 flex items-center gap-2 text-sm uppercase tracking-wide text-muted-foreground"
                data-icod-id="src_pages_profile_tsx_4737">
                <User
                  className="h-4 w-4 text-primary"
                  data-icod-id="src_pages_profile_tsx_6f55" />
                Account
              </h3>
              
              {/* Sign Out */}
              <button
                onClick={() => setShowLogoutConfirm(true)}
                className="flex w-full items-center gap-4 p-3 rounded-xl hover:bg-destructive/5 transition-colors group min-h-[52px]"
                data-icod-id="src_pages_profile_tsx_5865">
                <div
                  className="p-2.5 rounded-xl bg-muted/50 group-hover:bg-destructive/10 transition-colors"
                  data-icod-id="src_pages_profile_tsx_be4a">
                  <LogOut className="h-5 w-5 text-muted-foreground group-hover:text-destructive transition-colors" data-icod-id="src_pages_profile_tsx_c09b" />
                </div>
                <div className="flex-1 text-left" data-icod-id="src_pages_profile_tsx_c4a8">
                  <span
                    className="font-semibold text-foreground block"
                    data-icod-id="src_pages_profile_tsx_e62f">Sign Out</span>
                  <span
                    className="text-xs text-muted-foreground"
                    data-icod-id="src_pages_profile_tsx_3fdd">End your session securely</span>
                </div>
                <ChevronRight
                  className="h-4 w-4 text-muted-foreground"
                  data-icod-id="src_pages_profile_tsx_fa81" />
              </button>
            </div>
          </Card>
        </motion.div>

        {/* Delete Account - Danger zone (muted but visible) */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
        >
          <button
            onClick={() => { setDeleteConfirm(''); setDeleteError(null); setShowDeleteModal(true); }}
            className="w-full flex items-center justify-center gap-2 p-4 text-sm text-destructive/50 hover:text-destructive transition-colors min-h-[44px]"
            data-icod-id="src_pages_profile_tsx_c6df">
            <Trash2 className="h-4 w-4" data-icod-id="src_pages_profile_tsx_afc2" />
            <span data-icod-id="src_pages_profile_tsx_a93c">Delete Account</span>
          </button>
        </motion.div>
      </div>
      {/* Edit Profile Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Profile"
        scrollable
        footer={
          <div
            className="flex justify-end gap-3 w-full"
            data-icod-id="src_pages_profile_tsx_6602">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              disabled={status === 'loading'}
              className="button-press"
              data-icod-id="src_pages_profile_tsx_d385">
              Cancel
            </Button>
            <Button
              onClick={handleSaveProfile}
              disabled={status === 'loading' || saveSuccess}
              loading={status === 'loading'}
              className={cn("button-press", saveSuccess && "animate-success-shimmer")}
              data-icod-id="src_pages_profile_tsx_9e2d">
              {saveSuccess ? (
                <span
                  className="flex items-center gap-2"
                  data-icod-id="src_pages_profile_tsx_dc4e">
                  <Save className="h-4 w-4" data-icod-id="src_pages_profile_tsx_76b9" />
                  Saved!
                </span>
              ) : (
                'Save Changes'
              )}
            </Button>
          </div>
        }
        data-icod-id="src_pages_profile_tsx_aa0c">
        <div className="space-y-6" data-icod-id="src_pages_profile_tsx_520e">
          {/* Photo preview section */}
          <div
            className="flex flex-col items-center pb-4 border-b border-border/20"
            data-icod-id="src_pages_profile_tsx_76e7">
            <div className="relative group" data-icod-id="src_pages_profile_tsx_984f">
              <div
                className="h-24 w-24 rounded-full overflow-hidden border-2 border-primary/30 shadow-lg ring-4 ring-primary/10 transition-all group-hover:ring-primary/20"
                data-icod-id="src_pages_profile_tsx_4496">
                {user?.photo ? (
                  <img
                    src={user.photo}
                    alt={user.name}
                    className="h-full w-full object-cover"
                    data-icod-id="src_pages_profile_tsx_444b" />
                ) : (
                  <div
                    className="h-full w-full bg-gradient-to-br from-primary/20 to-success/10 flex items-center justify-center"
                    data-icod-id="src_pages_profile_tsx_02f9">
                    <User
                      className="h-10 w-10 text-primary"
                      data-icod-id="src_pages_profile_tsx_e221" />
                  </div>
                )}
              </div>
              <div
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-card border border-border/30 shadow-md opacity-0 group-hover:opacity-100 transition-opacity cursor-not-allowed"
                data-icod-id="src_pages_profile_tsx_4962">
                <Camera
                  className="h-3.5 w-3.5 text-muted-foreground"
                  data-icod-id="src_pages_profile_tsx_dd3a" />
              </div>
            </div>
            <p
              className="mt-3 text-xs text-muted-foreground"
              data-icod-id="src_pages_profile_tsx_3220">Photo upload coming soon</p>
          </div>

          <Field label="Full Name" data-icod-id="src_pages_profile_tsx_eced">
            <Input
              value={editForm.name}
              onChange={(e) => setEditForm({ ...editForm, name: e.target.value })}
              placeholder="Your full name"
              className="focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
              data-icod-id="src_pages_profile_tsx_e5ff" />
          </Field>
          <Field
            label="Bio"
            hint="Tell others about yourself (max 500 characters)"
            data-icod-id="src_pages_profile_tsx_8663">
            <textarea
              className={inputClass('resize-none focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all')}
              rows={3}
              maxLength={500}
              value={editForm.bio}
              onChange={(e) => setEditForm({ ...editForm, bio: e.target.value })}
              placeholder="Share a bit about yourself..."
              data-icod-id="src_pages_profile_tsx_4b90" />
            <div
              className="text-right text-xs text-muted-foreground mt-1"
              data-icod-id="src_pages_profile_tsx_fb06">
              {editForm.bio.length}/500
            </div>
          </Field>
          <Field label="Location" data-icod-id="src_pages_profile_tsx_8397">
            <div className="relative" data-icod-id="src_pages_profile_tsx_6b3c">
              <MapPin
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                data-icod-id="src_pages_profile_tsx_ea23" />
              <Input
                value={editForm.location}
                onChange={(e) => setEditForm({ ...editForm, location: e.target.value })}
                placeholder="Portland, OR"
                className="pl-10 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                data-icod-id="src_pages_profile_tsx_5c22" />
            </div>
          </Field>
          <Field label="Phone" data-icod-id="src_pages_profile_tsx_b45c">
            <div className="relative" data-icod-id="src_pages_profile_tsx_0400">
              <Phone
                className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none"
                data-icod-id="src_pages_profile_tsx_a133" />
              <Input
                value={editForm.phone}
                onChange={(e) => setEditForm({ ...editForm, phone: e.target.value })}
                placeholder="(555) 123-4567"
                className="pl-10 focus:ring-2 focus:ring-primary/30 focus:border-primary transition-all"
                data-icod-id="src_pages_profile_tsx_9926" />
            </div>
          </Field>
          
          {/* Extra padding at bottom for safe area */}
          <div className="h-4" data-icod-id="src_pages_profile_tsx_3f0c" />
        </div>
      </Modal>
      {/* Logout Confirmation Dialog */}
      <ConfirmDialog
        open={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        description="Are you sure you want to sign out? You'll need to log in again to access your account."
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        variant="destructive"
        data-icod-id="src_pages_profile_tsx_b098" />
      {/* Delete Account Modal */}
      <Modal
        open={showDeleteModal}
        onClose={() => setShowDeleteModal(false)}
        title="Delete Account"
        footer={
          <div
            className="flex justify-end gap-3"
            data-icod-id="src_pages_profile_tsx_e724">
            <Button
              variant="secondary"
              onClick={() => setShowDeleteModal(false)}
              data-icod-id="src_pages_profile_tsx_06c9">
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={handleDeleteAccount}
              disabled={deleteConfirm !== 'DELETE' || deleting}
              loading={deleting}
              data-icod-id="src_pages_profile_tsx_8e06">
              Delete Permanently
            </Button>
          </div>
        }
        data-icod-id="src_pages_profile_tsx_af95">
        <div className="space-y-5" data-icod-id="src_pages_profile_tsx_3699">
          <Alert variant="error" data-icod-id="src_pages_profile_tsx_45fc">
            This action is irreversible. All your data including people, actions, initiatives, organizations, notes, and reminders will be permanently deleted.
          </Alert>
          {deleteError && <Alert variant="error" data-icod-id="src_pages_profile_tsx_1b25">{deleteError}</Alert>}
          <Field label="Type DELETE to confirm" data-icod-id="src_pages_profile_tsx_9b23">
            <Input
              value={deleteConfirm}
              onChange={(e) => setDeleteConfirm(e.target.value)}
              placeholder="Type DELETE"
              autoComplete="off"
              data-icod-id="src_pages_profile_tsx_ea66" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
