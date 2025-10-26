import { Link, useLocation } from "react-router-dom";
import { X, LucideIcon } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import trustLogo from "@/assets/trust-logo.png";

interface NavItem {
  icon: LucideIcon;
  label: string;
  path: string;
}

interface AdminSidebarProps {
  navItems: NavItem[];
  onClose?: () => void;
  className?: string;
}

const AdminSidebar = ({ navItems, onClose, className }: AdminSidebarProps) => {
  const location = useLocation();

  return (
    <div className={cn("w-64 h-full bg-sidebar flex flex-col border-r border-sidebar-border", className)}>
      <div className="flex items-center justify-between p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <img src={trustLogo} alt="Trust Logo" className="h-10 w-10 rounded-full object-cover" />
          <span className="font-semibold text-sidebar-foreground text-xs">Sree Mahaveer Seva</span>
        </div>
        {onClose && (
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>
      
      <nav className="flex-1 p-4 space-y-2">
        {navItems.map((item) => {
          const isActive = location.pathname === item.path;
          const Icon = item.icon;
          return (
            <Link
              key={item.path}
              to={item.path}
              className={cn(
                "flex items-center gap-3 px-3 py-2 rounded-md text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50 hover:text-sidebar-accent-foreground"
              )}
              onClick={onClose}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </div>
  );
};

export { AdminSidebar };