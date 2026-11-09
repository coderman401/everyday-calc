import type { Phase } from './cycle.engine';

export interface PhaseGuide {
  id: Phase['id'];
  /** The name usually used in books and clinics. */
  clinical: string;
  headline: string;
  hormones: string;
  notice: string[];
  tip: string;
}

/** What is happening in each stretch of the cycle, in plain words. General, not personal advice. */
export const PHASE_GUIDE: Record<Phase['id'], PhaseGuide> = {
  period: {
    id: 'period',
    clinical: 'Menstrual phase',
    headline: 'The womb lining sheds, and a new cycle begins.',
    hormones:
      'Oestrogen and progesterone are at their lowest, which is what triggers the lining to shed. Bleeding usually lasts 3 to 7 days.',
    notice: [
      'Cramps, a dull lower-back ache, and tiredness are common on the first days.',
      'Headaches, bloating and loose stools can come with the lowest hormone levels.',
      'You lose iron with the blood, so some people feel run down toward the end.',
    ],
    tip: 'Iron-rich food, rest and a warm compress help. See a doctor for very heavy bleeding (soaking a pad every hour) or pain that stops you doing daily things.',
  },
  before: {
    id: 'before',
    clinical: 'Follicular phase',
    headline: 'An egg is maturing and the womb lining rebuilds.',
    hormones:
      'Follicle-stimulating hormone rises and several follicles start to grow; one becomes dominant. Oestrogen climbs steadily and thickens the lining.',
    notice: [
      'Energy, mood and focus often lift as oestrogen rises.',
      'Discharge changes from dry or sticky to creamy as the days pass.',
      'Skin is often at its clearest, and many people feel more social.',
    ],
    tip: 'A good time for harder workouts and demanding tasks if you feel up to them. This stretch is the part that varies most from cycle to cycle.',
  },
  fertile: {
    id: 'fertile',
    clinical: 'Fertile window and ovulation',
    headline: 'Pregnancy is possible. An egg is released near the end of this window.',
    hormones:
      'Oestrogen peaks, then a surge of luteinising hormone makes the follicle release its egg about 24 to 36 hours later. The egg lives about a day; sperm can live up to 5 days.',
    notice: [
      'Discharge turns clear and stretchy, like raw egg white, around ovulation.',
      'Some people feel a brief one-sided twinge low in the abdomen.',
      'Desire often rises, and resting body temperature climbs slightly (about 0.2 to 0.5 °C) just after ovulation.',
    ],
    tip: 'If you are trying to conceive, the days before ovulation matter most. If you are not, this window does not make a safe-days calendar: use contraception.',
  },
  after: {
    id: 'after',
    clinical: 'Luteal phase',
    headline: 'The body prepares for a possible pregnancy, then resets.',
    hormones:
      'The empty follicle makes progesterone, which thickens and steadies the lining. If there is no pregnancy, progesterone and oestrogen fall about 12 to 16 days after ovulation and the next period starts.',
    notice: [
      'Bloating, tender breasts, cravings and mood changes are common, especially in the last week (PMS).',
      'Sleep can be lighter, and you may feel warmer.',
      'Implantation, if an egg was fertilised, happens about 6 to 10 days after ovulation. A test is reliable from the day your period is due.',
    ],
    tip: 'Steady meals, regular sleep and gentle exercise ease PMS for many people. Symptoms severe enough to disrupt your life are worth raising with a doctor.',
  },
};
