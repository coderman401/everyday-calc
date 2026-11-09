import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { DocPage } from '../../shared/layout/doc-page';
import { FAQ_GROUPS } from './faq.data';

@Component({
  selector: 'app-faq',
  imports: [RouterLink, DocPage],
  templateUrl: './faq.html',
  styleUrl: './faq.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FaqPage {
  protected readonly groups = FAQ_GROUPS;
}
