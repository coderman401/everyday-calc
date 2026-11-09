/**
 * Week by week: the fruit a baby is often compared to, with typical length and weight.
 * Figures are the commonly published averages and are rounded; babies vary, and a scan will
 * measure your own. Weeks 4 to 19 are crown to rump (sitting height), from week 20 crown to heel.
 */

export interface WeekInfo {
  week: number;
  /** Fruit, vegetable or seed the size is compared to; empty before there is an embryo. */
  name: string;
  /** An emoji, or `seed:poppy`, `seed:sesame`, `seed:lentil` for the ones no emoji covers. */
  icon: string;
  /** Background tint for the icon, a hex colour. */
  tone: string;
  /** Length in cm, or null before week 4. */
  cm: number | null;
  /** Weight in grams; 0 means under a gram; null before week 4. */
  g: number | null;
  note: string;
}

type Row = [week: number, name: string, icon: string, tone: string, cm: number | null, g: number | null, note: string];

const ROWS: Row[] = [
  [1, '', '🌸', '#f4a6c0', null, null, 'Counted from the first day of your last period. Your body is preparing; there is no embryo yet.'],
  [2, '', '🌸', '#f4a6c0', null, null, 'An egg is released around now. Conception is most likely in the day or two after.'],
  [3, '', '🌸', '#f4a6c0', null, null, 'The fertilised egg divides as it travels toward the womb.'],
  [4, 'poppy seed', 'seed:poppy', '#7a7fa8', 0.1, 0, 'The embryo settles into the womb lining. A pregnancy test can read positive about now.'],
  [5, 'sesame seed', 'seed:sesame', '#d9b878', 0.2, 0, 'The heart tube begins to beat, and the brain and spinal cord start to form.'],
  [6, 'lentil', 'seed:lentil', '#d98a4a', 0.6, 0, 'A heartbeat can often be seen on an early scan. Tiny buds that become arms and legs appear.'],
  [7, 'blueberry', '🫐', '#7e8fe0', 1.3, 0, 'Hands and feet start as paddles, and the brain is growing fast.'],
  [8, 'kidney bean', '🫘', '#c0674f', 1.6, 1, 'Fingers and toes are forming, and the baby starts to make small movements.'],
  [9, 'grape', '🍇', '#8fbf6a', 2.3, 2, 'The embryo is now called a fetus. Facial features and tiny joints take shape.'],
  [10, 'strawberry', '🍓', '#ef6f73', 3.1, 4, 'The vital organs are formed and begin to work. Tiny fingernails start to grow.'],
  [11, 'clementine', '🍊', '#f5a14a', 4.1, 7, 'The baby stretches and kicks, though you cannot feel it yet. The head is about half its length.'],
  [12, 'kiwi', '🥝', '#9ccc5a', 5.4, 14, 'Fingers can open and close, and the kidneys begin to make urine. The risk of miscarriage falls after about now.'],
  [13, 'lemon', '🍋', '#f4d24f', 7.4, 23, 'Vocal cords form. Fingerprints are beginning to develop. The first trimester ends this week.'],
  [14, 'peach', '🍑', '#f6a58c', 8.7, 43, 'Facial muscles work, so the baby can squint and frown. Many people feel more energetic.'],
  [15, 'apple', '🍎', '#e85a4f', 10.1, 70, 'Bones are hardening, and the baby can sense light through closed eyelids.'],
  [16, 'avocado', '🥑', '#8cb35a', 11.6, 100, 'Movements are more coordinated. A first flutter is possible, more often felt from week 18 to 20.'],
  [17, 'pear', '🍐', '#b5cf5a', 13, 140, 'Fat starts to build under the skin, and the skeleton hardens from cartilage to bone.'],
  [18, 'bell pepper', '🫑', '#6fbf5a', 14.2, 190, 'The baby can hear sounds such as your heartbeat and may startle at a loud noise.'],
  [19, 'mango', '🥭', '#f5a63c', 15.3, 240, 'A waxy coating called vernix protects the skin, and the sensory areas of the brain develop.'],
  [20, 'banana', '🍌', '#f4d24f', 25.6, 300, 'Halfway. The baby swallows and has regular sleep and wake patterns. From now it is measured head to heel.'],
  [21, 'carrot', '🥕', '#f08a3c', 26.7, 360, 'Movements are stronger and easier to feel. The bone marrow starts to make blood cells.'],
  [22, 'sweet potato', '🍠', '#c97a5a', 27.8, 430, 'Eyebrows and eyelids are formed, and the sense of touch is developing.'],
  [23, 'grapefruit', '🍊', '#f08a6a', 28.9, 500, 'The baby responds to sounds, and the lungs practise breathing movements.'],
  [24, 'corn on the cob', '🌽', '#f4c94f', 30, 600, 'The lungs are developing air sacs. A baby born now has a chance of survival with intensive care.'],
  [25, 'broccoli', '🥦', '#5fae5a', 34.6, 660, 'The baby fills out, and the skin starts to look smoother as fat builds up.'],
  [26, 'lettuce', '🥬', '#7fc46a', 35.6, 760, 'The eyes begin to open, and the baby blinks.'],
  [27, 'cucumber', '🥒', '#5fae6a', 36.6, 875, 'The baby sleeps and wakes in a pattern, and may hiccup. You may feel small rhythmic taps.'],
  [28, 'eggplant', '🍆', '#8a6bb0', 37.6, 1000, 'The third trimester begins. The eyes can open and the brain grows rapidly.'],
  [29, 'small pumpkin', '🎃', '#f08a3c', 38.6, 1150, 'Muscles and lungs keep maturing. Kicks are strong, and you may notice a pattern to them.'],
  [30, 'cabbage', '🥬', '#7fc46a', 39.9, 1300, 'The brain grows folds and grooves as it expands, and the baby gains weight steadily.'],
  [31, 'coconut', '🥥', '#a8795a', 41.1, 1500, 'The baby can turn the head from side to side and is taking in the five senses.'],
  [32, 'squash', '🎃', '#f2a14a', 42.4, 1700, 'Toenails are formed, and the baby practises breathing. Many settle head down around now.'],
  [33, 'pineapple', '🍍', '#f4c94f', 43.7, 1900, 'The skeleton hardens, though the skull stays soft and flexible for birth.'],
  [34, 'cantaloupe', '🍈', '#f4b86a', 45, 2100, 'The fingernails reach the fingertips, and the lungs keep maturing.'],
  [35, 'honeydew melon', '🍈', '#b5d98a', 46.2, 2400, 'The kidneys are fully developed. There is less room, so kicks feel more like pushes and rolls.'],
  [36, 'romaine lettuce', '🥬', '#6fbf5a', 47.4, 2600, 'The baby may drop lower into the pelvis in preparation for birth.'],
  [37, 'Swiss chard', '🥬', '#5fae6a', 48.6, 2900, 'Early term begins. The baby is nearly ready and practises gripping and sucking.'],
  [38, 'pumpkin', '🎃', '#f08a3c', 49.8, 3000, 'The organs are ready for life outside the womb, and the baby keeps adding fat.'],
  [39, 'mini watermelon', '🍉', '#ef6f73', 50.7, 3300, 'Full term. The brain and lungs keep developing right up to birth.'],
  [40, 'small watermelon', '🍉', '#ef6f73', 51.2, 3500, 'Your due date. Only a small share of babies arrive on the day; most come within a couple of weeks either side.'],
];

