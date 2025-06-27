import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar";
import {
  Home,
  FilePlus2,
  Calendar,
  User,
  Users,
  ChevronLeft,
  ChevronRight,
  FileText,
  CheckCircle,
  Image,
  Crown,
  Settings as SettingsIcon,
  HelpCircle,
  Search as SearchIcon,
  Moon,
  MoreVertical,
  LogOut,
  Bell,
  CreditCard,
  BarChart3,
  Building2,
} from "lucide-react";
import { useAuth } from "@/lib/AuthProvider";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";

// Logo SVG Component
const Logo = ({ className }: { className?: string }) => (
  <svg 
    width="100%" 
    height="100%" 
    viewBox="0 0 539 128" 
    fill="none" 
    xmlns="http://www.w3.org/2000/svg" 
    className={className}
  >
    <path d="M184.2 110.152C178.653 110.152 173.661 109.171 169.224 107.208C164.872 105.16 161.416 102.429 158.856 99.016C156.296 95.5173 154.931 91.6347 154.76 87.368H169.864C170.12 90.3547 171.528 92.872 174.088 94.92C176.733 96.8827 180.019 97.864 183.944 97.864C188.04 97.864 191.197 97.096 193.416 95.56C195.72 93.9387 196.872 91.8907 196.872 89.416C196.872 86.7707 195.592 84.808 193.032 83.528C190.557 82.248 186.589 80.84 181.128 79.304C175.837 77.8533 171.528 76.4453 168.2 75.08C164.872 73.7147 161.971 71.624 159.496 68.808C157.107 65.992 155.912 62.28 155.912 57.672C155.912 53.9173 157.021 50.504 159.24 47.432C161.459 44.2747 164.616 41.8 168.712 40.008C172.893 38.216 177.672 37.32 183.048 37.32C191.069 37.32 197.512 39.368 202.376 43.464C207.325 47.4747 209.971 52.9787 210.312 59.976H195.72C195.464 56.8187 194.184 54.3013 191.88 52.424C189.576 50.5467 186.461 49.608 182.536 49.608C178.696 49.608 175.752 50.3333 173.704 51.784C171.656 53.2347 170.632 55.1547 170.632 57.544C170.632 59.4213 171.315 61 172.68 62.28C174.045 63.56 175.709 64.584 177.672 65.352C179.635 66.0347 182.536 66.9307 186.376 68.04C191.496 69.4053 195.677 70.8133 198.92 72.264C202.248 73.6293 205.107 75.6773 207.496 78.408C209.885 81.1387 211.123 84.7653 211.208 89.288C211.208 93.2987 210.099 96.8827 207.88 100.04C205.661 103.197 202.504 105.672 198.408 107.464C194.397 109.256 189.661 110.152 184.2 110.152ZM255.007 110.152C248.351 110.152 242.335 108.659 236.959 105.672C231.583 102.6 227.359 98.3333 224.287 92.872C221.215 87.3253 219.679 80.9253 219.679 73.672C219.679 66.504 221.258 60.1467 224.415 54.6C227.572 49.0533 231.882 44.7867 237.343 41.8C242.804 38.8133 248.906 37.32 255.647 37.32C262.388 37.32 268.49 38.8133 273.951 41.8C279.412 44.7867 283.722 49.0533 286.879 54.6C290.036 60.1467 291.615 66.504 291.615 73.672C291.615 80.84 289.994 87.1973 286.751 92.744C283.508 98.2907 279.071 102.6 273.439 105.672C267.892 108.659 261.748 110.152 255.007 110.152ZM255.007 97.48C258.762 97.48 262.26 96.584 265.503 94.792C268.831 93 271.519 90.312 273.567 86.728C275.615 83.144 276.639 78.792 276.639 73.672C276.639 68.552 275.658 64.2427 273.695 60.744C271.732 57.16 269.13 54.472 265.887 52.68C262.644 50.888 259.146 49.992 255.391 49.992C251.636 49.992 248.138 50.888 244.895 52.68C241.738 54.472 239.22 57.16 237.343 60.744C235.466 64.2427 234.527 68.552 234.527 73.672C234.527 81.2667 236.447 87.1547 240.287 91.336C244.212 95.432 249.119 97.48 255.007 97.48ZM318.072 14.28V109H303.48V14.28H318.072ZM398.542 38.472V109H383.95V100.68C381.646 103.581 378.617 105.885 374.862 107.592C371.193 109.213 367.267 110.024 363.086 110.024C357.539 110.024 352.547 108.872 348.11 106.568C343.758 104.264 340.302 100.851 337.742 96.328C335.267 91.8053 334.03 86.344 334.03 79.944V38.472H348.494V77.768C348.494 84.0827 350.073 88.9467 353.23 92.36C356.387 95.688 360.697 97.352 366.158 97.352C371.619 97.352 375.929 95.688 379.086 92.36C382.329 88.9467 383.95 84.0827 383.95 77.768V38.472H398.542ZM429.827 48.712C431.96 45.128 434.776 42.3547 438.275 40.392C441.859 38.344 446.083 37.32 450.947 37.32V52.424H447.235C441.518 52.424 437.166 53.8747 434.179 56.776C431.278 59.6773 429.827 64.712 429.827 71.88V109H415.235V38.472H429.827V48.712ZM456.936 73.416C456.936 66.3333 458.387 60.0613 461.288 54.6C464.275 49.1387 468.285 44.9147 473.32 41.928C478.44 38.856 484.072 37.32 490.216 37.32C495.763 37.32 500.584 38.4293 504.68 40.648C508.861 42.7813 512.189 45.4693 514.664 48.712V38.472H529.384V109H514.664V98.504C512.189 101.832 508.819 104.605 504.552 106.824C500.285 109.043 495.421 110.152 489.96 110.152C483.901 110.152 478.355 108.616 473.32 105.544C468.285 102.387 464.275 98.0347 461.288 92.488C458.387 86.856 456.936 80.4987 456.936 73.416ZM514.664 73.672C514.664 68.808 513.64 64.584 511.592 61C509.629 57.416 507.027 54.6853 503.784 52.808C500.541 50.9307 497.043 49.992 493.288 49.992C489.533 49.992 486.035 50.9307 482.792 52.808C479.549 54.6 476.904 57.288 474.856 60.872C472.893 64.3707 471.912 68.552 471.912 73.416C471.912 78.28 472.893 82.5467 474.856 86.216C476.904 89.8853 479.549 92.7013 482.792 94.664C486.12 96.5413 489.619 97.48 493.288 97.48C497.043 97.48 500.541 96.5413 503.784 94.664C507.027 92.7867 509.629 90.056 511.592 86.472C513.64 82.8027 514.664 78.536 514.664 73.672Z" className="fill-current"/>
    <rect x="58.2402" y="100.48" width="11" height="27.52" rx="5.5" className="fill-primary"/>
    <rect x="58.2402" width="11" height="27.52" rx="5.5" className="fill-primary-400"/>
    <rect x="85.7222" y="93.8682" width="11" height="27.52" rx="5.5" transform="rotate(-45 85.7222 93.8682)" className="fill-primary"/>
    <rect x="14.6724" y="22.8181" width="11" height="27.52" rx="5.5" transform="rotate(-45 14.6724 22.8181)" className="fill-primary"/>
    <rect x="100.48" y="69.76" width="11" height="27.52" rx="5.5" transform="rotate(-90 100.48 69.76)" className="fill-primary"/>
    <rect y="69.76" width="11" height="27.52" rx="5.5" transform="rotate(-90 0 69.76)" className="fill-primary"/>
    <rect x="34.1323" y="85.7223" width="11" height="27.52" rx="5.5" transform="rotate(45 34.1323 85.7223)" className="fill-primary"/>
    <rect x="105.182" y="14.6722" width="11" height="27.52" rx="5.5" transform="rotate(45 105.182 14.6722)" className="fill-primary"/>
    <circle cx="63.5" cy="64.5" r="29.5" className="fill-primary"/>
  </svg>
);

