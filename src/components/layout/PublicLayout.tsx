import { Header } from "./Header";

interface PublicLayoutProps {
  children: React.ReactNode;
}

export function PublicLayout({ children }: PublicLayoutProps) {
  return (
    <div className="min-h-screen w-full bg-[var(--background)]">
      <Header />
      <main className="text-[var(--foreground)]">
        {children}
      </main>
    </div>
  );
} 