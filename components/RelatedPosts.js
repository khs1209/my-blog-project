import Link from 'next/link';
import styles from '../styles/RelatedPosts.module.css';

export default function RelatedPosts({ posts, currentSlug }) {
  const relatedPosts = posts.filter((post) => post.slug !== currentSlug).slice(0, 3);

  return (
    <div className={styles.relatedPosts}>
      <h3>추천 게시물</h3>
      <ul>
        {relatedPosts.map((post) => (
          <li key={post.slug}>
            <Link href={`/posts/${post.slug}`}>
              <a>{post.title}</a>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}