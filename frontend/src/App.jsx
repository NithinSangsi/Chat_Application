import { useContext } from 'react';
import { AuthProvider, AuthContext } from './context/AuthContext';
import Login from './pages/Login';
import Chat from './pages/Chat';

function AppContent() {
  const { user } = useContext(AuthContext);
  return user ? <Chat /> : <Login />;
}

export default function App() {
  return (
    <AuthProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900">
        <AppContent />
      </div>
    </AuthProvider>
  );
}
