import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import useAuthStore from '../store/useAuthStore';
import toast from 'react-hot-toast';
import { authService } from '../services';

export default function Register() {
  const [role, setRole] = useState('consumer');
  const [step, setStep] = useState('email'); // 'email', 'otp', 'details'
  const [emailInput, setEmailInput] = useState('');
  const [otpCode, setOtpCode] = useState('');
  const [otpLoading, setOtpLoading] = useState(false);
  const [timer, setTimer] = useState(0);
  const [timerIntervalId, setTimerIntervalId] = useState(null);

  const { register: registerUser, loading } = useAuthStore();
  const navigate = useNavigate();
  const { register, handleSubmit, formState: { errors } } = useForm();

  // Clear timer interval on unmount
  useEffect(() => {
    return () => {
      if (timerIntervalId) clearInterval(timerIntervalId);
    };
  }, [timerIntervalId]);

  const startTimer = () => {
    setTimer(60);
    if (timerIntervalId) clearInterval(timerIntervalId);
    const interval = setInterval(() => {
      setTimer((prev) => {
        if (prev <= 1) {
          clearInterval(interval);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    setTimerIntervalId(interval);
  };

  const handleSendOtp = async (e) => {
    if (e) e.preventDefault();
    if (!emailInput) {
      toast.error('Please enter a valid email address');
      return;
    }
    const emailRegex = /^\S+@\S+$/i;
    if (!emailRegex.test(emailInput)) {
      toast.error('Invalid email format');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await authService.sendOtp(emailInput);
      toast.success(res.data.message || 'Verification code sent successfully!');
      setStep('otp');
      startTimer();
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to send verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    if (!otpCode || otpCode.length !== 6) {
      toast.error('Please enter the 6-digit verification code');
      return;
    }

    setOtpLoading(true);
    try {
      const res = await authService.verifyOtp(emailInput, otpCode);
      toast.success(res.data.message || 'Email verified successfully!');
      setStep('details');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Invalid or expired verification code.');
    } finally {
      setOtpLoading(false);
    }
  };

  const onSubmit = async (data) => {
    try {
      // Force verified email and chosen role
      data.email = emailInput;
      data.role = role;
      
      const res = await registerUser(data);
      toast.success(res.message || 'Registration successful!');
      if (role === 'store') {
        toast('Your business account is pending admin approval.', { icon: 'ℹ️' });
      }
      navigate('/');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    }
  };

  const inputClass = "w-full px-4 py-2.5 rounded-xl border border-slate-200 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400 transition-all duration-200";

  return (
    <div className="w-full max-w-lg mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8">
      {/* Role Toggle (Disabled after email verification starts) */}
      {step === 'email' && (
        <div className="flex bg-slate-100 rounded-xl p-1 mb-6">
          {[['consumer', 'Consumer'], ['store', 'Medical Store']].map(([id, label]) => (
            <button
              key={id}
              onClick={() => setRole(id)}
              className={`flex-1 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                role === id ? 'bg-white text-primary-700 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      )}

      {/* Dynamic Headers */}
      {step === 'email' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Create Account</h2>
          <p className="text-sm text-slate-500">
            {role === 'store' ? 'Register your medical store business' : 'Sign up as a retail consumer'}
          </p>
        </div>
      )}

      {step === 'otp' && (
        <div className="mb-6">
          <h2 className="text-2xl font-bold text-slate-800 mb-1">Verify Email</h2>
          <p className="text-sm text-slate-500">
            Enter the 6-digit confirmation code we sent to your inbox.
          </p>
        </div>
      )}

      {step === 'details' && (
        <div className="mb-6 bg-emerald-50 border border-emerald-200 rounded-xl p-4 flex gap-3 items-center">
          <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">✓</div>
          <div>
            <h3 className="text-sm font-bold text-emerald-800">Email Verified</h3>
            <p className="text-xs text-emerald-600">Please complete the remaining registration fields below.</p>
          </div>
        </div>
      )}

      {/* Step 1: Send OTP */}
      {step === 'email' && (
        <form onSubmit={handleSendOtp} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <input
              type="email"
              value={emailInput}
              onChange={(e) => setEmailInput(e.target.value)}
              className={inputClass}
              placeholder="yourname@domain.com"
              required
            />
          </div>

          <button
            type="submit"
            disabled={otpLoading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-60 shadow-md flex justify-center items-center gap-2 transform active:scale-[0.98]"
          >
            {otpLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Sending Code...</span>
              </>
            ) : 'Send Verification Code'}
          </button>
        </form>
      )}

      {/* Step 2: Verification Code */}
      {step === 'otp' && (
        <form onSubmit={handleVerifyOtp} className="space-y-5">
          <div className="text-center bg-slate-50 border border-slate-100 rounded-xl p-3">
            <p className="text-sm text-slate-600">Verification code sent to:</p>
            <p className="text-sm font-bold text-slate-800">{emailInput}</p>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2 text-center">6-Digit Verification Code</label>
            <input
              type="text"
              value={otpCode}
              onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              className="w-full px-4 py-3.5 rounded-xl border border-slate-200 text-2xl font-bold font-mono tracking-[10px] text-center focus:outline-none focus:ring-2 focus:ring-primary-500/20 focus:border-primary-400"
              placeholder="000000"
              maxLength={6}
              required
            />
          </div>

          <button
            type="submit"
            disabled={otpLoading}
            className="w-full py-3 bg-emerald-600 text-white font-semibold rounded-xl hover:bg-emerald-700 transition-all disabled:opacity-60 shadow-md flex justify-center items-center gap-2 transform active:scale-[0.98]"
          >
            {otpLoading ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                </svg>
                <span>Verifying...</span>
              </>
            ) : 'Verify Code & Proceed'}
          </button>

          <div className="flex justify-between items-center text-sm text-slate-500 pt-2 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setStep('email')}
              className="hover:underline text-primary-600 font-medium"
            >
              Change Email
            </button>

            {timer > 0 ? (
              <span className="text-slate-400">Resend in <span className="font-semibold text-slate-600">{timer}s</span></span>
            ) : (
              <button
                type="button"
                onClick={handleSendOtp}
                className="hover:underline text-primary-600 font-medium"
              >
                Resend Code
              </button>
            )}
          </div>
        </form>
      )}

      {/* Step 3: Registration Form (revealed once email is verified) */}
      {step === 'details' && (
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 max-h-[55vh] overflow-y-auto pr-1">
          {/* Read-Only verified Email */}
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Email Address</label>
            <div className="w-full px-4 py-2.5 rounded-xl border border-emerald-200 bg-emerald-50 text-sm text-emerald-800 font-medium flex justify-between items-center">
              <span>{emailInput}</span>
              <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded-full font-semibold">Verified ✓</span>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Full Name</label>
              <input {...register('name', { required: 'Required' })} className={inputClass} placeholder="Full name" />
              {errors.name && <p className="text-xs text-rose-500 mt-1">{errors.name.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Phone</label>
              <input {...register('phone', { required: 'Required' })} className={inputClass} placeholder="Phone number" />
              {errors.phone && <p className="text-xs text-rose-500 mt-1">{errors.phone.message}</p>}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Password</label>
              <input {...register('password', { required: 'Required', minLength: { value: 8, message: 'Min 8 characters' } })} type="password" className={inputClass} placeholder="••••••••" />
              {errors.password && <p className="text-xs text-rose-500 mt-1">{errors.password.message}</p>}
            </div>
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Confirm Password</label>
              <input {...register('password_confirmation', { required: 'Required' })} type="password" className={inputClass} placeholder="••••••••" />
            </div>
          </div>

          {/* Store-specific fields */}
          {role === 'store' && (
            <>
              <hr className="border-slate-200 my-4" />
              <p className="text-sm font-semibold text-slate-700">Business Details</p>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Name</label>
                <input {...register('business_name', { required: 'Required' })} className={inputClass} placeholder="Your Medical Store name" />
                {errors.business_name && <p className="text-xs text-rose-500 mt-1">{errors.business_name.message}</p>}
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">GST Number</label>
                  <input
                    {...register('gst_number', {
                      required: 'Required',
                      pattern: {
                        value: /^[0-9]{2}[A-Z]{5}[0-9]{4}[A-Z]{1}[1-9A-Z]{1}Z[0-9A-Z]{1}$/,
                        message: 'Invalid GST format (e.g. 27AAPFU0939F1ZV)',
                      },
                      setValueAs: (v) => v.toUpperCase(),
                    })}
                    className={inputClass}
                    placeholder="e.g. 27AAPFU0939F1ZV"
                    maxLength={15}
                    style={{ textTransform: 'uppercase' }}
                  />
                  {errors.gst_number && <p className="text-xs text-rose-500 mt-1">{errors.gst_number.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Drug License No.</label>
                  <input
                    {...register('drug_license_number', {
                      required: 'Required',
                      minLength: { value: 5, message: 'Must be at least 5 characters' },
                      pattern: {
                        value: /^[A-Za-z0-9][A-Za-z0-9\/\-]{4,49}$/,
                        message: 'Only letters, numbers, "-" and "/" allowed (min 5 chars)',
                      },
                    })}
                    className={inputClass}
                    placeholder="e.g. MH-MUM-123456 or 20B/123/2022"
                    maxLength={50}
                  />
                  {errors.drug_license_number && <p className="text-xs text-rose-500 mt-1">{errors.drug_license_number.message}</p>}
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Business Address</label>
                <input {...register('business_address', { required: 'Required' })} className={inputClass} placeholder="Street address" />
                {errors.business_address && <p className="text-xs text-rose-500 mt-1">{errors.business_address.message}</p>}
              </div>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">City</label>
                  <input {...register('business_city', { required: 'Required' })} className={inputClass} placeholder="City" />
                  {errors.business_city && <p className="text-xs text-rose-500 mt-1">{errors.business_city.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">State</label>
                  <input {...register('business_state', { required: 'Required' })} className={inputClass} placeholder="State" />
                  {errors.business_state && <p className="text-xs text-rose-500 mt-1">{errors.business_state.message}</p>}
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Pincode</label>
                  <input {...register('business_pincode', { required: 'Required' })} className={inputClass} placeholder="Pincode" />
                  {errors.business_pincode && <p className="text-xs text-rose-500 mt-1">{errors.business_pincode.message}</p>}
                </div>
              </div>
            </>
          )}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-3 bg-primary-600 text-white font-semibold rounded-xl hover:bg-primary-700 transition-all disabled:opacity-60 shadow-md transform active:scale-[0.98] mt-4"
          >
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
        </form>
      )}

      {/* Existing sign-in link (Only visible on initial email step) */}
      {step === 'email' && (
        <p className="text-center text-sm text-slate-500 mt-6">
          Already have an account? <Link to="/login" className="text-primary-600 font-medium hover:underline">Sign In</Link>
        </p>
      )}
    </div>
  );
}
