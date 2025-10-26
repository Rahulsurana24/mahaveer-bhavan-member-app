import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/layout/admin-layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Users, Calendar, DollarSign, MessageSquare, TrendingUp, AlertCircle } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { supabase } from "@/integrations/supabase/client";
import { Loading } from "@/components/ui/loading";
import { useToast } from "@/hooks/use-toast";
import { format } from "date-fns";

const AdminDashboard = () => {
  const [stats, setStats] = useState({
    totalMembers: 0,
    newRegistrations: 0,
    activeEvents: 0,
    monthlyDonations: 0,
    messagesSent: 0,
  });
  const [upcomingEvents, setUpcomingEvents] = useState<any[]>([]);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      // Fetch total members
      const { count: membersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true });

      // Fetch new registrations (this month)
      const startOfMonth = new Date();
      startOfMonth.setDate(1);
      startOfMonth.setHours(0, 0, 0, 0);

      const { count: newMembersCount } = await supabase
        .from('members')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Fetch active events
      const { count: eventsCount } = await supabase
        .from('events')
        .select('*', { count: 'exact', head: true })
        .eq('is_published', true)
        .gte('date', new Date().toISOString());

      const { data: donations } = await supabase
        .from('donations')
        .select('amount')
        .gte('created_at', startOfMonth.toISOString());

      const totalDonations = donations?.reduce((sum, d) => sum + Number(d.amount), 0) || 0;

      // Fetch messages count
      const { count: messagesCount } = await supabase
        .from('messages')
        .select('*', { count: 'exact', head: true })
        .gte('created_at', startOfMonth.toISOString());

      // Fetch upcoming events with registration counts
      const { data: events } = await supabase
        .from('events')
        .select(`
          *,
          event_registrations(count)
        `)
        .eq('is_published', true)
        .gte('date', new Date().toISOString())
        .order('date', { ascending: true })
        .limit(3);

      // Fetch recent activity - recent members, events, and donations
      const { data: recentMembers } = await supabase
        .from('members')
        .select('id, full_name, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentDonations } = await supabase
        .from('donations')
        .select('id, amount, created_at, members(full_name)')
        .order('created_at', { ascending: false })
        .limit(5);

      const { data: recentEvents } = await supabase
        .from('events')
        .select('id, title, created_at')
        .order('created_at', { ascending: false })
        .limit(5);

      // Combine and sort recent activity
      const activity = [
        ...(recentMembers?.map(m => ({ type: 'member', text: `New member: ${m.full_name}`, time: m.created_at })) || []),
        ...(recentDonations?.map(d => ({ type: 'donation', text: `Donation: ₹${Number(d.amount).toLocaleString('en-IN')} from ${d.members?.full_name || 'Anonymous'}`, time: d.created_at })) || []),
        ...(recentEvents?.map(e => ({ type: 'event', text: `Event created: ${e.title}`, time: e.created_at })) || [])
      ]
        .sort((a, b) => new Date(b.time).getTime() - new Date(a.time).getTime())
        .slice(0, 10);

      setStats({
        totalMembers: membersCount || 0,
        newRegistrations: newMembersCount || 0,
        activeEvents: eventsCount || 0,
        monthlyDonations: totalDonations,
        messagesSent: messagesCount || 0,
      });

      setUpcomingEvents(events || []);
      setRecentActivity(activity);
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      toast({
        title: "Error",
        description: "Failed to load dashboard data",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <AdminLayout title="Dashboard">
        <div className="flex justify-center items-center h-64">
          <Loading size="lg" />
        </div>
      </AdminLayout>
    );
  }

  const statsData = [
    { title: "Total Members", value: stats.totalMembers.toString(), icon: Users, color: "text-blue-500" },
    { title: "New Registrations", value: stats.newRegistrations.toString(), icon: TrendingUp, color: "text-green-500" },
    { title: "Active Events", value: stats.activeEvents.toString(), icon: Calendar, color: "text-purple-500" },
    { title: "Monthly Donations", value: `₹${stats.monthlyDonations.toLocaleString('en-IN')}`, icon: DollarSign, color: "text-orange-500" },
  ];

  return (
    <AdminLayout title="Dashboard">
      <div className="space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {statsData.map((stat) => {
            const Icon = stat.icon;
            return (
              <Card key={stat.title} className="hover:shadow-lg transition-shadow">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </CardTitle>
                  <Icon className={`h-5 w-5 ${stat.color}`} />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stat.value}</div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Upcoming Events */}
          <Card>
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle>Upcoming Events</CardTitle>
              <Button variant="outline" size="sm" onClick={() => window.location.href = '/admin/events'}>
                View All
              </Button>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {upcomingEvents.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No upcoming events</p>
                ) : (
                  upcomingEvents.map((event) => (
                    <div key={event.id} className="flex items-center justify-between">
                      <div>
                        <p className="font-medium">{event.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {format(new Date(event.date), 'MMM dd, yyyy')} at {event.time}
                        </p>
                      </div>
                      <Badge variant="secondary">
                        {event.event_registrations?.[0]?.count || 0} registered
                      </Badge>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>

          {/* Recent Activity */}
          <Card>
            <CardHeader>
              <CardTitle>Recent Activity</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {recentActivity.length === 0 ? (
                  <p className="text-sm text-muted-foreground">No recent activity</p>
                ) : (
                  recentActivity.map((activity, index) => (
                    <div key={index} className="flex items-start gap-3 pb-3 border-b last:border-0">
                      <div className={`mt-0.5 h-2 w-2 rounded-full ${
                        activity.type === 'member' ? 'bg-blue-500' :
                        activity.type === 'donation' ? 'bg-green-500' :
                        'bg-purple-500'
                      }`} />
                      <div className="flex-1">
                        <p className="text-sm">{activity.text}</p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {format(new Date(activity.time), 'MMM dd, yyyy • hh:mm a')}
                        </p>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => window.location.href = '/admin/members'}
              >
                <Users className="h-6 w-6 mb-2" />
                Manage Members
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => window.location.href = '/admin/events'}
              >
                <Calendar className="h-6 w-6 mb-2" />
                Manage Events
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => window.location.href = '/admin/communications'}
              >
                <MessageSquare className="h-6 w-6 mb-2" />
                Communications
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => window.location.href = '/admin/finances'}
              >
                <DollarSign className="h-6 w-6 mb-2" />
                View Donations
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </AdminLayout>
  );
};

export default AdminDashboard;