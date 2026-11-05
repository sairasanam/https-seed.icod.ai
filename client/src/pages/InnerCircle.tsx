import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Button, Card, EmptyState, Modal, Field, Input, Spinner } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchPeople, addPerson, editPerson, removePerson } from '@/store/slices/peopleSlice';
import PersonCard from '@/components/PersonCard';
import TreeVisualization from '@/components/TreeVisualization';
import AISuggestionPanel from '@/components/AISuggestionPanel';
import ConfirmDialog from '@/components/ConfirmDialog';
import AnimatedBackground from '@/components/AnimatedBackground';
import { getInnerCircleGrowthRequest } from '@/services/treeService';
import { generateSuggestionsRequest } from '@/services/suggestionService';
import { getActionsRequest } from '@/services/actionService';
import { EmptyRelationshipsIllustration, NoSearchResultsIllustration } from '@/components/Illustrations';
import type { TreeGrowthData, Person, Action } from '../types';
import { Plus, Users, Search, ArrowUpDown, Edit2, Trash2 } from 'lucide-react';

const categoryOptions = [
  { value: '', label: 'All' },
  { value: 'family', label: 'Family' },
  { value: 'friend', label: 'Friend' },
  { value: 'colleague', label: 'Colleague' },
  { value: 'mentor', label: 'Mentor' },
  { value: 'mentee', label: 'Mentee' },
  { value: 'other', label: 'Other' },
];

const sortOptions = [
  { value: 'name', label: 'Name' },
  { value: 'lastContactDate', label: 'Last Contact' },
  { value: 'createdAt', label: 'Recently Added' },
];

