import { Users, Calendar, Image, TrendingUp } from 'lucide-react'

export default function DashboardPage() {
  // In real implementation, fetch these stats from Supabase
  const stats = [
    { name: 'Total Members', value: '1,284', icon: Users, change: '+12%', changeType: 'positive' as const },
    { name: 'Active Events', value: '8', icon: Calendar, change: '+2', changeType: 'positive' as const },
    { name: 'Gallery Posts', value: '2,456', icon: Image, change: '+156', changeType: 'positive' as const },
    { name: 'This Month', value: '₹45,320', icon: TrendingUp, change: '+8%', changeType: 'positive' as const },
  ]

  return (
    <div className="space-y-6">
      {/* Page header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Dashboard</h1>
        <p className="text-gray-400 mt-2">Welcome to Mahaveer Bhavan Admin Portal</p>
      </div>

      {/* Stats grid */}
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat) => (
          <div key={stat.name} className="card p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-400">{stat.name}</p>
                <p className="text-3xl font-bold text-white mt-2">{stat.value}</p>
                <p className={`text-sm mt-2 ${
                  stat.changeType === 'positive' ? 'text-green-400' : 'text-red-400'
                }`}>
                  {stat.change} from last month
                </p>
              </div>
              <div className="p-3 bg-primary rounded-lg">
                <stat.icon className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Quick actions */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <button className="btn-primary">Add New Member</button>
          <button className="btn-primary">Create Event</button>
          <button className="btn-primary">Import Data</button>
          <button className="btn-primary">Generate Report</button>
        </div>
      </div>

      {/* Recent activity placeholder */}
      <div className="card p-6">
        <h2 className="text-xl font-semibold text-white mb-4">Recent Activity</h2>
        <p className="text-gray-400">Activity feed will appear here...</p>
      </div>
    </div>
  )
}
