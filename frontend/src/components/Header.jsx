import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import AuthContext from '../context/AuthContext';

function Header() {
  const { user, logoutUser } = useContext(AuthContext);

  return (
    <header>
      <nav>
        <div className="nav-left">
          <Link to="/" className="logo">
            HeapDownflow
          </Link>
          <input
            type="text"
            placeholder="Search... (feature coming soon)"
            disabled={true} 
          />
        </div>
        <div className="nav-right">
          {user ? (
            <>
              {/* This will now use the full name if available, or fallback to username */}
              <span>Hello, {user.first_name || user.username}</span>
              <button onClick={logoutUser} className="btn btn-secondary">
                Logout
              </button>
            </>
          ) : (
            <>
              <Link to="/login" className="btn btn-secondary">
                Log In
              </Link>
              <Link to="/register" className="btn">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

export default Header;

