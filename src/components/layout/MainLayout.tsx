import { Header } from "./Header";
import { Sidebar } from "./Sidebar";

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  // Sidebar width: w-20 (collapsed) to w-72 (expanded). We'll use w-20 as the minimum for margin.
  // For a fully dynamic margin, you could use context, but for now, use w-20 for safety.
  return (
    <div className="min-h-screen w-full bg-background">
      <Sidebar />
      <div className="ml-20 lg:ml-72 transition-all duration-300">
        <Header />
        <main className="pt-30 text-[var(--foreground)]">
          {children}
        </main>
      </div>
    </div>
  );
} 