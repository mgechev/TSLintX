import { assertSuccess, assertAnnotated } from './testHelper';
import { assert } from 'chai';
import { RuleFailure } from 'tslint';

const assertReplacements = (err: RuleFailure[], before: string, after: string) => {
  if (err instanceof Array) {
    err.forEach(e => {
      let fixes = e.getFix();
      if (!Array.isArray(fixes)) {
        fixes = [fixes];
      }
      const res = fixes.reduce((a, c) => {
        return c.apply(a);
      }, before);
      assert(res === after);
    });
  }
};

describe('update-rxjs-import-paths', () => {
  describe('invalid import', () => {
    it('should fail, when private property is not named properly', () => {
      const source = `
      import { foo } from 'rxjs/Subscriber';
                           ~~~~~~~~~~~~~~~
      `;
      const err = assertAnnotated({
        ruleName: 'update-rxjs-import-paths',
        message: 'Outdated import path',
        source
      });

      const before = `
      import { foo } from 'rxjs/Subscriber';
      `;
      const after = `
      import { foo } from 'rxjs';
      `;

      assertReplacements(err as RuleFailure[], before, after);
    });
  });

  describe('operators import', () => {
    it('should work', () => {
      const source = `
        import {do} from 'rxjs/operators/do';
                          ~~~~~~~~~~~~~~~~~
      `;

      const err = assertAnnotated({
        ruleName: 'update-rxjs-import-paths',
        message: 'Outdated import path',
        source
      });

      const before = `
        import {do} from 'rxjs/operators/do';
      `;
      const after = `
        import {do} from 'rxjs/operators';
      `;

      assertReplacements(err as RuleFailure[], before, after);
    });

    it('should not replace side-effect imports', () => {
      const source = `
        import 'rxjs/operators/do';
      `;

      assertSuccess('update-rxjs-import-paths', source);
    });
  });

  describe('never & empty', () => {});
});
