import { useContext, useEffect, useMemo, useRef, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import socket from '../socket';
import MessageBubble from '../components/MessageBubble';
import UserSidebar from '../components/UserSidebar';
import {
  Send,
  Phone,
  Video,
  MoreVertical,
  Paperclip,
  Smile,
  Plus,
  X,
  LogOut
} from 'lucide-react';

export default function Chat() {
  const { user, logout, api } = useContext(AuthContext);
  const [users, setUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [messages, setMessages] = useState([]);
  const [onlineUsers, setOnlineUsers] = useState([]);
  const [newMessage, setNewMessage] = useState('');
  const [selectedFile, setSelectedFile] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [sendLoading, setSendLoading] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [showMessageMenu, setShowMessageMenu] = useState(null);

  const scrollRef = useRef(null);
  const fileInputRef = useRef(null);

  const emojis = ['😀', '😂', '❤️', '👍', '🔥', '😍', '🎉', '🚀', '💯', '🙏'];

  useEffect(() => {
    socket.emit('user-online', user.id);
    socket.on('online-users', setOnlineUsers);
    socket.on('receive-message', (message) => {
      const senderId = message.sender?._id || message.sender;
      const receiverId = message.receiver?._id || message.receiver;
      // Only add messages from others, own messages are added locally
      if (senderId !== user.id && (senderId === selectedUser?.id || receiverId === selectedUser?.id)) {
        setMessages((prev) => [...prev, message]);
      }
    });
    return () => {
      socket.off('online-users');
      socket.off('receive-message');
    };
  }, [selectedUser, user.id]);

  useEffect(() => {
    if (!selectedUser) return;

    const fetchMessages = async () => {
      setLoading(true);
      try {
        const response = await api.get(`/api/messages/${selectedUser.id}`);
        setMessages(response.data);
      } catch (error) {
        console.error('Failed to load messages', error);
      } finally {
        setLoading(false);
      }
    };
    fetchMessages();
  }, [api, selectedUser]);

  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const response = await api.get('/api/auth/users');
        // Sort by last message timestamp (recently chatted first)
        const userList = response.data;
        setUsers(userList);
        // Auto-select first contact
        if (userList.length > 0 && !selectedUser) {
          setSelectedUser({
            id: userList[0]._id,
            name: userList[0].name,
            profilePic: userList[0].profilePic,
            description: userList[0].description
          });
        }
      } catch (error) {
        console.error('Failed to fetch users', error);
      }
    };
    fetchUsers();
  }, [api, selectedUser]);

  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const currentOnlineSet = useMemo(() => new Set(onlineUsers), [onlineUsers]);

  const handleFileSelect = (e) => {
    const file = e.target.files[0];
    if (file && file.size <= 100 * 1024 * 1024) {
      setSelectedFile(file);
    } else {
      alert('File size must be less than 100MB');
    }
  };

  const sendMessage = async () => {
    if (!selectedUser) {
      alert('Please select a contact first.');
      return;
    }
    if (!newMessage.trim() && !selectedFile) {
      alert('Please type a message or select a file.');
      return;
    }

    const messageToSend = newMessage.trim();
    const fileToSend = selectedFile;

    // Clear input immediately for better UX
    setNewMessage('');
    setSelectedFile(null);
    setSendLoading(true);

    const formData = new FormData();
    formData.append('receiverId', selectedUser.id);
    if (messageToSend) formData.append('text', messageToSend);
    if (fileToSend) formData.append('file', fileToSend);

    try {
      const response = await api.post('/api/messages', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      const messageData = response.data;
      setMessages((prev) => [...prev, messageData]);
      socket.emit('send-message', {
        ...messageData,
        sender: { _id: user.id, name: user.name, profilePic: user.profilePic },
        receiverId: selectedUser.id
      });
      socket.emit('user-online', user.id);
    } catch (error) {
      console.error('Send message failed', error);
      // Restore the message if sending failed
      setNewMessage(messageToSend);
      setSelectedFile(fileToSend);
    } finally {
      setSendLoading(false);
    }
  };

  const clearChat = async () => {
    if (!selectedUser) return;
    if (!window.confirm('Are you sure you want to clear this chat? This action cannot be undone.')) return;

    try {
      await api.delete(`/api/messages/clear/${selectedUser.id}`);
      setMessages([]);
      setShowMenu(false);
    } catch (error) {
      console.error('Clear chat failed', error);
      alert('Failed to clear chat.');
    }
  };

  const handleLogout = () => {
    logout();
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-7xl flex-col bg-slate-950 px-4 py-6 sm:px-6 lg:px-8">
      <header className="mb-6 flex flex-col gap-4 rounded-3xl border border-slate-800 bg-gradient-to-r from-slate-900/80 to-slate-800/80 p-5 shadow-xl shadow-slate-950/20 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-3xl font-semibold text-white">Hello, {user.name}</h2>
          {user.description && <p className="mt-1 text-sm text-slate-300">{user.description}</p>}
          <p className="mt-1 text-slate-400">Select a contact to start chatting</p>
        </div>
        <div className="flex items-center gap-3">
                  <div className="flex flex-col gap-1">
            <span className="rounded-full bg-green-500/15 px-3 py-2 text-sm text-green-300 flex items-center gap-2">
              <span className="h-2 w-2 bg-green-400 rounded-full animate-pulse"></span>
              Online: {onlineUsers.length}
            </span>
            {selectedUser && (
              <span className="text-xs text-slate-400">Chatting with: <span className="text-white font-semibold">{selectedUser.name}</span></span>
            )}
          </div>
          <button
            onClick={handleLogout}
            className="rounded-3xl bg-slate-800 hover:bg-red-600/30 px-4 py-2 text-sm font-semibold text-white transition flex items-center gap-2"
          >
            <LogOut size={16} /> Logout
          </button>
        </div>
      </header>

      <div className="grid flex-1 gap-6 lg:grid-cols-[320px_1fr]">
        <UserSidebar
          users={users}
          selectedUser={selectedUser}
          setSelectedUser={setSelectedUser}
          onlineSet={currentOnlineSet}
        />

        <main className="rounded-3xl border border-slate-800 bg-slate-900/80 shadow-xl shadow-slate-950/10 overflow-hidden flex flex-col">
          {selectedUser ? (
            <>
              <div className="flex items-center justify-between border-b border-slate-800 bg-slate-950/60 p-5">
                <div className="flex items-center gap-4">
                  {selectedUser.profilePic && (
                    <img
                      src={`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}${selectedUser.profilePic}`}
                      alt={selectedUser.name}
                      className="h-12 w-12 rounded-full object-cover border-2 border-slate-700"
                    />
                  )}
                  <div>
                    <h3 className="text-xl font-semibold text-white">{selectedUser.name}</h3>
                    <p className="text-xs text-slate-400">{currentOnlineSet.has(selectedUser.id) ? '🟢 Online' : '⚫ Offline'}</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 relative">
                  <button className="p-2 rounded-full hover:bg-slate-800 transition" title="Phone call">
                    <Phone size={20} className="text-slate-400" />
                  </button>
                  <button className="p-2 rounded-full hover:bg-slate-800 transition" title="Video call">
                    <Video size={20} className="text-slate-400" />
                  </button>
                  <div className="relative">
                    <button
                      onClick={() => setShowMenu(!showMenu)}
                      className="p-2 rounded-full hover:bg-slate-800 transition"
                    >
                      <MoreVertical size={20} className="text-slate-400" />
                    </button>
                    {showMenu && (
                      <div className="absolute right-0 top-full mt-2 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50">
                        <button
                          onClick={clearChat}
                          className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 rounded-xl text-slate-300"
                        >
                          Clear Chat
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4" style={{ maxHeight: 'calc(100vh - 450px)', scrollBehavior: 'smooth' }}>
                {loading ? (
                  <p className="text-slate-400 text-center">Loading conversation...</p>
                ) : messages.length ? (
                  messages.map((message) => (
                    <div key={message._id} className="relative group">
                      <MessageBubble message={message} selfId={user.id} />
                      {(message.sender?._id === user.id || message.sender === user.id) && (
                        <div className="absolute right-0 top-0 opacity-0 group-hover:opacity-100 transition">
                          <button
                            onClick={() => setShowMessageMenu(showMessageMenu === message._id ? null : message._id)}
                            className="ml-2 p-2 rounded-full bg-slate-800 hover:bg-slate-700 text-slate-400"
                          >
                            <MoreVertical size={14} />
                          </button>
                          {showMessageMenu === message._id && (
                            <div className="absolute right-0 mt-1 rounded-xl bg-slate-900 border border-slate-700 shadow-xl z-50 min-w-max">
                              <button
                                onClick={() => {
                                  navigator.clipboard.writeText(message.text || 'File: ' + message.fileName);
                                  setShowMessageMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 rounded-t-xl text-slate-300"
                              >
                                Copy
                              </button>
                              <button
                                onClick={() => {
                                  setMessages((prev) => prev.filter((m) => m._id !== message._id));
                                  setShowMessageMenu(null);
                                }}
                                className="w-full px-4 py-2 text-left text-sm hover:bg-slate-800 rounded-b-xl text-red-400"
                              >
                                Delete for me
                              </button>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <p className="text-slate-400 text-center">No messages yet. Say hello!</p>
                )}
                <div ref={scrollRef} />
              </div>

              <div className="border-t border-slate-800 bg-slate-950/50 p-4 space-y-3">
                {selectedFile && (
                  <div className="flex items-center justify-between rounded-xl bg-slate-800 px-3 py-2 border border-slate-700">
                    <span className="text-sm text-slate-300 truncate">{selectedFile.name}</span>
                    <button
                      onClick={() => setSelectedFile(null)}
                      className="p-1 hover:bg-slate-700 rounded transition"
                    >
                      <X size={16} className="text-slate-400" />
                    </button>
                  </div>
                )}

                <div className="flex gap-3 items-end">
                  <input
                    ref={fileInputRef}
                    type="file"
                    onChange={handleFileSelect}
                    className="hidden"
                    accept="image/*,video/*,.pdf,.doc,.docx,.xls,.xlsx,.txt,.zip,.rar"
                  />

                  <button
                    onClick={() => fileInputRef.current?.click()}
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition"
                    title="Attach file"
                  >
                    <Paperclip size={20} className="text-slate-400" />
                  </button>

                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition"
                  >
                    <Smile size={20} className="text-amber-500" />
                  </button>

                  <input
                    value={newMessage}
                    onChange={(e) => setNewMessage(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                    placeholder="Type a message..."
                    className="flex-1 rounded-3xl border border-slate-700 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-700 focus:ring-slate-600 transition placeholder-slate-400"
                  />

                  <button
                    onClick={sendMessage}
                    disabled={sendLoading}
                    className="p-3 rounded-full bg-slate-800 hover:bg-slate-700 transition flex items-center justify-center disabled:opacity-50 active:scale-95 transform duration-150"
                    title="Send"
                  >
                    <Send size={20} className="text-white" />
                  </button>
                </div>

                {showEmojiPicker && (
                  <div className="rounded-xl bg-slate-800 border border-slate-700 p-3 flex flex-wrap gap-2">
                    {emojis.map((emoji) => (
                      <button
                        key={emoji}
                        onClick={() => {
                          setNewMessage(newMessage + emoji);
                          setShowEmojiPicker(false);
                        }}
                        className="text-xl hover:bg-slate-700 p-2 rounded transition"
                      >
                        {emoji}
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </>
          ) : (
            <div className="flex h-full items-center justify-center rounded-3xl border border-dashed border-slate-700 bg-slate-900/60 p-8 text-center text-slate-400">
              <div>
                <Plus size={48} className="mx-auto mb-4 text-slate-500" />
                Select a contact to start chatting
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
