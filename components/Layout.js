// components/Layout.js
import React from 'react';

export default function Layout({ children }) {
  return (
    <div>
      {/* 공통 헤더, 네비게이션 바 등 추가 가능 */}
      <main>{children}</main>
      {/* 공통 푸터 등 추가 가능 */}
    </div>
  );
}
