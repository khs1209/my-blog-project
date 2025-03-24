import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { serialize } from 'next-mdx-remote/serialize';
import { MDXRemote } from 'next-mdx-remote';
import Comments from '../../components/Comments';
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

export async function getStaticPaths() {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  const paths = filenames.map((filename) => ({
    params: { slug: filename.replace(/\.mdx?$/, '') },
  }));

  return {
    paths,
    fallback: false, // fallback을 필요에 따라 true 또는 'blocking'으로 변경할 수 있습니다.
  };
}

export async function getStaticProps({ params: { slug } }) {
  const postsDirectory = path.join(process.cwd(), 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  const allPosts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContents);

    return {
      slug: filename.replace(/\.mdx?$/, ''),
      ...data,
    };
  });

  const markdownWithMeta = fs.readFileSync(path.join(postsDirectory, slug + '.mdx'), 'utf-8');
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
      allPosts,
    },
  };
}
