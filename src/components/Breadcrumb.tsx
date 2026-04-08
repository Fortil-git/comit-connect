import { ChevronRight, Home, Info, TrendingUp, Users, Settings, Shield, Heart, Leaf, Star, Zap, Globe, FileText } from "lucide-react";
import { Link } from "react-router-dom";
import { LucideIcon } from "lucide-react";

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

interface BreadcrumbItem {
  label: string;
  href?: string;
  icon?: string;
  color?: string;
}

interface BreadcrumbProps {
  items: BreadcrumbItem[];
}

export const Breadcrumb = ({ items }: BreadcrumbProps) => {
  return (
    <nav className="flex items-center space-x-2 text-sm text-muted-foreground mb-6">
      <Link 
        to="/dashboard" 
        className="flex items-center hover:text-foreground transition-colors"
      >
        <Home className="w-4 h-4" />
      </Link>
      {items.map((item, index) => {
        const Icon = item.icon ? (iconMap[item.icon] || Info) : null;
        // Si pas d'icône spécifiée et que c'est un sous-élément (index > 0), utiliser FileText
        const DefaultIcon = !Icon && index > 0 ? FileText : null;
        const FinalIcon = Icon || DefaultIcon;
        
        return (
          <div key={index} className="flex items-center space-x-2">
            <ChevronRight className="w-4 h-4" />
            {item.href ? (
              <Link 
                to={item.href} 
                className="flex items-center gap-2 hover:text-foreground transition-colors"
              >
                {FinalIcon && (
                  <div className={`p-1 rounded ${item.color ? `bg-gradient-to-br ${item.color}` : 'bg-muted'}`}>
                    <FinalIcon className="w-3 h-3 text-white" />
                  </div>
                )}
                {item.label}
              </Link>
            ) : (
              <span className="text-foreground font-medium flex items-center gap-2">
                {FinalIcon && (
                  <div className={`p-1 rounded ${item.color ? `bg-gradient-to-br ${item.color}` : 'bg-muted'}`}>
                    <FinalIcon className="w-3 h-3 text-white" />
                  </div>
                )}
                {item.label}
              </span>
            )}
          </div>
        );
      })}
    </nav>
  );
};
