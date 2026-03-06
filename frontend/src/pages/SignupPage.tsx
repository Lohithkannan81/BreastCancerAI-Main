import React, { useState } from 'react';
import { UserRole } from '../types';

interface SignupPageProps {
  onSignup: (
    name: string,
    email: string,
    password: string,
    role: string,
    organization: string,
    department: string
  ) => Promise<{ success: boolean; error?: string }>;
  onLogin: () => void;
}

const SignupPage: React.FC<SignupPageProps> = ({ onSignup, onLogin }) => {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [formData, setFormData] = useState({
    name: '',
    role: UserRole.DOCTOR as string,
    organization: '',
    department: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: ''
  });

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (step < 3) {
      nextStep();
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const result = await onSignup(
        formData.name,
        formData.email,
        formData.password,
        formData.role,
        formData.organization,
        formData.department
      );
      if (result.success) {
        alert('Registration successful! Please login with your new credentials.');
        onLogin();
      } else {
        setError(result.error || 'Registration failed');
      }
    } catch (err) {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen cinematic-gradient flex items-center justify-center p-4 py-12 selection:bg-blue-500/30">
      <div className="max-w-2xl w-full glass-panel overflow-hidden fade-in-up" style={{ animationDuration: '0.8s' }}>
        <div className="p-10 border-b border-slate-100 text-center relative overflow-hidden bg-white/40">
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-500"></div>
          <div>
            <h2 className="text-2xl font-bold text-slate-800 tracking-tight mt-2">Credential Registration</h2>
            <p className="text-slate-500 text-sm mt-3 font-light">Step {step} of 3 — {step === 1 ? 'Personal Profile' : step === 2 ? 'Clinical Identity' : 'Security'}</p>
          </div>
          <div className="flex gap-2 justify-center mt-6">
            {[1, 2, 3].map(i => (
              <div key={i} className={`h-1.5 w-12 rounded-full transition-colors duration-500 ${i <= step ? 'bg-blue-500' : 'bg-slate-200'}`}></div>
            ))}
          </div>

          <form onSubmit={handleSubmit} className="p-10 space-y-8 bg-white/40">
            {error && (
              <div className="bg-red-50/80 backdrop-blur-md border border-red-200 text-red-700 px-4 py-3 rounded-xl text-sm fade-in">
                {error}
              </div>
            )}

            {step === 1 && (
              <div className="fade-in-up space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Full Legal Name</label>
                    <input
                      required
                      type="text"
                      value={formData.name}
                      onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                      placeholder="Dr. Sarah Richardson"
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Email Address</label>
                    <input
                      required
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      placeholder="sarah@med.edu"
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Phone Number</label>
                    <input
                      required
                      type="tel"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      placeholder="+1 (555) 000-0000"
                      className="input-premium"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 2 && (
              <div className="fade-in-up space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Professional Role</label>
                  <div className="grid grid-cols-2 gap-4">
                    {[UserRole.DOCTOR, UserRole.RESEARCHER, UserRole.STUDENT, UserRole.ADMIN].map(role => (
                      <button
                        key={role}
                        type="button"
                        onClick={() => setFormData({ ...formData, role: role as string })}
                        className={`px-6 py-4 rounded-2xl text-sm font-semibold border transition-all duration-300 ${formData.role === role ? 'bg-slate-900 text-white border-slate-900 shadow-md' : 'btn-secondary text-slate-500 hover:text-slate-800'
                          }`}
                      >
                        {role}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-6 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Organization</label>
                    <input
                      required
                      type="text"
                      value={formData.organization}
                      onChange={(e) => setFormData({ ...formData, organization: e.target.value })}
                      placeholder="Mayo Clinic / Johns Hopkins"
                      className="input-premium"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Department</label>
                    <input
                      required
                      type="text"
                      value={formData.department}
                      onChange={(e) => setFormData({ ...formData, department: e.target.value })}
                      placeholder="Oncology / Pathology"
                      className="input-premium"
                    />
                  </div>
                </div>
              </div>
            )}

            {step === 3 && (
              <div className="fade-in-up space-y-6">
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Choose Secure Password</label>
                  <input
                    required
                    type="password"
                    value={formData.password}
                    onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                    placeholder="••••••••"
                    className="input-premium"
                  />
                  <p className="text-[10px] text-slate-400 mt-2 font-medium pl-1">Must include 6+ characters.</p>
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-slate-500 uppercase tracking-widest mb-2 pl-1">Confirm Password</label>
                  <input
                    required
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="••••••••"
                    className="input-premium"
                  />
                </div>
              </div>
            )}

            <div className="flex justify-between gap-3 pt-6">
              {step > 1 ? (
                <button
                  type="button"
                  onClick={prevStep}
                  className="btn-secondary flex-[0.7]"
                >
                  Previous
                </button>
              ) : (
                <button
                  type="button"
                  onClick={onLogin}
                  className="btn-secondary flex-[0.7]"
                >
                  Cancel
                </button>
              )}

              <button
                type="submit"
                disabled={isLoading}
                className="btn-primary flex-1"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  step < 3 ? 'Continue' : 'Complete Registration'
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default SignupPage;
