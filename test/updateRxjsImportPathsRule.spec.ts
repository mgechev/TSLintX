import { assertSuccess, assertAnnotated, assertMultipleAnnotated, assertFailures } from './testHelper';
import { assert } from 'chai';
import { RuleFailure } from 'tslint';

const assertReplacements = (err: RuleFailure[], before: string, after: string) => {
  if (err instanceof Array) {
    err.forEach(e => {
      let fixes = e.getFix();
      if (!Array.isArray(fixes)) {
        fixes = [fixes];
      }
      before = fixes.reduce((a, c) => c.apply(a), before);
    });
    assert(before === after, 'Replacements are not applied properly');
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

  describe('never & empty', () => {
    it('should migrate empty', () => {
      const source = `
        import { empty } from 'rxjs/observable/empty';
      `;
      const after = `
        import { EMPTY } from 'rxjs';
      `;

      const err = assertFailures('update-rxjs-import-paths', source, [
        {
          startPosition: {
            line: 1,
            character: 17
          },
          endPosition: {
            line: 1,
            character: 22
          },
          message: 'The imported symbol no longer exists'
        },
        {
          startPosition: {
            line: 1,
            character: 31
          },
          endPosition: {
            line: 1,
            character: 52
          },
          message: 'Outdated import path'
        }
      ]);

      assertReplacements(err as RuleFailure[], source, after);
    });

    it('should migrate empty with aliases', () => {
      const source = `
        import { empty as Empty } from 'rxjs/observable/empty';
      `;
      const after = `
        import { EMPTY as Empty } from 'rxjs';
      `;

      const err = assertFailures('update-rxjs-import-paths', source, [
        {
          startPosition: {
            line: 1,
            character: 17
          },
          endPosition: {
            line: 1,
            character: 22
          },
          message: 'The imported symbol no longer exists'
        },
        {
          startPosition: {
            line: 1,
            character: 40
          },
          endPosition: {
            line: 1,
            character: 61
          },
          message: 'Outdated import path'
        }
      ]);

      assertReplacements(err as RuleFailure[], source, after);
    });

    it('should migrate never', () => {
      const source = `
        import { never } from 'rxjs/observable/never';
      `;
      const after = `
        import { NEVER } from 'rxjs';
      `;

      const err = assertFailures('update-rxjs-import-paths', source, [
        {
          startPosition: {
            line: 1,
            character: 17
          },
          endPosition: {
            line: 1,
            character: 22
          },
          message: 'The imported symbol no longer exists'
        },
        {
          startPosition: {
            line: 1,
            character: 31
          },
          endPosition: {
            line: 1,
            character: 52
          },
          message: 'Outdated import path'
        }
      ]);

      assertReplacements(err as RuleFailure[], source, after);
    });

    it('should migrate never with aliases', () => {
      const source = `
        import { never as Bar } from 'rxjs/observable/never';
      `;
      const after = `
        import { NEVER as Bar } from 'rxjs';
      `;

      const err = assertFailures('update-rxjs-import-paths', source, [
        {
          startPosition: {
            line: 1,
            character: 17
          },
          endPosition: {
            line: 1,
            character: 22
          },
          message: 'The imported symbol no longer exists'
        },
        {
          startPosition: {
            line: 1,
            character: 38
          },
          endPosition: {
            line: 1,
            character: 59
          },
          message: 'Outdated import path'
        }
      ]);

      assertReplacements(err as RuleFailure[], source, after);
    });
  });

  describe('AnonymousSubscription', () => {
    it('should migrate AnonymousSubscription', () => {
      const source = `
        import { AnonymousSubscription } from 'rxjs/Subscription';
      `;
      const after = `
        import { Unsubscribable } from 'rxjs';
      `;

      const err = assertFailures('update-rxjs-import-paths', source, [
        {
          startPosition: {
            line: 1,
            character: 17
          },
          endPosition: {
            line: 1,
            character: 22
          },
          message: 'The imported symbol no longer exists'
        },
        {
          startPosition: {
            line: 1,
            character: 31
          },
          endPosition: {
            line: 1,
            character: 52
          },
          message: 'Outdated import path'
        }
      ]);

      assertReplacements(err as RuleFailure[], source, after);
    });
  });
});
