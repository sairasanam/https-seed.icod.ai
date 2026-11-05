import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Field, Input, Modal, Spinner } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { getPersonRequest, updatePersonRequest, deletePersonRequest } from '@/services/personService';
import { 
  createActionRequest, 
  completeActionRequest, 
  undoActionRequest,
  postponeActionRequest,
  dismissActionRequest,
  deleteActionRequest,
  updateActionRequest,
  getActivityLogsRequest 
} from '@/services/actionService';
import ActionCard from '@/components/ActionCard';
import AISuggestionPanel from '@/components/AISuggestionPanel';
import ActivityTimeline from '@/components/ActivityTimeline';
import ConfirmDialog from '@/components/ConfirmDialog';
import ActionFormModal from '@/components/ActionFormModal';
import { generateSuggestionsRequest } from '@/services/suggestionService';
import type { Person, Action, ActivityLog } from '../types';
import { 
  ArrowLeft, 
  Plus, 
  User, 
  Edit2, 
  Trash2, 
  Calendar, 
  Filter,
  Clock,
  History
} from 'lucide-react';

const statusFilters = [
  { value: '', label: 'All' },
  { value: 'pending', label: 'Pending' },
  { value: 'completed', label: 'Completed' },
  { value: 'postponed', label: 'Postponed' },
  { value: 'dismissed', label: 'Dismissed' },
];

const sortOptions = [
  { value: 'createdAt', label: 'Created' },
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
];

