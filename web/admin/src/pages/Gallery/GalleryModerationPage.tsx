import { useState } from 'react'
import { Check, X, Eye } from 'lucide-react'

export default function GalleryModerationPage() {
  // In real implementation, fetch pending media from Supabase
  const [pendingPosts] = useState([
    { id: '1', type: 'image', caption: 'Temple visit', member: 'John Doe', date: '2025-10-25' },
    { id: '2', type: 'video', caption: 'Event highlights', member: 'Jane Smith', date: '2025-10-24' },
  ])

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white">Gallery Moderation</h1>
        <p className="text-gray-400 mt-2">Review and moderate member-uploaded media</p>
      </div>

      <div className="card p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold text-white">Pending Approval</h2>
          <span className="bg-primary-600 text-white px-3 py-1 rounded-full text-sm">
            {pendingPosts.length} pending
          </span>
        </div>

        <div className="space-y-4">
          {pendingPosts.map((post) => (
            <div key={post.id} className="bg-dark-secondary p-4 rounded-lg flex items-center justify-between">
              <div>
                <h3 className="text-white font-medium">{post.caption}</h3>
                <p className="text-sm text-gray-400">
                  By {post.member} • {post.date} • {post.type}
                </p>
              </div>
              <div className="flex items-center space-x-2">
                <button className="btn-secondary flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  <span>View</span>
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2">
                  <Check className="w-4 h-4" />
                  <span>Approve</span>
                </button>
                <button className="btn-danger flex items-center space-x-2">
                  <X className="w-4 h-4" />
                  <span>Reject</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
