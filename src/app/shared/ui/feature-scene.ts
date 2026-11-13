import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { Mascot } from './mascot';

export type SceneKind = 'formula' | 'live' | 'private';

/**
 * A flat feature illustration for the home page: what a calculator shows (the working), how it
 * behaves (it moves as you change a number) and what it keeps (nothing leaves the browser).
 * Brand palette only. As the scene scrolls into view its parts assemble, driven by one named
 * view timeline (see the scss); where that is not supported the finished picture is simply there.
 * The picture is decorative; the section's text carries the meaning.
 */
@Component({
  selector: 'app-feature-scene',
  imports: [Mascot],
  template: `
    <div class="scene" [attr.data-kind]="kind()">
      @switch (kind()) {
        @case ('formula') {
          <svg viewBox="0 0 420 330" aria-hidden="true" focusable="false">
            <rect class="lip" x="20" y="26" width="300" height="284" rx="12" />
            <rect class="face" x="20" y="20" width="300" height="284" rx="12" />
            <text class="td" x="44" y="62" font-size="22">Home loan EMI</text>
            <g class="formula">
              <rect class="tint" x="40" y="78" width="260" height="82" rx="12" />
              <text class="t" x="54" y="126" font-size="19">EMI</text>
              <text class="t" x="96" y="126" font-size="19">=</text>
              <text class="t" x="196" y="110" font-size="15" text-anchor="middle">P × r × (1 + r)<tspan dy="-6" font-size="10">n</tspan></text>
              <line class="rule" x1="118" y1="120" x2="284" y2="120" />
              <text class="t" x="196" y="145" font-size="15" text-anchor="middle">(1 + r)<tspan dy="-6" font-size="10">n</tspan><tspan dy="6"> − 1</tspan></text>
            </g>
            @for (k of [0, 1, 2]; track k) {
              <g class="row" [style.--k]="k">
                <circle class="tick" cx="56" [attr.cy]="188 + k * 32" r="10" />
                <path class="check" [attr.d]="'M51 ' + (188 + k * 32) + ' l4 4 l7 -8'" />
                <rect class="bar" x="76" [attr.y]="183 + k * 32" [attr.width]="[150, 118, 134][k]" height="10" rx="5" />
                <rect class="bar bar--v" x="248" [attr.y]="183 + k * 32" width="52" height="10" rx="5" />
              </g>
            }
            <g class="answer">
              <rect class="hi" x="40" y="268" width="260" height="30" rx="10" />
              <text class="t" x="54" y="288" font-size="15">Monthly EMI</text>
              <text class="td" x="286" y="289" font-size="18" text-anchor="end">₹43,391</text>
            </g>
          </svg>
          <app-mascot class="buddy" [size]="136" />
        }
        @case ('live') {
          <svg viewBox="0 0 420 330" aria-hidden="true" focusable="false">
            <rect class="lip" x="20" y="26" width="380" height="284" rx="12" />
            <rect class="face" x="20" y="20" width="380" height="284" rx="12" />
            <text class="t muted" x="44" y="56" font-size="13">Monthly EMI</text>
            <text class="td" x="44" y="102" font-size="40">₹43,391</text>
            <rect class="track" x="44" y="128" width="332" height="12" rx="6" />
            <rect class="fillbar" x="44" y="128" width="332" height="12" rx="6" />
            <circle class="thumb" cx="64" cy="134" r="15" />
            <g transform="translate(120 232) rotate(-90)" fill="none" stroke-width="24">
              <circle cx="0" cy="0" r="48" pathLength="100" stroke="var(--c-principal)" />
              <circle class="share" cx="0" cy="0" r="48" pathLength="100" stroke="var(--c-interest)" />
            </g>
            <g class="legend">
              <circle cx="232" cy="206" r="6" fill="var(--c-principal)" />
              <text class="t" x="248" y="211" font-size="14">Principal</text>
              <rect class="bar" x="232" y="220" width="140" height="10" rx="5" />
              <circle cx="232" cy="256" r="6" fill="var(--c-interest)" />
              <text class="t" x="248" y="261" font-size="14">Interest</text>
              <rect class="bar bar--grow" x="232" y="270" width="140" height="10" rx="5" />
            </g>
          </svg>
        }
        @case ('private') {
          <svg viewBox="0 0 420 330" aria-hidden="true" focusable="false">
            <rect class="lip" x="20" y="36" width="380" height="270" rx="12" />
            <rect class="face" x="20" y="30" width="380" height="270" rx="12" />
            <line class="rule rule--soft" x1="20" y1="76" x2="400" y2="76" />
            <circle cx="44" cy="53" r="6" fill="var(--pink)" />
            <circle cx="64" cy="53" r="6" fill="var(--sun)" />
            <circle cx="84" cy="53" r="6" fill="var(--ecto)" />
            <rect class="tint" x="112" y="42" width="200" height="22" rx="11" />
            <rect class="field" x="44" y="98" width="332" height="46" rx="12" />
            <text class="t" x="62" y="128" font-size="18">₹ 50,00,000</text>
            <rect class="field" x="44" y="158" width="150" height="46" rx="12" />
            <text class="t" x="62" y="188" font-size="18">8.5 %</text>
            <g transform="translate(300 230)">
              <g class="shield">
                <path class="shield__lip" d="M0 -42 L40 -27 V8 C40 30 22 44 0 54 C-22 44 -40 30 -40 8 V-27 Z" transform="translate(0 6)" />
                <path class="shield__face" d="M0 -42 L40 -27 V8 C40 30 22 44 0 54 C-22 44 -40 30 -40 8 V-27 Z" />
                <path class="shield__check" d="M-16 6 L-4 18 L18 -10" />
              </g>
            </g>
          </svg>
          <app-mascot class="buddy buddy--left" [size]="120" />
        }
      }
    </div>
  `,
  styleUrl: './feature-scene.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class FeatureScene {
  readonly kind = input.required<SceneKind>();
}
