import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { X, GripVertical, Type, AlertTriangle } from 'lucide-react';
import type { TimelineItem, Clip, Character, Location } from '../types';
import { timeOfDayLabels } from '../types';

interface TimelineItemCardProps {
  item: TimelineItem;
  clip: Clip | undefined;
  characters: Character[];
  locations: Location[];
  index: number;
  hasConflict?: boolean;
  onRemove: () => void;
  onClick: () => void;
}

export default function TimelineItemCard({
  item,
  clip,
  characters,
  locations,
  index,
  hasConflict = false,
  onRemove,
  onClick,
}: TimelineItemCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: item.id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
    zIndex: isDragging ? 100 : 1,
  };

  const location = locations.find((l) => l.id === clip?.location);
  const clipCharacters = characters.filter((c) => clip?.characters.includes(c.id));

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`glass-card p-3 flex gap-3 items-start relative ${
        hasConflict ? 'border-red-500/50 ring-1 ring-red-500/30' : ''
      }`}
    >
      <div
        {...attributes}
        {...listeners}
        className="mt-1 cursor-grab active:cursor-grabbing text-night-400 hover:text-amber-neon transition-colors"
      >
        <GripVertical className="w-4 h-4" />
      </div>

      <div className="flex-1 min-w-0" onClick={onClick}>
        <div className="flex items-start gap-3">
          <div
            className="w-20 h-14 rounded flex-shrink-0 relative overflow-hidden scan-lines cursor-pointer"
            style={{ background: clip?.thumbnail || '#333' }}
          >
            <div className="absolute bottom-1 left-1 text-xs text-white/80 font-mono bg-black/40 px-1 rounded">
              #{index + 1}
            </div>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h4 className="font-display text-amber-glow text-sm truncate">
                {clip?.title || '未知片段'}
              </h4>
              {hasConflict && (
                <AlertTriangle className="w-4 h-4 text-red-400 shrink-0 animate-pulse" />
              )}
            </div>

            <div className="flex items-center gap-2 text-xs text-night-400 mt-1">
              <span>{clip ? timeOfDayLabels[clip.timeOfDay] : '-'}</span>
              <span>·</span>
              <span>{location?.name || '-'}</span>
            </div>

            {clipCharacters.length > 0 && (
              <div className="flex items-center gap-1 mt-1">
                {clipCharacters.slice(0, 3).map((c) => (
                  <span
                    key={c.id}
                    className="text-lg"
                    title={c.name}
                  >
                    {c.avatar}
                  </span>
                ))}
              </div>
            )}

            {item.narration && (
              <div className="mt-2 flex items-start gap-1">
                <Type className={`w-3 h-3 shrink-0 mt-0.5 ${item.narrationStyle.color}`} />
                <p
                  className={`text-xs line-clamp-2 ${item.narrationStyle.fontSize} ${item.narrationStyle.color} ${
                    item.narrationStyle.fontFamily === 'display'
                      ? 'font-display'
                      : item.narrationStyle.fontFamily === 'mono'
                      ? 'font-mono'
                      : 'font-body'
                  }`}
                >
                  {item.narration}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <button
        onClick={(e) => {
          e.stopPropagation();
          onRemove();
        }}
        className="p-1 rounded hover:bg-red-500/20 text-night-400 hover:text-red-400 transition-colors"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
