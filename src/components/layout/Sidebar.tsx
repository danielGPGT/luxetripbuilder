import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  FilePlus2,
  Calendar,
  User,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Image,
  Crown,
  Settings as SettingsIcon,
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import { TierManager } from "@/lib/tierManager";
import { QuoteService, type QuoteResponse } from "@/lib/quoteService";
import Logo from "@/assets/imgs/logo.svg";

export function Sidebar() {
  const [collapsed, setCollapsed] = useState(false);
  const { user } = useAuth();
  const location = useLocation();
  const [recentQuotes, setRecentQuotes] = useState<QuoteResponse[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMediaLibraryAccess, setHasMediaLibraryAccess] = useState(false);

  useEffect(() => {
    if (user?.id) {
      setLoading(true);
      const tierManager = TierManager.getInstance();
      tierManager.initialize(user.id).then(() => {
        setHasMediaLibraryAccess(tierManager.hasFeature('media_library'));
      });

      // Load recent quotes instead of itineraries
      QuoteService.getUserQuotes()
        .then((quotes) => setRecentQuotes(quotes.slice(0, 3)))
        .catch((error) => {
          console.error("Error loading recent quotes:", error);
          setRecentQuotes([]);
        })
        .finally(() => setLoading(false));
    } else {
      setRecentQuotes([]);
    }
  }, [user?.id]);

  // Example nav items
  const navItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "New Proposal", icon: FilePlus2, href: "/new-proposal" },
    { label: "Quotes", icon: FileText, href: "/quotes" },
    { label: "Bookings", icon: CheckCircle, href: "/bookings" },
    { label: "Itineraries", icon: Calendar, href: "/itineraries" },
    {
      label: "Media Library",
      icon: Image,
      href: "/media-library",
      premium: true,
      hasAccess: hasMediaLibraryAccess,
    },
    { label: "Settings", icon: SettingsIcon, href: "/settings" },
    // Add more as needed
  ];

  const formatCurrency = (amount: number, currency: string = "USD") => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: currency,
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      case "draft":
        return "bg-gray-100 text-gray-800";
      case "cancelled":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 bg-background shadow-lg transition-all duration-300 flex flex-col ${
        collapsed ? "w-20" : "w-72"
      }`}
    >
      {/* Top: Logo & Collapse Button */}
      <div className="flex items-center justify-between h-20 px-4">
        <Link to="/dashboard" className="flex items-center gap-2">
          <img src={Logo} alt="AItinerary Logo" className="h-8 w-8" />
          <span
            className={`font-bold text-xl transition-opacity duration-200 ${
              collapsed ? "opacity-0 w-0" : "opacity-100 w-auto"
            } text-[var(--foreground)]`}
          >
            AItinerary
          </span>
        </Link>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setCollapsed(!collapsed)}
        >
          {collapsed ? <ChevronRight /> : <ChevronLeft />}
        </Button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 px-2 mt-16">
        {navItems.map((item) => (
          <Link to={item.href} key={item.href}>
            <Button
              variant={location.pathname === item.href ? "default" : "ghost"}
              className={`w-full flex items-center gap-3 my-1 ${
                collapsed ? "justify-center" : "justify-start"
              } relative`}
            >
              <item.icon className={location.pathname === item.href ? "text-foreground" : "text-foreground"} />
              {!collapsed && (
                <div className="flex items-center gap-2 flex-1">
                  <span className="text-[var(--foreground)]">{item.label}</span>
                  {item.premium && (
                    <Crown
                      className={`h-3 w-3 ${
                        item.hasAccess
                          ? "text-yellow-500"
                          : "text-muted-foreground"
                      }`}
                    />
                  )}
                </div>
              )}
              {collapsed && item.premium && (
                <Crown
                  className={`h-3 w-3 absolute top-1 right-1 ${
                    item.hasAccess ? "text-yellow-500" : "text-muted-foreground"
                  }`}
                />
              )}
            </Button>
          </Link>
        ))}
      </nav>

      {/* Recent Quotes */}
      {user && !collapsed && (
        <div className="px-4 py-2">
          <div className="font-semibold text-sm mb-2 text-[var(--muted-foreground)]">
            Recent Quotes
          </div>
          <ScrollArea className="max-h-40">
            {loading ? (
              <div className="text-xs text-muted-foreground px-2 py-1">
                Loading...
              </div>
            ) : recentQuotes.length === 0 ? (
              <div className="text-xs text-muted-foreground px-2 py-1">
                No quotes
              </div>
            ) : (
              recentQuotes.map((quote) => (
                <div key={quote.id} className="my-1">
                  <Link 
                    to={`/quote/${quote.id}`}
                    className="block"
                  >
                    <div className="flex items-center justify-between p-2 rounded-lg hover:bg-muted/50 transition-colors cursor-pointer group">
                      <div className="flex flex-col items-start flex-1 min-w-0">
                        <div className="flex items-center justify-between w-full">
                          <span className="text-xs font-medium truncate text-foreground group-hover:text-primary">
                            {quote.clientEmail
                              ? quote.clientEmail.split("@")[0]
                              : "Client"}
                          </span>
                          <span
                            className={`text-xs px-1.5 py-0.5 rounded-full ${getStatusColor(
                              quote.status
                            )} ml-2`}
                          >
                            {quote.status}
                          </span>
                        </div>
                        <div className="text-xs text-muted-foreground mt-1 group-hover:text-primary/70">
                          {formatCurrency(quote.totalPrice, quote.currency)}
                        </div>
                      </div>
                      <div className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity">
                        <FileText className="h-3 w-3 text-muted-foreground" />
                      </div>
                    </div>
                  </Link>
                </div>
              ))
            )}
          </ScrollArea>
        </div>
      )}

      {/* Bottom: User */}
      <div className="mt-auto w-full px-4 py-4 flex flex-col gap-4">
        <div className="flex items-center gap-3">
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.name?.[0] || user?.email?.[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <div>
              <div className="font-medium text-[var(--foreground)]">
                {user?.user_metadata?.name || user?.email || "User Name"}
              </div>
              <div className="text-xs text-muted-foreground">
                {user?.email || "user@email.com"}
              </div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
