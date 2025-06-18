import { NavigationMenu, NavigationMenuItem, NavigationMenuLink, NavigationMenuList, navigationMenuTriggerStyle } from "@/components/ui/navigation-menu";
import { Sidebar, SidebarProvider, SidebarContent } from "@/components/ui/sidebar";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Link } from "react-router-dom";
import { Home, PlaneTakeoff, Calendar, Settings, User, FilePlus2 } from "lucide-react";
import LuxeLogo from "@/assets/Luxe.svg";
import { useLocation } from "react-router-dom";
import { cn } from "@/lib/utils";

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
      <div className="flex min-h-screen">
        {/* Sidebar */}
        <Sidebar>
          <SidebarContent>
            <div className="flex h-full flex-col bg-gradient-to-b from-indigo-50 to-white shadow-xl">
              <div className="flex h-20 justify-center border-b px-6 bg-white/80 shadow-sm">
                <Link to="/" className="flex items-center w-full">
                  <img src={LuxeLogo} alt="LuxeTripBuilder Logo" className="h-8 w-auto drop-shadow-md" />
                </Link>
              </div>
              <ScrollArea className="flex-1 px-2">
                <div className="space-y-4 py-6">
                  <div className="px-3 py-2">
                    <div className="space-y-1">
                      <Separator className="mb-4 bg-indigo-100" />
                      {navigationItems.map((item) => {
                        const isActive = location.pathname === item.href;
                        return (
                          <Link
                            key={item.name}
                            to={item.href}
                            className={cn(
                              "group flex items-center gap-3 rounded-lg px-4 py-3 text-base font-medium transition-all",
                              isActive
                                ? "bg-indigo-100 text-indigo-700 shadow-sm"
                                : "text-gray-700 hover:bg-indigo-50 hover:text-indigo-900",
                              "mb-1"
                            )}
                          >
                            <item.icon className={cn("h-5 w-5", isActive ? "text-indigo-600" : "text-gray-400 group-hover:text-indigo-500")}/>
                            <span>{item.name}</span>
                          </Link>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </ScrollArea>
            </div>
          </SidebarContent>
        </Sidebar>

        {/* Mobile Navigation */}
        <div className="sticky top-0 z-50 w-full border-b bg-background lg:hidden">
          <NavigationMenu className="mx-4 flex h-14 max-w-none items-center justify-between">
            <NavigationMenuList>
              <NavigationMenuItem>
                <Link to="/" className="flex items-center space-x-2">
                  <span className="font-bold">LuxeTripBuilder</span>
                </Link>
              </NavigationMenuItem>
            </NavigationMenuList>
            <NavigationMenuList>
              {navigationItems.map((item) => (
                <NavigationMenuItem key={item.name}>
                  <NavigationMenuLink asChild className={navigationMenuTriggerStyle()}>
                    <Link to={item.href}>
                      <item.icon className="h-4 w-4" />
                      <span className="sr-only">{item.name}</span>
                    </Link>
                  </NavigationMenuLink>
                </NavigationMenuItem>
              ))}
            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Main Content */}
        <main className="flex-1 bg-gray-50">
          <div className="container mx-auto p-6">{children}</div>
        </main>
      </div>
    </SidebarProvider>
  );
} 