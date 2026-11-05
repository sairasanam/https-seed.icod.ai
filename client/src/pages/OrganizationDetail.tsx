import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Button, Card, EmptyState, Spinner, Modal, Field, Input } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { buttonClass } from '@/components/ui/Button';
import { getOrganizationRequest, updateOrganizationRequest, deleteOrganizationRequest } from '@/services/organizationService';
import { toggleFollowRequest, toggleFavoriteRequest } from '@/services/organizationService';
import { getNotesRequest, createNoteRequest, deleteNoteRequest } from '@/services/noteService';
import { useAppSelector } from '@/store/hooks';
import type { Organization, Note } from '../types';
import ShareButton from '@/components/ShareButton';
import ConfirmDialog from '@/components/ConfirmDialog';
import { ArrowLeft, Globe, ExternalLink, Heart, Star, Briefcase, MapPin, Phone, Mail, ShieldCheck, Pencil, Trash2, FileText } from 'lucide-react';

export default function OrganizationDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const user = useAppSelector((state) => state.auth.user);
  const [organization, setOrganization] = useState<Organization | null>(null);
  const [loading, setLoading] = useState(true);
  const [notes, setNotes] = useState<Note[]>([]);
  const [newNote, setNewNote] = useState('');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editData, setEditData] = useState<Partial<Organization>>({});
  const [actionLoading, setActionLoading] = useState(false);

  useEffect(() => {
    if (id) {
      loadOrganization();
      loadNotes();
    }
  }, [id]);

  const loadOrganization = async () => {
    try {
      const response = await getOrganizationRequest(id!);
      if (response.data) setOrganization(response.data);
    } catch (err) {
      console.error('Failed to load organization:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadNotes = async () => {
    try {
      const response = await getNotesRequest(id, 'organization');
      if (response.data) setNotes(response.data);
    } catch (err) {
      console.error('Failed to load notes:', err);
    }
  };

  const handleToggleFollow = async () => {
    if (!organization) return;
    const response = await toggleFollowRequest(organization._id);
    if (response.data) setOrganization(response.data);
  };

  const handleToggleFavorite = async () => {
    if (!organization) return;
    const response = await toggleFavoriteRequest(organization._id);
    if (response.data) setOrganization(response.data);
  };

  const handleDelete = async () => {
    if (!organization) return;
    setActionLoading(true);
    try {
      await deleteOrganizationRequest(organization._id);
      navigate('/outer-circle');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!organization) return;
    setActionLoading(true);
    try {
      const response = await updateOrganizationRequest(organization._id, editData);
      if (response.data) setOrganization(response.data);
      setShowEditModal(false);
    } finally {
      setActionLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!organization || !newNote.trim()) return;
    await createNoteRequest({ entityId: organization._id, entityType: 'organization', content: newNote.trim(), isPrivate: true });
    setNewNote('');
    await loadNotes();
  };

  const handleDeleteNote = async (noteId: string) => {
    await deleteNoteRequest(noteId);
    await loadNotes();
  };

  if (loading) {
    return (
      <div
        className="flex min-h-[80vh] items-center justify-center"
        data-icod-id="src_pages_organizationdetail_tsx_e236">
        <Spinner size="lg" data-icod-id="src_pages_organizationdetail_tsx_e6d1" />
      </div>
    );
  }

  if (!organization) {
    return (
      <EmptyState
        icon={Globe}
        title="Organization not found"
        action={{ label: 'Go Back', onClick: () => navigate('/outer-circle') } as any}
        data-icod-id="src_pages_organizationdetail_tsx_041b" />
    );
  }

  const isAdmin = user?.role === 'admin';
  const isOwner = organization.userId === user?._id;

  return (
    <div
      className="space-y-6 p-4 pb-24"
      data-icod-id="src_pages_organizationdetail_tsx_06d7">
      {/* Header */}
      <div
        className="flex items-start gap-3"
        data-icod-id="src_pages_organizationdetail_tsx_3042">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigate('/outer-circle')}
          data-icod-id="src_pages_organizationdetail_tsx_7e93">
          <ArrowLeft className="h-5 w-5" data-icod-id="src_pages_organizationdetail_tsx_3da5" />
        </Button>
        <div
          className="flex-1 min-w-0"
          data-icod-id="src_pages_organizationdetail_tsx_1173">
          <div
            className="flex items-center gap-2 mb-1 flex-wrap"
            data-icod-id="src_pages_organizationdetail_tsx_2099">
            <span
              className="rounded-full bg-secondary px-2 py-0.5 text-xs capitalize text-secondary-foreground"
              data-icod-id="src_pages_organizationdetail_tsx_ae31">
              {organization.type}
            </span>
            {organization.verified && (
              <span
                className="flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-xs font-medium text-primary"
                data-icod-id="src_pages_organizationdetail_tsx_dfae">
                <ShieldCheck className="h-3 w-3" data-icod-id="src_pages_organizationdetail_tsx_d92c" />
                Verified
              </span>
            )}
            {organization.followed && <Heart
              className="h-4 w-4 fill-primary text-primary"
              data-icod-id="src_pages_organizationdetail_tsx_eac5" />}
            {organization.favorites && <Star
              className="h-4 w-4 fill-warning text-warning"
              data-icod-id="src_pages_organizationdetail_tsx_addf" />}
          </div>
          <h1
            className="text-2xl font-bold text-foreground"
            data-icod-id="src_pages_organizationdetail_tsx_3503">{organization.name}</h1>
        </div>
        <div
          className="flex shrink-0 gap-1"
          data-icod-id="src_pages_organizationdetail_tsx_3b14">
          <ShareButton
            title={organization.name}
            description={organization.description}
            data-icod-id="src_pages_organizationdetail_tsx_2c38" />
          {(isOwner || isAdmin) && (
            <>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  setEditData({
                    name: organization.name, type: organization.type, description: organization.description,
                    address: organization.address, phone: organization.phone, email: organization.email,
                    website: organization.website, donationUrl: organization.donationUrl, volunteerUrl: organization.volunteerUrl,
                  });
                  setShowEditModal(true);
                }}
                data-icod-id="src_pages_organizationdetail_tsx_aa2b">
                <Pencil className="h-4 w-4" data-icod-id="src_pages_organizationdetail_tsx_0dd5" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setShowDeleteConfirm(true)}
                className="text-destructive hover:text-destructive"
                data-icod-id="src_pages_organizationdetail_tsx_6ca5">
                <Trash2 className="h-4 w-4" data-icod-id="src_pages_organizationdetail_tsx_c068" />
              </Button>
            </>
          )}
        </div>
      </div>
      {/* Follow / Favorite Buttons */}
      <div
        className="flex gap-2"
        data-icod-id="src_pages_organizationdetail_tsx_d7ed">
        <Button
          variant={organization.followed ? 'primary' : 'outline'}
          onClick={handleToggleFollow}
          className="gap-2"
          data-icod-id="src_pages_organizationdetail_tsx_b3e3">
          <Heart
            className={`h-4 w-4 ${organization.followed ? 'fill-current' : ''}`}
            data-icod-id="src_pages_organizationdetail_tsx_69f2" />
          {organization.followed ? 'Following' : 'Follow'}
        </Button>
        <Button
          variant={organization.favorites ? 'primary' : 'outline'}
          onClick={handleToggleFavorite}
          className="gap-2"
          data-icod-id="src_pages_organizationdetail_tsx_c8a8">
          <Star
            className={`h-4 w-4 ${organization.favorites ? 'fill-current' : ''}`}
            data-icod-id="src_pages_organizationdetail_tsx_2ee8" />
          {organization.favorites ? 'Favorited' : 'Favorite'}
        </Button>
      </div>
      {/* Description */}
      {organization.description && (
        <Card className="p-4" data-icod-id="src_pages_organizationdetail_tsx_7913">
          <h3
            className="font-semibold text-foreground mb-2"
            data-icod-id="src_pages_organizationdetail_tsx_0abe">About</h3>
          <p
            className="text-muted-foreground"
            data-icod-id="src_pages_organizationdetail_tsx_13da">{organization.description}</p>
        </Card>
      )}
      {/* Contact Info */}
      {(organization.address || organization.phone || organization.email) && (
        <Card className="p-4" data-icod-id="src_pages_organizationdetail_tsx_8b61">
          <h3
            className="font-semibold text-foreground mb-3"
            data-icod-id="src_pages_organizationdetail_tsx_4cac">Contact Information</h3>
          <div
            className="space-y-2"
            data-icod-id="src_pages_organizationdetail_tsx_5fb2">
            {organization.address && (
              <div
                className="flex items-start gap-2 text-sm text-muted-foreground"
                data-icod-id="src_pages_organizationdetail_tsx_2d78">
                <MapPin
                  className="mt-0.5 h-4 w-4 shrink-0 text-primary"
                  data-icod-id="src_pages_organizationdetail_tsx_7400" />
                {organization.address}
              </div>
            )}
            {organization.phone && (
              <div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                data-icod-id="src_pages_organizationdetail_tsx_21b3">
                <Phone
                  className="h-4 w-4 shrink-0 text-primary"
                  data-icod-id="src_pages_organizationdetail_tsx_614c" />
                {organization.phone}
              </div>
            )}
            {organization.email && (
              <div
                className="flex items-center gap-2 text-sm text-muted-foreground"
                data-icod-id="src_pages_organizationdetail_tsx_1a79">
                <Mail
                  className="h-4 w-4 shrink-0 text-primary"
                  data-icod-id="src_pages_organizationdetail_tsx_d5bb" />
                {organization.email}
              </div>
            )}
          </div>
        </Card>
      )}
      {/* Opportunities */}
      {organization.opportunities.length > 0 && (
        <Card className="p-4" data-icod-id="src_pages_organizationdetail_tsx_0cce">
          <div
            className="flex items-center gap-2 mb-3"
            data-icod-id="src_pages_organizationdetail_tsx_1ac8">
            <Briefcase
              className="h-4 w-4 text-primary"
              data-icod-id="src_pages_organizationdetail_tsx_1cba" />
            <h3
              className="font-semibold text-foreground"
              data-icod-id="src_pages_organizationdetail_tsx_9daa">Opportunities</h3>
          </div>
          <ul
            className="space-y-2"
            data-icod-id="src_pages_organizationdetail_tsx_7595">
            {organization.opportunities.map((opp, i) => (
              <li
                key={i}
                className="flex items-start gap-2 text-muted-foreground"
                data-icod-id={`src_pages_organizationdetail_tsx_8eeb_${i}`}>
                <span
                  className="mt-1.5 h-1.5 w-1.5 rounded-full bg-primary shrink-0"
                  data-icod-id={`src_pages_organizationdetail_tsx_3803_${i}`} />
                {opp}
              </li>
            ))}
          </ul>
        </Card>
      )}
      {/* External Links */}
      <div
        className="space-y-3"
        data-icod-id="src_pages_organizationdetail_tsx_4f75">
        {organization.website && (
          <a
            href={organization.website}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: 'outline', className: 'w-full justify-start gap-2' })}
            data-icod-id="src_pages_organizationdetail_tsx_567e">
            <Globe className="h-4 w-4" data-icod-id="src_pages_organizationdetail_tsx_a30f" />
            Visit Website
            <ExternalLink
              className="ml-auto h-3 w-3"
              data-icod-id="src_pages_organizationdetail_tsx_6119" />
          </a>
        )}
        {(organization.donationUrl || organization.donationLink) && (
          <a
            href={organization.donationUrl || organization.donationLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: 'primary', className: 'w-full justify-start gap-2' })}
            data-icod-id="src_pages_organizationdetail_tsx_aa06">
            <Heart className="h-4 w-4" data-icod-id="src_pages_organizationdetail_tsx_4674" />
            Make a Donation
            <ExternalLink
              className="ml-auto h-3 w-3"
              data-icod-id="src_pages_organizationdetail_tsx_5c83" />
          </a>
        )}
        {(organization.volunteerUrl || organization.serviceLink) && (
          <a
            href={organization.volunteerUrl || organization.serviceLink}
            target="_blank"
            rel="noopener noreferrer"
            className={buttonClass({ variant: 'secondary', className: 'w-full justify-start gap-2' })}
            data-icod-id="src_pages_organizationdetail_tsx_4386">
            <Briefcase className="h-4 w-4" data-icod-id="src_pages_organizationdetail_tsx_7c2c" />
            Volunteer
            <ExternalLink
              className="ml-auto h-3 w-3"
              data-icod-id="src_pages_organizationdetail_tsx_c735" />
          </a>
        )}
      </div>
      {/* Notes Section */}
      <Card className="p-4" data-icod-id="src_pages_organizationdetail_tsx_5530">
        <div
          className="flex items-center gap-2 mb-3"
          data-icod-id="src_pages_organizationdetail_tsx_f205">
          <FileText
            className="h-4 w-4 text-primary"
            data-icod-id="src_pages_organizationdetail_tsx_ceb8" />
          <h3
            className="font-semibold text-foreground"
            data-icod-id="src_pages_organizationdetail_tsx_9ead">Private Notes</h3>
        </div>
        <div
          className="space-y-3"
          data-icod-id="src_pages_organizationdetail_tsx_138b">
          {notes.map(note => (
            <div
              key={note._id}
              className="rounded border border-border p-3"
              data-icod-id={`src_pages_organizationdetail_tsx_5adf_${note._id}`}>
              <p
                className="text-sm text-foreground whitespace-pre-wrap"
                data-icod-id={`src_pages_organizationdetail_tsx_152c_${note._id}`}>{note.content}</p>
              <div
                className="mt-2 flex items-center justify-between"
                data-icod-id={`src_pages_organizationdetail_tsx_0e26_${note._id}`}>
                <span
                  className="text-xs text-muted-foreground"
                  data-icod-id={`src_pages_organizationdetail_tsx_6e95_${note._id}`}>{new Date(note.createdAt).toLocaleDateString()}</span>
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => handleDeleteNote(note._id)}
                  className="h-6 w-6 text-muted-foreground hover:text-destructive"
                  data-icod-id={`src_pages_organizationdetail_tsx_1e3e_${note._id}`}>
                  <Trash2
                    className="h-3 w-3"
                    data-icod-id={`src_pages_organizationdetail_tsx_299a_${note._id}`} />
                </Button>
              </div>
            </div>
          ))}
          {notes.length === 0 && <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_organizationdetail_tsx_75b9">No notes yet.</p>}
        </div>
        <div
          className="mt-3 flex gap-2"
          data-icod-id="src_pages_organizationdetail_tsx_dabc">
          <textarea
            className={inputClass('resize-none flex-1')}
            rows={2}
            value={newNote}
            onChange={(e) => setNewNote(e.target.value)}
            placeholder="Add a private note..."
            data-icod-id="src_pages_organizationdetail_tsx_97be" />
          <Button
            variant="outline"
            onClick={handleAddNote}
            disabled={!newNote.trim()}
            className="self-end"
            data-icod-id="src_pages_organizationdetail_tsx_dba1">Add</Button>
        </div>
      </Card>
      {/* Confirm Dialogs */}
      <ConfirmDialog
        open={showDeleteConfirm}
        onClose={() => setShowDeleteConfirm(false)}
        onConfirm={handleDelete}
        title="Delete Organization"
        description="Are you sure you want to delete this organization? This cannot be undone."
        confirmLabel="Delete"
        loading={actionLoading}
        data-icod-id="src_pages_organizationdetail_tsx_9051" />
      {/* Edit Modal */}
      <Modal
        open={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Edit Organization"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_organizationdetail_tsx_cc38">
            <Button
              variant="outline"
              onClick={() => setShowEditModal(false)}
              data-icod-id="src_pages_organizationdetail_tsx_71e4">Cancel</Button>
            <Button
              onClick={handleSaveEdit}
              loading={actionLoading}
              data-icod-id="src_pages_organizationdetail_tsx_f122">Save</Button>
          </div>
        }
        data-icod-id="src_pages_organizationdetail_tsx_af29">
        <div
          className="max-h-[70vh] space-y-4 overflow-y-auto pr-1"
          data-icod-id="src_pages_organizationdetail_tsx_a9bc">
          <Field
            label="Name"
            required
            data-icod-id="src_pages_organizationdetail_tsx_d7be">
            <Input
              value={editData.name || ''}
              onChange={(e) => setEditData({ ...editData, name: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_0742" />
          </Field>
          <Field
            label="Type"
            required
            data-icod-id="src_pages_organizationdetail_tsx_dd38">
            <select
              className={inputClass()}
              value={editData.type || 'nonprofit'}
              onChange={(e) => setEditData({ ...editData, type: e.target.value as any })}
              data-icod-id="src_pages_organizationdetail_tsx_4855">
              <option value="nonprofit" data-icod-id="src_pages_organizationdetail_tsx_35a8">Nonprofit</option>
              <option value="church" data-icod-id="src_pages_organizationdetail_tsx_b308">Church</option>
              <option
                value="environmental"
                data-icod-id="src_pages_organizationdetail_tsx_ed62">Environmental</option>
              <option value="community" data-icod-id="src_pages_organizationdetail_tsx_f01e">Community</option>
              <option value="cause" data-icod-id="src_pages_organizationdetail_tsx_b8b3">Cause</option>
              <option value="other" data-icod-id="src_pages_organizationdetail_tsx_2dd1">Other</option>
            </select>
          </Field>
          <Field label="Description" data-icod-id="src_pages_organizationdetail_tsx_055a">
            <textarea
              className={inputClass('resize-none')}
              rows={3}
              value={editData.description || ''}
              onChange={(e) => setEditData({ ...editData, description: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_89ce" />
          </Field>
          <Field label="Address" data-icod-id="src_pages_organizationdetail_tsx_e097">
            <Input
              value={editData.address || ''}
              onChange={(e) => setEditData({ ...editData, address: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_6824" />
          </Field>
          <Field label="Phone" data-icod-id="src_pages_organizationdetail_tsx_a912">
            <Input
              value={editData.phone || ''}
              onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_9652" />
          </Field>
          <Field label="Email" data-icod-id="src_pages_organizationdetail_tsx_59b7">
            <Input
              value={editData.email || ''}
              onChange={(e) => setEditData({ ...editData, email: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_2c7b" />
          </Field>
          <Field label="Website" data-icod-id="src_pages_organizationdetail_tsx_e0a8">
            <Input
              value={editData.website || ''}
              onChange={(e) => setEditData({ ...editData, website: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_842e" />
          </Field>
          <Field label="Donation URL" data-icod-id="src_pages_organizationdetail_tsx_f004">
            <Input
              value={editData.donationUrl || ''}
              onChange={(e) => setEditData({ ...editData, donationUrl: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_2678" />
          </Field>
          <Field
            label="Volunteer URL"
            data-icod-id="src_pages_organizationdetail_tsx_d85e">
            <Input
              value={editData.volunteerUrl || ''}
              onChange={(e) => setEditData({ ...editData, volunteerUrl: e.target.value })}
              data-icod-id="src_pages_organizationdetail_tsx_60b6" />
          </Field>
        </div>
      </Modal>
    </div>
  );
}
