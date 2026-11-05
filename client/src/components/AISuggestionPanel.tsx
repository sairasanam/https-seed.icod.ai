import { useState } from 'react';
import { Card, Button, Input, Field, Spinner, Alert } from '@/components/ui';
import { cn } from '@/utils/cn';
import { Sparkles, Check, RefreshCw, Bookmark, Clock, DollarSign, Tag, ChevronDown, ChevronUp, X, Plus, Calendar, AlertCircle } from 'lucide-react';
import type { SuggestionContent, SuggestionPreferences } from '@/types';

interface AISuggestionPanelProps {
  onGenerate: (request: { context: string; treeType: 'inner' | 'community' | 'outer'; preferences?: SuggestionPreferences }) => Promise<SuggestionContent[]>;
  onSave?: (suggestions: SuggestionContent[]) => void;
  onMarkComplete?: (index: number) => void;
  onAddToActions?: (suggestion: SuggestionContent) => void;
  onAddToInitiative?: (suggestion: SuggestionContent) => void;
  onScheduleReminder?: (suggestion: SuggestionContent) => void;
  onDismiss?: () => void;
  completedIndices?: number[];
  defaultTreeType?: 'inner' | 'community' | 'outer';
  className?: string;
}

const TREE_TYPE_OPTIONS = [
  { value: 'inner', label: 'Inner Circle' },
  { value: 'community', label: 'Community' },
  { value: 'outer', label: 'Outer Circle' },
] as const;

const TIME_OPTIONS = [
  { value: '', label: 'Any time' },
  { value: '<30min', label: 'Less than 30 min' },
  { value: '30-60min', label: '30-60 minutes' },
  { value: '1-3hrs', label: '1-3 hours' },
  { value: '3+hrs', label: '3+ hours' },
];

const BUDGET_OPTIONS = [
  { value: '', label: 'Any budget' },
  { value: 'free', label: 'Free' },
  { value: '<$20', label: 'Under $20' },
  { value: '<$50', label: 'Under $50' },
  { value: '<$100', label: 'Under $100' },
  { value: 'any', label: 'No limit' },
];

