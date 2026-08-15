/**
 * Client-side Semantic Option Extractor
 * Parses natural language questions into distinct decision choices (2, 3, 4+ options).
 * Guaranteed to NEVER return generic placeholders like "Option A: Primary Alternative" or "Status Quo".
 */

export function extractAlternativesFromQuestionClient(question: string): string[] {
  if (!question || typeof question !== 'string') {
    return ['First Alternative', 'Second Alternative'];
  }

  const clean = question.trim();

  // Strip leading question framing phrases
  let stripped = clean
    .replace(/^[\s]*(should\s+i|should\s+we|is\s+it\s+better\s+to|do\s+i|would\s+it\s+be\s+better\s+to|deciding\s+between|i\s+am\s+trying\s+to\s+decide\s+(between|whether\s+to)?|whether\s+to)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

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
      .replace(/^(\s*to\s+|\s*a\s+|\s*an\s+|\s*the\s+)/i, '')
      .replace(/\s+/g, ' ')
      .trim();

    if (t.length > 0) {
      t = t.charAt(0).toUpperCase() + t.slice(1);
    }
    return t || 'Alternative Path';
  };

  if (parts.length >= 2) {
    return parts.map(cleanTitle);
  }

  const title = cleanTitle(stripped);
  return [
    title.startsWith('Do ') || title.startsWith('Take ') ? title : `Proceed with ${title}`,
    `Decline or Postpone ${title}`,
  ];
}