interface SidebarProps {
  collapsed?: boolean;
  onCollapsedChange?: (collapsed: boolean) => void;
}

export function Sidebar({ collapsed = false, onCollapsedChange }: SidebarProps) {
  const { user } = useAuth();
  const location = useLocation();
  const [darkMode, setDarkMode] = useState(false);

  const handleToggleCollapse = () => {
    if (onCollapsedChange) {
      onCollapsedChange(!collapsed);
    }
  };

  // Main navigation
  const navItems = [
    { label: "Dashboard", icon: Home, href: "/dashboard" },
    { label: "Analytics", icon: BarChart3, href: "/analytics" },
    { label: "New Proposal", icon: FilePlus2, href: "/new-proposal" },
    { label: "Quotes", icon: FileText, href: "/quotes" },
    { label: "Bookings", icon: CheckCircle, href: "/bookings" },
    { label: "Itineraries", icon: Calendar, href: "/itineraries" },
    {
      label: "Media Library",
      icon: Image,
      href: "/media-library",
      premium: true,
    },
  ];

  // CRM section
  const crmItems = [
    { label: "Clients", icon: Users, href: "/crm" },
    { label: "New Client", icon: User, href: "/crm/new-client" },
    { label: "Integrations", icon: Building2, href: "/integrations" },
  ];

  // Documents section
  const documentItems = [
    { label: "Data Library", icon: FileText, href: "/data-library" },
    { label: "Reports", icon: FileText, href: "/reports" },
    { label: "Word Assistant", icon: FileText, href: "/word-assistant" },
  ];

  // Bottom section
  const bottomItems = [
    { label: "Settings", icon: SettingsIcon, href: "/settings" },
    { label: "Get Help", icon: HelpCircle, href: "/help" },
    { label: "Search", icon: SearchIcon, href: "/search" },
  ];

  // Handle dark mode toggle (replace with your theme logic if needed)
  const handleDarkMode = (checked: boolean) => {
    setDarkMode(checked);
    document.body.classList.toggle("dark", checked);
  };

  return (
    <aside
      className={`fixed left-0 top-0 h-screen z-40 flex flex-col transition-all duration-300 ${
        collapsed ? "w-20" : "w-72"
      } bg-[var(--sidebar)] border-r border-[var(--sidebar-border)]`}
    >
      {/* Branding & Collapse */}
      <div className="flex items-center justify-between h-16 px-4 border-[var(--sidebar-border)]">
        <Link to="/" className="flex items-center gap-2">
          <Logo className="h-8" />
        </Link>
      </div>

      {/* Main Navigation */}
      <nav className="flex-1 px-2 py-4">
        <div className="space-y-1">
          {navItems.map((item) => {
            const active = location.pathname === item.href;
            return (
              <Link to={item.href} key={item.href} tabIndex={collapsed ? -1 : 0}>
                <Button
                  variant="ghost"
                  className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                    active
                      ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold"
                      : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)]over:text-[var(--sidebar-pryccentoreground)]"
                  } ${collapsed ? "justify-center px-2" : "justif)]y-start"}`}
                >
                  <item.icon className="w-5 h-5" />
                  {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  {item.premium && !collapsed && (
                    <Crown className="w-4 h-4 text-yellow-500 ml-1" />
                  )}
                </Button>
              </Link>
            );
          })}
        </div>

        {/* CRM Section */}
        <div className="mt-6">
          {!collapsed && (
            <div className="px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              CRM
            </div>
          )}
          <div className="space-y-1 mt-1">
            {crmItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link to={item.href} key={item.href} tabIndex={collapsed ? -1 : 0}>
                  <Button
                    variant="ghost"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold"
                        : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                    } ${collapsed ? "justify-center px-2" : "justify-start"}`}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
          </div>
        </div>

        {/* Documents Section */}
        <div className="mt-6">
          {!collapsed && (
            <div className="px-3 py-1 text-xs font-semibold text-[var(--muted-foreground)] uppercase tracking-wider">
              Documents
            </div>
          )}
          <div className="space-y-1 mt-1">
            {documentItems.map((item) => {
              const active = location.pathname === item.href;
              return (
                <Link to={item.href} key={item.href} tabIndex={collapsed ? -1 : 0}>
                  <Button
                    variant="ghost"
                    className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                      active
                        ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold"
                        : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
                    } ${collapsed ? "justify-center px-2" : "justify-start"}`}
                  >
                    <item.icon className="w-5 h-5" />
                    {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
                  </Button>
                </Link>
              );
            })}
            {!collapsed && (
              <Link to="#" className="block px-3 py-2 text-xs text-[var(--muted-foreground)] hover:underline mt-1">
                ... More
              </Link>
            )}
          </div>
        </div>
      </nav>

      {/* Bottom Section */}
      <div className="mt-auto w-full px-2 py-4 flex flex-col gap-2">
        {bottomItems.map((item) => (
          <Link to={item.href} key={item.href} tabIndex={collapsed ? -1 : 0}>
            <Button
              variant="ghost"
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                location.pathname === item.href
                  ? "bg-[var(--sidebar-accent)] text-[var(--sidebar-accent-foreground)] font-semibold"
                  : "text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]"
              } ${collapsed ? "justify-center px-2" : "justify-start"}`}
            >
              <item.icon className="w-5 h-5" />
              {!collapsed && <span className="truncate flex-1 text-left">{item.label}</span>}
            </Button>
          </Link>
        ))}
        {/* User Info */}
        <div className={`flex items-center mt-4 ${collapsed ? "justify-center" : "justify-start gap-3"}`}>
          <Avatar>
            <AvatarImage src={user?.user_metadata?.avatar_url} />
            <AvatarFallback>
              {user?.user_metadata?.name?.[0] || user?.email?.[0]}
            </AvatarFallback>
          </Avatar>
          {!collapsed && (
            <>
              <div className="flex-1 min-w-0">
                <div className="font-medium text-[var(--sidebar-foreground)] truncate">
                  {user?.user_metadata?.name || user?.email || "User Name"}
                </div>
                <div className="text-xs text-[var(--muted-foreground)] truncate">
                  {user?.email || "user@email.com"}
                </div>
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="icon" className="ml-auto">
                    <MoreVertical className="w-5 h-5" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-64">
                  <DropdownMenuLabel>
                    <div className="flex items-center gap-3">
                      <Avatar>
                        <AvatarImage src={user?.user_metadata?.avatar_url} />
                        <AvatarFallback>
                          {user?.user_metadata?.name?.[0] || user?.email?.[0]}
                        </AvatarFallback>
                      </Avatar>
                      <div>
                        <div className="font-semibold text-sm truncate">
                          {user?.user_metadata?.name || "User Name"}
                        </div>
                        <div className="text-xs text-[var(--muted-foreground)] truncate">
                          {user?.email || "user@email.com"}
                        </div>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <User className="w-4 h-4 mr-2" /> Account
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <CreditCard className="w-4 h-4 mr-2" /> Billing
                  </DropdownMenuItem>
                  <DropdownMenuItem>
                    <Bell className="w-4 h-4 mr-2" /> Notifications
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem>
                    <LogOut className="w-4 h-4 mr-2" /> Log out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}
        </div>
      </div>
    </aside>
  );
}
