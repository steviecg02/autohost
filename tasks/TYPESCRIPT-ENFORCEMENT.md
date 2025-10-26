# TypeScript/React Code Standards Enforcement

**Purpose:** Automated enforcement of TypeScript/React standards for frontend repositories.

**Strategy:** Prevention (pre-commit) + Validation (CI/CD) + Education (documentation)

---

## 1. Pre-Commit Hooks (Local Enforcement)

### Install Husky + lint-staged

```bash
npm install --save-dev husky lint-staged
npx husky init
```

### `.husky/pre-commit`

```bash
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
```

### `package.json` - lint-staged configuration

```json
{
  "lint-staged": {
    "*.{ts,tsx}": ["eslint --fix", "prettier --write", "bash -c 'tsc --noEmit'"],
    "*.{json,md,yml,yaml}": ["prettier --write"]
  }
}
```

### What Gets Blocked

❌ **Commit will FAIL if:**

- ESLint errors (unfixed)
- TypeScript compilation errors
- Prettier formatting violations
- Type errors

✅ **Auto-fixed if possible:**

- ESLint auto-fixable rules
- Prettier formatting

---

## 2. ESLint Configuration

### Install ESLint + Plugins

```bash
npm install --save-dev \
  eslint \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-next \
  eslint-plugin-react \
  eslint-plugin-react-hooks \
  eslint-plugin-jsx-a11y \
  eslint-plugin-import
```

### `.eslintrc.json`

```json
{
  "extends": [
    "next/core-web-vitals",
    "plugin:@typescript-eslint/recommended",
    "plugin:@typescript-eslint/recommended-requiring-type-checking",
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
    "plugin:jsx-a11y/recommended",
    "prettier"
  ],
  "parser": "@typescript-eslint/parser",
  "parserOptions": {
    "project": "./tsconfig.json",
    "ecmaVersion": 2022,
    "sourceType": "module",
    "ecmaFeatures": {
      "jsx": true
    }
  },
  "plugins": ["@typescript-eslint", "react", "react-hooks", "jsx-a11y", "import"],
  "rules": {
    // TypeScript
    "@typescript-eslint/no-explicit-any": "error",
    "@typescript-eslint/no-unused-vars": [
      "error",
      {
        "argsIgnorePattern": "^_",
        "varsIgnorePattern": "^_"
      }
    ],
    "@typescript-eslint/explicit-function-return-type": [
      "warn",
      {
        "allowExpressions": true
      }
    ],
    "@typescript-eslint/no-floating-promises": "error",
    "@typescript-eslint/no-misused-promises": "error",
    "@typescript-eslint/strict-boolean-expressions": "warn",

    // React
    "react/react-in-jsx-scope": "off", // Next.js doesn't need this
    "react/prop-types": "off", // Using TypeScript
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",

    // Imports
    "import/order": [
      "error",
      {
        "groups": ["builtin", "external", "internal", "parent", "sibling", "index"],
        "newlines-between": "always",
        "alphabetize": {
          "order": "asc"
        }
      }
    ],
    "import/no-duplicates": "error",

    // Code Quality
    "complexity": ["error", 10],
    "max-lines-per-function": [
      "warn",
      {
        "max": 50,
        "skipBlankLines": true,
        "skipComments": true
      }
    ],
    "max-depth": ["error", 3],
    "no-console": [
      "warn",
      {
        "allow": ["warn", "error"]
      }
    ],

    // Accessibility
    "jsx-a11y/anchor-is-valid": [
      "error",
      {
        "components": ["Link"],
        "specialLink": ["hrefLeft", "hrefRight"],
        "aspects": ["invalidHref", "preferButton"]
      }
    ]
  },
  "settings": {
    "react": {
      "version": "detect"
    }
  }
}
```

---

## 3. TypeScript Configuration

### `tsconfig.json`

```json
{
  "compilerOptions": {
    // Strict Mode (Non-Negotiable)
    "strict": true,
    "noUncheckedIndexedAccess": true,
    "noImplicitReturns": true,
    "noFallthroughCasesInSwitch": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "exactOptionalPropertyTypes": true,
    "noImplicitOverride": true,
    "noPropertyAccessFromIndexSignature": true,

    // Module Resolution
    "target": "ES2022",
    "lib": ["ES2022", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "moduleResolution": "bundler",
    "resolveJsonModule": true,
    "allowJs": true,
    "checkJs": false,

    // Emit
    "noEmit": true,
    "declaration": true,
    "declarationMap": true,
    "sourceMap": true,
    "removeComments": false,
    "importHelpers": true,

    // Interop
    "esModuleInterop": true,
    "allowSyntheticDefaultImports": true,
    "forceConsistentCasingInFileNames": true,
    "isolatedModules": true,

    // JSX
    "jsx": "preserve",
    "jsxImportSource": "react",

    // Paths
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"],
      "@/components/*": ["./src/components/*"],
      "@/lib/*": ["./src/lib/*"],
      "@/types/*": ["./src/types/*"]
    },

    // Next.js specific
    "incremental": true,
    "plugins": [
      {
        "name": "next"
      }
    ]
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules", ".next", "out", "dist"]
}
```

