# Code Quality Tools

This project uses several tools to maintain code quality and consistency:

## ESLint

Lints TypeScript and JavaScript files to catch errors and enforce coding standards.

### Configuration
- Configuration file: `.eslintrc.js`
- Extends: `@typescript-eslint/recommended`, `plugin:react/recommended`, `plugin:react-native/all`
- Custom rules for React Native development

### Usage
```bash
# Check for linting errors
npm run lint

# Fix auto-fixable linting errors
npm run lint:fix
```

## Prettier

Code formatter for consistent styling across the codebase.

### Configuration
- Configuration file: `.prettierrc.js`
- Ignore file: `.prettierignore`
- Settings: 2-space indentation, single quotes, trailing commas

### Usage
```bash
# Format all files
npm run format

# Check if files are formatted
npm run format:check
```

## TypeScript

Type checking for better code quality and IDE support.

### Configuration
- Configuration file: `tsconfig.json`
- Strict mode enabled
- Path aliases configured for clean imports

### Usage
```bash
# Type check without emitting files
npm run type-check
```

## Husky + lint-staged

Git hooks that run quality checks before commits and pushes.

### Pre-commit Hook
Runs on `git commit`:
1. `lint-staged` - Lints and formats only staged files
2. `type-check` - Validates TypeScript types
3. `test:ci` - Runs tests related to changes

### Pre-push Hook
Runs on `git push`:
1. `test:ci` - Full test suite
2. `quality` - All quality checks (lint, format, type-check)

### Configuration
- Husky hooks: `.husky/` directory
- lint-staged config: `package.json`

## Combined Quality Check

Run all quality checks at once:
```bash
npm run quality
```

## IDE Integration

### VS Code
Recommended extensions:
- ESLint
- Prettier
- TypeScript and JavaScript Language Features

### Settings
Add to `.vscode/settings.json`:
```json
{
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true
  },
  "typescript.preferences.importModuleSpecifier": "relative"
}
```

## CI/CD Integration

These tools are integrated into the CI/CD pipeline:
- Quality checks run on every PR
- Builds fail if quality checks don't pass
- Automated formatting suggestions

## Best Practices

1. **Run quality checks locally** before pushing
2. **Fix linting errors** immediately
3. **Use consistent formatting** via Prettier
4. **Leverage TypeScript** for type safety
5. **Write tests** for new features
6. **Review code** for adherence to standards

## Troubleshooting

### ESLint Issues
- Check `.eslintrc.js` for rule configurations
- Use `--fix` flag for auto-fixes
- Add `// eslint-disable-next-line` for exceptions

### Prettier Conflicts
- Prettier runs after ESLint in lint-staged
- Check `.prettierignore` for excluded files
- Use `--check` flag to verify formatting

### TypeScript Errors
- Run `npm run type-check` for full type checking
- Check `tsconfig.json` for compiler options
- Update type definitions if needed

### Git Hook Issues
- Hooks are in `.husky/` directory
- Make sure hooks are executable: `chmod +x .husky/*`
- Skip hooks temporarily: `git commit --no-verify`