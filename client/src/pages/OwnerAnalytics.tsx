import { useQuery } from "@tanstack/react-query";
import { useAuth } from "@/contexts/AuthContext";
import Sidebar from "@/components/Sidebar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, PieChart, Pie, Cell, ResponsiveContainer } from "recharts";
import { TrendingUp, TrendingDown, DollarSign, Car, Calendar, Users } from "lucide-react";

interface AnalyticsData {
  totalSlots: number;
  occupiedSlots: number;
  monthlyRevenue: number;
  totalBookings: number;
  revenueGrowth: number;
  bookingGrowth: number;
  monthlyData: Array<{
    month: string;
    revenue: number;
    bookings: number;
  }>;
  statusDistribution: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export default function OwnerAnalytics() {
  const { token } = useAuth();

  const { data: analytics, isLoading } = useQuery<AnalyticsData>({
    queryKey: ["/api/owner/analytics"],
    queryFn: async () => {
      // Mock data for now - replace with actual API call
      return {
        totalSlots: 12,
        occupiedSlots: 8,
        monthlyRevenue: 45600,
        totalBookings: 234,
        revenueGrowth: 12.5,
        bookingGrowth: 8.3,
        monthlyData: [
          { month: "Jan", revenue: 32000, bookings: 45 },
          { month: "Feb", revenue: 38000, bookings: 52 },
          { month: "Mar", revenue: 35000, bookings: 48 },
          { month: "Apr", revenue: 42000, bookings: 61 },
          { month: "May", revenue: 39000, bookings: 55 },
          { month: "Jun", revenue: 45600, bookings: 67 },
        ],
        statusDistribution: [
          { name: "Completed", value: 45, color: "#10B981" },
          { name: "Paid", value: 30, color: "#3B82F6" },
          { name: "Approved", value: 15, color: "#8B5CF6" },
          { name: "Pending", value: 8, color: "#F59E0B" },
          { name: "Rejected", value: 2, color: "#EF4444" },
        ]
      };
    },
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

  return (
    <div className="flex min-h-screen bg-background">
      <Sidebar />
      
      <main className="ml-64 flex-1 p-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-gray-600 mt-2">Track your parking business performance</p>
        </div>

        {/* Key Metrics */}
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <StatCard
            title="Monthly Revenue"
            value={analytics?.monthlyRevenue.toLocaleString() || "0"}
            prefix="₹"
            icon={DollarSign}
            growth={analytics?.revenueGrowth}
          />
          <StatCard
            title="Total Bookings"
            value={analytics?.totalBookings || 0}
            icon={Calendar}
            growth={analytics?.bookingGrowth}
          />
          <StatCard
            title="Total Slots"
            value={analytics?.totalSlots || 0}
            icon={Car}
          />
          <StatCard
            title="Active Users"
            value="156"
            icon={Users}
            growth={5.2}
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

        {/* Charts Section */}
        <div className="grid lg:grid-cols-2 gap-8 mb-8">
          {/* Revenue & Bookings Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Revenue & Bookings Trend</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={analytics?.monthlyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis yAxisId="left" />
                  <YAxis yAxisId="right" orientation="right" />
                  <Tooltip />
                  <Legend />
                  <Bar yAxisId="left" dataKey="revenue" fill="#3B82F6" name="Revenue (₹)" />
                  <Bar yAxisId="right" dataKey="bookings" fill="#10B981" name="Bookings" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* Booking Status Distribution */}
          <Card>
            <CardHeader>
              <CardTitle>Booking Status Distribution</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={analytics?.statusDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {analytics?.statusDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Performance Insights */}
        <Card>
          <CardHeader>
            <CardTitle>Performance Insights</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-green-600 mb-2">Best Performing</h3>
                <p className="text-sm text-gray-600">
                  Peak hours: 9 AM - 5 PM<br />
                  Highest revenue: ₹15,600 in May<br />
                  Most popular: Covered slots
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-blue-600 mb-2">Opportunities</h3>
                <p className="text-sm text-gray-600">
                  Weekend utilization: 45%<br />
                  Night hours: Low demand<br />
                  Suggested: Dynamic pricing
                </p>
              </div>
              
              <div className="p-4 border rounded-lg">
                <h3 className="font-semibold text-purple-600 mb-2">Recommendations</h3>
                <p className="text-sm text-gray-600">
                  Add 2-3 more slots<br />
                  Weekend promotions<br />
                  Mobile app notifications
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}