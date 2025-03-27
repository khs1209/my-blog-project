export default function handler(req, res) {
  if (req.method !== "PUT") {
    res.setHeader("Allow", ["PUT"]);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
  }

  try {
    const { slug, title, description, content, tags, category } = req.body;

    console.log("서버에서 받은 데이터:", req.body);

    // 필수 필드 확인
    if (!slug || !title || !description) {
      return res.status(400).json({ error: "제목, 설명, 슬러그는 필수입니다." });
    }

    const fs = require("fs");
    const path = require("path");

    const postsDir = path.join(process.cwd(), "content", "posts");
    const filePath = path.join(postsDir, `${slug}.mdx`);

    if (!fs.existsSync(filePath)) {
      console.error("오류: 해당 파일을 찾을 수 없음", filePath);
      return res.status(404).json({ error: "게시글을 찾을 수 없습니다." });
    }

    // ✅ `formattedCategory` 정의 추가
    const formattedTags =
      Array.isArray(tags) ? tags : typeof tags === "string" ? tags.split(",").map((tag) => tag.trim()) : [];
    const formattedCategory = category ? category.trim() : ""; // 🛠 오류 수정 (초기화 추가)

    // 새 MDX 내용 생성
    const mdxContent = `---
title: "${title}"
description: "${description}"
tags: ${JSON.stringify(formattedTags)}
category: "${formattedCategory}"
---

${content || ""}
`;

    fs.writeFileSync(filePath, mdxContent, "utf8");

    console.log("게시글 수정 완료:", filePath);
    return res.status(200).json({ message: "게시글이 성공적으로 수정되었습니다." });
  } catch (error) {
    console.error("게시글 수정 중 오류 발생:", error);
    return res.status(500).json({ error: "게시글 수정 중 오류가 발생했습니다.", details: error.message });
  }
}
