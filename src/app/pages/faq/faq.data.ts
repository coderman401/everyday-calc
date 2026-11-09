export interface Faq {
  q: string;
  a: string;
  /** An optional link after the answer. */
  link?: { text: string; path: string };
}

export interface FaqGroup {
  id: string;
  title: string;
  items: Faq[];
}

export const FAQ_GROUPS: FaqGroup[] = [
  {
    id: 'general',
    title: 'About the calculators',
    items: [
      {
        q: 'How accurate are the results?',
        a: 'They come from the standard formulas, shown on each page with your own numbers worked through. They are estimates for planning. Your lender’s schedule, your doctor’s dates or your fund’s statement are the ones that count, and small differences come from rounding.',
      },
      {
        q: 'Are my numbers saved anywhere?',
        a: 'No. Every calculation runs in your browser. What you type is not uploaded and is forgotten when you refresh. The one exception is the home page sample, which can pass its amount, rate and tenure to the home loan calculator in the address bar.',
      },
      {
        q: 'Do I need an account, and does it cost anything?',
        a: 'There is no sign-in and no charge.',
      },
      {
        q: 'Which currency and date format do you use?',
        a: 'Rupees with Indian digit grouping (₹12,34,567) and dates as day/month/year. The formulas work for any currency, but the symbol is fixed to ₹.',
      },
    ],
  },
  {
    id: 'loans',
    title: 'Loans',
    items: [
      {
        q: 'How is an EMI worked out?',
        a: 'EMI = P × r × (1 + r)ⁿ ÷ ((1 + r)ⁿ − 1), where P is the loan, r the monthly rate (annual rate ÷ 12 ÷ 100) and n the number of months.',
        link: { text: 'See it worked through', path: '/calculators/home-loan-emi' },
      },
      {
        q: 'Why is my bank’s EMI a little different?',
        a: 'Common reasons: the bank rounds each instalment, the rate has changed since you took the loan, processing fees or insurance were added to the loan, or the quote is a flat rate. A flat rate charges interest on the full amount for the whole term, so it costs far more than a reducing-balance rate of the same number.',
      },
      {
        q: 'What is the difference between a prepayment, an extra EMI and a step-up?',
        a: 'A prepayment is one lump sum, in the month you choose. Extra EMIs are additional instalments paid at the end of each loan year. A step-up raises the EMI by a set percentage each year. All three pay down the principal sooner, so the loan ends earlier and costs less interest.',
      },
      {
        q: 'Does the result include fees, insurance or tax?',
        a: 'No. Processing fees, GST on fees, insurance and prepayment charges are not part of the calculation.',
      },
    ],
  },
  {
    id: 'savings',
    title: 'Savings and investing',
    items: [
      {
        q: 'Is the SIP return guaranteed?',
        a: 'No. The calculator assumes a steady yearly return that you choose. Real mutual fund returns move with the market, and costs and tax reduce what you keep. Try a few rates, such as 8%, 10% and 12%, to see a range.',
        link: { text: 'Open the SIP calculator', path: '/calculators/sip' },
      },
      {
        q: 'How often does a fixed deposit add interest?',
        a: 'Most banks in India add it quarterly, but check your FD receipt. The calculator lets you pick monthly, quarterly, half-yearly or yearly, and shows how much the choice changes the maturity amount.',
      },
    ],
  },
  {
    id: 'health',
    title: 'Health and dates',
    items: [
      {
        q: 'Why does BMI have two sets of cut-offs?',
        a: 'The WHO global limits are used worldwide. The Asia-Pacific limits are lower for overweight and obese, because South Asians tend to carry more body fat and have higher risk at the same BMI. BMI is a screening number only: it cannot see muscle, fat distribution or age.',
        link: { text: 'Open the BMI calculator', path: '/calculators/bmi' },
      },
      {
        q: 'Can the cycle calculator tell me when I can or cannot get pregnant?',
        a: 'No. It estimates ovulation and a fertile window from an average cycle. Real cycles vary by days, so it is not a method of contraception and it cannot confirm or rule out a pregnancy.',
      },
      {
        q: 'How reliable is the due date?',
        a: 'It is the standard estimate, 280 days from the first day of your last period, adjusted for your cycle length. Only about one baby in twenty arrives on the day. An early scan gives a better date if your cycles are irregular.',
        link: { text: 'Open the pregnancy calculator', path: '/calculators/pregnancy' },
      },
      {
        q: 'Are the baby sizes exact?',
        a: 'They are commonly published averages, rounded, and the fruit is only a comparison. Every baby differs, and your own scans give your own measurements.',
      },
      {
        q: 'Does the age calculator handle leap years?',
        a: 'Yes. Months are added to the birth date, a 31st moves to the last day of a shorter month, and a 29 February birthday falls on 28 February in years without a 29th.',
      },
    ],
  },
  {
    id: 'privacy',
    title: 'Privacy and cookies',
    items: [
      {
        q: 'What do you track?',
        a: 'Only if you accept: the pages you view, which calculators are used (with loan and savings settings in broad ranges), your browser, device and approximate location as Google reports them, and how fast pages load.',
        link: { text: 'Read the privacy policy', path: '/privacy' },
      },
      {
        q: 'Do you send what I type to Google?',
        a: 'No. Amounts, rates, heights, weights and dates stay in your browser. The health and date calculators report only that they were used.',
      },
      {
        q: 'How do I change my cookie choice?',
        a: 'Use "Cookie settings" in the footer at any time. Declining removes the Google Analytics cookies from your browser.',
      },
      {
        q: 'Do you sell or share my data?',
        a: 'No. The site stores nothing about you itself, and analytics data stays in Google Analytics, where it is used only to see how the site is used.',
      },
    ],
  },
];
