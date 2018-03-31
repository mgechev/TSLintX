import * as Lint from 'tslint';
import * as ts from 'typescript';

const ImportMap = new Map([
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

const OperatorsPathRe = /^rxjs\/operators\/.*$/;
const NewOperatorsPath = 'rxjs/operators';

interface ImportReplacement {
  path: string;
  symbol: string;
  newPath: string;
  newSymbol: string;
}

const ImportReplacements = [
  {
    path: 'rxjs/observable/empty',
    symbol: 'empty',
    newPath: 'rxjs',
    newSymbol: 'EMPTY'
  },
  {
    path: 'rxjs/observable/never',
    symbol: 'never',
    newPath: 'rxjs',
    newSymbol: 'NEVER'
  },
  {
    path: 'rxjs/Subscription',
    symbol: 'AnonymousSubscription',
    newPath: 'rxjs',
    newSymbol: 'Unsubscribable'
  }
];

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
    if (ts.isStringLiteral(node.moduleSpecifier) && node.importClause) {
      const specifier = node.moduleSpecifier;
      const path = (specifier as ts.StringLiteral).text;
      const start = specifier.getStart() + 1;
      const end = specifier.text.length;
      const replacementStart = start;
      const replacementEnd = specifier.text.length;
      let replacement = null;

      // Try to migrate entire import path updates.
      if (ImportMap.has(path)) {
        replacement = ImportMap.get(path);

        // Try to migrate import path prefix updates in case
        // of `rxjs/operators/*`.
      } else if (OperatorsPathRe.test(path)) {
        replacement = NewOperatorsPath;

        // Try to migrate import path updates and renames of
        // the exported symbols.
      } else {
        ImportReplacements.forEach(r => {
          if (r.path === path) {
            this._migrateEmptyOrNever(r, node);
            replacement = r.newPath;
          }
        });
      }
      if (replacement !== null) {
        return this.addFailureAt(
          start,
          end,
          Rule.RuleFailure,
          this.createReplacement(replacementStart, replacementEnd, replacement)
        );
      }
    }
  }

  private _migrateEmptyOrNever(re: ImportReplacement, node: ts.ImportDeclaration) {
    const importClause = node.importClause as ts.ImportClause;
    const bindings = importClause.namedBindings as ts.NamedImports | null;
    if (!bindings || bindings.kind !== ts.SyntaxKind.NamedImports) {
      return;
    }
    bindings.elements.forEach((e: ts.ImportSpecifier | null) => {
      if (!e || e.kind !== ts.SyntaxKind.ImportSpecifier) {
        return;
      }
      let toReplace = e.name;
      if (e.propertyName) {
        toReplace = e.propertyName;
      }
      if (toReplace.getText() !== re.symbol) {
        return;
      }
      return this.addFailureAt(
        toReplace.getStart(),
        toReplace.getWidth(),
        'The imported symbol no longer exists',
        this.createReplacement(toReplace.getStart(), toReplace.getWidth(), re.newSymbol)
      );
    });
  }
}
