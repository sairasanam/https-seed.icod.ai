import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { Button, Card, Input, Modal, Field, Alert, Spinner, EmptyState } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { cn } from '@/utils/cn';
import {
  fetchAdminContent,
  addAdminContent,
  editAdminContent,
  removeAdminContent,
  fetchTemplates,
  addTemplate,
  editTemplate,
  removeTemplate,
  fetchCategories as fetchAdminCategories,
} from '@/store/slices/adminSlice';
import { fetchOrganizations, adminSetVerified, adminRemoveOrganization } from '@/store/slices/organizationsSlice';
import { toggleOrganizationFeaturedRequest } from '@/services/adminService';
import {
  BookOpen,
  Building2,
  FileText,
  Tag,
  Star,
  Plus,
  Search,
  Trash2,
  Pencil,
  ShieldCheck,
  ShieldOff,
  ChevronLeft,
} from 'lucide-react';
import type { ContentLibraryItem } from '@/types';

type TabKey = 'content' | 'organizations' | 'templates' | 'categories' | 'featured';

const tabs: { key: TabKey; label: string; icon: typeof BookOpen }[] = [
  { key: 'content', label: 'Content Library', icon: BookOpen },
  { key: 'organizations', label: 'Organizations', icon: Building2 },
  { key: 'templates', label: 'Templates', icon: FileText },
  { key: 'categories', label: 'Categories & Tags', icon: Tag },
  { key: 'featured', label: 'Featured', icon: Star },
];

// ─── Content Library Tab ──────────────────────────────────────────────────────

