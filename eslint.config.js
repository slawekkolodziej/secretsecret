import js from '@eslint/js';
import tsPlugin from '@typescript-eslint/eslint-plugin';
import tsParser from '@typescript-eslint/parser';
import astroPlugin from 'eslint-plugin-astro';
import sveltePlugin from 'eslint-plugin-svelte';
import svelteParser from 'svelte-eslint-parser';
import globals from 'globals';
import prettierConfig from 'eslint-config-prettier';
import prettierPlugin from 'eslint-plugin-prettier';

// Shared configuration
const sharedConfig = {
  languageOptions: {
    globals: {
      ...globals.browser,
      ...globals.es2021
    }
  },
  plugins: {
    '@typescript-eslint': tsPlugin,
    prettier: prettierPlugin
  },
  rules: {
    ...prettierConfig.rules,
    'prettier/prettier': 'error',
    'no-unused-vars': 'off',
    '@typescript-eslint/no-unused-vars': [
      'error',
      {
        ignoreRestSiblings: true,
        args: 'all',
        argsIgnorePattern: '^_',
        caughtErrors: 'all',
        caughtErrorsIgnorePattern: '^_',
        destructuredArrayIgnorePattern: '^_',
        varsIgnorePattern: '^_'
      }
    ],
    '@typescript-eslint/no-explicit-any': 'warn',
    '@typescript-eslint/ban-ts-comment': 'warn'
  }
};

export default [
  js.configs.recommended,
  {
    files: ['**/*.ts', '**/*.js'],
    languageOptions: {
      ...sharedConfig.languageOptions,
      parser: tsParser,
      parserOptions: {
        ecmaVersion: 'latest',
        sourceType: 'module',
        project: './tsconfig.json'
      }
    },
    plugins: {
      ...sharedConfig.plugins
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...sharedConfig.rules
    }
  },
  {
    files: ['**/*.svelte'],
    languageOptions: {
      ...sharedConfig.languageOptions,
      parser: svelteParser,
      parserOptions: {
        parser: tsParser
      }
    },
    plugins: {
      ...sharedConfig.plugins,
      svelte: sveltePlugin
    },
    rules: {
      ...tsPlugin.configs.recommended.rules,
      ...sveltePlugin.configs.recommended.rules,
      ...sharedConfig.rules
    }
  },
  ...astroPlugin.configs.recommended.map((config) => ({
    ...config,
    languageOptions: {
      ...config.languageOptions,
      ...sharedConfig.languageOptions,
      globals: {
        ...config.languageOptions?.globals,
        ...sharedConfig.languageOptions.globals,
        ...globals.node
      }
    },
    plugins: {
      ...config.plugins,
      ...sharedConfig.plugins
    },
    rules: {
      ...config.rules,
      ...sharedConfig.rules
    }
  }))
];