export default function InnerCircle() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: people, status } = useAppSelector((state) => state.people);
  const [growthData, setGrowthData] = useState<TreeGrowthData | null>(null);
  const [actionsByPerson, setActionsByPerson] = useState<Record<string, Action[]>>({});
  
  // Modal states
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingPerson, setEditingPerson] = useState<Person | null>(null);
  const [deletingPerson, setDeletingPerson] = useState<Person | null>(null);
  
  // Filter and sort states
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    relationship: '',
    category: 'other',
    tags: '',
    interests: '',
    notes: '',
    birthday: '',
    anniversary: '',
  });

  useEffect(() => {
    dispatch(fetchPeople());
    // Fire all data loads in parallel for faster initial render
    Promise.allSettled([loadGrowthData(), loadActions()]);
  }, [dispatch]);

  const loadGrowthData = async () => {
    try {
      const response = await getInnerCircleGrowthRequest();
      if (response.data) setGrowthData(response.data);
    } catch (err) {
      console.error('Failed to load growth data:', err);
    }
  };

  const loadActions = async () => {
    try {
      const response = await getActionsRequest();
      if (response.data) {
        const grouped: Record<string, Action[]> = {};
        response.data.forEach(action => {
          if (action.personId) {
            if (!grouped[action.personId]) grouped[action.personId] = [];
            grouped[action.personId].push(action);
          }
        });
        setActionsByPerson(grouped);
      }
    } catch (err) {
      console.error('Failed to load actions:', err);
    }
  };

  const resetForm = () => {
    setFormData({
      name: '',
      relationship: '',
      category: 'other',
      tags: '',
      interests: '',
      notes: '',
      birthday: '',
      anniversary: '',
    });
  };

  const openEditModal = (person: Person) => {
    setEditingPerson(person);
    setFormData({
      name: person.name,
      relationship: person.relationship,
      category: person.category || 'other',
      tags: person.tags.join(', '),
      interests: person.interests?.join(', ') || '',
      notes: person.notes || '',
      birthday: person.importantDates?.birthday ? new Date(person.importantDates.birthday).toISOString().split('T')[0] : '',
      anniversary: person.importantDates?.anniversary ? new Date(person.importantDates.anniversary).toISOString().split('T')[0] : '',
    });
  };

  const handleSubmit = async () => {
    if (!formData.name || !formData.relationship) return;

    const personData = {
      name: formData.name,
      relationship: formData.relationship,
      category: formData.category as any,
      tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
      interests: formData.interests.split(',').map(i => i.trim()).filter(Boolean),
      notes: formData.notes || undefined,
      importantDates: {
        birthday: formData.birthday ? new Date(formData.birthday).toISOString() : undefined,
        anniversary: formData.anniversary ? new Date(formData.anniversary).toISOString() : undefined,
      },
    };

    if (editingPerson) {
      await dispatch(editPerson({ id: editingPerson._id, data: personData }));
      setEditingPerson(null);
    } else {
      await dispatch(addPerson(personData));
    }

    resetForm();
    setShowAddModal(false);
    loadGrowthData();
    loadActions();
  };

  const handleDelete = async () => {
    if (!deletingPerson) return;
    await dispatch(removePerson(deletingPerson._id));
    setDeletingPerson(null);
    loadGrowthData();
    loadActions();
  };

  // Filter and sort people
  const filteredPeople = people
    .filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.relationship.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = !categoryFilter || p.category === categoryFilter;
      return matchesSearch && matchesCategory;
    })
    .sort((a, b) => {
      let comparison = 0;
      if (sortBy === 'name') {
        comparison = a.name.localeCompare(b.name);
      } else if (sortBy === 'lastContactDate') {
        const dateA = a.lastContactDate ? new Date(a.lastContactDate).getTime() : 0;
        const dateB = b.lastContactDate ? new Date(b.lastContactDate).getTime() : 0;
        comparison = dateA - dateB;
      } else {
        comparison = new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
      }
      return sortOrder === 'asc' ? comparison : -comparison;
    });

  if (status === 'loading' && people.length === 0) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center"
        data-icod-id="src_pages_innercircle_tsx_8081">
        <AnimatedBackground variant="trees" data-icod-id="src_pages_innercircle_tsx_cddd" />
        <Spinner size="lg" data-icod-id="src_pages_innercircle_tsx_574e" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen"
      data-icod-id="src_pages_innercircle_tsx_bb1d">
      <AnimatedBackground variant="trees" data-icod-id="src_pages_innercircle_tsx_9e79" />
      <div
        className="relative z-10 space-y-6 p-4 pb-28 pt-safe max-w-2xl mx-auto"
        data-icod-id="src_pages_innercircle_tsx_8ede">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between pt-4"
        >
          <div className="space-y-1" data-icod-id="src_pages_innercircle_tsx_04e9">
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent"
              data-icod-id="src_pages_innercircle_tsx_8c6b">
              Inner Circle
            </h1>
            <p
              className="text-muted-foreground font-medium"
              data-icod-id="src_pages_innercircle_tsx_b866">Nurture your closest relationships</p>
          </div>
          <Button
            onClick={() => { resetForm(); setShowAddModal(true); }}
            size="icon"
            className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/30"
            data-icod-id="src_pages_innercircle_tsx_b14a">
            <Plus className="h-6 w-6" data-icod-id="src_pages_innercircle_tsx_eb11" />
          </Button>
        </motion.div>

        {/* Search and Filters */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative" data-icod-id="src_pages_innercircle_tsx_5bc2">
            <Search
              className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
              data-icod-id="src_pages_innercircle_tsx_b40e" />
            <Input
              placeholder="Search people..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-12 h-12 rounded-2xl glass border-border/30"
              data-icod-id="src_pages_innercircle_tsx_fbe4" />
          </div>

          {/* Category filter chips */}
          <div
            className="flex flex-wrap gap-2"
            data-icod-id="src_pages_innercircle_tsx_63de">
            {categoryOptions.map(opt => (
              <button
                key={opt.value}
                onClick={() => setCategoryFilter(opt.value)}
                className={`rounded-full px-4 py-2 text-sm font-semibold transition-all duration-300 ${
                  categoryFilter === opt.value
                    ? 'bg-gradient-to-r from-primary to-success text-white shadow-md shadow-primary/30'
                    : 'glass text-foreground hover:bg-white/20'
                }`}
                data-icod-id={`src_pages_innercircle_tsx_7770_${opt.value}`}>
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort options */}
          <div
            className="flex items-center gap-3 glass rounded-xl px-4 py-3"
            data-icod-id="src_pages_innercircle_tsx_af44">
            <ArrowUpDown
              className="h-4 w-4 text-muted-foreground"
              data-icod-id="src_pages_innercircle_tsx_453c" />
            <select
              className={inputClass('w-auto text-sm bg-transparent border-none focus:ring-0')}
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              data-icod-id="src_pages_innercircle_tsx_f5df">
              {sortOptions.map(opt => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-icod-id={`src_pages_innercircle_tsx_b3ae_${opt.value}`}>{opt.label}</option>
              ))}
            </select>
            <button
              onClick={() => setSortOrder(prev => prev === 'asc' ? 'desc' : 'asc')}
              className="ml-auto text-sm font-semibold text-primary hover:text-primary/80 transition-colors"
              data-icod-id="src_pages_innercircle_tsx_6c1b">
              {sortOrder === 'asc' ? '↑ Ascending' : '↓ Descending'}
            </button>
          </div>
        </motion.div>

        {/* Tree Visualization */}
        {growthData && growthData.branches.length > 0 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
          >
            <Card
              glass
              glow
              className="p-5 overflow-visible"
              data-icod-id="src_pages_innercircle_tsx_0a8c">
              <h3
                className="font-bold text-lg text-foreground mb-4"
                data-icod-id="src_pages_innercircle_tsx_2864">Your Relationship Tree</h3>
              <TreeVisualization
                growthData={growthData}
                treeType="inner"
                className="h-72"
                data-icod-id="src_pages_innercircle_tsx_31ac" />
            </Card>
          </motion.div>
        )}

        {/* AI Suggestions */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
        >
          <AISuggestionPanel
            onGenerate={async (request) => {
              const response = await generateSuggestionsRequest(request);
              return response.data?.suggestions || [];
            }}
            defaultTreeType="inner"
            data-icod-id="src_pages_innercircle_tsx_5a72" />
        </motion.div>

        {/* People List */}
        {filteredPeople.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.4 }}
          >
            <EmptyState
              illustration={people.length === 0 ? <EmptyRelationshipsIllustration data-icod-id="src_pages_innercircle_tsx_402c" /> : <NoSearchResultsIllustration data-icod-id="src_pages_innercircle_tsx_fe0e" />}
              title={people.length === 0 ? 'No people yet' : 'No matches found'}
              description={people.length === 0 ? 'Add people to your inner circle to start tracking intentional acts of kindness' : 'Try adjusting your search or filters'}
              action={people.length === 0 ? <Button
                onClick={() => setShowAddModal(true)}
                data-icod-id="src_pages_innercircle_tsx_e947">Add Person</Button> : undefined}
              data-icod-id="src_pages_innercircle_tsx_1941" />
          </motion.div>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2"
            data-icod-id="src_pages_innercircle_tsx_926c">
            {filteredPeople.map((person, i) => (
              <motion.div
                key={person._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + i * 0.05 }}
                className="relative group"
              >
                <PersonCard
                  person={person}
                  actions={actionsByPerson[person._id]}
                  onClick={() => navigate(`/person/${person._id}`)}
                  data-icod-id={`src_pages_innercircle_tsx_7e85_${person._id}`} />
                {/* Quick actions overlay */}
                <div
                  className="absolute right-3 top-3 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                  data-icod-id={`src_pages_innercircle_tsx_1beb_${person._id}`}>
                  <Button
                    variant="glass"
                    size="icon"
                    className="h-8 w-8 rounded-lg shadow-md"
                    onClick={(e) => { e.stopPropagation(); openEditModal(person); }}
                    data-icod-id={`src_pages_innercircle_tsx_eb6b_${person._id}`}>
                    <Edit2
                      className="h-4 w-4"
                      data-icod-id={`src_pages_innercircle_tsx_65ba_${person._id}`} />
                  </Button>
                  <Button
                    variant="glass"
                    size="icon"
                    className="h-8 w-8 rounded-lg shadow-md text-destructive"
                    onClick={(e) => { e.stopPropagation(); setDeletingPerson(person); }}
                    data-icod-id={`src_pages_innercircle_tsx_72b5_${person._id}`}>
                    <Trash2
                      className="h-4 w-4"
                      data-icod-id={`src_pages_innercircle_tsx_dbc7_${person._id}`} />
                  </Button>
                </div>
              </motion.div>
            ))}
          </div>
        )}
      </div>
      {/* Add/Edit Person Modal */}
      <Modal
        open={showAddModal || !!editingPerson}
        onClose={() => { setShowAddModal(false); setEditingPerson(null); resetForm(); }}
        title={editingPerson ? 'Edit Person' : 'Add Person'}
        footer={
          <div
            className="flex justify-end gap-3"
            data-icod-id="src_pages_innercircle_tsx_b678">
            <Button
              variant="outline"
              onClick={() => { setShowAddModal(false); setEditingPerson(null); resetForm(); }}
              data-icod-id="src_pages_innercircle_tsx_9536">
              Cancel
            </Button>
            <Button
              onClick={handleSubmit}
              disabled={!formData.name || !formData.relationship}
              data-icod-id="src_pages_innercircle_tsx_fdde">
              {editingPerson ? 'Update Person' : 'Add Person'}
            </Button>
          </div>
        }
        data-icod-id="src_pages_innercircle_tsx_9c57">
        <div
          className="space-y-5 max-h-[70vh] overflow-y-auto pr-2"
          data-icod-id="src_pages_innercircle_tsx_cd82">
          <Field label="Name" required data-icod-id="src_pages_innercircle_tsx_d2c8">
            <Input
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="John Doe"
              data-icod-id="src_pages_innercircle_tsx_d220" />
          </Field>
          
          <Field
            label="Relationship"
            required
            data-icod-id="src_pages_innercircle_tsx_eda8">
            <Input
              value={formData.relationship}
              onChange={(e) => setFormData({ ...formData, relationship: e.target.value })}
              placeholder="Friend, Family, Colleague..."
              data-icod-id="src_pages_innercircle_tsx_d992" />
          </Field>

          <Field label="Category" data-icod-id="src_pages_innercircle_tsx_d8e6">
            <select
              className={inputClass()}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              data-icod-id="src_pages_innercircle_tsx_2149">
              {categoryOptions.filter(o => o.value).map(opt => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-icod-id={`src_pages_innercircle_tsx_e68a_${opt.value}`}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field
            label="Tags (comma-separated)"
            data-icod-id="src_pages_innercircle_tsx_0ded">
            <Input
              value={formData.tags}
              onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
              placeholder="close, family, work..."
              data-icod-id="src_pages_innercircle_tsx_7b09" />
          </Field>

          <Field
            label="Interests (comma-separated)"
            data-icod-id="src_pages_innercircle_tsx_56e7">
            <Input
              value={formData.interests}
              onChange={(e) => setFormData({ ...formData, interests: e.target.value })}
              placeholder="reading, hiking, cooking..."
              data-icod-id="src_pages_innercircle_tsx_1a90" />
          </Field>

          <div
            className="grid grid-cols-2 gap-4"
            data-icod-id="src_pages_innercircle_tsx_ee0e">
            <Field label="Birthday" data-icod-id="src_pages_innercircle_tsx_ef32">
              <Input
                type="date"
                value={formData.birthday}
                onChange={(e) => setFormData({ ...formData, birthday: e.target.value })}
                data-icod-id="src_pages_innercircle_tsx_1dbc" />
            </Field>
            <Field label="Anniversary" data-icod-id="src_pages_innercircle_tsx_da23">
              <Input
                type="date"
                value={formData.anniversary}
                onChange={(e) => setFormData({ ...formData, anniversary: e.target.value })}
                data-icod-id="src_pages_innercircle_tsx_8467" />
            </Field>
          </div>

          <Field label="Notes" data-icod-id="src_pages_innercircle_tsx_6fd2">
            <textarea
              className={inputClass('resize-none min-h-[100px]')}
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              placeholder="Important things to remember..."
              data-icod-id="src_pages_innercircle_tsx_6aac" />
          </Field>
        </div>
      </Modal>
      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deletingPerson}
        onClose={() => setDeletingPerson(null)}
        onConfirm={handleDelete}
        title="Delete Person"
        description={`Are you sure you want to delete ${deletingPerson?.name}? This will also delete all their associated actions and cannot be undone.`}
        confirmLabel="Delete"
        variant="destructive"
        data-icod-id="src_pages_innercircle_tsx_3202" />
    </div>
  );
}
