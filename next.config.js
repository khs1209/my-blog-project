// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
});
module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
});
