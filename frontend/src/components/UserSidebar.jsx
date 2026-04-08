import { MessageCircle, Clock } from 'lucide-react';

export default function UserSidebar({ users, selectedUser, setSelectedUser, onlineSet }) {
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  // Sort users by recently chatted (you can enhance with last message time from backend)
  const sortedUsers = [...users].sort((a, b) => {
    const aActive = onlineSet.has(a._id);
    const bActive = onlineSet.has(b._id);
    return bActive - aActive; // Online users first
  });

  return (
    <aside className="rounded-3xl border border-gray-300 bg-white/80 p-4 shadow-xl shadow-gray-200/20 flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-brand" />
          <h3 className="text-lg font-semibold text-gray-900">Contacts</h3>
        </div>
        <span className="rounded-full bg-gray-200 px-3 py-1 text-xs uppercase tracking-[0.18em] text-gray-600">{users.length}</span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {sortedUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-gray-300 bg-gray-50/80 p-5 text-center text-gray-500 text-sm">
            No contacts yet. Invite friends to chat.
          </div>
        ) : (
          sortedUsers.map((item) => {
            const isActive = selectedUser?.id === item._id;
            const online = onlineSet.has(item._id);
            return (
              <button
                key={item._id}
                onClick={() => setSelectedUser({ id: item._id, name: item.name, profilePic: item.profilePic, description: item.description })}
                className={`w-full rounded-3xl border px-4 py-3 text-left transition ${isActive ? 'border-brand bg-gray-100' : 'border-gray-300 bg-white hover:bg-gray-50'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.profilePic ? (
                      <img
                        src={`${apiUrl}${item.profilePic}`}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover border border-gray-300 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-brand to-green-600 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {item.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-gray-900 truncate">{item.name}</p>
                      <p className="text-xs text-gray-500 truncate">{item.email || item.phone}</p>
                    </div>
                  </div>
                  <span className={`h-3 w-3 rounded-full flex-shrink-0 ${online ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
