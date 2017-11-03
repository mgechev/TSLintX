import * as Lint from 'tslint';
import * as ts from 'typescript';

import { execSync } from 'child_process';

const collectEnvironmentVariableNames = (): Set<string> => {
  const result = new Set<string>();
  try {
    const res = execSync('printenv').toString();
    res.split('\n').forEach(row => {
      result.add(row.split('=')[0]);
    });
  } catch (e) {
    console.error('Cannot read environment variables');
  }
  return result;
};

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'existing-environment-vars',
    type: 'maintainability',
    description: `Disallows renaming directive outputs by providing a string to the decorator.`,
    descriptionDetails: `See more at https://angular.io/styleguide#style-05-13.`,
    rationale: `Two names for the same property (one private, one public) is inherently confusing.`,
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
