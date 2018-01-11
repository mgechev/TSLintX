[![Build Status](https://travis-ci.org/mgechev/TSLintX.svg?branch=master)](https://travis-ci.org/mgechev/TSLintX)

# TSLintX

TSLint rules for happier life.

# Rules

This repository provides the following rules:

|          Rule Name          | Configuration |                                    Description                                     |
| :-------------------------: | :-----------: | :--------------------------------------------------------------------------------: |
| `existing-environment-vars` |     none      |       Warns when an environment variable referenced in the code is not used.       |
|    `underscore-privates`    |     none      | Warns when a private property, method or accessor is not prefixed with underscore. |

# How to use?

To use the rules in your project:

```json
{
  "rulesDirectory": ["tslintx"],
  "existing-environment-vars": true
}
```

# License

MIT
