// @ts-check
const eslint = require('@eslint/js');
const { defineConfig } = require('eslint/config');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = defineConfig([
  {
    // Codice legacy non ancora portato: ogni commit di porting toglie la sua voce.
    ignores: [
      'src/app/core/**',
      'src/app/data/**',
      'src/app/shared/**',
      'src/app/features/home/**',
      'src/app/features/login/**',
      'src/app/features/ricette/**',
      'src/app/features/ricetta/**',
      'src/app/features/listini/**',
      'src/app/features/listino/**',
      'src/app/features/menus/**',
      'src/app/features/menu/**',
      'src/app/features/foodcost/**',
      'src/app/features/schedeproduzione/**',
      'src/app/features/archiviodocumenti/**',
    ],
  },
  {
    files: ['**/*.ts'],
    extends: [
      eslint.configs.recommended,
      tseslint.configs.recommended,
      tseslint.configs.stylistic,
      angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    rules: {
      '@angular-eslint/directive-selector': [
        'error',
        {
          type: 'attribute',
          prefix: 'ric',
          style: 'camelCase',
        },
      ],
      '@angular-eslint/component-selector': [
        'error',
        {
          type: 'element',
          prefix: 'ric',
          style: 'kebab-case',
        },
      ],
    },
  },
  {
    files: ['**/*.html'],
    extends: [angular.configs.templateRecommended, angular.configs.templateAccessibility],
    rules: {},
  },
]);
