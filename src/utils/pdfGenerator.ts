import { jsPDF } from 'jspdf';
import { DecisionAnalysis } from '../types';

/**
 * Generates and downloads a complete, beautifully structured PDF report for any DecisionAnalysis.
 * Pure client-side generation using jsPDF with automatic text-wrapping, clean page breaks, and comprehensive sections.
 */
export function generateAndDownloadDecisionPdf(decision: DecisionAnalysis): boolean {
  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();
    const pageHeight = doc.internal.pageSize.getHeight();
    const margin = 16;
    const contentWidth = pageWidth - margin * 2;
    let y = margin;

    const drawHeaderAndFooter = () => {
      // Top accent bar
      doc.setFillColor(184, 142, 61);
      doc.rect(margin, 8, contentWidth, 1.2, 'F');

      // Top header text
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      doc.setTextColor(184, 142, 61);
      doc.text('TIEBREAKER', margin, 14);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(120, 113, 108);
      doc.text('Comprehensive Decision Intelligence Report', margin + 26, 14);

      // Bottom footer line & text
      doc.setDrawColor(224, 217, 204);
      doc.setLineWidth(0.3);
      doc.line(margin, pageHeight - 12, pageWidth - margin, pageHeight - 12);

      const dateStr = decision.createdAt
        ? new Date(decision.createdAt).toLocaleDateString()
        : new Date().toLocaleDateString();

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(140, 130, 122);
      doc.text(`Generated on ${dateStr} • Tiebreaker Studio`, margin, pageHeight - 7);
    };

    const checkPageBreak = (neededHeight: number = 10) => {
      if (y + neededHeight > pageHeight - margin - 14) {
        doc.addPage();
        drawHeaderAndFooter();
        y = 22;
      }
    };

    // First page header
    drawHeaderAndFooter();
    y = 20;

    // Title Card Box
    doc.setFillColor(250, 247, 242);
    doc.setDrawColor(224, 217, 204);
    doc.setLineWidth(0.4);
    doc.roundedRect(margin, y, contentWidth, 24, 2, 2, 'FD');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(13);
    doc.setTextColor(44, 34, 30);
    const titleLines = doc.splitTextToSize(decision.title || 'Decision Analysis', contentWidth - 8);
    doc.text(titleLines.slice(0, 2), margin + 4, y + 8);

    // Metadata Row
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 90, 80);
    const dateStr = decision.createdAt
      ? new Date(decision.createdAt).toLocaleDateString()
      : new Date().toLocaleDateString();
    const metaStr = `Date: ${dateStr}   |   Category: ${decision.category || 'General'}   |   Timeframe: ${decision.timeHorizon || '1 year'}   |   Reversible: ${decision.reversibility || 'Somewhat reversible'}`;
    doc.text(metaStr, margin + 4, y + 19);

    y += 29;

    // 1. Core Question Section
    checkPageBreak(25);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(44, 34, 30);
    doc.text('1. The Decision Question', margin, y);
    y += 4.5;

    doc.setFillColor(247, 244, 238);
    doc.setDrawColor(230, 224, 214);
    const promptText = decision.originalPrompt || decision.title || 'No prompt provided';
    const promptLines = doc.splitTextToSize(promptText, contentWidth - 8);
    const promptBoxHeight = Math.max(10, promptLines.length * 4.2 + 5);
    doc.roundedRect(margin, y, contentWidth, promptBoxHeight, 2, 2, 'FD');

    doc.setFont('helvetica', 'italic');
    doc.setFontSize(8.5);
    doc.setTextColor(60, 50, 45);
    doc.text(promptLines, margin + 4, y + 5);
    y += promptBoxHeight + 6;

    // 2. Final Recommendation & Winning Choice
    const recommendedOpt =
      decision.options.find((o) => o.id === decision.recommendation?.recommendedOptionId) ||
      decision.options[0];

    checkPageBreak(35);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(44, 34, 30);
    doc.text('2. Final Recommendation & Best Choice', margin, y);
    y += 4.5;

    doc.setFillColor(254, 250, 240);
    doc.setDrawColor(212, 163, 56);
    doc.setLineWidth(0.6);

    const reasons = decision.recommendation?.mainReasons || [];
    const reasonLinesList = reasons.map((r) => doc.splitTextToSize(`• ${r}`, contentWidth - 12));
    const reasonsHeight = reasonLinesList.reduce((acc, curr) => acc + curr.length * 3.8, 0);
    const recBoxHeight = 20 + (reasonsHeight > 0 ? reasonsHeight + 4 : 0);

    doc.roundedRect(margin, y, contentWidth, recBoxHeight, 2, 2, 'FD');
    doc.setLineWidth(0.3);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(11);
    doc.setTextColor(184, 142, 61);
    doc.text(`Recommended Path: ${recommendedOpt?.title || 'Option 1'}`, margin + 5, y + 7.5);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(8);
    doc.setTextColor(100, 80, 50);
    const confReason = decision.recommendation?.confidenceReason ? ` (${decision.recommendation.confidenceReason})` : '';
    doc.text(`Confidence Level: ${decision.recommendation?.confidenceLevel || 'High'}${confReason}`, margin + 5, y + 13);

    let innerY = y + 18;
    if (reasons.length > 0) {
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8.5);
      doc.setTextColor(50, 40, 35);
      reasonLinesList.forEach((rLines) => {
        doc.text(rLines, margin + 6, innerY);
        innerY += rLines.length * 3.8;
      });
    }
    y += recBoxHeight + 5;

    // Trade-off / Bottom line
    if (decision.recommendation?.tradeOff || decision.recommendation?.bottomLine || decision.recommendation?.biggestConcern) {
      checkPageBreak(20);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8.5);
      doc.setTextColor(80, 60, 40);
      doc.text('Key Trade-off & Watch-outs:', margin, y);
      y += 4;

      const takeaway = [
        decision.recommendation.tradeOff ? `Trade-off: ${decision.recommendation.tradeOff}` : '',
        decision.recommendation.biggestConcern ? `Main Watch-out: ${decision.recommendation.biggestConcern}` : '',
        decision.recommendation.bottomLine ? `Bottom Line: ${decision.recommendation.bottomLine}` : '',
      ].filter(Boolean).join('\n');

      const takeawayLines = doc.splitTextToSize(takeaway, contentWidth);
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(8);
      doc.setTextColor(70, 60, 50);
      doc.text(takeawayLines, margin, y);
      y += takeawayLines.length * 3.8 + 5;
    }

    // 3. Evaluated Choices
    checkPageBreak(30);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(10.5);
    doc.setTextColor(44, 34, 30);
    doc.text('3. Evaluated Options', margin, y);
    y += 4.5;

    (decision.options || []).forEach((opt, idx) => {
      checkPageBreak(18);
      const isRec = opt.id === recommendedOpt?.id;
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9);
      doc.setTextColor(isRec ? 184 : 44, isRec ? 142 : 34, isRec ? 61 : 30);
      doc.text(`Choice ${idx + 1}: ${opt.title} ${isRec ? '★ (Recommended Winner)' : ''}`, margin, y);
      y += 4;

      if (opt.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(8);
        doc.setTextColor(80, 75, 70);
        const descLines = doc.splitTextToSize(opt.description, contentWidth - 4);
        doc.text(descLines, margin + 2, y);
        y += descLines.length * 3.6 + 3;
      }
    });
    y += 3;

    // 4. Decision Matrix / Weighted Scores
    if (decision.criteria && decision.criteria.length > 0) {
      checkPageBreak(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(44, 34, 30);
      doc.text('4. Decision Matrix & Scoring', margin, y);
      y += 4.5;

      doc.setFillColor(245, 242, 235);
      doc.rect(margin, y, contentWidth, 6, 'F');
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(60, 50, 40);
      doc.text('Evaluation Criteria', margin + 3, y + 4.2);
      doc.text('Weight', margin + 70, y + 4.2);

      const colWidth = (contentWidth - 95) / Math.max(1, decision.options.length);
      decision.options.forEach((opt, oIdx) => {
        const colX = margin + 95 + oIdx * colWidth;
        const optHeader = doc.splitTextToSize(opt.title, colWidth - 2)[0] || `Choice ${oIdx + 1}`;
        doc.text(optHeader, colX, y + 4.2);
      });
      y += 6.5;

      decision.criteria.forEach((crit) => {
        checkPageBreak(8);
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(50, 45, 40);
        doc.text(crit.name, margin + 3, y + 4);
        doc.text(`${crit.weight}%`, margin + 70, y + 4);

        decision.options.forEach((opt, oIdx) => {
          const colX = margin + 95 + oIdx * colWidth;
          const score = decision.weightedScores?.[opt.id]?.[crit.id] ?? '-';
          doc.text(`${score} / 10`, colX, y + 4);
        });

        doc.setDrawColor(235, 230, 222);
        doc.setLineWidth(0.2);
        doc.line(margin, y + 5.5, pageWidth - margin, y + 5.5);
        y += 6;
      });
      y += 4;
    }

    // 5. Pros & Cons Analysis
    if (decision.prosCons && decision.prosCons.length > 0) {
      checkPageBreak(35);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(44, 34, 30);
      doc.text('5. Pros & Cons Analysis', margin, y);
      y += 4.5;

      decision.prosCons.forEach((pc) => {
        const opt = decision.options.find((o) => o.id === pc.optionId);
        checkPageBreak(25);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8.5);
        doc.setTextColor(60, 50, 40);
        doc.text(`For: ${opt?.title || 'Choice'}`, margin, y);
        y += 4;

        if (pc.pros && pc.pros.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(22, 101, 52); // Green
          pc.pros.forEach((p) => {
            const lines = doc.splitTextToSize(`+ ${p.text}`, contentWidth - 6);
            doc.text(lines, margin + 3, y);
            y += lines.length * 3.4;
          });
        }

        if (pc.cons && pc.cons.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(153, 27, 27); // Red
          pc.cons.forEach((c) => {
            const lines = doc.splitTextToSize(`- ${c.text}`, contentWidth - 6);
            doc.text(lines, margin + 3, y);
            y += lines.length * 3.4;
          });
        }
        y += 2.5;
      });
      y += 3;
    }

    // 6. Risks & Solutions
    if (decision.risks && decision.risks.length > 0) {
      checkPageBreak(30);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(44, 34, 30);
      doc.text('6. Key Risks & Safety Mitigations', margin, y);
      y += 4.5;

      decision.risks.forEach((r) => {
        checkPageBreak(16);
        const opt = decision.options.find((o) => o.id === r.optionId);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(120, 53, 15);
        const optLabel = opt ? `[${opt.title}] ` : '';
        doc.text(`• ${optLabel}Risk (${r.probability || 'Medium'} Likelihood): ${r.risk}`, margin, y);
        y += 3.8;

        if (r.mitigation) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.5);
          doc.setTextColor(70, 60, 50);
          const mitLines = doc.splitTextToSize(`   Mitigation Plan: ${r.mitigation}`, contentWidth - 6);
          doc.text(mitLines, margin, y);
          y += mitLines.length * 3.4 + 1.5;
        }
      });
      y += 3;
    }

    // 7. Future Scenarios (if available)
    if (decision.scenarios && decision.scenarios.length > 0) {
      checkPageBreak(25);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(10.5);
      doc.setTextColor(44, 34, 30);
      doc.text('7. Future Scenarios (1–5 Year Trajectory)', margin, y);
      y += 4.5;

      decision.scenarios.forEach((sc) => {
        const opt = decision.options.find((o) => o.id === sc.optionId);
        checkPageBreak(18);
        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(70, 60, 50);
        doc.text(`Trajectory for: ${opt?.title || 'Choice'}`, margin, y);
        y += 3.5;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.5);
        doc.setTextColor(60, 55, 50);

        if (sc.shortTerm) {
          const stLines = doc.splitTextToSize(`• 1-6 Months: ${sc.shortTerm}`, contentWidth - 6);
          doc.text(stLines, margin + 3, y);
          y += stLines.length * 3.4;
        }

        if (sc.longTerm) {
          const ltLines = doc.splitTextToSize(`• 1-5 Years: ${sc.longTerm}`, contentWidth - 6);
          doc.text(ltLines, margin + 3, y);
          y += ltLines.length * 3.4;
        }
        y += 2;
      });
    }

    // Sanitize filename
    const cleanName = (decision.title || 'decision-summary')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 30) || 'decision-summary';

    const filename = `${cleanName}-${dateStr.replace(/[^0-9]/g, '-')}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('PDF generation error:', err);
    return false;
  }
}
