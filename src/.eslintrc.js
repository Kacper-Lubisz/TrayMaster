/*
*
* This is the ESLint config file that is used by default for files in /src
* It configures the linting rules that automatically appear inline within WebStorm
*
* We currently use some rules that require full type-analysis, which might be too CPU intensive to run by default
* If this becomes a problem, we can remove them from this file and place into another file .eslintrc-full.js
* And then only run full linting on demand with `eslint ./src/ --ext .js,.jsx,.ts,.tsx --config ./src/.eslintrc-full.js`
*
* See below for more details on the rules, and which ones require full type-analysis
* We currently use all of the recommended ones (which I've manually tweaked) and I've enabled a few more too
* https://github.com/typescript-eslint/typescript-eslint/tree/master/packages/eslint-plugin
*
*/

// noinspection ES6ConvertModuleExportToExport
module.exports = {
    // This ensures ESLint doesn't look at parent directories' ESLint configs. Those above /src have their own rules in package.json
    "root": true,
    "extends": [
        "react-app",
        // Enable all of the recommended ESLint & TypeScript-specific rules
        "eslint:recommended",
        "plugin:@typescript-eslint/eslint-recommended",
        "plugin:@typescript-eslint/recommended",
        "plugin:@typescript-eslint/recommended-requiring-type-checking"
    ],
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "tsconfigRootDir": `${__dirname}/../`,
        "project": `tsconfig.json`
    },
    "plugins": [
        "@typescript-eslint"
    ],
    // Fine-tune the recommended rules, and add some more
    "rules": {

        // For these rules, disable ESLint's default implementations to use TypeScript-specific replacements
        "semi": "off",
        "@typescript-eslint/semi": [
            "warn",
            "always"
        ],
        "no-extra-semi": "off",
        "@typescript-eslint/no-extra-semi": "warn",
        "brace-style": "off",
        "@typescript-eslint/brace-style": [
            "warn",
            "1tbs"
        ],
        "func-call-spacing": "off",
        "@typescript-eslint/func-call-spacing": [
            "warn",
            "never"
        ],
        "quotes": "off",
        "@typescript-eslint/quotes": [
            "warn",
            "double",
            {
                "avoidEscape": false
            }
        ],
        "require-await": "off",
        "@typescript-eslint/require-await": "warn",
        "no-unused-expressions": "off",
        "@typescript-eslint/no-unused-expressions": "warn",
        "no-unused-vars": "off",
        "@typescript-eslint/no-unused-vars-experimental": "warn",

        // Disable this rule from recommended, we use it too much atm :'(
        "@typescript-eslint/no-explicit-any": "off",

        // These rules don't have an equivalent in ESLint to disable
        "@typescript-eslint/no-throw-literal": "warn",
        "@typescript-eslint/promise-function-async": "warn",
        "@typescript-eslint/no-extra-non-null-assertion": "warn",
        "@typescript-eslint/explicit-function-return-type": [
            "warn",
            {
                "allowExpressions": true
            }
        ],
        "@typescript-eslint/prefer-for-of": "warn",
        "@typescript-eslint/no-unnecessary-condition": "warn",
        "@typescript-eslint/prefer-nullish-coalescing": "warn",
        "@typescript-eslint/prefer-optional-chain": "warn",
        "@typescript-eslint/no-unnecessary-type-assertion": "warn",
        "@typescript-eslint/restrict-plus-operands": [
            "warn",
            {
                "checkCompoundAssignments": true
            }
        ]
    }
};