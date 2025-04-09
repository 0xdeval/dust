import { includeIgnoreFile } from "@eslint/compat";
import jsPlugin from "@eslint/js";
import nextJsPlugin from "@next/eslint-plugin-next";
import reactQueryPlugin from "@tanstack/eslint-plugin-query";
import reactPlugin from "eslint-plugin-react";
import reactHooksPlugin from "eslint-plugin-react-hooks";
import * as regexpPlugin from "eslint-plugin-regexp";
import jsxA11yPlugin from "eslint-plugin-jsx-a11y";
import noCyrillicStringPlugin from "eslint-plugin-no-cyrillic-string";
import globals from "globals";
import path from "node:path";
import { fileURLToPath } from "node:url";
import tseslint from "typescript-eslint";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const gitignorePath = path.resolve(__dirname, ".gitignore");

export default tseslint.config(
  includeIgnoreFile(gitignorePath),

  { files: ["**/*.{js,mjs,cjs,ts,jsx,tsx}", "**/*.pw.tsx"] },
  {
    ignores: [
      "src/configs/theme/**",
      "abi",
      "public/",
      ".git/",
      "next.config.js",
      ".next/",
      ".vercel/",
      "node_modules/",
    ],
  },
  { languageOptions: { globals: { ...globals.browser, ...globals.node } } },
  { settings: { react: { version: "detect" } } },

  jsPlugin.configs.recommended,

  {
    plugins: { "@typescript-eslint": tseslint.plugin },
    languageOptions: {
      parser: tseslint.parser,
      parserOptions: { projectService: true },
    },
    rules: {
      "@typescript-eslint/array-type": ["error", { default: "generic", readonly: "generic" }],
      "@typescript-eslint/consistent-type-imports": ["error"],
      "@typescript-eslint/naming-convention": [
        "error",
        {
          selector: "default",
          format: ["camelCase", "UPPER_CASE"],
          leadingUnderscore: "allow",
          trailingUnderscore: "forbid",
        },
        {
          selector: "interface",
          format: ["PascalCase"],
          custom: {
            regex: "^I[A-Z]",
            match: false,
          },
        },
        {
          selector: "typeAlias",
          format: ["PascalCase"],
          custom: {
            regex: "^T[A-Z]",
            match: false,
          },
        },
        {
          selector: "variableLike",
          format: ["camelCase", "UPPER_CASE"],
        },
        {
          selector: "function",
          format: ["camelCase"],
        },
        {
          selector: "typeParameter",
          format: ["PascalCase"],
        },
        {
          selector: "enumMember",
          format: ["UPPER_CASE"],
        },
        {
          selector: "class",
          format: ["PascalCase"],
        },
        {
          selector: "property",
          format: ["camelCase"],
        },
        {
          selector: "method",
          format: ["camelCase"],
        },
      ],
      "@typescript-eslint/no-empty-function": ["off"],
      "@typescript-eslint/no-use-before-define": "off",
      "@typescript-eslint/no-useless-constructor": ["error"],
      "@typescript-eslint/no-explicit-any": ["error", { ignoreRestArgs: true }],
      "@typescript-eslint/no-unused-expressions": [
        "error",
        { allowShortCircuit: true, allowTernary: true },
      ],
    },
  },

  { files: ["**/*.{js,mjs}"], ...tseslint.configs.disableTypeChecked },

  {
    plugins: { react: reactPlugin },
    rules: {
      "react/jsx-key": "error",
      "react/jsx-no-bind": ["error", { ignoreRefs: true }],
      "react/jsx-curly-brace-presence": ["error", { props: "never", children: "never" }],
      "react/jsx-equals-spacing": ["error", "never"],
      "react/jsx-fragments": ["error", "syntax"],
      "react/jsx-no-duplicate-props": "error",
      "react/no-deprecated": "error",
      "react/no-unknown-property": "error",
    },
  },

  {
    plugins: { "@next/next": nextJsPlugin },
    rules: {
      ...nextJsPlugin.configs.recommended.rules,
      ...nextJsPlugin.configs["core-web-vitals"].rules,
    },
  },

  { plugins: { "@tanstack/query": reactQueryPlugin } },

  {
    plugins: { "react-hooks": reactHooksPlugin },
    ignores: ["**/*.pw.tsx", "playwright/**"],
    rules: {
      "react-hooks/rules-of-hooks": "error",
      "react-hooks/exhaustive-deps": "error",
    },
  },

  regexpPlugin.configs["flat/recommended"],

  {
    plugins: { "no-cyrillic-string": noCyrillicStringPlugin },
    rules: { "no-cyrillic-string/no-cyrillic-string": "error" },
  },

  {
    plugins: { "jsx-a11y": jsxA11yPlugin },
    languageOptions: { parserOptions: { ecmaFeatures: { jsx: true } } },
  },

  {
    rules: {
      "no-console": "off",
      eqeqeq: ["error", "allow-null"],
      "id-match": ["error", "^[\\w$]+$"],
      "max-len": ["error", 160, 4],
      "no-implicit-coercion": ["error", { number: true, boolean: true, string: true }],
      "no-multi-str": "error",
      "no-spaced-func": "error",
      "no-with": "error",
      "object-shorthand": "off",
      "one-var": ["error", "never"],
      "prefer-const": "error",
      "no-empty": ["error", { allowEmptyCatch: true }],
      "no-unused-vars": "off",
      "no-unused-expressions": "off",
      "no-redeclare": "off",
      "no-use-before-define": "off",
      "no-useless-constructor": "off",
    },
    linterOptions: { reportUnusedDisableDirectives: "error" },
  }
);
