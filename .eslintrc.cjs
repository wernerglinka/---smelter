module.exports = {
  extends: [
    'eslint:recommended',
    'plugin:react/recommended',
    'plugin:react/jsx-runtime',
    'plugin:jsdoc/recommended',
    '@electron-toolkit',
    '@electron-toolkit/eslint-config-prettier'
  ],
  plugins: ['jsdoc'],
  settings: {
    jsdoc: {
      mode: 'typescript'
    }
  },
  rules: {
    'jsdoc/require-jsdoc': [
      'error',
      {
        publicOnly: false,
        require: {
          ArrowFunctionExpression: true,
          ClassDeclaration: true,
          ClassExpression: true,
          FunctionDeclaration: true,
          FunctionExpression: true,
          MethodDefinition: true
        },
        contexts: [
          'VariableDeclaration > VariableDeclarator > ArrowFunctionExpression',
          'ExportDefaultDeclaration > FunctionDeclaration',
          'ExportNamedDeclaration > FunctionDeclaration'
        ]
      }
    ],
    'jsdoc/require-param-description': 'error',
    'jsdoc/require-returns-description': 'error',
    'jsdoc/require-property-description': 'error',
    'jsdoc/require-param-type': 'error',
    'jsdoc/no-undefined-types': 'error',
    'jsdoc/check-param-names': 'error',
    'jsdoc/check-tag-names': 'error',
    'jsdoc/check-types': 'error',
    'jsdoc/tag-lines': ['error', 'never', { startLines: 1 }],
    'jsdoc/valid-types': 'error'
  }
};
