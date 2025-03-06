import { useState } from 'react';
import Link from 'next/link';
import Modal from 'react-modal';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faPlus, faSearch } from '@fortawesome/free-solid-svg-icons';
import styles from '../styles/Home.module.css';

Modal.setAppElement('#__next');

export default function Home({ posts }) {
  // 검색어 및 필터 상태
  const [searchText, setSearchText] = useState('');
  const [selectedTag, setSelectedTag] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [newPost, setNewPost] = useState({ title: '', description: '', tags: '', category: '' });
  const [isModalOpen, setIsModalOpen] = useState(false);

  // (나중에 페이지네이션과 함께 사용)
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  // 검색 및 필터에 따른 포스트 필터링
  const filteredPosts = posts.filter(post => {
    const matchesSearch = post.title.toLowerCase().includes(searchText.toLowerCase());
    const matchesTag = selectedTag ? post.tags && post.tags.includes(selectedTag) : true;
    const matchesCategory = selectedCategory ? post.category === selectedCategory : true;
    return matchesSearch && matchesTag && matchesCategory;
  });

  // 페이지네이션을 위한 계산 (2단계와 연계)
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice((currentPage - 1) * postsPerPage, currentPage * postsPerPage);

  // 모든 태그, 카테고리 리스트 생성 (중복 제거)
  const allTags = [...new Set(posts.flatMap(post => post.tags || []))];
  const allCategories = [...new Set(posts.map(post => post.category).filter(Boolean))];

  // 새로운 포스트 추가 핸들러
  const handleAddPost = () => {
    const newPostData = {
      ...newPost,
      tags: newPost.tags.split(',').map(tag => tag.trim()),
      slug: newPost.title.toLowerCase().replace(/ /g, '-'),
    };
    posts.push(newPostData);
    setNewPost({ title: '', description: '', tags: '', category: '' });
    setCurrentPage(1);
    setIsModalOpen(false);
  };
  

  return (
    <div className={styles.container}>
      <h1>블로그 포스트</h1>
      {/* 검색 입력 */}
      <div className={styles.searchContainer}>
        <input 
          type="text" 
          placeholder="검색어를 입력하세요..." 
          value={searchText}
          onChange={(e) => { setSearchText(e.target.value); setCurrentPage(1); }}
          className={styles.searchInput}
        />
        <FontAwesomeIcon icon={faSearch} className={styles.searchIcon} />
      </div>

      {/* 태그 필터 */}
      <div className={styles.filters}>
        <span>태그 필터: </span>
        <select value={selectedTag} onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}>
          <option value="">전체</option>
          {allTags.map(tag => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* 카테고리 필터 */}
      <div className={styles.filters}>
        <span>카테고리 필터: </span>
        <select value={selectedCategory} onChange={(e) => { setSelectedCategory(e.target.value); setCurrentPage(1); }}>
          <option value="">전체</option>
          {allCategories.map(category => (
            <option key={category} value={category}>{category}</option>
          ))}
        </select>
      </div>

      {/* 새로운 포스트 추가 아이콘 버튼 */}
      <button onClick={() => setIsModalOpen(true)} className={styles.addButton}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
      
      {/* 새로운 포스트 추가 모달 */}
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
        <button onClick={handleAddPost} style={{ padding: '0.5rem 1rem' }}>추가</button>
        <button onClick={() => setIsModalOpen(false)} style={{ padding: '0.5rem 1rem', marginLeft: '1rem' }}>취소</button>
      </Modal>

      {/* 필터 및 페이지네이션된 포스트 렌더링 */}
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

      {/* 페이지네이션 컨트롤 (단계 2와 연계) */}
      <div className={styles.pagination}>
        {Array.from({ length: totalPages }, (_, idx) => (
          <button 
            key={idx + 1} 
            onClick={() => setCurrentPage(idx + 1)}
            style={{
              marginRight: '0.5rem',
              background: currentPage === idx + 1 ? 'gray' : 'white'
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
  // 서버 사이드에서만 사용되는 모듈은 require()로 불러오기
  const fs = require('fs');
  const path = require('path');
  const matter = require('gray-matter');

  const postsDirectory = path.join(process.cwd(), 'posts');
  const files = fs.readdirSync(postsDirectory);
  const posts = files.map((filename) => {
    const slug = filename.replace(/\.mdx?$/, '');
    const filePath = path.join(postsDirectory, filename);
    const markdownWithMeta = fs.readFileSync(filePath, 'utf-8');
    const { data } = matter(markdownWithMeta);
    return {
      slug,
      ...data,
    };
  });
  return {
    props: { posts },
  };
}