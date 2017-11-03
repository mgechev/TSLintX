import * as Lint from 'tslint';
import * as ts from 'typescript';

import { execSync } from 'child_process';

const collectEnvironmentVariableNames = (): Set<string> => {
  return Object.keys(process.env).reduce((s: Set<string>, env: string) => {
    s.add(env);
    return s;
  }, new Set<string>());
};

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'existing-environment-vars',
    type: 'functionality',
    description: 'Reports when trying to access an non-existing environment variable',
    rationale:
      'Useful when building the front-end of an application which internally uses environment variables. For instance, REACT_APP_VAR.',
    options: null,
    optionsDescription: `Not configurable.`,
    typescriptOnly: true
  };

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(
      new OutputMetadataWalker(collectEnvironmentVariableNames(), sourceFile, this.getOptions())
    );
  }
}

class OutputMetadataWalker extends Lint.RuleWalker {
  constructor(private declaredVariables: Set<string>, sourceFile: ts.SourceFile, options: any) {
    super(sourceFile, options);
  }

  visitIdentifier(node: ts.Identifier): void {
    const varName = node.getText();
    const text = node.parent.getText();
    if (varName && text === `process.env.${varName}` && !this.isDeclared(varName)) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          `Environment variable "${varName}" used but not presented in environment`
        )
      );
    }
  }

  private isDeclared(variable: string): boolean {
    return this.declaredVariables.has(variable);
  }
}
