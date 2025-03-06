# 내 Next.js 블로그

이 프로젝트는 Next.js와 MDX로 구축된 간단한 블로그입니다. Markdown을 사용하여 블로그 게시물을 작성할 수 있으며, React 컴포넌트를 포함할 수 있습니다.

## 프로젝트 구조
```sh
my-nextjs-blog
├── components
│   └── Layout.js          # 레이아웃 컴포넌트
├── pages
│   ├── _app.js           # Next.js 애플리케이션의 루트 컴포넌트
│   ├── index.js          # 블로그 게시물 목록 페이지
│   └── posts
│       └── [slug].js     # 개별 블로그 게시물 페이지
├── posts
│   └── example.mdx       # 예제 블로그 게시물
├── public
│   └── favicon.ico       # 파비콘
├── styles
│   ├── globals.css       # 전역 스타일
│   └── Home.module.css   # 홈 페이지 스타일
├── .gitignore            # Git 무시 파일
├── package.json          # 프로젝트 종속성 및 스크립트
├── README.md             # 프로젝트 문서
└── next.config.js        # Next.js 구성 파일
```


## 시작하기

이 프로젝트를 시작하려면 다음 단계를 따르세요:

1. 리포지토리를 클론합니다:
git clone <repository-url>

2. 프로젝트 디렉토리로 이동합니다:
cd my-nextjs-blog

3. 종속성을 설치합니다:
npm install

4. 개발 서버를 실행합니다:
npm run dev

5. 브라우저를 열고 `http://localhost:3000`으로 이동하여 블로그를 확인합니다.

## 게시물 작성

`posts` 디렉토리에 MDX 파일을 추가하여 새로운 블로그 게시물을 작성할 수 있습니다. 각 파일은 `.mdx` 확장자를 가져야 하며, Markdown과 React 컴포넌트를 모두 포함할 수 있습니다.

## 라이선스

이 프로젝트는 MIT 라이선스에 따라 라이선스가 부여됩니다.