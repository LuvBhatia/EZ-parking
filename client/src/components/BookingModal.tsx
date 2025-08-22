import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { MapPin, Car, Calendar, Clock } from "lucide-react";

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

interface BookingModalProps {
  slot: ParkingSlot;
  isOpen: boolean;
  onClose: () => void;
}

export default function BookingModal({ slot, isOpen, onClose }: BookingModalProps) {
  const { token } = useAuth();
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    startTime: "",
    duration: "3",
  });

  const calculateTotal = () => {
    const hours = parseInt(formData.duration);
    const basePrice = parseFloat(slot.pricePerHour) * hours;
    const serviceFee = Math.round(basePrice * 0.1);
    const gst = Math.round((basePrice + serviceFee) * 0.18);
    const total = basePrice + serviceFee + gst;
    
    return {
      basePrice: basePrice.toFixed(2),
      serviceFee: serviceFee.toFixed(2),
      gst: gst.toFixed(2),
      total: total.toFixed(2),
    };
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const startDateTime = new Date(formData.startTime);
      const endDateTime = new Date(startDateTime);
      endDateTime.setHours(endDateTime.getHours() + parseInt(formData.duration));

      const total = calculateTotal();

      const response = await fetch("/api/bookings", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          slotId: slot.id,
          startTime: startDateTime.toISOString(),
          endTime: endDateTime.toISOString(),
          duration: parseInt(formData.duration),
          totalAmount: total.total,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message);
      }

      toast({
        title: "Booking Submitted",
        description: "Your booking request has been submitted for approval.",
      });

      onClose();
    } catch (error: any) {
      toast({
        title: "Booking Failed",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const total = calculateTotal();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md" data-testid="booking-modal">
        <DialogHeader>
          <DialogTitle>Confirm Booking</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="border border-gray-200 rounded-lg p-4">
            <h4 className="font-semibold mb-2" data-testid="slot-name">{slot.name}</h4>
            <div className="text-sm text-gray-600 space-y-1">
              <p className="flex items-center">
                <MapPin className="mr-2" size={16} />
                <span data-testid="slot-address">{slot.address}, {slot.city}</span>
              </p>
              <p className="flex items-center">
                <Car className="mr-2" size={16} />
                <span data-testid="slot-vehicle-type">{slot.vehicleType}</span>
              </p>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="startTime">Start Time</Label>
              <Input
                id="startTime"
                type="datetime-local"
                value={formData.startTime}
                onChange={(e) => setFormData(prev => ({ ...prev, startTime: e.target.value }))}
                required
                min={new Date().toISOString().slice(0, 16)}
                data-testid="input-start-time"
              />
            </div>
            <div>
              <Label htmlFor="duration">Duration</Label>
              <Select 
                value={formData.duration} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, duration: value }))}
              >
                <SelectTrigger data-testid="select-duration">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 Hour</SelectItem>
                  <SelectItem value="2">2 Hours</SelectItem>
                  <SelectItem value="3">3 Hours</SelectItem>
                  <SelectItem value="4">4 Hours</SelectItem>
                  <SelectItem value="8">8 Hours</SelectItem>
                  <SelectItem value="24">Full Day</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="border border-gray-200 rounded-lg p-4">
            <h5 className="font-semibold mb-2">Payment Summary</h5>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span>Base Price ({formData.duration} hours)</span>
                <span data-testid="base-price">₹{total.basePrice}</span>
              </div>
              <div className="flex justify-between">
                <span>Service Fee</span>
                <span data-testid="service-fee">₹{total.serviceFee}</span>
              </div>
              <div className="flex justify-between">
                <span>GST (18%)</span>
                <span data-testid="gst">₹{total.gst}</span>
              </div>
              <hr className="my-2" />
              <div className="flex justify-between font-semibold text-lg">
                <span>Total Amount</span>
                <span className="text-primary" data-testid="total-amount">₹{total.total}</span>
              </div>
            </div>
          </div>

          <div className="flex space-x-3">
            <Button 
              type="button" 
              variant="outline" 
              onClick={onClose} 
              className="flex-1"
              data-testid="button-cancel"
            >
              Cancel
            </Button>
            <Button 
              type="submit" 
              className="flex-1" 
              disabled={isLoading}
              data-testid="button-confirm"
            >
              {isLoading ? "Submitting..." : "Submit Booking"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
