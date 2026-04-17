/**
 * Configuración pública de Supabase (URL + anon key desde Project Settings > API).
 * La anon key es segura en el navegador si RLS y políticas de Storage están bien.
 * Deja url o anonKey vacíos para usar solo assets/data/products.json.
 */
window.BOOTIK_SUPABASE = window.BOOTIK_SUPABASE || {
  url: "https://eykvqgmbjrdmpugdvppf.supabase.co",
  anonKey:
    "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImV5a3ZxZ21ianJkbXB1Z2R2cHBmIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY0NjM0MzMsImV4cCI6MjA5MjAzOTQzM30.6p0v8WAN1KAdSQA0o-1vCOKHjGojVbBum44K4ZrrMuI",
};
