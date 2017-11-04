import * as Lint from 'tslint';
import * as ts from 'typescript';
import { sprintf } from 'sprintf-js';
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

  static RuleFailure = 'Environment variable "%s" used but not presented in environment';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new OutputMetadataWalker(sourceFile, this.getOptions()));
  }
}

class OutputMetadataWalker extends Lint.RuleWalker {
  visitPropertyAccessExpression(node: ts.PropertyAccessExpression): void {
    const varName = node.name.getText();
    const text = node.expression.getText();
    if (varName && text === 'process.env' && process.env[varName] === undefined) {
      this.addFailure(
        this.createFailure(node.name.getStart(), node.name.getWidth(), sprintf(Rule.RuleFailure, varName))
      );
    }
    super.visitPropertyAccessExpression(node);
  }

  visitElementAccessExpression(node: ts.ElementAccessExpression) {
    const name = node.argumentExpression;
    const expressionText = node.expression.getText();
    let varName: string | null = null;
    if (name.kind === ts.SyntaxKind.NoSubstitutionTemplateLiteral || name.kind === ts.SyntaxKind.StringLiteral) {
      varName = name.getText();
      varName = varName.slice(1, varName.length - 1);
    }
    if (varName && expressionText === 'process.env' && process.env[varName] === undefined) {
      this.addFailure(this.createFailure(name.getStart(), name.getWidth(), sprintf(Rule.RuleFailure, varName)));
    }
    super.visitElementAccessExpression(node);
  }
}
