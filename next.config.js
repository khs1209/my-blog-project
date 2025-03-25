// next.config.js
const withMDX = require('@next/mdx')({
  extension: /\.(md|mdx)$/,
});

module.exports = withMDX({
  pageExtensions: ['js', 'jsx', 'md', 'mdx'],
  webpack(config) {
    config.module.rules.push({
      test: /\.mdx?$/,
      use: 'raw-loader', // MDX 파일을 직접 읽기 위해 추가
    });
    return config;
  },
});
