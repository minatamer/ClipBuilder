import Link from "next/link";
import styles from "./view-failure.module.css";

export default function NotFoundPage() {
  return (
    <main className={styles.recovery}>
      <h1>Page not found</h1>
      <p>The requested ClipBuilder view does not exist.</p>
      <Link href="/">Return to ClipBuilder</Link>
    </main>
  );
}
