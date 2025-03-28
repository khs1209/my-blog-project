// components/RelatedPosts.js
import { useEffect, useState } from "react";
import styles from "../styles/RelatedPosts.module.css";

export default function RelatedPosts({ currentSlug }) {
  // 더미 데이터로 관련 게시물 정의
  const posts = [
    { id: 1, title: "테스트 게시물 1" },
    { id: 2, title: "테스트 게시물 2" },
    { id: 3, title: "테스트 게시물 3" },
  ];

  return (
    <div className={styles.container}>
      <h3>관련 게시물</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id} className={styles.post}>
            <p className={styles.title}>{post.title}</p>
          </div>
        ))
      ) : (
        <p>관련 게시물이 없습니다.</p>
      )}
    </div>
  );
}