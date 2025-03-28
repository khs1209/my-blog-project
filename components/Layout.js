// components/Layout.js
import React from 'react';
import Link from 'next/link';
import styles from '../styles/Layout.module.css';

export default function Layout({ children }) {
  return (
    <div className={styles.container}>
      {/* 공통 헤더 */}
      <header className={styles.header}>
        <h1 className={styles.title}>
          <Link href="/">My Next.js Blog</Link>
        </h1>
        <nav className={styles.nav}>
          <Link href="/">홈</Link>
          {/*<Link href="/about">소개</Link>*/}
          {/*<Link href="/contact">연락처</Link>*/}
        </nav>
      </header>

      {/* 메인 콘텐츠 */}
      <main className={styles.main}>{children}</main>

      {/* 공통 푸터 */}
      <footer className={styles.footer}>
        <p>&copy; 2025 My Next.js Blog.</p>
      </footer>
    </div>
  );
}