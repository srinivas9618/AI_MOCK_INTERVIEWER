import { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { register, emailLogin } from '../../services/authService.js';
import { BsCameraVideo } from 'react-icons/bs';
import toast from 'react-hot-toast';
import './index.css';

function LoginPage() {
  const [isSignUp, setIsSignUp] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let result;
      if (isSignUp) {
        result = await register(name, email, password);
        toast.success('Account created successfully!');
      } else {
        result = await emailLogin(email, password);
        toast.success('Welcome back!');
      }

      login(result.token, result.user);
      navigate('/');
    } catch (error) {
      const message =
        error.response?.data?.message || 'Something went wrong';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-page">
      <nav className="login-nav">
        <div className="login-nav-brand">
          <BsCameraVideo className="login-nav-icon" />
          <span className="login-nav-name">AI Mock Interview</span>
        </div>
      </nav>

      <div className="login-body">
        <h1 className="login-title">
          {isSignUp ? 'Create account' : 'Sign in'}
        </h1>
        <p className="login-lead">
          Practice with an AI interviewer and get feedback on your answers.
        </p>

        <div className="login-card">
          <div className="login-tabs">
            <button
              type="button"
              className={`login-tab ${!isSignUp ? 'login-tab-active' : ''}`}
              onClick={() => setIsSignUp(false)}
            >
              Sign In
            </button>
            <button
              type="button"
              className={`login-tab ${isSignUp ? 'login-tab-active' : ''}`}
              onClick={() => setIsSignUp(true)}
            >
              Create Account
            </button>
          </div>

          <form onSubmit={handleSubmit} className="login-form">
            {isSignUp && (
              <div className="login-field">
                <label htmlFor="name" className="login-label">Full Name</label>
                <input
                  id="name"
                  type="text"
                  className="login-input"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                />
              </div>
            )}

            <div className="login-field">
              <label htmlFor="email" className="login-label">Email</label>
              <input
                id="email"
                type="email"
                className="login-input"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>

            <div className="login-field">
              <label htmlFor="password" className="login-label">Password</label>
              <input
                id="password"
                type="password"
                className="login-input"
                placeholder="Min. 6 characters"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={6}
              />
            </div>

            <button
              type="submit"
              className={`login-submit ${loading ? 'login-submit-disabled' : ''}`}
              disabled={loading}
            >
              {loading
                ? 'Please wait...'
                : isSignUp
                ? 'Create Account'
                : 'Sign In'}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}

export default LoginPage;
