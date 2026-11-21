/**
 * The calculator registry. One entry per calculator; the shell, the home page and the
 * placeholder route all read from here. To ship a calculator: set `status: 'live'`, add its
 * lazy route in app.routes.ts (declared before the `:slug` placeholder route).
 */
export type CategoryId = 'loans' | 'investing' | 'health';

export interface Category {
  id: CategoryId;
  label: string;
  /** One word for the header. */
  short: string;
}

export interface CalculatorInfo {
  slug: string;
  title: string;
  /** Name used in the menu and on cards, where "Calculator" is implied. */
  short: string;
  summary: string;
  /** The page title in search results, 60 characters or fewer. */
  metaTitle: string;
  /** The snippet under it, about 155 characters. */
  metaDescription: string;
  category: CategoryId;
  icon: string;
  status: 'live' | 'soon';
}

export const CATEGORIES: readonly Category[] = [
  { id: 'loans', label: 'Loans', short: 'Loans' },
  { id: 'investing', label: 'Savings and investing', short: 'Savings' },
  { id: 'health', label: 'Health and dates', short: 'Health' },
];

export const CALCULATORS: readonly CalculatorInfo[] = [
  {
    slug: 'home-loan-emi',
    title: 'Home Loan EMI Calculator',
    short: 'Home loan EMI',
    summary: 'EMI, total interest and a year-by-year schedule, with prepayment and step-up.',
    metaTitle: 'Home Loan EMI Calculator with Prepayment',
    metaDescription: 'Home loan EMI calculator for India: monthly EMI, total interest and a yearly schedule, with prepayment, extra EMIs and step-up. Formula shown.',
    category: 'loans',
    icon: 'home',
    status: 'live',
  },
  {
    slug: 'car-loan-emi',
    title: 'Car Loan EMI Calculator',
    short: 'Car loan EMI',
    summary: 'Monthly EMI and interest for a new or used car.',
    metaTitle: 'Car Loan EMI Calculator: EMI and Total Interest',
    metaDescription: 'Car loan EMI calculator: monthly EMI, total interest and total cost for a new or used car, with prepayment and step-up. See the formula worked out.',
    category: 'loans',
    icon: 'directions_car',
    status: 'live',
  },
  {
    slug: 'personal-loan-emi',
    title: 'Personal Loan EMI Calculator',
    short: 'Personal loan EMI',
    summary: 'EMI and total cost for an unsecured loan.',
    metaTitle: 'Personal Loan EMI Calculator and Interest Cost',
    metaDescription: 'Personal loan EMI calculator: monthly EMI and the interest an unsecured loan costs, with a prepayment option to test paying early. Formula shown.',
    category: 'loans',
    icon: 'payments',
    status: 'live',
  },
  {
    slug: 'sip',
    title: 'SIP Calculator',
    short: 'SIP',
    summary: 'What a monthly investment grows to over the years.',
    metaTitle: 'SIP Calculator: Returns on a Monthly Investment',
    metaDescription: 'SIP calculator: what a monthly mutual fund investment could be worth, your money against returns, with a yearly step-up and year-by-year table.',
    category: 'investing',
    icon: 'trending_up',
    status: 'live',
  },
  {
    slug: 'fixed-deposit',
    title: 'Fixed Deposit Calculator',
    short: 'Fixed deposit',
    summary: 'Maturity value of a lump sum at a fixed rate.',
    metaTitle: 'FD Calculator: Maturity Value and Interest',
    metaDescription: 'Fixed deposit calculator: maturity amount and interest for monthly, quarterly, half-yearly or yearly compounding, with the effective yield compared.',
    category: 'investing',
    icon: 'savings',
    status: 'live',
  },
  {
    slug: 'bmi',
    title: 'BMI Calculator',
    short: 'BMI',
    summary: 'Body mass index from height and weight.',
    metaTitle: 'BMI Calculator for Adults: WHO and Asian Cut-offs',
    metaDescription: 'BMI calculator for adults in metric or imperial units. See your category, a healthy weight range for your height, and WHO or Asia-Pacific cut-offs.',
    category: 'health',
    icon: 'monitor_weight',
    status: 'live',
  },
  {
    slug: 'age',
    title: 'Age Calculator',
    short: 'Age',
    summary: 'Exact age in years, months and days.',
    metaTitle: 'Age Calculator: Exact Age in Years, Months, Days',
    metaDescription: 'Age calculator: exact age in years, months and days from a date of birth, with total months, weeks, days and hours and the next birthday.',
    category: 'health',
    icon: 'cake',
    status: 'live',
  },
  {
    slug: 'menstrual-cycle',
    title: 'Menstrual Cycle Calculator',
    short: 'Menstrual cycle',
    summary: 'Next period and fertile window from your cycle length.',
    metaTitle: 'Period and Ovulation Calculator: Fertile Window',
    metaDescription: 'Period and ovulation calculator: next period date, estimated ovulation and fertile window from your last period and cycle length, with each phase explained.',
    category: 'health',
    icon: 'calendar_month',
    status: 'live',
  },
  {
    slug: 'pregnancy',
    title: 'Pregnancy Calculator',
    short: 'Pregnancy',
    summary: 'Due date and current week from the first day of your last period.',
    metaTitle: 'Pregnancy Due Date Calculator: Week by Week',
    metaDescription: 'Pregnancy due date calculator from your last period or conception date. See weeks pregnant, trimester dates and your baby\'s size week by week.',
    category: 'health',
    icon: 'pregnant_woman',
    status: 'live',
  },
  {
    slug: 'date',
    title: 'Date Calculator',
    short: 'Date',
    summary: 'Days between two dates, or a date a set time before or after another.',
    metaTitle: 'Date Calculator: Days Between Dates, Add or Subtract',
    metaDescription: 'Date calculator: count the days, weeks, months and years between two dates, or add and subtract years, months and days from a date. Formula shown.',
    category: 'health',
    icon: 'date_range',
    status: 'live',
  },
  {
    slug: 'time',
    title: 'Time Calculator',
    short: 'Time',
    summary: 'Hours between two times, or a time a set span before or after another.',
    metaTitle: 'Time Calculator: Hours Between Times, Add or Subtract',
    metaDescription: 'Time calculator: find the hours and minutes between two times, past midnight too, or add and subtract hours and minutes from a time. Formula shown.',
    category: 'health',
    icon: 'schedule',
    status: 'live',
  },
  {
    slug: 'bmr',
    title: 'BMR Calculator',
    short: 'BMR',
    summary: 'Calories burned at rest, and daily calories for each activity level.',
    metaTitle: 'BMR Calculator: Daily Calories at Rest and Active',
    metaDescription: 'BMR calculator using the Mifflin-St Jeor equation: calories your body burns at rest, and the daily calories to keep your weight at each activity level.',
    category: 'health',
    icon: 'local_fire_department',
    status: 'live',
  },
];

export const HOME_LOAN = CALCULATORS[0];

export function findCalculator(slug: string | undefined): CalculatorInfo | undefined {
  return CALCULATORS.find((c) => c.slug === slug);
}

export function calculatorPath(c: CalculatorInfo): string {
  return `/calculators/${c.slug}`;
}
