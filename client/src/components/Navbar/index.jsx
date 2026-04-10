import { useContext } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext.jsx';
import { BsCameraVideo } from 'react-icons/bs';
import { MdHome, MdLogout } from 'react-icons/md';
import { FaUser } from 'react-icons/fa';
import './index.css';

function Navbar() {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="navbar-container">
      <div className="navbar-left">
        <Link to="/" className="navbar-brand">
          <BsCameraVideo className="brand-icon" />
          <span className="brand-text">AI Mock Interview</span>
        </Link>
        <div className="nav-links">
          <Link
            to="/"
            className={`nav-link ${location.pathname === '/' ? 'nav-link-active' : ''}`}
          >
            <MdHome className="nav-link-icon" />
            Home
          </Link>
        </div>
      </div>
      <div className="navbar-right">
        {user && (
          <div className="navbar-user-section">
            <FaUser className="user-icon" />
            <span className="user-name">{user.name}</span>
            <button className="logout-btn" onClick={handleLogout}>
              <MdLogout className="logout-icon" />
              Logout
            </button>
          </div>
        )}
      </div>
    </nav>
  );
}

export default Navbar;

