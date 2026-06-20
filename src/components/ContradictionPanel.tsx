import { AlertTriangle, AlertCircle, Info, ChevronDown, ChevronUp } from 'lucide-react';
import { useState } from 'react';
import type { Contradiction } from '../types';

interface ContradictionPanelProps {
  contradictions: Contradiction[];
  onJumpToItem?: (index: number) => void;
}

const typeLabels: Record<Contradiction['type'], string> = {
  time: '时间矛盾',
  location: '地点跳跃',
  character: '人物冲突',
  emotion: '情绪跳跃',
};

const typeColors: Record<Contradiction['type'], string> = {
  time: 'text-neon-pink',
  location: 'text-neon-yellow',
  character: 'text-neon-purple',
  emotion: 'text-neon-mint',
};

const typeBgColors: Record<Contradiction['type'], string> = {
  time: 'bg-neon-pink/10',
  location: 'bg-neon-yellow/10',
  character: 'bg-neon-purple/10',
  emotion: 'bg-neon-mint/10',
};

export default function ContradictionPanel({
  contradictions,
  onJumpToItem,
}: ContradictionPanelProps) {
  const [expandedIndex, setExpandedIndex] = useState<number | null>(null);

  const errors = contradictions.filter((c) => c.severity === 'error');
  const warnings = contradictions.filter((c) => c.severity === 'warning');

  if (contradictions.length === 0) {
    return (
      <div className="glass-card p-5">
        <h3 className="font-display text-amber-glow mb-3 flex items-center gap-2">
          <AlertCircle className="w-5 h-5" />
          矛盾检测
        </h3>
        <div className="py-6 text-center">
          <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-neon-mint/20 flex items-center justify-center">
            <Info className="w-8 h-8 text-neon-mint" />
          </div>
          <p className="text-neon-mint font-body">一切正常</p>
          <p className="text-night-400 text-sm font-body mt-1">
            没有检测到矛盾镜头
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="glass-card p-5">
      <h3 className="font-display text-amber-glow mb-4 flex items-center gap-2">
        <AlertCircle className="w-5 h-5" />
        矛盾检测
      </h3>

      <div className="flex gap-4 mb-4">
        {errors.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-red-400" />
            <span className="text-sm font-body text-red-400">
              {errors.length} 个错误
            </span>
          </div>
        )}
        {warnings.length > 0 && (
          <div className="flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-yellow-400" />
            <span className="text-sm font-body text-yellow-400">
              {warnings.length} 个警告
            </span>
          </div>
        )}
      </div>

      <div className="space-y-2 max-h-64 overflow-y-auto">
        {contradictions.map((item, index) => (
          <div
            key={index}
            className={`rounded-lg border ${
              item.severity === 'error'
                ? 'border-red-500/30 bg-red-500/5'
                : 'border-yellow-500/30 bg-yellow-500/5'
            } overflow-hidden`}
          >
            <button
              onClick={() =>
                setExpandedIndex(expandedIndex === index ? null : index)
              }
              className="w-full p-3 text-left flex items-start gap-3"
            >
              {item.severity === 'error' ? (
                <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
              ) : (
                <AlertCircle className="w-5 h-5 text-yellow-400 shrink-0 mt-0.5" />
              )}

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded-full font-body ${typeBgColors[item.type]} ${typeColors[item.type]}`}
                  >
                    {typeLabels[item.type]}
                  </span>
                  <span className="text-xs text-night-400 font-body">
                    第 {item.itemIndex + 1} 帧
                  </span>
                </div>
                <p className="text-sm text-night-200 font-body line-clamp-2">
                  {item.message}
                </p>
              </div>

              {expandedIndex === index ? (
                <ChevronUp className="w-4 h-4 text-night-400 shrink-0 mt-1" />
              ) : (
                <ChevronDown className="w-4 h-4 text-night-400 shrink-0 mt-1" />
              )}
            </button>

            {expandedIndex === index && (
              <div className="px-3 pb-3 pl-11">
                <p className="text-sm text-night-300 font-body mb-2">
                  <span className="text-night-500">建议：</span>
                  {item.suggestion}
                </p>
                {onJumpToItem && (
                  <button
                    onClick={() => onJumpToItem(item.itemIndex)}
                    className="text-xs text-amber-neon font-body hover:text-amber-glow transition-colors"
                  >
                    跳转到该片段 →
                  </button>
                )}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
