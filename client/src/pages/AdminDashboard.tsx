import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Users, 
  Building, 
  CalendarCheck, 
  IndianRupee,
  UserPlus,
  DollarSign,
  Calendar,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  TrendingUp
} from "lucide-react";

interface SystemStats {
  totalUsers: number;
  totalOwners: number;
  activeBookings: number;
  monthlyRevenue: number;
}

interface PendingOwner {
  id: string;
  businessName: string;
  userId: string;
  address: string;
  city: string;
  phone: string;
  status: string;
  createdAt: string;
}

export default function AdminDashboard() {
  const { token } = useAuth();

  const { data: stats, isLoading: statsLoading } = useQuery<SystemStats>({
    queryKey: ["/api/admin/stats"],
    queryFn: async () => {
      const response = await fetch("/api/admin/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch system stats");
      return response.json();
    },
  });

  const { data: pendingOwners = [], isLoading: ownersLoading } = useQuery<PendingOwner[]>({
    queryKey: ["/api/owners/pending"],
    queryFn: async () => {
      const response = await fetch("/api/owners/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch pending owners");
      return response.json();
    },
  });

  const handleApproveOwner = async (ownerId: string) => {
    try {
      const response = await fetch(`/api/owners/${ownerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!response.ok) throw new Error("Failed to approve owner");
      
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error("Error approving owner:", error);
    }
  };

  const handleRejectOwner = async (ownerId: string) => {
    try {
      const response = await fetch(`/api/owners/${ownerId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) throw new Error("Failed to reject owner");
      
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting owner:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ez Parking Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">System overview and management</p>
        </div>
        
        <div className="text-center mb-12">
          <h3 className="text-3xl font-bold mb-4">Ez Parking System Overview</h3>
          <p className="text-gray-600 max-w-2xl mx-auto">Monitor system performance and manage user accounts</p>
        </div>
        {/* System Overview */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Users</p>
                  <p className="text-3xl font-bold text-primary" data-testid="stat-total-users">
                    {statsLoading ? "..." : stats?.totalUsers.toLocaleString()}
                  </p>
                </div>
                <Users className="text-primary text-3xl" />
              </div>
              <p className="text-sm text-success mt-2">
                <TrendingUp className="inline mr-1" size={16} />
                +12% this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Parking Owners</p>
                  <p className="text-3xl font-bold text-secondary" data-testid="stat-total-owners">
                    {statsLoading ? "..." : stats?.totalOwners.toLocaleString()}
                  </p>
                </div>
                <Building className="text-secondary text-3xl" />
              </div>
              <p className="text-sm text-success mt-2">
                <TrendingUp className="inline mr-1" size={16} />
                +8% this month
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Active Bookings</p>
                  <p className="text-3xl font-bold text-warning" data-testid="stat-active-bookings">
                    {statsLoading ? "..." : stats?.activeBookings.toLocaleString()}
                  </p>
                </div>
                <CalendarCheck className="text-warning text-3xl" />
              </div>
              <p className="text-sm text-success mt-2">
                <TrendingUp className="inline mr-1" size={16} />
                +5% today
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Revenue (This Month)</p>
                  <p className="text-3xl font-bold text-success" data-testid="stat-monthly-revenue">
                    {statsLoading ? "..." : `₹${stats?.monthlyRevenue.toLocaleString()}`}
                  </p>
                </div>
                <IndianRupee className="text-success text-3xl" />
              </div>
              <p className="text-sm text-success mt-2">
                <TrendingUp className="inline mr-1" size={16} />
                +18% vs last month
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Recent Activities */}
        <div className="grid md:grid-cols-2 gap-8">
          {/* Pending Owner Approvals */}
          <Card>
            <CardHeader>
              <CardTitle>Pending Owner Approvals</CardTitle>
            </CardHeader>
            <CardContent>
              {ownersLoading ? (
                <div className="flex items-center justify-center py-8">
                  <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
                </div>
              ) : pendingOwners.length === 0 ? (
                <div className="text-center py-8">
                  <p className="text-gray-600">No pending owner applications.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingOwners.map((owner) => (
                    <div 
                      key={owner.id} 
                      className="border border-gray-200 rounded-lg p-4"
                      data-testid={`pending-owner-${owner.id}`}
                    >
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="font-semibold" data-testid={`owner-name-${owner.id}`}>
                            {owner.businessName}
                          </h4>
                          <p className="text-sm text-gray-600" data-testid={`owner-phone-${owner.id}`}>
                            {owner.phone}
                          </p>
                        </div>
                        <Badge variant="secondary" data-testid={`owner-status-${owner.id}`}>
                          {owner.status}
                        </Badge>
                      </div>
                      
                      <div className="text-sm text-gray-600 mb-3">
                        <p className="flex items-center" data-testid={`owner-location-${owner.id}`}>
                          <Building className="mr-2" size={16} />
                          {owner.city}
                        </p>
                        <p>{owner.address}</p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button 
                          size="sm"
                          className="bg-success text-white hover:bg-green-600"
                          onClick={() => handleApproveOwner(owner.id)}
                          data-testid={`button-approve-owner-${owner.id}`}
                        >
                          <CheckCircle className="mr-1" size={16} />
                          Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="destructive"
                          onClick={() => handleRejectOwner(owner.id)}
                          data-testid={`button-reject-owner-${owner.id}`}
                        >
                          <XCircle className="mr-1" size={16} />
                          Reject
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          data-testid={`button-view-details-${owner.id}`}
                        >
                          <Eye className="mr-1" size={16} />
                          View Details
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>

          {/* Recent System Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent System Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-start space-x-3" data-testid="activity-user-registration">
                  <div className="bg-primary bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <UserPlus className="text-primary text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">New user registered: <span className="font-semibold">Recent User</span></p>
                    <p className="text-xs text-gray-500">2 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3" data-testid="activity-payment">
                  <div className="bg-success bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <DollarSign className="text-success text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Payment processed: ₹250 from user</p>
                    <p className="text-xs text-gray-500">5 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3" data-testid="activity-new-space">
                  <div className="bg-warning bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <Building className="text-warning text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">New parking space listed: <span className="font-semibold">Tech Park Plaza</span></p>
                    <p className="text-xs text-gray-500">12 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3" data-testid="activity-dispute">
                  <div className="bg-error bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <AlertTriangle className="text-error text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Dispute reported for booking <span className="font-semibold">#BK-1234</span></p>
                    <p className="text-xs text-gray-500">18 minutes ago</p>
                  </div>
                </div>

                <div className="flex items-start space-x-3" data-testid="activity-booking-completed">
                  <div className="bg-primary bg-opacity-10 w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0">
                    <Calendar className="text-primary text-sm" />
                  </div>
                  <div className="flex-1">
                    <p className="text-sm">Booking completed: <span className="font-semibold">Central Mall Parking</span></p>
                    <p className="text-xs text-gray-500">25 minutes ago</p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}
