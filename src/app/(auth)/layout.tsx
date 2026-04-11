import Link from "next/link";

export default function AuthLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-6 py-12">
      <Link
        href="/"
        className="mb-8 text-sm tracking-[0.2em] text-[--color-text-faint] hover:text-[--color-text-muted]"
      >
        ← LV UP
      </Link>
      {children}
    </div>
  );
}
