import type {
  Clip,
  TimelineItem,
  Contradiction,
  Character,
  Location,
  Emotion,
  Commission,
} from '../types';
import { timeOfDayOrder } from '../types';

export function detectContradictions(
  timelineItems: TimelineItem[],
  clips: Clip[],
  characters: Character[],
  locations: Location[]
): Contradiction[] {
  const contradictions: Contradiction[] = [];

  if (timelineItems.length < 2) return contradictions;

  const sortedItems = [...timelineItems].sort((a, b) => a.order - b.order);
  const clipMap = new Map(clips.map((c) => [c.id, c]));

  for (let i = 0; i < sortedItems.length; i++) {
    const item = sortedItems[i];
    const clip = clipMap.get(item.clipId);
    if (!clip) continue;

    for (let j = i + 1; j < sortedItems.length; j++) {
      const nextItem = sortedItems[j];
      const nextClip = clipMap.get(nextItem.clipId);
      if (!nextClip) continue;

      if (clip.date === nextClip.date) {
        const timeIdx1 = timeOfDayOrder.indexOf(clip.timeOfDay);
        const timeIdx2 = timeOfDayOrder.indexOf(nextClip.timeOfDay);

        const hasCommonCharacter = clip.characters.some((c) =>
          nextClip.characters.includes(c)
        );

        if (hasCommonCharacter && timeIdx1 > timeIdx2) {
          contradictions.push({
            type: 'time',
            severity: 'error',
            itemIndex: i,
            relatedIndices: [j],
            message: `时间线矛盾：${clip.title} 发生在 ${nextClip.title} 之后，但排列顺序不对`,
            suggestion: '调整两个片段的顺序，让时间早的排在前面',
          });
        }
      }
    }
  }

  for (let i = 0; i < sortedItems.length - 1; i++) {
    const clip = clipMap.get(sortedItems[i].clipId);
    const nextClip = clipMap.get(sortedItems[i + 1].clipId);
    if (!clip || !nextClip) continue;

    if (clip.location !== nextClip.location) {
      const hasCommonCharacter = clip.characters.some((c) =>
        nextClip.characters.includes(c)
      );

      if (hasCommonCharacter && clip.date === nextClip.date) {
        const timeIdx1 = timeOfDayOrder.indexOf(clip.timeOfDay);
        const timeIdx2 = timeOfDayOrder.indexOf(nextClip.timeOfDay);

        if (timeIdx2 - timeIdx1 <= 1) {
          contradictions.push({
            type: 'location',
            severity: 'warning',
            itemIndex: i,
            relatedIndices: [i + 1],
            message: `地点跳转过快：从${locations.find((l) => l.id === clip.location)?.name}到${locations.find((l) => l.id === nextClip.location)?.name}`,
            suggestion: '考虑在中间加入过渡镜头，或确认地点转换的合理性',
          });
        }
      }
    }
  }

  for (let i = 0; i < sortedItems.length - 1; i++) {
    const clip = clipMap.get(sortedItems[i].clipId);
    const nextClip = clipMap.get(sortedItems[i + 1].clipId);
    if (!clip || !nextClip) continue;

    const emotionDiff = Math.abs(clip.emotions.length - nextClip.emotions.length);
    const hasCommonEmotion = clip.emotions.some((e) => nextClip.emotions.includes(e));

    if (!hasCommonEmotion && emotionDiff >= 1) {
      contradictions.push({
        type: 'emotion',
        severity: 'warning',
        itemIndex: i,
        relatedIndices: [i + 1],
        message: '情绪跳转过快，可能影响观众的情感代入',
        suggestion: '在两个情绪差异较大的片段间加入过渡镜头',
      });
    }
  }

  return contradictions;
}

export interface ScoringResult {
  totalScore: number;
  emotionMatch: number;
  continuityScore: number;
  narrationScore: number;
  creativityScore: number;
  feedback: string;
  customerReaction: string;
}

const customerReactions = {
  excellent: [
    '看完后沉默了很久，然后轻轻说了声「谢谢」',
    '眼睛红红的，握着你的手说这就是他想留住的记忆',
    '笑着笑着就哭了，说会好好珍藏这部片子',
  ],
  good: [
    '点点头，说「嗯，就是这种感觉」',
    '露出了欣慰的笑容，说你剪得很好',
    '看完后发了好久的呆，然后说谢谢你',
  ],
  okay: [
    '看完后说「还不错」，但好像少了点什么',
    '礼貌地表示感谢，但没太多情绪流露',
    '说还行，就是好像还差了点火候',
  ],
  poor: [
    '皱着眉头看完，说这好像不是他想要的',
    '有些失望，说再想想看怎么改',
    '沉默了一会儿，然后摇摇头',
  ],
};

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