---

## 4. Prettier Configuration

### Install Prettier

```bash
npm install --save-dev prettier eslint-config-prettier
```

### `.prettierrc.json`

```json
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100,
  "tabWidth": 2,
  "useTabs": false,
  "arrowParens": "always",
  "endOfLine": "lf",
  "bracketSpacing": true,
  "jsxSingleQuote": false,
  "plugins": ["prettier-plugin-tailwindcss"]
}
```

### `.prettierignore`

```
.next
out
dist
node_modules
*.min.js
package-lock.json
pnpm-lock.yaml
```

---

## 5. Testing Configuration

### Install Testing Libraries

```bash
npm install --save-dev \
  @testing-library/react \
  @testing-library/jest-dom \
  @testing-library/user-event \
  @testing-library/react-hooks \
  jest \
  jest-environment-jsdom \
  @types/jest
```

### `jest.config.js`

```javascript
const nextJest = require('next/jest');

const createJestConfig = nextJest({
  dir: './',
});

const customJestConfig = {
  setupFilesAfterEnv: ['<rootDir>/jest.setup.js'],
  testEnvironment: 'jest-environment-jsdom',
  moduleNameMapper: {
    '^@/(.*)$': '<rootDir>/src/$1',
  },
  collectCoverageFrom: [
    'src/**/*.{ts,tsx}',
    '!src/**/*.d.ts',
    '!src/**/*.stories.tsx',
    '!src/**/__tests__/**',
  ],
  coverageThreshold: {
    global: {
      statements: 80,
      branches: 80,
      functions: 80,
      lines: 80,
    },
    './src/lib/': {
      statements: 90,
      branches: 90,
      functions: 90,
      lines: 90,
    },
  },
  testMatch: ['**/__tests__/**/*.{ts,tsx}', '**/*.{spec,test}.{ts,tsx}'],
};

module.exports = createJestConfig(customJestConfig);
```

### `jest.setup.js`

```javascript
import '@testing-library/jest-dom';

// Mock Next.js router
jest.mock('next/router', () => require('next-router-mock'));

// Mock environment variables
process.env = {
  ...process.env,
  NEXT_PUBLIC_API_URL: 'http://localhost:3000/api',
};
```

---

## 6. CI/CD Pipeline (GitHub Actions)

### `.github/workflows/ci.yml`

```yaml
name: CI

on:
  pull_request:
    branches: [main, develop]
  push:
    branches: [main]

jobs:
  quality:
    name: Code Quality
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run ESLint
        run: npm run lint

      - name: Run Prettier check
        run: npx prettier --check .

      - name: Type check
        run: npx tsc --noEmit

  test:
    name: Tests
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Run tests
        run: npm test -- --coverage

      - name: Upload coverage to Codecov
        uses: codecov/codecov-action@v3
        with:
          files: ./coverage/lcov.info
          fail_ci_if_error: true

  build:
    name: Build Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Build
        run: npm run build
        env:
          SKIP_ENV_VALIDATION: true

  bundle-size:
    name: Bundle Size Check
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Setup Node.js
        uses: actions/setup-node@v4
        with:
          node-version: '20'
          cache: 'npm'

      - name: Install dependencies
        run: npm ci

      - name: Analyze bundle
        run: |
          npm run build
          npx @next/bundle-analyzer

      - name: Check bundle size
        uses: andresz1/size-limit-action@v1
        with:
          github_token: ${{ secrets.GITHUB_TOKEN }}
```

---

## 7. Package.json Scripts

### `package.json`

```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start",
    "lint": "next lint",
    "lint:fix": "next lint --fix",
    "format": "prettier --write .",
    "format:check": "prettier --check .",
    "type-check": "tsc --noEmit",
    "test": "jest",
    "test:watch": "jest --watch",
    "test:coverage": "jest --coverage",
    "check": "npm run format && npm run lint:fix && npm run type-check && npm run test:coverage",
    "prepare": "husky install"
  }
}
```

