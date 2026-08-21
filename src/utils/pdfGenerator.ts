import { jsPDF } from 'jspdf';
import { DecisionAnalysis } from '../types';

/**
 * Generates a publication-quality, space-efficient, professional PDF report
 * using exact document flow calculations and seamless multi-page continuation.
 */
export function generateAndDownloadDecisionPdf(decision: DecisionAnalysis): boolean {
  if (!decision) {
    console.error('PDF Generation failed: Decision is null or undefined');
    return false;
  }

  try {
    const doc = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pageWidth = doc.internal.pageSize.getWidth();   // 210mm
    const pageHeight = doc.internal.pageSize.getHeight(); // 297mm
    const margin = 14; // Compact, standard publication margins
    const contentWidth = pageWidth - margin * 2;          // 182mm
    const bottomLimit = pageHeight - 14;                  // Bottom threshold before footer

    let y = margin;

    // Header renderer for subsequent pages (Page 2+)
    const renderRunningHeader = () => {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(184, 142, 61); // Warm Gold
      doc.text('TIEBREAKER', margin, 9.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.5);
      doc.setTextColor(130, 125, 115);
      doc.text('•  Decision Intelligence & Synthesis Report', margin + 22, 9.5);

      const titleShort = (decision.title || 'Decision Report').slice(0, 45);
      doc.text(titleShort, pageWidth - margin - doc.getTextWidth(titleShort), 9.5);

      doc.setDrawColor(225, 220, 210);
      doc.setLineWidth(0.25);
      doc.line(margin, 11.5, pageWidth - margin, 11.5);
    };

    // Fine-grained page break check - only breaks when genuinely needed
    const checkPageBreak = (neededHeight: number) => {
      if (y + neededHeight > bottomLimit) {
        doc.addPage();
        y = 16; // Start right below running header
        renderRunningHeader();
      }
    };

    // Helper: Formatted dates
    const dateObj = decision.createdAt ? new Date(decision.createdAt) : new Date();
    const dateStr = dateObj.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });

    const recommendedOpt =
      decision.options.find((o) => o.id === decision.recommendation?.recommendedOptionId) ||
      decision.options[0];

    // =============================================================
    // 1. COMPACT DOCUMENT HEADER (Starts near top of Page 1)
    // =============================================================
    
    // Top Brand Bar
    doc.setFillColor(30, 25, 22); // Deep Charcoal #1E1916
    doc.rect(margin, y, contentWidth, 7, 'F');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8);
    doc.setTextColor(212, 163, 56); // Warm Amber Gold
    doc.text('TIEBREAKER STUDIO', margin + 3.5, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(230, 225, 218);
    doc.text('EXECUTIVE DECISION EVALUATION REPORT', margin + 42, y + 4.8);

    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.setTextColor(200, 195, 185);
    const dateText = `Date: ${dateStr}`;
    doc.text(dateText, pageWidth - margin - doc.getTextWidth(dateText) - 3.5, y + 4.8);

    y += 9.5;

    // Decision Title (Compact & High Contrast)
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(14);
    doc.setTextColor(25, 20, 18);
    const titleLines = doc.splitTextToSize(decision.title || 'Decision Evaluation Analysis', contentWidth);
    doc.text(titleLines, margin, y + 3.5);
    y += titleLines.length * 5.2 + 3;

    // Metadata Bar (Category, Horizon, Reversibility, Options Count)
    doc.setFillColor(248, 245, 238);
    doc.rect(margin, y, contentWidth, 6, 'F');
    doc.setDrawColor(228, 223, 213);
    doc.setLineWidth(0.2);
    doc.rect(margin, y, contentWidth, 6, 'S');

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(70, 60, 50);

    const catText = `Category: ${decision.category || 'General'}`;
    const timeText = `Horizon: ${decision.timeHorizon || '1–2 years'}`;
    const revText = `Reversibility: ${decision.reversibility || 'Somewhat reversible'}`;
    const optText = `Options Evaluated: ${decision.options?.length || 2}`;

    doc.text(catText, margin + 3, y + 4.1);
    doc.text(timeText, margin + 48, y + 4.1);
    doc.text(revText, margin + 98, y + 4.1);
    doc.text(optText, margin + 148, y + 4.1);
    y += 8;

    // Original Dilemma Prompt Box (Compact)
    if (decision.originalPrompt) {
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7.5);
      doc.setTextColor(110, 100, 90);
      doc.text('ORIGINAL QUESTION / DILEMMA:', margin, y + 2.5);
      y += 4;

      doc.setFillColor(252, 250, 246);
      doc.setFont('helvetica', 'italic');
      doc.setFontSize(8);
      doc.setTextColor(45, 40, 35);
      const promptLines = doc.splitTextToSize(`"${decision.originalPrompt}"`, contentWidth - 6);
      const pBoxHeight = promptLines.length * 3.6 + 3.5;

      doc.rect(margin, y, contentWidth, pBoxHeight, 'F');
      doc.setDrawColor(230, 225, 218);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, pBoxHeight, 'S');

      // Left vertical accent stripe
      doc.setFillColor(184, 142, 61);
      doc.rect(margin, y, 1.2, pBoxHeight, 'F');

      doc.text(promptLines, margin + 3.5, y + 3.2);
      y += pBoxHeight + 3.5;
    }

    // =============================================================
    // 2. EXECUTIVE RECOMMENDATION BOX (High Visibility, Zero Waste)
    // =============================================================
    checkPageBreak(25);

    // Section Header
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 25, 22);
    doc.text('1. Executive Recommendation & Synthesis', margin, y + 2);
    y += 4.5;

    // Recommendation Highlight Box
    doc.setFillColor(254, 252, 245); // Subtle Warm Gold Tint
    doc.setDrawColor(212, 163, 56);
    doc.setLineWidth(0.35);

    const recTitle = recommendedOpt?.title ? recommendedOpt.title.toUpperCase() : 'RECOMMENDED OPTION';
    const confLevel = decision.recommendation?.confidenceLevel || 'High';
    const confReason = decision.recommendation?.confidenceReason || 'Strongest overall alignment with prioritized decision factors.';

    const reasonLines = (decision.recommendation?.mainReasons || []).map((r) => `• ${r}`);
    const parsedReasons = reasonLines.map((r) => doc.splitTextToSize(r, contentWidth - 8));
    const reasonsTotalHeight = parsedReasons.reduce((acc, l) => acc + l.length * 3.4 + 0.5, 0);

    const recBoxHeight = 13 + reasonsTotalHeight + 3;
    
    // Draw Box
    doc.rect(margin, y, contentWidth, recBoxHeight, 'FD');
    // Gold left accent bar
    doc.setFillColor(184, 142, 61);
    doc.rect(margin, y, 2.5, recBoxHeight, 'F');

    // Box Header & Recommended Title
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(8.5);
    doc.setTextColor(160, 110, 25);
    doc.text(`RECOMMENDED PATH: ${recTitle}`, margin + 5, y + 4.5);

    doc.setFont('helvetica', 'bold');
    doc.setFontSize(7);
    doc.setTextColor(90, 80, 70);
    doc.text(`Confidence: ${confLevel}  —  ${confReason}`, margin + 5, y + 8.5);

    // Render Reasons
    let recInnerY = y + 12;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7.5);
    doc.setTextColor(40, 35, 30);

    parsedReasons.forEach((lines) => {
      doc.text(lines, margin + 5, recInnerY);
      recInnerY += lines.length * 3.4 + 0.5;
    });

    y += recBoxHeight + 3.5;

    // Key Trade-Off & Watch-out (if present)
    if (decision.recommendation?.tradeOff || decision.recommendation?.biggestConcern) {
      checkPageBreak(16);

      doc.setFillColor(250, 247, 240);
      doc.setDrawColor(225, 218, 205);
      doc.setLineWidth(0.2);

      const toText = decision.recommendation.tradeOff ? `Trade-off: ${decision.recommendation.tradeOff}` : '';
      const bcText = decision.recommendation.biggestConcern ? `Watch-out: ${decision.recommendation.biggestConcern}` : '';
      const combined = [toText, bcText].filter(Boolean).join('\n');
      const combinedLines = doc.splitTextToSize(combined, contentWidth - 8);

      const toBoxHeight = combinedLines.length * 3.4 + 5.5;
      doc.rect(margin, y, contentWidth, toBoxHeight, 'FD');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(145, 75, 15); // Amber warning tone
      doc.text('KEY TRADE-OFF & OPERATIONAL WATCH-OUT:', margin + 3.5, y + 3.5);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7.2);
      doc.setTextColor(50, 45, 40);
      doc.text(combinedLines, margin + 3.5, y + 7);

      y += toBoxHeight + 4;
    }

    // =============================================================
    // 3. EVALUATED OPTIONS SUMMARY (Compact Cards)
    // =============================================================
    checkPageBreak(16);
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(9.5);
    doc.setTextColor(30, 25, 22);
    doc.text('2. Evaluated Options', margin, y + 2);
    y += 4.5;

    (decision.options || []).forEach((opt, idx) => {
      checkPageBreak(12);
      const isRec = opt.id === recommendedOpt?.id;

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(8);
      if (isRec) {
        doc.setTextColor(184, 142, 61);
        doc.text(`Choice ${idx + 1}: ${opt.title}  [★ Recommended Winner]`, margin, y + 2.5);
      } else {
        doc.setTextColor(40, 35, 30);
        doc.text(`Choice ${idx + 1}: ${opt.title}`, margin, y + 2.5);
      }
      y += 3.8;

      if (opt.description) {
        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(70, 65, 60);
        const descLines = doc.splitTextToSize(opt.description, contentWidth - 4);
        doc.text(descLines, margin + 2, y + 2);
        y += descLines.length * 3.2 + 2;
      }
    });

    y += 2;

    // =============================================================
    // 4. DECISION MATRIX & SCORING TABLE (Space-Efficient Grid)
    // =============================================================
    if (decision.criteria && decision.criteria.length > 0) {
      checkPageBreak(18);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 25, 22);
      doc.text('3. What Matters Most: Evaluation Matrix', margin, y + 2);
      y += 4.5;

      // Table Header Row
      const optCount = Math.max(1, decision.options.length);
      const critColWidth = 70;
      const weightColWidth = 22;
      const scoreColWidth = (contentWidth - critColWidth - weightColWidth) / optCount;

      doc.setFillColor(240, 236, 228);
      doc.rect(margin, y, contentWidth, 5.5, 'F');
      doc.setDrawColor(220, 215, 205);
      doc.setLineWidth(0.2);
      doc.rect(margin, y, contentWidth, 5.5, 'S');

      doc.setFont('helvetica', 'bold');
      doc.setFontSize(7);
      doc.setTextColor(60, 50, 40);
      doc.text('Evaluation Criteria', margin + 2.5, y + 3.8);
      doc.text('Weight', margin + critColWidth + 2, y + 3.8);

      decision.options.forEach((opt, oIdx) => {
        const colX = margin + critColWidth + weightColWidth + oIdx * scoreColWidth;
        const optHeader = doc.splitTextToSize(opt.title, scoreColWidth - 3)[0] || `Choice ${oIdx + 1}`;
        doc.text(optHeader, colX + 2, y + 3.8);
      });
      y += 5.5;

      // Data Rows
      decision.criteria.forEach((crit, rIdx) => {
        checkPageBreak(6.5);
        if (rIdx % 2 === 1) {
          doc.setFillColor(252, 250, 246);
          doc.rect(margin, y, contentWidth, 5.2, 'F');
        }

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7);
        doc.setTextColor(45, 40, 35);
        doc.text(crit.name, margin + 2.5, y + 3.5);

        doc.setFont('helvetica', 'bold');
        doc.setTextColor(110, 95, 75);
        doc.text(`${crit.weight}%`, margin + critColWidth + 2, y + 3.5);

        decision.options.forEach((opt, oIdx) => {
          const colX = margin + critColWidth + weightColWidth + oIdx * scoreColWidth;
          const score = decision.weightedScores?.[opt.id]?.[crit.id] ?? '-';
          doc.setFont('helvetica', 'normal');
          doc.setTextColor(40, 35, 30);
          doc.text(`${score} / 10`, colX + 2, y + 3.5);
        });

        doc.setDrawColor(230, 226, 220);
        doc.setLineWidth(0.15);
        doc.line(margin, y + 5.2, pageWidth - margin, y + 5.2);
        y += 5.2;
      });

      y += 3.5;
    }

    // =============================================================
    // 5. PROS & CONS COMPARISON
    // =============================================================
    if (decision.prosCons && decision.prosCons.length > 0) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 25, 22);
      doc.text('4. Pros & Cons Comparison', margin, y + 2);
      y += 4.5;

      decision.prosCons.forEach((pc) => {
        const opt = decision.options.find((o) => o.id === pc.optionId);
        checkPageBreak(12);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(8);
        doc.setTextColor(50, 45, 40);
        doc.text(`Analysis for: ${opt?.title || 'Choice'}`, margin, y + 2.5);
        y += 3.5;

        if (pc.pros && pc.pros.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(20, 95, 45); // Dark Forest Green
          pc.pros.forEach((p) => {
            checkPageBreak(5);
            const lines = doc.splitTextToSize(`[+] ${p.text}`, contentWidth - 4);
            doc.text(lines, margin + 2, y + 2);
            y += lines.length * 3.1 + 0.5;
          });
        }

        if (pc.cons && pc.cons.length > 0) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(150, 25, 25); // Dark Red
          pc.cons.forEach((c) => {
            checkPageBreak(5);
            const lines = doc.splitTextToSize(`[-] ${c.text}`, contentWidth - 4);
            doc.text(lines, margin + 2, y + 2);
            y += lines.length * 3.1 + 0.5;
          });
        }
        y += 2;
      });
    }

    // =============================================================
    // 6. RISKS & SOLUTIONS (MITIGATION PLAN)
    // =============================================================
    if (decision.risks && decision.risks.length > 0) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 25, 22);
      doc.text('5. Risk Evaluation & Mitigation Plan', margin, y + 2);
      y += 4.5;

      decision.risks.forEach((r) => {
        checkPageBreak(10);
        const opt = decision.options.find((o) => o.id === r.optionId);
        const optLabel = opt ? `[${opt.title}] ` : '';

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(135, 65, 15); // Amber warning
        doc.text(`• ${optLabel}Risk (${r.probability || 'Medium'} Likelihood): ${r.risk}`, margin, y + 2.5);
        y += 3.5;

        if (r.mitigation) {
          doc.setFont('helvetica', 'normal');
          doc.setFontSize(7.2);
          doc.setTextColor(55, 48, 42);
          const mitLines = doc.splitTextToSize(`   Mitigation Action: ${r.mitigation}`, contentWidth - 4);
          doc.text(mitLines, margin, y + 2);
          y += mitLines.length * 3.1 + 1.5;
        }
      });
      y += 2;
    }

    // =============================================================
    // 7. FUTURE SCENARIOS (1–5 YEAR TRAJECTORY)
    // =============================================================
    if (decision.scenarios && decision.scenarios.length > 0) {
      checkPageBreak(16);
      doc.setFont('helvetica', 'bold');
      doc.setFontSize(9.5);
      doc.setTextColor(30, 25, 22);
      doc.text('6. Future Timeline Scenarios', margin, y + 2);
      y += 4.5;

      decision.scenarios.forEach((sc) => {
        const opt = decision.options.find((o) => o.id === sc.optionId);
        checkPageBreak(10);

        doc.setFont('helvetica', 'bold');
        doc.setFontSize(7.5);
        doc.setTextColor(60, 55, 50);
        doc.text(`Trajectory for: ${opt?.title || 'Choice'}`, margin, y + 2.5);
        y += 3.2;

        doc.setFont('helvetica', 'normal');
        doc.setFontSize(7.2);
        doc.setTextColor(50, 45, 40);

        if (sc.shortTerm) {
          const stLines = doc.splitTextToSize(`• 1–6 Months: ${sc.shortTerm}`, contentWidth - 4);
          doc.text(stLines, margin + 2, y + 2);
          y += stLines.length * 3.1 + 0.5;
        }

        if (sc.longTerm) {
          const ltLines = doc.splitTextToSize(`• 1–5 Years: ${sc.longTerm}`, contentWidth - 4);
          doc.text(ltLines, margin + 2, y + 2);
          y += ltLines.length * 3.1 + 0.5;
        }
        y += 2;
      });
    }

    // =============================================================
    // DYNAMIC FOOTER & PAGE NUMBERING (Page X of Y)
    // =============================================================
    const totalPages = (doc.internal as any).getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setDrawColor(220, 215, 205);
      doc.setLineWidth(0.2);
      doc.line(margin, pageHeight - 10, pageWidth - margin, pageHeight - 10);

      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      doc.setTextColor(140, 130, 120);
      doc.text('Tiebreaker • Decision Intelligence & Synthesis Report', margin, pageHeight - 6);
      doc.text(`Page ${i} of ${totalPages}`, pageWidth - margin - 16, pageHeight - 6);
    }

    // Filename Sanitization
    const cleanName = (decision.title || 'decision-report')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 35) || 'decision-report';

    const filename = `${cleanName}-${dateStr.replace(/[^a-z0-9]/gi, '-')}.pdf`;
    doc.save(filename);
    return true;
  } catch (err) {
    console.error('PDF Generation exception:', err);
    return false;
  }
}
