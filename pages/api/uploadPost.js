import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'POST') {
    res.setHeader('Allow', ['POST']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { title, description, tags, content } = req.body;

    // 필수 필드 검증
    if (!title || !description || !tags || !content) {
      return res.status(400).json({ error: '모든 필드를 입력해야 합니다.' });
    }

    // 파일명 안전 처리 (예: 한글, 특수문자 대응)
    const slug = encodeURIComponent(title.toLowerCase().replace(/ /g, '-'));
    const postsDir = path.join(process.cwd(), 'content', 'posts'); // 저장 경로를 content/posts로 변경
    const filePath = path.join(postsDir, `${slug}.mdx`);

    //(1) posts 폴더가 없으면 생성
    if (!fs.existsSync(postsDir)) {
      fs.mkdirSync(postsDir, { recursive: true }); // 재귀적으로 생성
    }

    //(2) tags 데이터 처리
    const formattedTags =
      Array.isArray(tags) ? tags.map((tag) => tag.trim()) : typeof tags === 'string' ? tags.split(',').map((tag) => tag.trim()) : [];

    // MDX 파일 내용 생성
    const mdxContent = `---
title: "${title}"
description: "${description}"
tags: ${JSON.stringify(formattedTags)}
---

${content}
`;

    //(3) 파일 저장
    fs.writeFileSync(filePath, mdxContent, 'utf8');

    return res.status(201).json({ message: '포스트가 성공적으로 업로드되었습니다.', slug });
  } catch (error) {
    console.error('파일 저장 중 오류 발생:', error);
    return res.status(500).json({ error: '파일을 저장하는 중 오류가 발생했습니다.', details: error.message });
  }
}
