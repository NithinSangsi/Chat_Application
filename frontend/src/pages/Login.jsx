import { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { MessageCircle, Mail, Phone, Eye, EyeOff, Upload } from 'lucide-react';

export default function Login() {
  const { loginUser, registerUser, requestOtp, verifyOtp, loading } = useContext(AuthContext);
  const [isRegister, setIsRegister] = useState(false);
  const [usePhone, setUsePhone] = useState(false);
  const [otpStep, setOtpStep] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [otp, setOtp] = useState('');
  const [profilePic, setProfilePic] = useState(null);
  const [profilePreview, setProfilePreview] = useState(null);
  const [simulation, setSimulation] = useState('');
  const [message, setMessage] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [description, setDescription] = useState('');

  const handleProfilePicChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setProfilePic(file);
      const reader = new FileReader();
      reader.onloadend = () => setProfilePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setMessage('');

    try {
      if (usePhone) {
        if (!otpStep) {
          if (!phone || !name) {
            setMessage('Phone and name are required.');
            return;
          }
          const result = await requestOtp({ phone, name });
          setSimulation(`Simulated OTP: ${result.otp}`);
          setMessage('OTP generated. Use the code above to verify.');
          setOtpStep(true);
          return;
        }
        if (!otp) {
          setMessage('Please enter OTP.');
          return;
        }
        await verifyOtp({ phone, otp, name, description, profilePic });
      } else if (isRegister) {
        if (!name || !email || !password) {
          setMessage('Name, email, and password are required.');
          return;
        }
        await registerUser({ name, email, password, description, profilePic });
      } else {
        if (!email || !password) {
          setMessage('Email and password are required.');
          return;
        }
        await loginUser({ email, password });
      }
    } catch (error) {
      const responseMessage = error?.response?.data?.message || error.message;
      setMessage(responseMessage);
    }
  };

  return (
    <div className="mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 py-12 sm:px-6 lg:px-8">
      <div className="w-full rounded-3xl border border-slate-800 bg-slate-900/95 p-8 shadow-2xl shadow-slate-950/20 sm:p-10">
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 inline-flex h-14 w-14 items-center justify-center rounded-full bg-green-500/10 text-green-400 shadow-lg shadow-green-500/10">
            <MessageCircle size={32} />
          </div>
          <h1 className="text-4xl font-semibold text-white">Let's Chat</h1>
          <p className="mt-2 text-slate-400">Modern real-time chat with email and phone OTP login.</p>
        </div>

        <div className="mb-8 flex items-center justify-center gap-4 text-sm text-slate-400">
          <button
            className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${usePhone ? 'bg-slate-800/50 text-slate-300' : 'bg-brand text-white'}`}
            onClick={() => {
              setUsePhone(false);
              setOtpStep(false);
            }}
          >
            <Mail size={16} /> Email Login
          </button>
          <button
            className={`flex items-center gap-2 rounded-full px-4 py-2 transition ${usePhone ? 'bg-brand text-white' : 'bg-slate-800/50 text-slate-300'}`}
            onClick={() => {
              setUsePhone(true);
              setOtpStep(false);
            }}
          >
            <Phone size={16} /> Phone OTP
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {(isRegister || (usePhone && otpStep)) && (
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-3">Upload Profile Picture (Optional)</label>
              <div className="flex items-center gap-4">
                {profilePreview ? (
                  <img src={profilePreview} alt="preview" className="h-20 w-20 rounded-full object-cover border-3 border-brand shadow-lg" />
                ) : (
                  <div className="h-20 w-20 rounded-full bg-slate-800 flex items-center justify-center border-2 border-dashed border-slate-700">
                    <Upload size={28} className="text-slate-400" />
                  </div>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleProfilePicChange}
                  className="text-sm text-slate-400 file:mr-4 file:rounded-full file:bg-brand file:px-4 file:py-2 file:text-white file:border-0 cursor-pointer"
                />
              </div>
            </div>
          )}

          {usePhone ? (
            <>
              {!otpStep ? (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Phone Number</label>
                    <input
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="e.g. +15551234567"
                      disabled={otpStep}
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Display Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      disabled={otpStep}
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand disabled:opacity-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell others about yourself..."
                      rows={3}
                      disabled={otpStep}
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand resize-none disabled:opacity-50"
                    />
                  </div>
                </>
              ) : (
                <div>
                  <label className="block text-sm font-medium text-slate-300">OTP Code</label>
                  <input
                    value={otp}
                    onChange={(e) => setOtp(e.target.value)}
                    placeholder="Enter OTP"
                    autoFocus
                    className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand"
                  />
                </div>
              )}
            </>
          ) : (
            <>
              {isRegister && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Name</label>
                    <input
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      placeholder="Your name"
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-slate-300">Description (Optional)</label>
                    <textarea
                      value={description}
                      onChange={(e) => setDescription(e.target.value)}
                      placeholder="Tell others about yourself..."
                      rows={3}
                      className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand resize-none"
                    />
                  </div>
                </>
              )}
              <div>
                <label className="block text-sm font-medium text-slate-300">Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="mt-2 w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-300">Password</label>
                <div className="relative mt-2">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Create a password"
                    className="w-full rounded-3xl border border-slate-800 bg-slate-950 px-4 py-3 text-white outline-none ring-1 ring-slate-800 transition focus:ring-brand"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </button>
                </div>
              </div>
            </>
          )}

          {message && <p className="rounded-3xl bg-red-900/50 px-4 py-3 text-sm text-red-200">{message}</p>}
          {simulation && <p className="rounded-3xl bg-green-900/50 px-4 py-3 text-sm text-green-200 font-mono">{simulation}</p>}

          <button
            type="submit"
            className="w-full rounded-3xl bg-brand px-5 py-3 text-sm font-semibold text-white transition hover:bg-green-600 disabled:opacity-50"
            disabled={loading}
          >
            {loading ? 'Processing...' : usePhone ? (otpStep ? 'Verify OTP' : 'Request OTP') : isRegister ? 'Register' : 'Login'}
          </button>
          {usePhone && otpStep && (
            <button
              type="button"
              onClick={() => setOtpStep(false)}
              className="w-full rounded-3xl bg-slate-800 px-5 py-3 text-sm font-semibold text-slate-200 transition hover:bg-slate-700"
            >
              Back
            </button>
          )}
        </form>

        {!usePhone && (
          <div className="mt-6 flex items-center justify-center gap-2 text-sm text-slate-400">
            <span>{isRegister ? 'Already have an account?' : "Don't have an account?"}</span>
            <button
              type="button"
              className="font-semibold text-white hover:text-green-400 transition"
              onClick={() => {
                setIsRegister((prev) => !prev);
                setOtpStep(false);
                setUsePhone(false);
                setMessage('');
              }}
            >
              {isRegister ? 'Sign in' : 'Create account'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
