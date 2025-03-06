// components/Comments.js
import { useState, useEffect } from 'react';
import { initializeApp } from 'firebase/app';
import {
  getFirestore,
  collection,
  addDoc,
  query,
  orderBy,
  onSnapshot,
  serverTimestamp,
  deleteDoc,
  doc,
  updateDoc,
} from 'firebase/firestore';
import { getAuth, signInWithPopup, GoogleAuthProvider, signOut } from 'firebase/auth';

// Firebase 설정 (자신의 Firebase 콘솔 정보를 입력)
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);
const auth = getAuth(app);
const provider = new GoogleAuthProvider();

export default function Comments({ postId }) {
  const [comments, setComments] = useState([]);
  const [commentText, setCommentText] = useState('');
  const [user, setUser] = useState(null);
  const [editingCommentId, setEditingCommentId] = useState(null);
  const [editingText, setEditingText] = useState('');

  // 사용자 인증 상태 관리
  useEffect(() => {
    const unsubscribeAuth = auth.onAuthStateChanged((user) => {
      setUser(user);
    });
    return () => unsubscribeAuth();
  }, []);

  // 실시간 댓글 데이터 가져오기
  useEffect(() => {
    const q = query(
      collection(db, 'posts', postId, 'comments'),
      orderBy('createdAt', 'desc')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const commentsArr = [];
      snapshot.forEach((doc) => {
        commentsArr.push({ id: doc.id, ...doc.data() });
      });
      setComments(commentsArr);
    });
    return () => unsubscribe();
  }, [postId]);

  const handleLogin = async () => {
    try {
      await signInWithPopup(auth, provider);
    } catch (error) {
      console.error('로그인 에러:', error);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
    } catch (error) {
      console.error('로그아웃 에러:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (commentText.trim() === '' || !user) return;
    try {
      await addDoc(collection(db, 'posts', postId, 'comments'), {
        text: commentText,
        createdAt: serverTimestamp(),
        userId: user.uid,
        userName: user.displayName,
      });
      setCommentText('');
    } catch (error) {
      console.error('댓글 추가 에러:', error);
    }
  };

  const handleDelete = async (id) => {
    try {
      await deleteDoc(doc(db, 'posts', postId, 'comments', id));
    } catch (error) {
      console.error('삭제 에러:', error);
    }
  };

  const startEditing = (comment) => {
    setEditingCommentId(comment.id);
    setEditingText(comment.text);
  };

  const cancelEditing = () => {
    setEditingCommentId(null);
    setEditingText('');
  };

  const handleUpdate = async (id) => {
    try {
      await updateDoc(doc(db, 'posts', postId, 'comments', id), {
        text: editingText,
      });
      setEditingCommentId(null);
      setEditingText('');
    } catch (error) {
      console.error('업데이트 에러:', error);
    }
  };

  return (
    <div style={{ marginTop: '2rem' }}>
      <h3>댓글</h3>
      {user ? (
        <div>
          <p>{user.displayName}님 환영합니다!</p>
          <button onClick={handleLogout}>로그아웃</button>
        </div>
      ) : (
        <button onClick={handleLogin}>Google 로그인</button>
      )}
      <form onSubmit={handleSubmit}>
        <textarea
          value={commentText}
          onChange={(e) => setCommentText(e.target.value)}
          placeholder={user ? "댓글을 입력하세요" : "로그인 후 댓글 작성"}
          rows={4}
          style={{ width: '100%' }}
          disabled={!user}
        />
        <button type="submit" disabled={!user}>제출</button>
      </form>
      <div>
        {comments.map((comment) => (
          <div key={comment.id} style={{ borderBottom: '1px solid #ccc', padding: '0.5rem 0' }}>
            <p>
              <strong>{comment.userName || '익명'}</strong>:
            </p>
            {editingCommentId === comment.id ? (
              <div>
                <textarea
                  value={editingText}
                  onChange={(e) => setEditingText(e.target.value)}
                  rows={3}
                  style={{ width: '100%' }}
                />
                <button onClick={() => handleUpdate(comment.id)}>저장</button>
                <button onClick={cancelEditing}>취소</button>
              </div>
            ) : (
              <p>{comment.text}</p>
            )}
            <small>
              {comment.createdAt
                ? new Date(comment.createdAt.seconds * 1000).toLocaleString()
                : '방금 전'}
            </small>
            {/* 본인 댓글에 대해서만 수정/삭제 버튼 표시 */}
            {user && comment.userId === user.uid && editingCommentId !== comment.id && (
              <div>
                <button onClick={() => startEditing(comment)}>수정</button>
                <button onClick={() => handleDelete(comment.id)}>삭제</button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
