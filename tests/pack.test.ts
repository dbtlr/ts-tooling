import { describe, expect, it } from 'vite-plus/test';

import { pack } from '../src/pack.js';

describe('pack', () => {
  it('defaults to tsgo dts and generated exports', () => {
    expect(pack()).toStrictEqual({ dts: { tsgo: true }, exports: true });
  });

  it('merges caller options over the defaults', () => {
    expect(pack({ dts: true, exports: false })).toMatchObject({ dts: true, exports: false });
  });
});