export default function AISuggestionPanel({
  onGenerate,
  onSave,
  onMarkComplete,
  onAddToActions,
  onAddToInitiative,
  onScheduleReminder,
  onDismiss,
  completedIndices = [],
  defaultTreeType = 'inner',
  className,
}: AISuggestionPanelProps) {
  const [context, setContext] = useState('');
  const [treeType, setTreeType] = useState<'inner' | 'community' | 'outer'>(defaultTreeType);
  const [preferences, setPreferences] = useState<SuggestionPreferences>({});
  const [showPreferences, setShowPreferences] = useState(false);
  const [suggestions, setSuggestions] = useState<SuggestionContent[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [expandedCards, setExpandedCards] = useState<Set<number>>(new Set());

  const handleGenerate = async () => {
    if (!context.trim()) return;
    setLoading(true);
    setError(null);
    try {
      const result = await onGenerate({
        context: context.trim(),
        treeType,
        preferences: Object.keys(preferences).length > 0 ? preferences : undefined,
      });
      setSuggestions(result);
      // Expand all cards by default
      setExpandedCards(new Set(result.map((_, i) => i)));
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to generate suggestions. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const toggleCardExpanded = (index: number) => {
    const newExpanded = new Set(expandedCards);
    if (newExpanded.has(index)) {
      newExpanded.delete(index);
    } else {
      newExpanded.add(index);
    }
    setExpandedCards(newExpanded);
  };

  const handleClear = () => {
    setSuggestions([]);
    setError(null);
  };

  return (
    <Card className={cn('p-5', className)} data-icod-id="src_components_aisuggestionpanel_tsx_panel">
      {/* Header */}
      <div className="flex items-center gap-3 mb-5" data-icod-id="src_components_aisuggestionpanel_tsx_header">
        <div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-primary/10"
          data-icod-id="src_components_aisuggestionpanel_tsx_c7b0">
          <Sparkles
            className="h-5 w-5 text-primary"
            data-icod-id="src_components_aisuggestionpanel_tsx_aa2d" />
        </div>
        <div data-icod-id="src_components_aisuggestionpanel_tsx_3e0e">
          <h3
            className="font-semibold text-foreground text-lg"
            data-icod-id="src_components_aisuggestionpanel_tsx_1dc4">AI Suggestions</h3>
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_components_aisuggestionpanel_tsx_1625">Get personalized ideas for nurturing connections</p>
        </div>
      </div>
      {/* Input Form */}
      <div className="space-y-4" data-icod-id="src_components_aisuggestionpanel_tsx_form">
        <Field
          label="What's the situation or need?"
          htmlFor="context-input"
          data-icod-id="src_components_aisuggestionpanel_tsx_26eb">
          <textarea
            id="context-input"
            value={context}
            onChange={(e) => setContext(e.target.value)}
            placeholder="e.g., My friend just lost their job and seems overwhelmed..."
            className="w-full min-h-[100px] rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary resize-y"
            rows={3}
            data-icod-id="src_components_aisuggestionpanel_tsx_04c2" />
        </Field>

        <div
          className="grid grid-cols-1 sm:grid-cols-2 gap-4"
          data-icod-id="src_components_aisuggestionpanel_tsx_99d8">
          <Field
            label="Focus area"
            htmlFor="tree-type-select"
            data-icod-id="src_components_aisuggestionpanel_tsx_e162">
            <select
              id="tree-type-select"
              value={treeType}
              onChange={(e) => setTreeType(e.target.value as 'inner' | 'community' | 'outer')}
              className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
              data-icod-id="src_components_aisuggestionpanel_tsx_97d8">
              {TREE_TYPE_OPTIONS.map((opt) => (
                <option
                  key={opt.value}
                  value={opt.value}
                  data-icod-id={`src_components_aisuggestionpanel_tsx_2f6b_${opt.value}`}>
                  {opt.label}
                </option>
              ))}
            </select>
          </Field>
        </div>

        {/* Expandable Preferences */}
        <button
          type="button"
          onClick={() => setShowPreferences(!showPreferences)}
          className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
          data-icod-id="src_components_aisuggestionpanel_tsx_b652">
          {showPreferences ? <ChevronUp
            className="h-4 w-4"
            data-icod-id="src_components_aisuggestionpanel_tsx_e7bf" /> : <ChevronDown
            className="h-4 w-4"
            data-icod-id="src_components_aisuggestionpanel_tsx_c527" />}
          {showPreferences ? 'Hide preferences' : 'Add preferences (optional)'}
        </button>

        {showPreferences && (
          <div
            className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/50 animate-in fade-in slide-in-from-top-2 duration-200"
            data-icod-id="src_components_aisuggestionpanel_tsx_d3be">
            <Field
              label="Available time"
              htmlFor="time-select"
              data-icod-id="src_components_aisuggestionpanel_tsx_36d1">
              <select
                id="time-select"
                value={preferences.availableTime || ''}
                onChange={(e) => setPreferences({ ...preferences, availableTime: e.target.value || undefined })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                data-icod-id="src_components_aisuggestionpanel_tsx_7a9c">
                {TIME_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    data-icod-id={`src_components_aisuggestionpanel_tsx_002d_${opt.value}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Budget"
              htmlFor="budget-select"
              data-icod-id="src_components_aisuggestionpanel_tsx_9321">
              <select
                id="budget-select"
                value={preferences.budget || ''}
                onChange={(e) => setPreferences({ ...preferences, budget: e.target.value || undefined })}
                className="w-full rounded-md border border-border bg-background px-3 py-2 text-sm text-foreground focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                data-icod-id="src_components_aisuggestionpanel_tsx_260a">
                {BUDGET_OPTIONS.map((opt) => (
                  <option
                    key={opt.value}
                    value={opt.value}
                    data-icod-id={`src_components_aisuggestionpanel_tsx_e479_${opt.value}`}>
                    {opt.label}
                  </option>
                ))}
              </select>
            </Field>

            <Field
              label="Relationship type (optional)"
              htmlFor="relationship-input"
              data-icod-id="src_components_aisuggestionpanel_tsx_55f6">
              <Input
                id="relationship-input"
                value={preferences.relationshipType || ''}
                onChange={(e) => setPreferences({ ...preferences, relationshipType: e.target.value || undefined })}
                placeholder="e.g., close friend, colleague, parent"
                data-icod-id="src_components_aisuggestionpanel_tsx_d842" />
            </Field>

            <Field
              label="Constraints (optional)"
              htmlFor="constraints-input"
              data-icod-id="src_components_aisuggestionpanel_tsx_0b02">
              <Input
                id="constraints-input"
                value={preferences.constraints || ''}
                onChange={(e) => setPreferences({ ...preferences, constraints: e.target.value || undefined })}
                placeholder="e.g., long distance, limited mobility"
                data-icod-id="src_components_aisuggestionpanel_tsx_5f4e" />
            </Field>
          </div>
        )}

        <Button
          onClick={handleGenerate}
          loading={loading}
          disabled={!context.trim()}
          className="w-full"
          size="lg"
          data-icod-id="src_components_aisuggestionpanel_tsx_ebfd">
          {!loading && <Sparkles
            className="mr-2 h-5 w-5"
            data-icod-id="src_components_aisuggestionpanel_tsx_4255" />}
          {loading ? 'Generating thoughtful suggestions...' : 'Get Suggestions'}
        </Button>
      </div>
      {/* Loading State */}
      {loading && (
        <div className="mt-6 flex flex-col items-center justify-center py-8 space-y-3" data-icod-id="src_components_aisuggestionpanel_tsx_loading">
          <Spinner size="lg" data-icod-id="src_components_aisuggestionpanel_tsx_5205" />
          <p
            className="text-sm text-muted-foreground animate-pulse"
            data-icod-id="src_components_aisuggestionpanel_tsx_9296">Crafting personalized suggestions...</p>
        </div>
      )}
      {/* Error State */}
      {error && (
        <div className="mt-4" data-icod-id="src_components_aisuggestionpanel_tsx_error">
          <Alert variant="error" data-icod-id="src_components_aisuggestionpanel_tsx_ea20">
            <div
              className="flex items-start gap-2"
              data-icod-id="src_components_aisuggestionpanel_tsx_9095">
              <AlertCircle
                className="h-5 w-5 shrink-0 mt-0.5"
                data-icod-id="src_components_aisuggestionpanel_tsx_5c69" />
              <div
                className="flex-1"
                data-icod-id="src_components_aisuggestionpanel_tsx_8cfa">
                <p
                  className="text-sm"
                  data-icod-id="src_components_aisuggestionpanel_tsx_0c8c">{error}</p>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={handleGenerate}
                  className="mt-2 h-auto py-1 px-2 text-xs"
                  data-icod-id="src_components_aisuggestionpanel_tsx_e74c">
                  <RefreshCw
                    className="mr-1 h-3 w-3"
                    data-icod-id="src_components_aisuggestionpanel_tsx_b1d0" />
                  Try again
                </Button>
              </div>
            </div>
          </Alert>
        </div>
      )}
      {/* Empty State */}
      {!loading && !error && suggestions.length === 0 && context.trim() && (
        <div className="mt-6 text-center py-6" data-icod-id="src_components_aisuggestionpanel_tsx_empty">
          <Sparkles
            className="mx-auto h-8 w-8 text-muted-foreground/50 mb-2"
            data-icod-id="src_components_aisuggestionpanel_tsx_2cfe" />
          <p
            className="text-sm text-muted-foreground"
            data-icod-id="src_components_aisuggestionpanel_tsx_cc47">
            Describe a situation or need above to get personalized suggestions
          </p>
        </div>
      )}
      {/* Suggestions Display */}
      {suggestions.length > 0 && !loading && (
        <div className="mt-6 space-y-4" data-icod-id="src_components_aisuggestionpanel_tsx_results">
          {/* Results Header */}
          <div
            className="flex items-center justify-between pb-2 border-b border-border"
            data-icod-id="src_components_aisuggestionpanel_tsx_a264">
            <span
              className="text-sm font-medium text-foreground"
              data-icod-id="src_components_aisuggestionpanel_tsx_6508">
              {suggestions.length} suggestion{suggestions.length !== 1 ? 's' : ''} generated
            </span>
            <div
              className="flex gap-1"
              data-icod-id="src_components_aisuggestionpanel_tsx_cead">
              <Button
                variant="ghost"
                size="icon"
                onClick={handleClear}
                title="Clear results"
                data-icod-id="src_components_aisuggestionpanel_tsx_55ce">
                <RefreshCw
                  className="h-4 w-4"
                  data-icod-id="src_components_aisuggestionpanel_tsx_2ca0" />
              </Button>
              {onSave && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={() => onSave(suggestions)}
                  title="Save all"
                  data-icod-id="src_components_aisuggestionpanel_tsx_b4e8">
                  <Bookmark
                    className="h-4 w-4"
                    data-icod-id="src_components_aisuggestionpanel_tsx_5fad" />
                </Button>
              )}
              {onDismiss && (
                <Button
                  variant="ghost"
                  size="icon"
                  onClick={onDismiss}
                  title="Dismiss"
                  data-icod-id="src_components_aisuggestionpanel_tsx_79c5">
                  <X
                    className="h-4 w-4"
                    data-icod-id="src_components_aisuggestionpanel_tsx_be5f" />
                </Button>
              )}
            </div>
          </div>

          {/* Suggestion Cards */}
          <div
            className="space-y-3"
            data-icod-id="src_components_aisuggestionpanel_tsx_c0e7">
            {suggestions.map((suggestion, index) => {
              const isCompleted = completedIndices.includes(index);
              const isExpanded = expandedCards.has(index);

              return (
                <div
                  key={index}
                  className={cn(
                    'rounded-lg border transition-all duration-200',
                    isCompleted
                      ? 'bg-primary/5 border-primary/20 opacity-75'
                      : 'bg-card border-border hover:border-primary/30 hover:shadow-sm'
                  )}
                  data-icod-id={`src_components_aisuggestionpanel_tsx_card_${index}`}
                >
                  {/* Card Header */}
                  <div
                    className="p-4"
                    data-icod-id={`src_components_aisuggestionpanel_tsx_b4be_${index}`}>
                    <div
                      className="flex items-start gap-3"
                      data-icod-id={`src_components_aisuggestionpanel_tsx_d899_${index}`}>
                      {/* Completion Toggle */}
                      <button
                        onClick={() => onMarkComplete?.(index)}
                        className={cn(
                          'mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all',
                          isCompleted
                            ? 'border-primary bg-primary text-primary-foreground'
                            : 'border-muted-foreground/30 text-transparent hover:border-primary hover:text-primary/50'
                        )}
                        aria-label={isCompleted ? 'Mark as incomplete' : 'Mark as complete'}
                        data-icod-id={`src_components_aisuggestionpanel_tsx_7928_${index}`}>
                        <Check
                          className="h-4 w-4"
                          data-icod-id={`src_components_aisuggestionpanel_tsx_e906_${index}`} />
                      </button>

                      {/* Content */}
                      <div
                        className="flex-1 min-w-0"
                        data-icod-id={`src_components_aisuggestionpanel_tsx_ff23_${index}`}>
                        <div
                          className="flex items-start justify-between gap-2"
                          data-icod-id={`src_components_aisuggestionpanel_tsx_047c_${index}`}>
                          <h4
                            className={cn(
                              'font-semibold text-foreground leading-tight',
                              isCompleted && 'line-through text-muted-foreground'
                            )}
                            data-icod-id={`src_components_aisuggestionpanel_tsx_ed7b_${index}`}>
                            {suggestion.title}
                          </h4>
                          <button
                            onClick={() => toggleCardExpanded(index)}
                            className="shrink-0 text-muted-foreground hover:text-foreground transition-colors"
                            data-icod-id={`src_components_aisuggestionpanel_tsx_9de5_${index}`}>
                            {isExpanded ? <ChevronUp
                              className="h-4 w-4"
                              data-icod-id={`src_components_aisuggestionpanel_tsx_3fc2_${index}`} /> : <ChevronDown
                              className="h-4 w-4"
                              data-icod-id={`src_components_aisuggestionpanel_tsx_b593_${index}`} />}
                          </button>
                        </div>

                        {/* Category and Meta Chips */}
                        <div
                          className="flex flex-wrap gap-2 mt-2"
                          data-icod-id={`src_components_aisuggestionpanel_tsx_8cbd_${index}`}>
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-accent/20 px-2.5 py-0.5 text-xs font-medium text-accent-foreground"
                            data-icod-id={`src_components_aisuggestionpanel_tsx_6b2b_${index}`}>
                            <Tag
                              className="h-3 w-3"
                              data-icod-id={`src_components_aisuggestionpanel_tsx_fca4_${index}`} />
                            {suggestion.category}
                          </span>
                          <span
                            className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                            data-icod-id={`src_components_aisuggestionpanel_tsx_2f16_${index}`}>
                            <Clock
                              className="h-3 w-3"
                              data-icod-id={`src_components_aisuggestionpanel_tsx_0003_${index}`} />
                            {suggestion.estimatedTime}
                          </span>
                          {suggestion.budget && (
                            <span
                              className="inline-flex items-center gap-1 rounded-full bg-muted px-2.5 py-0.5 text-xs text-muted-foreground"
                              data-icod-id={`src_components_aisuggestionpanel_tsx_c9af_${index}`}>
                              <DollarSign
                                className="h-3 w-3"
                                data-icod-id={`src_components_aisuggestionpanel_tsx_b99b_${index}`} />
                              {suggestion.budget}
                            </span>
                          )}
                        </div>

                        {/* Explanation (always visible) */}
                        <p
                          className="mt-2 text-sm text-muted-foreground leading-relaxed"
                          data-icod-id={`src_components_aisuggestionpanel_tsx_1f37_${index}`}>
                          {suggestion.explanation}
                        </p>

                        {/* Expanded Content */}
                        {isExpanded && (
                          <div
                            className="mt-4 space-y-3 animate-in fade-in slide-in-from-top-1 duration-200"
                            data-icod-id={`src_components_aisuggestionpanel_tsx_8cc8_${index}`}>
                            {/* Steps */}
                            {suggestion.steps.length > 0 && (
                              <div data-icod-id={`src_components_aisuggestionpanel_tsx_1c78_${index}`}>
                                <p
                                  className="text-xs font-medium text-foreground uppercase tracking-wide mb-2"
                                  data-icod-id={`src_components_aisuggestionpanel_tsx_a69b_${index}`}>
                                  Action Steps
                                </p>
                                <ol
                                  className="space-y-1.5"
                                  data-icod-id={`src_components_aisuggestionpanel_tsx_2610_${index}`}>
                                  {suggestion.steps.map((step, stepIndex) => (
                                    <li
                                      key={stepIndex}
                                      className="flex items-start gap-2 text-sm text-muted-foreground"
                                      data-icod-id={`src_components_aisuggestionpanel_tsx_3186_${index}_${stepIndex}`}>
                                      <span
                                        className="flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-medium text-primary"
                                        data-icod-id={`src_components_aisuggestionpanel_tsx_191c_${index}_${stepIndex}`}>
                                        {stepIndex + 1}
                                      </span>
                                      <span
                                        className="pt-0.5"
                                        data-icod-id={`src_components_aisuggestionpanel_tsx_6777_${index}_${stepIndex}`}>{step}</span>
                                    </li>
                                  ))}
                                </ol>
                              </div>
                            )}

                            {/* Action Buttons */}
                            <div
                              className="flex flex-wrap gap-2 pt-2 border-t border-border/50"
                              data-icod-id={`src_components_aisuggestionpanel_tsx_a0c8_${index}`}>
                              {onAddToActions && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddToActions(suggestion)}
                                  disabled={isCompleted}
                                  data-icod-id={`src_components_aisuggestionpanel_tsx_4228_${index}`}>
                                  <Plus
                                    className="mr-1.5 h-3.5 w-3.5"
                                    data-icod-id={`src_components_aisuggestionpanel_tsx_04e9_${index}`} />
                                  Add to Actions
                                </Button>
                              )}
                              {onAddToInitiative && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onAddToInitiative(suggestion)}
                                  disabled={isCompleted}
                                  data-icod-id={`src_components_aisuggestionpanel_tsx_32cf_${index}`}>
                                  <Sparkles
                                    className="mr-1.5 h-3.5 w-3.5"
                                    data-icod-id={`src_components_aisuggestionpanel_tsx_5e5e_${index}`} />
                                  Start Initiative
                                </Button>
                              )}
                              {onScheduleReminder && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => onScheduleReminder(suggestion)}
                                  disabled={isCompleted}
                                  data-icod-id={`src_components_aisuggestionpanel_tsx_bd40_${index}`}>
                                  <Calendar
                                    className="mr-1.5 h-3.5 w-3.5"
                                    data-icod-id={`src_components_aisuggestionpanel_tsx_b1e7_${index}`} />
                                  Remind Me
                                </Button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </Card>
  );
}
