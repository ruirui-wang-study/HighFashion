import nextVitals from "eslint-config-next/core-web-vitals";
import nextTypescript from "eslint-config-next/typescript";

const eslintConfig = [
  { ignores: ["api/dist/**", "api/node_modules/**", "api/coverage/**"] },
  ...nextVitals,
  ...nextTypescript,
];

export default eslintConfig;
