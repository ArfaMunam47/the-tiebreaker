import { DecisionAnalysis } from '../types';

export const SAMPLE_DECISIONS: DecisionAnalysis[] = [
  {
    id: 'sample_1',
    title: 'Remote Startup Offer vs. University Degree Completion',
    originalPrompt: 'Should I accept an exciting $75k remote startup engineering offer or focus full-time on completing my computer science degree?',
    userPriorities: ['Career Growth', 'Financial Independence', 'Learning & Mastery', 'Flexibility'],
    options: [
      {
        id: 'opt1',
        title: 'Accept Remote Startup Offer',
        description: 'Join a fast-growing YC-backed startup as a remote engineer ($75k salary + equity), deferring university by 1-2 years.'
      },
      {
        id: 'opt2',
        title: 'Stay Full-Time in University',
        description: 'Focus entirely on finishing the remaining 3 semesters of CS degree while doing summer internships.'
      },
      {
        id: 'opt3',
        title: 'Negotiate Part-Time Student Status',
        description: 'Work 25 hours/week for the startup at adjusted pay ($50k) while taking 2 evening/online university courses.'
      }
    ],
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'Does your university allow formal leaves of absence or deferrals without losing credits?',
        suggestedAnswers: ['Yes, up to 2 years permitted', 'No, credits expire', 'Need to check with dean']
      },
      {
        id: 'q2',
        question: 'How critical is immediate income to your living situation right now?',
        suggestedAnswers: ['Crucial (self-funding)', 'Helpful but not urgent', 'Not urgent (family supported)']
      }
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Immediate $75k/year financial independence & startup equity', weight: 'high', details: 'Zero student debt accumulation.' },
          { text: 'Accelerated real-world production codebase mastery', weight: 'high', details: 'Ship code used by real customers daily.' },
          { text: 'Strong remote work flexibility and industry network', weight: 'medium' }
        ],
        cons: [
          { text: 'Delayed degree completion by 1 to 2 years', weight: 'high', details: 'May restrict certain corporate or visa pathways.' },
          { text: 'High startup volatility and potential workload pressure', weight: 'medium' }
        ]
      },
      {
        optionId: 'opt2',
        pros: [
          { text: 'Guaranteed completion of accredited CS degree', weight: 'high' },
          { text: 'Unstructured time for university research, campus life, & internships', weight: 'medium' },
          { text: 'Low burnout risk compared to full-time work + school', weight: 'medium' }
        ],
        cons: [
          { text: 'Forfeiting $75k income and startup equity', weight: 'high' },
          { text: 'Theoretical coursework may lag behind modern AI engineering tools', weight: 'medium' }
        ]
      },
      {
        optionId: 'opt3',
        pros: [
          { text: 'Balanced path: earn $50k while keeping degree momentum', weight: 'high' },
          { text: 'Keeps both options open with minimal long-term regret', weight: 'medium' }
        ],
        cons: [
          { text: 'Extremely intense schedule with high risk of cognitive overload', weight: 'high' },
          { text: 'Requires firm discipline and startup boundary negotiation', weight: 'medium' }
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
      confidenceLevel: 'High'
    },
    createdAt: '2026-08-10T14:30:00.000Z',
    updatedAt: '2026-08-12T10:15:00.000Z',
    status: 'analyzed'
  },
  {
    id: 'sample_2',
    title: 'Buy First Home vs. Continue Renting & Investing',
    originalPrompt: 'Should we buy a $550,000 suburban townhouse with 20% down, or continue renting in the city at $2,600/month and investing savings into index funds?',
    userPriorities: ['Financial Wealth Building', 'Family Stability', 'Flexibility & Mobility', 'Peace of Mind'],
    options: [
      {
        id: 'opt1',
        title: 'Buy Suburban Townhouse ($550k)',
        description: 'Put $110,000 down on a 3-bedroom suburban townhouse with $3,400 total monthly mortgage, HOA, taxes, and insurance.'
      },
      {
        id: 'opt2',
        title: 'Rent City Apartment & Invest Delta',
        description: 'Stay in city rental ($2,600/mo) and dollar-cost average $110k plus $800/mo surplus directly into broad-market index funds.'
      }
    ],
    clarifyingQuestions: [
      {
        id: 'q1',
        question: 'How long do you realistically plan to stay in this location?',
        suggestedAnswers: ['3 years or less', '5 to 7 years', '10+ years']
      }
    ],
    prosCons: [
      {
        optionId: 'opt1',
        pros: [
          { text: 'Fixed mortgage principal payments build forced equity over time', weight: 'high' },
          { text: 'Long-term stability, personal customization, and space for family', weight: 'high' }
        ],
        cons: [
          { text: 'Illiquid asset with maintenance expenses (1-2%/yr) and HOA fees', weight: 'high' },
          { text: 'Higher upfront lock-in and reduced mobility if career demands move', weight: 'medium' }
        ]
      },
      {
        optionId: 'opt2',
        pros: [
          { text: '100% liquid portfolio in index funds with zero maintenance stress', weight: 'high' },
          { text: 'High geographic flexibility to move for job opportunities', weight: 'medium' }
        ],
        cons: [
          { text: 'Rent increases over time with zero asset accumulation from rent paid', weight: 'high' },
          { text: 'Less space and risk of landlord non-renewal', weight: 'medium' }
        ]
      }
    ],
    comparison: [
      { criterion: 'Monthly Outflow', scores: { opt1: '$3,400 + Maintenance', opt2: '$2,600 Rent' }, winnerOptionId: 'opt2' },
      { criterion: '10-Year Equity Horizon', scores: { opt1: 'Home Equity (~$240k)', opt2: 'Index Fund (~$290k)' }, winnerOptionId: 'opt2' },
      { criterion: 'Living Space & Freedom', scores: { opt1: '3 Beds + Yard + Garage', opt2: '2 Beds City Apt' }, winnerOptionId: 'opt1' }
    ],
    swot: [
      {
        optionId: 'opt1',
        strengths: ['Hedge against inflation', 'Emotional security of ownership'],
        weaknesses: ['High upfront closing costs ($15k)', 'Property tax spikes'],
        opportunities: ['Refinancing when interest rates drop', 'Suburban appreciation'],
        threats: ['Local real estate market stagnation or HOA special assessments']
      },
      {
        optionId: 'opt2',
        strengths: ['Maximum liquidity', 'Zero unexpected repair bills'],
        weaknesses: ['Vulnerable to landlord decisions', 'No leverage benefit'],
        opportunities: ['Ability to move instantly for 30%+ salary jumps'],
        threats: ['Discipline slippage in investing the monthly rent differential']
      }
    ],
    criteria: [
      { id: 'crit1', name: 'Financial Wealth Building', weight: 35, description: 'Net worth accumulation over a 7-10 year horizon.' },
      { id: 'crit2', name: 'Living Space & Stability', weight: 30, description: 'Space for lifestyle, pets, or family expansion.' },
      { id: 'crit3', name: 'Flexibility & Mobility', weight: 20, description: 'Ease of moving without selling costs.' },
      { id: 'crit4', name: 'Peace of Mind & Low Stress', weight: 15, description: 'Predictability and absence of landlord/repair worries.' }
    ],
    weightedScores: {
      opt1: { crit1: 7, crit2: 9, crit3: 4, crit4: 7 },
      opt2: { crit1: 8, crit2: 5, crit3: 9, crit4: 8 }
    },
    risks: [
      {
        id: 'r1',
        optionId: 'opt1',
        risk: 'Roof or HVAC replacement ($12k) required within 24 months',
        probability: 'Medium',
        impact: 'High',
        mitigation: 'Maintain a $20,000 liquid home emergency fund separate from down payment.'
      }
    ],
    scenarios: [
      {
        optionId: 'opt1',
        shortTerm: 'Months 1-12: Moving logistics, furnishing townhouse, settling into suburban routine.',
        longTerm: 'Years 5-10: Paid down $75k principal, home appreciated 25%, low monthly cost relative to future rents.'
      },
      {
        optionId: 'opt2',
        shortTerm: 'Months 1-12: Seamless urban lifestyle, automated monthly $800 transfers to brokerage.',
        longTerm: 'Years 5-10: Liquid investment portfolio grown to $250k+, but city rent rose to $3,300/mo.'
      }
    ],
    thinkDeeper: {
      assumptions: [
        'Assuming a 7% average stock market return vs 4% real estate appreciation rate.',
        'Assuming you will religiously invest the $800/mo difference when renting.'
      ],
      missingInformation: [
        'Current HOA reserve fund health and historic property tax increases for the townhouse.',
        'Exact commute times from suburban location to work.'
      ],
      biases: [
        'American Dream Bias: Assuming homeownership is universally superior to renting.',
        'Loss Aversion: Overestimating the stress of home repairs compared to rent hikes.'
      ],
      blindspotQuestions: [
        'If you need to move in 3 years, selling costs (6% realtor fees) will eat $33,000. Is a 5+ year stay guaranteed?'
      ],
      questionsToAskOthers: [
        'Ask existing townhouse HOA residents: "Are there any pending special assessments?"'
      ],
      researchItems: [
        'Run a detailed rent-vs-buy calculator incorporating local property tax and interest rates.'
      ]
    },
    recommendation: {
      recommendedOptionId: 'opt1',
      recommendedOptionTitle: 'Buy Suburban Townhouse (If Horizon > 5 Years)',
      mainReasons: [
        'If planning to stay at least 5-7 years, equity buildup and space for family outweigh city rent flexibility.',
        'Suburban space directly supports personal life goals.'
      ],
      biggestConcern: 'Ensuring liquid emergency buffer remains intact post-closing.',
      missingInformation: 'HOA reserve fund review and commute trial run.',
      confidenceLevel: 'High'
    },
    createdAt: '2026-08-01T11:00:00.000Z',
    updatedAt: '2026-08-05T09:20:00.000Z',
    status: 'analyzed'
  }
];
