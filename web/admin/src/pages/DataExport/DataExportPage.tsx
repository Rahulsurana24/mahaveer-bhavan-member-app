import { Download } from 'lucide-react'

export default function DataExportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Data Export</h1>
        <p className="text-gray-400 mt-2">Export data for analysis and backups</p>
      </div>
      <div className="card p-6">
        <div className="text-center py-12">
          <Download className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Export Data</h3>
          <p className="text-gray-400 mb-6">Download member, event, or donation data as CSV or Excel</p>
          <div className="flex justify-center space-x-4">
            <button className="btn-primary">Export Members</button>
            <button className="btn-primary">Export Events</button>
            <button className="btn-primary">Export Donations</button>
          </div>
        </div>
      </div>
    </div>
  )
}
