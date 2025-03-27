import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Modal from "react-modal";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faPlus, faSearch } from "@fortawesome/free-solid-svg-icons";
import styles from "../styles/Home.module.css";

Modal.setAppElement("#__next");

export default function Home({ posts: initialPosts = [] }) {
  const [posts, setPosts] = useState(initialPosts); // 초기 posts 데이터를 상태로 설정
  const [searchText, setSearchText] = useState("");
  const [selectedTag, setSelectedTag] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [menuVisible, setMenuVisible] = useState(null); // 드롭다운 메뉴 상태

  // 새로운 포스트 관련 상태
  const [newPost, setNewPost] = useState({
    title: "",
    description: "",
    tags: "",
    category: "",
    content: "",
  });
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isEditing, setIsEditing] = useState(false); // 수정 모드 여부
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 5;

  useEffect(() => {
    const handleClickOutside = (event) => {
      // 클릭 대상이 드롭다운 메뉴나 메뉴 버튼 내부에 없다면 닫기
      if (
        !event.target.closest(`.${styles.dropdownMenu}`) &&
        !event.target.closest(`.${styles.menuButton}`)
      ) {
        setMenuVisible(null);
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  const toggleMenu = (slug) => {
    setMenuVisible((prev) => (prev === slug ? null : slug));
  };

  const filteredPosts = posts.filter((post) => {
    const title = post.title || "";
    const matchesSearch = title
      .toLowerCase()
      .includes(searchText.toLowerCase());
    const matchesTag = selectedTag
      ? post.tags && post.tags.includes(selectedTag)
      : true;
    const matchesCategory = selectedCategory
      ? post.category === selectedCategory
      : true;
    return matchesSearch && matchesTag && matchesCategory;
  });

  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);
  const paginatedPosts = filteredPosts.slice(
    (currentPage - 1) * postsPerPage,
    currentPage * postsPerPage
  );

  const allTags = [...new Set(posts.flatMap((post) => post.tags || []))];
  const allCategories = [
    ...new Set(posts.map((post) => post.category).filter(Boolean)),
  ];

  // 새 게시글 추가를 위한 모달 열기
  const openModalForNewPost = () => {
    setIsEditing(false);
    setNewPost({
      title: "",
      description: "",
      tags: "",
      category: "",
      content: "",
    });
    setIsModalOpen(true);
  };

  // 게시글 수정을 위한 모달 열기
  const openModalForEditPost = (post) => {
    setIsEditing(true);
    setNewPost({
      ...post,
      // tags가 배열이면 쉼표 구분 문자열로 변환, 없으면 빈 문자열로 설정
      tags: Array.isArray(post.tags) ? post.tags.join(", ") : post.tags || "",
      // category가 없으면 빈 문자열로 설정
      category: post.category || "",
      content: post.content || "",
    });
    setIsModalOpen(true);
  };

  // 저장 버튼: 추가 또는 수정 모드에 따라 분기 처리
  const handleSavePost = async () => {
    if (isEditing) {
      await handleEditPost();
    } else {
      await handleAddPost();
    }
  };

  const handleAddPost = async () => {
    const slug = newPost.title.toLowerCase().replace(/ /g, "-");
    const newPostData = {
      slug,
      title: newPost.title,
      description: newPost.description,
      tags: newPost.tags
        ? newPost.tags.split(",").map((tag) => tag.trim())
        : [], // 태그가 없으면 빈 배열
      category: newPost.category || "", // 카테고리가 없으면 빈 문자열
      content: newPost.content || "이곳은 새로 추가된 포스트의 내용입니다.",
    };

    try {
      const response = await fetch("/api/uploadPost", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newPostData),
      });

      if (response.ok) {
        alert("포스트가 성공적으로 업로드되었습니다.");
        setPosts((prevPosts) => [newPostData, ...prevPosts]);
        setNewPost({
          title: "",
          description: "",
          tags: "",
          category: "",
          content: "",
        });
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`오류 발생: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error uploading post:", error);
      alert("포스트 업로드 중 오류가 발생했습니다.");
    }
  };

  const handleEditPost = async () => {
    const updatedPostData = {
      slug: newPost.slug,
      title: newPost.title,
      description: newPost.description,
      tags: newPost.tags
        ? newPost.tags.split(",").map((tag) => tag.trim())
        : [], // 태그가 없으면 빈 배열
      category: newPost.category || "", // 카테고리가 없으면 빈 문자열
      content: newPost.content || "이곳은 새로 추가된 포스트의 내용입니다.",
    };

    try {
      const response = await fetch("/api/editPost", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(updatedPostData),
      });

      if (response.ok) {
        alert("게시글이 성공적으로 수정되었습니다.");
        // 상태 업데이트: 수정된 게시글을 상태에 반영
        setPosts((prevPosts) =>
          prevPosts.map((post) =>
            post.slug === updatedPostData.slug
              ? { ...post, ...updatedPostData }
              : post
          )
        );
        setIsModalOpen(false);
      } else {
        const errorData = await response.json();
        alert(`오류 발생: ${errorData.error}`);
      }
    } catch (error) {
      console.error("Error editing post:", error);
      alert("게시글 수정 중 오류가 발생했습니다.");
    }
  };

  return (
    <div className={styles.container}>
      <h1>블로그 포스트</h1>
      {/* 검색 필드 */}
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
      {/* 태그 필터 */}
      <div className={styles.filters}>
        <span>태그 필터: </span>
        <select
          value={selectedTag}
          onChange={(e) => setSelectedTag(e.target.value)}
        >
          <option value="">전체</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>
              {tag}
            </option>
          ))}
        </select>
      </div>
      {/* 카테고리 필터 */}
      <div className={styles.filters}>
        <span>카테고리 필터: </span>
        <select
          value={selectedCategory}
          onChange={(e) => setSelectedCategory(e.target.value)}
        >
          <option value="">전체</option>
          {allCategories.map((category) => (
            <option key={category} value={category}>
              {category}
            </option>
          ))}
        </select>
      </div>
      {/* 새로운 포스트 추가 버튼 */}
      <button onClick={openModalForNewPost} className={styles.addButton}>
        <FontAwesomeIcon icon={faPlus} />
      </button>
      {/* 새로운 포스트 추가 / 수정 모달 */}
      <Modal
        isOpen={isModalOpen}
        onRequestClose={() => setIsModalOpen(false)}
        contentLabel={isEditing ? "게시글 수정" : "새로운 포스트 추가"}
        className={styles.modal}
        overlayClassName={styles.overlay}
      >
        <h2>{isEditing ? "게시글 수정" : "새로운 포스트 추가"}</h2>
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
          onChange={(e) =>
            setNewPost({ ...newPost, description: e.target.value })
          }
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
        <button onClick={handleSavePost} style={{ padding: "0.5rem 1rem" }}>
          {isEditing ? "수정 완료" : "업로드"}
        </button>
        <button
          onClick={() => setIsModalOpen(false)}
          style={{ padding: "0.5rem 1rem", marginLeft: "1rem" }}
        >
          취소
        </button>
      </Modal>
      {/* 게시글 목록 */}
      <div style={{ marginTop: "2rem" }}>
        {posts.map((post) => (
          <div key={post.slug} className={styles.post}>
            <div className={styles.postHeader}>
              <div className={styles.postContent}>
                <Link href={`/posts/${post.slug}`}>
                  <h2>{post.title}</h2>
                </Link>
                <p>{post.description}</p>
                {post.tags && (
                  <p className={styles.tags}>태그: {post.tags.join(", ")}</p>
                )}
                {post.category && <p>카테고리: {post.category}</p>}
              </div>
              <div className={styles.menuWrapper}>
                <button
                  className={styles.menuButton}
                  onClick={() => toggleMenu(post.slug)}
                >
                  ⋮
                </button>
                {menuVisible === post.slug && (
                  <div className={styles.dropdownMenu}>
                    <button
                      onClick={async () => {
                        const confirmed = confirm(
                          "정말로 이 게시글을 삭제하시겠습니까?"
                        );
                        if (confirmed) {
                          try {
                            const response = await fetch("/api/deletePost", {
                              method: "DELETE",
                              headers: { "Content-Type": "application/json" },
                              body: JSON.stringify({ slug: post.slug }),
                            });
                            if (response.ok) {
                              alert("게시글이 삭제되었습니다.");
                              setPosts((prevPosts) =>
                                prevPosts.filter((p) => p.slug !== post.slug)
                              );
                              setMenuVisible(null);
                            } else {
                              const errorData = await response.json();
                              alert(`오류 발생: ${errorData.error}`);
                            }
                          } catch (error) {
                            console.error("Error deleting post:", error);
                            alert("게시글 삭제 중 오류가 발생했습니다.");
                          }
                        }
                      }}
                      className={styles.deleteButton}
                    >
                      삭제
                    </button>
                    <button
                      onClick={() => {
                        openModalForEditPost(post);
                        setMenuVisible(null);
                      }}
                      className={styles.editButton}
                    >
                      수정
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export async function getStaticProps() {
  const fs = require("fs");
  const path = require("path");
  const matter = require("gray-matter");

  // posts 디렉토리를 content/posts로 변경
  const postsDirectory = path.join(process.cwd(), "content", "posts");
  const filenames = fs.readdirSync(postsDirectory);

  const posts = filenames.map((filename) => {
    const filePath = path.join(postsDirectory, filename);
    const fileContents = fs.readFileSync(filePath, "utf-8");
    const { data } = matter(fileContents);

    return {
      slug: filename.replace(/\.mdx?$/, ""),
      title: data.title || "제목 없음",
      description: data.description || "설명 없음",
      tags: data.tags || [],
      category: data.category || "",
    };
  });

  return {
    props: {
      posts,
    },
  };
}
