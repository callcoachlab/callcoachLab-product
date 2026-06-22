import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useAuthStore } from '../store/authStore';
import { useToast } from '../hooks/useToast';
import authImage from '../assets/auth.png';

export function SignupPage() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    confirmPassword: '',
  });
  const [errors, setErrors] = useState({});
  const [registeredEmail, setRegisteredEmail] = useState('');
  
  const { register, isLoading } = useAuthStore();
  const toast = useToast();

  const validate = () => {
    const newErrors = {};
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 8) {
      newErrors.password = 'Password must be at least 8 characters';
    }
    
    if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: '' }));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validate()) return;

    try {
      await register(formData.email, formData.password);
      setRegisteredEmail(formData.email);
      toast.success('Check your email for the verification link.');
    } catch (error) {
      toast.error(error.response?.data?.error?.message || 'Registration failed');
    }
  };

  if (registeredEmail) {
    return (
      <div className="h-screen flex items-center justify-center bg-white px-8">
        <div className="w-full max-w-md rounded-lg border border-gray-200 p-8 shadow-sm">
          <h1 className="text-3xl font-bold mb-3">Verify your email</h1>
          <p className="text-gray-600">
            We sent a verification link to <span className="font-medium text-gray-900">{registeredEmail}</span>.
            Open it to continue workspace setup.
          </p>
          <Link to="/login" className="mt-6 inline-block text-blue-600 hover:underline font-medium">
            Back to login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="h-screen flex overflow-hidden">
      {/* Left Side - Form */}
      <div className="flex-1 flex items-center justify-center px-8 py-6 bg-white overflow-y-auto">
        <div className="w-full max-w-md py-4">
          <div className="mb-4">
            <h1 className="text-3xl font-bold mb-3">
              Call Coach <span className="text-green-600">Lab</span>
            </h1>
            <h2 className="text-xl font-semibold text-gray-900 mb-1">
              Create Your Account
            </h2>
            <p className="text-gray-600 text-sm">Start managing your calls today.</p>
          </div>

          <div className="space-y-3">
            {/* Google Sign Up Button */}
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
              <span className="text-gray-700 font-medium">Sign up with Google</span>
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
            <form onSubmit={handleSubmit} className="space-y-2.5">
              <div>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
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
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  placeholder="Password (min 8 characters)"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  required
                />
                {errors.password && (
                  <p className="mt-1 text-xs text-red-600">{errors.password}</p>
                )}
              </div>

              <div>
                <input
                  type="password"
                  name="confirmPassword"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  placeholder="Confirm Password"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all text-sm"
                  required
                />
                {errors.confirmPassword && (
                  <p className="mt-1 text-xs text-red-600">{errors.confirmPassword}</p>
                )}
              </div>

              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-2.5 px-4 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
              >
                {isLoading ? 'Creating Account...' : 'Create Account'}
              </button>
            </form>

            {/* Footer Text */}
            <div className="text-center">
              <p className="text-xs text-gray-500">
                By signing up, you agree to the{' '}
                <a href="#" className="text-gray-700 hover:underline">Privacy Policy</a>
                {' '}and{' '}
                <a href="#" className="text-gray-700 hover:underline">Terms of Service</a>
              </p>
              <p className="mt-2 text-sm text-gray-600">
                Already have an account?{' '}
                <Link to="/login" className="text-blue-600 hover:underline font-medium">
                  Log in
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
