import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "./Navbar.css";

const Navbar = ({ user, onLogout }) => {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState([]);
  const [showSearchResults, setShowSearchResults] = useState(false);
  const navigate = useNavigate();

  const handleSearch = async (query) => {
    setSearchQuery(query);

    if (query.trim().length > 2) {
      try {
        const response = await axios.get(
          `${process.env.REACT_APP_API_URL}/users/search/${query}`
        );
        setSearchResults(response.data);
        setShowSearchResults(true);
      } catch (error) {
        console.error("Search error:", error);
      }
    } else {
      setSearchResults([]);
      setShowSearchResults(false);
    }
  };

  const handleUserClick = (userId) => {
    setSearchQuery("");
    setShowSearchResults(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <Link to="/" className="nav-logo">
          SocialMedia
        </Link>

        <div className="search-container">
          <input
            type="text"
            placeholder="Search users..."
            value={searchQuery}
            onChange={(e) => handleSearch(e.target.value)}
            className="search-input"
          />

          {showSearchResults && searchResults.length > 0 && (
            <div className="search-results">
              {searchResults.map((searchUser) => (
                <div
                  key={searchUser._id}
                  className="search-result-item"
                  onClick={() => handleUserClick(searchUser._id)}
                >
                  <div className="avatar-small">
                    {searchUser.avatar ? (
                      <img
                        src={searchUser.avatar || "/placeholder.svg"}
                        alt={searchUser.username}
                      />
                    ) : (
                      <div className="avatar-placeholder">
                        {searchUser.username.charAt(0).toUpperCase()}
                      </div>
                    )}
                  </div>
                  <span>{searchUser.username}</span>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="nav-menu">
          <Link to="/" className="nav-link">
            Home
          </Link>
          <Link to={`/profile/${user.id}`} className="nav-link">
            Profile
          </Link>
          <button onClick={onLogout} className="logout-btn">
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
