// components/LikeButton.js
import { useState, useEffect } from 'react';
import { getFirestore, doc, getDoc, setDoc, updateDoc, increment } from 'firebase/firestore';
import { initializeApp } from 'firebase/app';

// Firebase 설정 (자신의 Firebase 콘솔 정보를 입력)
const firebaseConfig = {
  apiKey: 'YOUR_API_KEY',
  authDomain: 'YOUR_PROJECT_ID.firebaseapp.com',
  projectId: 'YOUR_PROJECT_ID',
};

const app = initializeApp(firebaseConfig);
const db = getFirestore(app);

export default function LikeButton({ postId }) {
  const [likes, setLikes] = useState(0);
  const [hasLiked, setHasLiked] = useState(false);

  useEffect(() => {
    const likeDocRef = doc(db, 'posts', postId, 'likes', 'likeCount');
    getDoc(likeDocRef).then(docSnap => {
      if (docSnap.exists()) {
        setLikes(docSnap.data().count);
      } else {
        setLikes(0);
      }
    });
  }, [postId]);

  const handleLike = async () => {
    const likeDocRef = doc(db, 'posts', postId, 'likes', 'likeCount');
    if (!hasLiked) {
      try {
        await updateDoc(likeDocRef, { count: increment(1) });
      } catch (error) {
        // 문서가 없으면 생성
        await setDoc(likeDocRef, { count: 1 });
      }
      setLikes(likes + 1);
      setHasLiked(true);
    } else {
      try {
        await updateDoc(likeDocRef, { count: increment(-1) });
      } catch (error) {
        console.error(error);
      }
      setLikes(likes - 1);
      setHasLiked(false);
    }
  };

  return (
    <div>
      <button onClick={handleLike}>
        {hasLiked ? '좋아요 취소' : '좋아요'}
      </button>
      <span> {likes} 좋아요</span>
    </div>
  );
}
