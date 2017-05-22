// http://eslint.org/docs/user-guide/configuring
module.exports = {
  root: true,
  env: {
    node: true,
  },
  globals: {
    fis: true
  },
  extends: 'eslint-config-airbnb',
  parser: 'babel-eslint',
  parserOptions: {
    sourceType: 'module'
  },
  plugins: [
    'babel',
  ],
};
