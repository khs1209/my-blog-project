import { useState, useEffect, useRef } from "react";
import styles from "../styles/Comments.module.css"; // 스타일 파일 import

export default function Comments() {
  const [comments, setComments] = useState([]); // 로컬 상태로 댓글 관리
  const [commentText, setCommentText] = useState("");
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState("");
  const [menuVisible, setMenuVisible] = useState(null); // 드롭다운 메뉴 상태
  const menuRef = useRef(null); // 드롭다운 메뉴 참조

  // 댓글 데이터를 Local Storage에서 불러오기
  useEffect(() => {
    const savedComments = localStorage.getItem("comments");
    if (savedComments) {
      setComments(JSON.parse(savedComments)); // JSON 문자열을 객체로 변환
    }
  }, []);

  // 댓글 데이터가 변경될 때 Local Storage에 저장
  useEffect(() => {
    localStorage.setItem("comments", JSON.stringify(comments)); // 객체를 JSON 문자열로 변환
  }, [comments]);

  // 드롭다운 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(null); // 메뉴 닫기
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);
  

  const handleSubmit = (e) => {
    e.preventDefault();
    if (commentText.trim() === "") return; // 빈 댓글 방지

    // 새로운 댓글 추가
    const newComment = {
      id: Date.now(), // 고유 ID 생성
      text: commentText,
      userName: "익명 사용자",
      createdAt: new Date(),
    };

    setComments([newComment, ...comments]); // 새로운 댓글을 기존 댓글 리스트에 추가
    setCommentText(""); // 입력창 초기화
  };

  const handleDelete = (id) => {
    const confirmDelete = window.confirm("댓글을 삭제하시겠습니까?");
    if (!confirmDelete) return;

    // 댓글 삭제
    setComments(comments.filter((comment) => comment.id !== id));
    setMenuVisible(null); // 메뉴 닫기
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
    setMenuVisible(null); // 메뉴 닫기
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText("");
  };

  const handleUpdate = (id) => {
    // 댓글 수정
    setComments(
      comments.map((comment) =>
        comment.id === id ? { ...comment, text: editingText } : comment
      )
    );
    setEditingCommentId(null);
    setEditingText("");
  };

  const toggleMenu = (id) => {
    setMenuVisible(menuVisible === id ? null : id); // 메뉴 토글
  };

  return (
    <div className={styles.container}>
      <h3>댓글</h3>
      <form onSubmit={handleSubmit}>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder="댓글을 입력하세요"
          rows={4}
          className={styles.textarea} // 로컬 클래스 적용
        />

        <div className={styles.commentSubmitContainer}>
          <button type="submit" className={styles.button}>
            등록
          </button>
        </div>
      </form>
      <div>
        {comments.map((comment) => (
          <div key={comment.id} className={styles.comment}>
            <p>
              <strong>{comment.userName || "익명"}</strong>:
            </p>
            {editingCommentId === comment.id ? (
              <div>
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                  className={styles.textarea}
                />
                <button
                  onClick={() => handleUpdate(comment.id)}
                  className={styles.button}
                >
                  저장
                </button>
                <button onClick={cancelEditing} className={styles.button}>
                  취소
                </button>
              </div>
            ) : (
              <p>{comment.text}</p>
            )}
            <div className={styles.commentFooter}>
              <small>{comment.createdAt.toLocaleString()}</small>
              <div className={styles.menuWrapper} ref={menuRef}>
                <button
                  className={styles.menuButton}
                  onClick={() => toggleMenu(comment.id)}
                >
                  ⋮
                </button>
                {menuVisible === comment.id && (
                  <div className={styles.dropdownMenu}>
                    <button
                      onClick={() => startEditing(comment)}
                      className={styles.editButton}
                    >
                      수정
                    </button>
                    <button
                      onClick={() => handleDelete(comment.id)}
                      className={styles.deleteButton}
                    >
                      삭제
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
