import { assertSuccess, assertAnnotated } from './testHelper';

describe('existing-environment-vars', () => {
  describe('invalid environment variable access', () => {
    it('should fail, when an environment variable is not declared', () => {
      const source = `
      process.env.FOO
                  ~~~
      `;
      assertAnnotated({
        ruleName: 'existing-environment-vars',
        message: 'Environment variable "FOO" used but not presented in environment',
        source
      });
    });

    it('should fail, when an environment variable is not declared', () => {
      const source = `
      const foo = () => {
        return process.env.BAR;
                           ~~~
      };
      `;
      assertAnnotated({
        ruleName: 'existing-environment-vars',
        message: 'Environment variable "BAR" used but not presented in environment',
        source
      });
    });

    it('should fail, when an environment variable is not declared using square brackets property access', () => {
      const source = `
      const foo = () => {
        return process.env[\`BAR\`];
                           ~~~~~
      };
      `;
      assertAnnotated({
        ruleName: 'existing-environment-vars',
        message: 'Environment variable "BAR" used but not presented in environment',
        source
      });
    });

    it('should fail, when an environment variable is not declared using square brackets property access', () => {
      const source = `
      const foo = () => {
        return process.env['BAR'];
                           ~~~~~
      };
      `;
      assertAnnotated({
        ruleName: 'existing-environment-vars',
        message: 'Environment variable "BAR" used but not presented in environment',
        source
      });
    });
  });

  describe('valid environment variable access', () => {
    it('should succeed, when not using environment variable', () => {
      const source = `
      class ButtonComponent {
        @Input() label: string;
      }`;
      assertSuccess('existing-environment-vars', source);
    });

    it('should succeed, when using existing environment variable', () => {
      const source = `
        process.env.PATH;
      `;
      assertSuccess('existing-environment-vars', source);
    });

    it('should succeed, when using existing environment variable in a function', () => {
      const source = `
      const f = () => {
        return process.env.PATH;
      };
      `;
      assertSuccess('existing-environment-vars', source);
    });

    it('should succeed, when accessing a property `process` with non-existing variable', () => {
      const source = `
        Foo.process.env.PATH;
      `;
      assertSuccess('existing-environment-vars', source);
    });
  });
});
