import { create } from 'zustand';
import type {
  GameState,
  Clip,
  TimelineItem,
  EditVersion,
  Commission,
  ScreeningRecord,
} from '../types';
import { storage, initializeGameState, generateId } from '../utils/storage';
import { calculateScore, type ScoringResult } from '../utils/scoring';

interface GameStore extends GameState {
  initialize: () => void;
  save: () => void;
  reset: () => void;

  acceptCommission: (commissionId: string) => void;
  completeCommission: (commissionId: string) => void;

  createEditVersion: (commissionId: string, title?: string) => string;
  updateEditVersion: (versionId: string, updates: Partial<EditVersion>) => void;
  deleteEditVersion: (versionId: string) => void;
  setCurrentEditVersion: (versionId: string | null) => void;
  setCurrentCommission: (commissionId: string | null) => void;

  addTimelineItem: (clipId: string, insertIndex?: number) => void;
  removeTimelineItem: (itemId: string) => void;
  reorderTimelineItems: (items: TimelineItem[]) => void;
  updateTimelineItem: (itemId: string, updates: Partial<TimelineItem>) => void;
  clearTimeline: () => void;

  submitFilm: (versionId: string, commissionId: string) => ScoringResult | null;
  deleteScreeningRecord: (recordId: string) => void;

  getCurrentEditVersion: () => EditVersion | undefined;
  getCurrentCommission: () => Commission | undefined;
}

