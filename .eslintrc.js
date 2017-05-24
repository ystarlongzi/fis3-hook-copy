// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    node: true,
  },
  globals: {
    fis: true,
  },
  extends: 'airbnb-base',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module',
  },
  rules: {
    'arrow-parens': [2, 'as-needed'],
    'brace-style': [2, 'stroustrup'],
    'no-underscore-dangle': 0,
    'prefer-const': [2, {
      destructuring: 'all',
    }],
  },
  plugins: [
    'babel',
  ],
};
