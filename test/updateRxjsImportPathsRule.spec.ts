import { assertSuccess, assertAnnotated } from './testHelper';
import { assert } from 'chai';
import { RuleFailure } from 'tslint';

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
    });
  });
});
