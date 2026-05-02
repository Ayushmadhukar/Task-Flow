import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

const Signup = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ name: '', email: '', password: '', role: 'member' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (form.password.length < 6) return setError('Password must be at least 6 characters');
    setLoading(true);
    try {
      const res = await API.post('/auth/signup', form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
    } catch (err) {
      const msg = err.response?.data?.errors?.[0]?.msg || err.response?.data?.message || 'Signup failed.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-page">
      <div className="auth-bg">
        <div className="auth-orb orb-1" />
        <div className="auth-orb orb-2" />
        <div className="auth-orb orb-3" />
      </div>


      <div className="auth-container">
        
        <div className="auth-brand-panel">
          <div className="auth-brand-logo">
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <rect x="4" y="2" width="13" height="17" rx="2" fill="white" opacity="0.25" />
              <rect x="4" y="2" width="13" height="17" rx="2" stroke="white" strokeWidth="1.8" />
              <rect x="8" y="1" width="5" height="3" rx="1" fill="white" />
              <path d="M8 10l2 2 4-4" stroke="white" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
              <path d="M8 15h5" stroke="white" strokeWidth="1.8" strokeLinecap="round" />
              <circle cx="20" cy="20" r="4" fill="#22d3a0" />
              <path d="M18.5 20l1 1 2-2" stroke="white" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span>TaskFlow</span>
          </div>
          <h1 className="auth-brand-title">Start managing smarter</h1>
          <p className="auth-brand-desc">Choose your role and get instant access to powerful project and task management tools.</p>
          <div className="auth-role-preview">
            <div className="role-preview-card">
              <span className="role-preview-icon">🔑</span>
              <div>
                <strong>Admin</strong>
                <p>Create projects, assign tasks, track team progress</p>
              </div>
            </div>
            <div className="role-preview-card">
              <span className="role-preview-icon">👤</span>
              <div>
                <strong>Member</strong>
                <p>View assigned tasks and update their completion</p>
              </div>
            </div>
          </div>
        </div>

       
        <div className="auth-form-panel" style={{position:'relative'}}>
          <button className="auth-theme-btn" onClick={toggleTheme} title={theme==='dark'?'Light mode':'Dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="auth-form-header">
            <h2 className="auth-title">Create account</h2>
            <p className="auth-subtitle">Join TaskFlow and get started today</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="signup-name">Full Name</label>
              <div className="input-wrapper">
                <span className="input-icon">👤</span>
                <input id="signup-name" type="text" name="name" placeholder="John Doe" value={form.name} onChange={handleChange} required minLength={2} />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input id="signup-email" type="email" name="email" placeholder="you@example.com" value={form.email} onChange={handleChange} required />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="signup-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="signup-password"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="Min. 6 characters"
                  value={form.password}
                  onChange={handleChange}
                  required
                  minLength={6}
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
              {form.password && (
                <div className="pw-strength">
                  <div className={`pw-bar ${form.password.length >= 6 ? 'weak' : ''} ${form.password.length >= 8 ? 'medium' : ''} ${form.password.length >= 12 ? 'strong' : ''}`} />
                  <span>{form.password.length < 6 ? 'Too short' : form.password.length < 8 ? 'Weak' : form.password.length < 12 ? 'Medium' : 'Strong'}</span>
                </div>
              )}
            </div>

            <div className="form-group">
              <label>Select Role</label>
              <div className="role-picker">
                {[
                  { value: 'member', label: 'Member', icon: '👤', desc: 'Complete assigned tasks' },
                  { value: 'admin', label: 'Admin', icon: '🔑', desc: 'Manage projects & team' },
                ].map((r) => (
                  <label key={r.value} className={`role-option ${form.role === r.value ? 'selected' : ''}`}>
                    <input type="radio" name="role" value={r.value} checked={form.role === r.value} onChange={handleChange} />
                    <span className="role-icon">{r.icon}</span>
                    <div>
                      <strong>{r.label}</strong>
                      <p>{r.desc}</p>
                    </div>
                    {form.role === r.value && <span className="role-check">✓</span>}
                  </label>
                ))}
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Create Account →'}
            </button>
          </form>

          <div className="auth-divider"><span>Already have an account?</span></div>
          <Link to="/login" className="btn btn-secondary btn-full" style={{ justifyContent: 'center', textDecoration: 'none' }}>
            Sign in instead
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Signup;
