import { assertSuccess, assertAnnotated } from './testHelper';

describe('underscore-privates', () => {
  describe('invalid naming', () => {
    it('should fail, when private property is not named properly', () => {
      const source = `
      class foo {
        private bar;
                ~~~
      }
      `;
      assertAnnotated({
        ruleName: 'underscore-privates',
        message: `private member's name must be prefixed with an underscore`,
        source
      });
    });

    it('should fail, when private method is not named properly', () => {
      const source = `
      class foo {
        private bar() {
                ~~~
        }
      }
      `;
      assertAnnotated({
        ruleName: 'underscore-privates',
        message: `private member's name must be prefixed with an underscore`,
        source
      });
    });

    it('should fail, when private accessor is not named properly', () => {
      const source = `
      class foo {
        private set bar() {
                    ~~~
        }
      }
      `;
      assertAnnotated({
        ruleName: 'underscore-privates',
        message: `private member's name must be prefixed with an underscore`,
        source
      });
    });
  });

  describe('positive cases', () => {
    it('should pass, when public accessor is named properly', () => {
      const source = `
      class foo {
        set bar() {
        }
      }
      `;
      assertSuccess('underscore-privates', source);
    });

    it('should pass, when public method is named properly', () => {
      const source = `
      class foo {
        _bar() {
        }
      }
      `;
      assertSuccess('underscore-privates', source);
    });
  });
});
