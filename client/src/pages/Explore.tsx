import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Card, EmptyState, Input, Spinner } from '@/components/ui';
import { inputClass } from '@/components/ui/Input';
import { useAppDispatch, useAppSelector } from '@/store/hooks';
import { fetchExploreItems, fetchCategories } from '@/store/slices/exploreSlice';
import AnimatedBackground from '@/components/AnimatedBackground';
import type { ContentLibraryItem } from '../types';
import { Search, Lightbulb, Heart, Users, Globe, Sparkles } from 'lucide-react';

export default function Explore() {
  const dispatch = useAppDispatch();
  const { items, categories, status } = useAppSelector((state) => state.explore);
  const [searchParams, setSearchParams] = useSearchParams();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTreeType, setSelectedTreeType] = useState<string>(searchParams.get('treeType') || '');

  useEffect(() => {
    dispatch(fetchCategories());
  }, [dispatch]);

  useEffect(() => {
    const filters: any = {};
    if (searchQuery) filters.search = searchQuery;
    if (selectedCategory) filters.category = selectedCategory;
    if (selectedTreeType) filters.treeType = selectedTreeType;
    dispatch(fetchExploreItems(filters));
  }, [dispatch, searchQuery, selectedCategory, selectedTreeType]);

  const treeTypes = [
    { value: '', label: 'All Trees' },
    { value: 'inner', label: 'Inner Circle' },
    { value: 'community', label: 'Community' },
    { value: 'outer', label: 'Outer Circle' },
  ];

  if (status === 'loading' && items.length === 0) {
    return (
      <div
        className="relative min-h-screen flex items-center justify-center"
        data-icod-id="src_pages_explore_tsx_40aa">
        <AnimatedBackground variant="explore" data-icod-id="src_pages_explore_tsx_795f" />
        <Spinner size="lg" data-icod-id="src_pages_explore_tsx_6b9e" />
      </div>
    );
  }

  return (
    <div
      className="relative min-h-screen"
      data-icod-id="src_pages_explore_tsx_0e9a">
      <AnimatedBackground variant="explore" data-icod-id="src_pages_explore_tsx_76ad" />
      <div
        className="relative z-10 space-y-6 p-4 pb-28 pt-safe max-w-2xl mx-auto"
        data-icod-id="src_pages_explore_tsx_5898">
        {/* Premium Header */}
        <motion.div
          initial={{ opacity: 0, y: -12 }}
          animate={{ opacity: 1, y: 0 }}
          className="pt-4"
        >
          <h1
            className="text-3xl font-bold bg-gradient-to-r from-foreground via-foreground to-foreground/70 bg-clip-text text-transparent flex items-center gap-3"
            data-icod-id="src_pages_explore_tsx_e841">
            <div
              className="p-2 rounded-xl bg-gradient-to-br from-accent/20 to-accent/10 border border-accent/20"
              data-icod-id="src_pages_explore_tsx_a452">
              <Sparkles className="h-6 w-6 text-accent" data-icod-id="src_pages_explore_tsx_8448" />
            </div>
            Explore Ideas
          </h1>
          <p
            className="text-muted-foreground font-medium mt-1 pl-1"
            data-icod-id="src_pages_explore_tsx_5d28">Discover ways to nurture and serve</p>
        </motion.div>

        {/* Search */}
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="relative"
        >
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground"
            data-icod-id="src_pages_explore_tsx_bb80" />
          <Input
            placeholder="Search ideas..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-12 h-12 rounded-2xl glass border-border/30"
            data-icod-id="src_pages_explore_tsx_872f" />
        </motion.div>

        {/* Filters */}
        <motion.div 
          className="space-y-4"
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
        >
          <div
            className="glass rounded-2xl p-4"
            data-icod-id="src_pages_explore_tsx_3224">
            <label
              className="text-sm font-semibold text-foreground mb-2 block"
              data-icod-id="src_pages_explore_tsx_d79c">Tree Type</label>
            <select
              className={inputClass('rounded-xl')}
              value={selectedTreeType}
              onChange={(e) => setSelectedTreeType(e.target.value)}
              data-icod-id="src_pages_explore_tsx_bb32">
              {treeTypes.map(t => (
                <option
                  key={t.value}
                  value={t.value}
                  data-icod-id={`src_pages_explore_tsx_eee3_${t.value}`}>{t.label}</option>
              ))}
            </select>
          </div>

          {categories.length > 0 && (
            <div
              className="glass rounded-2xl p-4"
              data-icod-id="src_pages_explore_tsx_6340">
              <label
                className="text-sm font-semibold text-foreground mb-2 block"
                data-icod-id="src_pages_explore_tsx_25ba">Category</label>
              <select
                className={inputClass('rounded-xl')}
                value={selectedCategory}
                onChange={(e) => setSelectedCategory(e.target.value)}
                data-icod-id="src_pages_explore_tsx_e4e9">
                <option value="" data-icod-id="src_pages_explore_tsx_3dfd">All Categories</option>
                {categories.map(cat => (
                  <option key={cat} value={cat} data-icod-id={`src_pages_explore_tsx_dbac_${cat}`}>{cat}</option>
                ))}
              </select>
            </div>
          )}
        </motion.div>

        {/* Items Grid */}
        {items.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.3 }}
          >
            <EmptyState
              icon={Lightbulb}
              title="No ideas found"
              description="Try adjusting your search or filters"
              data-icod-id="src_pages_explore_tsx_e809" />
          </motion.div>
        ) : (
          <div
            className="grid gap-4 sm:grid-cols-2"
            data-icod-id="src_pages_explore_tsx_5921">
            {items.map((item, i) => (
              <motion.div
                key={item._id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 + i * 0.05 }}
              >
                <IdeaCard item={item} data-icod-id={`src_pages_explore_tsx_210d_${item._id}`} />
              </motion.div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function IdeaCard({ item }: { item: ContentLibraryItem }) {
  const icons = {
    inner: Heart,
    community: Users,
    outer: Globe,
  };
  const colors = {
    inner: 'primary',
    community: 'accent',
    outer: 'success',
  };
  const Icon = icons[item.treeType];
  const color = colors[item.treeType];

  return (
    <Card
      glass
      className="p-5 hover:shadow-lg hover:shadow-primary/10 transition-all duration-300 group"
      data-icod-id="src_pages_explore_tsx_568a">
      <div
        className="flex items-start gap-4"
        data-icod-id="src_pages_explore_tsx_3187">
        <div
          className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-${color}/10 border border-${color}/20 text-${color} group-hover:scale-110 transition-transform`}
          data-icod-id="src_pages_explore_tsx_71ef">
          <Icon className="h-6 w-6" data-icod-id="src_pages_explore_tsx_55e9" />
        </div>
        
        <div className="flex-1 min-w-0" data-icod-id="src_pages_explore_tsx_d9cf">
          <div
            className="flex items-center gap-2 mb-1.5"
            data-icod-id="src_pages_explore_tsx_1512">
            <span
              className={`text-xs font-bold uppercase tracking-wide text-${color}`}
              data-icod-id="src_pages_explore_tsx_2f3b">
              {item.treeType} circle
            </span>
            <span
              className="text-xs text-muted-foreground"
              data-icod-id="src_pages_explore_tsx_93d2">•</span>
            <span
              className="text-xs text-muted-foreground font-medium"
              data-icod-id="src_pages_explore_tsx_9049">{item.category}</span>
          </div>
          
          <h3
            className="font-bold text-lg text-foreground"
            data-icod-id="src_pages_explore_tsx_fda5">{item.title}</h3>
          <p
            className="mt-1.5 text-sm text-muted-foreground leading-relaxed"
            data-icod-id="src_pages_explore_tsx_834d">{item.content}</p>
        </div>
      </div>
      {item.tags.length > 0 && (
        <div
          className="mt-4 flex flex-wrap gap-2"
          data-icod-id="src_pages_explore_tsx_de31">
          {item.tags.slice(0, 3).map(tag => (
            <span
              key={tag}
              className="rounded-lg bg-secondary/30 px-2.5 py-1 text-xs font-medium text-secondary-foreground border border-secondary/20"
              data-icod-id={`src_pages_explore_tsx_1fba_${tag}`}>
              {tag}
            </span>
          ))}
        </div>
      )}
    </Card>
  );
}
