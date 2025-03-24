import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import rehypePrism from 'rehype-prism';
import styles from '../../styles/PostPage.module.css';
import SocialShare from '../components/SocialShare';
import RelatedPosts from '../components/RelatedPosts';

export default function PostPage({ frontMatter, mdxSource, slug, allPosts }) {
  return (
    <article className={styles.postContainer}>
      <h1 className={styles.title}>{frontMatter.title}</h1>
      <p className={styles.description}>{frontMatter.description}</p>
      <div className={styles.tags}>
        {frontMatter.tags.map((tag, index) => (
          <span key={index} className={styles.tag}>
            #{tag}
          </span>
        ))}
      </div>
      <div className={styles.content}>
        <MDXRemote {...mdxSource} />
      </div>
      <SocialShare url={`https://yourdomain.com/posts/${slug}`} title={frontMatter.title} />
      <RelatedPosts posts={allPosts} currentSlug={slug} />
    </article>
  );
}

// ✅ getStaticPaths는 한 번만 정의해야 함
export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), 'posts');

  let filenames = [];
  try {
    filenames = fs.readdirSync(postsDirectory);
  } catch (error) {
    console.error('Error reading posts directory:', error);
  }

  if (filenames.length === 0) {
    console.warn('No MDX files found in the posts directory.');
  }

  const paths = filenames
    .filter((filename) => filename.endsWith('.mdx')) // .mdx 파일만 필터링
    .map((filename) => ({
      params: { slug: filename.replace(/\.mdx?$/, '') },
    }));

  console.log('Generated paths:', paths); // 디버깅용 출력

  return {
    paths,
    fallback: false, // 추가 경로를 처리하려면 true 또는 'blocking'으로 변경
  };
}

