import { Settings as SettingsIcon } from 'lucide-react'

export default function SettingsPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Settings</h1>
        <p className="text-gray-400 mt-2">System configuration and preferences</p>
      </div>
      <div className="card p-6">
        <div className="text-center py-12">
          <SettingsIcon className="w-16 h-16 text-gray-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">System Settings</h3>
          <p className="text-gray-400">App branding, email templates, system parameters, etc.</p>
        </div>
      </div>
    </div>
  )
}
