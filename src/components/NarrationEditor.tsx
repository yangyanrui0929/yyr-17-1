import { useState } from 'react';
import { X, Type, Palette, Save } from 'lucide-react';
import type { TimelineItem, Clip, Character, Location, Emotion } from '../types';
import { timeOfDayLabels } from '../types';

interface NarrationEditorProps {
  item: TimelineItem;
  clip: Clip | undefined;
  characters: Character[];
  locations: Location[];
  emotions: Emotion[];
  onClose: () => void;
  onSave: (narration: string, narrationStyle: any) => void;
}

const fontSizes = [
  { value: 'text-sm', label: '小' },
  { value: 'text-base', label: '中' },
  { value: 'text-lg', label: '大' },
  { value: 'text-xl', label: '特大' },
];

const fontFamilies = [
  { value: 'body', label: '手写体' },
  { value: 'display', label: '宋体' },
  { value: 'mono', label: '等宽' },
];

const colors = [
  { value: 'text-white', color: '#ffffff' },
  { value: 'text-amber-neon', color: '#d4a574' },
  { value: 'text-neon-pink', color: '#ff6b9d' },
  { value: 'text-neon-mint', color: '#5eead4' },
  { value: 'text-neon-yellow', color: '#ffd93d' },
];

export default function NarrationEditor({
  item,
  clip,
  characters,
  locations,
  emotions,
  onClose,
  onSave,
}: NarrationEditorProps) {
  const [narration, setNarration] = useState(item.narration);
  const [fontSize, setFontSize] = useState(item.narrationStyle.fontSize);
  const [fontFamily, setFontFamily] = useState(item.narrationStyle.fontFamily);
  const [color, setColor] = useState(item.narrationStyle.color);

  const location = locations.find((l) => l.id === clip?.location);
  const clipCharacters = characters.filter((c) => clip?.characters.includes(c.id));
  const clipEmotions = emotions.filter((e) => clip?.emotions.includes(e.id));

  const handleSave = () => {
    onSave(narration, { fontSize, fontFamily, color });
    onClose();
  };

  const getFontFamilyClass = (family: string) => {
    switch (family) {
      case 'display':
        return 'font-display';
      case 'mono':
        return 'font-mono';
      default:
        return 'font-body';
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-lg animate-slide-up">
        <div className="p-5 border-b border-night-600/50 flex items-center justify-between">
          <h3 className="font-display text-lg text-amber-glow flex items-center gap-2">
            <Type className="w-5 h-5" />
            旁白编辑
          </h3>
          <button
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-night-700/50 text-night-400 hover:text-white transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-5 space-y-5 max-h-[70vh] overflow-y-auto">
          {clip && (
            <div className="flex gap-4 p-3 bg-night-800/50 rounded-lg">
              <div
                className="w-24 h-16 rounded flex-shrink-0 scan-lines old-film"
                style={{ background: clip.thumbnail }}
              />
              <div className="flex-1 min-w-0">
                <h4 className="font-display text-amber-glow text-sm mb-1">{clip.title}</h4>
                <div className="text-xs text-night-400 space-y-1">
                  <div>{location?.name} · {timeOfDayLabels[clip.timeOfDay]}</div>
                  <div className="flex gap-1">
                    {clipCharacters.map((c) => (
                      <span key={c.id} className="text-lg" title={c.name}>
                        {c.avatar}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          <div>
            <label className="block text-sm font-display text-amber-neon mb-2">
              旁白文字
            </label>
            <textarea
              value={narration}
              onChange={(e) => setNarration(e.target.value)}
              placeholder="为这个片段写一段旁白..."
              className="w-full h-32 p-3 bg-night-800/50 border border-night-600/50 rounded-lg text-night-100 font-body resize-none focus:outline-none focus:border-amber-neon/50 transition-colors"
            />
            <p className="text-xs text-night-500 mt-1 font-body">
              {narration.length} 字
            </p>
          </div>

          <div>
            <label className="block text-sm font-display text-amber-neon mb-2 flex items-center gap-2">
              <Palette className="w-4 h-4" />
              样式设置
            </label>

            <div className="space-y-3 p-3 bg-night-800/30 rounded-lg">
              <div>
                <span className="text-xs text-night-400 font-body mb-2 block">字号</span>
                <div className="flex gap-2">
                  {fontSizes.map((size) => (
                    <button
                      key={size.value}
                      onClick={() => setFontSize(size.value)}
                      className={`px-3 py-1 rounded text-sm font-body transition-colors ${
                        fontSize === size.value
                          ? 'bg-amber-neon/20 text-amber-neon'
                          : 'bg-night-700/50 text-night-300 hover:bg-night-700'
                      }`}
                    >
                      {size.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-night-400 font-body mb-2 block">字体</span>
                <div className="flex gap-2">
                  {fontFamilies.map((family) => (
                    <button
                      key={family.value}
                      onClick={() => setFontFamily(family.value)}
                      className={`px-3 py-1 rounded text-sm transition-colors ${getFontFamilyClass(family.value)} ${
                        fontFamily === family.value
                          ? 'bg-amber-neon/20 text-amber-neon'
                          : 'bg-night-700/50 text-night-300 hover:bg-night-700'
                      }`}
                    >
                      {family.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <span className="text-xs text-night-400 font-body mb-2 block">颜色</span>
                <div className="flex gap-2">
                  {colors.map((c) => (
                    <button
                      key={c.value}
                      onClick={() => setColor(c.value)}
                      className={`w-8 h-8 rounded-full transition-all ${
                        color === c.value
                          ? 'ring-2 ring-white ring-offset-2 ring-offset-night-800 scale-110'
                          : 'hover:scale-105'
                      }`}
                      style={{ backgroundColor: c.color }}
                    />
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div>
            <span className="text-xs text-night-400 font-body mb-2 block">预览</span>
            <div
              className={`p-4 bg-night-900 rounded-lg text-center ${getFontFamilyClass(fontFamily)} ${fontSize} ${color}`}
            >
              {narration || '旁白预览效果'}
            </div>
          </div>

          {clipEmotions.length > 0 && (
            <div>
              <span className="text-xs text-night-400 font-body mb-2 block">
                片段情绪
              </span>
              <div className="flex flex-wrap gap-2">
                {clipEmotions.map((emotion) => (
                  <span
                    key={emotion.id}
                    className="px-2 py-1 rounded-full text-xs font-body"
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
          )}
        </div>

        <div className="p-5 border-t border-night-600/50 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 py-2.5 rounded-lg border border-night-500 text-night-300 font-body hover:bg-night-700/30 transition-colors"
          >
            取消
          </button>
          <button
            onClick={handleSave}
            className="flex-1 py-2.5 rounded-lg bg-amber-neon text-night-900 font-body font-medium hover:bg-amber-glow transition-colors flex items-center justify-center gap-2"
          >
            <Save className="w-4 h-4" />
            保存
          </button>
        </div>
      </div>
    </div>
  );
}
