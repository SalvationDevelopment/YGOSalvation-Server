import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";

const eslintConfig = defineConfig([
  ...nextVitals,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
  ]),
  {
    files: ["**/*.{js,jsx,mjs,cjs}"],
    rules: {
      // Allow React and platform boundary cases like `return null` or `useRef(null)`,
      // but block the most common internal-state null patterns in the UI codebase.
      "no-restricted-syntax": [
        "error",
        {
          selector:
            "VariableDeclarator[init.type='Literal'][init.value=null]",
          message:
            "Do not initialize internal UI variables with null. Prefer undefined, empty values, or an explicit sentinel.",
        },
        {
          selector:
            "AssignmentExpression[right.type='Literal'][right.value=null]",
          message:
            "Do not assign null to internal UI state. Prefer undefined, empty values, or an explicit sentinel.",
        },
        {
          selector:
            "Property[value.type='Literal'][value.value=null]",
          message:
            "Do not use null in internal UI object shapes. Prefer undefined, empty values, or an explicit sentinel.",
        },
        {
          selector:
            "ArrayExpression > Literal[value=null]",
          message:
            "Do not use null array placeholders in UI state. Prefer a named sentinel or a different shape.",
        },
      ],
    },
  },
]);

export default eslintConfig;
