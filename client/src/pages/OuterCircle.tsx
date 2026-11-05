import { useEffect, useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Modal, Field, Input, Spinner } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchOrganizations, addOrganization, toggleFollowOrg, toggleFavoriteOrg } from '@/store/slices/organizationsSlice';
import OrganizationCard from '@/components/OrganizationCard';
import TreeVisualization from '@/components/TreeVisualization';
import TagFilter from '@/components/TagFilter';
import { getOuterCircleGrowthRequest } from '@/services/treeService';
import { EmptyOrganizationsIllustration, NoSearchResultsIllustration } from '@/components/Illustrations';
import type { TreeGrowthData, Organization } from '../types';
import { Plus, Globe, Search, Star } from 'lucide-react';

const TYPE_OPTIONS = ['all', 'nonprofit', 'church', 'environmental', 'community', 'cause', 'other'];
const SORT_OPTIONS = [
  { value: 'updatedAt', label: 'Date Updated' },
  { value: 'name', label: 'Name' },
  { value: 'dateAdded', label: 'Date Added' },
  { value: 'type', label: 'Type' },
];

export default function OuterCircle() {
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const { items: organizations, status } = useAppSelector((state) => state.organizations);
  const [growthData, setGrowthData] = useState<TreeGrowthData | null>(null);
  const [showAddModal, setShowAddModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTypes, setSelectedTypes] = useState<string[]>([]);
  const [showFavoritesOnly, setShowFavoritesOnly] = useState(false);
  const [sortBy, setSortBy] = useState('updatedAt');
  const [newOrg, setNewOrg] = useState({
    name: '',
    type: 'nonprofit' as const,
    description: '',
    website: '',
    donationLink: '',
    serviceLink: '',
    address: '',
    phone: '',
    email: '',
    donationUrl: '',
    volunteerUrl: '',
  });

  useEffect(() => {
    dispatch(fetchOrganizations());
    loadGrowthData();
  }, [dispatch]);

  const loadGrowthData = async () => {
    try {
      const response = await getOuterCircleGrowthRequest();
      if (response.data) setGrowthData(response.data);
    } catch (err) {
      console.error('Failed to load growth data:', err);
    }
  };

  const handleAddOrganization = async () => {
    if (!newOrg.name || !newOrg.type) return;

    await dispatch(addOrganization(newOrg));

    setNewOrg({ name: '', type: 'nonprofit', description: '', website: '', donationLink: '', serviceLink: '', address: '', phone: '', email: '', donationUrl: '', volunteerUrl: '' });
    setShowAddModal(false);
    loadGrowthData();
  };

  const handleToggleFollow = async (org: Organization) => {
    await dispatch(toggleFollowOrg(org._id));
    loadGrowthData();
  };

  const handleToggleFavorite = async (org: Organization) => {
    await dispatch(toggleFavoriteOrg(org._id));
  };

  const filteredOrgs = useMemo(() => {
    let result = [...organizations];

    if (selectedTypes.length > 0) {
      result = result.filter(o => selectedTypes.includes(o.type));
    }

    if (showFavoritesOnly) {
      result = result.filter(o => o.favorites);
    }

    if (searchQuery) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        o => o.name.toLowerCase().includes(q) || (o.description && o.description.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'name') result.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === 'dateAdded') result.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    else if (sortBy === 'type') result.sort((a, b) => a.type.localeCompare(b.type));

    return result;
  }, [organizations, selectedTypes, showFavoritesOnly, searchQuery, sortBy]);

  if (status === 'loading' && organizations.length === 0) {
    return (
      <div
        className="flex min-h-[80vh] items-center justify-center"
        data-icod-id="src_pages_outercircle_tsx_c37f">
        <Spinner size="lg" data-icod-id="src_pages_outercircle_tsx_b692" />
      </div>
    );
  }

  return (
    <div
      className="space-y-6 p-4 pb-24"
      data-icod-id="src_pages_outercircle_tsx_a3c3">
      {/* Header */}
      <div
        className="flex items-center justify-between"
        data-icod-id="src_pages_outercircle_tsx_2116">
        <div data-icod-id="src_pages_outercircle_tsx_3c54">
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_outercircle_tsx_2370">Outer Circle</h1>
          <p
            className="text-muted-foreground"
            data-icod-id="src_pages_outercircle_tsx_6b2f">Support causes and organizations</p>
        </div>
        <Button
          onClick={() => setShowAddModal(true)}
          size="icon"
          data-icod-id="src_pages_outercircle_tsx_7c5f">
          <Plus className="h-5 w-5" data-icod-id="src_pages_outercircle_tsx_c6eb" />
        </Button>
      </div>
      {/* Search & Sort */}
      <div className="flex gap-2" data-icod-id="src_pages_outercircle_tsx_b09a">
        <div className="relative flex-1" data-icod-id="src_pages_outercircle_tsx_d567">
          <Search
            className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground"
            data-icod-id="src_pages_outercircle_tsx_4b5f" />
          <Input
            placeholder="Search organizations..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-9"
            data-icod-id="src_pages_outercircle_tsx_3682" />
        </div>
        <select
          className={inputClass('w-auto')}
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          data-icod-id="src_pages_outercircle_tsx_e3ae">
          {SORT_OPTIONS.map(opt => (<option
            key={opt.value}
            value={opt.value}
            data-icod-id={`src_pages_outercircle_tsx_8e9c_${opt.value}`}>{opt.label}</option>))}
        </select>
      </div>
      {/* Type Filter Chips */}
      <TagFilter
        tags={TYPE_OPTIONS.filter(t => t !== 'all')}
        selectedTags={selectedTypes}
        onToggleTag={(tag) => setSelectedTypes(prev => prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag])}
        data-icod-id="src_pages_outercircle_tsx_5353" />
      {/* Favorites Toggle */}
      <button
        onClick={() => setShowFavoritesOnly(!showFavoritesOnly)}
        className={`flex items-center gap-2 rounded-full px-4 py-1.5 text-sm font-medium transition-colors ${showFavoritesOnly ? 'bg-primary text-primary-foreground' : 'bg-secondary text-secondary-foreground hover:bg-secondary/80'}`}
        data-icod-id="src_pages_outercircle_tsx_d0d6">
        <Star
          className={`h-3 w-3 ${showFavoritesOnly ? 'fill-current' : ''}`}
          data-icod-id="src_pages_outercircle_tsx_259a" />
        Favorites Only
      </button>
      {/* Tree Visualization */}
      {growthData && growthData.branches.length > 0 && (
        <Card className="p-4" data-icod-id="src_pages_outercircle_tsx_a3a1">
          <h3
            className="font-semibold text-foreground mb-2"
            data-icod-id="src_pages_outercircle_tsx_5c1f">Giving Tree</h3>
          <TreeVisualization
            growthData={growthData}
            treeType="outer"
            className="h-64"
            data-icod-id="src_pages_outercircle_tsx_af99" />
        </Card>
      )}
      {/* Organizations List */}
      {filteredOrgs.length === 0 ? (
        <EmptyState
          illustration={organizations.length === 0 ? <EmptyOrganizationsIllustration data-icod-id="src_pages_outercircle_tsx_58cf" /> : <NoSearchResultsIllustration data-icod-id="src_pages_outercircle_tsx_3490" />}
          title={organizations.length === 0 ? 'No organizations yet' : 'No matches found'}
          description={organizations.length === 0 ? 'Save organizations you want to support and follow their impact' : 'Try adjusting your filters or search term'}
          action={organizations.length === 0 ? { label: 'Add Organization', onClick: () => setShowAddModal(true) } as any : undefined}
          data-icod-id="src_pages_outercircle_tsx_9398" />
      ) : (
        <div
          className="grid gap-3 sm:grid-cols-2"
          data-icod-id="src_pages_outercircle_tsx_f2ec">
          {filteredOrgs.map(org => (
            <OrganizationCard
              key={org._id}
              organization={org}
              onToggleFollow={handleToggleFollow}
              onToggleFavorite={handleToggleFavorite}
              onClick={() => navigate(`/organization/${org._id}`)}
              data-icod-id={`src_pages_outercircle_tsx_c127_${org._id}`} />
          ))}
        </div>
      )}
      {/* Add Organization Modal */}
      <Modal
        open={showAddModal}
        onClose={() => setShowAddModal(false)}
        title="Add Organization"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_outercircle_tsx_a185">
            <Button
              variant="outline"
              onClick={() => setShowAddModal(false)}
              data-icod-id="src_pages_outercircle_tsx_4cb9">Cancel</Button>
            <Button
              onClick={handleAddOrganization}
              disabled={!newOrg.name}
              data-icod-id="src_pages_outercircle_tsx_7313">Add Organization</Button>
          </div>
        }
        data-icod-id="src_pages_outercircle_tsx_5e10">
        <div
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          data-icod-id="src_pages_outercircle_tsx_d4d3">
          <Field label="Name" required data-icod-id="src_pages_outercircle_tsx_bc9a">
            <Input
              value={newOrg.name}
              onChange={(e) => setNewOrg({ ...newOrg, name: e.target.value })}
              placeholder="Local Food Bank"
              data-icod-id="src_pages_outercircle_tsx_8cdc" />
          </Field>
          <Field label="Type" required data-icod-id="src_pages_outercircle_tsx_f0c3">
            <select
              className={inputClass()}
              value={newOrg.type}
              onChange={(e) => setNewOrg({ ...newOrg, type: e.target.value as any })}
              data-icod-id="src_pages_outercircle_tsx_677e">
              <option value="nonprofit" data-icod-id="src_pages_outercircle_tsx_c915">Nonprofit</option>
              <option value="church" data-icod-id="src_pages_outercircle_tsx_2459">Church</option>
              <option value="environmental" data-icod-id="src_pages_outercircle_tsx_74f5">Environmental</option>
              <option value="community" data-icod-id="src_pages_outercircle_tsx_f220">Community</option>
              <option value="cause" data-icod-id="src_pages_outercircle_tsx_9a40">Cause</option>
              <option value="other" data-icod-id="src_pages_outercircle_tsx_1c1f">Other</option>
            </select>
          </Field>
          <Field label="Description" data-icod-id="src_pages_outercircle_tsx_6081">
            <textarea
              className={inputClass('resize-none')}
              rows={3}
              value={newOrg.description}
              onChange={(e) => setNewOrg({ ...newOrg, description: e.target.value })}
              placeholder="What does this organization do?"
              data-icod-id="src_pages_outercircle_tsx_4e66" />
          </Field>
          <Field label="Address" data-icod-id="src_pages_outercircle_tsx_25c0">
            <Input
              value={newOrg.address}
              onChange={(e) => setNewOrg({ ...newOrg, address: e.target.value })}
              placeholder="123 Main St, City, State"
              data-icod-id="src_pages_outercircle_tsx_cdc0" />
          </Field>
          <Field label="Phone" data-icod-id="src_pages_outercircle_tsx_315a">
            <Input
              value={newOrg.phone}
              onChange={(e) => setNewOrg({ ...newOrg, phone: e.target.value })}
              placeholder="(555) 123-4567"
              data-icod-id="src_pages_outercircle_tsx_f028" />
          </Field>
          <Field label="Email" data-icod-id="src_pages_outercircle_tsx_2420">
            <Input
              value={newOrg.email}
              onChange={(e) => setNewOrg({ ...newOrg, email: e.target.value })}
              placeholder="info@organization.org"
              data-icod-id="src_pages_outercircle_tsx_d180" />
          </Field>
          <Field label="Website" data-icod-id="src_pages_outercircle_tsx_7447">
            <Input
              value={newOrg.website}
              onChange={(e) => setNewOrg({ ...newOrg, website: e.target.value })}
              placeholder="https://example.org"
              data-icod-id="src_pages_outercircle_tsx_68b9" />
          </Field>
          <Field label="Donation URL" data-icod-id="src_pages_outercircle_tsx_f9e5">
            <Input
              value={newOrg.donationUrl}
              onChange={(e) => setNewOrg({ ...newOrg, donationUrl: e.target.value })}
              placeholder="https://example.org/donate"
              data-icod-id="src_pages_outercircle_tsx_b61f" />
          </Field>
          <Field label="Volunteer URL" data-icod-id="src_pages_outercircle_tsx_98ae">
            <Input
              value={newOrg.volunteerUrl}
              onChange={(e) => setNewOrg({ ...newOrg, volunteerUrl: e.target.value })}
              placeholder="https://example.org/volunteer"
              data-icod-id="src_pages_outercircle_tsx_bfd0" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