export default function PersonDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [person, setPerson] = useState<Person | null>(null);
  const [actions, setActions] = useState<Action[]>([]);
  const [activityLogs, setActivityLogs] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [showAddActionModal, setShowAddActionModal] = useState(false);
  const [editingAction, setEditingAction] = useState<Action | null>(null);
  const [deletingAction, setDeletingAction] = useState<Action | null>(null);
  const [showEditPersonModal, setShowEditPersonModal] = useState(false);
  const [showDeletePersonModal, setShowDeletePersonModal] = useState(false);
  const [postponingAction, setPostponingAction] = useState<Action | null>(null);
  const [newDueDate, setNewDueDate] = useState('');
  
  // Filter and sort states
  const [statusFilter, setStatusFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [activeTab, setActiveTab] = useState<'actions' | 'history'>('actions');
  
  // Form states
  const [personFormData, setPersonFormData] = useState({
    name: '',
    relationship: '',
    category: 'other',
    tags: '',
    interests: '',
    notes: '',
  });

  useEffect(() => {
    if (id) loadPerson();
  }, [id]);

  const loadPerson = async () => {
    try {
      const response = await getPersonRequest(id!);
      if (response.data) {
        setPerson(response.data.person);
        setActions(response.data.actions);
      }
      loadActivityLogs();
    } catch (err) {
      console.error('Failed to load person:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadActivityLogs = async () => {
    try {
      const response = await getActivityLogsRequest({ personId: id, limit: 50 });
      if (response.data) setActivityLogs(response.data);
    } catch (err) {
      console.error('Failed to load activity logs:', err);
    }
  };

  const handleAddAction = async (data: Partial<Action>) => {
    await createActionRequest({ ...data, personId: id });
    loadPerson();
  };

  const handleEditAction = async (data: Partial<Action>) => {
    if (!editingAction) return;
    await updateActionRequest(editingAction._id, data);
    setEditingAction(null);
    loadPerson();
  };

  const handleToggleComplete = async (action: Action) => {
    if (action.status !== 'completed') {
      await completeActionRequest(action._id);
      loadPerson();
    }
  };

  const handleUndo = async (action: Action) => {
    await undoActionRequest(action._id);
    loadPerson();
  };

  const handlePostpone = async () => {
    if (!postponingAction || !newDueDate) return;
    await postponeActionRequest(postponingAction._id, new Date(newDueDate).toISOString());
    setPostponingAction(null);
    setNewDueDate('');
    loadPerson();
  };

  const handleDismiss = async (action: Action) => {
    await dismissActionRequest(action._id);
    loadPerson();
  };

  const handleDeleteAction = async () => {
    if (!deletingAction) return;
    await deleteActionRequest(deletingAction._id);
    setDeletingAction(null);
    loadPerson();
  };

  const openEditPersonModal = () => {
    if (!person) return;
    setPersonFormData({
      name: person.name,
      relationship: person.relationship,
      category: person.category || 'other',
      tags: person.tags.join(', '),
      interests: person.interests?.join(', ') || '',
      notes: person.notes || '',
    });
    setShowEditPersonModal(true);
  };

  const handleUpdatePerson = async () => {
    if (!person || !personFormData.name || !personFormData.relationship) return;
    
    await updatePersonRequest(person._id, {
      name: personFormData.name,
      relationship: personFormData.relationship,
      category: personFormData.category as any,
      tags: personFormData.tags.split(',').map(t => t.trim()).filter(Boolean),
      interests: personFormData.interests.split(',').map(i => i.trim()).filter(Boolean),
      notes: personFormData.notes || undefined,
    });
    
    setShowEditPersonModal(false);
    loadPerson();
  };

  const handleDeletePerson = async () => {
    if (!person) return;
    await deletePersonRequest(person._id);
    navigate('/inner-circle');
  };

  // Filter and sort actions
  const filteredActions = actions
    .filter(a => !statusFilter || a.status === statusFilter)
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'dueDate') {
        const dateA = a.dueDate ? new Date(a.dueDate).getTime() : Infinity;
        const dateB = b.dueDate ? new Date(b.dueDate).getTime() : Infinity;
        comparison = dateA - dateB;
      } else if (sortBy === 'priority') {
        const priorityOrder = { high: 3, medium: 2, low: 1 };
        const prioA = priorityOrder[a.priority as keyof typeof priorityOrder] || 0;
        const prioB = priorityOrder[b.priority as keyof typeof priorityOrder] || 0;
        comparison = prioA - prioB;
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  // Stats
  const pendingCount = actions.filter(a => a.status === 'pending').length;
  const overdueCount = actions.filter(a => 
    a.status === 'pending' && a.dueDate && new Date(a.dueDate) < new Date()
  ).length;
  const completedCount = actions.filter(a => a.status === 'completed').length;

  if (loading) {
    return (
      <div
        className="flex min-h-[80vh] items-center justify-center"
        data-icod-id="src_pages_persondetail_tsx_270e">
        <Spinner size="lg" data-icod-id="src_pages_persondetail_tsx_4021" />
      </div>
    );
  }

  if (!person) {
    return (
      <EmptyState
        icon={User}
        title="Person not found"
        action={<Button
          onClick={() => navigate('/inner-circle')}
          data-icod-id="src_pages_persondetail_tsx_f4c7">Go Back</Button>}
        data-icod-id="src_pages_persondetail_tsx_fbb9" />
    );
  }

  return (
    <div
      className="space-y-6 p-4 pb-24"
      data-icod-id="src_pages_persondetail_tsx_4fb9">
      {/* Header */}
      <div
        className="flex items-start justify-between"
        data-icod-id="src_pages_persondetail_tsx_756f">
        <div
          className="flex items-center gap-3"
          data-icod-id="src_pages_persondetail_tsx_4248">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/inner-circle')}
            data-icod-id="src_pages_persondetail_tsx_b05d">
            <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_persondetail_tsx_fa6f" />
          </Button>
          <div data-icod-id="src_pages_persondetail_tsx_e2e7">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_persondetail_tsx_4a59">
              <h1
                className="text-2xl font-bold text-foreground"
                data-icod-id="src_pages_persondetail_tsx_e8d5">{person.name}</h1>
              {person.category && (
                <span
                  className="rounded-full bg-primary/10 px-2 py-0.5 text-xs capitalize text-primary"
                  data-icod-id="src_pages_persondetail_tsx_1962">
                  {person.category}
                </span>
              )}
            </div>
            <p
              className="text-muted-foreground"
              data-icod-id="src_pages_persondetail_tsx_afd6">{person.relationship}</p>
          </div>
        </div>
        <div className="flex gap-1" data-icod-id="src_pages_persondetail_tsx_e260">
          <Button
            variant="ghost"
            size="icon"
            onClick={openEditPersonModal}
            data-icod-id="src_pages_persondetail_tsx_ef04">
            <Edit2 className="h-4 w-4" data-icod-id="src_pages_persondetail_tsx_eb7c" />
          </Button>
          <Button
            variant="ghost"
            size="icon"
            className="text-destructive"
            onClick={() => setShowDeletePersonModal(true)}
            data-icod-id="src_pages_persondetail_tsx_eab0">
            <Trash2 className="h-4 w-4" data-icod-id="src_pages_persondetail_tsx_8635" />
          </Button>
        </div>
      </div>
      {/* Stats Cards */}
      <div
        className="grid grid-cols-3 gap-3"
        data-icod-id="src_pages_persondetail_tsx_ebb9">
        <Card
          className="p-3 text-center"
          data-icod-id="src_pages_persondetail_tsx_01c3">
          <div
            className="text-2xl font-bold text-primary"
            data-icod-id="src_pages_persondetail_tsx_2e7e">{pendingCount}</div>
          <div
            className="text-xs text-muted-foreground"
            data-icod-id="src_pages_persondetail_tsx_d24e">Pending</div>
        </Card>
        <Card
          className={`p-3 text-center ${overdueCount > 0 ? 'border-destructive/50' : ''}`}
          data-icod-id="src_pages_persondetail_tsx_a756">
          <div
            className={`text-2xl font-bold ${overdueCount > 0 ? 'text-destructive' : 'text-muted-foreground'}`}
            data-icod-id="src_pages_persondetail_tsx_0bd2">
            {overdueCount}
          </div>
          <div
            className="text-xs text-muted-foreground"
            data-icod-id="src_pages_persondetail_tsx_9282">Overdue</div>
        </Card>
        <Card
          className="p-3 text-center"
          data-icod-id="src_pages_persondetail_tsx_53d0">
          <div
            className="text-2xl font-bold text-success"
            data-icod-id="src_pages_persondetail_tsx_7394">{completedCount}</div>
          <div
            className="text-xs text-muted-foreground"
            data-icod-id="src_pages_persondetail_tsx_2797">Completed</div>
        </Card>
      </div>
      {/* Tags and Interests */}
      {(person.tags.length > 0 || person.interests?.length > 0) && (
        <Card className="p-4 space-y-3" data-icod-id="src_pages_persondetail_tsx_4cee">
          {person.tags.length > 0 && (
            <div data-icod-id="src_pages_persondetail_tsx_464a">
              <h3
                className="text-sm font-medium text-muted-foreground mb-1"
                data-icod-id="src_pages_persondetail_tsx_5332">Tags</h3>
              <div
                className="flex flex-wrap gap-1"
                data-icod-id="src_pages_persondetail_tsx_56d4">
                {person.tags.map(tag => (
                  <span
                    key={tag}
                    className="rounded-full bg-secondary px-2 py-0.5 text-xs text-secondary-foreground"
                    data-icod-id={`src_pages_persondetail_tsx_2ec3_${tag}`}>
                    {tag}
                  </span>
                ))}
              </div>
            </div>
          )}
          {person.interests && person.interests.length > 0 && (
            <div data-icod-id="src_pages_persondetail_tsx_f13d">
              <h3
                className="text-sm font-medium text-muted-foreground mb-1"
                data-icod-id="src_pages_persondetail_tsx_58ea">Interests</h3>
              <div
                className="flex flex-wrap gap-1"
                data-icod-id="src_pages_persondetail_tsx_ea1b">
                {person.interests.map(interest => (
                  <span
                    key={interest}
                    className="rounded-full bg-accent/20 px-2 py-0.5 text-xs text-accent-foreground"
                    data-icod-id={`src_pages_persondetail_tsx_419f_${interest}`}>
                    {interest}
                  </span>
                ))}
              </div>
            </div>
          )}
        </Card>
      )}
      {/* Important Dates */}
      {person.importantDates && (person.importantDates.birthday || person.importantDates.anniversary) && (
        <Card className="p-4" data-icod-id="src_pages_persondetail_tsx_ff7a">
          <h3
            className="text-sm font-medium text-muted-foreground mb-2 flex items-center gap-2"
            data-icod-id="src_pages_persondetail_tsx_7e6a">
            <Calendar className="h-4 w-4" data-icod-id="src_pages_persondetail_tsx_d386" />
            Important Dates
          </h3>
          <div
            className="space-y-1 text-sm"
            data-icod-id="src_pages_persondetail_tsx_f340">
            {person.importantDates.birthday && (
              <div data-icod-id="src_pages_persondetail_tsx_cd34">Birthday: {new Date(person.importantDates.birthday).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
            )}
            {person.importantDates.anniversary && (
              <div data-icod-id="src_pages_persondetail_tsx_9e83">Anniversary: {new Date(person.importantDates.anniversary).toLocaleDateString(undefined, { month: 'long', day: 'numeric' })}</div>
            )}
          </div>
        </Card>
      )}
      {/* Notes */}
      {person.notes && (
        <Card className="p-4" data-icod-id="src_pages_persondetail_tsx_1b2f">
          <h3
            className="font-semibold text-foreground mb-2"
            data-icod-id="src_pages_persondetail_tsx_1c1f">Notes</h3>
          <p
            className="text-muted-foreground whitespace-pre-wrap"
            data-icod-id="src_pages_persondetail_tsx_84b6">{person.notes}</p>
        </Card>
      )}
      {/* AI Suggestions */}
      <AISuggestionPanel
        onGenerate={async (request) => {
          const response = await generateSuggestionsRequest(request);
          return response.data?.suggestions || [];
        }}
        defaultTreeType="inner"
        data-icod-id="src_pages_persondetail_tsx_aa6b" />
      {/* Tabs */}
      <div
        className="flex gap-1 border-b border-border"
        data-icod-id="src_pages_persondetail_tsx_4a88">
        <button
          onClick={() => setActiveTab('actions')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'actions' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          data-icod-id="src_pages_persondetail_tsx_ff5c">
          Actions
        </button>
        <button
          onClick={() => setActiveTab('history')}
          className={`px-4 py-2 text-sm font-medium transition-colors ${
            activeTab === 'history' 
              ? 'border-b-2 border-primary text-primary' 
              : 'text-muted-foreground hover:text-foreground'
          }`}
          data-icod-id="src_pages_persondetail_tsx_446d">
          <div
            className="flex items-center gap-1"
            data-icod-id="src_pages_persondetail_tsx_9044">
            <History className="h-3 w-3" data-icod-id="src_pages_persondetail_tsx_5983" />
            History
          </div>
        </button>
      </div>
      {activeTab === 'actions' && (
        <>
          {/* Actions Header */}
          <div
            className="flex items-center justify-between"
            data-icod-id="src_pages_persondetail_tsx_5636">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_persondetail_tsx_30a1">
              <h2
                className="text-lg font-semibold text-foreground"
                data-icod-id="src_pages_persondetail_tsx_a782">Actions</h2>
              <span
                className="text-sm text-muted-foreground"
                data-icod-id="src_pages_persondetail_tsx_cb81">({filteredActions.length})</span>
            </div>
            <Button
              size="sm"
              onClick={() => setShowAddActionModal(true)}
              data-icod-id="src_pages_persondetail_tsx_c4b1">
              <Plus className="mr-1 h-4 w-4" data-icod-id="src_pages_persondetail_tsx_4f81" />
              Add Action
            </Button>
          </div>

          {/* Filters */}
          <div
            className="flex flex-wrap gap-2"
            data-icod-id="src_pages_persondetail_tsx_d1c5">
            {statusFilters.map(filter => (
              <button
                key={filter.value}
                onClick={() => setStatusFilter(filter.value)}
                className={`rounded-full px-3 py-1 text-xs transition-colors ${
                  statusFilter === filter.value
                    ? 'bg-primary text-primary-foreground'
                    : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'
                }`}
                data-icod-id={`src_pages_persondetail_tsx_8bf7_${filter.value}`}>
                {filter.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div
            className="flex items-center gap-2"
            data-icod-id="src_pages_persondetail_tsx_4303">
            <Filter
              className="h-4 w-4 text-muted-foreground"
              data-icod-id="src_pages_persondetail_tsx_10fa" />
            <select
              className={inputClass('w-auto text-sm')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              data-icod-id="src_pages_persondetail_tsx_1303">
              {sortOptions.map(opt => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-icod-id={`src_pages_persondetail_tsx_ad2f_${opt.value}`}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="text-sm text-muted-foreground hover:text-foreground"
              data-icod-id="src_pages_persondetail_tsx_04c8">
              {sortOrder === 'asc' ? '↑' : '↓'}
            </button>
          </div>

          {/* Actions List */}
          {filteredActions.length === 0 ? (
            <EmptyState
              icon={Clock}
              title={actions.length === 0 ? 'No actions yet' : 'No matching actions'}
              description={actions.length === 0 ? 'Log your first intentional act for this person' : 'Try adjusting your filters'}
              action={actions.length === 0 ? <Button
                onClick={() => setShowAddActionModal(true)}
                data-icod-id="src_pages_persondetail_tsx_ce98">Add Action</Button> : undefined}
              data-icod-id="src_pages_persondetail_tsx_537c" />
          ) : (
            <div className="space-y-3" data-icod-id="src_pages_persondetail_tsx_07ad">
              {filteredActions.map(action => (
                <ActionCard
                  key={action._id}
                  action={action}
                  onToggleComplete={handleToggleComplete}
                  onUndo={handleUndo}
                  onPostpone={(a) => { setPostponingAction(a); setNewDueDate(''); }}
                  onDismiss={handleDismiss}
                  onClick={(a) => setEditingAction(a)}
                  data-icod-id={`src_pages_persondetail_tsx_9d4f_${action._id}`} />
              ))}
            </div>
          )}
        </>
      )}
      {activeTab === 'history' && (
        <div className="space-y-4" data-icod-id="src_pages_persondetail_tsx_555d">
          <h2
            className="text-lg font-semibold text-foreground"
            data-icod-id="src_pages_persondetail_tsx_b0d8">Activity History</h2>
          <ActivityTimeline logs={activityLogs} data-icod-id="src_pages_persondetail_tsx_da39" />
        </div>
      )}
      {/* Add Action Modal */}
      <ActionFormModal
        open={showAddActionModal}
        onClose={() => setShowAddActionModal(false)}
        onSubmit={handleAddAction}
        title="Add Action"
        data-icod-id="src_pages_persondetail_tsx_3d3a" />
      {/* Edit Action Modal */}
      <ActionFormModal
        open={!!editingAction}
        onClose={() => setEditingAction(null)}
        onSubmit={handleEditAction}
        initialData={editingAction || undefined}
        title="Edit Action"
        data-icod-id="src_pages_persondetail_tsx_3836" />
      {/* Postpone Modal */}
      <Modal
        open={!!postponingAction}
        onClose={() => setPostponingAction(null)}
        title="Postpone Action"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_persondetail_tsx_50dc">
            <Button
              variant="outline"
              onClick={() => setPostponingAction(null)}
              data-icod-id="src_pages_persondetail_tsx_12e2">Cancel</Button>
            <Button
              onClick={handlePostpone}
              disabled={!newDueDate}
              data-icod-id="src_pages_persondetail_tsx_0314">Postpone</Button>
          </div>
        }
        data-icod-id="src_pages_persondetail_tsx_7531">
        <div className="space-y-4" data-icod-id="src_pages_persondetail_tsx_ac4b">
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_persondetail_tsx_e545">
            Select a new due date for "{postponingAction?.title}"
          </p>
          <Field label="New Due Date" data-icod-id="src_pages_persondetail_tsx_c254">
            <Input
              type="date"
              value={newDueDate}
              onChange={(e) => setNewDueDate(e.target.value)}
              min={new Date().toISOString().split('T')[0]}
              data-icod-id="src_pages_persondetail_tsx_d867" />
          </Field>
        </div>
      </Modal>
      {/* Delete Action Confirmation */}
      <ConfirmDialog
        open={!!deletingAction}
        onClose={() => setDeletingAction(null)}
        onConfirm={handleDeleteAction}
        title="Delete Action"
        description={`Are you sure you want to delete "${deletingAction?.title}"? This cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        data-icod-id="src_pages_persondetail_tsx_3b7a" />
      {/* Edit Person Modal */}
      <Modal
        open={showEditPersonModal}
        onClose={() => setShowEditPersonModal(false)}
        title="Edit Person"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_persondetail_tsx_ab17">
            <Button
              variant="outline"
              onClick={() => setShowEditPersonModal(false)}
              data-icod-id="src_pages_persondetail_tsx_938e">Cancel</Button>
            <Button
              onClick={handleUpdatePerson}
              disabled={!personFormData.name || !personFormData.relationship}
              data-icod-id="src_pages_persondetail_tsx_1b88">
              Update Person
            </Button>
          </div>
        }
        data-icod-id="src_pages_persondetail_tsx_bafc">
        <div
          className="space-y-4 max-h-[70vh] overflow-y-auto pr-2"
          data-icod-id="src_pages_persondetail_tsx_c8a5">
          <Field label="Name" required data-icod-id="src_pages_persondetail_tsx_55fb">
            <Input
              value={personFormData.name}
              onChange={(e) => setPersonFormData({ ...personFormData, name: e.target.value })}
              data-icod-id="src_pages_persondetail_tsx_a17e" />
          </Field>
          <Field
            label="Relationship"
            required
            data-icod-id="src_pages_persondetail_tsx_26b5">
            <Input
              value={personFormData.relationship}
              onChange={(e) => setPersonFormData({ ...personFormData, relationship: e.target.value })}
              data-icod-id="src_pages_persondetail_tsx_2018" />
          </Field>
          <Field label="Category" data-icod-id="src_pages_persondetail_tsx_3f1d">
            <select
              className={inputClass()}
              value={personFormData.category}
              onChange={(e) => setPersonFormData({ ...personFormData, category: e.target.value })}
              data-icod-id="src_pages_persondetail_tsx_e619">
              <option value="family" data-icod-id="src_pages_persondetail_tsx_5084">Family</option>
              <option value="friend" data-icod-id="src_pages_persondetail_tsx_4736">Friend</option>
              <option value="colleague" data-icod-id="src_pages_persondetail_tsx_55a9">Colleague</option>
              <option value="mentor" data-icod-id="src_pages_persondetail_tsx_3ed5">Mentor</option>
              <option value="mentee" data-icod-id="src_pages_persondetail_tsx_5a02">Mentee</option>
              <option value="other" data-icod-id="src_pages_persondetail_tsx_c3be">Other</option>
            </select>
          </Field>
          <Field
            label="Tags (comma-separated)"
            data-icod-id="src_pages_persondetail_tsx_0fee">
            <Input
              value={personFormData.tags}
              onChange={(e) => setPersonFormData({ ...personFormData, tags: e.target.value })}
              data-icod-id="src_pages_persondetail_tsx_9aa6" />
          </Field>
          <Field
            label="Interests (comma-separated)"
            data-icod-id="src_pages_persondetail_tsx_e7cc">
            <Input
              value={personFormData.interests}
              onChange={(e) => setPersonFormData({ ...personFormData, interests: e.target.value })}
              data-icod-id="src_pages_persondetail_tsx_3cb7" />
          </Field>
          <Field label="Notes" data-icod-id="src_pages_persondetail_tsx_9458">
            <textarea
              className={inputClass('resize-none')}
              rows={3}
              value={personFormData.notes}
              onChange={(e) => setPersonFormData({ ...personFormData, notes: e.target.value })}
              data-icod-id="src_pages_persondetail_tsx_6fef" />
          </Field>
        </div>
      </Modal>
      {/* Delete Person Confirmation */}
      <ConfirmDialog
        open={showDeletePersonModal}
        onClose={() => setShowDeletePersonModal(false)}
        onConfirm={handleDeletePerson}
        title="Delete Person"
        description={`Are you sure you want to delete ${person.name}? This will also delete all their associated actions and cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        data-icod-id="src_pages_persondetail_tsx_12b9" />
    </div>
  );
}
