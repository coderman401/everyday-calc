import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { Consent } from '../../core/analytics';
import { DocPage } from '../../shared/layout/doc-page';

interface CookieRow {
  name: string;
  purpose: string;
  lasts: string;
  by: string;
  needs: string;
}

interface DataRow {
  what: string;
  detail: string;
}

/** The privacy policy. Plain text rendered from the lists below, so the cookie table cannot drift from the page. */
@Component({
  selector: 'app-privacy',
  imports: [DocPage],
  templateUrl: './privacy.html',
  styleUrl: './privacy.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Privacy {
  protected readonly consent = inject(Consent);

  protected readonly updated = '9 November 2026';
  /** A stand-in address on .example: replace it with a real mailbox before launch. */
  protected readonly contact = 'privacy@calculators.example';

  protected readonly collected: DataRow[] = [
    { what: 'Pages you view', detail: 'The address and title of each page, and when you opened it.' },
    {
      what: 'Calculations you perform',
      detail:
        'That a calculator was used, and for loans and savings its settings in broad ranges (for example "10-25 lakh", the rate, the term). For BMI only the unit and cut-off set. For age, menstrual cycle and pregnancy, nothing you entered.',
    },
    {
      what: 'Browser and device',
      detail: 'Browser and version, operating system, screen size, device type and language. Google reads these from your browser’s request.',
    },
    {
      what: 'Approximate location',
      detail: 'Country, region and city, worked out by Google from your IP address. Google Analytics does not log or store the IP address itself.',
    },
    {
      what: 'Page speed',
      detail: 'Core Web Vitals: how fast the main content appeared (LCP), how quickly the page answered a tap or click (INP) and how much it shifted (CLS).',
    },
    { what: 'A random identifier', detail: 'Stored in the Google Analytics cookie, so repeat visits by the same browser can be counted. It is not linked to your name.' },
  ];

  protected readonly never = [
    'The amounts, rates and dates you type into any calculator.',
    'Your height, weight, date of birth, last period, cycle length or pregnancy dates.',
    'Your name, email address or any account, because there is no sign-in.',
    'Anything for advertising: ad personalisation and Google signals are switched off.',
  ];

  protected readonly cookies: CookieRow[] = [
    { name: '_ga', purpose: 'Tells visits by one browser apart', lasts: '2 years', by: 'Google Analytics', needs: 'Only if you accept' },
    { name: '_ga_<ID>', purpose: 'Keeps the state of your current session', lasts: '2 years', by: 'Google Analytics', needs: 'Only if you accept' },
    { name: 'calc_consent', purpose: 'Remembers your cookie choice', lasts: '6 months', by: 'This site', needs: 'Set when you choose' },
    { name: 'cookie-consent (local storage)', purpose: 'The same choice, kept in your browser', lasts: '6 months', by: 'This site', needs: 'Set when you choose' },
    { name: 'theme (local storage)', purpose: 'Remembers light or dark if you pick one', lasts: 'Until you clear it', by: 'This site', needs: 'Set when you switch theme' },
  ];
}
