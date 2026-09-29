import Link from "next/link";

export default function NotFoundPage() {
  return (
    <main>
      <h1>Page not found</h1>
      <p>The requested ClipBuilder view does not exist.</p>
      <Link href="/">Return to ClipBuilder</Link>
    </main>
  );
}
