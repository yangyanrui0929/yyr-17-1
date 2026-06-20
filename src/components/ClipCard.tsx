import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { Clock, MapPin, User, Star } from 'lucide-react';
import type { Clip, Character, Location, Emotion } from '../types';
import { timeOfDayLabels } from '../types';

interface ClipCardProps {
  clip: Clip;
  characters: Character[];
  locations: Location[];
  emotions: Emotion[];
  compact?: boolean;
  onClick?: () => void;
}

export default function ClipCard({
  clip,
  characters,
  locations,
  emotions,
  compact = false,
  onClick,
}: ClipCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: clip.id,
    data: { type: 'clip', clip },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.5 : 1,
    cursor: isDragging ? 'grabbing' : 'grab',
  };

  const location = locations.find((l) => l.id === clip.location);
  const clipCharacters = characters.filter((c) => clip.characters.includes(c.id));
  const clipEmotions = emotions.filter((e) => clip.emotions.includes(e.id));

  if (compact) {
    return (
      <div
        ref={setNodeRef}
        style={style}
        {...listeners}
        {...attributes}
        onClick={onClick}
        className="glass-card glass-card-hover p-3 flex gap-3 items-center"
      >
        <div
          className="w-16 h-12 rounded flex-shrink-0 relative overflow-hidden scan-lines"
          style={{ background: clip.thumbnail }}
        >
          {clip.isKeyMoment && (
            <div className="absolute top-1 right-1">
              <Star className="w-3 h-3 text-neon-yellow fill-neon-yellow" />
            </div>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <h4 className="text-sm font-display text-amber-glow truncate">{clip.title}</h4>
          <div className="flex items-center gap-2 text-xs text-night-400 mt-1">
            <span>{timeOfDayLabels[clip.timeOfDay]}</span>
            <span>·</span>
            <span>{location?.name}</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...listeners}
      {...attributes}
      onClick={onClick}
      className="glass-card glass-card-hover p-4 cursor-grab active:cursor-grabbing"
    >
      <div
        className="w-full aspect-video rounded-lg mb-3 relative overflow-hidden scan-lines old-film"
        style={{ background: clip.thumbnail }}
      >
        {clip.isKeyMoment && (
          <div className="absolute top-2 right-2 px-2 py-1 bg-neon-yellow/20 rounded-full flex items-center gap-1">
            <Star className="w-3 h-3 text-neon-yellow fill-neon-yellow" />
            <span className="text-xs text-neon-yellow font-body">关键帧</span>
          </div>
        )}
        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/50 rounded text-xs text-white font-mono flex items-center gap-1">
          <Clock className="w-3 h-3" />
          {clip.duration}s
        </div>
      </div>

      <h4 className="font-display text-amber-glow mb-2">{clip.title}</h4>
      <p className="text-night-300 text-sm font-body line-clamp-2 mb-3">
        {clip.description}
      </p>

      <div className="space-y-2">
        <div className="flex items-center gap-2 text-xs text-night-400">
          <MapPin className="w-3 h-3" />
          <span>{location?.name}</span>
          <span className="mx-1">·</span>
          <Clock className="w-3 h-3" />
          <span>{timeOfDayLabels[clip.timeOfDay]}</span>
        </div>

        {clipCharacters.length > 0 && (
          <div className="flex items-center gap-2 text-xs text-night-400">
            <User className="w-3 h-3" />
            <span>{clipCharacters.map((c) => c.name).join('、')}</span>
          </div>
        )}

        <div className="flex flex-wrap gap-1">
          {clipEmotions.slice(0, 3).map((emotion) => (
            <span
              key={emotion.id}
              className="px-2 py-0.5 rounded-full text-xs font-body"
              style={{
                backgroundColor: `${emotion.color}20`,
                color: emotion.color,
              }}
            >
              {emotion.icon} {emotion.name}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
