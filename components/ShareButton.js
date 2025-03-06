// components/ShareButton.js
export default function ShareButton({ title, url }) {
    const handleShare = async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title,
            url,
          });
        } catch (error) {
          console.error('공유 실패:', error);
        }
      } else {
        // Web Share API가 지원되지 않으면 URL 복사
        navigator.clipboard.writeText(url);
        alert('URL이 클립보드에 복사되었습니다.');
      }
    };
  
    return (
      <button onClick={handleShare}>
        공유하기
      </button>
    );
  }
  