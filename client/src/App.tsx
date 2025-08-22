import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider, useAuth } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import NotificationSystem from "@/components/NotificationSystem";
import Landing from "@/pages/Landing";
import Login from "@/pages/Login";
import Register from "@/pages/Register";
import UserDashboard from "@/pages/UserDashboard";
import OwnerDashboard from "@/pages/OwnerDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import Checkout from "@/pages/Checkout";
import Bookings from "@/pages/Bookings";
import PaymentHistory from "@/pages/PaymentHistory";
import Profile from "@/pages/Profile";
import OwnerSlots from "@/pages/OwnerSlots";
import OwnerBookings from "@/pages/OwnerBookings";
import OwnerAnalytics from "@/pages/OwnerAnalytics";
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user, isLoading } = useAuth();

  // Show loading spinner during auth state changes
  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {user && (
        <div className="fixed top-4 right-4 z-50">
          <NotificationSystem />
        </div>
      )}
      
      <Switch>
        <Route path="/" component={Landing} />
        <Route path="/login" component={Login} />
        <Route path="/register" component={Register} />
        
        {/* Only render protected routes if user exists */}
        {user && (
          <div className="protected-routes">
            <Route path="/dashboard">
              <ProtectedRoute requiredRole={["user"]}>
                <UserDashboard />
              </ProtectedRoute>
            </Route>
            
            <Route path="/owner">
              <ProtectedRoute requiredRole={["owner"]}>
                <OwnerDashboard />
              </ProtectedRoute>
            </Route>
            
            <Route path="/admin">
              <ProtectedRoute requiredRole={["admin"]}>
                <AdminDashboard />
              </ProtectedRoute>
            </Route>
            
            <Route path="/checkout/:bookingId">
              {(params) => (
                <ProtectedRoute requiredRole={["user"]}>
                  <Checkout bookingId={params.bookingId!} />
                </ProtectedRoute>
              )}
            </Route>
            
            <Route path="/bookings">
              <ProtectedRoute requiredRole={["user"]}>
                <Bookings />
              </ProtectedRoute>
            </Route>
            
            <Route path="/payments">
              <ProtectedRoute requiredRole={["user"]}>
                <PaymentHistory />
              </ProtectedRoute>
            </Route>
            
            <Route path="/profile">
              <ProtectedRoute requiredRole={["user", "owner", "admin"]}>
                <Profile />
              </ProtectedRoute>
            </Route>
            
            <Route path="/owner/slots">
              <ProtectedRoute requiredRole={["owner"]}>
                <OwnerSlots />
              </ProtectedRoute>
            </Route>
            
            <Route path="/owner/bookings">
              <ProtectedRoute requiredRole={["owner"]}>
                <OwnerBookings />
              </ProtectedRoute>
            </Route>
            
            <Route path="/owner/analytics">
              <ProtectedRoute requiredRole={["owner"]}>
                <OwnerAnalytics />
              </ProtectedRoute>
            </Route>
          </div>
        )}
        
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <AppContent />
          <Toaster />
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
