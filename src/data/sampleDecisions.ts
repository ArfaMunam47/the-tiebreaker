import { DecisionAnalysis } from '../types';

export const SAMPLE_DECISIONS: DecisionAnalysis[] = [
  // 1. CAREER DECISION
  {
    id: 'sample_career',
    title: 'Accept New Startup Engineering Lead Role vs. Stay at Current Stable Company',
    originalPrompt: 'Should I accept an offer to become the Engineering Lead at a fast-growing series-A startup ($145k + 0.75% equity) or stay at my current senior developer role ($130k + great benefits, low stress, 4 years tenure)?',
    category: 'Career',
    reversibility: 'Somewhat reversible',
    timeHorizon: '1–2 years',
    userPriorities: ['Career Growth', 'Financial Upside', 'Work-Life Balance', 'Learning & Mentorship', 'Job Security'],
    options: [
      {
        id: 'opt1',
        title: 'Accept Startup Engineering Lead Offer',
        description: 'Join the 18-person startup as Engineering Lead with $145k base, 0.75% equity vest over 4 years, high autonomy, fast promotions, and direct executive exposure.',
        source: 'user',
      },
      {
        id: 'opt2',
        title: 'Stay at Current Enterprise Company',
        description: 'Maintain senior engineer position at $130k with predictable 38-hour workweeks, generous 401(k) match, 5 weeks PTO, and high job stability.',
        source: 'user',
      },
      {
        id: 'opt3',
        title: 'Leverage Offer to Negotiate Internal Promotion',
        description: 'Use the external offer as leverage to request a promotion to Staff Engineer or Team Lead at current company with an adjusted salary of $142k.',
        source: 'user',
      },
    ],
    clarificationState: {
      decisionSummary: 'Evaluating whether to embrace rapid career progression and equity upside at a Series-A startup versus long-term security and work-life balance at an established enterprise.',
      optionsUnderstood: ['Accept Startup Lead', 'Stay Current Role', 'Negotiate Internal Promotion'],
      keyConstraints: ['Current company requires 2 weeks notice', 'Startup offer expires in 7 business days', 'Need predictable schedule for family commitments'],
      assumptionsIdentified: ['Startup has at least 20 months of runway', 'Current team value is high enough to counter-offer without burning bridges'],
      missingInfo: ['Startup cap table details and current monthly cash burn rate'],
      confirmedByUser: true,
    },
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'What is the startup’s verified cash runway and revenue growth rate?',
        suggestedAnswers: ['24+ months (profitable/funded)', '12–18 months', 'Less than 12 months', 'Not sure yet'],
        userAnswer: '18–24 months with growing ARR',
        whyItMatters: 'Directly impacts the risk of involuntary job loss within the next 12 months.',
      },
      {
        id: 'q2',
        question: 'How important is evening and weekend time flexibility over the next 18 months?',
        suggestedAnswers: ['Critical (family/health commitments)', 'Flexible for the right upside', 'Not a major factor right now'],
        userAnswer: 'Flexible for the right upside',
        whyItMatters: 'Weights the work-life balance trade-off against accelerated executive leadership experience.',
      },
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Rapid career leap: direct transition into Engineering Lead & hiring manager', weight: 'high', details: 'Bypasses 3-4 years of slow corporate ladder climbing.', source: 'AI SUGGESTED' },
          { text: 'Significant equity upside (0.75%) if the company executes successfully', weight: 'high', source: 'USER PROVIDED' },
          { text: 'High architectural autonomy and influence over company product stack', weight: 'medium', source: 'USER PROVIDED' },
        ],
        cons: [
          { text: 'Higher stress and expectation to work occasional long sprint hours', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Startup volatility: runway risk and changing market conditions', weight: 'medium', source: 'AI SUGGESTED' },
        ],
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'Exceptional work-life balance with zero weekend on-call pressure', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Established institutional credibility and high layoff protection', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Reliable healthcare benefits and 6% 401(k) company match', weight: 'medium', source: 'USER PROVIDED' },
        ],
        cons: [
          { text: 'Stagnant technical learning curve and slow bureaucracy', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Lower long-term wealth compounding compared to equity upside', weight: 'medium', source: 'USER PROVIDED' },
        ],
      },
      {
        optionId: 'opt3',
        pros: [
          { text: 'Best of both: higher compensation ($142k) without leaving known environment', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Tests current leadership’s genuine commitment to your growth', weight: 'medium', source: 'USER PROVIDED' },
        ],
        cons: [
          { text: 'Risk of signaling flightiness to current executive management', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Promotion may come with more politics than genuine autonomy', weight: 'medium', source: 'USER PROVIDED' },
        ],
      },
    ],
    comparison: [
      { criterion: 'Career Acceleration & Title', scores: { opt1: 'Lead (Immediate)', opt2: 'Senior (Static)', opt3: 'Staff / Lead (Negotiated)' }, winnerOptionId: 'opt1' },
      { criterion: 'Compensation & Upside', scores: { opt1: '$145k + 0.75% Equity', opt2: '$130k + 6% 401k', opt3: '$140k-$145k' }, winnerOptionId: 'opt1' },
      { criterion: 'Work-Life Predictability', scores: { opt1: 'Moderate (45-50 hrs/wk)', opt2: 'High (38 hrs/wk)', opt3: 'Moderate-High' }, winnerOptionId: 'opt2' },
      { criterion: 'Job Security & Runway', scores: { opt1: '18-24 Mo Runway', opt2: 'Established Enterprise', opt3: 'Established Enterprise' }, winnerOptionId: 'opt2' },
    ],
    swot: [
      {
        optionId: 'opt1',
        strengths: ['Immediate leadership credential', 'Direct exposure to founders and investors', 'Modern tech stack'],
        weaknesses: ['Higher initial workload during sprint cycles', 'Less formal HR and onboarding structure'],
        opportunities: ['Positioning for VP of Engineering or CTO in next funding round', 'High equity value on liquidity event'],
        threats: ['Macro venture funding downturn limiting Series B round'],
      },
      {
        optionId: 'opt2',
        strengths: ['Low stress baseline', 'Deep mastery of existing codebase', 'Predictable compensation'],
        weaknesses: ['Career boredom and plateauing resume value', 'Underpaid relative to current market rate'],
        opportunities: ['Pursuing outside side projects or certifications in spare time'],
        threats: ['Team reorganization or corporate cost-cutting over 3-year horizon'],
      },
      {
        optionId: 'opt3',
        strengths: ['Immediate compensation jump without relocation or onboarding friction'],
        weaknesses: ['Counter-offer stigma can reduce trust with senior managers'],
        opportunities: ['Formalizing team leadership roadmap internally'],
        threats: ['Company matches pay but fails to expand scope or team authority'],
      },
    ],
    criteria: [
      { id: 'crit1', name: 'Career Growth & Leadership', weight: 30, description: 'Speed of advancing into executive engineering leadership.' },
      { id: 'crit2', name: 'Financial Upside & Equity', weight: 25, description: 'Total potential financial compensation and equity wealth creation.' },
      { id: 'crit3', name: 'Work-Life Balance', weight: 20, description: 'Sustaining energy, family time, and mental well-being.' },
      { id: 'crit4', name: 'Learning & Mastery', weight: 15, description: 'Acquiring modern technical and organizational skills.' },
      { id: 'crit5', name: 'Job Security', weight: 10, description: 'Protection against unexpected organizational termination.' },
    ],
    weightedScores: {
      opt1: { crit1: 9, crit2: 9, crit3: 5, crit4: 9, crit5: 6 },
      opt2: { crit1: 4, crit2: 5, crit3: 9, crit4: 4, crit5: 9 },
      opt3: { crit1: 7, crit2: 7, crit3: 7, crit4: 6, crit5: 7 },
    },
    risks: [
      {
        id: 'r1',
        optionId: 'opt1',
        risk: 'Startup burns capital faster than expected, forcing a pivot or down-round layoff',
        probability: 'Low',
        impact: 'High',
        mitigation: 'Request verified runway metrics in writing and maintain a 6-month living expense reserve.',
      },
      {
        id: 'r2',
        optionId: 'opt3',
        risk: 'Current manager views you as disloyal after presenting an outside offer',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Frame the conversation constructively around your long-term commitment and scope readiness rather than an ultimatum.',
      },
    ],
    scenarios: [
      {
        optionId: 'opt1',
        shortTerm: 'Months 1–6: Rapid team building, establishing CI/CD standards, high adrenaline, steep onboarding.',
        longTerm: 'Years 1–3: Promoted to Head of Engineering or VP; substantial equity liquidity upon Series B/C.',
        keyTurningPoint: 'First major product launch under your leadership.',
      },
      {
        optionId: 'opt2',
        shortTerm: 'Months 1–6: Comfortable routine, high energy for fitness and personal life, mild career restlessness.',
        longTerm: 'Years 1–3: Gradual 3% annual cost-of-living adjustments with potential stagnation.',
        keyTurningPoint: 'Annual performance review cycle.',
      },
    ],
    thinkDeeper: {
      assumptions: [
        'Assuming your current market value will stay high if you decide to change jobs later.',
        'Assuming the startup culture matches the founders’ interview promises.',
      ],
      missingInformation: [
        'Exact cap table dilution terms and liquidation preferences for common stock.',
        'Whether your current team has an open budget for an immediate promotion.',
      ],
      biases: [
        'Status Quo Bias: Overvaluing current comfort simply because you have 4 years of familiarity.',
        'Optimism Bias: Assuming all startup equity will reach a high-multiple exit without down-rounds.',
      ],
      blindspotQuestions: [
        'If the startup role fails after 12 months, how easy is it for you to land another senior role?',
        'Are you more energized by building teams from scratch or optimizing existing systems?',
      ],
      questionsToAskOthers: [
        'Ask former startup engineers: "How does the CTO handle delivery deadlines when sprints slip?"',
        'Ask a trusted mentor: "Does my career trajectory need management credentials right now?"',
      ],
      researchItems: [
        'Review Glassdoor and LinkedIn tenure for former engineers at the startup.',
        'Calculate net equity value under $50M, $100M, and $250M valuation scenarios.',
      ],
    },
    recommendation: {
      recommendedOptionId: 'opt1',
      recommendedOptionTitle: 'Accept Startup Engineering Lead Offer',
      mainReasons: [
        'Provides the highest alignment with your top priorities: leadership progression, skill mastery, and equity upside.',
        'Your 4 years of solid enterprise experience gives you the resilience to succeed in a fast-paced leadership role.',
        'Startup’s 18–24 month runway provides a healthy safety buffer while transforming your resume.',
      ],
      biggestConcern: 'Managing workload boundaries during the first 90 days to protect health and prevent burnout.',
      missingInformation: 'Final verification of the formal equity vesting schedule and stock option exercise window.',
      confidenceLevel: 'High',
      confidenceReason: 'High confidence because career upside and title leap heavily outweigh the comfort of staying in an already mastered role.',
      whyNotOptions: {
        opt2: 'Staying lost because it leaves you plateaued on career growth and forfeits substantial long-term equity upside.',
        opt3: 'Internal negotiation lost due to risk of political friction without matching the genuine startup autonomy.',
      },
      reversalConditions: [
        'If the startup refuses to provide written proof of at least 18 months cash runway.',
        'If the founders alter the title or equity percentage during final contract issuance.',
      ],
      opportunityCosts: {
        opt1: 'Sacrificing 38-hour relaxed workweeks and 5 weeks of guaranteed PTO.',
        opt2: 'Forfeiting 0.75% equity and an immediate jump to an Engineering Lead title.',
      },
    },
    createdAt: '2026-08-14T10:00:00.000Z',
    updatedAt: '2026-08-16T14:30:00.000Z',
    status: 'analyzed',
  },

  // 2. EDUCATION & SKILLS DECISION
  {
    id: 'sample_education',
    title: 'Continue Master’s Degree vs. Transition to Intensive Applied AI Fellowship',
    originalPrompt: 'Should I complete the remaining 2 years of my traditional academic Master’s in Information Systems ($28k tuition left) or pivot into a 6-month intensive Applied AI Engineering fellowship ($12k, guaranteed hiring network)?',
    category: 'Education',
    reversibility: 'Somewhat reversible',
    timeHorizon: '1–2 years',
    userPriorities: ['Job Market Readiness', 'Financial Cost & ROI', 'Speed to Employment', 'Practical AI Skills', 'Credential Prestige'],
    options: [
      {
        id: 'opt1',
        title: 'Complete Traditional Master’s Degree',
        description: 'Finish the remaining 4 semesters of university coursework at $7k/semester, securing an accredited MSc degree with campus recruiting access.',
        source: 'user',
      },
      {
        id: 'opt2',
        title: 'Enroll in Applied AI Engineering Fellowship',
        description: 'Take a formal 1-year academic leave of absence and complete a 6-month hands-on fellowship building LLM architectures, agents, and production APIs.',
        source: 'user',
      },
      {
        id: 'opt3',
        title: 'Part-Time Master’s + Self-Directed AI Portfolio',
        description: 'Slow down degree to 1 class per semester while building and shipping 4 open-source AI applications independently.',
        source: 'user',
      },
    ],
    clarificationState: {
      decisionSummary: 'Choosing between a traditional 2-year university Master’s credential and a fast-track 6-month Applied AI fellowship to maximize job market readiness in modern tech.',
      optionsUnderstood: ['Finish Master’s', 'AI Fellowship', 'Part-time Study + Open Source'],
      keyConstraints: ['University allows up to 2 years of formal leave without forfeiting credits', 'Tuition budget is limited'],
      assumptionsIdentified: ['AI industry currently values production Github repositories over academic degrees'],
      missingInfo: ['Fellowship’s verified 6-month placement rate and median starting compensation'],
      confirmedByUser: true,
    },
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'Does your university allow pausing studies without financial penalties or losing credits?',
        suggestedAnswers: ['Yes, approved leave of absence available', 'No, credits expire', 'Need to verify with registrar'],
        userAnswer: 'Yes, approved leave of absence available',
        whyItMatters: 'Protects the downside: you can return to the degree if the fellowship does not yield an immediate job.',
      },
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Internationally recognized accredited Master of Science credential', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Access to traditional corporate campus career fairs', weight: 'medium', source: 'AI SUGGESTED' },
        ],
        cons: [
          { text: '$28,000 in additional tuition costs and 2 years of delayed earnings', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Academic syllabus lags behind fast-moving frontier AI tooling', weight: 'high', source: 'AI SUGGESTED' },
        ],
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'Enters the job market 18 months earlier with active production AI experience', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Saves $16,000 in direct educational expenses', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Direct mentorship from senior engineers in top AI labs', weight: 'medium', source: 'AI SUGGESTED' },
        ],
        cons: [
          { text: 'Non-degree certificate carries less weight for certain visa applications', weight: 'medium', source: 'AI SUGGESTED' },
          { text: 'Requires high self-discipline and aggressive independent networking', weight: 'medium', source: 'USER PROVIDED' },
        ],
      },
      {
        optionId: 'opt3',
        pros: [
          { text: 'Maintains academic progress while building practical portfolio', weight: 'medium', source: 'USER PROVIDED' },
        ],
        cons: [
          { text: 'High risk of context switching and taking 4+ years to graduate', weight: 'high', source: 'AI SUGGESTED' },
        ],
      },
    ],
    comparison: [
      { criterion: 'Total Financial Cost', scores: { opt1: '$28,000 Tuition', opt2: '$12,000 Tuition', opt3: '$28k Spread Over Time' }, winnerOptionId: 'opt2' },
      { criterion: 'Time to Full-Time Salary', scores: { opt1: '24 Months', opt2: '6–8 Months', opt3: '36+ Months' }, winnerOptionId: 'opt2' },
      { criterion: 'Production AI Mastery', scores: { opt1: 'Theoretical', opt2: 'Full Production Code', opt3: 'Self-guided' }, winnerOptionId: 'opt2' },
      { criterion: 'Global Credential Safety', scores: { opt1: 'Accredited MSc', opt2: 'Industry Certificate', opt3: 'Accredited MSc' }, winnerOptionId: 'opt1' },
    ],
    swot: [
      {
        optionId: 'opt2',
        strengths: ['High ROI', 'Immediate relevance to 2026 hiring demand', 'Leaves university return option intact'],
        weaknesses: ['Lacks formal academic stamp'],
        opportunities: ['Landing an early-career AI engineer position at $115k+ 18 months ahead of schedule'],
        threats: ['Tech hiring freezes in junior roles requiring aggressive project demonstrations'],
      },
    ],
    criteria: [
      { id: 'crit1', name: 'Speed to Employment & Earnings', weight: 35, description: 'How fast you can earn full-time industry salary.' },
      { id: 'crit2', name: 'Practical Modern AI Skills', weight: 30, description: 'Hands-on ability to build, fine-tune, and deploy models.' },
      { id: 'crit3', name: 'Total Cost & Debt', weight: 20, description: 'Minimizing tuition and debt burden.' },
      { id: 'crit4', name: 'Formal Credential Recognition', weight: 15, description: 'Value of accredited degree for visa or corporate gates.' },
    ],
    weightedScores: {
      opt1: { crit1: 4, crit2: 5, crit3: 4, crit4: 10 },
      opt2: { crit1: 9, crit2: 9, crit3: 9, crit4: 6 },
      opt3: { crit1: 5, crit2: 7, crit3: 5, crit4: 9 },
    },
    risks: [
      {
        id: 'r1',
        optionId: 'opt2',
        risk: 'Fellowship completion does not lead to immediate job within 90 days',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Use approved university leave to return and finish degree without losing accumulated credits.',
      },
    ],
    scenarios: [
      {
        optionId: 'opt2',
        shortTerm: 'Months 1–6: Intensive coding, building multi-agent systems, deploying production apps on cloud.',
        longTerm: 'Years 1–3: Established Mid-Level AI Engineer earning $130k+, 2 years ahead of student peers.',
        keyTurningPoint: 'Publishing capstone project to tech community.',
      },
    ],
    thinkDeeper: {
      assumptions: ['Assuming practical Github projects outrank Master’s diplomas for modern software roles.'],
      missingInformation: ['Exact visa requirements if planning to work abroad.'],
      biases: ['Sunk Cost Fallacy: Wanting to finish the Master’s solely because you already completed year 1.'],
      blindspotQuestions: ['If you pause the degree now, will you regret not having the formal diploma in 10 years?'],
      questionsToAskOthers: ['Ask AI hiring managers: "Would you interview a candidate with 3 live AI production apps over a new MSc grad?"'],
      researchItems: ['Audit hiring requirements across 20 target tech job postings.'],
    },
    recommendation: {
      recommendedOptionId: 'opt2',
      recommendedOptionTitle: 'Enroll in Applied AI Engineering Fellowship (with Formal University Leave)',
      mainReasons: [
        'Drastically superior ROI: saves $16,000 and accelerates full-time earnings by 18 months.',
        'The tech market overwhelmingly rewards production-grade AI applications over academic theory.',
        'Securing a formal university leave eliminates downside risk by keeping your degree seat open.',
      ],
      biggestConcern: 'Ensuring your university leave paperwork is fully approved before the semester add/drop deadline.',
      missingInformation: 'Confirmation of the fellowship’s direct hiring partner interview guarantees.',
      confidenceLevel: 'High',
      confidenceReason: 'High confidence because accelerating earnings by 1.5 years while saving tuition creates an undeniable financial and career advantage.',
      whyNotOptions: {
        opt1: 'Continuing Master’s lost due to $28,000 cost, 2-year delay, and theoretical syllabus disconnect.',
        opt3: 'Part-time study lost due to severe context-switching and burnout.',
      },
      reversalConditions: [
        'If the university dean rejects the leave-of-absence petition.',
      ],
      opportunityCosts: {
        opt1: 'Sacrificing 1.5 years of industry salary and modern AI portfolio development.',
        opt2: 'Forfeiting immediate university campus social life and accredited diploma.',
      },
    },
    createdAt: '2026-08-12T11:20:00.000Z',
    updatedAt: '2026-08-15T09:00:00.000Z',
    status: 'analyzed',
  },

  // 3. MONEY & CAPITAL DECISION
  {
    id: 'sample_money',
    title: 'Buy New Electric Vehicle ($38k) vs. Keep Current Paid-Off Car & Invest Capital',
    originalPrompt: 'Should I purchase a new $38,000 electric vehicle (trading in current car for $8k down, $520/mo payment for 5 years) or keep driving my reliable 2017 Honda Civic (zero payment) and invest $520/month into broad index funds?',
    category: 'Finance',
    reversibility: 'Difficult to reverse',
    timeHorizon: '5+ years',
    userPriorities: ['Wealth Accumulation & Compounding', 'Monthly Cash Flow', 'Reliability & Safety', 'Driving Enjoyment & Tech', 'Environmental Impact'],
    options: [
      {
        id: 'opt1',
        title: 'Purchase New Electric Vehicle ($38k)',
        description: 'Trade in Honda Civic for $8k, finance $30k at 5.5% APR ($575/mo for 60 months), enjoy modern safety tech, lower fuel costs, and full warranty.',
        source: 'user',
      },
      {
        id: 'opt2',
        title: 'Keep Honda Civic & Invest Monthly Delta ($575/mo)',
        description: 'Keep driving paid-off Civic (estimated $1,200/yr in maintenance), automate $575/mo into S&P 500 index fund for 5 years (~$42,000 compounded portfolio).',
        source: 'user',
      },
      {
        id: 'opt3',
        title: 'Buy Quality 3-Year-Old Certified Pre-Owned Hybrid ($21k)',
        description: 'Trade in Civic, finance $13k over 36 months ($390/mo), achieving 50 MPG with lower depreciation and moderate monthly payment.',
        source: 'user',
      },
    ],
    clarificationState: {
      decisionSummary: 'Comparing purchasing a new $38k EV with monthly debt payments against driving a reliable paid-off vehicle and deploying the capital difference into compounding index funds.',
      optionsUnderstood: ['Buy New EV', 'Keep Civic & Invest', 'Used Hybrid Compromise'],
      keyConstraints: ['Current Civic is mechanically sound with 82,000 miles', 'No major commute changes planned (15 miles/day)'],
      assumptionsIdentified: ['Civic will last another 5 years with standard maintenance', 'Stock index funds average ~8% nominal return'],
      missingInfo: ['Home electrical charging installation cost ($500–$1,500)'],
      confirmedByUser: true,
    },
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'What is your average daily commute distance?',
        suggestedAnswers: ['Under 20 miles', '20–50 miles', 'Over 50 miles daily'],
        userAnswer: 'Under 20 miles',
        whyItMatters: 'Short commutes significantly reduce the fuel savings benefit of an EV.',
      },
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Cutting-edge safety features, autopilot assistance, and zero tailpipe emissions', weight: 'medium', source: 'USER PROVIDED' },
          { text: 'Zero gas station visits and low routine maintenance (no oil changes)', weight: 'medium', source: 'USER PROVIDED' },
        ],
        cons: [
          { text: '$575/month cash outflow plus higher collision insurance premiums ($60/mo extra)', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Rapid first-3-year vehicle depreciation ($14,000 loss in vehicle value)', weight: 'high', source: 'AI SUGGESTED' },
        ],
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'Creates an extra ~$42,000 in liquid compounding investment wealth over 5 years', weight: 'high', details: '$575/mo at 8% CAGR yields $42,300 in 60 months.', source: 'AI SUGGESTED' },
          { text: 'Total monthly cash flow freedom: $0 car payment protects against job shocks', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Low property tax and low insurance costs on existing vehicle', weight: 'medium', source: 'USER PROVIDED' },
        ],
        cons: [
          { text: 'Older cabin technology and lack of modern active safety features', weight: 'medium', source: 'USER PROVIDED' },
          { text: 'Occasional maintenance visits (brakes, tires, belts ~ $1,200/year)', weight: 'low', source: 'USER PROVIDED' },
        ],
      },
    ],
    comparison: [
      { criterion: '5-Year Wealth Impact', scores: { opt1: '-$38k Outflow (Car worth $18k)', opt2: '+$42k Liquid Investment Portfolio', opt3: '+$18k Portfolio Delta' }, winnerOptionId: 'opt2' },
      { criterion: 'Monthly Cash Flow Buffer', scores: { opt1: 'Constrained (-$575/mo)', opt2: 'High Freedom ($0/mo)', opt3: 'Moderate (-$390/mo)' }, winnerOptionId: 'opt2' },
      { criterion: 'Safety & Tech Features', scores: { opt1: 'State of the Art', opt2: 'Basic 2017 Standards', opt3: 'Modern 2023 Standards' }, winnerOptionId: 'opt1' },
    ],
    swot: [
      {
        optionId: 'opt2',
        strengths: ['Financial resilience', 'High compound interest advantage', 'Zero debt liability'],
        weaknesses: ['Older aesthetic'],
        opportunities: ['Using the $42k fund in 5 years to purchase a future EV in cash with zero debt'],
        threats: ['Unexpected transmission or engine repair on Civic ($2,500 event)'],
      },
    ],
    criteria: [
      { id: 'crit1', name: 'Wealth Accumulation & Net Worth', weight: 40, description: 'Long-term financial portfolio growth over 5–10 years.' },
      { id: 'crit2', name: 'Monthly Budget Flexibility', weight: 25, description: 'Freedom from fixed recurring monthly debt obligations.' },
      { id: 'crit3', name: 'Vehicle Safety & Reliability', weight: 20, description: 'Dependable transportation without mechanical breakdown.' },
      { id: 'crit4', name: 'Enjoyment & Sustainability', weight: 15, description: 'Driving satisfaction and environmental footprint.' },
    ],
    weightedScores: {
      opt1: { crit1: 3, crit2: 4, crit3: 9, crit4: 9 },
      opt2: { crit1: 10, crit2: 10, crit3: 7, crit4: 5 },
      opt3: { crit1: 7, crit2: 6, crit3: 8, crit4: 7 },
    },
    risks: [
      {
        id: 'r1',
        optionId: 'opt2',
        risk: 'Civic suffers a $2,000 sudden mechanical repair (AC compressor or alternator)',
        probability: 'Medium',
        impact: 'Low',
        mitigation: 'A single $2,000 repair is equivalent to only 3.5 months of EV payments; maintain a $2k auto repair buffer.',
      },
    ],
    scenarios: [
      {
        optionId: 'opt2',
        shortTerm: 'Months 1–6: Automatic monthly transfer of $575 to brokerage account, Civic running smoothly.',
        longTerm: 'Years 1–5: Investment balance reaches $42,000+; car remains fully functional.',
        keyTurningPoint: 'First year maintenance checkup.',
      },
    ],
    thinkDeeper: {
      assumptions: ['Assuming a short 15-mile commute makes gas savings minimal (<$60/mo).'],
      missingInformation: ['Exact battery degradation warranty conditions for target EV.'],
      biases: ['New Car Euphoria Bias: Overestimating how long the excitement of a new car dashboard lasts (typically 90 days).'],
      blindspotQuestions: ['If you had $38,000 cash in hand today, would you buy the EV or keep the cash invested?'],
      questionsToAskOthers: ['Ask an independent mechanic: "How many more reliable miles can I expect from an 82k-mile Civic?"'],
      researchItems: ['Compare insurance quotes between 2017 Civic and 2026 EV.'],
    },
    recommendation: {
      recommendedOptionId: 'opt2',
      recommendedOptionTitle: 'Keep Honda Civic & Invest $575/Month into Index Funds',
      mainReasons: [
        'Generates an estimated $42,000+ in liquid wealth over 5 years versus financing a depreciating $38k asset.',
        'Your short 15-mile commute means fuel savings ($45/mo) would never offset the $575/mo debt payment and higher insurance costs.',
        'Zero monthly car payment provides immense peace of mind and resilience against life changes.',
      ],
      biggestConcern: 'Budgeting $1,200/year for proactive preventative vehicle maintenance so the Civic remains reliable.',
      missingInformation: 'None — the financial math decisively favors preserving capital.',
      confidenceLevel: 'High',
      confidenceReason: 'High confidence because the opportunity cost of $42,000 in compounding investments dwarfs the incremental utility of a new commuter car.',
      whyNotOptions: {
        opt1: 'Buying the new EV lost due to $30k debt, heavy depreciation, and minimal fuel savings on a 15-mile commute.',
        opt3: 'Used hybrid lost because the existing Civic is already fully paid off and reliable.',
      },
      reversalConditions: [
        'If the Civic suffers catastrophic engine failure with repair costs exceeding the vehicle value ($6k+).',
        'If daily commute increases to 75+ miles where gas savings become substantial.',
      ],
      opportunityCosts: {
        opt1: 'Forfeiting $42,000+ in compounding stock investments over 5 years.',
        opt2: 'Giving up latest active safety features and instant electric torque.',
      },
    },
    createdAt: '2026-08-11T16:00:00.000Z',
    updatedAt: '2026-08-14T10:00:00.000Z',
    status: 'analyzed',
  },

  // 4. LIFESTYLE & RELOCATION DECISION
  {
    id: 'sample_lifestyle',
    title: 'Relocate to London for International Career Chapter vs. Stay in Current City Near Family',
    originalPrompt: 'Should I accept a 2-year transfer opportunity to our company’s London headquarters (20% higher living cost, global networking, European travel) or stay in my current city where I have an affordable apartment and close family support?',
    category: 'Lifestyle',
    reversibility: 'Somewhat reversible',
    timeHorizon: '1–2 years',
    userPriorities: ['Personal Growth & Adventure', 'Family & Relationship Proximity', 'Career Trajectory', 'Cost of Living & Savings', 'Long-term Life Memories'],
    options: [
      {
        id: 'opt1',
        title: 'Relocate to London HQ (2-Year Term)',
        description: 'Accept the 2-year international transfer on a Global Mobility visa with relocation package, living in central London and traveling across Europe.',
        source: 'user',
      },
      {
        id: 'opt2',
        title: 'Remain in Current City Near Family',
        description: 'Stay in current city with $1,400/mo rent, weekly family dinners, established social circles, and steady local career progression.',
        source: 'user',
      },
      {
        id: 'opt3',
        title: 'Negotiate 3-Month Summer London Secondment',
        description: 'Propose a temporary 90-day extended assignment in London to test the lifestyle and build HQ relationships without fully moving.',
        source: 'user',
      },
    ],
    clarificationState: {
      decisionSummary: 'Deciding whether to take a career-defining 2-year international relocation to London or preserve family closeness, low living costs, and community stability.',
      optionsUnderstood: ['Move to London', 'Stay Near Family', '3-Month Summer Secondment'],
      keyConstraints: ['Company covers initial relocation flight and 1 month temporary housing', 'Visa requires 24-month commitment to sponsor'],
      assumptionsIdentified: ['London rent will consume ~40% of net income', 'Family relationships can be maintained via regular video calls and bi-annual visits'],
      missingInfo: ['Exact post-tax UK salary band adjustments'],
      confirmedByUser: true,
    },
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'Are there elderly family members who depend on your physical day-to-day presence right now?',
        suggestedAnswers: ['No, family is independent and supportive', 'Yes, caretaking responsibilities exist', 'Somewhat'],
        userAnswer: 'No, family is independent and supportive',
        whyItMatters: 'Removes the primary emotional barrier to taking an international leap.',
      },
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Unforgettable life adventure, international perspective, and European travel', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Direct visibility with global leadership team at international HQ', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Developing deep self-reliance and global adaptability', weight: 'medium', source: 'AI SUGGESTED' },
        ],
        cons: [
          { text: 'Significantly higher rent and lower monthly savings rate', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Distance from core family routines and lifelong friends', weight: 'high', source: 'USER PROVIDED' },
        ],
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'Deep emotional fulfillment from regular family dinners and lifelong community', weight: 'high', source: 'USER PROVIDED' },
          { text: 'High monthly savings rate due to affordable rent ($1,400/mo)', weight: 'high', source: 'USER PROVIDED' },
        ],
        cons: [
          { text: 'Potential long-term regret of "what if I had experienced living abroad?"', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Slower visibility for executive promotions tied to HQ decision makers', weight: 'medium', source: 'AI SUGGESTED' },
        ],
      },
    ],
    comparison: [
      { criterion: 'Life Experience & Adventure', scores: { opt1: 'Transformative', opt2: 'Familiar & Stable', opt3: 'Exciting Trial' }, winnerOptionId: 'opt1' },
      { criterion: 'Family Connection', scores: { opt1: 'Remote (Daily calls)', opt2: 'Physical (Weekly visits)', opt3: 'Short Absence' }, winnerOptionId: 'opt2' },
      { criterion: 'Financial Savings Rate', scores: { opt1: 'Moderate (~$600/mo)', opt2: 'High (~$1,500/mo)', opt3: 'High' }, winnerOptionId: 'opt2' },
    ],
    swot: [
      {
        optionId: 'opt1',
        strengths: ['Global network', 'Rare life chapter', 'Resume prestige'],
        weaknesses: ['Higher living costs', 'Navigating UK bureaucracy'],
        opportunities: ['Permanent European residency pathways', 'Transitioning to global VP roles'],
        threats: ['Initial bouts of homesickness during winter months'],
      },
    ],
    criteria: [
      { id: 'crit1', name: 'Personal Growth & Adventure', weight: 30, description: 'Creating memorable life chapters and cultural broadening.' },
      { id: 'crit2', name: 'Career Visibility & Trajectory', weight: 25, description: 'Proximity to executive HQ and international scope.' },
      { id: 'crit3', name: 'Family & Relationship Health', weight: 25, description: 'Maintaining strong bonds with family.' },
      { id: 'crit4', name: 'Cost of Living & Net Savings', weight: 20, description: 'Preserving financial momentum and savings.' },
    ],
    weightedScores: {
      opt1: { crit1: 10, crit2: 9, crit3: 5, crit4: 5 },
      opt2: { crit1: 4, crit2: 5, crit3: 10, crit4: 9 },
      opt3: { crit1: 8, crit2: 7, crit3: 8, crit4: 7 },
    },
    risks: [
      {
        id: 'r1',
        optionId: 'opt1',
        risk: 'Loneliness during initial 90 days in London before establishing social circles',
        probability: 'High',
        impact: 'Medium',
        mitigation: 'Join expat professional groups, local sports clubs, and budget for a trip home at month 4.',
      },
    ],
    scenarios: [
      {
        optionId: 'opt1',
        shortTerm: 'Months 1–6: Finding flat, navigating tube commutes, exploring European weekend flights, settling in.',
        longTerm: 'Years 1–2: Established global professional network, fluency in international business, return or extend.',
        keyTurningPoint: 'First solo international trip in Europe.',
      },
    ],
    thinkDeeper: {
      assumptions: ['Assuming the window to relocate easily narrows as family or mortgage commitments grow in future years.'],
      missingInformation: ['Exact tax equalization policy from employer HR.'],
      biases: ['Regret Minimization: Looking back from age 75, which choice will you be proud you made?'],
      blindspotQuestions: ['Is your hesitation driven by genuine logistical concerns or fear of the unknown?'],
      questionsToAskOthers: ['Ask colleagues who completed overseas transfers: "What was the hardest adjustment in year 1?"'],
      researchItems: ['Research neighborhood rental prices in Zone 2 London (Islington, Clapham, Bermondsey).'],
    },
    recommendation: {
      recommendedOptionId: 'opt1',
      recommendedOptionTitle: 'Relocate to London HQ for the 2-Year International Chapter',
      mainReasons: [
        'A defined 2-year international transfer is one of the highest-growth chapters a young professional can experience.',
        'With supportive, independent family, this life window offers maximum mobility before future mortgage or caretaking obligations arise.',
        'The temporary 2-year boundary ensures that returning home is always an easy, celebrated option.',
      ],
      biggestConcern: 'Budgeting strictly for London housing and scheduling structured weekly video calls with family.',
      missingInformation: 'Written confirmation of the relocation flight and temporary accommodation package.',
      confidenceLevel: 'High',
      confidenceReason: 'High confidence because the long-term regret of declining an international chapter is vastly greater than the manageable short-term adjustment friction.',
      whyNotOptions: {
        opt2: 'Staying lost because it trades a rare international life opportunity for routine comfort.',
        opt3: '3-month secondment lost because 90 days is too brief to build deep local roots or full global integration.',
      },
      reversalConditions: [
        'If a family member develops a serious health condition requiring immediate caretaking.',
        'If company cancels relocation allowance and imposes severe wage reduction.',
      ],
      opportunityCosts: {
        opt1: 'Sacrificing 2 years of weekly in-person family dinners and lower rent.',
        opt2: 'Missing out on an unforgettable international adventure and global HQ leadership network.',
      },
    },
    createdAt: '2026-08-10T09:30:00.000Z',
    updatedAt: '2026-08-13T12:00:00.000Z',
    status: 'analyzed',
  },

  // 5. PERSONAL OPPORTUNITY DECISION
  {
    id: 'sample_personal',
    title: 'Commit to Launching Full-Time Consulting Practice vs. Keep Building as an Evening Side Project',
    originalPrompt: 'I have 3 paying client retainers ($6,200/mo total) on my consulting side business. Should I quit my day job ($95k salary) to go 100% full-time into consulting, or keep running it on evenings and weekends for another 6 months?',
    category: 'Personal',
    reversibility: 'Somewhat reversible',
    timeHorizon: '1–2 years',
    userPriorities: ['Income Security & Runway', 'Time Autonomy & Freedom', 'Business Growth Potential', 'Stress & Energy Management', 'Personal Fulfillment'],
    options: [
      {
        id: 'opt1',
        title: 'Go Full-Time Into Consulting Practice Immediately',
        description: 'Resign from day job, devote 40+ hours/week to client acquisition and service delivery, aiming to scale from $6.2k/mo to $15k/mo within 6 months.',
        source: 'user',
      },
      {
        id: 'opt2',
        title: 'Maintain Day Job + Side Business for 6 More Months',
        description: 'Keep $95k salary and benefits while servicing the 3 clients on evenings/weekends, saving 100% of consulting revenue into a business runway reserve.',
        source: 'user',
      },
      {
        id: 'opt3',
        title: 'Negotiate 4-Day Workweek (32 hrs) at Current Day Job',
        description: 'Request an 80% salary adjustment ($76k) with Mondays off to dedicate 1 full weekday to consulting clients with reduced burnout.',
        source: 'user',
      },
    ],
    clarificationState: {
      decisionSummary: 'Evaluating whether to jump full-time into an early consulting business with $6.2k MRR or build a larger cash runway while working both jobs.',
      optionsUnderstood: ['Go Full-Time Now', 'Dual Job for 6 Months', 'Negotiate 4-Day Workweek'],
      keyConstraints: ['Personal monthly living expenses: $4,200/mo', 'Current emergency savings: $22,000 (5 months living expenses)'],
      assumptionsIdentified: ['Current 3 client retainers will remain active for at least 3–6 months', 'Client acquisition requires daytime availability for sales calls'],
      missingInfo: ['Client contract terms (month-to-month vs 6-month commitments)'],
      confirmedByUser: true,
    },
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'Are your current client retainers locked into multi-month agreements?',
        suggestedAnswers: ['Yes, 6-month signed contracts', '3-month minimum terms', 'Month-to-month verbal agreements'],
        userAnswer: '3-month minimum signed agreements',
        whyItMatters: 'Guarantees $18k+ in baseline revenue during your first quarter of full-time operation.',
      },
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Unlocks 100% focus and daytime availability for high-ticket client sales calls', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Immediate relief from 60+ hour dual-workweek exhaustion and split attention', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Existing $6.2k/mo exceeds $4.2k living expenses from day one', weight: 'high', source: 'AI SUGGESTED' },
        ],
        cons: [
          { text: 'Loss of employer-sponsored healthcare and 401(k) match', weight: 'medium', source: 'AI SUGGESTED' },
          { text: 'Revenue volatility if a client churns unexpectedly', weight: 'medium', source: 'USER PROVIDED' },
        ],
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'Extreme financial accumulation: dual income generates $14k+/month', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Zero risk of depleting personal emergency savings', weight: 'high', source: 'AI SUGGESTED' },
        ],
        cons: [
          { text: 'High risk of burnout and poor service delivery to clients due to lack of time', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Cannot take daytime client calls without sneaking around day job', weight: 'high', source: 'USER PROVIDED' },
        ],
      },
    ],
    comparison: [
      { criterion: 'Growth Velocity', scores: { opt1: 'High (Dedicated)', opt2: 'Constrained by Day Job', opt3: 'Moderate' }, winnerOptionId: 'opt1' },
      { criterion: 'Burnout & Energy Risk', scores: { opt1: 'Low-Moderate (One focus)', opt2: 'High (65 hrs/wk)', opt3: 'Moderate' }, winnerOptionId: 'opt1' },
      { criterion: 'Safety Buffer', scores: { opt1: '5 Mo + $6.2k/mo MRR', opt2: 'Dual Income ($14k/mo)', opt3: 'Salary + Retainers' }, winnerOptionId: 'opt2' },
    ],
    swot: [
      {
        optionId: 'opt1',
        strengths: ['Cash flow positive on day one ($6.2k revenue vs $4.2k expenses)', '5 months emergency cash reserves', 'Validated client demand'],
        weaknesses: ['Need to secure private health insurance'],
        opportunities: ['Scaling to $20k/month by landing 2 additional retainer clients', 'Building proprietary consulting frameworks'],
        threats: ['Single client churn reducing initial monthly surplus'],
      },
    ],
    criteria: [
      { id: 'crit1', name: 'Business Scaling & Autonomy', weight: 35, description: 'Ability to dedicate full creative energy and daytime sales focus.' },
      { id: 'crit2', name: 'Mental Energy & Burnout Prevention', weight: 25, description: 'Protecting health and personal well-being.' },
      { id: 'crit3', name: 'Financial Runway & Safety', weight: 25, description: 'Covering living costs without stress.' },
      { id: 'crit4', name: 'Long-term Earnings Ceiling', weight: 15, description: 'Building an uncapped professional practice.' },
    ],
    weightedScores: {
      opt1: { crit1: 10, crit2: 8, crit3: 7, crit4: 9 },
      opt2: { crit1: 4, crit2: 3, crit3: 10, crit4: 6 },
      opt3: { crit1: 7, crit2: 7, crit3: 8, crit4: 8 },
    },
    risks: [
      {
        id: 'r1',
        optionId: 'opt1',
        risk: 'One of the 3 clients terminates after month 3, dropping monthly revenue to $4,100',
        probability: 'Medium',
        impact: 'Medium',
        mitigation: 'Implement weekly outbound outreach to sign a 4th pipeline client before current contract renewals.',
      },
    ],
    scenarios: [
      {
        optionId: 'opt1',
        shortTerm: 'Months 1–3: Seamless transition, onboarding 4th client, daytime office hours, high energy.',
        longTerm: 'Years 1–2: Thriving 6-figure boutique consultancy with select premium clients and full calendar autonomy.',
        keyTurningPoint: 'Closing the first $5k/month retainer as a full-time founder.',
      },
    ],
    thinkDeeper: {
      assumptions: ['Assuming client acquisition is significantly easier when you can take calls during standard business hours.'],
      missingInformation: ['Exact monthly cost for individual health insurance plan in your state.'],
      biases: ['Security Theater: Believing a day job is 100% secure when corporate layoffs happen regularly.'],
      blindspotQuestions: ['If you wait 6 more months, will you just find another reason to postpone?'],
      questionsToAskOthers: ['Ask full-time consultants: "What was your revenue run rate when you finally gave notice?"'],
      researchItems: ['Price private ACA healthcare options to account for $350–$500/mo in health costs.'],
    },
    recommendation: {
      recommendedOptionId: 'opt1',
      recommendedOptionTitle: 'Take the Leap: Go Full-Time Into Your Consulting Practice',
      mainReasons: [
        'You have already achieved what 95% of aspiring entrepreneurs struggle with: validated market demand and $6,200/mo in signed retainers.',
        'Your monthly retainers exceed your personal living expenses ($4,200) by $2,000/mo before touching your $22,000 emergency savings.',
        'Splitting your energy across dual jobs is now the biggest bottleneck preventing you from scaling to $15k–$20k/month.',
      ],
      biggestConcern: 'Acquiring your 4th retainer client within the first 60 days to diversify revenue concentration.',
      missingInformation: 'Enrollment in a reliable private health insurance plan.',
      confidenceLevel: 'High',
      confidenceReason: 'High confidence because validated cash-flow positive unit economics plus a 5-month emergency fund represents a textbook low-risk entrepreneurial transition.',
      whyNotOptions: {
        opt2: 'Dual jobs lost due to severe burnout, split attention, and inability to take daytime client calls.',
        opt3: '4-day week lost because the day job still consumes mental bandwidth during peak business hours.',
      },
      reversalConditions: [
        'If 2 clients churn simultaneously before your resignation date.',
        'If personal emergency reserves drop below 3 months of basic living expenses.',
      ],
      opportunityCosts: {
        opt1: 'Giving up guaranteed corporate paycheck and company benefits.',
        opt2: 'Stifling consulting growth by remaining trapped in a 65-hour dual-job hamster wheel.',
      },
    },
    createdAt: '2026-08-09T14:00:00.000Z',
    updatedAt: '2026-08-14T16:00:00.000Z',
    status: 'analyzed',
  },
];
