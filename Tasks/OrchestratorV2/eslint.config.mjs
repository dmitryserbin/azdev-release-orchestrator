import globals from "globals"
import pluginJs from "@eslint/js"
import tseslint from "typescript-eslint"

/** @type {import('eslint').Linter.Config[]} */
export default [
	{ files: ["**/*.{ts}"] },
	{ ignores: ["**/*.js"] },
	{ languageOptions: { globals: globals.node } },
	pluginJs.configs.recommended,
	...tseslint.configs.strict,
	{
		rules: {
			semi: ["error", "never"],
			"@typescript-eslint/no-non-null-assertion": "off",
		},
	},
]
