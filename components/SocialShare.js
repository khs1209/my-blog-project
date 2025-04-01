import { useState, useRef, useEffect } from "react";
import { FaShareAlt } from "react-icons/fa"; // Font Awesome 공유 아이콘
import styles from "../styles/SocialShare.module.css";

export default function SocialShare({ url, title }) {
  const [menuVisible, setMenuVisible] = useState(false); // 드롭다운 메뉴 상태
  const menuRef = useRef(null); // 드롭다운 메뉴 참조
  const encodedUrl = encodeURIComponent(url);
  const encodedTitle = encodeURIComponent(title);

  // 메뉴 외부 클릭 감지
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setMenuVisible(false); // 메뉴 닫기
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className={styles.shareContainer} ref={menuRef}>
      <button
        onClick={() => setMenuVisible(!menuVisible)} // 메뉴 토글
        className={styles.shareButton}
      >
        <FaShareAlt /> {/* 공유 아이콘 */}
      </button>
      {menuVisible && (
        <div className={styles.dropdownMenu}>
          <a
            href={`https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.dropdownItem}
          >
            Twitter
          </a>
          <a
            href={`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.dropdownItem}
          >
            Facebook
          </a>
          <a
            href={`https://www.linkedin.com/shareArticle?url=${encodedUrl}&title=${encodedTitle}`}
            target="_blank"
            rel="noopener noreferrer"
            className={styles.dropdownItem}
          >
            LinkedIn
          </a>
        </div>
      )}
    </div>
  );
}