import { Link, useLocation } from "wouter";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Car, User, LogOut } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Don't show navbar on auth pages (users see sidebar with logout instead)
  if (location === "/login" || location === "/register") {
    return null;
  }

  return (
    <header className="bg-surface shadow-sm border-b sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          <Link href="/">
            <a className="flex items-center" data-testid="link-home">
              <Car className="text-primary text-2xl mr-3" />
              <h1 className="text-xl font-bold text-primary">Ez Parking</h1>
            </a>
          </Link>

          <div className="flex items-center space-x-4">
            {!user ? (
              <>
                <Link href="/login">
                  <Button variant="ghost" data-testid="button-login">
                    Login
                  </Button>
                </Link>
                <Link href="/register">
                  <Button data-testid="button-register">
                    Get Started
                  </Button>
                </Link>
              </>
            ) : user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-8 w-8 rounded-full" data-testid="button-profile">
                    <Avatar className="h-8 w-8">
                      <AvatarFallback>
                        {user.username.charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end" forceMount>
                  <DropdownMenuItem disabled>
                    <User className="mr-2 h-4 w-4" />
                    <span data-testid="text-username">{user.username}</span>
                  </DropdownMenuItem>
                  <DropdownMenuItem disabled>
                    <span className="text-xs text-muted-foreground" data-testid="text-role">
                      {user.role}
                    </span>
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={logout} data-testid="button-logout-menu">
                    <LogOut className="mr-2 h-4 w-4" />
                    <span>Log out</span>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
        </div>
      </div>
    </header>
  );
}
