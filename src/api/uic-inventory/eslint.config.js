import js from '@eslint/js';
import eslintConfigPrettier from 'eslint-config-prettier';
import jsxA11y from 'eslint-plugin-jsx-a11y';
import prettier from 'eslint-plugin-prettier';
import reactPlugin from 'eslint-plugin-react';
import reactHooks from 'eslint-plugin-react-hooks';
import globals from 'globals';
import tseslint from 'typescript-eslint';

// eslint.config.js
export default tseslint.config(
  jsxA11y.flatConfigs.recommended,
  js.configs.recommended,
  ...tseslint.configs.recommended,
  {
    ...reactPlugin.configs.flat.recommended,
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: 'module',
      ...reactPlugin.configs.flat.recommended.languageOptions,
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.es2022,
      },
    },
    settings: { react: { version: 'detect' } },
    plugins: {
      react: reactPlugin,
      prettier,
      'react-hooks': reactHooks,
    },
    files: ['**/*.{js,mjs,cjs,jsx,mjsx,ts,tsx,mtsx}'],
    rules: {
      ...eslintConfigPrettier.rules,
      ...reactHooks.configs.recommended.rules,
      ...reactPlugin.configs['jsx-runtime'].rules,
    },
  },
  {
    ignores: [
      '.firebase',
      '.github/*',
      '.husky/*',
      '.vscode/*',
      'data/*',
      'dist/*',
      'forklift/*',
      'firebase-export-*/*',
      'maps/*',
      'mockups/*',
      'node_modules/*',
      'package-lock.json',
      'public/*',
      'scripts/*',
    ],
  },
);
