import { useState } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

interface AddSlotModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSlotAdded?: () => void;
}

export default function AddSlotModal({ isOpen, onClose, onSlotAdded }: AddSlotModalProps) {
  const { token } = useAuth();
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    console.log("Submitting slot data:", formData);

    try {
      const response = await fetch("/api/slots", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ...formData,
          pricePerHour: formData.pricePerHour,
        }),
      });

      console.log("Response status:", response.status);

      if (!response.ok) {
        const error = await response.json();
        console.error("Server error:", error);
        throw new Error(error.message || `HTTP ${response.status}: ${response.statusText}`);
      }

      const result = await response.json();
      console.log("Success response:", result);

      toast({
        title: "Slot Added",
        description: "New parking slot has been added successfully.",
      });

      onClose();
      
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

      // Call callback to refresh data
      if (onSlotAdded) {
        onSlotAdded();
      }
    } catch (error: any) {
      console.error("Error adding slot:", error);
      toast({
        title: "Error Adding Slot",
        description: error.message || "An unexpected error occurred",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-lg" data-testid="add-slot-modal">
        <DialogHeader>
          <DialogTitle>Add New Parking Slot</DialogTitle>
          <DialogDescription>
            Fill in the details below to add a new parking slot to your property.
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
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
                data-testid="input-slot-name"
              />
            </div>
            <div>
              <Label htmlFor="vehicleType">Vehicle Type</Label>
              <Select 
                value={formData.vehicleType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, vehicleType: value }))}
              >
                <SelectTrigger data-testid="select-vehicle-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="2-wheeler">2-Wheeler</SelectItem>
                  <SelectItem value="4-wheeler">4-Wheeler</SelectItem>
                  <SelectItem value="suv">SUV/Large Car</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div>
            <Label htmlFor="address">Location/Address</Label>
            <Textarea
              id="address"
              rows={3}
              placeholder="Full address with landmarks"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
              data-testid="textarea-address"
            />
          </div>

          <div className="grid md:grid-cols-3 gap-4">
            <div>
              <Label htmlFor="city">City</Label>
              <Select 
                value={formData.city} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, city: value }))}
              >
                <SelectTrigger data-testid="select-city">
                  <SelectValue />
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
            <div>
              <Label htmlFor="pricePerHour">Price per Hour (₹)</Label>
              <Input
                id="pricePerHour"
                type="number"
                placeholder="50"
                min="1"
                step="0.01"
                value={formData.pricePerHour}
                onChange={(e) => setFormData(prev => ({ ...prev, pricePerHour: e.target.value }))}
                required
                data-testid="input-price"
              />
            </div>
            <div>
              <Label htmlFor="slotType">Slot Type</Label>
              <Select 
                value={formData.slotType} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, slotType: value }))}
              >
                <SelectTrigger data-testid="select-slot-type">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="covered">Covered</SelectItem>
                  <SelectItem value="open">Open</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox 
              id="available" 
              checked={formData.isAvailable}
              onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: !!checked }))}
              data-testid="checkbox-available"
            />
            <Label htmlFor="available">Mark as available immediately</Label>
          </div>

          <div className="flex space-x-3 pt-4">
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
              data-testid="button-add"
            >
              {isLoading ? "Adding..." : "Add Slot"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
