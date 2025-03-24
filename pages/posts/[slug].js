import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import rehypePrism from 'rehype-prism';
import styles from '../../styles/PostPage.module.css';
import SocialShare from '../../components/SocialShare';
import RelatedPosts from '../../components/RelatedPosts';

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

// getStaticPaths 함수 추가: posts 폴더 내의 모든 파일을 읽어 slug 목록을 반환합니다.
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

  return {
    paths,
    fallback: false, // 추가 경로를 처리하려면 true 또는 'blocking'으로 변경
  };
}
export async function getStaticProps({ params: { slug } }) {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filePath = path.join(postsDirectory, `${slug}.mdx`);

  let frontMatter = {};
  let content = '';

  try {
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const parsed = matter(markdownWithMeta);
    frontMatter = parsed.data;
    content = parsed.content;
  } catch (error) {
    console.error(`Error reading file for slug "${slug}":`, error);
    return {
      notFound: true, // 파일을 읽지 못하면 404 페이지로 리다이렉트
    };
  }

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
