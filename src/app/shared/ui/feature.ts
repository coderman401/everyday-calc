import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { FeatureScene, type SceneKind } from './feature-scene';

/**
 * One feature section: a headline and a few lines on one side (projected content), a scene on the
 * other. Sections flip sides each time they follow one another, by their position among siblings.
 */
@Component({
  selector: 'app-feature',
  imports: [FeatureScene],
  template: `
    <div class="text">
      <h2 class="h">{{ heading() }}</h2>
      <ng-content />
    </div>
    <app-feature-scene [kind]="scene()" />
  `,
  styleUrl: './feature.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class Feature {
  readonly heading = input.required<string>();
  readonly scene = input.required<SceneKind>();
}
