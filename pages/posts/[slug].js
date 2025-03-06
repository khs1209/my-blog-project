// pages/posts/[slug].js
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import Comments from '../../components/Comments';

export default function PostPage({ frontMatter, mdxSource, slug }) {
  return (
    <div>
      <h1>{frontMatter.title}</h1>
      <MDXRemote {...mdxSource} />
      {/* 댓글 컴포넌트 추가: postId로 slug 전달 */}
      <Comments postId={slug} />
    </div>
  );
}

export async function getStaticPaths() {
  const files = fs.readdirSync('posts');
  const paths = files.map((filename) => ({
    params: { slug: filename.replace(/\.mdx?$/, '') },
  }));

  return {
    paths,
    fallback: false,
  };
}

export async function getStaticProps({ params: { slug } }) {
  const markdownWithMeta = fs.readFileSync(
    path.join('posts', slug + '.mdx'),
    'utf-8'
  );
  const { data: frontMatter, content } = matter(markdownWithMeta);
  const mdxSource = await serialize(content, {
    mdxOptions: {
      rehypePlugins: [rehypePrism],
    },
  });

  return {
    props: {
      frontMatter,
      mdxSource,
      slug,
    },
  };
}
