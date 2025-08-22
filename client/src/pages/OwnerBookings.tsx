import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { MapPin, Calendar, Clock, CreditCard, User, CheckCircle, XCircle } from "lucide-react";

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
  slot?: {
    name: string;
    address: string;
    city: string;
    vehicleType: string;
  };
  user?: {
    username: string;
    email: string;
  };
}

export default function OwnerBookings() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: bookings = [], isLoading } = useQuery<BookingRequest[]>({
    queryKey: ["/api/bookings/pending"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/pending", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch booking requests");
      return response.json();
    },
  });

  const { data: allBookings = [] } = useQuery<BookingRequest[]>({
    queryKey: ["/api/bookings/owner"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/owner", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch all bookings");
      return response.json();
    },
  });

  const updateBookingMutation = useMutation({
    mutationFn: async ({ bookingId, status }: { bookingId: string; status: string }) => {
      return apiRequest("PATCH", `/api/bookings/${bookingId}/status`, { status });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/pending"] });
      queryClient.invalidateQueries({ queryKey: ["/api/bookings/owner"] });
      queryClient.invalidateQueries({ queryKey: ["/api/owner/stats"] });
      toast({
        title: "Booking Updated",
        description: "Booking status has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update booking status.",
        variant: "destructive",
      });
    },
  });

  const handleApprove = (bookingId: string) => {
    updateBookingMutation.mutate({ bookingId, status: "approved" });
  };

  const handleReject = (bookingId: string) => {
    updateBookingMutation.mutate({ bookingId, status: "rejected" });
  };

  const getStatusBadge = (status: string) => {
    const colors = {
      pending: "bg-yellow-500",
      approved: "bg-green-500",
      rejected: "bg-red-500",
      paid: "bg-blue-500",
      completed: "bg-purple-500",
      cancelled: "bg-gray-500"
    };
    
    return (
      <Badge className={`${colors[status as keyof typeof colors]} text-white`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </Badge>
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString();
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Booking Requests</h1>
          <p className="text-gray-600 mt-2">Manage incoming parking requests from users</p>
        </div>

        {/* Pending Requests Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center">
              <Clock className="mr-2" size={20} />
              Pending Requests ({bookings.length})
            </CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center h-32">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : bookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No pending booking requests</p>
              </div>
            ) : (
              <div className="space-y-4">
                {bookings.map((booking) => (
                  <Card key={booking.id} className="p-4 border-l-4 border-l-yellow-500">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.slot?.name || 'Slot Name'}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <User className="mr-2" size={16} />
                          <span>Requested by: {booking.user?.username || 'User'}</span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
                      <div className="flex items-center">
                        <Calendar className="mr-2 text-gray-500" size={16} />
                        <div>
                          <p className="text-sm text-gray-500">Start Time</p>
                          <p className="font-medium">{formatDate(booking.startTime)}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <Clock className="mr-2 text-gray-500" size={16} />
                        <div>
                          <p className="text-sm text-gray-500">Duration</p>
                          <p className="font-medium">{booking.duration} hours</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <CreditCard className="mr-2 text-gray-500" size={16} />
                        <div>
                          <p className="text-sm text-gray-500">Amount</p>
                          <p className="font-medium">₹{booking.totalAmount}</p>
                        </div>
                      </div>
                      
                      <div className="flex items-center">
                        <MapPin className="mr-2 text-gray-500" size={16} />
                        <div>
                          <p className="text-sm text-gray-500">Vehicle</p>
                          <p className="font-medium">{booking.slot?.vehicleType || 'N/A'}</p>
                        </div>
                      </div>
                    </div>

                    <div className="flex space-x-4 pt-4 border-t">
                      <Button
                        onClick={() => handleApprove(booking.id)}
                        disabled={updateBookingMutation.isPending}
                        className="bg-green-600 hover:bg-green-700"
                      >
                        <CheckCircle className="mr-2" size={16} />
                        Approve
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => handleReject(booking.id)}
                        disabled={updateBookingMutation.isPending}
                        className="border-red-500 text-red-500 hover:bg-red-50"
                      >
                        <XCircle className="mr-2" size={16} />
                        Reject
                      </Button>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* All Bookings Section */}
        <Card>
          <CardHeader>
            <CardTitle>All Bookings History</CardTitle>
          </CardHeader>
          <CardContent>
            {allBookings.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-500">No booking history</p>
              </div>
            ) : (
              <div className="space-y-4">
                {allBookings.map((booking) => (
                  <Card key={booking.id} className="p-4">
                    <div className="flex justify-between items-start mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{booking.slot?.name || 'Slot Name'}</h3>
                        <div className="flex items-center text-gray-600 mt-1">
                          <User className="mr-2" size={16} />
                          <span>{booking.user?.username || 'User'}</span>
                        </div>
                      </div>
                      {getStatusBadge(booking.status)}
                    </div>

                    <div className="grid md:grid-cols-4 gap-4">
                      <div>
                        <p className="text-sm text-gray-500">Start Time</p>
                        <p className="font-medium">{formatDate(booking.startTime)}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Duration</p>
                        <p className="font-medium">{booking.duration} hours</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Amount</p>
                        <p className="font-medium">₹{booking.totalAmount}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-500">Date</p>
                        <p className="font-medium">{new Date(booking.createdAt).toLocaleDateString()}</p>
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  );
}