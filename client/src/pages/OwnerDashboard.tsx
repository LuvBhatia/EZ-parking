import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import AddSlotModal from "@/components/AddSlotModal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  ParkingMeter, 
  Car, 
  IndianRupee, 
  Clock, 
  Plus, 
  Edit,
  Download,
  CheckCircle,
  XCircle
} from "lucide-react";

interface OwnerStats {
  totalSlots: number;
  occupiedSlots: number;
  monthlyRevenue: number;
  pendingRequests: number;
}

interface BookingRequest {
  id: string;
  userId: string;
  slotId: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: string;
  status: string;
  createdAt: string;
}

export default function OwnerDashboard() {
  const { token } = useAuth();
  const [showAddSlotModal, setShowAddSlotModal] = useState(false);

  const { data: bookingRequests = [], isLoading: bookingsLoading } = useQuery<BookingRequest[]>({
    queryKey: ["/api/bookings/pending"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch pending bookings");
      return response.json();
    },
  });

  const { data: stats = { totalSlots: 0, occupiedSlots: 0, monthlyRevenue: 0, pendingRequests: 0 }, isLoading: statsLoading } = useQuery<OwnerStats>({
    queryKey: ["/api/owner/stats"],
    queryFn: async () => {
      const response = await fetch("/api/owner/stats", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch owner stats");
      return response.json();
    },
  });

  const handleApproveBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "approved" }),
      });

      if (!response.ok) throw new Error("Failed to approve booking");
      
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error("Error approving booking:", error);
    }
  };

  const handleRejectBooking = async (bookingId: string) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: "rejected" }),
      });

      if (!response.ok) throw new Error("Failed to reject booking");
      
      // Refetch data
      window.location.reload();
    } catch (error) {
      console.error("Error rejecting booking:", error);
    }
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        {/* Stats Cards */}
        <div className="grid md:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Total Slots</p>
                  <p className="text-3xl font-bold text-primary" data-testid="stat-total-slots">
                    {stats.totalSlots}
                  </p>
                </div>
                <ParkingMeter className="text-primary text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Occupied</p>
                  <p className="text-3xl font-bold text-warning" data-testid="stat-occupied-slots">
                    {stats.occupiedSlots}
                  </p>
                </div>
                <Car className="text-warning text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Monthly Revenue</p>
                  <p className="text-3xl font-bold text-success" data-testid="stat-monthly-revenue">
                    ₹{stats.monthlyRevenue.toLocaleString()}
                  </p>
                </div>
                <IndianRupee className="text-success text-3xl" />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-600">Pending Requests</p>
                  <p className="text-3xl font-bold text-secondary" data-testid="stat-pending-requests">
                    {stats.pendingRequests}
                  </p>
                </div>
                <Clock className="text-secondary text-3xl" />
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex space-x-4">
              <Button 
                onClick={() => setShowAddSlotModal(true)}
                data-testid="button-add-slot"
              >
                <Plus className="mr-2" size={20} />
                Add New Slot
              </Button>
              <Button variant="outline" data-testid="button-update-pricing">
                <Edit className="mr-2" size={20} />
                Update Pricing
              </Button>
              <Button variant="outline" data-testid="button-export-report">
                <Download className="mr-2" size={20} />
                Export Report
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Recent Booking Requests */}
        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle>Recent Booking Requests</CardTitle>
              <Button variant="ghost" data-testid="button-view-all">View All</Button>
            </div>
          </CardHeader>
          <CardContent>
            {bookingsLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : bookingRequests.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No pending booking requests.</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-4 font-semibold">User</th>
                      <th className="text-left py-3 px-4 font-semibold">Date & Time</th>
                      <th className="text-left py-3 px-4 font-semibold">Duration</th>
                      <th className="text-left py-3 px-4 font-semibold">Amount</th>
                      <th className="text-left py-3 px-4 font-semibold">Status</th>
                      <th className="text-left py-3 px-4 font-semibold">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {bookingRequests.map((request) => (
                      <tr 
                        key={request.id} 
                        className="border-b border-gray-100 hover:bg-gray-50"
                        data-testid={`booking-request-${request.id}`}
                      >
                        <td className="py-3 px-4">
                          <div>
                            <p className="font-medium" data-testid={`user-${request.id}`}>
                              User {request.userId.slice(0, 8)}...
                            </p>
                          </div>
                        </td>
                        <td className="py-3 px-4">
                          <p data-testid={`start-time-${request.id}`}>
                            {new Date(request.startTime).toLocaleDateString()}
                          </p>
                          <p className="text-sm text-gray-600">
                            {new Date(request.startTime).toLocaleTimeString()}
                          </p>
                        </td>
                        <td className="py-3 px-4" data-testid={`duration-${request.id}`}>
                          {request.duration} hours
                        </td>
                        <td className="py-3 px-4 font-semibold" data-testid={`amount-${request.id}`}>
                          ₹{request.totalAmount}
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="secondary" data-testid={`status-${request.id}`}>
                            {request.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex space-x-2">
                            <Button 
                              size="sm"
                              className="bg-success text-white hover:bg-green-600"
                              onClick={() => handleApproveBooking(request.id)}
                              data-testid={`button-approve-${request.id}`}
                            >
                              <CheckCircle className="mr-1" size={16} />
                              Approve
                            </Button>
                            <Button 
                              size="sm"
                              variant="destructive"
                              onClick={() => handleRejectBooking(request.id)}
                              data-testid={`button-reject-${request.id}`}
                            >
                              <XCircle className="mr-1" size={16} />
                              Reject
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Add Slot Modal */}
        {showAddSlotModal && (
          <AddSlotModal
            isOpen={showAddSlotModal}
            onClose={() => setShowAddSlotModal(false)}
          />
        )}
      </main>
    </div>
  );
}
