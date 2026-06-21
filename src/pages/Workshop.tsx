import { useState, useMemo, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  DndContext,
  DragOverlay,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  useDroppable,
  type DragStartEvent,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import {
  Film,
  Clock,
  AlertCircle,
  Play,
  Send,
  User,
  MapPin,
  Sparkles,
  Trash2,
  Plus,
} from 'lucide-react';
import NavBar from '../components/NavBar';
import ClipCard from '../components/ClipCard';
import TimelineItemCard from '../components/TimelineItemCard';
import NarrationEditor from '../components/NarrationEditor';
import ContradictionPanel from '../components/ContradictionPanel';
import ScoreModal from '../components/ScoreModal';
import FilmPlayer from '../components/FilmPlayer';
import { useGameStore } from '../store/useGameStore';
import { detectContradictions } from '../utils/scoring';
import type { Clip, TimelineItem, Contradiction } from '../types';
import { timeOfDayLabels, timeOfDayOrder } from '../types';
import type { ScoringResult } from '../utils/scoring';

type FilterType = 'all' | 'character' | 'location' | 'emotion' | 'time';

function EmptyTimelineDropzone() {
  const { setNodeRef, isOver } = useDroppable({
    id: 'timeline-dropzone',
  });

  return (
    <div
      ref={setNodeRef}
      className={`h-full flex items-center justify-center border-2 border-dashed rounded-lg transition-all duration-200 ${
        isOver
          ? 'border-amber-neon bg-amber-neon/10 scale-[1.01]'
          : 'border-night-600/50'
      }`}
    >
      <div className="text-center">
        <Plus
          className={`w-12 h-12 mx-auto mb-3 transition-colors ${
            isOver ? 'text-amber-neon' : 'text-night-500'
          }`}
        />
        <p
          className={`font-body transition-colors ${
            isOver ? 'text-amber-neon' : 'text-night-400'
          }`}
        >
          {isOver ? '松开鼠标添加素材' : '点击或拖拽素材到这里开始剪辑'}
        </p>
      </div>
    </div>
  );
}

export default function Workshop() {
  const navigate = useNavigate();
  const scrollRef = useRef<HTMLDivElement>(null);

  const clips = useGameStore((state) => state.clips);
  const characters = useGameStore((state) => state.characters);
  const locations = useGameStore((state) => state.locations);
  const emotions = useGameStore((state) => state.emotions);
  const commissions = useGameStore((state) => state.commissions);
  const currentCommissionId = useGameStore((state) => state.currentCommissionId);
  const currentEditVersionId = useGameStore((state) => state.currentEditVersionId);
  const editVersions = useGameStore((state) => state.editVersions);

  const addTimelineItem = useGameStore((state) => state.addTimelineItem);
  const removeTimelineItem = useGameStore((state) => state.removeTimelineItem);
  const reorderTimelineItems = useGameStore((state) => state.reorderTimelineItems);
  const updateTimelineItem = useGameStore((state) => state.updateTimelineItem);
  const clearTimeline = useGameStore((state) => state.clearTimeline);
  const createEditVersion = useGameStore((state) => state.createEditVersion);
  const setCurrentEditVersion = useGameStore((state) => state.setCurrentEditVersion);
  const submitFilm = useGameStore((state) => state.submitFilm);

  const [activeId, setActiveId] = useState<string | null>(null);
  const [editingItem, setEditingItem] = useState<TimelineItem | null>(null);
  const [showScoreModal, setShowScoreModal] = useState(false);
  const [scoreResult, setScoreResult] = useState<ScoringResult | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [filterType, setFilterType] = useState<FilterType>('all');
  const [selectedFilterValue, setSelectedFilterValue] = useState<string | null>(null);

  const currentCommission = commissions.find((c) => c.id === currentCommissionId);
  const currentVersion = editVersions.find((v) => v.id === currentEditVersionId);
  const timelineItems = currentVersion?.timelineItems || [];

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 5,
      },
    }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  const activeClip = useMemo(() => {
    if (!activeId) return null;
    return clips.find((c) => c.id === activeId) || null;
  }, [activeId, clips]);

  const contradictions: Contradiction[] = useMemo(() => {
    return detectContradictions(timelineItems, clips, characters, locations);
  }, [timelineItems, clips, characters, locations]);

  const conflictingItemIds = useMemo(() => {
    const ids = new Set<string>();
    const sortedItems = [...timelineItems].sort((a, b) => a.order - b.order);
    contradictions.forEach((c) => {
      if (sortedItems[c.itemIndex]) {
        ids.add(sortedItems[c.itemIndex].id);
      }
      c.relatedIndices.forEach((idx) => {
        if (sortedItems[idx]) {
          ids.add(sortedItems[idx].id);
        }
      });
    });
    return ids;
  }, [contradictions, timelineItems]);

  const filteredClips = useMemo(() => {
    let result = [...clips];

    if (currentCommission) {
      const commissionClips = [
        ...currentCommission.requiredClips,
        ...currentCommission.optionalClips,
      ];
      result = result.filter((c) => commissionClips.includes(c.id));
    }

    if (filterType === 'character' && selectedFilterValue) {
      result = result.filter((c) => c.characters.includes(selectedFilterValue));
    } else if (filterType === 'location' && selectedFilterValue) {
      result = result.filter((c) => c.location === selectedFilterValue);
    } else if (filterType === 'emotion' && selectedFilterValue) {
      result = result.filter((c) => c.emotions.includes(selectedFilterValue));
    } else if (filterType === 'time' && selectedFilterValue) {
      result = result.filter((c) => c.timeOfDay === selectedFilterValue);
    }

    return result;
  }, [clips, filterType, selectedFilterValue, currentCommission]);

  const handleDragStart = (event: DragStartEvent) => {
    setActiveId(event.active.id as string);
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveId(null);

    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const activeIsTimelineItem = timelineItems.some((item) => item.id === activeId);
    const overIsTimelineItem = timelineItems.some((item) => item.id === overId);
    const overIsDropzone = overId === 'timeline-dropzone';

    if (activeIsTimelineItem && overIsTimelineItem && activeId !== overId) {
      const oldIndex = timelineItems.findIndex((item) => item.id === activeId);
      const newIndex = timelineItems.findIndex((item) => item.id === overId);
      const newItems = arrayMove([...timelineItems], oldIndex, newIndex);
      reorderTimelineItems(newItems);
      return;
    }

    if (!activeIsTimelineItem && (overIsDropzone || overIsTimelineItem)) {
      const clip = clips.find((c) => c.id === activeId);
      if (clip) {
        ensureEditVersion();
        let insertIndex = -1;
        if (overIsTimelineItem) {
          insertIndex = timelineItems.findIndex((item) => item.id === overId);
        }
        setTimeout(() => {
          addTimelineItem(activeId, insertIndex);
        }, 0);
      }
    }
  };

  const ensureEditVersion = () => {
    if (!currentEditVersionId && currentCommissionId) {
      createEditVersion(currentCommissionId, `${currentCommission?.title} - 初剪`);
    }
  };

  const handleClipClick = (clip: Clip) => {
    ensureEditVersion();
    addTimelineItem(clip.id);
  };

  const handleSaveNarration = (itemId: string, narration: string, narrationStyle?: any) => {
    const updates: any = { narration };
    if (narrationStyle) {
      updates.narrationStyle = narrationStyle;
    }
    updateTimelineItem(itemId, updates);
  };

  const handleSubmit = () => {
    if (!currentEditVersionId || !currentCommissionId) return;
    const result = submitFilm(currentEditVersionId, currentCommissionId);
    if (result) {
      setScoreResult(result);
      setShowScoreModal(true);
    }
  };

  const handlePlay = () => {
    setIsPlaying(true);
  };

  const sortedTimelineItems = [...timelineItems].sort((a, b) => a.order - b.order);

  const totalDuration = sortedTimelineItems.reduce((sum, item) => {
    const clip = clips.find((c) => c.id === item.clipId);
    return sum + (clip?.duration || 0);
  }, 0);

  const filterOptions = {
    all: { label: '全部', icon: Film },
    character: { label: '人物', icon: User },
    location: { label: '地点', icon: MapPin },
    emotion: { label: '情绪', icon: Sparkles },
    time: { label: '时间', icon: Clock },
  };

  const getFilterValues = () => {
    switch (filterType) {
      case 'character':
        return characters.map((c) => ({ id: c.id, label: c.name, avatar: c.avatar }));
      case 'location':
        return locations.map((l) => ({ id: l.id, label: l.name }));
      case 'emotion':
        return emotions.map((e) => ({ id: e.id, label: e.name, color: e.color, icon: e.icon }));
      case 'time':
        return timeOfDayOrder.map((t) => ({ id: t, label: timeOfDayLabels[t] }));
      default:
        return [];
    }
  };

  const handleNewVersion = () => {
    if (currentCommissionId) {
      createEditVersion(currentCommissionId, `${currentCommission?.title} - 版本 ${editVersions.length + 1}`);
    }
  };

  const timelineItemIds = sortedTimelineItems.map((item) => item.id);

  return (
    <div className="min-h-screen bg-night-900 film-grain">
      <div className="absolute inset-0 bg-gradient-to-b from-night-800 to-night-900" />

      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="relative z-10 min-h-screen flex flex-col">
          <NavBar />

          <div className="flex-1 flex flex-col lg:flex-row gap-4 p-4 max-h-[calc(100vh-80px)] overflow-hidden">
            {/* 左侧素材库 */}
            <div className="w-full lg:w-72 xl:w-80 glass-card flex flex-col overflow-hidden">
              <div className="p-4 border-b border-night-600/50">
                <h2 className="font-display text-lg text-amber-glow mb-3 flex items-center gap-2">
                  <Film className="w-5 h-5" />
                  素材库
                </h2>

                <div className="flex flex-wrap gap-1 mb-3">
                  {(Object.keys(filterOptions) as FilterType[]).map((type) => {
                    const opt = filterOptions[type];
                    const Icon = opt.icon;
                    return (
                      <button
                        key={type}
                        onClick={() => {
                          setFilterType(type);
                          setSelectedFilterValue(null);
                        }}
                        className={`px-2 py-1 rounded text-xs font-body flex items-center gap-1 transition-colors ${
                          filterType === type
                            ? 'bg-amber-neon/20 text-amber-neon'
                            : 'text-night-400 hover:text-night-200 hover:bg-night-700/30'
                        }`}
                      >
                        <Icon className="w-3 h-3" />
                        {opt.label}
                      </button>
                    );
                  })}
                </div>

                {filterType !== 'all' && (
                  <div className="flex flex-wrap gap-1">
                    {getFilterValues().map((item: any) => (
                      <button
                        key={item.id}
                        onClick={() =>
                          setSelectedFilterValue(
                            selectedFilterValue === item.id ? null : item.id
                          )
                        }
                        className={`px-2 py-0.5 rounded text-xs font-body transition-colors ${
                          selectedFilterValue === item.id
                            ? 'bg-amber-neon/30 text-amber-glow'
                            : 'bg-night-700/30 text-night-300 hover:bg-night-700/50'
                        }`}
                      >
                        {item.icon || item.avatar || ''} {item.label}
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div
                ref={scrollRef}
                className="flex-1 overflow-y-auto p-3 space-y-3"
              >
                {filteredClips.length === 0 ? (
                  <div className="text-center py-8 text-night-500 font-body text-sm">
                    暂无素材
                  </div>
                ) : (
                  filteredClips.map((clip) => (
                    <div key={clip.id} onClick={() => handleClipClick(clip)}>
                      <ClipCard
                        clip={clip}
                        characters={characters}
                        locations={locations}
                        emotions={emotions}
                        compact
                      />
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* 中间时间轴区域 */}
            <div className="flex-1 flex flex-col gap-4 min-h-0">
              {/* 顶部信息栏 */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div>
                  <h2 className="font-display text-lg text-amber-glow">
                    {currentCommission
                      ? currentCommission.title
                      : '请先选择一个委托'}
                  </h2>
                  {currentCommission && (
                    <p className="text-night-400 text-sm font-body mt-1">
                      {currentCommission.story.slice(0, 50)}...
                    </p>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-night-400 font-body">总时长</div>
                    <div className="text-amber-glow font-mono">{totalDuration}s</div>
                  </div>
                  <div className="text-right">
                    <div className="text-xs text-night-400 font-body">片段数</div>
                    <div className="text-amber-glow font-mono">
                      {sortedTimelineItems.length}
                    </div>
                  </div>
                </div>
              </div>

              {/* 时间轴 */}
              <div className="flex-1 glass-card p-4 flex flex-col min-h-0 overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="font-display text-amber-neon text-sm flex items-center gap-2">
                    <Clock className="w-4 h-4" />
                    时间轴
                  </h3>
                  <div className="flex items-center gap-2">
                    {sortedTimelineItems.length > 0 && (
                      <>
                        <button
                          onClick={handlePlay}
                          className="px-3 py-1.5 rounded-lg bg-neon-mint/20 text-neon-mint text-sm font-body hover:bg-neon-mint/30 transition-colors flex items-center gap-1"
                        >
                          <Play className="w-4 h-4" />
                          预览
                        </button>
                        <button
                          onClick={clearTimeline}
                          className="px-3 py-1.5 rounded-lg text-night-400 text-sm font-body hover:bg-red-500/10 hover:text-red-400 transition-colors flex items-center gap-1"
                        >
                          <Trash2 className="w-4 h-4" />
                          清空
                        </button>
                      </>
                    )}
                  </div>
                </div>

                <div
                  id="timeline-dropzone"
                  data-id="timeline-dropzone"
                  className="flex-1 overflow-y-auto"
                >
                  {sortedTimelineItems.length === 0 ? (
                    <EmptyTimelineDropzone />
                  ) : (
                    <SortableContext
                      items={timelineItemIds}
                      strategy={verticalListSortingStrategy}
                    >
                      <div className="space-y-2">
                        {sortedTimelineItems.map((item) => {
                          const clip = clips.find((c) => c.id === item.clipId);
                          return (
                            <TimelineItemCard
                              key={item.id}
                              item={item}
                              clip={clip}
                              characters={characters}
                              locations={locations}
                              index={item.order}
                              hasConflict={conflictingItemIds.has(item.id)}
                              onRemove={() => removeTimelineItem(item.id)}
                              onClick={() => setEditingItem(item)}
                            />
                          );
                        })}
                      </div>
                    </SortableContext>
                  )}
                </div>
              </div>

              {/* 底部操作栏 */}
              <div className="glass-card p-4 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {contradictions.length > 0 && (
                    <div className="flex items-center gap-2 text-red-400 text-sm font-body">
                      <AlertCircle className="w-4 h-4 animate-pulse" />
                      <span>{contradictions.length} 个问题需要注意</span>
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-3">
                  {currentEditVersionId && (
                    <button
                      onClick={handleNewVersion}
                      className="px-4 py-2 rounded-lg border border-night-500 text-night-300 font-body hover:bg-night-700/30 transition-colors text-sm"
                    >
                      新建版本
                    </button>
                  )}
                  <button
                    onClick={handleSubmit}
                    disabled={sortedTimelineItems.length === 0}
                    className="px-6 py-2 rounded-lg bg-amber-neon text-night-900 font-body font-medium hover:bg-amber-glow transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 shadow-neon-amber"
                  >
                    <Send className="w-4 h-4" />
                    提交成片
                  </button>
                </div>
              </div>
            </div>

            {/* 右侧信息面板 */}
            <div className="w-full lg:w-72 xl:w-80 flex flex-col gap-4 overflow-y-auto">
              {currentCommission && (
                <div className="glass-card p-4">
                  <h3 className="font-display text-amber-glow mb-3 flex items-center gap-2">
                    <Sparkles className="w-5 h-5" />
                    当前委托
                  </h3>
                  <div className="flex items-center gap-3 mb-3">
                    <div className="w-10 h-10 rounded-full bg-night-700 flex items-center justify-center text-xl">
                      {characters.find((c) => c.id === currentCommission.customerId)?.avatar}
                    </div>
                    <div>
                      <p className="text-amber-glow font-display text-sm">
                        {currentCommission.title}
                      </p>
                      <p className="text-night-400 text-xs font-body">
                        {characters.find((c) => c.id === currentCommission.customerId)?.name}
                      </p>
                    </div>
                  </div>
                  <p className="text-night-300 text-sm font-body line-clamp-3">
                    {currentCommission.story}
                  </p>
                  <div className="mt-3">
                    <p className="text-xs text-night-400 font-body mb-2">目标情绪</p>
                    <div className="flex flex-wrap gap-1">
                      {currentCommission.targetEmotions.map((eid) => {
                        const emotion = emotions.find((e) => e.id === eid);
                        return emotion ? (
                          <span
                            key={eid}
                            className="px-2 py-0.5 rounded-full text-xs font-body"
                            style={{
                              backgroundColor: `${emotion.color}20`,
                              color: emotion.color,
                            }}
                          >
                            {emotion.icon} {emotion.name}
                          </span>
                        ) : null;
                      })}
                    </div>
                  </div>
                </div>
              )}

              <ContradictionPanel contradictions={contradictions} />

              {editVersions.filter((v) => v.commissionId === currentCommissionId).length > 0 && (
                <div className="glass-card p-4">
                  <h3 className="font-display text-amber-glow mb-3">剪辑版本</h3>
                  <div className="space-y-2">
                    {editVersions
                      .filter((v) => v.commissionId === currentCommissionId)
                      .slice()
                      .reverse()
                      .map((version) => (
                        <button
                          key={version.id}
                          onClick={() => setCurrentEditVersion(version.id)}
                          className={`w-full p-3 rounded-lg text-left transition-colors ${
                            version.id === currentEditVersionId
                              ? 'bg-amber-neon/20 border border-amber-neon/50'
                              : 'bg-night-700/30 hover:bg-night-700/50 border border-transparent'
                          }`}
                        >
                          <p className="text-sm font-display text-amber-glow truncate">
                            {version.title}
                          </p>
                          <p className="text-xs text-night-400 font-body mt-1">
                            {version.timelineItems.length} 个片段 ·{' '}
                            {new Date(version.updatedAt).toLocaleDateString()}
                          </p>
                        </button>
                      ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <DragOverlay>
          {activeClip && (
            <div className="w-48 glass-card p-3 opacity-90 rotate-2 shadow-2xl">
              <div
                className="w-full aspect-video rounded mb-2 scan-lines"
                style={{ background: activeClip.thumbnail }}
              />
              <p className="text-xs text-amber-glow font-display truncate">
                {activeClip.title}
              </p>
            </div>
          )}
        </DragOverlay>
      </DndContext>

      {editingItem && (
        <NarrationEditor
          item={editingItem}
          clip={clips.find((c) => c.id === editingItem.clipId)}
          characters={characters}
          locations={locations}
          emotions={emotions}
          onClose={() => setEditingItem(null)}
          onSave={(narration, narrationStyle) => handleSaveNarration(editingItem.id, narration, narrationStyle)}
        />
      )}

      {showScoreModal && scoreResult && (
        <ScoreModal
          result={scoreResult}
          onClose={() => {
            setShowScoreModal(false);
            navigate('/records');
          }}
          onReplay={() => {
            setShowScoreModal(false);
            setIsPlaying(true);
          }}
        />
      )}

      {isPlaying && (
        <FilmPlayer
          timelineItems={timelineItems}
          clips={clips}
          onClose={() => setIsPlaying(false)}
          onComplete={() => {}}
        />
      )}
    </div>
  );
}