function ContentLibraryTab() {
  const dispatch = useAppDispatch();
  const { items, total, status, error } = useAppSelector((s) => s.admin.content);
  const [search, setSearch] = useState('');
  const [treeTypeFilter, setTreeTypeFilter] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [editingItem, setEditingItem] = useState<ContentLibraryItem | null>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formContent, setFormContent] = useState('');
  const [formCategory, setFormCategory] = useState('');
  const [formType, setFormType] = useState<'suggestion' | 'initiative'>('suggestion');
  const [formTreeType, setFormTreeType] = useState<'inner' | 'community' | 'outer'>('inner');
  const [formTags, setFormTags] = useState('');

  useEffect(() => {
    if (status === 'idle') {
      dispatch(fetchAdminContent({ search: search || undefined, treeType: treeTypeFilter || undefined }));
    }
  }, [dispatch, status]);

  const handleSearch = useCallback(() => {
    dispatch(fetchAdminContent({ search: search || undefined, treeType: treeTypeFilter || undefined }));
  }, [dispatch, search, treeTypeFilter]);

  useEffect(() => {
    const timer = setTimeout(handleSearch, 300);
    return () => clearTimeout(timer);
  }, [handleSearch]);

  const resetForm = () => {
    setFormTitle('');
    setFormContent('');
    setFormCategory('');
    setFormType('suggestion');
    setFormTreeType('inner');
    setFormTags('');
    setEditingItem(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (item: ContentLibraryItem) => {
    setEditingItem(item);
    setFormTitle(item.title);
    setFormContent(item.content);
    setFormCategory(item.category);
    setFormType(item.type);
    setFormTreeType(item.treeType);
    setFormTags(item.tags.join(', '));
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formContent.trim() || !formCategory.trim()) return;

    const data: Partial<ContentLibraryItem> = {
      title: formTitle.trim(),
      content: formContent.trim(),
      category: formCategory.trim(),
      type: formType,
      treeType: formTreeType,
      tags: formTags.split(',').map(t => t.trim()).filter(Boolean),
    };

    if (editingItem) {
      await dispatch(editAdminContent({ id: editingItem._id, data }));
    } else {
      await dispatch(addAdminContent(data));
    }
    setModalOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(removeAdminContent(deleteId));
      setDeleteId(null);
    }
  };

  if (status === 'loading' && items.length === 0) {
    return (
      <div
        className="flex justify-center py-16"
        data-icod-id="src_pages_admin_tsx_47a2"><Spinner size="lg" data-icod-id="src_pages_admin_tsx_0488" /></div>
    );
  }

  return (
    <div className="space-y-4" data-icod-id="src_pages_admin_tsx_d88e">
      {error && <Alert variant="error" data-icod-id="src_pages_admin_tsx_9dd8">{error}</Alert>}
      <div
        className="flex flex-col gap-3 sm:flex-row sm:items-center"
        data-icod-id="src_pages_admin_tsx_2424">
        <div className="relative flex-1" data-icod-id="src_pages_admin_tsx_2926">
          <Search
            className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            data-icod-id="src_pages_admin_tsx_6fff" />
          <Input
            placeholder="Search content..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
            data-icod-id="src_pages_admin_tsx_4b0a" />
        </div>
        <select
          value={treeTypeFilter}
          onChange={(e) => setTreeTypeFilter(e.target.value)}
          className={inputClass('w-full sm:w-auto')}
          data-icod-id="src_pages_admin_tsx_fe52">
          <option value="" data-icod-id="src_pages_admin_tsx_4371">All Types</option>
          <option value="inner" data-icod-id="src_pages_admin_tsx_ef9d">Inner Circle</option>
          <option value="community" data-icod-id="src_pages_admin_tsx_2b83">Community</option>
          <option value="outer" data-icod-id="src_pages_admin_tsx_fa99">Outer Circle</option>
        </select>
        <Button onClick={openCreate} data-icod-id="src_pages_admin_tsx_99fa">
          <Plus className="mr-1 h-4 w-4" data-icod-id="src_pages_admin_tsx_58b4" /> Add
        </Button>
      </div>
      <p
        className="text-sm text-muted-foreground"
        data-icod-id="src_pages_admin_tsx_6583">{total} items total</p>
      {items.length === 0 ? (
        <EmptyState
          icon={BookOpen}
          title="No content items found"
          description="Add your first content library item to get started."
          action={<Button onClick={openCreate} data-icod-id="src_pages_admin_tsx_a9c3">Add Item</Button>}
          data-icod-id="src_pages_admin_tsx_9327" />
      ) : (
        <div className="space-y-2" data-icod-id="src_pages_admin_tsx_bf02">
          {items.map((item) => (
            <Card
              key={item._id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              data-icod-id={`src_pages_admin_tsx_7981_${item._id}`}>
              <div
                className="min-w-0 flex-1"
                data-icod-id={`src_pages_admin_tsx_3614_${item._id}`}>
                <h3
                  className="truncate font-semibold text-foreground"
                  data-icod-id={`src_pages_admin_tsx_47fd_${item._id}`}>{item.title}</h3>
                <div
                  className="flex flex-wrap gap-2 text-xs text-muted-foreground"
                  data-icod-id={`src_pages_admin_tsx_cdd9_${item._id}`}>
                  <span
                    className="rounded bg-muted px-1.5 py-0.5"
                    data-icod-id={`src_pages_admin_tsx_cc41_${item._id}`}>{item.category}</span>
                  <span
                    className="rounded bg-muted px-1.5 py-0.5"
                    data-icod-id={`src_pages_admin_tsx_f0a5_${item._id}`}>{item.type}</span>
                  <span
                    className="rounded bg-muted px-1.5 py-0.5"
                    data-icod-id={`src_pages_admin_tsx_bc99_${item._id}`}>{item.treeType}</span>
                  {item.tags.slice(0, 3).map(tag => (
                    <span
                      key={tag}
                      className="rounded border border-border px-1.5 py-0.5"
                      data-icod-id={`src_pages_admin_tsx_4a59_${item._id}_${tag}`}>{tag}</span>
                  ))}
                </div>
              </div>
              <div
                className="flex shrink-0 gap-1"
                data-icod-id={`src_pages_admin_tsx_8c9c_${item._id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit"
                  onClick={() => openEdit(item)}
                  data-icod-id={`src_pages_admin_tsx_f1fe_${item._id}`}>
                  <Pencil className="h-4 w-4" data-icod-id={`src_pages_admin_tsx_4fde_${item._id}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => setDeleteId(item._id)}
                  data-icod-id={`src_pages_admin_tsx_4e33_${item._id}`}>
                  <Trash2
                    className="h-4 w-4 text-destructive"
                    data-icod-id={`src_pages_admin_tsx_ca7d_${item._id}`} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      {/* Create/Edit Modal */}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingItem ? 'Edit Content Item' : 'Add Content Item'}
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_admin_tsx_00d4">
            <Button
              variant="secondary"
              onClick={() => { setModalOpen(false); resetForm(); }}
              data-icod-id="src_pages_admin_tsx_0433">Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formContent.trim() || !formCategory.trim()}
              data-icod-id="src_pages_admin_tsx_efd2">
              {editingItem ? 'Update' : 'Create'}
            </Button>
          </div>
        }
        data-icod-id="src_pages_admin_tsx_2d90">
        <div className="space-y-4" data-icod-id="src_pages_admin_tsx_8f4a">
          <Field label="Title" required data-icod-id="src_pages_admin_tsx_53e3">
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Enter title"
              data-icod-id="src_pages_admin_tsx_2767" />
          </Field>
          <Field label="Content" required data-icod-id="src_pages_admin_tsx_914e">
            <textarea
              value={formContent}
              onChange={(e) => setFormContent(e.target.value)}
              placeholder="Enter content description"
              className={inputClass('min-h-[100px] resize-y')}
              rows={4}
              data-icod-id="src_pages_admin_tsx_91af" />
          </Field>
          <Field label="Category" required data-icod-id="src_pages_admin_tsx_621d">
            <Input
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              placeholder="e.g., Communication, Support"
              data-icod-id="src_pages_admin_tsx_68af" />
          </Field>
          <div
            className="grid grid-cols-2 gap-4"
            data-icod-id="src_pages_admin_tsx_005a">
            <Field label="Type" data-icod-id="src_pages_admin_tsx_b4ff">
              <select
                value={formType}
                onChange={(e) => setFormType(e.target.value as any)}
                className={inputClass()}
                data-icod-id="src_pages_admin_tsx_e245">
                <option value="suggestion" data-icod-id="src_pages_admin_tsx_ded0">Suggestion</option>
                <option value="initiative" data-icod-id="src_pages_admin_tsx_68f6">Initiative</option>
              </select>
            </Field>
            <Field label="Tree Type" data-icod-id="src_pages_admin_tsx_8dae">
              <select
                value={formTreeType}
                onChange={(e) => setFormTreeType(e.target.value as any)}
                className={inputClass()}
                data-icod-id="src_pages_admin_tsx_6bba">
                <option value="inner" data-icod-id="src_pages_admin_tsx_0f8b">Inner Circle</option>
                <option value="community" data-icod-id="src_pages_admin_tsx_05b9">Community</option>
                <option value="outer" data-icod-id="src_pages_admin_tsx_b9da">Outer Circle</option>
              </select>
            </Field>
          </div>
          <Field
            label="Tags"
            hint="Comma-separated"
            data-icod-id="src_pages_admin_tsx_f5f2">
            <Input
              value={formTags}
              onChange={(e) => setFormTags(e.target.value)}
              placeholder="tag1, tag2, tag3"
              data-icod-id="src_pages_admin_tsx_b543" />
          </Field>
        </div>
      </Modal>
      {/* Delete Confirmation */}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Content Item"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_admin_tsx_812a">
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
              data-icod-id="src_pages_admin_tsx_5276">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-icod-id="src_pages_admin_tsx_1139">Delete</Button>
          </div>
        }
        data-icod-id="src_pages_admin_tsx_b412">
        <p className="text-foreground" data-icod-id="src_pages_admin_tsx_3b57">Are you sure you want to delete this content item? This action cannot be undone.</p>
      </Modal>
    </div>
  );
}

// ─── Organizations Tab ────────────────────────────────────────────────────────

function OrganizationsTab() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.organizations);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchOrganizations());
  }, [dispatch, status]);

  const handleToggleVerified = async (id: string, currentVerified: boolean) => {
    await dispatch(adminSetVerified({ id, verified: !currentVerified }));
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(adminRemoveOrganization(deleteId));
      setDeleteId(null);
    }
  };

  if (status === 'loading' && items.length === 0) {
    return (
      <div
        className="flex justify-center py-16"
        data-icod-id="src_pages_admin_tsx_28e6"><Spinner size="lg" data-icod-id="src_pages_admin_tsx_6d93" /></div>
    );
  }

  return (
    <div className="space-y-4" data-icod-id="src_pages_admin_tsx_c2d2">
      {items.length === 0 ? (
        <EmptyState
          icon={Building2}
          title="No organizations"
          description="Organizations will appear here once users add them."
          data-icod-id="src_pages_admin_tsx_38f4" />
      ) : (
        <div className="space-y-2" data-icod-id="src_pages_admin_tsx_c0a3">
          {items.map((org) => (
            <Card
              key={org._id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              data-icod-id={`src_pages_admin_tsx_1216_${org._id}`}>
              <div
                className="min-w-0 flex-1"
                data-icod-id={`src_pages_admin_tsx_23d4_${org._id}`}>
                <div
                  className="flex items-center gap-2"
                  data-icod-id={`src_pages_admin_tsx_5160_${org._id}`}>
                  <h3
                    className="truncate font-semibold text-foreground"
                    data-icod-id={`src_pages_admin_tsx_d363_${org._id}`}>{org.name}</h3>
                  {org.verified && <ShieldCheck
                    className="h-4 w-4 shrink-0 text-success"
                    data-icod-id={`src_pages_admin_tsx_72c4_${org._id}`} />}
                </div>
                <div
                  className="flex flex-wrap gap-2 text-xs text-muted-foreground"
                  data-icod-id={`src_pages_admin_tsx_557d_${org._id}`}>
                  <span
                    className="rounded bg-muted px-1.5 py-0.5"
                    data-icod-id={`src_pages_admin_tsx_6cf0_${org._id}`}>{org.type}</span>
                  {org.followed && <span
                    className="rounded bg-accent/20 px-1.5 py-0.5 text-accent-foreground"
                    data-icod-id={`src_pages_admin_tsx_152b_${org._id}`}>Followed</span>}
                  {org.favorites && <span
                    className="rounded bg-accent/20 px-1.5 py-0.5 text-accent-foreground"
                    data-icod-id={`src_pages_admin_tsx_c468_${org._id}`}>Favorite</span>}
                </div>
              </div>
              <div
                className="flex shrink-0 gap-1"
                data-icod-id={`src_pages_admin_tsx_ee90_${org._id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label={org.verified ? 'Unverify' : 'Verify'}
                  onClick={() => handleToggleVerified(org._id, org.verified)}
                  title={org.verified ? 'Remove verification' : 'Mark as verified'}
                  data-icod-id={`src_pages_admin_tsx_cd25_${org._id}`}>
                  {org.verified
                    ? <ShieldCheck
                    className="h-4 w-4 text-success"
                    data-icod-id={`src_pages_admin_tsx_1f54_${org._id}`} />
                    : <ShieldOff
                    className="h-4 w-4 text-muted-foreground"
                    data-icod-id={`src_pages_admin_tsx_5670_${org._id}`} />
                  }
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => setDeleteId(org._id)}
                  data-icod-id={`src_pages_admin_tsx_ee0b_${org._id}`}>
                  <Trash2
                    className="h-4 w-4 text-destructive"
                    data-icod-id={`src_pages_admin_tsx_89e0_${org._id}`} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Organization"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_admin_tsx_f9c4">
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
              data-icod-id="src_pages_admin_tsx_1370">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-icod-id="src_pages_admin_tsx_b08c">Delete</Button>
          </div>
        }
        data-icod-id="src_pages_admin_tsx_f21b">
        <p className="text-foreground" data-icod-id="src_pages_admin_tsx_3d55">Are you sure you want to delete this organization? This will affect all users who follow it.</p>
      </Modal>
    </div>
  );
}

// ─── Templates Tab ────────────────────────────────────────────────────────────

function TemplatesTab() {
  const dispatch = useAppDispatch();
  const { items, status, error } = useAppSelector((s) => s.admin.templates);
  const [modalOpen, setModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<any>(null);
  const [deleteId, setDeleteId] = useState<string | null>(null);

  // Form state
  const [formTitle, setFormTitle] = useState('');
  const [formDescription, setFormDescription] = useState('');
  const [formCategory, setFormCategory] = useState('');

  useEffect(() => {
    if (status === 'idle') dispatch(fetchTemplates());
  }, [dispatch, status]);

  const resetForm = () => {
    setFormTitle('');
    setFormDescription('');
    setFormCategory('');
    setEditingTemplate(null);
  };

  const openCreate = () => {
    resetForm();
    setModalOpen(true);
  };

  const openEdit = (template: any) => {
    setEditingTemplate(template);
    setFormTitle(template.title);
    setFormDescription(template.description);
    setFormCategory(template.category);
    setModalOpen(true);
  };

  const handleSubmit = async () => {
    if (!formTitle.trim() || !formDescription.trim() || !formCategory.trim()) return;

    const data = {
      title: formTitle.trim(),
      description: formDescription.trim(),
      category: formCategory.trim(),
    };

    if (editingTemplate) {
      await dispatch(editTemplate({ id: editingTemplate._id, data }));
    } else {
      await dispatch(addTemplate(data));
    }
    setModalOpen(false);
    resetForm();
  };

  const handleDelete = async () => {
    if (deleteId) {
      await dispatch(removeTemplate(deleteId));
      setDeleteId(null);
    }
  };

  if (status === 'loading' && items.length === 0) {
    return (
      <div
        className="flex justify-center py-16"
        data-icod-id="src_pages_admin_tsx_d70d"><Spinner size="lg" data-icod-id="src_pages_admin_tsx_70ef" /></div>
    );
  }

  return (
    <div className="space-y-4" data-icod-id="src_pages_admin_tsx_c93d">
      {error && <Alert variant="error" data-icod-id="src_pages_admin_tsx_33c6">{error}</Alert>}
      <div className="flex justify-end" data-icod-id="src_pages_admin_tsx_b9f0">
        <Button onClick={openCreate} data-icod-id="src_pages_admin_tsx_d69a">
          <Plus className="mr-1 h-4 w-4" data-icod-id="src_pages_admin_tsx_38ee" /> New Template
        </Button>
      </div>
      {items.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates yet"
          description="Create initiative templates that users can duplicate."
          action={<Button onClick={openCreate} data-icod-id="src_pages_admin_tsx_77f8">Create Template</Button>}
          data-icod-id="src_pages_admin_tsx_d24b" />
      ) : (
        <div className="space-y-2" data-icod-id="src_pages_admin_tsx_cf25">
          {items.map((template) => (
            <Card
              key={template._id}
              className="flex flex-col gap-2 p-4 sm:flex-row sm:items-center sm:justify-between"
              data-icod-id={`src_pages_admin_tsx_226b_${template._id}`}>
              <div
                className="min-w-0 flex-1"
                data-icod-id={`src_pages_admin_tsx_a239_${template._id}`}>
                <h3
                  className="truncate font-semibold text-foreground"
                  data-icod-id={`src_pages_admin_tsx_af10_${template._id}`}>{template.title}</h3>
                <p
                  className="line-clamp-1 text-sm text-muted-foreground"
                  data-icod-id={`src_pages_admin_tsx_ff4e_${template._id}`}>{template.description}</p>
                <span
                  className="mt-1 inline-block rounded bg-muted px-1.5 py-0.5 text-xs text-muted-foreground"
                  data-icod-id={`src_pages_admin_tsx_9866_${template._id}`}>{template.category}</span>
              </div>
              <div
                className="flex shrink-0 gap-1"
                data-icod-id={`src_pages_admin_tsx_8399_${template._id}`}>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Edit"
                  onClick={() => openEdit(template)}
                  data-icod-id={`src_pages_admin_tsx_6a46_${template._id}`}>
                  <Pencil
                    className="h-4 w-4"
                    data-icod-id={`src_pages_admin_tsx_62ee_${template._id}`} />
                </Button>
                <Button
                  variant="ghost"
                  size="icon"
                  aria-label="Delete"
                  onClick={() => setDeleteId(template._id)}
                  data-icod-id={`src_pages_admin_tsx_ca80_${template._id}`}>
                  <Trash2
                    className="h-4 w-4 text-destructive"
                    data-icod-id={`src_pages_admin_tsx_6098_${template._id}`} />
                </Button>
              </div>
            </Card>
          ))}
        </div>
      )}
      <Modal
        open={modalOpen}
        onClose={() => { setModalOpen(false); resetForm(); }}
        title={editingTemplate ? 'Edit Template' : 'Create Template'}
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_admin_tsx_af94">
            <Button
              variant="secondary"
              onClick={() => { setModalOpen(false); resetForm(); }}
              data-icod-id="src_pages_admin_tsx_b9a0">Cancel</Button>
            <Button
              onClick={handleSubmit}
              disabled={!formTitle.trim() || !formDescription.trim() || !formCategory.trim()}
              data-icod-id="src_pages_admin_tsx_cd8d">
              {editingTemplate ? 'Update' : 'Create'}
            </Button>
          </div>
        }
        data-icod-id="src_pages_admin_tsx_d713">
        <div className="space-y-4" data-icod-id="src_pages_admin_tsx_bedf">
          <Field label="Title" required data-icod-id="src_pages_admin_tsx_1107">
            <Input
              value={formTitle}
              onChange={(e) => setFormTitle(e.target.value)}
              placeholder="Template title"
              data-icod-id="src_pages_admin_tsx_8e4d" />
          </Field>
          <Field label="Description" required data-icod-id="src_pages_admin_tsx_513e">
            <textarea
              value={formDescription}
              onChange={(e) => setFormDescription(e.target.value)}
              placeholder="Template description"
              className={inputClass('min-h-[80px] resize-y')}
              rows={3}
              data-icod-id="src_pages_admin_tsx_acb7" />
          </Field>
          <Field label="Category" required data-icod-id="src_pages_admin_tsx_d9ee">
            <Input
              value={formCategory}
              onChange={(e) => setFormCategory(e.target.value)}
              placeholder="e.g., Environment, Support"
              data-icod-id="src_pages_admin_tsx_bccb" />
          </Field>
        </div>
      </Modal>
      <Modal
        open={!!deleteId}
        onClose={() => setDeleteId(null)}
        title="Delete Template"
        footer={
          <div
            className="flex justify-end gap-2"
            data-icod-id="src_pages_admin_tsx_4b6e">
            <Button
              variant="secondary"
              onClick={() => setDeleteId(null)}
              data-icod-id="src_pages_admin_tsx_0b29">Cancel</Button>
            <Button
              variant="destructive"
              onClick={handleDelete}
              data-icod-id="src_pages_admin_tsx_effa">Delete</Button>
          </div>
        }
        data-icod-id="src_pages_admin_tsx_73f9">
        <p className="text-foreground" data-icod-id="src_pages_admin_tsx_752d">Are you sure you want to delete this template?</p>
      </Modal>
    </div>
  );
}

// ─── Categories Tab ───────────────────────────────────────────────────────────

function CategoriesTab() {
  const dispatch = useAppDispatch();
  const { items, status } = useAppSelector((s) => s.admin.categories);

  useEffect(() => {
    if (status === 'idle') dispatch(fetchAdminCategories());
  }, [dispatch, status]);

  if (status === 'loading') {
    return (
      <div
        className="flex justify-center py-16"
        data-icod-id="src_pages_admin_tsx_a1df"><Spinner size="lg" data-icod-id="src_pages_admin_tsx_3bf7" /></div>
    );
  }

  return (
    <div className="space-y-4" data-icod-id="src_pages_admin_tsx_7ff6">
      <p
        className="text-sm text-muted-foreground"
        data-icod-id="src_pages_admin_tsx_3a73">
        Categories are derived from content library items. Add or edit content items to manage categories.
      </p>
      {items.length === 0 ? (
        <EmptyState
          icon={Tag}
          title="No categories"
          description="Categories will appear once content items are added."
          data-icod-id="src_pages_admin_tsx_34c9" />
      ) : (
        <div className="flex flex-wrap gap-2" data-icod-id="src_pages_admin_tsx_1aeb">
          {items.sort().map((category) => (
            <span
              key={category}
              className="inline-flex items-center rounded-full border border-border bg-card px-3 py-1.5 text-sm font-medium text-foreground"
              data-icod-id={`src_pages_admin_tsx_1694_${category}`}>
              {category}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Featured Tab ─────────────────────────────────────────────────────────────

function FeaturedTab() {
  const dispatch = useAppDispatch();
  const { items: orgs, status: orgStatus } = useAppSelector((s) => s.organizations);
  const [featuredOrgs, setFeaturedOrgs] = useState<Set<string>>(new Set());

  useEffect(() => {
    if (orgStatus === 'idle') dispatch(fetchOrganizations());
  }, [dispatch, orgStatus]);

  useEffect(() => {
    // Track featured state locally
    setFeaturedOrgs(new Set(orgs.filter(o => o.featured).map(o => o._id)));
  }, [orgs]);

  const toggleOrgFeatured = async (id: string) => {
    const newState = !featuredOrgs.has(id);
    setFeaturedOrgs(prev => {
      const next = new Set(prev);
      if (newState) next.add(id); else next.delete(id);
      return next;
    });
    try {
      await toggleOrganizationFeaturedRequest(id, newState);
    } catch {
      // Revert on failure
      setFeaturedOrgs(prev => {
        const next = new Set(prev);
        if (!newState) next.add(id); else next.delete(id);
        return next;
      });
    }
  };

  const nonFeaturedOrgs = orgs.filter(o => !featuredOrgs.has(o._id));
  const featuredOrgList = orgs.filter(o => featuredOrgs.has(o._id));

  return (
    <div className="space-y-6" data-icod-id="src_pages_admin_tsx_6225">
      <div data-icod-id="src_pages_admin_tsx_cf5b">
        <h3
          className="mb-3 text-lg font-semibold text-foreground"
          data-icod-id="src_pages_admin_tsx_068c">Featured Organizations</h3>
        {featuredOrgList.length === 0 ? (
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_pages_admin_tsx_bba0">No organizations marked as featured yet.</p>
        ) : (
          <div className="space-y-2" data-icod-id="src_pages_admin_tsx_432b">
            {featuredOrgList.map(org => (
              <Card
                key={org._id}
                className="flex items-center justify-between p-3"
                data-icod-id={`src_pages_admin_tsx_3f44_${org._id}`}>
                <span
                  className="font-medium text-foreground"
                  data-icod-id={`src_pages_admin_tsx_d9a6_${org._id}`}>{org.name}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => toggleOrgFeatured(org._id)}
                  data-icod-id={`src_pages_admin_tsx_a489_${org._id}`}>
                  Remove
                </Button>
              </Card>
            ))}
          </div>
        )}
        {nonFeaturedOrgs.length > 0 && (
          <div className="mt-3" data-icod-id="src_pages_admin_tsx_12d1">
            <p
              className="mb-2 text-sm text-muted-foreground"
              data-icod-id="src_pages_admin_tsx_cfe1">Click to feature:</p>
            <div className="flex flex-wrap gap-2" data-icod-id="src_pages_admin_tsx_4e2d">
              {nonFeaturedOrgs.map(org => (
                <button
                  key={org._id}
                  onClick={() => toggleOrgFeatured(org._id)}
                  className="rounded-full border border-border bg-card px-3 py-1 text-sm text-muted-foreground transition-colors hover:border-primary hover:text-foreground"
                  data-icod-id={`src_pages_admin_tsx_1492_${org._id}`}>
                  + {org.name}
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Main Admin Page ──────────────────────────────────────────────────────────

export default function Admin() {
  const navigate = useNavigate();
  const { user } = useAppSelector((s) => s.auth);
  const [activeTab, setActiveTab] = useState<TabKey>('content');

  // Redirect non-admins
  useEffect(() => {
    if (user && user.role !== 'admin') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  if (!user || user.role !== 'admin') {
    return (
      <div
        className="flex min-h-screen items-center justify-center bg-background pt-safe"
        data-icod-id="src_pages_admin_tsx_dae5">
        <Spinner size="lg" data-icod-id="src_pages_admin_tsx_0487" />
      </div>
    );
  }

  return (
    <div
      className="min-h-screen bg-background pb-24 pt-safe"
      data-icod-id="src_pages_admin_tsx_029d">
      {/* Header */}
      <header
        className="sticky top-0 z-40 border-b border-border bg-card/95 backdrop-blur supports-[backdrop-filter]:bg-card/80"
        data-icod-id="src_pages_admin_tsx_caba">
        <div
          className="mx-auto flex max-w-3xl items-center gap-3 px-4 py-3"
          data-icod-id="src_pages_admin_tsx_caa3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => navigate('/dashboard')}
            aria-label="Back"
            data-icod-id="src_pages_admin_tsx_b3e3">
            <ChevronLeft className="h-5 w-5" data-icod-id="src_pages_admin_tsx_6147" />
          </Button>
          <h1
            className="text-xl font-bold text-foreground"
            data-icod-id="src_pages_admin_tsx_69b9">Admin Panel</h1>
        </div>
      </header>
      {/* Tab Bar */}
      <div
        className="border-b border-border bg-card"
        data-icod-id="src_pages_admin_tsx_3ff3">
        <div
          className="mx-auto max-w-3xl overflow-x-auto px-4"
          data-icod-id="src_pages_admin_tsx_c6f3">
          <div className="flex gap-1" data-icod-id="src_pages_admin_tsx_660c">
            {tabs.map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setActiveTab(key)}
                className={cn(
                  'flex shrink-0 items-center gap-1.5 border-b-2 px-3 py-3 text-sm font-medium transition-colors',
                  activeTab === key
                    ? 'border-primary text-primary'
                    : 'border-transparent text-muted-foreground hover:text-foreground'
                )}
                data-icod-id={`src_pages_admin_tsx_2915_${key}`}>
                <Icon className="h-4 w-4" data-icod-id={`src_pages_admin_tsx_db4e_${key}`} />
                <span
                  className="hidden sm:inline"
                  data-icod-id={`src_pages_admin_tsx_b38f_${key}`}>{label}</span>
                <span className="sm:hidden" data-icod-id={`src_pages_admin_tsx_6fa0_${key}`}>{label.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
      {/* Tab Content */}
      <main
        className="mx-auto max-w-3xl px-4 py-6"
        data-icod-id="src_pages_admin_tsx_7b8e">
        {activeTab === 'content' && <ContentLibraryTab data-icod-id="src_pages_admin_tsx_7129" />}
        {activeTab === 'organizations' && <OrganizationsTab data-icod-id="src_pages_admin_tsx_6f6f" />}
        {activeTab === 'templates' && <TemplatesTab data-icod-id="src_pages_admin_tsx_58ed" />}
        {activeTab === 'categories' && <CategoriesTab data-icod-id="src_pages_admin_tsx_394d" />}
        {activeTab === 'featured' && <FeaturedTab data-icod-id="src_pages_admin_tsx_a938" />}
      </main>
    </div>
  );
}
