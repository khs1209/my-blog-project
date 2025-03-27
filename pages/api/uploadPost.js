import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'PUT') {
    res.setHeader('Allow', ['PUT']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { slug, title, description, tags, content, category } = req.body;

    // 디버깅 로그 추가
    console.log("수신된 데이터:", req.body);

    // 필수 필드 검증
    if (!slug || !title || !description) {
      console.error("필수 필드 누락:", { slug, title, description });
      return res.status(400).json({ error: '제목과 설명은 필수입니다.' });
    }

    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const filePath = path.join(postsDir, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    // tags와 category 기본값 처리
    const formattedTags =
      Array.isArray(tags)
        ? tags.map((tag) => tag.trim())
        : typeof tags === 'string' && tags.trim() !== ""
        ? tags.split(",").map((tag) => tag.trim())
        : [];
    const formattedCategory = category ? category.trim() : "";

    const mdxContent = `---
title: "${title}"
description: "${description}"
tags: ${JSON.stringify(formattedTags)}
category: "${formattedCategory}"
---

${content || ""}
`;

    fs.writeFileSync(filePath, mdxContent, 'utf8');

    return res.status(200).json({ message: '게시글이 성공적으로 수정되었습니다.' });
  } catch (error) {
    console.error('게시글 수정 중 오류 발생:', error);
    return res.status(500).json({ error: '게시글 수정 중 오류가 발생했습니다.', details: error.message });
  }
}

export const config = {
  api: {
    bodyParser: true,
  },
};
