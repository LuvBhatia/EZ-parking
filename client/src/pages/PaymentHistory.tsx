import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { CreditCard, Calendar, MapPin } from "lucide-react";

interface Payment {
  id: string;
  bookingId: string;
  amount: string;
  status: string;
  paidAt: string;
  booking: {
    id: string;
    slotId: string;
    startTime: string;
    endTime: string;
    duration: number;
    totalAmount: string;
    status: string;
    createdAt: string;
    approvedAt?: string;
    paidAt?: string;
    slot: {
      id: string;
      name: string;
      address: string;
      city: string;
      vehicleType: string;
      slotType: string;
      pricePerHour: string;
      isAvailable: boolean;
    };
  };
}

export default function PaymentHistory() {
  const { token } = useAuth();

  const { data: payments = [], isLoading } = useQuery<Payment[]>({
    queryKey: ["/api/payments/user"],
    queryFn: async () => {
      const response = await fetch("/api/bookings/user", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch payments");
      const bookings = await response.json();
      
      console.log("Raw bookings data:", bookings);
      
      // Filter only paid bookings for payment history
      const filteredPayments = bookings.filter((booking: any) => 
        booking.status === "paid" || booking.status === "completed"
      ).map((booking: any) => ({
        id: booking.id,
        bookingId: booking.id,
        amount: booking.totalAmount,
        status: booking.status,
        paidAt: booking.paidAt || booking.createdAt,
        booking: booking
      }));
      
      console.log("Processed payments:", filteredPayments);
      return filteredPayments;
    },
  });

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const getStatusBadge = (status: string) => {
    return status === "completed" ? (
      <Badge className="bg-green-500 text-white">Completed</Badge>
    ) : (
      <Badge className="bg-blue-500 text-white">Paid</Badge>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ez Parking Payment History</h1>
          <p className="text-gray-600 mt-2">View all your parking payment records</p>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : payments.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <CreditCard className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No payments found</p>
              <p className="text-gray-400 mt-2">Your completed payments will appear here</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <Card key={payment.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-semibold">
                      {payment.booking.slot?.name || 'Unknown Slot'}
                    </h3>
                    <div className="flex items-center text-gray-600 mt-1">
                      <MapPin className="mr-2" size={16} />
                      <span>
                        {payment.booking.slot?.address || 'Address not available'}, 
                        {payment.booking.slot?.city || 'City not available'}
                      </span>
                    </div>
                  </div>
                  {getStatusBadge(payment.status)}
                </div>

                <div className="grid md:grid-cols-3 gap-4">
                  <div className="flex items-center">
                    <CreditCard className="mr-2 text-gray-500" size={16} />
                    <div>
                      <p className="text-sm text-gray-500">Amount Paid</p>
                      <p className="font-medium text-lg">₹{payment.amount || '0'}</p>
                    </div>
                  </div>
                  
                  <div className="flex items-center">
                    <Calendar className="mr-2 text-gray-500" size={16} />
                    <div>
                      <p className="text-sm text-gray-500">Payment Date</p>
                      <p className="font-medium">
                        {payment.paidAt ? formatDate(payment.paidAt) : 
                         payment.booking.createdAt ? formatDate(payment.booking.createdAt) : 
                         'Date not available'}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-500">Duration</p>
                    <p className="font-medium">{payment.booking.duration || 0} hours</p>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}