export function calculateScore(
  timelineItems: TimelineItem[],
  clips: Clip[],
  commission: Commission,
  emotions: Emotion[]
): ScoringResult {
  if (timelineItems.length === 0) {
    return {
      totalScore: 0,
      emotionMatch: 0,
      continuityScore: 0,
      narrationScore: 0,
      creativityScore: 0,
      feedback: '时间轴上还没有任何片段哦',
      customerReaction: '顾客疑惑地看着空白的胶片',
    };
  }

  const clipMap = new Map(clips.map((c) => [c.id, c]));
  const sortedItems = [...timelineItems].sort((a, b) => a.order - b.order);

  const clipEmotions: string[] = [];
  sortedItems.forEach((item) => {
    const clip = clipMap.get(item.clipId);
    if (clip) {
      clipEmotions.push(...clip.emotions);
    }
  });

  const targetEmotionSet = new Set(commission.targetEmotions);
  const matchedEmotions = clipEmotions.filter((e) => targetEmotionSet.has(e));
  const uniqueMatched = new Set(matchedEmotions).size;
  const emotionMatch = Math.min(100, (uniqueMatched / targetEmotionSet.size) * 100);

  let continuityScore = 70;
  let keyMomentsCount = 0;
  let hasRequiredClips = true;

  const itemClipIds = new Set(sortedItems.map((i) => i.clipId));
  commission.requiredClips.forEach((clipId) => {
    if (!itemClipIds.has(clipId)) {
      hasRequiredClips = false;
      continuityScore -= 15;
    }
  });

  sortedItems.forEach((item) => {
    const clip = clipMap.get(item.clipId);
    if (clip?.isKeyMoment) {
      keyMomentsCount++;
    }
  });

  if (sortedItems.length >= 3) continuityScore += 10;
  if (sortedItems.length >= 5) continuityScore += 10;
  continuityScore = Math.min(100, Math.max(0, continuityScore));

  let narrationScore = 50;
  const withNarration = sortedItems.filter((item) => item.narration.trim().length > 0);
  if (withNarration.length > 0) {
    narrationScore = 60;
  }
  if (withNarration.length >= Math.floor(sortedItems.length / 2)) {
    narrationScore += 20;
  }
  const longNarration = withNarration.filter((n) => n.narration.length > 15).length;
  if (longNarration >= 2) {
    narrationScore += 15;
  }
  narrationScore = Math.min(100, narrationScore);

  let creativityScore = 50;
  if (keyMomentsCount >= 2) creativityScore += 20;
  if (keyMomentsCount >= 3) creativityScore += 10;

  const optionalUsed = commission.optionalClips.filter((id) => itemClipIds.has(id)).length;
  if (optionalUsed >= 2) creativityScore += 15;

  if (sortedItems.length >= 6) creativityScore += 10;
  creativityScore = Math.min(100, creativityScore);

  const totalScore = Math.round(
    emotionMatch * 0.4 +
      continuityScore * 0.3 +
      narrationScore * 0.2 +
      creativityScore * 0.1
  );

  let feedback = '';
  let reactionCategory: keyof typeof customerReactions = 'poor';

  if (totalScore >= 85) {
    feedback = '这部片子太棒了！每一个镜头都恰到好处，情绪层层递进，旁白也配得刚刚好。顾客看完后久久不能平静，这就是他想要珍藏的记忆。';
    reactionCategory = 'excellent';
  } else if (totalScore >= 70) {
    feedback = '剪得相当不错！故事讲得很清楚，情感也传达得到位。如果在情绪转折的地方再打磨一下，会更加动人。';
    reactionCategory = 'good';
  } else if (totalScore >= 50) {
    feedback = '整体还可以，能看出来想讲一个什么样的故事。但有些片段的衔接还可以更自然，旁白也可以再斟酌斟酌。';
    reactionCategory = 'okay';
  } else {
    feedback = '嗯……怎么说呢，感觉还差点意思。故事的脉络不太清晰，情绪也没立起来。再重新理一理时间线和人物关系吧。';
    reactionCategory = 'poor';
  }

  return {
    totalScore,
    emotionMatch: Math.round(emotionMatch),
    continuityScore: Math.round(continuityScore),
    narrationScore: Math.round(narrationScore),
    creativityScore: Math.round(creativityScore),
    feedback,
    customerReaction: pickRandom(customerReactions[reactionCategory]),
  };
}
