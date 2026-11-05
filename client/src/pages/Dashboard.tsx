import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Spinner, EmptyState, Button } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchDashboardSummary } from '@/store/slices/dashboardSlice';
import { fetchReminders, snoozeReminder, deleteReminder } from '@/store/slices/remindersSlice';
import DashboardMetrics from '@/components/DashboardMetrics';
import TreeVisualization from '@/components/TreeVisualization';
import SkeletonLoader from '@/components/SkeletonLoader';
import ProgressBar from '@/components/ProgressBar';
import AnimatedBackground from '@/components/AnimatedBackground';
import SeedsLogo from '@/components/SeedsLogo';
import WeeklyActivityChart from '@/components/WeeklyActivityChart';
import { EmptyRelationshipsIllustration, CompletedActionsIllustration } from '@/components/Illustrations';
import {
  CheckCircle, Circle, Bell, Clock, Users, Heart, Globe,
  TrendingUp, ChevronRight, BookOpen, X, Sparkles, User, Award
} from 'lucide-react';

export default function Dashboard() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { summary, status } = useAppSelector((state) => state.dashboard);
  const { user } = useAppSelector((state) => state.auth);
  const [completedActionId, setCompletedActionId] = useState<string | null>(null);

  useEffect(() => {
    dispatch(fetchDashboardSummary());
    dispatch(fetchReminders());
  }, [dispatch]);

  const handleQuickComplete = (actionId: string) => {
    if (navigator.vibrate) navigator.vibrate(50);
    setCompletedActionId(actionId);
    setTimeout(() => setCompletedActionId(null), 1200);
    setTimeout(() => dispatch(fetchDashboardSummary()), 500);
  };

  const handleSnooze = (reminderId: string) => {
    dispatch(snoozeReminder({ id: reminderId, duration: '1d' }));
  };

  const handleDismissReminder = (reminderId: string) => {
    dispatch(deleteReminder(reminderId));
  };

  if (status === 'loading' && !summary) {
    return (
      <div
        className="relative min-h-screen"
        data-icod-id="src_pages_dashboard_tsx_f2e8">
        <AnimatedBackground variant="home" data-icod-id="src_pages_dashboard_tsx_b25f" />
        <div
          className="relative z-10 space-y-6 p-4 pb-24 pt-safe"
          data-icod-id="src_pages_dashboard_tsx_fd7f">
          <SkeletonLoader variant="text" count={2} data-icod-id="src_pages_dashboard_tsx_8630" />
          <SkeletonLoader variant="metric" count={4} data-icod-id="src_pages_dashboard_tsx_91aa" />
          <SkeletonLoader variant="list" count={3} data-icod-id="src_pages_dashboard_tsx_8e2f" />
          <SkeletonLoader variant="tree" data-icod-id="src_pages_dashboard_tsx_3c4b" />
        </div>
      </div>
    );
  }

  if (!summary) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center"
        data-icod-id="src_pages_dashboard_tsx_3b64">
        <AnimatedBackground variant="home" data-icod-id="src_pages_dashboard_tsx_8628" />
        <div className="relative z-10" data-icod-id="src_pages_dashboard_tsx_8fe4">
          <EmptyState
            illustration={<EmptyRelationshipsIllustration data-icod-id="src_pages_dashboard_tsx_ce14" />}
            title="Welcome to Seeds"
            description="Start by adding people to your inner circle and watch your relationship tree grow"
            action={<Button
              onClick={() => navigate('/inner-circle')}
              data-icod-id="src_pages_dashboard_tsx_c641">Get Started</Button>}
            data-icod-id="src_pages_dashboard_tsx_4325" />
        </div>
      </div>
    );
  }

  const { metrics, todayActions, upcomingReminders, recentCompleted, innerCircleStats, communityStats, outerCircleStats, monthlySummary } = summary;

  return (
    <div
      className="relative min-h-screen"
      data-icod-id="src_pages_dashboard_tsx_58ec">
      <AnimatedBackground variant="home" data-icod-id="src_pages_dashboard_tsx_e78a" />
      <div
        className="relative z-10 space-y-6 p-4 pb-28 pt-safe max-w-2xl mx-auto"
        data-icod-id="src_pages_dashboard_tsx_697d">
        {/* Premium Welcome Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="pt-4 pb-2"
        >
          <div
            className="flex items-start justify-between"
            data-icod-id="src_pages_dashboard_tsx_dabf">
            <div className="space-y-1" data-icod-id="src_pages_dashboard_tsx_19a3">
              {/* Brand accent row */}
              <div
                className="flex items-center gap-2 mb-1"
                data-icod-id="src_pages_dashboard_tsx_6081">
                <SeedsLogo
                  variant="symbol"
                  theme="dark"
                  size="sm"
                  data-icod-id="src_pages_dashboard_tsx_dcf9" />
                <span
                  className="text-xs font-semibold text-primary tracking-wide uppercase opacity-70"
                  data-icod-id="src_pages_dashboard_tsx_7ab7">Seeds</span>
              </div>
              <motion.h1
                className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.1 }}
              >
                Hello, {user?.name?.split(' ')[0] || 'Friend'}
              </motion.h1>
              <motion.p
                className="text-muted-foreground font-medium flex items-center gap-2"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
              >
                <Sparkles
                  className="h-4 w-4 text-accent"
                  data-icod-id="src_pages_dashboard_tsx_49b4" />
                Here's your growth today
              </motion.p>
            </div>
            <motion.button
              onClick={() => navigate('/profile')}
              className="relative h-12 w-12 rounded-2xl overflow-hidden shadow-lg shadow-primary/30 ring-2 ring-primary/20 hover:ring-primary/40 transition-all"
              initial={{ scale: 0, rotate: -180 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ type: 'spring', delay: 0.3 }}
              aria-label="Go to profile"
            >
              {user?.photo ? (
                <img
                  src={user.photo}
                  alt={user.name}
                  className="h-full w-full object-cover"
                  data-icod-id="src_pages_dashboard_tsx_5b60" />
              ) : (
                <div
                  className="h-full w-full bg-gradient-to-br from-primary to-success flex items-center justify-center"
                  data-icod-id="src_pages_dashboard_tsx_8f72">
                  <User
                    className="h-6 w-6 text-white"
                    data-icod-id="src_pages_dashboard_tsx_a6cf" />
                </div>
              )}
            </motion.button>
          </div>
        </motion.div>

        {/* Metrics Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <DashboardMetrics metrics={metrics} data-icod-id="src_pages_dashboard_tsx_a97f" />
        </motion.div>

        {/* Weekly Activity Chart */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.25 }}
        >
          <WeeklyActivityChart data-icod-id="src_pages_dashboard_tsx_eb60" />
        </motion.div>

        {/* Today's Actions - Glass Card */}
        {todayActions.length > 0 && (
          <Card glass glow className="p-5" data-icod-id="src_pages_dashboard_tsx_af27">
            <div
              className="flex items-center justify-between mb-4"
              data-icod-id="src_pages_dashboard_tsx_5530">
              <h3
                className="font-bold text-lg text-foreground flex items-center gap-2"
                data-icod-id="src_pages_dashboard_tsx_08f1">
                <div
                  className="p-1.5 rounded-lg bg-primary/10"
                  data-icod-id="src_pages_dashboard_tsx_dd6d">
                  <CheckCircle
                    className="h-5 w-5 text-primary"
                    data-icod-id="src_pages_dashboard_tsx_0393" />
                </div>
                Today's Actions
              </h3>
              <span
                className="text-xs font-semibold px-3 py-1 rounded-full bg-primary/10 text-primary"
                data-icod-id="src_pages_dashboard_tsx_2c2c">
                {todayActions.length} pending
              </span>
            </div>
            
            <div className="space-y-3" data-icod-id="src_pages_dashboard_tsx_c26f">
              {todayActions.slice(0, 5).map((action, i) => (
                <motion.div
                  key={action._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3 + i * 0.05 }}
                  className="flex items-center gap-3 rounded-xl border border-border/30 bg-background/50 p-3.5 backdrop-blur-sm transition-all hover:bg-background/80"
                >
                  <button
                    onClick={() => handleQuickComplete(action._id)}
                    className="shrink-0 text-primary hover:text-primary/80 transition-colors active:scale-95"
                    data-icod-id={`src_pages_dashboard_tsx_8f10_${action._id}`}>
                    {completedActionId === action._id ? (
                      <motion.div
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        className="animate-success-burst"
                      >
                        <CheckCircle
                          className="h-6 w-6 text-success"
                          data-icod-id={`src_pages_dashboard_tsx_1c21_${action._id}`} />
                      </motion.div>
                    ) : (
                      <Circle
                        className="h-6 w-6"
                        data-icod-id={`src_pages_dashboard_tsx_cba7_${action._id}`} />
                    )}
                  </button>
                  
                  <div
                    className="flex-1 min-w-0"
                    data-icod-id={`src_pages_dashboard_tsx_2623_${action._id}`}>
                    <p
                      className="text-sm font-semibold text-foreground truncate"
                      data-icod-id={`src_pages_dashboard_tsx_6146_${action._id}`}>{action.title}</p>
                    <div
                      className="flex items-center gap-2 mt-1"
                      data-icod-id={`src_pages_dashboard_tsx_4df6_${action._id}`}>
                      {action.priority && (
                        <span
                          className={`text-[10px] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full ${
                            action.priority === 'high' ? 'bg-destructive/10 text-destructive' :
                            action.priority === 'medium' ? 'bg-warning/10 text-warning' : 'bg-muted text-muted-foreground'
                          }`}
                          data-icod-id={`src_pages_dashboard_tsx_d42d_${action._id}`}>
                          {action.priority}
                        </span>
                      )}
                      {action.category && action.category !== 'other' && (
                        <span
                          className="text-[10px] text-muted-foreground capitalize"
                          data-icod-id={`src_pages_dashboard_tsx_a228_${action._id}`}>{action.category}</span>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Upcoming Reminders */}
        {upcomingReminders.length > 0 && (
          <Card glass className="p-5" data-icod-id="src_pages_dashboard_tsx_3e25">
            <div
              className="flex items-center justify-between mb-4"
              data-icod-id="src_pages_dashboard_tsx_7611">
              <h3
                className="font-bold text-lg text-foreground flex items-center gap-2"
                data-icod-id="src_pages_dashboard_tsx_57bd">
                <div
                  className="p-1.5 rounded-lg bg-warning/10"
                  data-icod-id="src_pages_dashboard_tsx_0d78">
                  <Bell
                    className="h-5 w-5 text-warning"
                    data-icod-id="src_pages_dashboard_tsx_ccb0" />
                </div>
                Upcoming Reminders
              </h3>
              <button
                onClick={() => navigate('/reminders')}
                className="text-xs font-semibold text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
                data-icod-id="src_pages_dashboard_tsx_abff">
                Manage <ChevronRight className="h-3 w-3" data-icod-id="src_pages_dashboard_tsx_a1d8" />
              </button>
            </div>
            
            <div className="space-y-3" data-icod-id="src_pages_dashboard_tsx_25ba">
              {upcomingReminders.map((reminder, i) => (
                <motion.div
                  key={reminder.id}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + i * 0.05 }}
                  className="flex items-start gap-3 rounded-xl border border-border/30 bg-background/50 p-3.5 backdrop-blur-sm"
                >
                  <div
                    className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-gradient-to-br from-warning/20 to-warning/10 text-warning"
                    data-icod-id={`src_pages_dashboard_tsx_6370_${reminder.id}`}>
                    <Clock
                      className="h-5 w-5"
                      data-icod-id={`src_pages_dashboard_tsx_4862_${reminder.id}`} />
                  </div>
                  
                  <div
                    className="flex-1 min-w-0"
                    data-icod-id={`src_pages_dashboard_tsx_5c64_${reminder.id}`}>
                    <p
                      className="text-sm font-medium text-foreground"
                      data-icod-id={`src_pages_dashboard_tsx_ca45_${reminder.id}`}>{reminder.message}</p>
                    {reminder.entityName && (
                      <p
                        className="text-xs text-muted-foreground mt-0.5"
                        data-icod-id={`src_pages_dashboard_tsx_ce0a_${reminder.id}`}>{reminder.entityName}</p>
                    )}
                    {reminder.nextTriggerAt && (
                      <p
                        className="text-[10px] text-muted-foreground mt-1.5 font-medium"
                        data-icod-id={`src_pages_dashboard_tsx_c1e0_${reminder.id}`}>
                        {new Date(reminder.nextTriggerAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                      </p>
                    )}
                  </div>
                  
                  <div
                    className="flex items-center gap-1 shrink-0"
                    data-icod-id={`src_pages_dashboard_tsx_67b1_${reminder.id}`}>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => handleSnooze(reminder.id)}
                      data-icod-id={`src_pages_dashboard_tsx_737d_${reminder.id}`}>
                      <Clock
                        className="h-4 w-4"
                        data-icod-id={`src_pages_dashboard_tsx_b472_${reminder.id}`} />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 rounded-lg"
                      onClick={() => handleDismissReminder(reminder.id)}
                      data-icod-id={`src_pages_dashboard_tsx_2e8d_${reminder.id}`}>
                      <X
                        className="h-4 w-4"
                        data-icod-id={`src_pages_dashboard_tsx_a2bc_${reminder.id}`} />
                    </Button>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Recently Completed */}
        {recentCompleted.length > 0 && (
          <Card glass className="p-5" data-icod-id="src_pages_dashboard_tsx_0814">
            <h3
              className="font-bold text-lg text-foreground mb-4 flex items-center gap-2"
              data-icod-id="src_pages_dashboard_tsx_4920">
              <div
                className="p-1.5 rounded-lg bg-success/10"
                data-icod-id="src_pages_dashboard_tsx_5e42">
                <TrendingUp
                  className="h-5 w-5 text-success"
                  data-icod-id="src_pages_dashboard_tsx_4330" />
              </div>
              Recent Completions
            </h3>
            
            <div className="space-y-2.5" data-icod-id="src_pages_dashboard_tsx_e172">
              {recentCompleted.slice(0, 5).map((activity, i) => (
                <motion.div
                  key={activity._id}
                  initial={{ opacity: 0, x: -10 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.5 + i * 0.05 }}
                  className="flex items-center gap-3 text-sm p-2 rounded-lg hover:bg-muted/30 transition-colors"
                >
                  <div
                    className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-success/15 text-success"
                    data-icod-id={`src_pages_dashboard_tsx_d538_${activity._id}`}>
                    <CheckCircle
                      className="h-4 w-4"
                      data-icod-id={`src_pages_dashboard_tsx_b10c_${activity._id}`} />
                  </div>
                  <span
                    className="flex-1 text-foreground font-medium truncate"
                    data-icod-id={`src_pages_dashboard_tsx_110f_${activity._id}`}>{activity.title}</span>
                  <span
                    className="text-xs text-muted-foreground shrink-0"
                    data-icod-id={`src_pages_dashboard_tsx_d4b5_${activity._id}`}>
                    {new Date(activity.completedAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                  </span>
                </motion.div>
              ))}
            </div>
          </Card>
        )}

        {/* Three Circle Stats Grid */}
        <div
          className="grid grid-cols-1 gap-4"
          data-icod-id="src_pages_dashboard_tsx_78a4">
          {/* Inner Circle Card */}
          <Card
            glass
            glow
            className="p-5 cursor-pointer"
            onClick={() => navigate('/inner-circle')}
            data-icod-id="src_pages_dashboard_tsx_39eb">
            <div
              className="flex items-center justify-between mb-4"
              data-icod-id="src_pages_dashboard_tsx_9d28">
              <h3
                className="font-bold text-lg text-foreground flex items-center gap-2"
                data-icod-id="src_pages_dashboard_tsx_3bc2">
                <div
                  className="p-1.5 rounded-lg bg-primary/10"
                  data-icod-id="src_pages_dashboard_tsx_0def">
                  <Users
                    className="h-5 w-5 text-primary"
                    data-icod-id="src_pages_dashboard_tsx_0895" />
                </div>
                Inner Circle
              </h3>
              <ChevronRight
                className="h-5 w-5 text-muted-foreground"
                data-icod-id="src_pages_dashboard_tsx_7024" />
            </div>
            
            <div
              className="grid grid-cols-2 gap-3"
              data-icod-id="src_pages_dashboard_tsx_bc7c">
              <div
                className="rounded-xl bg-gradient-to-br from-primary/10 to-primary/5 p-4 text-center border border-primary/10"
                data-icod-id="src_pages_dashboard_tsx_b022">
                <p
                  className="text-2xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_tsx_d55a">{innerCircleStats.contactedThisWeek}</p>
                <p
                  className="text-xs text-muted-foreground font-medium mt-1"
                  data-icod-id="src_pages_dashboard_tsx_7cd4">contacted this week</p>
              </div>
              <div
                className="rounded-xl bg-gradient-to-br from-destructive/10 to-destructive/5 p-4 text-center border border-destructive/10"
                data-icod-id="src_pages_dashboard_tsx_43c4">
                <p
                  className="text-2xl font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_tsx_2cbc">{innerCircleStats.staleConnections}</p>
                <p
                  className="text-xs text-muted-foreground font-medium mt-1"
                  data-icod-id="src_pages_dashboard_tsx_a4a4">stale (14+ days)</p>
              </div>
            </div>
          </Card>

          {/* Community Card */}
          <Card
            glass
            className="p-5 cursor-pointer"
            onClick={() => navigate('/community')}
            data-icod-id="src_pages_dashboard_tsx_261a">
            <div
              className="flex items-center justify-between mb-4"
              data-icod-id="src_pages_dashboard_tsx_31a1">
              <h3
                className="font-bold text-lg text-foreground flex items-center gap-2"
                data-icod-id="src_pages_dashboard_tsx_c125">
                <div
                  className="p-1.5 rounded-lg bg-accent/10"
                  data-icod-id="src_pages_dashboard_tsx_6dd2">
                  <Heart
                    className="h-5 w-5 text-accent"
                    data-icod-id="src_pages_dashboard_tsx_3ae3" />
                </div>
                Community
              </h3>
              <ChevronRight
                className="h-5 w-5 text-muted-foreground"
                data-icod-id="src_pages_dashboard_tsx_912d" />
            </div>
            
            <div className="space-y-4" data-icod-id="src_pages_dashboard_tsx_eb3c">
              <div
                className="flex items-center justify-between text-sm"
                data-icod-id="src_pages_dashboard_tsx_1aee">
                <span
                  className="text-muted-foreground font-medium"
                  data-icod-id="src_pages_dashboard_tsx_2570">Active initiatives</span>
                <span
                  className="font-bold text-foreground"
                  data-icod-id="src_pages_dashboard_tsx_7bcd">{communityStats.activeInitiatives}</span>
              </div>
              <div data-icod-id="src_pages_dashboard_tsx_1c35">
                <div
                  className="flex items-center justify-between text-sm mb-2"
                  data-icod-id="src_pages_dashboard_tsx_2554">
                  <span
                    className="text-muted-foreground font-medium"
                    data-icod-id="src_pages_dashboard_tsx_6542">Task completion</span>
                  <span
                    className="font-bold text-foreground"
                    data-icod-id="src_pages_dashboard_tsx_5f5d">{communityStats.taskCompletionPercent}%</span>
                </div>
                <ProgressBar
                  current={communityStats.taskCompletionPercent}
                  total={100}
                  data-icod-id="src_pages_dashboard_tsx_0a12" />
              </div>
            </div>
          </Card>

          {/* Outer Circle Card */}
          <Card
            glass
            className="p-5 cursor-pointer"
            onClick={() => navigate('/outer-circle')}
            data-icod-id="src_pages_dashboard_tsx_b57d">
            <div
              className="flex items-center justify-between mb-4"
              data-icod-id="src_pages_dashboard_tsx_f918">
              <h3
                className="font-bold text-lg text-foreground flex items-center gap-2"
                data-icod-id="src_pages_dashboard_tsx_647d">
                <div
                  className="p-1.5 rounded-lg bg-secondary/10"
                  data-icod-id="src_pages_dashboard_tsx_657a">
                  <Globe
                    className="h-5 w-5 text-secondary"
                    data-icod-id="src_pages_dashboard_tsx_336b" />
                </div>
                Outer Circle
              </h3>
              <ChevronRight
                className="h-5 w-5 text-muted-foreground"
                data-icod-id="src_pages_dashboard_tsx_06d5" />
            </div>
            
            <div
              className="rounded-xl bg-gradient-to-br from-secondary/10 to-secondary/5 p-4 text-center border border-secondary/10"
              data-icod-id="src_pages_dashboard_tsx_e174">
              <p
                className="text-3xl font-bold text-foreground"
                data-icod-id="src_pages_dashboard_tsx_e7a3">{outerCircleStats.followedOrganizations}</p>
              <p
                className="text-xs text-muted-foreground font-medium mt-1"
                data-icod-id="src_pages_dashboard_tsx_782b">organizations followed</p>
            </div>
          </Card>
        </div>

        {/* Monthly Summary */}
        <Card glass className="p-5" data-icod-id="src_pages_dashboard_tsx_3917">
          <h3
            className="font-bold text-lg text-foreground mb-4"
            data-icod-id="src_pages_dashboard_tsx_4470">Monthly Summary</h3>
          <div
            className="grid grid-cols-2 gap-4"
            data-icod-id="src_pages_dashboard_tsx_e256">
            <div
              className="text-center p-3 rounded-xl bg-muted/30"
              data-icod-id="src_pages_dashboard_tsx_ce09">
              <p
                className="text-3xl font-bold text-foreground"
                data-icod-id="src_pages_dashboard_tsx_fba4">{monthlySummary.actionsCompleted}</p>
              <p
                className="text-xs text-muted-foreground font-medium mt-1"
                data-icod-id="src_pages_dashboard_tsx_d80b">actions this month</p>
            </div>
            <div
              className="text-center p-3 rounded-xl bg-muted/30"
              data-icod-id="src_pages_dashboard_tsx_a35e">
              <p
                className="text-3xl font-bold text-foreground"
                data-icod-id="src_pages_dashboard_tsx_1766">{monthlySummary.avgPerWeek}</p>
              <p
                className="text-xs text-muted-foreground font-medium mt-1"
                data-icod-id="src_pages_dashboard_tsx_4f48">avg per week</p>
            </div>
          </div>
        </Card>

        {/* Milestones - Elegant pill badges with gold shimmer */}
        {metrics.milestones.length > 0 && (
          <Card glass className="p-5" data-icod-id="src_pages_dashboard_tsx_0e78">
            <h3
              className="font-bold text-lg text-foreground mb-4 flex items-center gap-2"
              style={{ letterSpacing: 'var(--tracking-tight)' }}
              data-icod-id="src_pages_dashboard_tsx_34db">
              <div
                className="p-1.5 rounded-lg bg-accent/10"
                data-icod-id="src_pages_dashboard_tsx_32fd">
                <Award
                  className="h-5 w-5 text-accent"
                  data-icod-id="src_pages_dashboard_tsx_6f7a" />
              </div>
              Recent Milestones
            </h3>
            <div className="flex flex-wrap gap-2" data-icod-id="src_pages_dashboard_tsx_a3c1">
              {metrics.milestones.slice(0, 4).map((milestone: string, i: number) => (
                <motion.span
                  key={i}
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ delay: 0.5 + i * 0.1 }}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-gradient-to-r from-accent/20 via-accent/10 to-accent/20 border border-accent/30 shadow-[0_0_10px_rgba(var(--glow-accent)/0.15)] hover:border-accent/50 transition-all"
                  data-icod-id={`src_pages_dashboard_tsx_9d1d_${i}`}>
                  <span
                    className="h-1.5 w-1.5 rounded-full bg-accent animate-pulse"
                    data-icod-id={`src_pages_dashboard_tsx_efde_${i}`} />
                  <span
                    className="text-sm font-semibold text-foreground"
                    data-icod-id={`src_pages_dashboard_tsx_5455_${i}`}>{milestone}</span>
                </motion.span>
              ))}
            </div>
          </Card>
        )}

        {/* Quick Journal Link */}
        <Card
          glass
          className="p-4 cursor-pointer hover:bg-white/10 transition-all"
          onClick={() => navigate('/journal')}
          data-icod-id="src_pages_dashboard_tsx_f657">
          <div
            className="flex w-full items-center gap-4"
            data-icod-id="src_pages_dashboard_tsx_4ba1">
            <div
              className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary/20 to-success/10 text-primary border border-primary/20"
              data-icod-id="src_pages_dashboard_tsx_8302">
              <BookOpen className="h-6 w-6" data-icod-id="src_pages_dashboard_tsx_d251" />
            </div>
            <div className="flex-1" data-icod-id="src_pages_dashboard_tsx_a283">
              <p
                className="font-bold text-foreground"
                data-icod-id="src_pages_dashboard_tsx_e0ed">Private Journal</p>
              <p
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_dashboard_tsx_2242">Reflect on your journey</p>
            </div>
            <ChevronRight
              className="h-5 w-5 text-muted-foreground"
              data-icod-id="src_pages_dashboard_tsx_970b" />
          </div>
        </Card>

        {/* Tree Preview */}
        <Card
          glass
          glow
          className="p-5 overflow-visible"
          data-icod-id="src_pages_dashboard_tsx_dacf">
          <div
            className="flex items-center justify-between mb-4"
            data-icod-id="src_pages_dashboard_tsx_1eeb">
            <h3
              className="font-bold text-lg text-foreground"
              data-icod-id="src_pages_dashboard_tsx_c164">Inner Circle Tree</h3>
            <button
              onClick={() => navigate('/inner-circle')}
              className="text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              data-icod-id="src_pages_dashboard_tsx_a4d3">
              View full tree
            </button>
          </div>
          <TreeVisualization
            growthData={metrics.innerCircleGrowth}
            treeType="inner"
            className="h-72"
            data-icod-id="src_pages_dashboard_tsx_a176" />
        </Card>
      </div>
    </div>
  );
}
