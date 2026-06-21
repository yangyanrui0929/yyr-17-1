import { useState, useEffect, useRef } from 'react';
import { Play, Pause, SkipBack, SkipForward, Volume2, X } from 'lucide-react';
import type { TimelineItem, Clip } from '../types';

interface FilmPlayerProps {
  timelineItems: TimelineItem[];
  clips: Clip[];
  onClose: () => void;
  onComplete?: () => void;
}

export default function FilmPlayer({
  timelineItems,
  clips,
  onClose,
  onComplete,
}: FilmPlayerProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(true);
  const [showNarration, setShowNarration] = useState(true);
  const timerRef = useRef<number | null>(null);

  const sortedItems = [...timelineItems].sort((a, b) => a.order - b.order);
  const currentItem = sortedItems[currentIndex];
  const currentClip = clips.find((c) => c.id === currentItem?.clipId);

  useEffect(() => {
    if (!isPlaying || !currentClip) return;

    timerRef.current = window.setTimeout(() => {
      if (currentIndex < sortedItems.length - 1) {
        setCurrentIndex((prev) => prev + 1);
      } else {
        setIsPlaying(false);
        onComplete?.();
      }
    }, currentClip.duration * 1000);

    return () => {
      if (timerRef.current) {
        clearTimeout(timerRef.current);
      }
    };
  }, [isPlaying, currentIndex, sortedItems, currentClip, onComplete]);

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying);
  };

  const handlePrev = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
    }
  };

  const handleNext = () => {
    if (currentIndex < sortedItems.length - 1) {
      setCurrentIndex(currentIndex + 1);
    } else {
      setIsPlaying(false);
      onComplete?.();
    }
  };

  if (sortedItems.length === 0) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm animate-fade-in">
        <div className="text-center">
          <p className="text-night-300 font-body mb-4">时间轴上没有片段</p>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-amber-neon text-night-900 rounded-lg font-body"
          >
            返回
          </button>
        </div>
      </div>
    );
  }

  const progress = ((currentIndex + 1) / sortedItems.length) * 100;

  return (
    <div className="fixed inset-0 z-50 bg-black flex items-center justify-center animate-fade-in">
      <button
        onClick={onClose}
        className="absolute top-4 right-4 z-10 p-2 rounded-full bg-night-800/80 text-white hover:bg-night-700 transition-colors"
      >
        <X className="w-6 h-6" />
      </button>

      <div className="relative w-full h-full max-w-4xl mx-auto flex flex-col">
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="relative w-full aspect-video rounded-lg overflow-hidden scan-lines film-grain vignette old-film">
            <div
              className="absolute inset-0 transition-opacity duration-500"
              style={{ background: currentClip?.thumbnail || '#111' }}
            />

            {showNarration && currentItem?.narration && (
              <div className="absolute bottom-12 left-0 right-0 text-center px-8">
                <p
                  className={`font-body text-lg md:text-xl drop-shadow-lg animate-fade-in ${currentItem.narrationStyle.fontSize} ${currentItem.narrationStyle.color}`}
                  style={{
                    fontFamily:
                      currentItem.narrationStyle.fontFamily === 'display'
                        ? "'Noto Serif SC', serif"
                        : currentItem.narrationStyle.fontFamily === 'mono'
                        ? "'JetBrains Mono', monospace"
                        : "'ZCOOL KuaiLe', sans-serif",
                    textShadow: '2px 2px 4px rgba(0,0,0,0.8)',
                  }}
                >
                  {currentItem.narration}
                </p>
              </div>
            )}

            {currentClip?.dialogue && !currentItem?.narration && (
              <div className="absolute bottom-12 left-0 right-0 text-center px-8">
                <p className="text-white font-body text-lg italic drop-shadow-lg animate-fade-in">
                  「{currentClip.dialogue}」
                </p>
              </div>
            )}

            {currentClip && (
              <div className="absolute top-4 left-4">
                <span className="text-white/60 text-sm font-mono">
                  #{currentIndex + 1} / {sortedItems.length}
                </span>
              </div>
            )}

            {isPlaying && (
              <div className="absolute top-4 right-4">
                <div className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-red-500 rounded-full animate-pulse" />
                  <span className="text-white/60 text-xs font-mono">REC</span>
                </div>
              </div>
            )}
          </div>
        </div>

        <div className="p-4 glass-card mx-4 mb-4">
          <div className="h-1 bg-night-700 rounded-full mb-4 overflow-hidden">
            <div
              className="h-full bg-amber-neon transition-all duration-300 rounded-full"
              style={{ width: `${progress}%` }}
            />
          </div>

          <div className="flex items-center justify-center gap-6">
            <button
              onClick={handlePrev}
              disabled={currentIndex === 0}
              className="p-2 text-night-300 hover:text-amber-neon transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipBack className="w-6 h-6" />
            </button>

            <button
              onClick={handlePlayPause}
              className="w-14 h-14 rounded-full bg-amber-neon text-night-900 flex items-center justify-center hover:bg-amber-glow transition-colors"
            >
              {isPlaying ? (
                <Pause className="w-6 h-6" />
              ) : (
                <Play className="w-6 h-6 ml-1" />
              )}
            </button>

            <button
              onClick={handleNext}
              disabled={currentIndex === sortedItems.length - 1}
              className="p-2 text-night-300 hover:text-amber-neon transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <SkipForward className="w-6 h-6" />
            </button>
          </div>

          <div className="flex items-center justify-center gap-4 mt-4">
            <button
              onClick={() => setShowNarration(!showNarration)}
              className={`px-3 py-1 rounded text-sm font-body transition-colors ${
                showNarration
                  ? 'bg-amber-neon/20 text-amber-neon'
                  : 'text-night-400 hover:text-night-200'
              }`}
            >
              字幕
            </button>
            <div className="flex items-center gap-2 text-night-400">
              <Volume2 className="w-4 h-4" />
              <span className="text-xs font-body">
                {currentClip?.duration || 0}s
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
