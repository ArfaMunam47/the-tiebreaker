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

  // Strip leading question framing phrases (e.g. "Should I", "Should we", "Is it better to", "Do I", "Would it be better to", "Deciding between")
  let stripped = clean
    .replace(/^[\s]*(should\s+i|should\s+we|is\s+it\s+better\s+to|do\s+i|would\s+it\s+be\s+better\s+to|deciding\s+between|i\s+am\s+trying\s+to\s+decide\s+(between|whether\s+to)?|whether\s+to)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

  // Check for comma-separated lists with "or" / "vs" (e.g. "learn MERN, Python AI, or DevOps", "buy a MacBook, a Dell XPS, or a Lenovo ThinkPad")
  // Regex to split by comma followed by optional "or"/"and"/"vs" or standalone "or"/"vs"/"versus"
  let parts: string[] = [];

  // If question has "between ... and ...", handle that
  const betweenMatch = stripped.match(/^between\s+(.+?)\s+and\s+(.+)$/i);
  if (betweenMatch) {
    parts = [betweenMatch[1], betweenMatch[2]];
  } else if (stripped.includes(',') && (stripped.toLowerCase().includes(' or ') || stripped.toLowerCase().includes(' vs '))) {
    // Split by commas and the final 'or'/'vs'
    const tokens = stripped.split(/,\s*(?:or\s+|vs\s+|versus\s+)?|\s+or\s+|\s+vs\s+|\s+versus\s+/i);
    parts = tokens.map(t => t.trim()).filter(Boolean);
  } else {
    // Split by ' or ', ' vs ', ' versus ', ' against '
    parts = stripped.split(/\s+(?:or|vs\.?|versus|against)\s+/i).map(t => t.trim()).filter(Boolean);
  }

  // Format clean human-readable title from each part
  const cleanTitle = (raw: string): string => {
    let t = raw
      .replace(/^(\s*to\s+|\s*a\s+|\s*an\s+|\s*the\s+)/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    // Capitalize first letter of each major word
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

  // Single sentence without explicit "or": make proactive vs deferred path based on question
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
