import { useState, useEffect } from 'react';
import { Button, Modal, Field, Input } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import type { Action } from '../types';

interface ActionFormModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (data: Partial<Action>) => Promise<void>;
  initialData?: Partial<Action>;
  title?: string;
}

const categoryOptions = [
  { value: 'call', label: 'Call' },
  { value: 'message', label: 'Message' },
  { value: 'visit', label: 'Visit' },
  { value: 'gift', label: 'Gift' },
  { value: 'activity', label: 'Activity' },
  { value: 'other', label: 'Other' },
];

const priorityOptions = [
  { value: 'low', label: 'Low' },
  { value: 'medium', label: 'Medium' },
  { value: 'high', label: 'High' },
];

export default function ActionFormModal({
  open,
  onClose,
  onSubmit,
  initialData,
  title = 'Add Action',
}: ActionFormModalProps) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    category: 'other',
    priority: 'medium',
    dueDate: '',
    tags: '',
    notes: '',
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (open && initialData) {
      setFormData({
        title: initialData.title || '',
        description: initialData.description || '',
        category: initialData.category || 'other',
        priority: initialData.priority || 'medium',
        dueDate: initialData.dueDate ? new Date(initialData.dueDate).toISOString().split('T')[0] : '',
        tags: initialData.tags?.join(', ') || '',
        notes: initialData.notes || '',
      });
    } else if (open) {
      setFormData({
        title: '',
        description: '',
        category: 'other',
        priority: 'medium',
        dueDate: '',
        tags: '',
        notes: '',
      });
    }
  }, [open, initialData]);

  const handleSubmit = async () => {
    if (!formData.title) return;

    setLoading(true);
    try {
      await onSubmit({
        title: formData.title,
        description: formData.description || undefined,
        category: formData.category as any,
        priority: formData.priority as any,
        dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : undefined,
        tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
        notes: formData.notes || undefined,
      });
      onClose();
    } finally {
      setLoading(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={title}
      footer={
        <div
          className="flex justify-end gap-2"
          data-icod-id="src_components_actionformmodal_tsx_cf10">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={loading}
            data-icod-id="src_components_actionformmodal_tsx_38d7">
            Cancel
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={!formData.title || loading}
            loading={loading}
            data-icod-id="src_components_actionformmodal_tsx_73c5">
            {initialData?._id ? 'Update Action' : 'Add Action'}
          </Button>
        </div>
      }
      data-icod-id="src_components_actionformmodal_tsx_1c4f">
      <div
        className="space-y-4"
        data-icod-id="src_components_actionformmodal_tsx_0963">
        <Field
          label="Title"
          required
          data-icod-id="src_components_actionformmodal_tsx_e7b2">
          <Input
            value={formData.title}
            onChange={(e) => setFormData({ ...formData, title: e.target.value })}
            placeholder="What needs to be done?"
            data-icod-id="src_components_actionformmodal_tsx_9962" />
        </Field>

        <Field
          label="Description"
          data-icod-id="src_components_actionformmodal_tsx_334d">
          <textarea
            className={inputClass('resize-none')}
            rows={3}
            value={formData.description}
            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
            placeholder="Add details..."
            data-icod-id="src_components_actionformmodal_tsx_dfc2" />
        </Field>

        <div
          className="grid grid-cols-2 gap-4"
          data-icod-id="src_components_actionformmodal_tsx_4731">
          <Field label="Category" data-icod-id="src_components_actionformmodal_tsx_12cf">
            <select
              className={inputClass()}
              value={formData.category}
              onChange={(e) => setFormData({ ...formData, category: e.target.value })}
              data-icod-id="src_components_actionformmodal_tsx_825b">
              {categoryOptions.map(opt => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-icod-id={`src_components_actionformmodal_tsx_f668_${opt.value}`}>{opt.label}</option>
              ))}
            </select>
          </Field>

          <Field label="Priority" data-icod-id="src_components_actionformmodal_tsx_8eb1">
            <select
              className={inputClass()}
              value={formData.priority}
              onChange={(e) => setFormData({ ...formData, priority: e.target.value })}
              data-icod-id="src_components_actionformmodal_tsx_d2d8">
              {priorityOptions.map(opt => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-icod-id={`src_components_actionformmodal_tsx_360d_${opt.value}`}>{opt.label}</option>
              ))}
            </select>
          </Field>
        </div>

        <Field label="Due Date" data-icod-id="src_components_actionformmodal_tsx_5814">
          <Input
            type="date"
            value={formData.dueDate}
            onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
            data-icod-id="src_components_actionformmodal_tsx_7546" />
        </Field>

        <Field
          label="Tags (comma-separated)"
          data-icod-id="src_components_actionformmodal_tsx_999d">
          <Input
            value={formData.tags}
            onChange={(e) => setFormData({ ...formData, tags: e.target.value })}
            placeholder="kindness, support..."
            data-icod-id="src_components_actionformmodal_tsx_1d98" />
        </Field>

        <Field label="Notes" data-icod-id="src_components_actionformmodal_tsx_eeec">
          <textarea
            className={inputClass('resize-none')}
            rows={2}
            value={formData.notes}
            onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
            placeholder="Additional notes..."
            data-icod-id="src_components_actionformmodal_tsx_2a1b" />
        </Field>
      </div>
    </Modal>
  );
}
