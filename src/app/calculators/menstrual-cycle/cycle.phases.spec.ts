import { PHASE_GUIDE } from './cycle.phases';
import { phasesOf } from './cycle.engine';

describe('cycle phase guide', () => {
  it('describes every phase the engine can return', () => {
    for (const p of phasesOf(28, 5)) {
      const g = PHASE_GUIDE[p.id];
      expect(g.headline).toBeTruthy();
      expect(g.hormones.length).toBeGreaterThan(40);
      expect(g.notice.length).toBeGreaterThanOrEqual(3);
      expect(g.tip).toBeTruthy();
    }
  });
});
