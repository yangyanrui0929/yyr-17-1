import { useNavigate } from 'react-router-dom';
import { Film, ScrollText, History, Coins } from 'lucide-react';
import { useGameStore } from '../store/useGameStore';

export default function Home() {
  const navigate = useNavigate();
  const coins = useGameStore((state) => state.coins);
  const commissions = useGameStore((state) => state.commissions);
  const screeningRecords = useGameStore((state) => state.screeningRecords);

  const availableCommissions = commissions.filter((c) => c.status === 'available').length;
  const inProgressCommissions = commissions.filter((c) => c.status === 'in_progress').length;

  return (
    <div className="min-h-screen bg-night-900 film-grain relative overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-b from-night-800 via-night-900 to-night-950" />

      {/* 星星/霓虹光斑背景 */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(30)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white rounded-full animate-pulse"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 60}%`,
              animationDelay: `${Math.random() * 3}s`,
              opacity: Math.random() * 0.5 + 0.2,
            }}
          />
        ))}
      </div>

      {/* 霓虹光晕装饰 */}
      <div className="absolute top-20 left-1/4 w-96 h-96 bg-neon-pink/10 rounded-full blur-3xl animate-float" />
      <div className="absolute bottom-20 right-1/4 w-80 h-80 bg-neon-mint/10 rounded-full blur-3xl animate-float" style={{ animationDelay: '2s' }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-neon/5 rounded-full blur-3xl" />

      <div className="relative z-10 min-h-screen flex flex-col">
        {/* 顶部状态栏 */}
        <div className="p-6 flex justify-between items-center">
          <div className="flex items-center gap-2 text-amber-neon">
            <Coins className="w-5 h-5" />
            <span className="font-body text-lg neon-text-soft">{coins}</span>
          </div>
          <div className="text-night-300 text-sm font-body">
            营业中 · 第 {screeningRecords.length + 1} 位客人
          </div>
        </div>

        {/* 主内容 */}
        <div className="flex-1 flex flex-col items-center justify-center px-6">
          {/* 霓虹招牌 */}
          <div className="text-center mb-16 animate-fade-in">
            <div className="relative inline-block">
              <h1 className="font-display text-5xl md:text-7xl font-bold text-amber-glow neon-text tracking-wider mb-2 animate-flicker">
                夜市影像摊
              </h1>
              <div className="absolute -bottom-2 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-neon to-transparent" />
            </div>
            <p className="text-night-200 text-lg mt-6 font-body tracking-widest">
              剪一段时光，藏一段记忆
            </p>
          </div>

          {/* 摊位招牌装饰 */}
          <div className="relative mb-16">
            <div className="w-64 h-40 md:w-80 md:h-48 glass-card rounded-lg flex items-center justify-center relative overflow-hidden scan-lines">
              <div className="absolute inset-0 bg-gradient-to-br from-amber-neon/10 to-transparent" />
              <Film className="w-16 h-16 md:w-20 md:h-20 text-amber-neon animate-float neon-text-soft" />
              <div className="absolute top-2 left-2 w-2 h-2 rounded-full bg-neon-pink animate-pulse" />
              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-neon-mint animate-pulse" style={{ animationDelay: '0.5s' }} />
              <div className="absolute bottom-2 left-4 right-4 h-0.5 bg-night-600 rounded" />
            </div>
            <div className="absolute -bottom-3 left-1/2 -translate-x-1/2 w-1 h-6 bg-amber-neon/50" />
          </div>

          {/* 入口菜单 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 w-full max-w-3xl">
            <button
              onClick={() => navigate('/commissions')}
              className="glass-card glass-card-hover p-6 text-left group animate-slide-up"
              style={{ animationDelay: '0.1s' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-neon-pink/20 flex items-center justify-center group-hover:bg-neon-pink/30 transition-colors">
                  <ScrollText className="w-6 h-6 text-neon-pink" />
                </div>
                <div>
                  {availableCommissions > 0 && (
                    <span className="inline-block px-2 py-0.5 text-xs bg-neon-pink/20 text-neon-pink rounded-full mb-1">
                      {availableCommissions} 个新委托
                    </span>
                  )}
                  <h3 className="font-display text-xl text-amber-glow">顾客委托</h3>
                </div>
              </div>
              <p className="text-night-300 text-sm font-body">
                {inProgressCommissions > 0
                  ? `有 ${inProgressCommissions} 个委托正在制作中`
                  : '看看今天有谁带着故事来拜访'}
              </p>
            </button>

            <button
              onClick={() => navigate('/workshop')}
              className="glass-card glass-card-hover p-6 text-left group animate-slide-up relative overflow-hidden"
              style={{ animationDelay: '0.2s' }}
            >
              <div className="absolute -top-10 -right-10 w-20 h-20 bg-amber-neon/10 rounded-full blur-2xl" />
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-amber-neon/20 flex items-center justify-center group-hover:bg-amber-neon/30 transition-colors">
                  <Film className="w-6 h-6 text-amber-neon" />
                </div>
                <h3 className="font-display text-xl text-amber-glow">剪辑工作台</h3>
              </div>
              <p className="text-night-300 text-sm font-body">
                把破碎的记忆片段，拼成动人的故事
              </p>
            </button>

            <button
              onClick={() => navigate('/records')}
              className="glass-card glass-card-hover p-6 text-left group animate-slide-up"
              style={{ animationDelay: '0.3s' }}
            >
              <div className="flex items-center gap-4 mb-4">
                <div className="w-12 h-12 rounded-lg bg-neon-mint/20 flex items-center justify-center group-hover:bg-neon-mint/30 transition-colors">
                  <History className="w-6 h-6 text-neon-mint" />
                </div>
                <div>
                  <h3 className="font-display text-xl text-amber-glow">放映记录</h3>
                  {screeningRecords.length > 0 && (
                    <span className="text-xs text-night-400 font-body">
                      已放映 {screeningRecords.length} 部
                    </span>
                  )}
                </div>
              </div>
              <p className="text-night-300 text-sm font-body">
                看看那些被你留住的时光
              </p>
            </button>
          </div>
        </div>

        {/* 底部装饰 */}
        <div className="p-6 text-center">
          <p className="text-night-500 text-xs font-body">
            — 夜市里的小小影像摊，专收别人的故事 —
          </p>
        </div>
      </div>
    </div>
  );
}
