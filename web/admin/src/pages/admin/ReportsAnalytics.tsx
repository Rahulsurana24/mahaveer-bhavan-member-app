import { useState, useEffect } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import {
  BarChart3,
  Download,
  TrendingUp,
  Users,
  Calendar,
  DollarSign,
  Activity,
  PieChart as PieChartIcon
} from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8'];

const ReportsAnalytics = () => {
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalMembers: 0,
    eventsHeld: 0,
    totalDonations: 0,
    engagementRate: 0,
  });
  const [membershipDistribution, setMembershipDistribution] = useState<any[]>([]);
  const [memberGrowth, setMemberGrowth] = useState<any[]>([]);
  const [donationTrends, setDonationTrends] = useState<any[]>([]);
  const [eventAttendance, setEventAttendance] = useState<any[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    fetchReportsData();
  }, []);

  const fetchReportsData = async () => {
    try {
      // Fetch total members
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      // Fetch membership distribution
      const { data: members } = await supabase
        .from('members')
        .select('membership_type');

      const distribution: Record<string, number> = {};
      members?.forEach(m => {
        distribution[m.membership_type] = (distribution[m.membership_type] || 0) + 1;
      });

      const distributionData = Object.entries(distribution).map(([type, count]) => ({
        name: type,
        value: count as number
      }));

      // Fetch member growth (last 6 months)
      const sixMonthsAgo = new Date();
      sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

      const { data: growthData } = await supabase
        .from('members')
        .select('created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      const monthlyGrowth: Record<string, number> = {};
      growthData?.forEach(m => {
        const month = new Date(m.created_at).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
        monthlyGrowth[month] = (monthlyGrowth[month] || 0) + 1;
      });

      const growthChartData = Object.entries(monthlyGrowth).map(([month, count]) => ({
        month,
        members: count
      }));

      // Fetch total donations
      const { data: donations } = await supabase
        .from('donations')
        .select('amount, created_at')
        .gte('created_at', sixMonthsAgo.toISOString());

      const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      // Donation trends by month
      const monthlyDonations: Record<string, number> = {};
      donations?.forEach(d => {
        const month = new Date(d.created_at).toLocaleDateString('en-US', { month: 'short' });
        monthlyDonations[month] = (monthlyDonations[month] || 0) + Number(d.amount);
      });

      const donationChartData = Object.entries(monthlyDonations).map(([month, amount]) => ({
        month,
        amount
      }));

      // Fetch events held
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true);

      // Fetch event attendance
      const { data: events } = await supabase
        .from('events')
        .select(`
          title,
          capacity,
          event_registrations(count)
        `)
        .eq('is_published', true)
        .limit(5);

      const attendanceData = events?.map(e => ({
        name: e.title,
        registered: e.event_registrations?.[0]?.count || 0,
        capacity: e.capacity || 0,
        rate: e.capacity ? Math.round((e.event_registrations?.[0]?.count || 0) / e.capacity * 100) : 0
      })) || [];

      setStats({
        totalMembers: membersCount || 0,
        eventsHeld: eventsCount || 0,
        totalDonations,
        engagementRate: attendanceData.length > 0
          ? Math.round(attendanceData.reduce((sum, e) => sum + e.rate, 0) / attendanceData.length)
          : 0
      });

      setMembershipDistribution(distributionData);
      setMemberGrowth(growthChartData);
      setDonationTrends(donationChartData);
      setEventAttendance(attendanceData);

    } catch (error) {
      console.error('Error fetching reports data:', error);
      toast({
        title: "Error",
        description: "Failed to load reports data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleExport = () => {
    const csv = [
      ['Report Type', 'Value'],
      ['Total Members', stats.totalMembers.toString()],
      ['Events Held', stats.eventsHeld.toString()],
      ['Total Donations', `₹${stats.totalDonations.toLocaleString('en-IN')}`],
      ['Engagement Rate', `${stats.engagementRate}%`],
    ].map(row => row.join(',')).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'reports.csv';
    a.click();
  };

  if (loading) {
    return (
      <AdminLayout title="Reports & Analytics">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout title="Reports & Analytics">
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h2 className="text-2xl font-bold">Reports & Analytics</h2>
            <p className="text-muted-foreground">Comprehensive insights and data analysis</p>
          </div>
          <Button onClick={handleExport}>
            <Download className="h-4 w-4 mr-2" />
            Export Report
          </Button>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Members
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalMembers}</div>
              <div className="text-xs text-muted-foreground">
                all members
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Events Held
              </CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.eventsHeld}</div>
              <div className="text-xs text-muted-foreground">
                published events
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Total Donations
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₹{(stats.totalDonations / 100000).toFixed(1)}L</div>
              <div className="text-xs text-muted-foreground">
                last 6 months
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                Engagement Rate
              </CardTitle>
              <Activity className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.engagementRate}%</div>
              <div className="text-xs text-muted-foreground">
                avg event attendance
              </div>
            </CardContent>
          </Card>
        </div>

        <Tabs defaultValue="membership" className="space-y-6">
          <TabsList>
            <TabsTrigger value="membership">Membership</TabsTrigger>
            <TabsTrigger value="events">Events</TabsTrigger>
            <TabsTrigger value="donations">Donations</TabsTrigger>
          </TabsList>

          {/* Membership Analytics */}
          <TabsContent value="membership" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="h-5 w-5" />
                    Membership Distribution
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {membershipDistribution.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={membershipDistribution}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {membershipDistribution.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No membership data available
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>Member Growth (Last 6 Months)</CardTitle>
                </CardHeader>
                <CardContent>
                  {memberGrowth.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <LineChart data={memberGrowth}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" />
                        <YAxis />
                        <Tooltip />
                        <Legend />
                        <Line type="monotone" dataKey="members" stroke="#8884d8" strokeWidth={2} />
                      </LineChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-muted-foreground">
                      No growth data available
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Event Analytics */}
          <TabsContent value="events" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Event Attendance Analysis</CardTitle>
              </CardHeader>
              <CardContent>
                {eventAttendance.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={eventAttendance}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="name" />
                      <YAxis />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="registered" fill="#8884d8" name="Registered" />
                      <Bar dataKey="capacity" fill="#82ca9d" name="Capacity" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No event data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Donation Analytics */}
          <TabsContent value="donations" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <BarChart3 className="h-5 w-5" />
                  Donation Trends (Last 6 Months)
                </CardTitle>
              </CardHeader>
              <CardContent>
                {donationTrends.length > 0 ? (
                  <ResponsiveContainer width="100%" height={400}>
                    <BarChart data={donationTrends}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="month" />
                      <YAxis />
                      <Tooltip formatter={(value) => `₹${Number(value).toLocaleString('en-IN')}`} />
                      <Legend />
                      <Bar dataKey="amount" fill="#82ca9d" name="Donations (₹)" />
                    </BarChart>
                  </ResponsiveContainer>
                ) : (
                  <div className="h-[400px] flex items-center justify-center text-muted-foreground">
                    No donation data available
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </AdminLayout>
  );
};

export default ReportsAnalytics;
