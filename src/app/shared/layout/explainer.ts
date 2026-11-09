import { ChangeDetectionStrategy, Component, input } from '@angular/core';

export interface FaqItem {
  q: string;
  a: string;
}

/** One block of the "How it's calculated" section. */
export type ExplainerBlock =
  | { type: 'text'; heading: string; body: string[] }
  | {
      type: 'formula';
      heading: string;
      intro?: string;
      /** Lines of the formula, one per row. */
      lines: string[];
      /** What each symbol stands for. */
      where?: { sym: string; meaning: string }[];
    }
  /** A worked example with the user's own numbers. */
  | { type: 'steps'; heading: string; intro?: string; steps: { label: string; value: string }[] }
  | { type: 'list'; heading: string; intro?: string; items: string[] }
  | { type: 'table'; heading: string; intro?: string; columns: string[]; rows: string[][] }
  | { type: 'faq'; heading: string; items: FaqItem[] };

export interface ExplainerContent {
  /** Defaults to "How it's calculated". */
  heading?: string;
  blocks: ExplainerBlock[];
}

/**
 * The write-up under every calculator: what is being worked out, the formula, a worked example
 * with the numbers currently entered, a table where one helps, notes and questions. Pages build the
 * content from their live inputs, so the example always matches the answer on screen.
 */
@Component({
  selector: 'app-explainer',
  templateUrl: './explainer.html',
  styleUrl: './explainer.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Explainer {
  readonly content = input.required<ExplainerContent>();
}
