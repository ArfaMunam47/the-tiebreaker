import { DecisionAnalysis } from '../types';

export const SAMPLE_DECISIONS: DecisionAnalysis[] = [
  {
    id: 'sample_1',
    title: 'Remote Startup Offer vs. University Degree Completion',
    originalPrompt: 'Should I accept an exciting $75k remote startup engineering offer or focus full-time on completing my computer science degree?',
    category: 'Career',
    reversibility: 'Somewhat reversible',
    timeHorizon: '1 year',
    userPriorities: ['Career Growth', 'Financial Independence', 'Learning & Mastery', 'Flexibility'],
    options: [
      {
        id: 'opt1',
        title: 'Accept Remote Startup Offer',
        description: 'Join a fast-growing YC-backed startup as a remote engineer ($75k salary + equity), deferring university by 1-2 years.',
        source: 'user',
      },
      {
        id: 'opt2',
        title: 'Stay Full-Time in University',
        description: 'Focus entirely on finishing the remaining 3 semesters of CS degree while doing summer internships.',
        source: 'user',
      },
      {
        id: 'opt3',
        title: 'Negotiate Part-Time Student Status',
        description: 'Work 25 hours/week for the startup at adjusted pay ($50k) while taking 2 evening/online university courses.',
        source: 'user',
      }
    ],
    clarificationState: {
      decisionSummary: 'Choosing between immediate $75k remote startup role and completing final 3 semesters of CS degree.',
      optionsUnderstood: ['Accept Startup Offer', 'Finish Degree', 'Part-time Study + Work'],
      keyConstraints: ['University credit expiration rules', 'Immediate financial independence need', 'Workload limits'],
      assumptionsIdentified: ['Startup will provide 18+ months of stability', 'Degree can be deferred up to 2 years'],
      missingInfo: ['Formal written leave-of-absence approval from university dean'],
      confirmedByUser: true,
    },
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'Does your university allow formal leaves of absence or deferrals without losing credits?',
        suggestedAnswers: ['Yes, up to 2 years permitted', 'No, credits expire', 'Need to check with dean'],
        whyItMatters: 'Determines whether accepting the job permanently destroys degree progress.'
      },
      {
        id: 'q2',
        question: 'How critical is immediate income to your living situation right now?',
        suggestedAnswers: ['Crucial (self-funding)', 'Helpful but not urgent', 'Not urgent (family supported)'],
        whyItMatters: 'Weights financial independence relative to academic timing.'
      }
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Immediate $75k/year financial independence & startup equity', weight: 'high', details: 'Zero student debt accumulation.', source: 'AI SUGGESTED' },
          { text: 'Accelerated real-world production codebase mastery', weight: 'high', details: 'Ship code used by real customers daily.', source: 'AI SUGGESTED' },
          { text: 'Strong remote work flexibility and industry network', weight: 'medium', source: 'AI SUGGESTED' }
        ],
        cons: [
          { text: 'Delayed degree completion by 1 to 2 years', weight: 'high', details: 'May restrict certain corporate or visa pathways.', source: 'AI SUGGESTED' },
          { text: 'High startup volatility and potential workload pressure', weight: 'medium', source: 'AI SUGGESTED' }
        ]
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'Guaranteed completion of accredited CS degree', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Unstructured time for university research, campus life, & internships', weight: 'medium', source: 'AI SUGGESTED' },
          { text: 'Low burnout risk compared to full-time work + school', weight: 'medium', source: 'AI SUGGESTED' }
        ],
        cons: [
          { text: 'Forfeiting $75k income and startup equity', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Theoretical coursework may lag behind modern AI engineering tools', weight: 'medium', source: 'AI SUGGESTED' }
        ]
      },
      {
        optionId: 'opt3',
        pros: [
          { text: 'Balanced path: earn $50k while keeping degree momentum', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Keeps both options open with minimal long-term regret', weight: 'medium', source: 'AI SUGGESTED' }
        ],
        cons: [
          { text: 'Extremely intense schedule with high risk of cognitive overload', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Requires firm discipline and startup boundary negotiation', weight: 'medium', source: 'AI SUGGESTED' }
        ]
      }
    ],
    comparison: [
      { criterion: 'Immediate Income', scores: { opt1: '$75k/year + Equity', opt2: '$0 (Tuition expense)', opt3: '$50k/year' }, winnerOptionId: 'opt1' },
      { criterion: 'Degree Completion Speed', scores: { opt1: 'Delayed 2 Years', opt2: 'On-time (1.5 Yrs)', opt3: 'Slight delay (2 Yrs)' }, winnerOptionId: 'opt2' },
      { criterion: 'Industry Experience', scores: { opt1: 'Full-time Production', opt2: 'Summer Internships', opt3: 'Part-time Production' }, winnerOptionId: 'opt1' },
      { criterion: 'Burnout & Health Risk', scores: { opt1: 'Moderate', opt2: 'Low', opt3: 'High' }, winnerOptionId: 'opt2' }
    ],
    swot: [
      {
        optionId: 'opt1',
        strengths: ['High practical skill accumulation', 'Financial autonomy'],
        weaknesses: ['Lacks formal credential', 'Time management pressure'],
        opportunities: ['Potential early startup payout', 'Senior title progression'],
        threats: ['Startup shutdown or layoff within 12 months']
      },
      {
        optionId: 'opt2',
        strengths: ['Clear accredited benchmark', 'Established campus ecosystem'],
        weaknesses: ['Financial strain', 'Opportunity cost'],
        opportunities: ['Top-tier summer internships', 'Graduate study pathways'],
        threats: ['Graduating into a shifting entry-level hiring market']
      },
      {
        optionId: 'opt3',
        strengths: ['Pragmatic compromise', 'Steady income + steady credits'],
        weaknesses: ['Constant context switching'],
        opportunities: ['Mastering high-efficiency time management'],
        threats: ['Underperforming in both job and exams due to exhaustion']
      }
    ],
    criteria: [
      { id: 'crit1', name: 'Career Advancement & Mastery', weight: 30, description: 'Speed of gaining real-world engineering impact.' },
      { id: 'crit2', name: 'Financial Benefit', weight: 25, description: 'Net earnings and equity upside.' },
      { id: 'crit3', name: 'Degree & Credential Safety', weight: 20, description: 'Long-term security of formal qualification.' },
      { id: 'crit4', name: 'Work-Life Balance & Health', weight: 15, description: 'Manageable stress and energy levels.' },
      { id: 'crit5', name: 'Flexibility & Autonomy', weight: 10, description: 'Location freedom and scheduling.' }
    ],
    weightedScores: {
      opt1: { crit1: 9, crit2: 9, crit3: 5, crit4: 6, crit5: 9 },
      opt2: { crit1: 6, crit2: 3, crit3: 10, crit4: 8, crit5: 5 },
      opt3: { crit1: 8, crit2: 7, crit3: 8, crit4: 4, crit5: 7 }
    },
    evidenceItems: [
      { id: 'e1', text: 'Startup offers $75,000 base salary plus equity.', category: 'FACT' },
      { id: 'e2', text: 'University allows up to 2 years of formal leave.', category: 'FACT' },
      { id: 'e3', text: 'Production engineering experience boosts future hiring faster than GPA.', category: 'INTERPRETATION' },
      { id: 'e4', text: 'The startup will achieve Series A funding in 12 months.', category: 'ASSUMPTION' }
    ],
    assumptionsList: [
      { id: 'a1', text: 'Degree can be paused for 12 months without losing completed credits.', status: 'confirmed' },
      { id: 'a2', text: 'Startup workload allows remote work flexibility.', status: 'confirmed' }
    ],
    aiSuggestedAlternatives: [
      {
        id: 'alt1',
        title: '6-Month Internship Contract',
        description: 'Negotiate a fixed 6-month co-op or internship contract with the startup to test the role before taking a long-term leave.',
        reasoning: 'Reduces commitment risk while still securing practical experience and initial income.'
      }
    ],
    risks: [
      {
        id: 'r1',
        optionId: 'opt1',
        risk: 'Startup runs out of runway in 9 months leaving you without degree or job',
        probability: 'Medium',
        impact: 'High',
        mitigation: 'Inquire about current cash runway (at least 18 months) and preserve university re-entry standing.'
      },
      {
        id: 'r2',
        optionId: 'opt3',
        risk: 'Exam week crunch causes severe stress and deadline slips at work',
        probability: 'High',
        impact: 'Medium',
        mitigation: 'Establish written agreement for time-off during university final exams.'
      }
    ],
    scenarios: [
      {
        optionId: 'opt1',
        shortTerm: 'Months 1-6: Rapid onboarding, shipping features, financial relief, slight FOMO on campus events.',
        longTerm: 'Years 1-3: Promoted to Mid/Senior Engineer, $110k+ salary, finish remaining courses online part-time.',
        keyTurningPoint: 'Startup Series A funding milestone'
      },
      {
        optionId: 'opt2',
        shortTerm: 'Months 1-6: Focus on algorithms coursework, campus networking, applying for competitive internships.',
        longTerm: 'Years 1-3: Graduate on time, enter market as new grad with solid academic foundation.',
        keyTurningPoint: 'Senior Capstone project presentation'
      }
    ],
    caseScenarios: [
      {
        optionId: 'opt1',
        bestCase: 'Startup thrives; gain $100k+ compensation, stock value explodes, return to finish degree at leisure.',
        expectedCase: 'Gain 18 months of solid production engineering experience; transition smoothly to mid-level engineering.',
        worstCase: 'Startup fails at month 8; use formal leave to re-enter university seamlessly.'
      },
      {
        optionId: 'opt2',
        bestCase: 'Graduate with honors; land top-tier $120k tech company offer upon graduation.',
        expectedCase: 'Finish degree comfortably; secure standard $80k software developer position.',
        worstCase: 'Entry-level job market remains tight; struggle to stand out without real codebase experience.'
      }
    ],
    longTermImpacts: [
      {
        optionId: 'opt1',
        financialImpact: '$75k+ immediate earnings; early retirement compounding.',
        careerImpact: 'Accelerated promotion to Mid/Senior Developer title.',
        timeImpact: 'Full-time work routine with high independence.',
        learningImpact: 'Modern tech stack, AI tooling, deployment pipelines.',
        opportunityCost: 'Forfeiting traditional campus social experiences.'
      },
      {
        optionId: 'opt2',
        financialImpact: 'Tuition outflow, zero immediate savings.',
        careerImpact: 'Traditional new-grad entry trajectory.',
        timeImpact: 'Flexible student schedule with seasonal exam surges.',
        learningImpact: 'Core CS algorithms, operating systems, data structures.',
        opportunityCost: 'Giving up $75k salary and early equity options.'
      }
    ],
    thinkDeeper: {
      assumptions: [
        'Assuming a CS degree is strictly necessary for long-term tech leadership (many top companies care more about GitHub & production history).',
        'Assuming the startup offer cannot be negotiated into a part-time or delayed start.'
      ],
      missingInformation: [
        'Exact university credit transfer / leave-of-absence rules.',
        'Current runway and engineering team structure of the startup.'
      ],
      biases: [
        'Status Quo Bias: Overvaluing traditional university progression because it is familiar.',
        'FOMO (Fear of Missing Out): Idealizing startup life without accounting for stress.'
      ],
      blindspotQuestions: [
        'If you accept the job and hate it after 6 months, can you seamlessly return to university?',
        'How would your parents/mentors react, and how much is their opinion influencing you?'
      ],
      questionsToAskOthers: [
        'Ask the startup CTO: "How do you handle team members who take evening university classes?"',
        'Ask an academic advisor: "What is the exact process to take a 1-year leave of absence?"'
      ],
      researchItems: [
        'Check university policy on maximum leaves of absence.',
        'Look up Crunchbase data for the startup and its lead investors.'
      ]
    },
    recommendation: {
      recommendedOptionId: 'opt1',
      recommendedOptionTitle: 'Accept Remote Startup Offer (with Leave of Absence)',
      mainReasons: [
        'Highest alignment with career growth, skill mastery, and financial independence priorities.',
        'Real-world software engineering experience is currently valued heavily over academic credentials in tech.'
      ],
      biggestConcern: 'Ensuring formal academic leave of absence is secured before signing offer.',
      missingInformation: 'Confirmation of startup financial runway and formal university leave approval.',
      confidenceLevel: 'High',
      confidenceReason: 'High confidence because real codebase experience and financial independence heavily outweigh delayed academic timing when formal leave is secured.',
      whyNotOptions: {
        opt2: 'Staying full-time in university lost because it offers zero immediate income and delays real-world production codebase mastery by 1.5 years.',
        opt3: 'Part-time student status lost due to extreme burnout and context-switching risk during exam weeks.'
      },
      reversalConditions: [
        'If university refuses formal leave of absence and threatens credit cancellation.',
        'If startup cash runway is under 6 months.'
      ],
      opportunityCosts: {
        opt1: 'Giving up traditional campus life and immediate graduation timeline.',
        opt2: 'Sacrificing $75,000 salary, equity, and senior title progression.'
      }
    },
    createdAt: '2026-08-10T14:30:00.000Z',
    updatedAt: '2026-08-12T10:15:00.000Z',
    status: 'analyzed'
  },
  {
    id: 'sample_2',
    title: 'Buy Suburban Home vs. Rent & Invest in Index Funds',
    originalPrompt: 'Should I buy a 4-bedroom suburban home for $650k with a 20% down payment or stay in my urban apartment rental ($2,800/mo) and invest the $130k down payment into S&P 500 index funds?',
    category: 'Finance',
    reversibility: 'Difficult to reverse',
    timeHorizon: '5+ years',
    userPriorities: ['Wealth Accumulation', 'Lifestyle Stability', 'Location Flexibility', 'Maintenance Stress'],
    options: [
      {
        id: 'opt1',
        title: 'Buy Suburban Home ($650k)',
        description: 'Purchase 4-bedroom suburban house with $130k down payment (20%), locking in fixed mortgage payments and acquiring physical property equity.'
      },
      {
        id: 'opt2',
        title: 'Rent Urban Apartment & Invest Capital',
        description: 'Continue renting downtown apartment at $2,800/mo, deploy $130k down payment into S&P 500 index funds, and invest monthly savings delta.'
      }
    ],
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'What is your planned holding period for the suburban home if purchased?',
        suggestedAnswers: ['3–5 years', '7–10 years', '15+ years'],
        userAnswer: '7–10 years'
      }
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Locked-in housing stability & freedom to customize property', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Leveraged real estate appreciation & long-term forced savings equity', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Spacious 4-bedroom layout suitable for growing family or home office', weight: 'medium', source: 'USER PROVIDED' }
        ],
        cons: [
          { text: 'High illiquid upfront capital ($130k down payment + closing fees)', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Property taxes, HOA fees, home insurance, & ongoing maintenance costs', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'Reduced job relocation flexibility', weight: 'medium', source: 'AI SUGGESTED' }
        ]
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'High liquidity: $130k grows compounded in broad-market equity index funds', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Zero landlord or structural maintenance responsibilities', weight: 'high', source: 'USER PROVIDED' },
          { text: 'Total mobility to move across cities/neighborhoods on 30-day notice', weight: 'medium', source: 'AI SUGGESTED' }
        ],
        cons: [
          { text: 'Exposure to rent increases upon lease renewals', weight: 'high', source: 'AI SUGGESTED' },
          { text: 'No tangible physical property equity or home customization freedom', weight: 'medium', source: 'USER PROVIDED' }
        ]
      }
    ],
    comparison: [
      { criterion: '10-Year Net Worth Potential', scores: { opt1: 'Moderate-High ($380k equity)', opt2: 'High ($490k liquidated portfolio)' }, winnerOptionId: 'opt2' },
      { criterion: 'Lifestyle Stability & Space', scores: { opt1: 'High (Spacious home & yard)', opt2: 'Moderate (850 sq ft apartment)' }, winnerOptionId: 'opt1' },
      { criterion: 'Financial Liquidity & Flexibility', scores: { opt1: 'Low (Tied up in physical real estate)', opt2: 'High (Liquid stock portfolio)' }, winnerOptionId: 'opt2' }
    ],
    swot: [
      {
        optionId: 'opt1',
        strengths: ['Physical asset security', 'Fixed mortgage payment baseline', 'Generous living space'],
        weaknesses: ['High illiquidity', 'Unpredictable repair costs ($5k-$15k HVAC/roof risks)'],
        opportunities: ['Neighborhood appreciation surge', 'Mortgage refinancing if interest rates drop'],
        threats: ['Local property tax rate hikes', 'Suburban housing market downturn']
      },
      {
        optionId: 'opt2',
        strengths: ['100% liquid investment portfolio', 'Frictionless mobility', 'Zero repair liabilities'],
        weaknesses: ['Rent inflation vulnerability', 'Less living space for hosting/family'],
        opportunities: ['Market dollar-cost averaging upside', 'Flexibility to move closer to career promotions'],
        threats: ['Stock market volatility during short-term drawdowns', 'Landlord non-renewal']
      }
    ],
    criteria: [
      { id: 'crit1', name: 'Wealth Accumulation', weight: 35, description: 'Total net worth growth over a 7-10 year timeline.' },
      { id: 'crit2', name: 'Lifestyle Stability', weight: 25, description: 'Living space quality, neighborhood comfort, and predictability.' },
      { id: 'crit3', name: 'Location Flexibility', weight: 20, description: 'Ease of changing locations for career or personal reasons.' },
      { id: 'crit4', name: 'Maintenance Stress', weight: 20, description: 'Mental bandwidth required for property upkeep and repairs.' }
    ],
    weightedScores: {
      opt1: { crit1: 7, crit2: 9, crit3: 4, crit4: 4 },
      opt2: { crit1: 9, crit2: 6, crit3: 9, crit4: 9 }
    },
    risks: [
      { id: 'r1', optionId: 'opt1', risk: 'Unanticipated structural repair costs (roof, plumbing, HVAC)', probability: 'High', impact: 'High', mitigation: 'Maintain a dedicated $20k liquid emergency home repair reserve.' },
      { id: 'r2', optionId: 'opt2', risk: 'Rent increases exceeding inflation over 5+ year period', probability: 'Medium', impact: 'Medium', mitigation: 'Negotiate 2-year lease terms or budget for neighborhood shifts.' }
    ],
    scenarios: [
      { optionId: 'opt1', shortTerm: 'Months 1-6: Initial move friction, buying lawn/maintenance equipment, adapting to commute.', longTerm: 'Years 1-7: Predictable housing costs, accumulating real estate equity.' },
      { optionId: 'opt2', shortTerm: 'Months 1-6: Seamless urban routine, index fund capital fully deployed.', longTerm: 'Years 1-7: Compounded investment account growth, maximum career mobility.' }
    ],
    thinkDeeper: {
      assumptions: [
        'Assuming S&P 500 returns average ~8% annually over 10 years.',
        'Assuming local real estate appreciates at historical average ~4% annually.'
      ],
      missingInformation: [
        'Exact HOA fees and local property tax rate for the target suburban neighborhood.',
        'Commute cost delta between urban apartment and suburban home.'
      ],
      biases: [
        'American Dream Ownership Bias: Viewing homeownership as inherently superior without factoring opportunity cost of capital.',
        'Recency Bias: Assuming stock market returns will consistently outperform without drawdowns.'
      ],
      blindspotQuestions: [
        'If you move in 4 years due to a job change, will closing costs and realtor commissions (6%) wipe out equity gains?',
        'How much do you value having a private yard versus walking to downtown amenities?'
      ],
      questionsToAskOthers: [
        'Ask a financial advisor: "How does buying vs. renting impact my total portfolio risk allocation?"',
        'Ask suburban neighbors: "What are your actual yearly maintenance and utility expenses?"'
      ],
      researchItems: [
        'Calculate net rent-vs-buy breakeven using local property tax rates and mortgage interest rates.',
        'Review historical suburban housing appreciation vs downtown rent growth over the past decade.'
      ]
    },
    recommendation: {
      recommendedOptionId: 'opt2',
      recommendedOptionTitle: 'Rent Urban Apartment & Invest Capital in Index Funds',
      mainReasons: [
        'Higher 10-year net worth projection due to liquid stock market compounding vs illiquid home equity after mortgage interest & property taxes.',
        'Maximum location flexibility and zero maintenance stress fit current career trajectory.'
      ],
      biggestConcern: 'Rent increases during market inflationary cycles.',
      missingInformation: 'Firm 10-year career trajectory confirmation regarding urban vs suburban location preference.',
      confidenceLevel: 'High',
      confidenceReason: 'High confidence because liquid portfolio compounding and career mobility outweigh the illiquid real estate leverage benefits over a 7-10 year horizon.',
      whyNotOptions: {
        opt1: 'Buying the suburban home lost primarily due to high illiquid capital lockup ($130k down payment), interest/tax drag, and ongoing maintenance responsibilities.'
      },
      reversalConditions: [
        'If mortgage rates drop below 4.5% making real estate leverage significantly cheaper.',
        'If family expansion creates an urgent need for 4 bedrooms and a private yard.'
      ],
      opportunityCosts: {
        opt1: 'Locking up $130k capital that could compound in liquid global equities.',
        opt2: 'Forfeiting physical home customization and long-term locked-in real estate asset equity.'
      }
    },
    createdAt: '2026-08-11T09:15:00.000Z',
    updatedAt: '2026-08-12T11:20:00.000Z',
    status: 'analyzed'
  }
];

