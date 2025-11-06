/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_BASE_URL: string;
  // 你可以在这里继续声明其它VITE_开头的环境变量
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
} 