import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import {
  Info,
  TrendingUp,
  Users,
  Settings,
  Shield,
  Heart,
  Leaf,
  Star,
  Zap,
  Globe,
  ChevronLeft,
  ChevronRight,
  Home
} from "lucide-react";
import { useThemeData } from "@/contexts/ThemeDataContext";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useSidebar } from "@/contexts/SidebarContext";

const iconMap: Record<string, any> = {
  info: Info,
  'trending-up': TrendingUp,
  users: Users,
  settings: Settings,
  shield: Shield,
  heart: Heart,
  leaf: Leaf,
  star: Star,
  zap: Zap,
  globe: Globe,
};

export const Sidebar = () => {
  const { themes } = useThemeData();
  const { user } = useAuth();
  const { isCollapsed, setIsCollapsed } = useSidebar();
  const [isMobileOpen, setIsMobileOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const getActiveTheme = () => {
    const pathParts = location.pathname.split('/');
    if (pathParts[1] === 'theme' && pathParts[2]) {
      return pathParts[2];
    }
    return null;
  };

  const activeThemeId = getActiveTheme();

  const handleNavigate = (path: string) => {
    navigate(path);
    setIsMobileOpen(false);
  };

  return (
    <aside
      className={cn(
        "fixed left-0 top-0 h-screen bg-card border-r border-border/50 transition-all duration-300 z-20 flex-col hidden lg:flex",
        isCollapsed ? "w-16" : "w-64"
      )}
    >
      {/* Header */}
      <div className="p-4 border-b border-border/50 flex items-center justify-between">
        {!isCollapsed && (
          <h2 className="font-bold text-sm">Navigation</h2>
        )}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsCollapsed(!isCollapsed)}
          className="h-8 w-8"
        >
          {isCollapsed ? (
            <ChevronRight className="h-4 w-4" />
          ) : (
            <ChevronLeft className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Dashboard Link */}
      <div className="p-2 border-b border-border/50">
        <Button
          variant={location.pathname === '/dashboard' ? 'secondary' : 'ghost'}
          className={cn(
            "w-full justify-start gap-3 transition-all",
            isCollapsed && "justify-center px-2"
          )}
          onClick={() => handleNavigate('/dashboard')}
        >
          <Home className="h-4 w-4 shrink-0" />
          {!isCollapsed && <span className="text-sm">Dashboard</span>}
        </Button>
      </div>

      {/* Themes List */}
      <nav className="flex-1 overflow-y-auto p-2 space-y-1">
        {themes.map((theme) => {
          const Icon = iconMap[theme.icon] || Info;
          const isActive = activeThemeId === theme.id;

          return (
            <Button
              key={theme.id}
              variant={isActive ? 'secondary' : 'ghost'}
              className={cn(
                "w-full justify-start gap-3 transition-all group relative",
                isCollapsed && "justify-center px-2"
              )}
              onClick={() => handleNavigate(`/theme/${theme.id}`)}
            >
              <div
                className={cn(
                  "p-1.5 rounded-md bg-gradient-to-br shrink-0",
                  theme.color,
                  "group-hover:scale-110 transition-transform"
                )}
              >
                <Icon className="h-3.5 w-3.5 text-white" />
              </div>
              {!isCollapsed && (
                <div className="flex-1 text-left">
                  <p className="text-xs font-medium leading-tight line-clamp-2">
                    {theme.title}
                  </p>
                </div>
              )}
              {isActive && !isCollapsed && (
                <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-primary rounded-r" />
              )}
            </Button>
          );
        })}
      </nav>

      {/* Admin Link */}
      {user?.userRole === 'SUPER_ADMIN' && (
        <div className="p-2 border-t border-border/50">
          <Button
            variant={location.pathname.startsWith('/admin') ? 'secondary' : 'ghost'}
            className={cn(
              "w-full justify-start gap-3",
              isCollapsed && "justify-center px-2"
            )}
            onClick={() => handleNavigate('/admin')}
          >
            <Shield className="h-4 w-4 shrink-0 text-red-500" />
            {!isCollapsed && <span className="text-sm">Administration</span>}
          </Button>
        </div>
      )}

      {/* Footer */}
      {!isCollapsed && (
        <div className="p-3 border-t border-border/50 text-center">
          <p className="text-[10px] text-muted-foreground">
            {themes.length} thèmes disponibles
          </p>
        </div>
      )}
    </aside>
  );
};
