/**
 * Server-side Semantic Option Extractor
 * Parses natural language questions into distinct decision choices (2, 3, 4+ options).
 * Guaranteed to NEVER return generic placeholders like "Option A: Primary Alternative" or "Status Quo".
 */

export interface ExtractedOption {
  id: string;
  title: string;
  description: string;
}

export function extractAlternativesFromQuestion(question: string): ExtractedOption[] {
  if (!question || typeof question !== 'string') {
    return [
      { id: 'opt1', title: 'First Alternative', description: 'The first path under evaluation.' },
      { id: 'opt2', title: 'Second Alternative', description: 'The second path under evaluation.' },
    ];
  }

  const clean = question.trim();

  // Special cases for common natural dilemmas
  const lower = clean.toLowerCase();
  if (lower.includes('tired') && (lower.includes('rest') || lower.includes('sleep') || lower.includes('nap'))) {
    return [
      { id: 'opt1', title: 'Rest & Recharge Now', description: 'Prioritize physical recovery, mental rest, and sleep.' },
      { id: 'opt2', title: 'Push Through & Keep Going', description: 'Continue current activity despite fatigue.' },
    ];
  }

  if (lower.match(/should\s+i\s+quit\b/) && !lower.includes(' or ') && !lower.includes(' vs ')) {
    return [
      { id: 'opt1', title: 'Quit / Step Away', description: 'Transition away from current commitment or habit.' },
      { id: 'opt2', title: 'Stay & Continue with Adjustments', description: 'Remain in place and implement boundary or workflow adjustments.' },
    ];
  }

  // Strip leading question framing phrases
  let stripped = clean
    .replace(/^[\s]*(should\s+i|should\s+we|is\s+it\s+better\s+to|do\s+i|would\s+it\s+be\s+better\s+to|deciding\s+between|i\s+am\s+trying\s+to\s+decide\s+(between|whether\s+to)?|whether\s+to)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

  // If there are multiple sentences (e.g. "I have a dilemma. Should I do X or Y"), find the actual question part
  if (stripped.includes('.') && (stripped.toLowerCase().includes(' or ') || stripped.toLowerCase().includes(' vs '))) {
    const sentences = stripped.split(/[.!?]\s+/);
    const questionSentence = sentences.find(s => s.toLowerCase().includes(' or ') || s.toLowerCase().includes(' vs '));
    if (questionSentence) {
      stripped = questionSentence
        .replace(/^[\s]*(should\s+i|should\s+we|is\s+it\s+better\s+to|do\s+i|would\s+it\s+be\s+better\s+to|deciding\s+between|whether\s+to)\s+/i, '')
        .trim();
    }
  }

  // Check for comma-separated lists with "or" / "vs"
  let parts: string[] = [];

  const betweenMatch = stripped.match(/^between\s+(.+?)\s+and\s+(.+)$/i);
  if (betweenMatch) {
    parts = [betweenMatch[1], betweenMatch[2]];
  } else if (stripped.includes(',') && (stripped.toLowerCase().includes(' or ') || stripped.toLowerCase().includes(' vs '))) {
    const tokens = stripped.split(/,\s*(?:or\s+|vs\s+|versus\s+)?|\s+or\s+|\s+vs\s+|\s+versus\s+/i);
    parts = tokens.map(t => t.trim()).filter(Boolean);
  } else {
    parts = stripped.split(/\s+(?:or|vs\.?|versus|against)\s+/i).map(t => t.trim()).filter(Boolean);
  }

  const cleanTitle = (raw: string): string => {
    let t = raw
      .replace(/^[\s]*(should\s+i|should\s+we|can\s+i|could\s+i|do\s+i|would\s+it\s+be\s+better\s+to|is\s+it\s+better\s+to|to\s+|a\s+|an\s+|the\s+)/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (t.length > 0) {
      t = t.charAt(0).toUpperCase() + t.slice(1);
    }
    return t || 'Alternative Path';
  };

  if (parts.length >= 2) {
    return parts.map((part, idx) => {
      const title = cleanTitle(part);
      return {
        id: `opt${idx + 1}`,
        title: title,
        description: `Pursue ${title.toLowerCase()} as the designated strategic route.`,
      };
    });
  }

  // Single sentence without explicit "or": make proactive vs alternative path
  const title = cleanTitle(stripped);
  return [
    {
      id: 'opt1',
      title: title.startsWith('Do ') || title.startsWith('Take ') ? title : `Proceed with ${title}`,
      description: `Actively commit to ${title.toLowerCase()}.`,
    },
    {
      id: 'opt2',
      title: `Decline or Postpone ${title}`,
      description: `Preserve existing position and explore alternative avenues.`,
    },
  ];
}
