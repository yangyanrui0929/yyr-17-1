import { useState } from 'react';
import { History, Users, Film, Star, Trash2, Play, ChevronRight, User, Heart } from 'lucide-react';
import NavBar from '../components/NavBar';
import FilmPlayer from '../components/FilmPlayer';
import { useGameStore } from '../store/useGameStore';

type TabType = 'records' | 'characters';

export default function Records() {
  const [activeTab, setActiveTab] = useState<TabType>('records');
  const [playingVersionId, setPlayingVersionId] = useState<string | null>(null);

  const screeningRecords = useGameStore((state) => state.screeningRecords);
  const editVersions = useGameStore((state) => state.editVersions);
  const clips = useGameStore((state) => state.clips);
  const characters = useGameStore((state) => state.characters);
  const commissions = useGameStore((state) => state.commissions);
  const deleteScreeningRecord = useGameStore((state) => state.deleteScreeningRecord);

  const getCommission = (commissionId: string) => {
    return commissions.find((c) => c.id === commissionId);
  };

  const getVersion = (versionId: string) => {
    return editVersions.find((v) => v.id === versionId);
  };

  const getCharacterClipCount = (characterId: string) => {
    return clips.filter((c) => c.characters.includes(characterId)).length;
  };

  const getCharacterScreeningCount = (characterId: string) => {
    return screeningRecords.filter((r) => {
      const version = getVersion(r.editVersionId);
      if (!version) return false;
      return version.timelineItems.some((item) => {
        const clip = clips.find((c) => c.id === item.clipId);
        return clip?.characters.includes(characterId);
      });
    }).length;
  };

  const sortedRecords = [...screeningRecords].sort(
    (a, b) => b.screenedAt - a.screenedAt
  );

  const playingVersion = playingVersionId
    ? getVersion(playingVersionId)
    : null;

  const tabs = [
    { id: 'records' as const, label: '放映记录', icon: History },
    { id: 'characters' as const, label: '人物档案', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-night-900 film-grain">
      <div className="absolute inset-0 bg-gradient-to-b from-night-800 to-night-900" />

      <div className="relative z-10 pb-20">
        <NavBar />

        <div className="max-w-4xl mx-auto px-4 py-8">
          <div className="mb-8 animate-fade-in">
            <h1 className="font-display text-3xl text-amber-glow mb-2">放映记录</h1>
            <p className="text-night-300 font-body">
              那些被你留住的时光
            </p>
          </div>

          <div className="flex gap-2 mb-6">
            {tabs.map((tab) => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`px-4 py-2 rounded-lg font-body text-sm flex items-center gap-2 transition-colors ${
                    activeTab === tab.id
                      ? 'bg-amber-neon/20 text-amber-neon'
                      : 'text-night-300 hover:bg-night-700/30'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  {tab.label}
                </button>
              );
            })}
          </div>

          {activeTab === 'records' && (
            <div className="space-y-4">
              {sortedRecords.length === 0 ? (
                <div className="glass-card p-12 text-center">
                  <Film className="w-16 h-16 mx-auto text-night-500 mb-4" />
                  <p className="text-night-400 font-body">还没有放映记录</p>
                  <p className="text-night-500 text-sm font-body mt-1">
                    去剪辑工作台完成你的第一部作品吧
                  </p>
                </div>
              ) : (
                sortedRecords.map((record, index) => {
                  const commission = getCommission(record.commissionId);
                  const version = getVersion(record.editVersionId);
                  const customer = characters.find(
                    (c) => c.id === commission?.customerId
                  );

                  return (
                    <div
                      key={record.id}
                      className="glass-card glass-card-hover p-4 animate-slide-up"
                      style={{ animationDelay: `${index * 0.05}s` }}
                    >
                      <div className="flex items-start gap-4">
                        <div className="w-20 h-14 rounded-lg bg-night-700 flex items-center justify-center relative overflow-hidden scan-lines flex-shrink-0">
                          {version && version.timelineItems.length > 0 && (
                            <div
                              className="absolute inset-0"
                              style={{
                                background:
                                  clips.find(
                                    (c) =>
                                      c.id ===
                                      version.timelineItems[0]?.clipId
                                  )?.thumbnail || '#333',
                              }}
                            />
                          )}
                          <Play className="w-6 h-6 text-white/80 relative z-10" />
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between">
                            <div>
                              <h3 className="font-display text-amber-glow mb-1">
                                {version?.title || '未命名作品'}
                              </h3>
                              <p className="text-night-400 text-sm font-body flex items-center gap-2">
                                {customer?.avatar} {customer?.name} ·{' '}
                                {commission?.title}
                              </p>
                            </div>
                            <div className="flex items-center gap-1 text-neon-yellow">
                              <Star className="w-4 h-4 fill-neon-yellow" />
                              <span className="font-display text-lg">
                                {record.score}
                              </span>
                            </div>
                          </div>

                          <p className="text-night-300 text-sm font-body line-clamp-2 mt-2">
                            {record.customerReaction}
                          </p>

                          <div className="flex items-center justify-between mt-3">
                            <div className="flex items-center gap-4 text-xs text-night-400 font-body">
                              <span>
                                {new Date(
                                  record.screenedAt
                                ).toLocaleDateString()}
                              </span>
                              <span>{version?.timelineItems.length || 0} 个片段</span>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                onClick={() =>
                                  setPlayingVersionId(record.editVersionId)
                                }
                                className="px-3 py-1 rounded text-xs font-body bg-neon-mint/20 text-neon-mint hover:bg-neon-mint/30 transition-colors flex items-center gap-1"
                              >
                                <Play className="w-3 h-3" />
                                重播
                              </button>
                              <button
                                onClick={() =>
                                  deleteScreeningRecord(record.id)
                                }
                                className="p-1.5 rounded text-night-400 hover:text-red-400 hover:bg-red-500/10 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          )}

          {activeTab === 'characters' && (
            <div className="grid gap-4 md:grid-cols-2">
              {characters.map((character, index) => {
                const clipCount = getCharacterClipCount(character.id);
                const screeningCount = getCharacterScreeningCount(character.id);

                return (
                  <div
                    key={character.id}
                    className="glass-card glass-card-hover p-5 animate-slide-up"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className="flex items-start gap-4 mb-4">
                      <div className="w-16 h-16 rounded-full bg-night-700 flex items-center justify-center text-3xl">
                        {character.avatar}
                      </div>
                      <div className="flex-1">
                        <h3 className="font-display text-lg text-amber-glow mb-1">
                          {character.name}
                        </h3>
                        <p className="text-night-400 text-sm font-body">
                          {character.role}
                        </p>
                      </div>
                    </div>

                    <p className="text-night-300 text-sm font-body mb-4 line-clamp-2">
                      {character.description}
                    </p>

                    <div className="flex items-center gap-4 mb-4">
                      <div className="flex items-center gap-1 text-xs text-night-400 font-body">
                        <Film className="w-3 h-3" />
                        <span>{clipCount} 个片段</span>
                      </div>
                      <div className="flex items-center gap-1 text-xs text-night-400 font-body">
                        <Heart className="w-3 h-3" />
                        <span>{screeningCount} 次出场</span>
                      </div>
                    </div>

                    {character.relationships.length > 0 && (
                      <div className="pt-3 border-t border-night-600/50">
                        <p className="text-xs text-night-400 font-body mb-2">人物关系</p>
                        <div className="space-y-2">
                          {character.relationships.map((rel) => {
                            const target = characters.find(
                              (c) => c.id === rel.targetId
                            );
                            return (
                              <div
                                key={rel.targetId}
                                className="flex items-center gap-2"
                              >
                                <span className="text-lg">{target?.avatar}</span>
                                <span className="text-sm text-night-300 font-body">
                                  {target?.name}
                                </span>
                                <span className="text-xs text-night-500 font-body">
                                  · {rel.type}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {playingVersion && (
        <FilmPlayer
          timelineItems={playingVersion.timelineItems}
          clips={clips}
          onClose={() => setPlayingVersionId(null)}
        />
      )}
    </div>
  );
}
