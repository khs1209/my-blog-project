import fs from 'fs';
import path from 'path';

export default function handler(req, res) {
  if (req.method !== 'DELETE') {
    res.setHeader('Allow', ['DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { slug } = req.body;

    if (!slug) {
      return res.status(400).json({ error: 'Slug가 필요합니다.' });
    }

    const postsDir = path.join(process.cwd(), 'content', 'posts');
    const filePath = path.join(postsDir, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({ error: '게시글을 찾을 수 없습니다.' });
    }

    fs.unlinkSync(filePath); // 파일 삭제

    return res.status(200).json({ message: '게시글이 성공적으로 삭제되었습니다.' });
  } catch (error) {
    console.error('게시글 삭제 중 오류 발생:', error);
    return res.status(500).json({ error: '게시글을 삭제하는 중 오류가 발생했습니다.', details: error.message });
  }
}