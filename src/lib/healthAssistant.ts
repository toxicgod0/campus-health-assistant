export type SymptomFormInput = {
  symptoms: string[];
  additionalDetails: string;
  duration: string;
  severity: string;
};

export type FirstAidFormInput = {
  problem: string;
  details: string;
};

const URGENT_KEYWORDS = [
  'chest pain',
  'trouble breathing',
  'difficulty breathing',
  'fainting',
  'seizure',
  'unconscious',
  'heavy bleeding',
  'suicidal',
];

const SOON_KEYWORDS = [
  'fever',
  'vomiting',
  'dehydration',
  'severe headache',
  'infection',
  'dizziness',
  'rash',
];

function getCombinedSymptomText(input: SymptomFormInput) {
  return `${input.symptoms.join(', ')} ${input.additionalDetails}`.toLowerCase();
}

export function buildSymptomGuidance(input: SymptomFormInput) {
  const combinedText = getCombinedSymptomText(input);
  const isUrgent =
    input.severity === 'severe' ||
    URGENT_KEYWORDS.some((keyword) => combinedText.includes(keyword));
  const needsSoonReview =
    !isUrgent &&
    (input.severity === 'moderate' ||
      input.duration === 'more-than-week' ||
      SOON_KEYWORDS.some((keyword) => combinedText.includes(keyword)));

  const urgency = isUrgent
    ? 'Urgent attention suggested'
    : needsSoonReview
      ? 'Medical review recommended soon'
      : 'Monitor and use supportive care';

  const likelyConcern = isUrgent
    ? 'Your symptoms include signs that deserve prompt medical attention rather than self-monitoring alone.'
    : needsSoonReview
      ? 'The symptom pattern may not be an emergency, but it is strong enough to justify a clinic review soon.'
      : 'The symptom pattern sounds more suitable for early self-care and watchful monitoring unless it worsens.';

  const recommendations = isUrgent
    ? [
        'Seek urgent medical help or contact emergency care now.',
        'Do not stay alone if you feel faint, weak, or short of breath.',
        'Prepare a short summary of when the symptoms started and what has changed.',
      ]
    : needsSoonReview
      ? [
          'Book a clinic review as soon as you can, ideally within the next day or two.',
          'Rest, hydrate, and track whether the symptom intensity is increasing.',
          'Seek urgent care earlier if breathing, bleeding, confusion, or severe pain develops.',
        ]
      : [
          'Rest, hydrate, and continue monitoring how you feel over the next 24 to 48 hours.',
          'Write down any new symptoms, temperature readings, or triggers you notice.',
          'Seek care sooner if symptoms become severe, persistent, or start affecting breathing, hydration, or alertness.',
        ];

  return {
    urgency,
    likelyConcern,
    recommendations,
    note: 'This is a preliminary assistant review, not a confirmed medical diagnosis. MedGemma can later replace this with a stronger clinical model.',
  };
}

const FIRST_AID_LIBRARY: Record<
  string,
  { summary: string; tips: string[]; getHelp: string[] }
> = {
  bruises: {
    summary: 'Bruises usually improve with rest, cold compression, and gentle monitoring.',
    tips: [
      'Apply a cold pack wrapped in cloth for about 15 minutes at a time.',
      'Rest the injured area and raise it if swelling is present.',
      'Avoid massaging the bruise in the early stage.',
    ],
    getHelp: [
      'Seek medical care if swelling is severe, movement is limited, or the bruise keeps spreading quickly.',
    ],
  },
  nosebleed: {
    summary: 'Most nosebleeds improve by leaning forward and applying steady pressure.',
    tips: [
      'Sit upright, lean slightly forward, and pinch the soft part of the nose for 10 to 15 minutes.',
      'Breathe through the mouth and avoid lying flat.',
      'Do not tilt the head back because blood can run down the throat.',
    ],
    getHelp: [
      'Get urgent help if bleeding is very heavy, follows a major injury, or does not stop after repeated pressure.',
    ],
  },
  burns: {
    summary: 'Small minor burns should be cooled early and protected gently.',
    tips: [
      'Cool the burn under cool running water for up to 20 minutes.',
      'Remove tight jewelry near the area before swelling starts.',
      'Cover with a clean, non-stick dressing and avoid applying ice directly.',
    ],
    getHelp: [
      'Get urgent care for large burns, facial burns, electrical burns, or burns with severe blistering.',
    ],
  },
  cuts: {
    summary: 'Small cuts need pressure, cleaning, and protection from dirt.',
    tips: [
      'Apply direct pressure with a clean cloth to slow bleeding.',
      'Rinse gently with clean water once bleeding is controlled.',
      'Cover the wound with a clean dressing or bandage.',
    ],
    getHelp: [
      'Seek medical help if bleeding does not stop, the wound is deep, or the cut was caused by something dirty or rusty.',
    ],
  },
  sprain: {
    summary: 'Sprains often benefit from rest, cold compression, and reduced movement early on.',
    tips: [
      'Rest the joint and avoid putting too much weight on it.',
      'Apply a cold pack wrapped in cloth for short intervals.',
      'Use gentle support or compression if available and comfortable.',
    ],
    getHelp: [
      'Seek care if the joint looks deformed, cannot bear weight, or swelling and pain are severe.',
    ],
  },
};

export function buildFirstAidGuidance(input: FirstAidFormInput) {
  const libraryMatch = FIRST_AID_LIBRARY[input.problem] ?? {
    summary:
      'Start with scene safety, keep the person calm, and focus on the main risk like bleeding, breathing, or severe pain.',
    tips: [
      'Move away from danger before giving help if the area is unsafe.',
      'Use clean materials where possible and avoid actions that worsen pain or bleeding.',
      'Monitor the person closely while preparing for further help if needed.',
    ],
    getHelp: [
      'Seek urgent medical help if the person is struggling to breathe, losing consciousness, or bleeding heavily.',
    ],
  };

  return {
    ...libraryMatch,
    note: `Current issue: ${input.problem}. This is supportive first-aid guidance and not a replacement for emergency care. MedGemma can later be connected for richer context-aware advice.`,
  };
}
