import { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { Button } from '../components/Button';
import { Input } from '../components/Input';
import { useToast } from '../components/Toast';
import authImage from '../assets/auth.png';

export function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [errors, setErrors] = useState({});
  
  const { login, isLoading } = useAuthStore();
  const navigate = useNavigate();
  const toast = useToast();

  const validate = () => {
    const newErrors = {};
    
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!password) {
      newErrors.password = 'Password is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      const result = await login(email, password);
      if (!result.workspace) {
        toast.success('Email verified. Finish workspace setup.');
        navigate('/setup');
        return;
      }
      toast.success('Login successful!');
      navigate('/dashboard');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-8 bg-white">
        <div className="w-full max-w-md">
          <div className="mb-6">
            <h1 className="text-3xl font-bold mb-4">
              Call Coach <span className="text-green-600">Lab</span>
            </h1>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Welcome to Framer
            </h2>
            <p className="text-gray-600 text-sm">Start call audit now.</p>
          </div>

          <div className="space-y-4">
            {/* Google Sign In Button */}
            <button
              type="button"
              className="w-full flex items-center justify-center gap-3 px-4 py-2.5 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M19.8055 10.2292C19.8055 9.55133 19.7501 8.86671 19.6323 8.19556H10.2002V12.0488H15.6014C15.3773 13.2911 14.6571 14.3898 13.6025 15.0877V17.5866H16.8253C18.7172 15.8449 19.8055 13.2728 19.8055 10.2292Z" fill="#4285F4"/>
                <path d="M10.2002 20.0006C12.9516 20.0006 15.2727 19.1151 16.8294 17.5865L13.6066 15.0876C12.7029 15.6979 11.5493 16.0432 10.2043 16.0432C7.54293 16.0432 5.28696 14.2832 4.48796 11.9099H1.16309V14.4821C2.75653 17.6569 6.31179 20.0006 10.2002 20.0006Z" fill="#34A853"/>
                <path d="M4.48399 11.9098C4.04453 10.6675 4.04453 9.33634 4.48399 8.09402V5.52185H1.16307C-0.387356 8.60188 -0.387356 12.4019 1.16307 15.4819L4.48399 11.9098Z" fill="#FBBC04"/>
                <path d="M10.2002 3.95805C11.6241 3.936 13.0011 4.47253 14.036 5.45722L16.8932 2.60218C15.1855 0.990994 12.9309 0.105194 10.2002 0.130662C6.31179 0.130662 2.75653 2.47432 1.16309 5.65301L4.48401 8.22518C5.27895 5.84784 7.53897 3.95805 10.2002 3.95805Z" fill="#EA4335"/>
              </svg>
              <span className="text-gray-700 font-medium">Sign in with Google</span>
            </button>

            {/* Divider */}
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-4 bg-white text-gray-500">OR</span>
              </div>
            </div>

            {/* Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Work Email Address"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  required
                />
                {errors.email && (
                  <p className="mt-1 text-xs text-red-600">{errors.email}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Signing in...' : 'Continue'}
              </button>
            </form>

            {/* Footer Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                Signing in means you agree to the{' '}
                <a href="#" className="text-gray-700 hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="#" className="text-gray-700 hover:underline">Terms of Service</a>
              </p>
              <p className="mt-3 text-sm text-gray-600">
                New here?{' '}
                <Link to="/signup" className="text-blue-600 hover:underline font-medium">
                  Sign up
                </Link>
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Right Side - Image */}
      <div className="hidden lg:flex flex-1 bg-gradient-to-br from-green-700 to-green-900 relative overflow-hidden">
        <div className="absolute inset-0 bg-black opacity-20" style={{ clipPath: 'polygon(0 0, 15% 0, 0 100%)' }}></div>
        <img 
          src={authImage} 
          alt="Dashboard Preview" 
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
