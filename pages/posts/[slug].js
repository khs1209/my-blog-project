import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import rehypePrism from 'rehype-prism';
import styles from '../../styles/PostPage.module.css';
import SocialShare from '../../components/SocialShare';
import RelatedPosts from '../../components/RelatedPosts';

export default function PostPage({ frontMatter, mdxSource, slug, allPosts, error }) {
  if (error) {
    return <p className={styles.error}>{error}</p>;
  }

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

export async function getStaticProps({ params }) {
  const postsDirectory = path.join(process.cwd(), 'content', 'posts'); // 변경된 경로
  const filePath = path.join(postsDirectory, `${params.slug}.mdx`);

  console.log('File path:', filePath); // 디버깅용 출력

  if (!fs.existsSync(filePath)) {
    return { notFound: true };
  }

  try {
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const { data, content } = matter(fileContent);
    
    console.log('Post data:', data); // 디버깅용 출력

    const mdxSource = await serialize(content, {
      mdxOptions: {
        rehypePlugins: [rehypePrism],
      },
    });

    const filenames = fs.readdirSync(postsDirectory);
    const allPosts = filenames
      .filter((filename) => filename.endsWith('.mdx'))
      .map((filename) => {
        const fileContent = fs.readFileSync(path.join(postsDirectory, filename), 'utf8');
        const { data } = matter(fileContent);
        return { slug: filename.replace(/\.mdx?$/, ''), ...data };
      });

    return {
      props: {
        frontMatter: data,
        mdxSource,
        slug: params.slug,
        allPosts,
        error: null,
      },
    };
  } catch (error) {
    console.error('Error reading post:', error);

    if (error.code === 'EACCES' || error.code === 403) {
      return {
        props: {
          frontMatter: null,
          mdxSource: null,
          slug: params.slug,
          allPosts: [],
          error: '접근 권한이 없습니다.',
        },
      };
    }

    return { notFound: true };
  }
}

export async function getStaticPaths() {
  const fs = require('fs');
  const path = require('path');

  // posts 디렉토리를 content/posts로 변경
  const postsDirectory = path.join(process.cwd(), 'content', 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace(/\.mdx?$/, '') },
  }));

  console.log('Generated paths:', paths);

  return {
    paths,
    fallback: false, // 추가 경로를 처리하려면 true 또는 'blocking'으로 변경
  };
}
