import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { SidebarProvider } from "@/components/ui/sidebar";
import { Link } from "react-router-dom";
import { Home, PlaneTakeoff, Calendar, Settings, User, FilePlus2, WandSparkles } from "lucide-react";
import LuxeLogo from "@/assets/Luxe.svg";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";
import { Header } from "./Header";

const navigationItems = [
  { name: "Home", href: "/", icon: Home },
  { name: "New Proposal", href: "/new-proposal", icon: FilePlus2 },
  { name: "New Trip", href: "/new-trip", icon: PlaneTakeoff },
  { name: "Itineraries", href: "/itineraries", icon: Calendar },
  { name: "Settings", href: "/settings", icon: Settings },
  { name: "Profile", href: "/profile", icon: User },
];

interface MainLayoutProps {
  children: React.ReactNode;
}

export function MainLayout({ children }: MainLayoutProps) {
  const location = useLocation();
  return (
    <SidebarProvider>
      <Header />
      <div className="flex min-h-screen w-full">
        {/* Luxury Sidebar */}
        <aside className="hidden lg:flex flex-col bg-[var(--sidebar)]/80 backdrop-blur-lg shadow-xl border border-[var(--sidebar-border)] text-[var(--sidebar-foreground)]">

          <nav className="flex-1 px-4 pt-12">
            <ul className="space-y-3 mt-8">
              {navigationItems.map((item) => {
                const isActive = location.pathname === item.href;
                return (
                  <li key={item.name}>
                    <Link
                      to={item.href}
                      className={cn(
                        "flex items-center gap-4 px-6 py-4 rounded-xl font-medium transition-all text-lg",
                        isActive
                          ? "border-l-4 border-[var(--primary)] bg-[var(--sidebar-accent)]/80 text-[var(--sidebar-primary)] font-bold shadow-md"
                          : "hover:bg-[var(--sidebar-accent)]/60 hover:text-[var(--sidebar-accent-foreground)] text-[var(--sidebar-foreground)] border-l-4 border-transparent"
                      )}
                    >
                      <item.icon className="h-6 w-6" />
                      <span>{item.name}</span>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </aside>
        {/* Main Content */}
        <main className="flex-1 bg-[var(--background)] mt-8">
          <div className="w-full p-8">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
} 