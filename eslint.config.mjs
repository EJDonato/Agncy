import { FlatCompat } from "@eslint/eslintrc";

const compat = new FlatCompat({ baseDirectory: import.meta.dirname });

const config = [
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    ignores: [".next/**", "data/**", "lib/db/migrations/**", "next-env.d.ts", "scratch/**"],
  },
];

export default config;