---

## 8. How to Apply to Existing Repo (autohost-ui)

### Step 1: Copy Files

```bash
cd ~/Git/autohost-ui

# Copy standards
cp ~/Git/control-room/resources/TYPESCRIPT-CODE-STANDARDS.md .
cp ~/Git/control-room/resources/TYPESCRIPT-ENFORCEMENT.md .
```

### Step 2: Install Dependencies

```bash
# Install all dev dependencies
npm install --save-dev \
  husky \
  lint-staged \
  @typescript-eslint/eslint-plugin \
  @typescript-eslint/parser \
  eslint-config-next \
  prettier \
  eslint-config-prettier \
  @testing-library/react \
  @testing-library/jest-dom \
  jest \
  jest-environment-jsdom
```

### Step 3: Create Configuration Files

```bash
# Create ESLint config
cat > .eslintrc.json << 'EOF'
[paste ESLint config from above]
EOF

# Create Prettier config
cat > .prettierrc.json << 'EOF'
{
  "semi": true,
  "trailingComma": "es5",
  "singleQuote": true,
  "printWidth": 100
}
EOF

# Update tsconfig.json (add strict settings)
# See section 3 above

# Create jest.config.js
cat > jest.config.js << 'EOF'
[paste Jest config from above]
EOF
```

### Step 4: Setup Husky

```bash
# Initialize Husky
npx husky init

# Create pre-commit hook
cat > .husky/pre-commit << 'EOF'
#!/usr/bin/env sh
. "$(dirname -- "$0")/_/husky.sh"

npx lint-staged
EOF

chmod +x .husky/pre-commit

# Add lint-staged to package.json
# (see section 1 above)
```

### Step 5: Create Baseline (Fix Existing Issues)

```bash
# Auto-fix what can be fixed
npm run format
npm run lint:fix

# Check what's left
npm run type-check
npm run test

# Fix remaining issues manually
```

### Step 6: Enable CI/CD

```bash
# Create GitHub Actions workflow
mkdir -p .github/workflows
cp /path/to/ci.yml .github/workflows/

# Commit and push
git add .
git commit -m "chore: Add TypeScript/React standards enforcement"
git push
```

### Step 7: Configure Branch Protection

1. Go to GitHub repo → Settings → Branches
2. Add rule for `main` branch
3. Enable required checks:
   - `quality / Code Quality`
   - `test / Tests`
   - `build / Build Check`
4. Require PR reviews
5. No bypass allowed

---

## 9. Makefile (Optional - for convenience)

### `Makefile`

```makefile
.PHONY: help install format lint typecheck test check clean

help:  ## Show this help
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

install:  ## Install dependencies
	npm ci
	npx husky install

format:  ## Format code
	npm run format

lint:  ## Run linter
	npm run lint

typecheck:  ## Run type checker
	npm run type-check

test:  ## Run tests
	npm test

test-watch:  ## Run tests in watch mode
	npm run test:watch

test-coverage:  ## Run tests with coverage
	npm run test:coverage

check: format lint typecheck test-coverage  ## Run all checks (same as CI)

clean:  ## Clean up
	rm -rf .next out node_modules/.cache
```

---

## 10. Quick Action Plan for autohost-ui

```bash
cd ~/Git/autohost-ui

# 1. Copy files
cp ~/Git/control-room/resources/TYPESCRIPT-CODE-STANDARDS.md .
cp ~/Git/control-room/resources/TYPESCRIPT-ENFORCEMENT.md .

# 2. Install dependencies
npm install --save-dev husky lint-staged @typescript-eslint/eslint-plugin @typescript-eslint/parser prettier eslint-config-prettier

# 3. Create config files
# - .eslintrc.json (from section 2)
# - .prettierrc.json (from section 4)
# - Update tsconfig.json strict settings (from section 3)
# - jest.config.js (from section 5)

# 4. Setup Husky
npx husky init
# Add pre-commit hook (from section 1)

# 5. Fix existing code
npm run format
npm run lint:fix
npm run type-check  # Fix any errors manually

# 6. Add CI/CD
# Copy .github/workflows/ci.yml

# 7. Configure branch protection in GitHub

# 8. Standards now enforced!
```

---

## Summary

**Prevention** (Husky + lint-staged) + **Validation** (CI/CD) + **Enforcement** (branch protection) = **Standards enforced automatically**

TypeScript strict mode, ESLint, Prettier, and tests run on every commit. CI/CD blocks merges if standards violated. Branch protection makes it non-optional.
