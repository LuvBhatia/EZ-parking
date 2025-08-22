import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { apiRequest } from "@/lib/queryClient";

interface ParkingSlot {
  id: string;
  name: string;
  address: string;
  city: string;
  vehicleType: string;
  slotType: string;
  pricePerHour: string;
  isAvailable: boolean;
  createdAt: string;
}

interface EditSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  slot: ParkingSlot | null;
  onSlotUpdated: () => void;
}

export default function EditSlotModal({ isOpen, onClose, slot, onSlotUpdated }: EditSlotModalProps) {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    address: "",
    city: "Mumbai",
    vehicleType: "4-wheeler",
    slotType: "covered",
    pricePerHour: "",
    isAvailable: true,
  });

  // Update form data when slot changes
  useEffect(() => {
    if (slot) {
      setFormData({
        name: slot.name,
        address: slot.address,
        city: slot.city,
        vehicleType: slot.vehicleType,
        slotType: slot.slotType,
        pricePerHour: slot.pricePerHour,
        isAvailable: slot.isAvailable,
      });
    }
  }, [slot]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!slot) return;
    
    setIsLoading(true);

    try {
      await apiRequest("PUT", `/api/slots/${slot.id}`, {
        ...formData,
        pricePerHour: formData.pricePerHour,
      });

      toast({
        title: "Slot Updated",
        description: "Parking slot has been updated successfully.",
      });

      onClose();
      onSlotUpdated();
      
      // Reset form
      setFormData({
        name: "",
        address: "",
        city: "Mumbai",
        vehicleType: "4-wheeler",
        slotType: "covered",
        pricePerHour: "",
        isAvailable: true,
      });
    } catch (error: any) {
      toast({
        title: "Error Updating Slot",
        description: error.message || "Failed to update slot",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (!slot) return null;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="edit-slot-modal">
        <DialogHeader>
          <DialogTitle>Edit Parking Slot</DialogTitle>
          <DialogDescription>
            Update the details of your parking slot.
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="name">Slot Name/Number</Label>
              <Input
                id="name"
                placeholder="e.g., A-15, Block B Slot 10"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            
            <div>
              <Label htmlFor="city">City</Label>
              <Select value={formData.city} onValueChange={(value) => setFormData({ ...formData, city: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Mumbai">Mumbai</SelectItem>
                  <SelectItem value="Delhi">Delhi</SelectItem>
                  <SelectItem value="Bangalore">Bangalore</SelectItem>
                  <SelectItem value="Chennai">Chennai</SelectItem>
                  <SelectItem value="Hyderabad">Hyderabad</SelectItem>
                  <SelectItem value="Pune">Pune</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Address</Label>
            <Textarea
              id="address"
              placeholder="Full address of the parking location"
              value={formData.address}
              onChange={(e) => setFormData({ ...formData, address: e.target.value })}
              required
            />
          </div>

          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select value={formData.vehicleType} onValueChange={(value) => setFormData({ ...formData, vehicleType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select vehicle type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-wheeler">2-wheeler</SelectItem>
                  <SelectItem value="4-wheeler">4-wheeler</SelectItem>
                  <SelectItem value="suv">SUV</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div>
              <Label htmlFor="slotType">Slot Type</Label>
              <Select value={formData.slotType} onValueChange={(value) => setFormData({ ...formData, slotType: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select slot type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="covered">Covered</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="pricePerHour">Price per Hour (₹)</Label>
            <Input
              id="pricePerHour"
              type="number"
              placeholder="0.00"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              required
              min="0"
              step="0.01"
            />
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="isAvailable"
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData({ ...formData, isAvailable: checked as boolean })}
            />
            <Label htmlFor="isAvailable">Slot is currently available</Label>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading ? "Updating..." : "Update Slot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
