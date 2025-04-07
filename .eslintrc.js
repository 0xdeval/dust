// .eslintrc.js
module.exports = {
  root: true,
  parser: "@typescript-eslint/parser",
  parserOptions: {
    ecmaVersion: 2020,
    sourceType: "module",
  },
  plugins: [
    "react",
    "react-hooks",
    "@typescript-eslint",
    "jsx-a11y",
    "import",
    "unused-imports",
  ],
  extends: [
    "eslint:recommended",
    "plugin:react/recommended",
    "plugin:@typescript-eslint/recommended",
    "plugin:jsx-a11y/recommended",
    "plugin:import/errors",
    "plugin:import/warnings",
    "plugin:import/typescript",
    "prettier", // disables conflicting ESLint rules
  ],
  rules: {
    "react/react-in-jsx-scope": "off", // Next.js doesn't require React in scope
    "unused-imports/no-unused-imports": "error",
    "react-hooks/rules-of-hooks": "error",
    "react-hooks/exhaustive-deps": "warn",
  },
  settings: {
    react: {
      version: "detect",
    },
  },
};
