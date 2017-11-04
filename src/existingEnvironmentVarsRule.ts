import * as Lint from 'tslint';
import * as ts from 'typescript';

import { execSync } from 'child_process';

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
    return this.applyWithWalker(new OutputMetadataWalker(sourceFile, this.getOptions()));
  }
}

class OutputMetadataWalker extends Lint.RuleWalker {
  visitIdentifier(node: ts.Identifier): void {
    const varName = node.getText();
    const text = node.parent.getText();
    if (varName && text === `process.env.${varName}` && process.env[varName] === undefined) {
      this.addFailure(
        this.createFailure(
          node.getStart(),
          node.getWidth(),
          `Environment variable "${varName}" used but not presented in environment`
        )
      );
    }
  }
}
