import { describe, expect, it } from 'vite-plus/test';

import { isScopedObject, isWholeProject, targetGlobs, targetRules } from '../src/helpers.js';

describe('lint-target helpers', () => {
  describe('isWholeProject', () => {
    it('is true only for an explicit true', () => {
      expect(isWholeProject(true)).toBe(true);
    });

    it('is false for globs, the object form, false, and undefined', () => {
      expect(isWholeProject(['packages/api/**'])).toBe(false);
      expect(isWholeProject({ files: ['packages/api/**'] })).toBe(false);
      expect(isWholeProject(false)).toBe(false);
      expect(isWholeProject(undefined)).toBe(false);
    });
  });

  describe('isScopedObject', () => {
    it('is true only for the { files } object form', () => {
      expect(isScopedObject({ files: ['packages/ui/**'] })).toBe(true);
    });

    it('is false for globs, booleans, and undefined', () => {
      expect(isScopedObject(['packages/ui/**'])).toBe(false);
      expect(isScopedObject(true)).toBe(false);
      expect(isScopedObject(false)).toBe(false);
      expect(isScopedObject(undefined)).toBe(false);
    });
  });

  describe('targetGlobs', () => {
    it('returns the globs for a bare list and the object form', () => {
      expect(targetGlobs(['a/**'])).toStrictEqual(['a/**']);
      expect(targetGlobs({ files: ['a/**'] })).toStrictEqual(['a/**']);
    });

    it('treats an empty list (bare or object) as off', () => {
      expect(targetGlobs([])).toBeUndefined();
      expect(targetGlobs({ files: [] })).toBeUndefined();
    });

    it('is undefined for whole-project and off targets', () => {
      expect(targetGlobs(true)).toBeUndefined();
      expect(targetGlobs(false)).toBeUndefined();
      expect(targetGlobs(undefined)).toBeUndefined();
    });
  });

  describe('targetRules', () => {
    it('returns the object form rules, else undefined', () => {
      expect(targetRules({ files: ['a/**'], rules: { 'no-console': 'off' } })).toStrictEqual({
        'no-console': 'off',
      });
      expect(targetRules({ files: ['a/**'] })).toBeUndefined();
      expect(targetRules(['a/**'])).toBeUndefined();
      expect(targetRules(true)).toBeUndefined();
    });
  });
});
