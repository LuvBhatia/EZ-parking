import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { 
  LayoutDashboard, 
  Search, 
  Calendar, 
  Wallet, 
  User, 
  LogOut,
  ParkingMeter,
  CalendarCheck,
  BarChart3,
  Users,
  Building,
  AlertTriangle
} from "lucide-react";
import { Button } from "@/components/ui/button";

const userNavItems = [
  { href: "/dashboard", icon: Search, label: "Find ParkingMeter" },
  { href: "/bookings", icon: Calendar, label: "My Bookings" },
  { href: "/payments", icon: Wallet, label: "Payment History" },
  { href: "/profile", icon: User, label: "Profile" },
];

const ownerNavItems = [
  { href: "/owner", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/owner/slots", icon: ParkingMeter, label: "My ParkingMeter Slots" },
  { href: "/owner/bookings", icon: CalendarCheck, label: "Booking Requests" },
  { href: "/owner/analytics", icon: BarChart3, label: "Analytics" },
  { href: "/profile", icon: User, label: "Profile" },
];

const adminNavItems = [
  { href: "/admin", icon: LayoutDashboard, label: "Dashboard" },
  { href: "/admin/users", icon: Users, label: "User Management" },
  { href: "/admin/owners", icon: Building, label: "Owner Management" },
  { href: "/admin/analytics", icon: BarChart3, label: "System Analytics" },
  { href: "/admin/disputes", icon: AlertTriangle, label: "Disputes" },
];

export default function Sidebar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  if (!user) return null;

  const getNavItems = () => {
    switch (user.role) {
      case "user":
        return userNavItems;
      case "owner":
        return ownerNavItems;
      case "admin":
        return adminNavItems;
      default:
        return userNavItems;
    }
  };

  const navItems = getNavItems();

  return (
    <aside className="w-64 bg-surface shadow-lg h-screen fixed left-0 top-0 z-40">
      <div className="p-6 border-b">
        <div className="flex items-center">
          <ParkingMeter className="text-primary text-2xl mr-3" />
          <h1 className="text-lg font-bold text-primary">Smart ParkingMeter</h1>
        </div>
        <div className="mt-4">
          <p className="text-sm text-gray-600">
            {user.role === "user" ? "Welcome back," : 
             user.role === "owner" ? "ParkingMeter Owner" : 
             "System Administrator"}
          </p>
          <p className="font-semibold" data-testid="user-name">{user.username}</p>
        </div>
      </div>

      <nav className="mt-6">
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = location === item.href;
          
          return (
            <Link 
              key={item.href} 
              href={item.href}
              className={`flex items-center px-6 py-3 transition-colors ${
                isActive 
                  ? "bg-primary bg-opacity-10 text-primary border-r-2 border-primary" 
                  : "text-gray-700 hover:bg-gray-100"
              }`}
              data-testid={`nav-${item.label.toLowerCase().replace(/\s+/g, '-')}`}
            >
              <Icon className="mr-3" size={20} />
              {item.label}
            </Link>
          );
        })}
        
        <Button
          variant="ghost"
          onClick={() => {
            console.log("🔘 Logout button clicked");
            logout();
          }}
          className="flex items-center px-6 py-3 text-gray-700 hover:bg-gray-100 w-full justify-start"
          data-testid="button-logout"
        >
          <LogOut className="mr-3" size={20} />
          Logout
        </Button>
      </nav>
    </aside>
  );
}
