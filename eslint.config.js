const expo = require('eslint-config-expo/flat');
const prettier = require('eslint-config-prettier');

module.exports = [
  ...expo,
  prettier,
  {
    // Edge Functions are Deno code, checked with deno check and deno lint
    ignores: ['dist/**', 'node_modules/**', '.expo/**', 'supabase/functions/**'],
  },
];
