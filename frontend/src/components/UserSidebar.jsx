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
    <aside className="rounded-3xl border border-slate-700 bg-slate-900/80 p-4 shadow-xl shadow-slate-950/20 flex flex-col">
      <div className="mb-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MessageCircle size={20} className="text-slate-400" />
          <h3 className="text-lg font-semibold text-white">Contacts</h3>
        </div>
        <span className="rounded-full bg-slate-800 px-3 py-1 text-xs uppercase tracking-[0.18em] text-slate-400">{users.length}</span>
      </div>
      <div className="space-y-3 flex-1 overflow-y-auto">
        {sortedUsers.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-slate-700 bg-slate-950/60 p-5 text-center text-slate-400 text-sm">
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
                className={`w-full rounded-3xl border px-4 py-3 text-left transition ${isActive ? 'border-slate-600 bg-slate-800' : 'border-slate-700 bg-slate-950 hover:bg-slate-900'}`}
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 flex-1 min-w-0">
                    {item.profilePic ? (
                      <img
                        src={`${apiUrl}${item.profilePic}`}
                        alt={item.name}
                        className="h-10 w-10 rounded-full object-cover border border-slate-700 flex-shrink-0"
                      />
                    ) : (
                      <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-600 to-slate-700 flex items-center justify-center text-white text-sm font-semibold flex-shrink-0">
                        {item.name[0]?.toUpperCase()}
                      </div>
                    )}
                    <div className="min-w-0 flex-1">
                      <p className="text-sm font-semibold text-white truncate">{item.name}</p>
                      <p className="text-xs text-slate-400 truncate">{item.email || item.phone}</p>
                    </div>
                  </div>
                  <span className={`h-3 w-3 rounded-full flex-shrink-0 ${online ? 'bg-emerald-500 animate-pulse' : 'bg-slate-600'}`} />
                </div>
              </button>
            );
          })
        )}
      </div>
    </aside>
  );
}
