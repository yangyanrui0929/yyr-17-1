import { useState, useEffect } from 'react';
import { X, Star, Heart, Film, PenTool, Sparkles, Award } from 'lucide-react';
import type { ScoringResult } from '../utils/scoring';

interface ScoreModalProps {
  result: ScoringResult;
  onClose: () => void;
  onReplay?: () => void;
}

export default function ScoreModal({ result, onClose, onReplay }: ScoreModalProps) {
  const [showScore, setShowScore] = useState(false);
  const [displayScore, setDisplayScore] = useState(0);
  const [showDetails, setShowDetails] = useState(false);

  useEffect(() => {
    const timer1 = setTimeout(() => {
      setShowScore(true);
    }, 500);

    return () => clearTimeout(timer1);
  }, []);

  useEffect(() => {
    if (showScore && result.totalScore > 0) {
      const duration = 1500;
      const startTime = Date.now();
      const startValue = 0;
      const endValue = result.totalScore;

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - progress, 3);
        setDisplayScore(Math.round(startValue + (endValue - startValue) * eased));

        if (progress < 1) {
          requestAnimationFrame(animate);
        } else {
          setTimeout(() => setShowDetails(true), 300);
        }
      };

      requestAnimationFrame(animate);
    }
  }, [showScore, result.totalScore]);

  const getGrade = (score: number) => {
    if (score >= 90) return { grade: 'S', color: 'text-neon-yellow', label: '神作' };
    if (score >= 80) return { grade: 'A', color: 'text-neon-pink', label: '佳作' };
    if (score >= 70) return { grade: 'B', color: 'text-neon-mint', label: '良作' };
    if (score >= 60) return { grade: 'C', color: 'text-amber-neon', label: '普通' };
    return { grade: 'D', color: 'text-night-400', label: '加油' };
  };

  const gradeInfo = getGrade(result.totalScore);

  const scoreItems = [
    { label: '情绪匹配', value: result.emotionMatch, icon: Heart, color: 'text-neon-pink' },
    { label: '叙事连贯', value: result.continuityScore, icon: Film, color: 'text-neon-mint' },
    { label: '旁白质量', value: result.narrationScore, icon: PenTool, color: 'text-neon-yellow' },
    { label: '创意惊喜', value: result.creativityScore, icon: Sparkles, color: 'text-neon-purple' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="glass-card w-full max-w-md overflow-hidden">
        <div className="absolute top-4 right-4 z-10">
          <button
            onClick={onClose}
            className="p-2 rounded-full bg-night-800/80 text-night-300 hover:text-white hover:bg-night-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="p-8 text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-b from-amber-neon/5 to-transparent" />

          <div className="relative">
            <div className="mb-4">
              <Award className="w-12 h-12 mx-auto text-amber-neon animate-float" />
            </div>

            <h2 className="font-display text-2xl text-amber-glow mb-6">
              放映结束
            </h2>

            {showScore ? (
              <>
                <div className="mb-6">
                  <div
                    className={`text-7xl font-display font-bold mb-2 ${gradeInfo.color} neon-text animate-score-pop`}
                  >
                    {displayScore}
                    <span className="text-3xl">/{gradeInfo.grade}</span>
                  </div>
                  <p className={`text-lg font-body ${gradeInfo.color}`}>
                    {gradeInfo.label}
                  </p>
                </div>

                <div className="glass-card p-4 mb-6 text-left">
                  <p className="text-night-200 font-body leading-relaxed text-sm">
                    {result.customerReaction}
                  </p>
                </div>

                {showDetails && (
                  <div className="space-y-4 animate-fade-in">
                    <div className="grid grid-cols-2 gap-3">
                      {scoreItems.map((item) => {
                        const Icon = item.icon;
                        return (
                          <div
                            key={item.label}
                            className="glass-card p-3 text-left"
                          >
                            <div className="flex items-center gap-2 mb-2">
                              <Icon className={`w-4 h-4 ${item.color}`} />
                              <span className="text-xs font-body text-night-300">
                                {item.label}
                              </span>
                            </div>
                            <div className={`text-xl font-display ${item.color}`}>
                              {item.value}
                              <span className="text-sm text-night-500">/100</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    <div className="text-left p-4 bg-night-800/50 rounded-lg">
                      <h4 className="text-amber-neon font-display text-sm mb-2">
                        评语
                      </h4>
                      <p className="text-night-300 text-sm font-body leading-relaxed">
                        {result.feedback}
                      </p>
                    </div>
                  </div>
                )}
              </>
            ) : (
              <div className="py-12">
                <div className="w-16 h-16 mx-auto mb-4 border-4 border-amber-neon/30 border-t-amber-neon rounded-full animate-spin" />
                <p className="text-night-300 font-body">正在放映...</p>
              </div>
            )}
          </div>
        </div>

        {showDetails && (
          <div className="p-5 border-t border-night-600/50 flex gap-3 animate-fade-in">
            {onReplay && (
              <button
                onClick={onReplay}
                className="flex-1 py-3 rounded-lg border border-night-500 text-night-300 font-body hover:bg-night-700/30 transition-colors flex items-center justify-center gap-2"
              >
                <Film className="w-4 h-4" />
                再看一遍
              </button>
            )}
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-lg bg-amber-neon text-night-900 font-body font-medium hover:bg-amber-glow transition-colors"
            >
              知道了
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
