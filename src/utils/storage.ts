import { DecisionAnalysis } from '../types';
import { SAMPLE_DECISIONS } from '../data/sampleDecisions';

const STORAGE_KEY = 'the_tiebreaker_saved_decisions_v1';

export function getSavedDecisions(): DecisionAnalysis[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      // Seed with sample decisions on first visit
      localStorage.setItem(STORAGE_KEY, JSON.stringify(SAMPLE_DECISIONS));
      return SAMPLE_DECISIONS;
    }
    const parsed = JSON.parse(raw);
    if (!Array.isArray(parsed) || parsed.length === 0) {
      return SAMPLE_DECISIONS;
    }
    return parsed;
  } catch (err) {
    console.error('Error loading saved decisions:', err);
    return SAMPLE_DECISIONS;
  }
}

export function saveDecision(decision: DecisionAnalysis): void {
  try {
    const existing = getSavedDecisions();
    const index = existing.findIndex((d) => d.id === decision.id);
    let updatedList: DecisionAnalysis[];

    const updatedDecision = {
      ...decision,
      updatedAt: new Date().toISOString(),
    };

    if (index >= 0) {
      updatedList = [...existing];
      updatedList[index] = updatedDecision;
    } else {
      updatedList = [updatedDecision, ...existing];
    }

    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedList));
  } catch (err) {
    console.error('Error saving decision:', err);
  }
}

export function deleteDecision(id: string): void {
  try {
    const existing = getSavedDecisions();
    const filtered = existing.filter((d) => d.id !== id);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
  } catch (err) {
    console.error('Error deleting decision:', err);
  }
}

export function getDecisionById(id: string): DecisionAnalysis | undefined {
  const list = getSavedDecisions();
  return list.find((d) => d.id === id);
}

export function duplicateDecision(id: string): DecisionAnalysis | undefined {
  const original = getDecisionById(id);
  if (!original) return undefined;

  const copy: DecisionAnalysis = {
    ...original,
    id: "dec_" + Date.now() + "_" + Math.random().toString(36).substring(2, 5),
    title: `${original.title} (Copy)`,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    status: 'analyzed',
  };

  saveDecision(copy);
  return copy;
}

export function toggleFavorite(id: string): DecisionAnalysis | undefined {
  const original = getDecisionById(id);
  if (!original) return undefined;

  const updated: DecisionAnalysis = {
    ...original,
    isFavorite: !original.isFavorite,
    updatedAt: new Date().toISOString(),
  };

  saveDecision(updated);
  return updated;
}

export function addJournalEntry(
  id: string,
  entry: { content: string; type?: 'thought' | 'concern' | 'update' | 'final_reflection' }
): DecisionAnalysis | undefined {
  const original = getDecisionById(id);
  if (!original) return undefined;

  const newEntry = {
    id: "j_" + Date.now(),
    timestamp: new Date().toISOString(),
    type: entry.type || 'thought',
    content: entry.content,
  };

  const updated: DecisionAnalysis = {
    ...original,
    journalEntries: [newEntry, ...(original.journalEntries || [])],
    updatedAt: new Date().toISOString(),
  };

  saveDecision(updated);
  return updated;
}

export function exportDecisionsJSON(): string {
  const list = getSavedDecisions();
  return JSON.stringify(list, null, 2);
}

export function importDecisionsJSON(jsonString: string): boolean {
  try {
    const parsed = JSON.parse(jsonString);
    if (Array.isArray(parsed) && parsed.length > 0 && parsed[0].id) {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(parsed));
      return true;
    }
    return false;
  } catch (err) {
    console.error('Failed to import decisions JSON:', err);
    return false;
  }
}

// Calculate dynamic weighted score for an option based on criteria weights
export function calculateWeightedTotalScore(
  optionId: string,
  criteria: Array<{ id: string; weight: number }>,
  scores: Record<string, Record<string, number>>
): number {
  if (!scores[optionId] || criteria.length === 0) return 0;

  const totalWeight = criteria.reduce((sum, c) => sum + (c.weight || 0), 0);
  if (totalWeight <= 0) return 0;

  let weightedSum = 0;
  for (const crit of criteria) {
    const rawScore = scores[optionId]?.[crit.id] ?? 5; // default 5 out of 10
    weightedSum += rawScore * (crit.weight / totalWeight);
  }

  // Round to 1 decimal place
  return Math.round(weightedSum * 10) / 10;
}