export const WEEKS: WeekInfo[] = ROWS.map(([week, name, icon, tone, cm, g, note]) => ({ week, name, icon, tone, cm, g, note }));

/** The entry for a week. Past week 40 it stays on week 40, with a note about a late baby. */
export function weekInfo(week: number): WeekInfo {
  const w = Math.min(40, Math.max(1, Math.floor(week)));
  const info = WEEKS[w - 1];
  if (week > 40) {
    return {
      ...info,
      note: 'Past the due date. Your doctor will monitor you and the baby, and talk through options such as induction if labour has not started.',
    };
  }
  return info;
}

export function article(name: string): string {
  return /^[aeiou]/i.test(name) ? 'an' : 'a';
}

/** "5.4 cm · 2.1 in", "1 mm" for the very first weeks. */
export function formatLength(cm: number | null): string {
  if (cm === null) return 'Not measured yet';
  if (cm < 0.5) return `${Math.round(cm * 10)} mm`;
  return `${cm} cm · ${(cm / 2.54).toFixed(1)} in`;
}

/** "14 g · 0.5 oz", "1.5 kg · 3.3 lb", "under 1 g". */
export function formatWeight(g: number | null): string {
  if (g === null) return 'Not weighed yet';
  if (g < 1) return 'Under 1 g';
  if (g < 1000) return `${g} g · ${(g / 28.35).toFixed(1)} oz`;
  return `${(g / 1000).toFixed(1)} kg · ${(g / 453.6).toFixed(1)} lb`;
}
