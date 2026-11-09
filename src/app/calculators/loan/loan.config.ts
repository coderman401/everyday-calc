import type { FaqItem } from '../../shared/layout/explainer';

/** Everything that differs between the home, car and personal loan calculators. */
export interface LoanConfig {
  slug: string;
  title: string;
  lead: string;
  amountLabel: string;
  amount: { min: number; max: number; step: number; default: number };
  rate: { min: number; max: number; step: number; default: number };
  /** Longest tenure offered, in years; the Month unit allows 12 times this. */
  maxYears: number;
  defaultYears: number;
  copy: {
    whatIs: string[];
    tips: string[];
    notIncluded: string[];
    faq: FaqItem[];
  };
}

const SHARED_NOT_INCLUDED = [
  'Processing fees, GST on those fees, insurance and any other charge your lender adds.',
  'Changes in a floating rate. The calculator holds your rate steady for the whole tenure.',
  'Rounding. Lenders round each instalment, so your actual EMI can differ by a few rupees.',
];

export const HOME_LOAN_CONFIG: LoanConfig = {
  slug: 'home-loan-emi',
  title: 'Home Loan EMI Calculator',
  lead: 'The monthly EMI on a home loan, the interest it adds up to and the total you repay. A prepayment, extra EMIs or a yearly step-up show how much sooner you finish.',
  amountLabel: 'Home loan amount',
  amount: { min: 100_000, max: 50_000_000, step: 50_000, default: 5_000_000 },
  rate: { min: 1, max: 20, step: 0.05, default: 8.5 },
  maxYears: 30,
  defaultYears: 20,
  copy: {
    whatIs: [
      'A home loan is a long, secured loan. The property is the security, so rates are lower than on car or personal loans and the tenure can run to 30 years.',
      'You repay it in equal monthly instalments, called EMIs. Each EMI pays the interest on what you still owe and clears a slice of the principal.',
    ],
    tips: [
      'A shorter tenure raises the EMI but cuts the interest sharply. Move the tenure slider and watch Total interest payable.',
      'Prepay early. Interest is charged on the outstanding balance, so a lump sum in the first years saves the most.',
      'A yearly step-up suits a salary that grows: start with an EMI you can carry today and raise it each year.',
      'Compare the total interest between offers, not only the EMI. A 0.25% lower rate is worth a lot over 20 years.',
    ],
    notIncluded: [
      ...SHARED_NOT_INCLUDED,
      'Prepayment charges. Some lenders charge for part-payments on fixed-rate loans. Check yours.',
    ],
    faq: [
      {
        q: 'Is a lower EMI always better?',
        a: 'No. Stretching the tenure lowers the EMI but raises the total interest. Compare the Total interest payable for each tenure before you choose.',
      },
      {
        q: 'What happens to my EMI if the rate changes?',
        a: 'Depending on the lender, either the EMI or the tenure changes. To see the effect, enter the new rate, the balance you still owe, and the months you have left.',
      },
    ],
  },
};

export const CAR_LOAN_CONFIG: LoanConfig = {
  slug: 'car-loan-emi',
  title: 'Car Loan EMI Calculator',
  lead: 'The monthly EMI and total interest on the amount you borrow for a car. Enter the loan, which is the price less your down payment.',
  amountLabel: 'Car loan amount',
  amount: { min: 100_000, max: 10_000_000, step: 25_000, default: 800_000 },
  rate: { min: 5, max: 20, step: 0.05, default: 9 },
  maxYears: 8,
  defaultYears: 5,
  copy: {
    whatIs: [
      'A car loan is a secured loan: the car stays pledged to the lender until the last EMI is paid. Tenures are shorter than for a home loan, usually three to seven years, and rates are higher.',
      'You repay it in equal monthly instalments, called EMIs. Each EMI pays the interest on what you still owe and clears a slice of the principal.',
    ],
    tips: [
      'Borrow against the price less your down payment. A bigger down payment means a smaller loan and less interest.',
      'Keep the tenure short. A seven-year loan has a lower EMI than a four-year one but costs far more, and the car loses value faster than the loan shrinks.',
      'Ask whether a quote is a reducing-balance rate or a flat rate. They are not comparable (see the questions below).',
      'Prepaying in the first years saves the most, because interest is charged on the outstanding balance.',
    ],
    notIncluded: [
      ...SHARED_NOT_INCLUDED,
      'Prepayment or foreclosure charges. Many car loans have a fee for paying early. Check yours.',
    ],
    faq: [
      {
        q: 'What is the difference between a flat and a reducing rate?',
        a: 'A reducing-balance rate charges interest on what you still owe, as this calculator does. A flat rate charges interest on the full original amount for the whole term, so it costs much more. A flat 8% on a five-year loan works out to roughly 14% on a reducing balance. Ask which one a quote uses.',
      },
      {
        q: 'Should I enter the car’s price or the loan amount?',
        a: 'The loan amount: the price minus your down payment, plus any on-road costs you are financing.',
      },
    ],
  },
};

export const PERSONAL_LOAN_CONFIG: LoanConfig = {
  slug: 'personal-loan-emi',
  title: 'Personal Loan EMI Calculator',
  lead: 'The EMI on a personal loan and what the loan costs in interest. Add a prepayment to see whether paying early is worth it.',
  amountLabel: 'Personal loan amount',
  amount: { min: 50_000, max: 5_000_000, step: 10_000, default: 500_000 },
  rate: { min: 8, max: 30, step: 0.05, default: 12 },
  maxYears: 7,
  defaultYears: 3,
  copy: {
    whatIs: [
      'A personal loan is unsecured: nothing is pledged against it. That makes it quick to get but costly, with higher rates and a short tenure, usually one to five years.',
      'You repay it in equal monthly instalments, called EMIs. Each EMI pays the interest on what you still owe and clears a slice of the principal.',
    ],
    tips: [
      'Borrow only what you need. At personal-loan rates every extra lakh adds a lot of interest.',
      'Check the processing fee. It is usually a percentage of the loan and is not part of this calculation.',
      'A shorter tenure costs far less in total. Compare the Total interest payable at two or three tenures.',
      'Prepaying early works well on a short, high-rate loan. Add any prepayment fee to the saving before you decide.',
    ],
    notIncluded: [
      ...SHARED_NOT_INCLUDED,
      'Foreclosure or part-payment charges, often a percentage of the amount you pay early.',
    ],
    faq: [
      {
        q: 'Why are personal loan rates higher?',
        a: 'Nothing backs the loan, so the lender carries more risk and prices it into the rate. Your credit history and income decide where in the range you land.',
      },
      {
        q: 'What is the difference between a flat and a reducing rate?',
        a: 'A reducing-balance rate charges interest on what you still owe, as this calculator does. A flat rate charges interest on the full original amount for the whole term, so it costs much more. Ask which one a quote uses.',
      },
    ],
  },
};
