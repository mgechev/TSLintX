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

const EmptyImport: ImportReplacement = {
  path: 'rxjs/observable/empty',
  symbol: 'empty',
  newPath: 'rxjs',
  newSymbol: 'EMPTY'
};

const NeverImport: ImportReplacement = {
  path: 'rxjs/observable/never',
  symbol: 'never',
  newPath: 'rxjs',
  newSymbol: 'NEVER'
};

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
      if (ImportMap.has(path)) {
        replacement = ImportMap.get(path);
      } else if (OperatorsPathRe.test(path)) {
        replacement = NewOperatorsPath;
      } else if (EmptyImport.path === path) {
        this._migrateEmptyOrNever(EmptyImport, node);
        replacement = EmptyImport.newPath;
      } else if (NeverImport.path === path) {
        this._migrateEmptyOrNever(NeverImport, node);
        replacement = NeverImport.newPath;
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
    const e = bindings.elements[0] as ts.ImportSpecifier | null;
    if (!e || e.kind !== ts.SyntaxKind.ImportSpecifier) {
      return;
    }
    let toReplace = e.name;
    if (e.propertyName) {
      toReplace = e.propertyName;
    }
    return this.addFailureAt(
      toReplace.getStart(),
      toReplace.getWidth(),
      'The imported symbol no longer exists',
      this.createReplacement(toReplace.getStart(), toReplace.getWidth(), re.newSymbol)
    );
  }
}
