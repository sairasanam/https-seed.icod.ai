import { useEffect, useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, Button, Input, Modal, Field, Alert, Spinner, EmptyState } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchNotes, searchNotes, createNote, updateNote, deleteNote, setSearchQuery } from '@/store/slices/notesSlice';
import ConfirmDialog from '@/components/ConfirmDialog';
import SkeletonLoader from '@/components/SkeletonLoader';
import AnimatedBackground from '@/components/AnimatedBackground';
import { JournalEmptyIllustration, NoSearchResultsIllustration } from '@/components/Illustrations';
import type { Note } from '@/types';
import {
  BookOpen, Search, Plus, Pencil, Trash2, Save, Calendar, Tag, Feather
} from 'lucide-react';

export default function Journal() {
  const dispatch = useAppDispatch();
  const { items: notes, status, searchQuery } = useAppSelector((state) => state.notes);

  const [editingNote, setEditingNote] = useState<Note | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [noteContent, setNoteContent] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<string | null>(null);
  const [sortBy, setSortBy] = useState<'newest' | 'oldest'>('newest');
  const [saveFeedback, setSaveFeedback] = useState<'success' | 'error' | null>(null);
  const [searchTimeout, setSearchTimeout] = useState<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    dispatch(fetchNotes());
  }, [dispatch]);

  const handleSearch = useCallback((query: string) => {
    dispatch(setSearchQuery(query));
    if (searchTimeout) clearTimeout(searchTimeout);
    const timeout = setTimeout(() => {
      if (query.trim()) {
        dispatch(searchNotes(query));
      } else {
        dispatch(fetchNotes());
      }
    }, 300);
    setSearchTimeout(timeout);
  }, [dispatch, searchTimeout]);

  const sortedNotes = [...notes].sort((a, b) => {
    const dateA = new Date(a.updatedAt).getTime();
    const dateB = new Date(b.updatedAt).getTime();
    return sortBy === 'newest' ? dateB - dateA : dateA - dateB;
  });

  const openCreateModal = () => {
    setEditingNote(null);
    setNoteContent('');
    setIsModalOpen(true);
  };

  const openEditModal = (note: Note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setIsModalOpen(true);
  };

  const handleSave = async () => {
    if (!noteContent.trim()) return;

    try {
      if (editingNote) {
        await dispatch(updateNote({ id: editingNote._id, data: { content: noteContent } })).unwrap();
      } else {
        await dispatch(createNote({ content: noteContent, isPrivate: true })).unwrap();
      }
      setSaveFeedback('success');
      setIsModalOpen(false);
      setTimeout(() => setSaveFeedback(null), 2000);
    } catch {
      setSaveFeedback('error');
      setTimeout(() => setSaveFeedback(null), 3000);
    }
  };

  const handleDelete = async () => {
    if (!deleteTarget) return;
    try {
      await dispatch(deleteNote(deleteTarget)).unwrap();
      setDeleteTarget(null);
    } catch {
      // Error handled by slice
    }
  };

  const entityTypeLabel = (type?: string) => {
    switch (type) {
      case 'person': return 'Person';
      case 'action': return 'Action';
      case 'initiative': return 'Initiative';
      case 'organization': return 'Organization';
      default: return '';
    }
  };

  return (
    <div
      className="relative min-h-screen"
      data-icod-id="src_pages_journal_tsx_bbfb">
      <AnimatedBackground variant="default" data-icod-id="src_pages_journal_tsx_7add" />
      <div
        className="relative z-10 space-y-6 p-4 pb-28 pt-safe max-w-2xl mx-auto"
        data-icod-id="src_pages_journal_tsx_63d8">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4 }}
          className="flex items-center justify-between pt-4"
        >
          <div className="space-y-1" data-icod-id="src_pages_journal_tsx_ef02">
            <h1
              className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3"
              data-icod-id="src_pages_journal_tsx_4e31">
              <div
                className="p-2 rounded-xl bg-gradient-to-br from-primary/20 to-success/10 border border-primary/20"
                data-icod-id="src_pages_journal_tsx_580a">
                <BookOpen
                  className="h-6 w-6 text-primary"
                  data-icod-id="src_pages_journal_tsx_7c16" />
              </div>
              Private Journal
            </h1>
            <p
              className="text-muted-foreground font-medium pl-1"
              data-icod-id="src_pages_journal_tsx_afe4">Your personal reflections</p>
          </div>
          <Button
            onClick={openCreateModal}
            size="icon"
            className="h-12 w-12 rounded-2xl shadow-lg shadow-primary/30"
            data-icod-id="src_pages_journal_tsx_3b4f">
            <Plus className="h-6 w-6" data-icod-id="src_pages_journal_tsx_3bdd" />
          </Button>
        </motion.div>

        {/* Save feedback */}
        <AnimatePresence>
          {saveFeedback && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
            >
              <Alert
                variant={saveFeedback === 'success' ? 'success' : 'error'}
                data-icod-id="src_pages_journal_tsx_71c3">
                {saveFeedback === 'success' ? 'Note saved successfully' : 'Failed to save note'}
              </Alert>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Search & Sort */}
        <motion.div 
          className="flex gap-3"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
        >
          <div className="relative flex-1" data-icod-id="src_pages_journal_tsx_4e52">
            <Search
              className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground"
              data-icod-id="src_pages_journal_tsx_a048" />
            <Input
              placeholder="Search your journal..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="pl-12 h-12 rounded-2xl glass border-border/30"
              data-icod-id="src_pages_journal_tsx_0466" />
          </div>
          <Button
            variant="glass"
            onClick={() => setSortBy(sortBy === 'newest' ? 'oldest' : 'newest')}
            className="rounded-2xl px-4"
            data-icod-id="src_pages_journal_tsx_94f2">
            <Calendar className="h-5 w-5 mr-2" data-icod-id="src_pages_journal_tsx_fe1f" />
            {sortBy === 'newest' ? 'Newest' : 'Oldest'}
          </Button>
        </motion.div>

        {/* Notes List */}
        {status === 'loading' ? (
          <SkeletonLoader variant="list" count={5} data-icod-id="src_pages_journal_tsx_4ffd" />
        ) : sortedNotes.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            <EmptyState
              illustration={searchQuery ? <NoSearchResultsIllustration data-icod-id="src_pages_journal_tsx_bd5e" /> : <JournalEmptyIllustration data-icod-id="src_pages_journal_tsx_aeb2" />}
              title={searchQuery ? 'No matching entries' : 'No journal entries yet'}
              description={searchQuery ? 'Try a different search term to find your reflections' : 'Start writing your first reflection and watch your journal grow'}
              action={!searchQuery ? <Button onClick={openCreateModal} data-icod-id="src_pages_journal_tsx_f922">Write Entry</Button> : undefined}
              data-icod-id="src_pages_journal_tsx_24f2" />
          </motion.div>
        ) : (
          <div className="space-y-4" data-icod-id="src_pages_journal_tsx_38cb">
            <AnimatePresence mode="popLayout">
              {sortedNotes.map((note, i) => (
                <motion.div
                  key={note._id}
                  layout
                  initial={{ opacity: 0, y: 15 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ delay: i * 0.03, duration: 0.3 }}
                >
                  <Card
                    glass
                    className="p-5 group hover:shadow-lg hover:shadow-primary/10 transition-all duration-300"
                    data-icod-id={`src_pages_journal_tsx_f467_${note._id}`}>
                    <div
                      className="flex items-start justify-between gap-4"
                      data-icod-id={`src_pages_journal_tsx_ab83_${note._id}`}>
                      <div
                        className="flex-1 min-w-0"
                        data-icod-id={`src_pages_journal_tsx_8953_${note._id}`}>
                        <p
                          className="text-foreground whitespace-pre-wrap line-clamp-4 leading-relaxed"
                          data-icod-id={`src_pages_journal_tsx_1dc1_${note._id}`}>
                          {note.content}
                        </p>
                        
                        <div
                          className="mt-4 flex flex-wrap items-center gap-2"
                          data-icod-id={`src_pages_journal_tsx_26ef_${note._id}`}>
                          <span
                            className="text-xs text-muted-foreground font-medium px-2.5 py-1 rounded-lg bg-muted/50"
                            data-icod-id={`src_pages_journal_tsx_61e0_${note._id}`}>
                            {new Date(note.updatedAt).toLocaleDateString(undefined, {
                              month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit'
                            })}
                          </span>
                          
                          {note.entityType && (
                            <span
                              className="inline-flex items-center gap-1.5 rounded-lg bg-secondary/30 px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-secondary/20"
                              data-icod-id={`src_pages_journal_tsx_ca2e_${note._id}`}>
                              <Tag
                                className="h-3 w-3"
                                data-icod-id={`src_pages_journal_tsx_d5fa_${note._id}`} />
                              {entityTypeLabel(note.entityType)}
                            </span>
                          )}
                          
                          {note.isPrivate && (
                            <span
                              className="rounded-lg bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary border border-primary/20"
                              data-icod-id={`src_pages_journal_tsx_ca94_${note._id}`}>
                              Private
                            </span>
                          )}
                        </div>
                      </div>
                      
                      <div
                        className="flex shrink-0 gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200"
                        data-icod-id={`src_pages_journal_tsx_1906_${note._id}`}>
                        <Button
                          variant="glass"
                          size="icon"
                          className="h-9 w-9 rounded-xl shadow-md"
                          onClick={() => openEditModal(note)}
                          data-icod-id={`src_pages_journal_tsx_329d_${note._id}`}>
                          <Pencil
                            className="h-4 w-4"
                            data-icod-id={`src_pages_journal_tsx_aafa_${note._id}`} />
                        </Button>
                        <Button
                          variant="glass"
                          size="icon"
                          className="h-9 w-9 rounded-xl shadow-md text-destructive"
                          onClick={() => setDeleteTarget(note._id)}
                          data-icod-id={`src_pages_journal_tsx_1467_${note._id}`}>
                          <Trash2
                            className="h-4 w-4"
                            data-icod-id={`src_pages_journal_tsx_6c32_${note._id}`} />
                        </Button>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}
      </div>
      {/* Create/Edit Modal */}
      <Modal
        open={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        title={editingNote ? 'Edit Entry' : 'New Journal Entry'}
        footer={
          <div
            className="flex justify-end gap-3"
            data-icod-id="src_pages_journal_tsx_7122">
            <Button
              variant="outline"
              onClick={() => setIsModalOpen(false)}
              data-icod-id="src_pages_journal_tsx_9ab1">Cancel</Button>
            <Button
              onClick={handleSave}
              disabled={!noteContent.trim()}
              data-icod-id="src_pages_journal_tsx_d11a">
              <Save className="h-4 w-4 mr-2" data-icod-id="src_pages_journal_tsx_d6dd" />
              Save
            </Button>
          </div>
        }
        data-icod-id="src_pages_journal_tsx_3f3c">
        <div className="space-y-5" data-icod-id="src_pages_journal_tsx_6a08">
          <Field
            label="Your reflection"
            required
            data-icod-id="src_pages_journal_tsx_a84a">
            <textarea
              className={inputClass('min-h-[240px] resize-y rounded-2xl')}
              value={noteContent}
              onChange={(e) => setNoteContent(e.target.value)}
              placeholder="What's on your mind?"
              autoFocus
              data-icod-id="src_pages_journal_tsx_b914" />
          </Field>
        </div>
      </Modal>
      {/* Delete Confirmation */}
      <ConfirmDialog
        open={!!deleteTarget}
        onClose={() => setDeleteTarget(null)}
        onConfirm={handleDelete}
        title="Delete Entry"
        description="Are you sure you want to delete this journal entry? This cannot be undone."
        confirmLabel="Delete"
        variant="destructive"
        data-icod-id="src_pages_journal_tsx_463f" />
    </div>
  );
}
