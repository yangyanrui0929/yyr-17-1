import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, Star, Clock, ChevronRight, X, Sparkles, Award } from 'lucide-react';
import NavBar from '../components/NavBar';
import { useGameStore } from '../store/useGameStore';
import type { Commission } from '../types';

export default function Commissions() {
  const navigate = useNavigate();
  const commissions = useGameStore((state) => state.commissions);
  const characters = useGameStore((state) => state.characters);
  const emotions = useGameStore((state) => state.emotions);
  const acceptCommission = useGameStore((state) => state.acceptCommission);
  const createEditVersion = useGameStore((state) => state.createEditVersion);
  const setCurrentEditVersion = useGameStore((state) => state.setCurrentEditVersion);

  const [selectedCommission, setSelectedCommission] = useState<Commission | null>(null);

  const getCustomer = (customerId: string) => {
    return characters.find((c) => c.id === customerId);
  };

  const getEmotion = (emotionId: string) => {
    return emotions.find((e) => e.id === emotionId);
  };

  const handleAccept = (commission: Commission) => {
    acceptCommission(commission.id);
    const versionId = createEditVersion(commission.id, `${commission.title} - 初剪`);
    setCurrentEditVersion(versionId);
    setSelectedCommission(null);
    navigate('/workshop');
  };

  const statusLabels = {
    available: '可接',
    in_progress: '进行中',
    completed: '已完成',
  };

  const statusColors = {
    available: 'bg-neon-mint/20 text-neon-mint',
    in_progress: 'bg-neon-yellow/20 text-neon-yellow',
    completed: 'bg-night-400/20 text-night-400',
  };

  return (
    <div className="min-h-screen bg-night-900 film-grain">
      <div className="absolute inset-0 bg-gradient-to-b from-night-800 to-night-900" />

      <div className="relative z-10 pb-20">
        <NavBar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl text-amber-glow mb-2">顾客委托</h1>
            <p className="text-night-300 font-body">每个来夜市的人，都带着自己的故事</p>
          </div>

          <div className="grid gap-4">
            {commissions.map((commission, index) => {
              const customer = getCustomer(commission.customerId);
              return (
                <button
                  key={commission.id}
                  onClick={() => setSelectedCommission(commission)}
                  className="glass-card glass-card-hover p-5 text-left animate-slide-up group"
                  style={{ animationDelay: `${index * 0.1}s` }}
                >
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 rounded-full bg-night-700 flex items-center justify-center text-2xl shrink-0">
                      {customer?.avatar || '👤'}
                    </div>

                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-2">
                        <h3 className="font-display text-lg text-amber-glow">
                          {commission.title}
                        </h3>
                        <span
                          className={`px-2 py-0.5 text-xs rounded-full font-body ${statusColors[commission.status]}`}
                        >
                          {statusLabels[commission.status]}
                        </span>
                      </div>

                      <p className="text-night-300 text-sm font-body line-clamp-2 mb-3">
                        {commission.story}
                      </p>

                      <div className="flex items-center gap-4 text-xs text-night-400 font-body">
                        <div className="flex items-center gap-1">
                          <Award className="w-3 h-3 text-neon-yellow" />
                          <span>{commission.reward} 光币</span>
                        </div>
                        <div className="flex items-center gap-1">
                          <Star className="w-3 h-3 text-neon-pink" />
                          <span>
                            {commission.targetEmotions
                              .map((e) => getEmotion(e)?.name)
                              .join('、')}
                          </span>
                        </div>
                      </div>
                    </div>

                    <ChevronRight className="w-5 h-5 text-night-400 group-hover:text-amber-neon transition-colors shrink-0" />
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {selectedCommission && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fade-in">
          <div className="glass-card w-full max-w-lg max-h-[80vh] overflow-y-auto animate-slide-up">
            <div className="p-6">
              <div className="flex items-start justify-between mb-6">
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full bg-night-700 flex items-center justify-center text-3xl">
                    {getCustomer(selectedCommission.customerId)?.avatar || '👤'}
                  </div>
                  <div>
                    <h2 className="font-display text-2xl text-amber-glow mb-1">
                      {selectedCommission.title}
                    </h2>
                    <p className="text-night-400 text-sm font-body flex items-center gap-1">
                      <User className="w-4 h-4" />
                      {getCustomer(selectedCommission.customerId)?.name}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCommission(null)}
                  className="p-2 rounded-lg hover:bg-night-700/50 text-night-400 hover:text-white transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-5">
                <div>
                  <h3 className="text-amber-neon font-display text-sm mb-2 flex items-center gap-2">
                    <Sparkles className="w-4 h-4" />
                    顾客的故事
                  </h3>
                  <p className="text-night-200 font-body leading-relaxed">
                    {selectedCommission.story}
                  </p>
                </div>

                <div>
                  <h3 className="text-amber-neon font-display text-sm mb-2">目标情绪</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedCommission.targetEmotions.map((emotionId) => {
                      const emotion = getEmotion(emotionId);
                      return emotion ? (
                        <span
                          key={emotionId}
                          className="px-3 py-1 rounded-full text-sm font-body"
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

                <div>
                  <h3 className="text-amber-neon font-display text-sm mb-2">小贴士</h3>
                  <p className="text-night-300 text-sm font-body italic">
                    「{selectedCommission.hint}」
                  </p>
                </div>

                <div>
                  <h3 className="text-amber-neon font-display text-sm mb-2">奖励</h3>
                  <div className="flex items-center gap-2">
                    <Award className="w-5 h-5 text-neon-yellow" />
                    <span className="text-neon-yellow font-body text-lg">
                      {selectedCommission.reward} 光币
                    </span>
                  </div>
                </div>
              </div>

              <div className="mt-8 flex gap-3">
                <button
                  onClick={() => setSelectedCommission(null)}
                  className="flex-1 py-3 rounded-lg border border-night-500 text-night-300 font-body hover:bg-night-700/30 transition-colors"
                >
                  再想想
                </button>
                {selectedCommission.status === 'available' ? (
                  <button
                    onClick={() => handleAccept(selectedCommission)}
                    className="flex-1 py-3 rounded-lg bg-amber-neon text-night-900 font-body font-medium hover:bg-amber-glow transition-colors shadow-neon-amber"
                  >
                    接受委托
                  </button>
                ) : (
                  <button
                    onClick={() => {
                      setCurrentEditVersion(null);
                      setSelectedCommission(null);
                      navigate('/workshop');
                    }}
                    className="flex-1 py-3 rounded-lg bg-amber-neon text-night-900 font-body font-medium hover:bg-amber-glow transition-colors"
                  >
                    继续剪辑
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
