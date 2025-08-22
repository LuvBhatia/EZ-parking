import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import AddSlotModal from "@/components/AddSlotModal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Plus, MapPin, Car, Edit2, Trash2, ToggleLeft, ToggleRight } from "lucide-react";

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

export default function OwnerSlots() {
  const { token } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [showAddModal, setShowAddModal] = useState(false);
  const [editingSlot, setEditingSlot] = useState<ParkingSlot | null>(null);

  const { data: slots = [], isLoading } = useQuery<ParkingSlot[]>({
    queryKey: ["/api/slots/owner"],
    queryFn: async () => {
      const response = await fetch("/api/slots/owner", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });
      
      if (!response.ok) throw new Error("Failed to fetch slots");
      return response.json();
    },
  });

  const toggleAvailabilityMutation = useMutation({
    mutationFn: async ({ slotId, isAvailable }: { slotId: string; isAvailable: boolean }) => {
      return apiRequest("PATCH", `/api/slots/${slotId}`, { isAvailable });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots/owner"] });
      toast({
        title: "Slot Updated",
        description: "Slot availability has been updated successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Update Failed",
        description: error.message || "Failed to update slot availability.",
        variant: "destructive",
      });
    },
  });

  const deleteSlotMutation = useMutation({
    mutationFn: async (slotId: string) => {
      return apiRequest("DELETE", `/api/slots/${slotId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/slots/owner"] });
      toast({
        title: "Slot Deleted",
        description: "Parking slot has been deleted successfully.",
      });
    },
    onError: (error: any) => {
      toast({
        title: "Delete Failed",
        description: error.message || "Failed to delete slot.",
        variant: "destructive",
      });
    },
  });

  const handleToggleAvailability = (slot: ParkingSlot) => {
    toggleAvailabilityMutation.mutate({
      slotId: slot.id,
      isAvailable: !slot.isAvailable
    });
  };

  const handleDeleteSlot = (slotId: string) => {
    if (window.confirm("Are you sure you want to delete this parking slot?")) {
      deleteSlotMutation.mutate(slotId);
    }
  };

  const getAvailabilityBadge = (isAvailable: boolean) => {
    return isAvailable ? (
      <Badge className="bg-green-500 text-white">Available</Badge>
    ) : (
      <Badge className="bg-red-500 text-white">Occupied</Badge>
    );
  };

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold">My Parking Slots</h1>
            <p className="text-gray-600 mt-2">Manage your parking space inventory</p>
          </div>
          <Button 
            onClick={() => setShowAddModal(true)}
            className="bg-primary hover:bg-primary/90"
          >
            <Plus className="mr-2" size={16} />
            Add New Slot
          </Button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        ) : slots.length === 0 ? (
          <Card>
            <CardContent className="text-center py-12">
              <Car className="mx-auto h-12 w-12 text-gray-400 mb-4" />
              <p className="text-gray-500 text-lg">No parking slots found</p>
              <p className="text-gray-400 mt-2">Add your first parking slot to get started</p>
              <Button 
                onClick={() => setShowAddModal(true)}
                className="mt-4"
              >
                <Plus className="mr-2" size={16} />
                Add Parking Slot
              </Button>
            </CardContent>
          </Card>
        ) : (
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {slots.map((slot) => (
              <Card key={slot.id} className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <h3 className="text-xl font-semibold">{slot.name}</h3>
                  {getAvailabilityBadge(slot.isAvailable)}
                </div>

                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-gray-600">
                    <MapPin className="mr-2" size={16} />
                    <span className="text-sm">{slot.address}, {slot.city}</span>
                  </div>
                  <div className="flex items-center text-gray-600">
                    <Car className="mr-2" size={16} />
                    <span className="text-sm">{slot.vehicleType} • {slot.slotType}</span>
                  </div>
                  <div className="text-lg font-bold text-primary">
                    ₹{slot.pricePerHour}/hour
                  </div>
                </div>

                <div className="flex justify-between items-center pt-4 border-t">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleToggleAvailability(slot)}
                    disabled={toggleAvailabilityMutation.isPending}
                  >
                    {slot.isAvailable ? (
                      <>
                        <ToggleRight className="mr-2" size={16} />
                        Set Unavailable
                      </>
                    ) : (
                      <>
                        <ToggleLeft className="mr-2" size={16} />
                        Set Available
                      </>
                    )}
                  </Button>

                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => setEditingSlot(slot)}
                    >
                      <Edit2 className="mr-1" size={14} />
                      Edit
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDeleteSlot(slot.id)}
                      disabled={deleteSlotMutation.isPending}
                    >
                      <Trash2 className="mr-1" size={14} />
                      Delete
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}

        {showAddModal && (
          <AddSlotModal 
            isOpen={showAddModal}
            onClose={() => setShowAddModal(false)}
          />
        )}
      </main>
    </div>
  );
}