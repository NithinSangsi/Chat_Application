import { Download, FileIcon, Trash2 } from 'lucide-react';

export default function MessageBubble({ message, selfId }) {
  const senderId = message.sender?._id || message.sender || '';
  const senderName = message.sender?.name || (typeof message.sender === 'string' ? message.sender : 'Unknown');
  const isSender = senderId === selfId;
  const isImage = message.file && /\.(jpg|jpeg|png|gif|webp|bmp|tiff|svg)$/i.test(message.fileName || '');
  const isVideo = message.file && /\.(mp4|mov|avi|mkv|webm|flv)$/i.test(message.fileName || '');
  const apiUrl = import.meta.env.VITE_API_URL || 'http://localhost:5000';

  return (
    <div className={`flex ${isSender ? 'justify-end' : 'justify-start'}`}>
      <div className={`max-w-[78%] rounded-3xl px-4 py-3 text-sm shadow-lg shadow-gray-200/20 ${isSender ? 'bg-brand text-white' : 'bg-gray-100 text-gray-900'}`}>
        <div className="mb-2 text-xs uppercase tracking-[0.12em] text-gray-500">
          {isSender ? 'You' : senderName}
        </div>

        {message.text && (
          <p className="whitespace-pre-wrap break-words mb-2">{message.text}</p>
        )}

        {message.file && (
          <>
            {isImage ? (
              <img
                src={`${apiUrl}${message.file}`}
                alt="shared"
                className="rounded-2xl max-w-xs max-h-64 object-cover mb-2"
              />
            ) : isVideo ? (
              <video
                src={`${apiUrl}${message.file}`}
                controls
                className="rounded-2xl max-w-xs max-h-64 object-cover mb-2 bg-gray-100"
              />
            ) : (
              <a
                href={`${apiUrl}${message.file}`}
                download={message.fileName}
                className="flex items-center gap-2 rounded-xl bg-gray-200/50 px-3 py-2 mb-2 hover:bg-gray-200 transition"
              >
                <FileIcon size={16} />
                <span className="truncate text-sm">{message.fileName}</span>
                <Download size={14} className="ml-auto" />
              </a>
            )}
          </>
        )}

        <div className="flex justify-end text-[11px] text-gray-500">
          {new Date(message.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
        </div>
      </div>
    </div>
  );
}
