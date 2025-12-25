/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
  readonly VITE_BLOCKFROST_PROJECT_ID: string
  readonly VITE_BLOCKFROST_MAINNET_PROJECT_ID?: string
  readonly VITE_OPENAI_API_KEY?: string
  readonly DEV?: boolean
  readonly MODE?: string
  readonly PROD?: boolean
  // Ajouter d'autres variables d'environnement ici si nécessaire
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

