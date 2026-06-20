export interface Character {
  id: string;
  name: string;
  avatar: string;
  description: string;
  role: string;
  relationships: {
    targetId: string;
    type: string;
    description: string;
  }[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  atmosphere: string;
  color: string;
}

export interface Emotion {
  id: string;
  name: string;
  color: string;
  icon: string;
}

export type TimeOfDay = 'morning' | 'afternoon' | 'evening' | 'night';

export const timeOfDayLabels: Record<TimeOfDay, string> = {
  morning: '清晨',
  afternoon: '午后',
  evening: '黄昏',
  night: '深夜',
};

export const timeOfDayOrder: TimeOfDay[] = ['morning', 'afternoon', 'evening', 'night'];

export interface Clip {
  id: string;
  title: string;
  thumbnail: string;
  duration: number;
  description: string;
  characters: string[];
  location: string;
  timeOfDay: TimeOfDay;
  date: string;
  emotions: string[];
  isKeyMoment: boolean;
  dialogue?: string;
}

export type CommissionStatus = 'available' | 'in_progress' | 'completed';

export interface Commission {
  id: string;
  customerId: string;
  title: string;
  story: string;
  targetEmotions: string[];
  requiredClips: string[];
  optionalClips: string[];
  hint: string;
  reward: number;
  status: CommissionStatus;
  preferredLength: 'short' | 'medium' | 'long';
}

export interface NarrationStyle {
  fontSize: string;
  fontFamily: string;
  color: string;
}

export interface TimelineItem {
  id: string;
  clipId: string;
  order: number;
  narration: string;
  narrationStyle: NarrationStyle;
}

export interface EditVersion {
  id: string;
  commissionId: string;
  title: string;
  timelineItems: TimelineItem[];
  createdAt: number;
  updatedAt: number;
}

export interface ScreeningRecord {
  id: string;
  editVersionId: string;
  commissionId: string;
  score: number;
  feedback: string;
  emotionMatch: number;
  continuityScore: number;
  narrationScore: number;
  creativityScore: number;
  customerReaction: string;
  screenedAt: number;
}

export interface Contradiction {
  type: 'time' | 'location' | 'character' | 'emotion';
  severity: 'error' | 'warning';
  itemIndex: number;
  relatedIndices: number[];
  message: string;
  suggestion: string;
}

export interface GameState {
  clips: Clip[];
  characters: Character[];
  locations: Location[];
  emotions: Emotion[];
  commissions: Commission[];
  editVersions: EditVersion[];
  screeningRecords: ScreeningRecord[];
  currentCommissionId: string | null;
  currentEditVersionId: string | null;
  coins: number;
}
