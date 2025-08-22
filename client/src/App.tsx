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
import NotFound from "@/pages/not-found";

function AppContent() {
  const { user } = useAuth();

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
        
        {/* Fallback to 404 */}
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
