/** Allow `import styles from "*.css?inline"` (Vite-only, not used by Next.js) */
declare module "*.css?inline" {
  const content: string;
  export default content;
}
