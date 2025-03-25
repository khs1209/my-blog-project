import { useState } from 'react';
import Link from 'next/link';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Home.module.css';

Modal.setAppElement('#__next');

export default function Home({ posts = [] }) {
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newPost, setNewPost] = useState({ title: '', description: '', tags: '', category: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  const filteredPosts = posts.filter((post) => {
    const title = post.title || ''; // title이 undefined일 경우 빈 문자열로 대체
    const matchesSearch = title.toLowerCase().includes(searchText.toLowerCase());
    const matchesTag = selectedTag ? post.tags && post.tags.includes(selectedTag) : true;
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    return matchesSearch && matchesTag && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  const allTags = [...new Set(posts.flatMap((post) => post.tags || []))];
  const allCategories = [...new Set(posts.map((post) => post.category).filter(Boolean))];

  const handleAddPost = async () => {
    const newPostData = {
      title: newPost.title,
      description: newPost.description,
      tags: newPost.tags ? newPost.tags.split(',').map((tag) => tag.trim()) : [], // 태그가 없으면 빈 배열
      category: newPost.category || '', // 카테고리가 없으면 빈 문자열
      content: '이곳은 새로 추가된 포스트의 내용입니다.', // 기본 콘텐츠
    };
  
    try {
      const response = await fetch('/api/uploadPost', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newPostData),
      });
  
      if (response.ok) {
        alert('포스트가 성공적으로 업로드되었습니다.');
        setNewPost({ title: '', description: '', tags: '', category: '' });
        setIsModalOpen(false);
        location.reload(); // 새로고침하여 새 포스트를 반영
      } else {
        const errorData = await response.json();
        alert(`오류 발생: ${errorData.error}`);
      }
    } catch (error) {
      console.error('Error uploading post:', error);
      alert('포스트 업로드 중 오류가 발생했습니다.');
    }
  };

  return (
    <div className={styles.container}>
      <h1>블로그 포스트</h1>
      <div className={styles.searchContainer}>
        <input
          type="text"
          placeholder="검색어를 입력하세요..."
          value={searchText}
          onChange={(e) => {
            setSearchText(e.target.value);
            setCurrentPage(1);
          }}
          className={styles.searchInput}
        />
      </div>

      <div className={styles.filters}>
        <span>태그 필터: </span>
        <select value={selectedTag} onChange={(e) => setSelectedTag(e.target.value)}>
          <option value="">전체</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>

      <div className={styles.filters}>
        <span>카테고리 필터: </span>
        <select value={selectedCategory} onChange={(e) => setSelectedCategory(e.target.value)}>
          <option value="">전체</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>

      <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
        <FontAwesomeIcon icon={faPlus} />
      </button>

      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel="새로운 포스트 추가"
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>새로운 포스트 추가</h2>
        <input
          type="text"
          placeholder="제목"
          value={newPost.title}
          onChange={(e) => setNewPost({ ...newPost, title: e.target.value })}
          className={styles.inputField}
        />
        <textarea
          placeholder="설명"
          value={newPost.description}
          onChange={(e) => setNewPost({ ...newPost, description: e.target.value })}
          className={styles.textareaField}
        />
        <input
          type="text"
          placeholder="태그 (쉼표로 구분)"
          value={newPost.tags}
          onChange={(e) => setNewPost({ ...newPost, tags: e.target.value })}
          className={styles.inputField}
        />
        <input
          type="text"
          placeholder="카테고리"
          value={newPost.category}
          onChange={(e) => setNewPost({ ...newPost, category: e.target.value })}
          className={styles.inputField}
        />
        <button onClick={handleAddPost} style={{ padding: '0.5rem 1rem' }}>
          추가
        </button>
        <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>
          취소
        </button>
      </Modal>

      <div style={{ marginTop: '2rem' }}>
        {paginatedPosts.map((post) => (
          <div key={post.slug} className={styles.post}>
            <Link href={`/posts/${post.slug}`}>
              <h2>{post.title}</h2>
            </Link>
            <p>{post.description}</p>
            {post.tags && <p className={styles.tags}>태그: {post.tags.join(', ')}</p>}
            {post.category && <p>카테고리: {post.category}</p>}
          </div>
        ))}
      </div>

      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, idx) => (
          <button
            key={idx + 1}
            onClick={() => setCurrentPage(idx + 1)}
            style={{
              marginRight: '0.5rem',
              background: currentPage === idx + 1 ? 'gray' : 'white',
            }}
          >
            {idx + 1}
          </button>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');

  const postsDirectory = path.join(process.cwd(), 'public', 'posts');
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(fileContents);

    return {
      slug: filename.replace(/\.mdx?$/, ''),
      title: data.title || '제목 없음', // 제목이 없으면 기본값 설정
      description: data.description || '설명 없음', // 설명이 없으면 기본값 설정
      tags: data.tags || [], // 태그가 없으면 빈 배열
      category: data.category || '', // 카테고리가 없으면 빈 문자열
    };
  });

  return {
    props: {
      posts,
    },
  };
}