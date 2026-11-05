import { useEffect, useState, useMemo, useCallback } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Button, Card, EmptyState, Modal, Field, Input, Spinner } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchInitiatives, addInitiative, fetchTemplates, createFromTemplate } from '@/store/slices/initiativesSlice';
import InitiativeCard from '@/components/InitiativeCard';
import TreeVisualization from '@/components/TreeVisualization';
import StatusTabs from '@/components/StatusTabs';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getCommunityGrowthRequest } from '@/services/treeService';
import { EmptyInitiativesIllustration, NoSearchResultsIllustration } from '@/components/Illustrations';
import type { TreeGrowthData, Initiative } from '../types';
import { Plus, Heart, Search, FileText, ChevronDown, ChevronUp, Copy } from 'lucide-react';

const STATUS_TABS = ['all', 'planned', 'active', 'completed', 'archived'];
const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Date Updated' },
  { value: 'dateCreated', label: 'Date Created' },
  { value: 'progress', label: 'Progress' },
];

export default function Community() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const { items: initiatives, templates, status } = useAppSelector((state) => state.initiatives);
  const [growthData, setGrowthData] = useState<TreeGrowthData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('updatedAt');
  const [showTemplates, setShowTemplates] = useState(false);
  const [newInitiative, setNewInitiative] = useState({
    title: '',
    description: '',
    category: '',
    participants: '',
    frequency: '',
    impactLevel: 'medium' as const,
    location: '',
    objectives: [] as string[],
    tasks: [] as string[],
    template: false,
  });
  const [newObjective, setNewObjective] = useState('');
  const [newTask, setNewTask] = useState('');

  // Re-fetch data whenever the community page becomes active (handles stale data after navigating back from detail pages)
  useEffect(() => {
    dispatch(fetchInitiatives());
    dispatch(fetchTemplates());
    // Fire growth data load in parallel with other fetches
    loadGrowthData();
  }, [dispatch, location.pathname]);

  const loadGrowthData = useCallback(async () => {
    try {
      const response = await getCommunityGrowthRequest();
      if (response.data) setGrowthData(response.data);
    } catch (err) {
      console.error('Failed to load growth data:', err);
    }
  }, []);

  const handleAddInitiative = async () => {
    if (!newInitiative.title || !newInitiative.description || !newInitiative.category) return;

    await dispatch(
      addInitiative({
        ...newInitiative,
        participants: newInitiative.participants.split(',').map(p => p.trim()).filter(Boolean),
        objectives: newInitiative.objectives.filter(Boolean),
        tasks: newInitiative.tasks.filter(Boolean).map(t => ({ title: t, completed: false })),
      })
    );

    setNewInitiative({
      title: '', description: '', category: '', participants: '', frequency: '',
      impactLevel: 'medium', location: '', objectives: [], tasks: [], template: false,
    });
    setNewObjective('');
    setNewTask('');
    setShowAddModal(false);
    loadGrowthData();
  };

  const handleUseTemplate = async (templateId: string) => {
    await dispatch(createFromTemplate(templateId));
    loadGrowthData();
  };

  const addObjective = () => {
    if (newObjective.trim()) {
      setNewInitiative(prev => ({ ...prev, objectives: [...prev.objectives, newObjective.trim()] }));
      setNewObjective('');
    }
  };

  const addTaskItem = () => {
    if (newTask.trim()) {
      setNewInitiative(prev => ({ ...prev, tasks: [...prev.tasks, newTask.trim()] }));
      setNewTask('');
    }
  };

  const filteredInitiatives = useMemo(() => {
    let result = initiatives.filter(i => !i.template);

    if (statusFilter !== 'all') {
      result = result.filter(i => i.status === statusFilter);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        i => i.title.toLowerCase().includes(q) || i.description.toLowerCase().includes(q) || i.category.toLowerCase().includes(q)
      );
    }

    if (sortBy === 'progress') {
      result.sort((a, b) => {
        const aPct = a.tasks.length > 0 ? a.tasks.filter(t => t.completed).length / a.tasks.length : 0;
        const bPct = b.tasks.length > 0 ? b.tasks.filter(t => t.completed).length / b.tasks.length : 0;
        return bPct - aPct;
      });
    }

    return result;
  }, [initiatives, statusFilter, searchQuery, sortBy]);

  if (status === 'loading' && initiatives.length === 0) {
    return (
      <div
        className="flex min-h-[80vh] items-center justify-center"
        data-icod-id="src_pages_community_tsx_ef6e">
        <Spinner size="lg" data-icod-id="src_pages_community_tsx_6bd5" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen"
      data-icod-id="src_pages_community_tsx_7e65">
      <AnimatedBackground variant="community" data-icod-id="src_pages_community_tsx_a273" />
      <div
        className="relative z-10 space-y-6 p-4 pb-24"
        data-icod-id="src_pages_community_tsx_8c2a">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_community_tsx_d244">
        <div data-icod-id="src_pages_community_tsx_3b61">
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_community_tsx_cfec">Community Initiatives</h1>
          <p
            className="text-muted-foreground"
            data-icod-id="src_pages_community_tsx_2a2e">Create positive change together</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="icon"
          data-icod-id="src_pages_community_tsx_6cfe">
          <Plus className="h-5 w-5" data-icod-id="src_pages_community_tsx_f347" />
        </Button>
      </div>
      {/* Search & Sort */}
      <div className="flex gap-2" data-icod-id="src_pages_community_tsx_08b7">
        <div className="relative flex-1" data-icod-id="src_pages_community_tsx_9640">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            data-icod-id="src_pages_community_tsx_2a0e" />
          <Input
            placeholder="Search initiatives..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-icod-id="src_pages_community_tsx_5e44" />
        </div>
        <select
          className={inputClass('w-auto')}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          data-icod-id="src_pages_community_tsx_cbd9">
          {SORT_OPTIONS.map(opt => (
            <option
              key={opt.value}
              value={opt.value}
              data-icod-id={`src_pages_community_tsx_bab2_${opt.value}`}>{opt.label}</option>
          ))}
        </select>
      </div>
      {/* Status Tabs */}
      <StatusTabs
        tabs={STATUS_TABS}
        selected={statusFilter}
        onSelect={setStatusFilter}
        data-icod-id="src_pages_community_tsx_ded0" />
      {/* Templates Section */}
      {templates.length > 0 && (
        <div
          className="rounded-lg border border-border"
          data-icod-id="src_pages_community_tsx_004a">
          <button
            onClick={() => setShowTemplates(!showTemplates)}
            className="flex w-full items-center justify-between p-3 text-sm font-medium text-foreground hover:bg-muted/50"
            data-icod-id="src_pages_community_tsx_c2bc">
            <div
              className="flex items-center gap-2"
              data-icod-id="src_pages_community_tsx_7762">
              <FileText
                className="h-4 w-4 text-primary"
                data-icod-id="src_pages_community_tsx_d560" />
              Browse Templates ({templates.length})
            </div>
            {showTemplates ? <ChevronUp className="h-4 w-4" data-icod-id="src_pages_community_tsx_59d7" /> : <ChevronDown className="h-4 w-4" data-icod-id="src_pages_community_tsx_b661" />}
          </button>
          {showTemplates && (
            <div
              className="border-t border-border p-3"
              data-icod-id="src_pages_community_tsx_97e9">
              <div
                className="grid gap-2 sm:grid-cols-2"
                data-icod-id="src_pages_community_tsx_a3d9">
                {templates.map(t => (
                  <Card
                    key={t._id}
                    className="flex items-center justify-between p-3"
                    data-icod-id={`src_pages_community_tsx_7918_${t._id}`}>
                    <div
                      className="min-w-0 flex-1"
                      data-icod-id={`src_pages_community_tsx_cbdf_${t._id}`}>
                      <p
                        className="font-medium text-foreground truncate"
                        data-icod-id={`src_pages_community_tsx_05c3_${t._id}`}>{t.title}</p>
                      <p
                        className="text-xs text-muted-foreground truncate"
                        data-icod-id={`src_pages_community_tsx_96a7_${t._id}`}>{t.category}</p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleUseTemplate(t._id)}
                      className="ml-2 shrink-0 gap-1"
                      data-icod-id={`src_pages_community_tsx_efb3_${t._id}`}>
                      <Copy
                        className="h-3 w-3"
                        data-icod-id={`src_pages_community_tsx_e5e3_${t._id}`} />
                      Use
                    </Button>
                  </Card>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
      {/* Tree Visualization */}
      {growthData && growthData.branches.length > 0 && (
        <Card className="p-4" data-icod-id="src_pages_community_tsx_c8d1">
          <h3
            className="font-semibold text-foreground mb-2"
            data-icod-id="src_pages_community_tsx_af86">Community Impact Tree</h3>
          <TreeVisualization
            growthData={growthData}
            treeType="community"
            className="h-64"
            data-icod-id="src_pages_community_tsx_cdf7" />
        </Card>
      )}
      {/* Initiatives List */}
      {filteredInitiatives.length === 0 ? (
        <EmptyState
          illustration={initiatives.filter(i => !i.template).length === 0 ? <EmptyInitiativesIllustration data-icod-id="src_pages_community_tsx_7d98" /> : <NoSearchResultsIllustration data-icod-id="src_pages_community_tsx_0f6c" />}
          title={initiatives.filter(i => !i.template).length === 0 ? 'No initiatives yet' : 'No matches found'}
          description={initiatives.filter(i => !i.template).length === 0 ? 'Start a community initiative to make a difference in your neighborhood' : 'Try adjusting your filters or search term'}
          action={initiatives.filter(i => !i.template).length === 0 ? { label: 'Create Initiative', onClick: () => setShowAddModal(true) } as any : undefined}
          data-icod-id="src_pages_community_tsx_b64b" />
      ) : (
        <div
          className="grid gap-3 sm:grid-cols-2"
          data-icod-id="src_pages_community_tsx_a0cb">
          {filteredInitiatives.map(initiative => (
            <InitiativeCard
              key={initiative._id}
              initiative={initiative}
              onClick={() => navigate(`/initiative/${initiative._id}`)}
              data-icod-id={`src_pages_community_tsx_e222_${initiative._id}`} />
          ))}
        </div>
      )}
      {/* Add Initiative Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Create Initiative"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_community_tsx_beee">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              data-icod-id="src_pages_community_tsx_5204">Cancel</Button>
            <Button
              onClick={handleAddInitiative}
              disabled={!newInitiative.title || !newInitiative.description || !newInitiative.category}
              data-icod-id="src_pages_community_tsx_16df">
              Create
            </Button>
          </div>
        }
        data-icod-id="src_pages_community_tsx_7086">
        <div
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          data-icod-id="src_pages_community_tsx_2a48">
          <Field label="Title" required data-icod-id="src_pages_community_tsx_ba0a">
            <Input
              value={newInitiative.title}
              onChange={(e) => setNewInitiative({ ...newInitiative, title: e.target.value })}
              placeholder="Neighborhood Cleanup Day"
              data-icod-id="src_pages_community_tsx_b931" />
          </Field>
          <Field label="Description" required data-icod-id="src_pages_community_tsx_b4e4">
            <textarea
              className={inputClass('resize-none')}
              rows={3}
              value={newInitiative.description}
              onChange={(e) => setNewInitiative({ ...newInitiative, description: e.target.value })}
              placeholder="Describe your initiative..."
              data-icod-id="src_pages_community_tsx_8773" />
          </Field>
          <Field label="Category" required data-icod-id="src_pages_community_tsx_5bf9">
            <Input
              value={newInitiative.category}
              onChange={(e) => setNewInitiative({ ...newInitiative, category: e.target.value })}
              placeholder="Environment, Support, Education..."
              data-icod-id="src_pages_community_tsx_e76c" />
          </Field>
          <Field label="Location (optional)" data-icod-id="src_pages_community_tsx_1000">
            <Input
              value={newInitiative.location}
              onChange={(e) => setNewInitiative({ ...newInitiative, location: e.target.value })}
              placeholder="City Park, Community Center..."
              data-icod-id="src_pages_community_tsx_da33" />
          </Field>
          <Field
            label="Participants (comma-separated)"
            data-icod-id="src_pages_community_tsx_fb4a">
            <Input
              value={newInitiative.participants}
              onChange={(e) => setNewInitiative({ ...newInitiative, participants: e.target.value })}
              placeholder="John, Sarah, Mike..."
              data-icod-id="src_pages_community_tsx_3688" />
          </Field>
          <Field label="Frequency" data-icod-id="src_pages_community_tsx_0bda">
            <select
              className={inputClass()}
              value={newInitiative.frequency}
              onChange={(e) => setNewInitiative({ ...newInitiative, frequency: e.target.value })}
              data-icod-id="src_pages_community_tsx_d2e8">
              <option value="" data-icod-id="src_pages_community_tsx_8430">Select frequency</option>
              <option value="one-time" data-icod-id="src_pages_community_tsx_4261">One-time</option>
              <option value="weekly" data-icod-id="src_pages_community_tsx_a765">Weekly</option>
              <option value="monthly" data-icod-id="src_pages_community_tsx_545c">Monthly</option>
              <option value="quarterly" data-icod-id="src_pages_community_tsx_431a">Quarterly</option>
              <option value="as-needed" data-icod-id="src_pages_community_tsx_2cfe">As needed</option>
            </select>
          </Field>
          <Field label="Impact Level" data-icod-id="src_pages_community_tsx_fb95">
            <select
              className={inputClass()}
              value={newInitiative.impactLevel}
              onChange={(e) => setNewInitiative({ ...newInitiative, impactLevel: e.target.value as any })}
              data-icod-id="src_pages_community_tsx_2bfa">
              <option value="low" data-icod-id="src_pages_community_tsx_88d7">Low</option>
              <option value="medium" data-icod-id="src_pages_community_tsx_dcb0">Medium</option>
              <option value="high" data-icod-id="src_pages_community_tsx_b76c">High</option>
            </select>
          </Field>

          {/* Objectives */}
          <Field label="Objectives" data-icod-id="src_pages_community_tsx_c9fc">
            <div className="space-y-2" data-icod-id="src_pages_community_tsx_86c7">
              {newInitiative.objectives.map((obj, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm"
                  data-icod-id={`src_pages_community_tsx_7591_${i}`}>
                  <span className="flex-1" data-icod-id={`src_pages_community_tsx_bb84_${i}`}>{obj}</span>
                  <button
                    onClick={() => setNewInitiative(prev => ({ ...prev, objectives: prev.objectives.filter((_, idx) => idx !== i) }))}
                    className="text-muted-foreground hover:text-destructive"
                    data-icod-id={`src_pages_community_tsx_f4ed_${i}`}>&times;</button>
                </div>
              ))}
              <div className="flex gap-2" data-icod-id="src_pages_community_tsx_2fd7">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add an objective..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addObjective())}
                  data-icod-id="src_pages_community_tsx_30d9" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addObjective}
                  disabled={!newObjective.trim()}
                  data-icod-id="src_pages_community_tsx_6c85">Add</Button>
              </div>
            </div>
          </Field>

          {/* Tasks */}
          <Field label="Initial Tasks" data-icod-id="src_pages_community_tsx_32da">
            <div className="space-y-2" data-icod-id="src_pages_community_tsx_6c8f">
              {newInitiative.tasks.map((task, i) => (
                <div
                  key={i}
                  className="flex items-center gap-2 rounded border border-border px-3 py-2 text-sm"
                  data-icod-id={`src_pages_community_tsx_ce7a_${i}`}>
                  <span className="flex-1" data-icod-id={`src_pages_community_tsx_1bc8_${i}`}>{task}</span>
                  <button
                    onClick={() => setNewInitiative(prev => ({ ...prev, tasks: prev.tasks.filter((_, idx) => idx !== i) }))}
                    className="text-muted-foreground hover:text-destructive"
                    data-icod-id={`src_pages_community_tsx_5e69_${i}`}>&times;</button>
                </div>
              ))}
              <div className="flex gap-2" data-icod-id="src_pages_community_tsx_027e">
                <Input
                  value={newTask}
                  onChange={(e) => setNewTask(e.target.value)}
                  placeholder="Add a task..."
                  onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), addTaskItem())}
                  data-icod-id="src_pages_community_tsx_7146" />
                <Button
                  variant="outline"
                  size="sm"
                  onClick={addTaskItem}
                  disabled={!newTask.trim()}
                  data-icod-id="src_pages_community_tsx_ac88">Add</Button>
              </div>
            </div>
          </Field>

          {/* Save as template toggle */}
          <label
            className="flex items-center gap-2 text-sm"
            data-icod-id="src_pages_community_tsx_1b5e">
            <input
              type="checkbox"
              checked={newInitiative.template}
              onChange={(e) => setNewInitiative({ ...newInitiative, template: e.target.checked })}
              className="rounded border-border"
              data-icod-id="src_pages_community_tsx_49a8" />
            Save as reusable template
          </label>
        </div>
      </Modal>
      </div>
    </div>
  );
}
