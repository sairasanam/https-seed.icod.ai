import { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Modal, Field, Input, Alert, EmptyState } from '@/components/ui';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import {
  fetchAllReminders,
  updateReminder,
  deleteReminder,
  snoozeReminder,
  rescheduleReminder,
} from '@/store/slices/remindersSlice';
import ConfirmDialog from '@/components/ConfirmDialog';
import SkeletonLoader from '@/components/SkeletonLoader';
import type { Reminder } from '@/types';
import {
  Bell, Clock, X, Pencil, Calendar, RotateCcw, Trash2, Save, MoreHorizontal,
  Users, Heart, Globe
} from 'lucide-react';

const entityTypeIcons = {
  person: Users,
  initiative: Heart,
  organization: Globe,
};

export default function Reminders() {
  const dispatch = useAppDispatch();
  const { allItems: reminders, status } = useAppSelector((state) => state.reminders);

  const [editingReminder, setEditingReminder] = useState<Reminder | null>(null);
  const [editMessage, setEditMessage] = useState('');
  const [editDate, setEditDate] = useState('');
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [snoozedId, setSnoozedId] = useState<string | null>(null);
  const [filter, setFilter] = useState<'all' | 'active' | 'inactive'>('all');

  useEffect(() => {
    dispatch(fetchAllReminders());
  }, [dispatch]);

  const filteredReminders = reminders.filter((r) => {
    if (filter === 'active') return r.isActive;
    if (filter === 'inactive') return !r.isActive;
    return true;
  });

  const handleSnooze = async (id: string, duration: string) => {
    await dispatch(snoozeReminder({ id, duration })).unwrap();
    setSnoozedId(id);
    setTimeout(() => setSnoozedId(null), 1500);
    if (navigator.vibrate) navigator.vibrate(30);
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    await dispatch(deleteReminder(deleteTarget)).unwrap();
    setDeleteTarget(null);
  };

  const openEdit = (reminder: Reminder) => {
    setEditingReminder(reminder);
    setEditMessage(reminder.message);
    setEditDate(reminder.nextTriggerAt ? new Date(reminder.nextTriggerAt).toISOString().slice(0, 16) : '');
    setIsEditModalOpen(true);
  };

  const handleSaveEdit = async () => {
    if (!editingReminder) return;
    const data: Record<string, string> = {};
    if (editMessage !== editingReminder.message) data.message = editMessage;
    if (editDate) data.nextTriggerAt = new Date(editDate).toISOString();
    if (Object.keys(data).length > 0) {
      await dispatch(updateReminder({ id: editingReminder.id, data })).unwrap();
    }
    setIsEditModalOpen(false);
  };

  const formatTriggerDate = (dateStr?: string) => {
    if (!dateStr) return 'No date set';
    const date = new Date(dateStr);
    const now = new Date();
    const diffMs = date.getTime() - now.getTime();
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (diffDays < 0) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Tomorrow';
    if (diffDays <= 7) return `In ${diffDays} days`;
    return date.toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
  };

  return (
    <div
      className="space-y-4 p-4 pb-24"
      data-icod-id="src_pages_reminders_tsx_b633">
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        <h1
          className="text-2xl font-bold text-foreground flex items-center gap-2"
          data-icod-id="src_pages_reminders_tsx_d558">
          <Bell
            className="h-6 w-6 text-warning"
            data-icod-id="src_pages_reminders_tsx_b8a0" />
          Reminders
        </h1>
        <p
          className="text-muted-foreground"
          data-icod-id="src_pages_reminders_tsx_05d7">Manage your connection reminders</p>
      </motion.div>
      {/* Filter Tabs */}
      <div className="flex gap-2" data-icod-id="src_pages_reminders_tsx_890e">
        {(['all', 'active', 'inactive'] as const).map((f) => (
          <Button
            key={f}
            variant={filter === f ? 'primary' : 'outline'}
            size="sm"
            onClick={() => setFilter(f)}
            data-icod-id={`src_pages_reminders_tsx_20d8_${f}`}>
            {f.charAt(0).toUpperCase() + f.slice(1)}
          </Button>
        ))}
      </div>
      {/* List */}
      {status === 'loading' ? (
        <SkeletonLoader variant="list" count={5} data-icod-id="src_pages_reminders_tsx_8efb" />
      ) : filteredReminders.length === 0 ? (
        <EmptyState
          icon={Bell}
          title="No reminders"
          description={filter !== 'all' ? 'Try a different filter' : 'Reminders will appear when you add people and initiatives'}
          data-icod-id="src_pages_reminders_tsx_6b92" />
      ) : (
        <div className="space-y-3" data-icod-id="src_pages_reminders_tsx_8386">
          <AnimatePresence mode="popLayout">
            {filteredReminders.map((reminder, i) => {
              const Icon = entityTypeIcons[reminder.entityType] || Bell;
              const isSnoozed = snoozedId === reminder.id;

              return (
                <motion.div
                  key={reminder.id}
                  layout
                  initial={{ opacity: 0, y: 12 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03 }}
                >
                  <Card
                    className={`p-4 transition-opacity ${!reminder.isActive ? 'opacity-50' : ''}`}
                    data-icod-id={`src_pages_reminders_tsx_7210_${reminder.id}`}>
                    <div
                      className="flex items-start gap-3"
                      data-icod-id={`src_pages_reminders_tsx_122d_${reminder.id}`}>
                      <div
                        className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-full ${
                          !reminder.isActive ? 'bg-muted text-muted-foreground' : 'bg-warning/20 text-warning'
                        }`}
                        data-icod-id={`src_pages_reminders_tsx_f3f6_${reminder.id}`}>
                        <Icon
                          className="h-5 w-5"
                          data-icod-id={`src_pages_reminders_tsx_1cc6_${reminder.id}`} />
                      </div>
                      <div
                        className="flex-1 min-w-0"
                        data-icod-id={`src_pages_reminders_tsx_a7dc_${reminder.id}`}>
                        <p
                          className="text-sm font-medium text-foreground"
                          data-icod-id={`src_pages_reminders_tsx_9074_${reminder.id}`}>{reminder.message}</p>
                        <div
                          className="mt-1 flex flex-wrap items-center gap-2 text-xs text-muted-foreground"
                          data-icod-id={`src_pages_reminders_tsx_c70b_${reminder.id}`}>
                          {reminder.entityName && (
                            <span
                              className="capitalize"
                              data-icod-id={`src_pages_reminders_tsx_83af_${reminder.id}`}>{reminder.entityType}: {reminder.entityName}</span>
                          )}
                          <span
                            className="flex items-center gap-1"
                            data-icod-id={`src_pages_reminders_tsx_fe18_${reminder.id}`}>
                            <Clock
                              className="h-3 w-3"
                              data-icod-id={`src_pages_reminders_tsx_e59e_${reminder.id}`} />
                            {formatTriggerDate(reminder.nextTriggerAt)}
                          </span>
                          {reminder.snoozeCount > 0 && (
                            <span
                              className="flex items-center gap-1"
                              data-icod-id={`src_pages_reminders_tsx_cd36_${reminder.id}`}>
                              <RotateCcw
                                className="h-3 w-3"
                                data-icod-id={`src_pages_reminders_tsx_4c2c_${reminder.id}`} />
                              Snoozed {reminder.snoozeCount}x
                            </span>
                          )}
                          {!reminder.isActive && (
                            <span
                              className="text-destructive"
                              data-icod-id={`src_pages_reminders_tsx_6e15_${reminder.id}`}>Deactivated</span>
                          )}
                        </div>
                      </div>

                      {/* Actions */}
                      {reminder.isActive && (
                        <div
                          className="flex shrink-0 gap-1"
                          data-icod-id={`src_pages_reminders_tsx_4c03_${reminder.id}`}>
                          {isSnoozed ? (
                            <motion.span
                              initial={{ scale: 0 }}
                              animate={{ scale: 1 }}
                              className="text-xs text-success font-medium px-2 py-1"
                            >
                              Snoozed!
                            </motion.span>
                          ) : (
                            <>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => handleSnooze(reminder.id, '1d')}
                                title="Snooze 1 day"
                                data-icod-id={`src_pages_reminders_tsx_3028_${reminder.id}`}>
                                <Clock
                                  className="h-4 w-4"
                                  data-icod-id={`src_pages_reminders_tsx_626d_${reminder.id}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8"
                                onClick={() => openEdit(reminder)}
                                title="Edit"
                                data-icod-id={`src_pages_reminders_tsx_826a_${reminder.id}`}>
                                <Pencil
                                  className="h-4 w-4"
                                  data-icod-id={`src_pages_reminders_tsx_01f6_${reminder.id}`} />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-8 w-8 text-destructive hover:text-destructive"
                                onClick={() => setDeleteTarget(reminder.id)}
                                title="Deactivate"
                                data-icod-id={`src_pages_reminders_tsx_dad5_${reminder.id}`}>
                                <Trash2
                                  className="h-4 w-4"
                                  data-icod-id={`src_pages_reminders_tsx_96ee_${reminder.id}`} />
                              </Button>
                            </>
                          )}
                        </div>
                      )}
                    </div>

                    {/* Quick snooze options */}
                    {reminder.isActive && !isSnoozed && (
                      <div
                        className="mt-3 flex gap-2 border-t border-border pt-3"
                        data-icod-id={`src_pages_reminders_tsx_1c9b_${reminder.id}`}>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSnooze(reminder.id, '1h')}
                          data-icod-id={`src_pages_reminders_tsx_dd09_${reminder.id}`}>
                          1 hour
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSnooze(reminder.id, '1d')}
                          data-icod-id={`src_pages_reminders_tsx_32e0_${reminder.id}`}>
                          1 day
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleSnooze(reminder.id, '1w')}
                          data-icod-id={`src_pages_reminders_tsx_3d08_${reminder.id}`}>
                          1 week
                        </Button>
                      </div>
                    )}
                  </Card>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      {/* Edit Modal */}
      <Modal
        open={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="Edit Reminder"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_reminders_tsx_6b8e">
            <Button
              variant="outline"
              onClick={() => setIsEditModalOpen(false)}
              data-icod-id="src_pages_reminders_tsx_bfef">Cancel</Button>
            <Button onClick={handleSaveEdit} data-icod-id="src_pages_reminders_tsx_13bd">
              <Save className="h-4 w-4 mr-1" data-icod-id="src_pages_reminders_tsx_da41" />
              Save
            </Button>
          </div>
        }
        data-icod-id="src_pages_reminders_tsx_c3d7">
        <div className="space-y-4" data-icod-id="src_pages_reminders_tsx_66e6">
          <Field label="Message" data-icod-id="src_pages_reminders_tsx_c8d4">
            <Input
              value={editMessage}
              onChange={(e) => setEditMessage(e.target.value)}
              placeholder="Reminder message"
              data-icod-id="src_pages_reminders_tsx_7485" />
          </Field>
          <Field label="Next trigger date" data-icod-id="src_pages_reminders_tsx_9509">
            <Input
              type="datetime-local"
              value={editDate}
              onChange={(e) => setEditDate(e.target.value)}
              data-icod-id="src_pages_reminders_tsx_7000" />
          </Field>
        </div>
      </Modal>
      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Deactivate Reminder"
        description="This will deactivate the reminder. You can reactivate it later."
        confirmLabel="Deactivate"
        variant="destructive"
        data-icod-id="src_pages_reminders_tsx_4018" />
    </div>
  );
}
