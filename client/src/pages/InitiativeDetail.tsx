import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Spinner, Modal, Field, Input } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { getInitiativeRequest, updateInitiativeRequest } from '@/services/initiativeService';
import { addTaskRequest, toggleTaskRequest, removeTaskRequest, archiveInitiativeRequest, deleteInitiativeRequest } from '@/services/initiativeService';
import { getNotesRequest, createNoteRequest, deleteNoteRequest } from '@/services/noteService';
import type { Initiative, Note } from '../types';
import ProgressBar from '@/components/ProgressBar';
import ChecklistItem from '@/components/ChecklistItem';
import ShareButton from '@/components/ShareButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ArrowLeft, Users, Calendar, TrendingUp, CheckCircle, MapPin, FileText, Pencil, Trash2, Archive, Plus, Target } from 'lucide-react';

const statusColors: Record<string, string> = {
  planned: 'bg-secondary text-secondary-foreground',
  active: 'bg-accent/20 text-accent-foreground',
  completed: 'bg-primary/10 text-primary',
  archived: 'bg-muted text-muted-foreground',
};

export default function InitiativeDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [initiative, setInitiative] = useState<Initiative | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showArchiveConfirm, setShowArchiveConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Initiative>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadInitiative();
      loadNotes();
    }
  }, [id]);

  const loadInitiative = async () => {
    try {
      const response = await getInitiativeRequest(id!);
      if (response.data) setInitiative(response.data);
    } catch (err) {
      console.error('Failed to load initiative:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await getNotesRequest(id, 'initiative');
      if (response.data) setNotes(response.data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!initiative) return;
    setActionLoading(true);
    try {
      await updateInitiativeRequest(initiative._id, { status: newStatus as any });
      await loadInitiative();
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddTask = async () => {
    if (!initiative || !newTaskTitle.trim()) return;
    await addTaskRequest(initiative._id, newTaskTitle.trim());
    setNewTaskTitle('');
    await loadInitiative();
  };

  const handleToggleTask = async (taskId: string) => {
    if (!initiative) return;
    await toggleTaskRequest(initiative._id, taskId);
    await loadInitiative();
  };

  const handleRemoveTask = async (taskId: string) => {
    if (!initiative) return;
    await removeTaskRequest(initiative._id, taskId);
    await loadInitiative();
  };

  const handleArchive = async () => {
    if (!initiative) return;
    setActionLoading(true);
    try {
      await archiveInitiativeRequest(initiative._id);
      await loadInitiative();
      setShowArchiveConfirm(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!initiative) return;
    setActionLoading(true);
    try {
      await deleteInitiativeRequest(initiative._id);
      navigate('/community');
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!initiative || !newNote.trim()) return;
    await createNoteRequest({ entityId: initiative._id, entityType: 'initiative', content: newNote.trim(), isPrivate: true });
    setNewNote('');
    await loadNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNoteRequest(noteId);
    await loadNotes();
  };

  const handleSaveEdit = async () => {
    if (!initiative) return;
    setActionLoading(true);
    try {
      await updateInitiativeRequest(initiative._id, editData);
      await loadInitiative();
      setShowEditModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  if (loading) {
    return (
      <div
        className="flex min-h-[80vh] items-center justify-center"
        data-icod-id="src_pages_initiativedetail_tsx_7de4">
        <Spinner size="lg" data-icod-id="src_pages_initiativedetail_tsx_1e7f" />
      </div>
    );
  }

  if (!initiative) {
    return (
      <EmptyState
        icon={Users}
        title="Initiative not found"
        action={{ label: 'Go Back', onClick: () => navigate('/community') } as any}
        data-icod-id="src_pages_initiativedetail_tsx_aedf" />
    );
  }

  const completedTasks = initiative.tasks?.filter(t => t.completed).length || 0;
  const totalTasks = initiative.tasks?.length || 0;

  return (
    <div
      className="space-y-6 p-4 pb-24"
      data-icod-id="src_pages_initiativedetail_tsx_d3ff">
      {/* Header */}
      <div
        className="flex items-start gap-3"
        data-icod-id="src_pages_initiativedetail_tsx_8c5b">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/community')}
          data-icod-id="src_pages_initiativedetail_tsx_fad1">
          <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_initiativedetail_tsx_253a" />
        </Button>
        <div
          className="flex-1 min-w-0"
          data-icod-id="src_pages_initiativedetail_tsx_a229">
          <div
            className="flex items-center gap-2 mb-1 flex-wrap"
            data-icod-id="src_pages_initiativedetail_tsx_4b67">
            <span
              className={`rounded-full px-2 py-0.5 text-xs font-medium ${statusColors[initiative.status] || statusColors.planned}`}
              data-icod-id="src_pages_initiativedetail_tsx_6aa8">
              {initiative.status.replace('-', ' ')}
            </span>
            <span
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_initiativedetail_tsx_abf6">{initiative.category}</span>
            {initiative.template && (
              <span
                className="rounded bg-accent/20 px-1.5 py-0.5 text-[10px] font-medium text-accent-foreground"
                data-icod-id="src_pages_initiativedetail_tsx_789f">Template</span>
            )}
          </div>
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_initiativedetail_tsx_8b75">{initiative.title}</h1>
          {initiative.location && (
            <div
              className="mt-1 flex items-center gap-1 text-sm text-muted-foreground"
              data-icod-id="src_pages_initiativedetail_tsx_421e">
              <MapPin className="h-3 w-3" data-icod-id="src_pages_initiativedetail_tsx_c2eb" />
              {initiative.location}
            </div>
          )}
        </div>
        <div
          className="flex shrink-0 gap-1"
          data-icod-id="src_pages_initiativedetail_tsx_81d4">
          <ShareButton
            title={initiative.title}
            description={initiative.description}
            data-icod-id="src_pages_initiativedetail_tsx_7eb8" />
          <Button
            variant="ghost"
            size="icon"
            onClick={() => { setEditData({ title: initiative.title, description: initiative.description, category: initiative.category, location: initiative.location }); setShowEditModal(true); }}
            data-icod-id="src_pages_initiativedetail_tsx_c214">
            <Pencil className="h-4 w-4" data-icod-id="src_pages_initiativedetail_tsx_5af8" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowDeleteConfirm(true)}
            className="text-destructive hover:text-destructive"
            data-icod-id="src_pages_initiativedetail_tsx_2efa">
            <Trash2 className="h-4 w-4" data-icod-id="src_pages_initiativedetail_tsx_9de1" />
          </Button>
        </div>
      </div>
      {/* Description */}
      <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_c6d8">
        <h3
          className="font-semibold text-foreground mb-2"
          data-icod-id="src_pages_initiativedetail_tsx_c121">About</h3>
        <p
          className="text-muted-foreground"
          data-icod-id="src_pages_initiativedetail_tsx_8c9c">{initiative.description}</p>
      </Card>
      {/* Progress */}
      {totalTasks > 0 && (
        <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_3e42">
          <h3
            className="font-semibold text-foreground mb-2"
            data-icod-id="src_pages_initiativedetail_tsx_e287">Progress</h3>
          <ProgressBar
            current={completedTasks}
            total={totalTasks}
            showLabel
            data-icod-id="src_pages_initiativedetail_tsx_3927" />
        </Card>
      )}
      {/* Objectives */}
      {initiative.objectives && initiative.objectives.length > 0 && (
        <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_b5c8">
          <div
            className="flex items-center gap-2 mb-3"
            data-icod-id="src_pages_initiativedetail_tsx_e303">
            <Target
              className="h-4 w-4 text-primary"
              data-icod-id="src_pages_initiativedetail_tsx_ff4b" />
            <h3
              className="font-semibold text-foreground"
              data-icod-id="src_pages_initiativedetail_tsx_2203">Objectives</h3>
          </div>
          <ul className="space-y-2" data-icod-id="src_pages_initiativedetail_tsx_7da1">
            {initiative.objectives.map((obj, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-sm text-muted-foreground"
                data-icod-id={`src_pages_initiativedetail_tsx_cc89_${i}`}>
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                  data-icod-id={`src_pages_initiativedetail_tsx_7c6d_${i}`} />
                {obj}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {/* Tasks / Checklist */}
      <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_3e18">
        <div
          className="flex items-center justify-between mb-3"
          data-icod-id="src_pages_initiativedetail_tsx_7381">
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_initiativedetail_tsx_c3e2">
            <CheckCircle
              className="h-4 w-4 text-primary"
              data-icod-id="src_pages_initiativedetail_tsx_c9d3" />
            <h3
              className="font-semibold text-foreground"
              data-icod-id="src_pages_initiativedetail_tsx_80c0">Tasks ({completedTasks}/{totalTasks})</h3>
          </div>
        </div>
        <div className="space-y-2" data-icod-id="src_pages_initiativedetail_tsx_1b00">
          {initiative.tasks?.map(task => (
            <ChecklistItem
              key={task._id}
              task={task}
              onToggle={handleToggleTask}
              onRemove={handleRemoveTask}
              data-icod-id="src_pages_initiativedetail_tsx_6e6f" />
          ))}
          {(!initiative.tasks || initiative.tasks.length === 0) && (
            <p
              className="text-sm text-muted-foreground py-2"
              data-icod-id="src_pages_initiativedetail_tsx_dfc1">No tasks yet. Add one below.</p>
          )}
        </div>
        <div
          className="mt-3 flex gap-2"
          data-icod-id="src_pages_initiativedetail_tsx_3f30">
          <Input
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="Add a task..."
            onKeyDown={(e) => e.key === 'Enter' && handleAddTask()}
            data-icod-id="src_pages_initiativedetail_tsx_db34" />
          <Button
            variant="outline"
            size="sm"
            onClick={handleAddTask}
            disabled={!newTaskTitle.trim()}
            data-icod-id="src_pages_initiativedetail_tsx_0f87">
            <Plus className="h-4 w-4" data-icod-id="src_pages_initiativedetail_tsx_bdc1" />
          </Button>
        </div>
      </Card>
      {/* Details Grid */}
      <div
        className="grid grid-cols-2 gap-3"
        data-icod-id="src_pages_initiativedetail_tsx_dc23">
        {initiative.participants.length > 0 && (
          <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_b3b0">
            <div
              className="flex items-center gap-2 text-primary mb-1"
              data-icod-id="src_pages_initiativedetail_tsx_b6cf">
              <Users className="h-4 w-4" data-icod-id="src_pages_initiativedetail_tsx_1b7e" />
              <span
                className="text-sm font-medium"
                data-icod-id="src_pages_initiativedetail_tsx_e36f">Participants</span>
            </div>
            <p
              className="text-foreground text-sm"
              data-icod-id="src_pages_initiativedetail_tsx_d312">{initiative.participants.join(', ')}</p>
          </Card>
        )}
        {initiative.frequency && (
          <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_aed1">
            <div
              className="flex items-center gap-2 text-accent mb-1"
              data-icod-id="src_pages_initiativedetail_tsx_3d16">
              <Calendar className="h-4 w-4" data-icod-id="src_pages_initiativedetail_tsx_c244" />
              <span
                className="text-sm font-medium"
                data-icod-id="src_pages_initiativedetail_tsx_cf36">Frequency</span>
            </div>
            <p
              className="text-foreground capitalize"
              data-icod-id="src_pages_initiativedetail_tsx_3db2">{initiative.frequency}</p>
          </Card>
        )}
        {initiative.impactLevel && (
          <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_28f8">
            <div
              className="flex items-center gap-2 text-secondary mb-1"
              data-icod-id="src_pages_initiativedetail_tsx_1ed2">
              <TrendingUp className="h-4 w-4" data-icod-id="src_pages_initiativedetail_tsx_c294" />
              <span
                className="text-sm font-medium"
                data-icod-id="src_pages_initiativedetail_tsx_77d6">Impact Level</span>
            </div>
            <p
              className="text-foreground capitalize"
              data-icod-id="src_pages_initiativedetail_tsx_3724">{initiative.impactLevel}</p>
          </Card>
        )}
        {initiative.completedAt && (
          <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_b719">
            <div
              className="flex items-center gap-2 text-primary mb-1"
              data-icod-id="src_pages_initiativedetail_tsx_f956">
              <CheckCircle className="h-4 w-4" data-icod-id="src_pages_initiativedetail_tsx_4521" />
              <span
                className="text-sm font-medium"
                data-icod-id="src_pages_initiativedetail_tsx_5bde">Completed</span>
            </div>
            <p
              className="text-foreground"
              data-icod-id="src_pages_initiativedetail_tsx_208d">{new Date(initiative.completedAt).toLocaleDateString()}</p>
          </Card>
        )}
      </div>
      {/* Status Transitions */}
      {initiative.status !== 'archived' && (
        <div
          className="flex flex-wrap gap-2"
          data-icod-id="src_pages_initiativedetail_tsx_30e7">
          {initiative.status === 'planned' && (
            <Button
              onClick={() => handleStatusChange('active')}
              loading={actionLoading}
              data-icod-id="src_pages_initiativedetail_tsx_b045">Start Initiative</Button>
          )}
          {initiative.status === 'active' && (
            <Button
              onClick={() => handleStatusChange('completed')}
              loading={actionLoading}
              data-icod-id="src_pages_initiativedetail_tsx_5f6e">
              <CheckCircle
                className="mr-2 h-4 w-4"
                data-icod-id="src_pages_initiativedetail_tsx_9873" />
              Mark Complete
            </Button>
          )}
          {initiative.status !== 'completed' && (
            <Button
              variant="outline"
              onClick={() => setShowArchiveConfirm(true)}
              data-icod-id="src_pages_initiativedetail_tsx_aa18">
              <Archive
                className="mr-2 h-4 w-4"
                data-icod-id="src_pages_initiativedetail_tsx_0023" />
              Archive
            </Button>
          )}
        </div>
      )}
      {/* Notes Section */}
      <Card className="p-4" data-icod-id="src_pages_initiativedetail_tsx_1846">
        <div
          className="flex items-center gap-2 mb-3"
          data-icod-id="src_pages_initiativedetail_tsx_4948">
          <FileText
            className="h-4 w-4 text-primary"
            data-icod-id="src_pages_initiativedetail_tsx_baef" />
          <h3
            className="font-semibold text-foreground"
            data-icod-id="src_pages_initiativedetail_tsx_4e6d">Notes & Reflections</h3>
        </div>
        <div className="space-y-3" data-icod-id="src_pages_initiativedetail_tsx_ffdc">
          {notes.map(note => (
            <div
              key={note._id}
              className="rounded border border-border p-3"
              data-icod-id={`src_pages_initiativedetail_tsx_b8dc_${note._id}`}>
              <p
                className="text-sm text-foreground whitespace-pre-wrap"
                data-icod-id={`src_pages_initiativedetail_tsx_fb45_${note._id}`}>{note.content}</p>
              <div
                className="mt-2 flex items-center justify-between"
                data-icod-id={`src_pages_initiativedetail_tsx_31ba_${note._id}`}>
                <span
                  className="text-xs text-muted-foreground"
                  data-icod-id={`src_pages_initiativedetail_tsx_0bd4_${note._id}`}>{new Date(note.createdAt).toLocaleDateString()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note._id)}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  data-icod-id={`src_pages_initiativedetail_tsx_f674_${note._id}`}>
                  <Trash2
                    className="h-3 w-3"
                    data-icod-id={`src_pages_initiativedetail_tsx_d270_${note._id}`} />
                </Button>
              </div>
            </div>
          ))}
          {notes.length === 0 && <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_initiativedetail_tsx_55e2">No notes yet.</p>}
        </div>
        <div
          className="mt-3 flex gap-2"
          data-icod-id="src_pages_initiativedetail_tsx_54b4">
          <textarea
            className={inputClass('resize-none flex-1')}
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a note or reflection..."
            data-icod-id="src_pages_initiativedetail_tsx_c8a1" />
          <Button
            variant="outline"
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="self-end"
            data-icod-id="src_pages_initiativedetail_tsx_c1fb">Add</Button>
        </div>
      </Card>
      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Initiative"
        description="Are you sure you want to delete this initiative? This cannot be undone."
        confirmLabel="Delete"
        loading={actionLoading}
        data-icod-id="src_pages_initiativedetail_tsx_5d9e" />
      <ConfirmDialog
        open={showArchiveConfirm}
        onClose={() => setShowArchiveConfirm(false)}
        onConfirm={handleArchive}
        title="Archive Initiative"
        description="This will move the initiative to your archived list. You can still view it later."
        confirmLabel="Archive"
        variant="primary"
        loading={actionLoading}
        data-icod-id="src_pages_initiativedetail_tsx_ab08" />
      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Initiative"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_initiativedetail_tsx_3e03">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              data-icod-id="src_pages_initiativedetail_tsx_7084">Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              loading={actionLoading}
              data-icod-id="src_pages_initiativedetail_tsx_36f4">Save</Button>
          </div>
        }
        data-icod-id="src_pages_initiativedetail_tsx_ed7b">
        <div className="space-y-4" data-icod-id="src_pages_initiativedetail_tsx_5c5c">
          <Field label="Title" required data-icod-id="src_pages_initiativedetail_tsx_b0ac">
            <Input
              value={editData.title || ''}
              onChange={(e) => setEditData({ ...editData, title: e.target.value })}
              data-icod-id="src_pages_initiativedetail_tsx_45cd" />
          </Field>
          <Field
            label="Description"
            required
            data-icod-id="src_pages_initiativedetail_tsx_a5ab">
            <textarea
              className={inputClass('resize-none')}
              rows={3}
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              data-icod-id="src_pages_initiativedetail_tsx_c53d" />
          </Field>
          <Field label="Category" data-icod-id="src_pages_initiativedetail_tsx_2233">
            <Input
              value={editData.category || ''}
              onChange={(e) => setEditData({ ...editData, category: e.target.value })}
              data-icod-id="src_pages_initiativedetail_tsx_1831" />
          </Field>
          <Field label="Location" data-icod-id="src_pages_initiativedetail_tsx_bdf4">
            <Input
              value={editData.location || ''}
              onChange={(e) => setEditData({ ...editData, location: e.target.value })}
              data-icod-id="src_pages_initiativedetail_tsx_c825" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
