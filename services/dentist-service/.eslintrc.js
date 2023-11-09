module.exports = {
    "parser": "@typescript-eslint/parser",
    "parserOptions": {
        "ecmaVersion": "latest",
        "sourceType": "module",
    },

     "plugins": ["@typescript-eslint"],
     "extends": ["eslint:recommended", "plugin:@typescript-eslint/recommended"],

    "rules": {
        "semi": ["error", "always"],
        "no-var": "error",
        "@typescript-eslint/no-unused-vars": "error",
        // to enforce using type for object type definitions, can be type or interface 
        "@typescript-eslint/consistent-type-definitions": ["error", "type"],
    },

    "env": {
        "es2021": true,
        "node": true
    }
}
