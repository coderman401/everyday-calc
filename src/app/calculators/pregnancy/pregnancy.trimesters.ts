export interface TrimesterGuide {
  id: 1 | 2 | 3;
  name: string;
  weeks: string;
  summary: string;
  baby: string[];
  you: string[];
  checks: string[];
}

/** General guidance on what each trimester brings. Your doctor's plan comes first. */
export const TRIMESTERS: TrimesterGuide[] = [
  {
    id: 1,
    name: 'First trimester',
    weeks: 'Weeks 1 to 13',
    summary: 'From a fertilised egg to a baby about 7 cm long. Most of the organs form now, so this is the most delicate stretch.',
    baby: [
      'The heart starts to beat around week 5 or 6.',
      'The brain, spinal cord and all the major organs begin to form.',
      'Arms, legs, fingers and toes appear, and the face takes shape.',
    ],
    you: [
      'Tiredness, nausea and tender breasts are common, and some people have food aversions.',
      'You may pass urine more often and feel your mood swing.',
      'Many people show no bump yet. A few kilos gained is typical by the end.',
    ],
    checks: [
      'Confirm the pregnancy and book your first antenatal visit.',
      'Blood tests and a dating scan, often between weeks 6 and 12.',
      'A first-trimester screening scan, usually between weeks 11 and 14.',
      'Folic acid is advised before conception and through the first 12 weeks.',
    ],
  },
  {
    id: 2,
    name: 'Second trimester',
    weeks: 'Weeks 14 to 27',
    summary: 'The baby grows from about 9 cm to about 37 cm. For many people this is the easiest stretch.',
    baby: [
      'Bones harden, hair and nails grow, and the baby starts to hear.',
      'You begin to feel movement, first as flutters, later as clear kicks.',
      'Sleep and wake patterns form, and the lungs start to develop.',
    ],
    you: [
      'Nausea usually eases and energy often returns.',
      'Your bump shows. Backache, heartburn, leg cramps and round-ligament twinges are common.',
      'Skin changes such as a dark line on the belly or darker patches are normal.',
    ],
    checks: [
      'A detailed anomaly scan, usually between weeks 18 and 22.',
      'A test for gestational diabetes, usually between weeks 24 and 28.',
      'Regular checks of blood pressure, weight and the baby’s growth.',
      'Ask your doctor about iron, calcium and vaccinations such as tetanus.',
    ],
  },
  {
    id: 3,
    name: 'Third trimester',
    weeks: 'Weeks 28 to 40',
    summary: 'The baby gains most of its weight, from about 1 kg to about 3.5 kg, and gets ready for birth.',
    baby: [
      'The lungs and brain keep maturing, and the baby adds fat.',
      'Most babies settle head down toward the end.',
      'Kicks change as space runs out: more rolls and pushes than flutters.',
    ],
    you: [
      'Breathlessness, swelling in the feet, heartburn and trouble sleeping are common.',
      'Practice contractions (Braxton Hicks) may come and go.',
      'You may pass urine more often again as the baby drops lower.',
    ],
    checks: [
      'Check-ups every two weeks, then weekly near the end.',
      'Growth scans if your doctor advises them.',
      'Learn your baby’s usual movements, and call your doctor if they slow down or stop.',
      'Plan the birth and pack a hospital bag. Call your doctor for regular contractions, your waters breaking or any bleeding.',
    ],
  },
];