export const useGameStore = create<GameStore>((set, get) => ({
  ...initializeGameState(),

  initialize: () => {
    const state = initializeGameState();
    set(state);
  },

  save: () => {
    const state = get();
    const { initialize: _, save: __, reset: ___, ...rest } = state;
    storage.save(rest as GameState);
  },

  reset: () => {
    const newState = storage.reset();
    set(newState);
  },

  acceptCommission: (commissionId: string) => {
    set((state) => ({
      commissions: state.commissions.map((c) =>
        c.id === commissionId ? { ...c, status: 'in_progress' as const } : c
      ),
      currentCommissionId: commissionId,
    }));
    get().save();
  },

  completeCommission: (commissionId: string) => {
    set((state) => ({
      commissions: state.commissions.map((c) =>
        c.id === commissionId ? { ...c, status: 'completed' as const } : c
      ),
    }));
    get().save();
  },

  createEditVersion: (commissionId: string, title?: string) => {
    const versionId = generateId('version');
    const now = Date.now();
    const newVersion: EditVersion = {
      id: versionId,
      commissionId,
      title: title || `剪辑版本 ${new Date().toLocaleDateString()}`,
      timelineItems: [],
      createdAt: now,
      updatedAt: now,
    };

    set((state) => ({
      editVersions: [...state.editVersions, newVersion],
      currentEditVersionId: versionId,
    }));
    get().save();
    return versionId;
  },

  updateEditVersion: (versionId: string, updates: Partial<EditVersion>) => {
    set((state) => ({
      editVersions: state.editVersions.map((v) =>
        v.id === versionId ? { ...v, ...updates, updatedAt: Date.now() } : v
      ),
    }));
    get().save();
  },

  deleteEditVersion: (versionId: string) => {
    set((state) => ({
      editVersions: state.editVersions.filter((v) => v.id !== versionId),
      currentEditVersionId:
        state.currentEditVersionId === versionId ? null : state.currentEditVersionId,
    }));
    get().save();
  },

  setCurrentEditVersion: (versionId: string | null) => {
    set({ currentEditVersionId: versionId });
  },

  setCurrentCommission: (commissionId: string | null) => {
    set({ currentCommissionId: commissionId });
  },

  addTimelineItem: (clipId: string, insertIndex?: number) => {
    const { currentEditVersionId, editVersions } = get();
    if (!currentEditVersionId) return;

    const version = editVersions.find((v) => v.id === currentEditVersionId);
    if (!version) return;

    const itemId = generateId('item');
    const newItem: TimelineItem = {
      id: itemId,
      clipId,
      order: version.timelineItems.length,
      narration: '',
      narrationStyle: {
        fontSize: 'text-base',
        fontFamily: 'body',
        color: 'text-white',
      },
    };

    set((state) => {
      const currentVersion = state.editVersions.find((v) => v.id === currentEditVersionId);
      if (!currentVersion) return state;

      let newItems = [...currentVersion.timelineItems];
      if (insertIndex !== undefined && insertIndex >= 0 && insertIndex < newItems.length) {
        newItems.splice(insertIndex, 0, newItem);
      } else {
        newItems.push(newItem);
      }
      newItems = newItems.map((item, idx) => ({ ...item, order: idx }));

      return {
        editVersions: state.editVersions.map((v) =>
          v.id === currentEditVersionId
            ? {
                ...v,
                timelineItems: newItems,
                updatedAt: Date.now(),
              }
            : v
        ),
      };
    });
    get().save();
  },

  removeTimelineItem: (itemId: string) => {
    const { currentEditVersionId } = get();
    if (!currentEditVersionId) return;

    set((state) => {
      const version = state.editVersions.find((v) => v.id === currentEditVersionId);
      if (!version) return state;

      const newItems = version.timelineItems
        .filter((item) => item.id !== itemId)
        .map((item, idx) => ({ ...item, order: idx }));

      return {
        editVersions: state.editVersions.map((v) =>
          v.id === currentEditVersionId
            ? { ...v, timelineItems: newItems, updatedAt: Date.now() }
            : v
        ),
      };
    });
    get().save();
  },

  reorderTimelineItems: (items: TimelineItem[]) => {
    const { currentEditVersionId } = get();
    if (!currentEditVersionId) return;

    const reordered = items.map((item, idx) => ({ ...item, order: idx }));

    set((state) => ({
      editVersions: state.editVersions.map((v) =>
        v.id === currentEditVersionId
          ? { ...v, timelineItems: reordered, updatedAt: Date.now() }
          : v
      ),
    }));
    get().save();
  },

  updateTimelineItem: (itemId: string, updates: Partial<TimelineItem>) => {
    const { currentEditVersionId } = get();
    if (!currentEditVersionId) return;

    set((state) => ({
      editVersions: state.editVersions.map((v) =>
        v.id === currentEditVersionId
          ? {
              ...v,
              timelineItems: v.timelineItems.map((item) =>
                item.id === itemId ? { ...item, ...updates } : item
              ),
              updatedAt: Date.now(),
            }
          : v
      ),
    }));
    get().save();
  },

  clearTimeline: () => {
    const { currentEditVersionId } = get();
    if (!currentEditVersionId) return;

    set((state) => ({
      editVersions: state.editVersions.map((v) =>
        v.id === currentEditVersionId
          ? { ...v, timelineItems: [], updatedAt: Date.now() }
          : v
      ),
    }));
    get().save();
  },

  submitFilm: (versionId: string, commissionId: string) => {
    const state = get();
    const version = state.editVersions.find((v) => v.id === versionId);
    const commission = state.commissions.find((c) => c.id === commissionId);

    if (!version || !commission) return null;

    const result = calculateScore(
      version.timelineItems,
      state.clips,
      commission,
      state.emotions
    );

    const record: ScreeningRecord = {
      id: generateId('record'),
      editVersionId: versionId,
      commissionId,
      score: result.totalScore,
      feedback: result.feedback,
      emotionMatch: result.emotionMatch,
      continuityScore: result.continuityScore,
      narrationScore: result.narrationScore,
      creativityScore: result.creativityScore,
      customerReaction: result.customerReaction,
      screenedAt: Date.now(),
    };

    set((prev) => ({
      screeningRecords: [...prev.screeningRecords, record],
      coins: prev.coins + Math.floor(result.totalScore / 10),
      commissions: prev.commissions.map((c) =>
        c.id === commissionId && result.totalScore >= 60
          ? { ...c, status: 'completed' as const }
          : c
      ),
    }));
    get().save();

    return result;
  },

  deleteScreeningRecord: (recordId: string) => {
    set((state) => ({
      screeningRecords: state.screeningRecords.filter((r) => r.id !== recordId),
    }));
    get().save();
  },

  getCurrentEditVersion: () => {
    const state = get();
    return state.editVersions.find((v) => v.id === state.currentEditVersionId);
  },

  getCurrentCommission: () => {
    const state = get();
    return state.commissions.find((c) => c.id === state.currentCommissionId);
  },
}));
