import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import API from '../api/axios';

const Login = () => {
  const { login } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate = useNavigate();
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const res = await API.post('/auth/login', form);
      login(res.data.token, res.data.user);
      navigate(res.data.user.role === 'admin' ? '/admin/dashboard' : '/member/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
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
          <h1 className="auth-brand-title">Manage tasks with clarity</h1>
          <p className="auth-brand-desc">Assign projects, track progress, and keep your team aligned — all in one place.</p>
          <div className="auth-features">
            {['Role-based access control', 'Real-time progress tracking', 'Project & task management'].map((f) => (
              <div key={f} className="auth-feature-item">
                <span className="auth-feature-check">✓</span>
                <span>{f}</span>
              </div>
            ))}
          </div>
        </div>

       
        <div className="auth-form-panel" style={{position:'relative'}}>
          <button className="auth-theme-btn" onClick={toggleTheme} title={theme==='dark'?'Light mode':'Dark mode'}>
            {theme === 'dark' ? '☀️' : '🌙'}
          </button>
          <div className="auth-form-header">
            <h2 className="auth-title">Welcome back</h2>
            <p className="auth-subtitle">Sign in to your TaskFlow account</p>
          </div>

          {error && (
            <div className="alert alert-error">
              <span>⚠</span> {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="auth-form">
            <div className="form-group">
              <label htmlFor="login-email">Email address</label>
              <div className="input-wrapper">
                <span className="input-icon">✉</span>
                <input
                  id="login-email"
                  type="email"
                  name="email"
                  placeholder="you@example.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                  autoComplete="email"
                />
              </div>
            </div>

            <div className="form-group">
              <label htmlFor="login-password">Password</label>
              <div className="input-wrapper">
                <span className="input-icon">🔒</span>
                <input
                  id="login-password"
                  type={showPw ? 'text' : 'password'}
                  name="password"
                  placeholder="Enter your password"
                  value={form.password}
                  onChange={handleChange}
                  required
                  autoComplete="current-password"
                />
                <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                  {showPw ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            <button type="submit" className="btn btn-primary btn-full" disabled={loading}>
              {loading ? <span className="btn-spinner" /> : 'Sign In →'}
            </button>
          </form>

          <div className="auth-divider"><span>New to TaskFlow?</span></div>
          <p className="auth-footer">
            <Link to="/signup" className="btn btn-secondary btn-full" style={{ justifyContent: 'center', textDecoration: 'none' }}>
              Create an account
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Login;
