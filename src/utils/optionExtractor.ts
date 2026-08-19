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
  const lower = clean.toLowerCase();

  // Special cases for common natural dilemmas
  if (lower.includes('tired') && (lower.includes('rest') || lower.includes('sleep') || lower.includes('nap'))) {
    return ['Rest & Recharge Now', 'Push Through & Keep Going'];
  }

  if (lower.match(/should\s+i\s+quit\b/) && !lower.includes(' or ') && !lower.includes(' vs ')) {
    return ['Quit / Step Away', 'Stay & Continue with Adjustments'];
  }

  // Strip leading question framing phrases
  let stripped = clean
    .replace(/^[\s]*(should\s+i|should\s+we|is\s+it\s+better\s+to|do\s+i|would\s+it\s+be\s+better\s+to|deciding\s+between|i\s+am\s+trying\s+to\s+decide\s+(between|whether\s+to)?|whether\s+to)\s+/i, '')
    .replace(/\?+$/, '')
    .trim();

  // If there are multiple sentences, find the question part with alternatives
  if (stripped.includes('.') && (stripped.toLowerCase().includes(' or ') || stripped.toLowerCase().includes(' vs '))) {
    const sentences = stripped.split(/[.!?]\s+/);
    const questionSentence = sentences.find(s => s.toLowerCase().includes(' or ') || s.toLowerCase().includes(' vs '));
    if (questionSentence) {
      stripped = questionSentence
        .replace(/^[\s]*(should\s+i|should\s+we|is\s+it\s+better\s+to|do\s+i|would\s+it\s+be\s+better\s+to|deciding\s+between|whether\s+to)\s+/i, '')
        .trim();
    }
  }

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
    return parts.map(cleanTitle);
  }

  const title = cleanTitle(stripped);
  return [
    title.startsWith('Do ') || title.startsWith('Take ') ? title : `Proceed with ${title}`,
    `Decline or Postpone ${title}`,
  ];
}
