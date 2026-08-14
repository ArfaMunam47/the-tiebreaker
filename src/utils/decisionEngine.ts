import {
  Criterion,
  WeightedScores,
  Option,
  SensitivityItem,
  ReversibilityLevel,
  DecisionAnalysis,
} from '../types';

/**
 * Calculates weighted score for an option on a 10-point scale deterministically.
 * Formula: sum(score_i * weight_i) / sum(weight_i)
 */
export function calculateWeightedTotalScore(
  optionId: string,
  criteria: Criterion[],
  scores: WeightedScores
): number {
  if (!scores[optionId] || criteria.length === 0) return 0;

  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  if (totalWeight <= 0) return 0;

  let weightedSum = 0;
  for (const crit of criteria) {
    const rawScore = scores[optionId]?.[crit.id] ?? 5; // default 5/10
    weightedSum += rawScore * (crit.weight / totalWeight);
  }

  return Math.round(weightedSum * 10) / 10;
}

/**
 * Calculates sensitivity analysis: ranks criteria by how much changing their weight impacts the top recommendation margin.
 */
export function calculateSensitivityAnalysis(
  options: Option[],
  criteria: Criterion[],
  scores: WeightedScores
): SensitivityItem[] {
  if (options.length < 2 || criteria.length === 0) return [];

  // Compute base scores for all options
  const optionScores = options.map((opt) => ({
    id: opt.id,
    title: opt.title,
    score: calculateWeightedTotalScore(opt.id, criteria, scores),
  }));

  optionScores.sort((a, b) => b.score - a.score);
  const leader = optionScores[0];
  const runnerUp = optionScores[1];
  const baseMargin = leader.score - runnerUp.score;

  // For each criterion, test weight sensitivity by doubling its weight and observing margin change
  const sensitivityList = criteria.map((crit) => {
    const modifiedCriteria = criteria.map((c) =>
      c.id === crit.id ? { ...c, weight: c.weight * 2 } : c
    );

    const newLeaderScore = calculateWeightedTotalScore(leader.id, modifiedCriteria, scores);
    const newRunnerUpScore = calculateWeightedTotalScore(runnerUp.id, modifiedCriteria, scores);
    const newMargin = newLeaderScore - newRunnerUpScore;
    const marginDelta = Math.abs(newMargin - baseMargin);

    return {
      criterionId: crit.id,
      criterionName: crit.name,
      delta: marginDelta,
      influenceRank: 0,
      explanation: `Changing ${crit.name}'s weight shift the leading margin by ${marginDelta.toFixed(
        1
      )} points. ${
        marginDelta > 0.8
          ? 'Crucial decision pivot parameter.'
          : 'Moderate influence on ranking.'
      }`,
    };
  });

  sensitivityList.sort((a, b) => b.delta - a.delta);

  return sensitivityList.map((item, index) => ({
    criterionId: item.criterionId,
    criterionName: item.criterionName,
    influenceRank: index + 1,
    explanation: item.explanation,
  }));
}

/**
 * Evaluates objective confidence level based on information completeness, margin, and reversibility.
 */
export function evaluateConfidenceLevel(
  missingInfoCount: number,
  scoreMargin: number,
  unansweredQuestionsCount: number,
  reversibility: ReversibilityLevel
): { level: 'High' | 'Moderate' | 'Low'; reason: string } {
  let score = 100;

  score -= missingInfoCount * 15;
  score -= unansweredQuestionsCount * 10;

  if (scoreMargin < 0.5) {
    score -= 25;
  } else if (scoreMargin < 1.2) {
    score -= 10;
  }

  if (reversibility === 'Nearly irreversible' || reversibility === 'Difficult to reverse') {
    score -= 10;
  }

  if (score >= 75 && missingInfoCount === 0) {
    return {
      level: 'High',
      reason:
        'All primary criteria are well-scoped with clear score separation and zero critical missing information.',
    };
  }

  if (score >= 45) {
    return {
      level: 'Moderate',
      reason:
        missingInfoCount > 0
          ? `Confidence is moderate because ${missingInfoCount} important information items remain unverified.`
          : 'Scores between top options are close; slight priority adjustments could shift the leader.',
    };
  }

  return {
    level: 'Low',
    reason:
      'Confidence is limited because critical decision information is missing and options have narrow score separation.',
  };
}

/**
 * Observational decision patterns derived from saved user decisions.
 */
export function calculateDecisionPatterns(decisions: DecisionAnalysis[]) {
  if (decisions.length === 0) {
    return {
      totalDecisions: 0,
      favoriteCategories: [],
      topPriorities: [],
      successRate: '0%',
      observations: ['No saved decisions available yet to analyze patterns.'],
    };
  }

  const categoryCounts: Record<string, number> = {};
  const priorityCounts: Record<string, number> = {};
  let decidedCount = 0;
  let successfulCount = 0;

  decisions.forEach((d) => {
    if (d.category) {
      categoryCounts[d.category] = (categoryCounts[d.category] || 0) + 1;
    }
    d.userPriorities?.forEach((p) => {
      priorityCounts[p] = (priorityCounts[p] || 0) + 1;
    });
    if (d.outcome?.status) {
      decidedCount++;
      if (d.outcome.status === 'Successful') successfulCount++;
    }
  });

  const sortedCategories = Object.entries(categoryCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([cat, count]) => `${cat} (${count})`);

  const sortedPriorities = Object.entries(priorityCounts)
    .sort((a, b) => b[1] - a[1])
    .map(([p]) => p);

  const observations: string[] = [];

  if (sortedPriorities.length > 0) {
    observations.push(
      `You frequently prioritize "${sortedPriorities[0]}" across your decisions.`
    );
  }

  const irreversibleCount = decisions.filter(
    (d) =>
      d.reversibility === 'Difficult to reverse' ||
      d.reversibility === 'Nearly irreversible'
  ).length;

  if (irreversibleCount > 0) {
    observations.push(
      `${irreversibleCount} of your ${decisions.length} decisions involve high stakes or low reversibility.`
    );
  } else {
    observations.push(
      `Most of your logged decisions have moderate or high reversibility.`
    );
  }

  if (decidedCount > 0) {
    const rate = Math.round((successfulCount / decidedCount) * 100);
    observations.push(
      `Out of ${decidedCount} tracked outcomes, ${rate}% resulted in successful decisions.`
    );
  }

  return {
    totalDecisions: decisions.length,
    favoriteCategories: sortedCategories.slice(0, 3),
    topPriorities: sortedPriorities.slice(0, 4),
    successRate: decidedCount > 0 ? `${Math.round((successfulCount / decidedCount) * 100)}%` : 'N/A',
    observations,
  };
}
