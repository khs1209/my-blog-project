import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method === 'POST') {
    const { title, description, tags, content } = req.body;

    if (!title || !description || !tags || !content) {
      return res.status(400).json({ error: '모든 필드를 입력해야 합니다.' });
    }

    const slug = title.toLowerCase().replace(/ /g, '-');
    const filePath = path.join(process.cwd(), 'public', 'posts', `${slug}.mdx`);

    const mdxContent = `---
title: "${title}"
description: "${description}"
tags: ${JSON.stringify(tags.split(',').map((tag) => tag.trim()))}
---

${content}
`;

    try {
      fs.writeFileSync(filePath, mdxContent, 'utf8');
      return res.status(201).json({ message: '포스트가 성공적으로 업로드되었습니다.' });
    } catch (error) {
      console.error('Error writing file:', error);
      return res.status(500).json({ error: '파일을 저장하는 중 오류가 발생했습니다.' });
    }
  } else {
    res.setHeader('Allow', ['POST']);
    res.status(405).end(`Method ${req.method} Not Allowed`);
  }
}