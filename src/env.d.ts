/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_API_URL: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME: string;
  readonly NODE_ENV: "development" | "production" | "test";
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
