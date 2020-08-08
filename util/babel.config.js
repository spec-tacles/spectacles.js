module.exports = {
  presets: [
    ['@babel/preset-env', {targets: {node: 'current'}}],
     '@babel/preset-typescript',
  ],
  plugins: [
    '@babel/plugin-syntax-bigint',
    ['@babel/plugin-proposal-class-properties', { 'loose': true }]
  ]
};
