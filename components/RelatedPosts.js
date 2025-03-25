// components/RelatedPosts.js
import { useEffect, useState } from "react";

export default function RelatedPosts({ currentSlug }) {
  const [posts, setPosts] = useState([]);
  const [error, setError] = useState(null);
  const yourAccessToken = "ISO-8859-1"; // 실제 토큰 값으로 교체하세요.

  useEffect(() => {
    fetch("/site_integration/template_list", {
      method: "GET",
      headers: {
        Authorization: `Bearer ${yourAccessToken}`,
        "Content-Type": "application/json",
      },
    })
      .then((res) => {
        if (!res.ok) {
          if (res.status === 404) {
            // API 엔드포인트가 없으면 더미 데이터로 대체
            console.warn("API 엔드포인트를 찾을 수 없습니다. 더미 데이터를 사용합니다.");
            return { dummy: true };
          }
          throw new Error(`HTTP error! status: ${res.status}`);
        }
        return res.json();
      })
      .then((data) => {
        if (data.dummy) {
          setPosts([
            { id: 1, title: "테스트 게시물 1" },
            { id: 2, title: "테스트 게시물 2" },
          ]);
        } else {
          setPosts(data);
        }
      })
      .catch((err) => {
        console.error("API 호출 에러:", err);
        setError(err);
      });
  }, []);

  if (error) return <p>관련 게시물을 불러오는 데 실패했습니다.</p>;

  return (
    <div>
      <h3>관련 게시물</h3>
      {posts.length > 0 ? (
        posts.map((post) => (
          <div key={post.id}>
            <p>{post.title}</p>
          </div>
        ))
      ) : (
        <p>관련 게시물이 없습니다.</p>
      )}
    </div>
  );
}
