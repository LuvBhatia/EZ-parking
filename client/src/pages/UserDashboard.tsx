import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useQuery } from "@tanstack/react-query";
import Sidebar from "@/components/Sidebar";
import BookingModal from "@/components/BookingModal";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Search, MapPin, Car, Clock, Shield, Sun } from "lucide-react";

interface ParkingSlot {
  id: string;
  name: string;
  address: string;
  city: string;
  vehicleType: string;
  slotType: string;
  pricePerHour: string;
  isAvailable: boolean;
}

export default function UserDashboard() {
  const { token } = useAuth();
  const [selectedSlot, setSelectedSlot] = useState<ParkingSlot | null>(null);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [filters, setFilters] = useState({
    city: "",
    vehicleType: "",
  });

  const { data: slots = [], isLoading } = useQuery<ParkingSlot[]>({
    queryKey: ["/api/slots", filters.city, filters.vehicleType],
    queryFn: async () => {
      const params = new URLSearchParams();
      if (filters.city) params.append("city", filters.city);
      if (filters.vehicleType) params.append("vehicleType", filters.vehicleType);
      
      const response = await fetch(`/api/slots?${params}`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch slots");
      return response.json();
    },
  });

  const handleBookNow = (slot: ParkingSlot) => {
    setSelectedSlot(slot);
    setShowBookingModal(true);
  };

  const getAvailabilityBadge = (slot: ParkingSlot) => {
    if (slot.isAvailable) {
      return <Badge className="bg-success text-white">Available</Badge>;
    }
    return <Badge variant="secondary">Occupied</Badge>;
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        {/* Search Section */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-2xl font-bold">Find Available Parking</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-4 gap-4">
              <div>
                <Label htmlFor="city">Location</Label>
                <Select value={filters.city} onValueChange={(value) => setFilters(prev => ({ ...prev, city: value }))}>
                  <SelectTrigger data-testid="select-city">
                    <SelectValue placeholder="Select city" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Cities</SelectItem>
                    <SelectItem value="Mumbai">Mumbai</SelectItem>
                    <SelectItem value="Delhi">Delhi</SelectItem>
                    <SelectItem value="Bangalore">Bangalore</SelectItem>
                    <SelectItem value="Chennai">Chennai</SelectItem>
                    <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                    <SelectItem value="Pune">Pune</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="vehicleType">Vehicle Type</Label>
                <Select value={filters.vehicleType} onValueChange={(value) => setFilters(prev => ({ ...prev, vehicleType: value }))}>
                  <SelectTrigger data-testid="select-vehicle-type">
                    <SelectValue placeholder="Select type" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="">All Types</SelectItem>
                    <SelectItem value="2-wheeler">2-Wheeler</SelectItem>
                    <SelectItem value="4-wheeler">4-Wheeler</SelectItem>
                    <SelectItem value="suv">SUV/Large Car</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div>
                <Label htmlFor="date">Date & Time</Label>
                <Input type="datetime-local" data-testid="input-datetime" />
              </div>
              
              <div>
                <Label htmlFor="duration">Duration</Label>
                <Select>
                  <SelectTrigger data-testid="select-duration">
                    <SelectValue placeholder="Select duration" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="1">1 Hour</SelectItem>
                    <SelectItem value="2">2 Hours</SelectItem>
                    <SelectItem value="4">4 Hours</SelectItem>
                    <SelectItem value="8">8 Hours</SelectItem>
                    <SelectItem value="24">Full Day</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Available Slots */}
        <Card>
          <CardHeader>
            <CardTitle className="text-xl font-bold">Available Parking Slots</CardTitle>
          </CardHeader>
          <CardContent>
            {isLoading ? (
              <div className="flex items-center justify-center py-8">
                <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
              </div>
            ) : slots.length === 0 ? (
              <div className="text-center py-8">
                <p className="text-gray-600">No parking slots available for the selected criteria.</p>
              </div>
            ) : (
              <div className="space-y-4">
                {slots.map((slot) => (
                  <div 
                    key={slot.id} 
                    className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow"
                    data-testid={`slot-card-${slot.id}`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <div className="flex items-center mb-2">
                          <h4 className="text-lg font-semibold mr-4" data-testid={`slot-name-${slot.id}`}>
                            {slot.name}
                          </h4>
                          {getAvailabilityBadge(slot)}
                        </div>
                        
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="mr-2" size={16} />
                          <span data-testid={`slot-address-${slot.id}`}>{slot.address}, {slot.city}</span>
                        </div>
                        
                        <div className="flex items-center space-x-6 text-sm text-gray-600">
                          <span className="flex items-center">
                            <Car className="mr-1" size={16} />
                            {slot.vehicleType}
                          </span>
                          <span className="flex items-center">
                            <Clock className="mr-1" size={16} />
                            Available Now
                          </span>
                          <span className="flex items-center">
                            {slot.slotType === "covered" ? (
                              <Shield className="mr-1" size={16} />
                            ) : (
                              <Sun className="mr-1" size={16} />
                            )}
                            {slot.slotType === "covered" ? "Covered" : "Open"}
                          </span>
                        </div>
                      </div>
                      
                      <div className="text-right">
                        <div className="text-2xl font-bold text-primary mb-2">
                          ₹<span data-testid={`slot-price-${slot.id}`}>{slot.pricePerHour}</span>/hr
                        </div>
                        <Button 
                          onClick={() => handleBookNow(slot)}
                          disabled={!slot.isAvailable}
                          data-testid={`button-book-${slot.id}`}
                        >
                          Book Now
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Booking Modal */}
        {showBookingModal && selectedSlot && (
          <BookingModal
            slot={selectedSlot}
            isOpen={showBookingModal}
            onClose={() => {
              setShowBookingModal(false);
              setSelectedSlot(null);
            }}
          />
        )}
      </main>
    </div>
  );
}
