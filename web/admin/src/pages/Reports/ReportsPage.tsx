import { BarChart3 } from 'lucide-react'

export default function ReportsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Reports</h1>
        <p className="text-gray-400 mt-2">View analytics and generate reports</p>
      </div>
      <div className="card p-6">
        <div className="text-center py-12">
          <BarChart3 className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Analytics & Reports</h3>
          <p className="text-gray-400">Financial reports, attendance tracking, member growth analytics, etc.</p>
        </div>
      </div>
    </div>
  )
}
