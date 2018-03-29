import * as Lint from 'tslint';
import * as ts from 'typescript';

const importMap = new Map([
  ['rxjs/util/', 'rxjs/internal/util/'],
  ['rxjs/testing/', 'rxjs/internal/testing/'],
  ['rxjs/scheduler/', 'rxjs/internal/scheduler/'],
  ['rxjs/interfaces', 'rxjs'],
  ['rxjs/AsyncSubject', 'rxjs'],
  ['rxjs/BehaviorSubject', 'rxjs'],
  ['rxjs/Notification', 'rxjs'],
  ['rxjs/Observable', 'rxjs'],
  ['rxjs/Observer', 'rxjs'],
  ['rxjs/Operator', 'rxjs'],
  ['rxjs/ReplaySubject', 'rxjs'],
  ['rxjs/Subject', 'rxjs'],
  ['rxjs/Subscriber', 'rxjs'],
  ['rxjs/Scheduler', 'rxjs'],
  ['rxjs/Subscription', 'rxjs'],
  ['rxjs/observable/bindCallback', 'rxjs'],
  ['rxjs/observable/combineLatest', 'rxjs'],
  ['rxjs/observable/concat', 'rxjs'],
  ['rxjs/observable/ConnectableObservable', 'rxjs'],
  ['rxjs/observable/defer', 'rxjs'],
  ['rxjs/observable/forkJoin', 'rxjs'],
  ['rxjs/observable/from', 'rxjs'],
  ['rxjs/observable/fromEvent', 'rxjs'],
  ['rxjs/observable/fromEventPattern', 'rxjs'],
  ['rxjs/observable/interval', 'rxjs'],
  ['rxjs/observable/merge', 'rxjs'],
  ['rxjs/observable/of', 'rxjs'],
  ['rxjs/observable/race', 'rxjs'],
  ['rxjs/observable/range', 'rxjs'],
  ['rxjs/observable/timer', 'rxjs'],
  ['rxjs/observable/zip', 'rxjs'],
  ['rxjs/observable/fromPromise', 'rxjs'],
  ['rxjs/observable/if', 'rxjs'],
  ['rxjs/observable/throw', 'rxjs'],
  ['rxjs/observable/FromEventObservable', 'rxjs/internal/observable/fromEvent']
]);

export class Rule extends Lint.Rules.AbstractRule {
  public static metadata: Lint.IRuleMetadata = {
    ruleName: 'update-rxjs-import-paths',
    type: 'functionality',
    description: 'Updates the paths of the rxjs imports to the version 6',
    rationale: 'RxJS version 6 updated their API which requires changes in some of the import paths.',
    options: null,
    optionsDescription: 'Not configurable.',
    typescriptOnly: true
  };

  static RuleFailure = 'Outdated import path';

  public apply(sourceFile: ts.SourceFile): Lint.RuleFailure[] {
    return this.applyWithWalker(new UpdateOutdatedImportsWalker(sourceFile, this.getOptions()));
  }
}

class UpdateOutdatedImportsWalker extends Lint.RuleWalker {
  visitImportDeclaration(node: ts.ImportDeclaration): void {
    if (ts.isStringLiteral(node.moduleSpecifier)) {
      const specifier = node.moduleSpecifier;
      const path = (specifier as ts.StringLiteral).text;
      if (importMap.has(path)) {
        this.addFailureAt(
          specifier.getStart() + 1,
          specifier.text.length,
          Rule.RuleFailure,
          this.createReplacement(specifier.getStart() + 1, specifier.text.length, importMap.get(path))
        );
      }
    }
  }
}
