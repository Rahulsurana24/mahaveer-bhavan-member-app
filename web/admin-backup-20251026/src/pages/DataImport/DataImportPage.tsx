import { Upload } from 'lucide-react'

export default function DataImportPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Data Import</h1>
        <p className="text-gray-400 mt-2">Bulk import members, events, and donations</p>
      </div>
      <div className="card p-6">
        <div className="text-center py-12">
          <Upload className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">Import Data</h3>
          <p className="text-gray-400 mb-6">Upload CSV or Excel files to import data in bulk</p>
          <button className="btn-primary">Select File</button>
        </div>
      </div>
    </div>
  )
}
