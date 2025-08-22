import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Car, Calendar, Users } from "lucide-react";
import { apiRequest } from "@/lib/queryClient";

interface AnalyticsData {
  totalSlots: number;
  occupiedSlots: number;
  monthlyRevenue: number;
  pendingRequests: number;
}

export default function OwnerAnalytics() {
  const { user } = useAuth();

  const { data: analytics, isLoading, error } = useQuery<AnalyticsData>({
    queryKey: ["owner-stats"],
    queryFn: async () => {
      const response = await apiRequest("GET", "/api/owner/stats");
      const data = await response.json();
      return data;
    },
    enabled: !!user,
    refetchInterval: 5000, // Refresh every 5 seconds
  });

  const occupancyRate = analytics ? (analytics.occupiedSlots / analytics.totalSlots) * 100 : 0;

  const StatCard = ({ 
    title, 
    value, 
    icon: Icon, 
    growth, 
    prefix = "" 
  }: { 
    title: string; 
    value: string | number; 
    icon: any; 
    growth?: number; 
    prefix?: string;
  }) => (
    <Card>
      <CardContent className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-muted-foreground">{title}</p>
            <p className="text-2xl font-bold">{prefix}{value}</p>
            {growth !== undefined && (
              <div className="flex items-center mt-2">
                {growth > 0 ? (
                  <TrendingUp className="h-4 w-4 text-green-500 mr-1" />
                ) : (
                  <TrendingDown className="h-4 w-4 text-red-500 mr-1" />
                )}
                <span className={`text-sm ${growth > 0 ? 'text-green-500' : 'text-red-500'}`}>
                  {Math.abs(growth)}% from last month
                </span>
              </div>
            )}
          </div>
          <Icon className="h-8 w-8 text-muted-foreground" />
        </div>
      </CardContent>
    </Card>
  );

  if (isLoading) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-center h-96">
            <div className="animate-spin w-8 h-8 border-4 border-primary border-t-transparent rounded-full" />
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-red-600 mb-4">Error loading analytics</h2>
              <p className="text-gray-600 mb-4">{error.message}</p>
              <button 
                onClick={() => window.location.reload()} 
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >
                Refresh Page
              </button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!analytics) {
    return (
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <main className="ml-64 flex-1 p-8">
          <div className="flex items-center justify-center h-96">
            <div className="text-center">
              <h2 className="text-xl font-semibold text-gray-600 mb-4">No analytics data available</h2>
              <p className="text-gray-500 mb-4">Please check if you have any parking slots</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Ez Parking Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your parking business performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Monthly Revenue"
            value={analytics?.monthlyRevenue.toLocaleString() || "0"}
            prefix="₹"
            icon={DollarSign}
          />
          <StatCard
            title="Pending Requests"
            value={analytics?.pendingRequests || 0}
            icon={Calendar}
          />
          <StatCard
            title="Total Slots"
            value={analytics?.totalSlots || 0}
            icon={Car}
          />
          <StatCard
            title="Occupied Slots"
            value={analytics?.occupiedSlots || 0}
            icon={Users}
          />
        </div>

        {/* Occupancy Rate */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle>Slot Occupancy Rate</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between text-sm">
                <span>Occupied: {analytics?.occupiedSlots || 0} slots</span>
                <span>Available: {(analytics?.totalSlots || 0) - (analytics?.occupiedSlots || 0)} slots</span>
              </div>
              <Progress value={occupancyRate} className="h-3" />
              <p className="text-center text-lg font-semibold">
                {occupancyRate.toFixed(1)}% Occupancy Rate
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600 mb-2">Current Status</h3>
                <p className="text-sm text-gray-600">
                  Total slots: {analytics?.totalSlots || 0}<br />
                  Occupied: {analytics?.occupiedSlots || 0}<br />
                  Available: {(analytics?.totalSlots || 0) - (analytics?.occupiedSlots || 0)}
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-blue-600 mb-2">Revenue</h3>
                <p className="text-sm text-gray-600">
                  Monthly revenue: ₹{analytics?.monthlyRevenue.toLocaleString() || 0}<br />
                  Pending requests: {analytics?.pendingRequests || 0}<br />
                  Occupancy rate: {occupancyRate.toFixed(1)}%
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-purple-600 mb-2">Recommendations</h3>
                <p className="text-sm text-gray-600">
                  {occupancyRate > 80 ? "High demand - consider adding more slots" : 
                   occupancyRate > 50 ? "Moderate demand - optimize pricing" : 
                   "Low demand - consider promotions or price adjustments"}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}