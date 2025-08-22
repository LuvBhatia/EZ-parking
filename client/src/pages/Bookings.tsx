import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { MapPin, Calendar, Clock, CreditCard } from "lucide-react";

interface Booking {
  id: string;
  slotId: string;
  startTime: string;
  endTime: string;
  duration: number;
  totalAmount: string;
  status: string;
  createdAt: string;
  slot: {
    name: string;
    address: string;
    city: string;
    vehicleType: string;
  };
}

export default function Bookings() {
  const { token } = useAuth();

  const { data: bookings = [], isLoading } = useQuery<Booking[]>({
    queryKey: ["/api/bookings/user"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch bookings");
      return response.json();
    },
  });

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
          <h1 className="text-3xl font-bold">My Bookings</h1>
          <p className="text-gray-600 mt-2">Track all your parking reservations</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : bookings.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <p className="text-gray-500 text-lg">No bookings found</p>
              <p className="text-gray-400 mt-2">Book a parking slot to see it here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <Card key={booking.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">{booking.slot.name}</h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="mr-2" size={16} />
                      <span>{booking.slot.address}, {booking.slot.city}</span>
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
                      <p className="text-sm text-gray-500">Total Amount</p>
                      <p className="font-medium">₹{booking.totalAmount}</p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Vehicle Type</p>
                    <p className="font-medium">{booking.slot.vehicleType}</p>
                  </div>
                </div>

                {booking.status === "approved" && (
                  <div className="pt-4 border-t">
                    <Button 
                      className="bg-green-600 hover:bg-green-700"
                      onClick={() => window.location.href = `/checkout/${booking.id}`}
                    >
                      Pay Now - ₹{booking.totalAmount}
                    </Button>
                  </div>
                )}
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}