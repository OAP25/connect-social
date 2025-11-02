"use client";

import { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import axios from "axios";
import PostCard from "./PostCard";
import "./Profile.css";

const API = process.env.REACT_APP_API_BASE_URL || "https://connect-social.onrender.com/api";

const Profile = ({ currentUser }) => {
  const { userId } = useParams();
  const [user, setUser] = useState(null);
  const [posts, setPosts] = useState([]);
  const [stats, setStats] = useState({});
  const [loading, setLoading] = useState(true);
  const [isFollowing, setIsFollowing] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [editData, setEditData] = useState({ username: "", bio: "" });

  const isOwnProfile = userId === currentUser.id;

  useEffect(() => {
    fetchUserProfile();
  }, [userId]);

  const fetchUserProfile = async () => {
    try {
      const response = await axios.get(`${API}/users/${userId}`);
      setUser(response.data.user);
      setPosts(response.data.posts);
      setStats(response.data.stats);
      setIsFollowing(
        response.data.user.followers.some(
          (follower) => follower._id === currentUser.id
        )
      );
      setEditData({
        username: response.data.user.username,
        bio: response.data.user.bio,
      });
    } catch (error) {
      console.error("Error fetching profile:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleFollow = async () => {
    try {
      const response = await axios.post(`${API}/users/${userId}/follow`);
      setIsFollowing(response.data.following);
      setStats((prev) => ({
        ...prev,
        followersCount: response.data.followersCount,
      }));
    } catch (error) {
      console.error("Error following user:", error);
    }
  };

  const handleEditProfile = async (e) => {
    e.preventDefault();
    try {
      const response = await axios.put(`${API}/users/profile`, editData);
      setUser(response.data.user);
      setIsEditing(false);
    } catch (error) {
      console.error("Error updating profile:", error);
    }
  };

  const handleLike = async (postId) => {
    try {
      const response = await axios.post(`${API}/posts/${postId}/like`);
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: response.data.liked
                  ? [...post.likes, currentUser.id]
                  : post.likes.filter((id) => id !== currentUser.id),
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error liking post:", error);
    }
  };

  const handleComment = async (postId, content) => {
    try {
      const response = await axios.post(`${API}/posts/${postId}/comments`, {
        content,
      });
      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                comments: [...post.comments, response.data.comment],
              }
            : post
        )
      );
    } catch (error) {
      console.error("Error adding comment:", error);
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    );
  }

  if (!user) {
    return <div className="error-message">User not found</div>;
  }

  return (
    <div className="profile-container">
      <div className="profile-header">
        <div className="profile-info">
          <div className="avatar-large">
            {user.avatar ? (
              <img src={user.avatar || "/placeholder.svg"} alt={user.username} />
            ) : (
              <div className="avatar-placeholder">
                {user.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>

          <div className="user-details">
            <h2>{user.username}</h2>
            <p className="user-bio">{user.bio || "No bio yet"}</p>

            <div className="user-stats">
              <div className="stat">
                <strong>{stats.postsCount}</strong>
                <span>Posts</span>
              </div>
              <div className="stat">
                <strong>{stats.followersCount}</strong>
                <span>Followers</span>
              </div>
              <div className="stat">
                <strong>{stats.followingCount}</strong>
                <span>Following</span>
              </div>
            </div>

            <div className="profile-actions">
              {isOwnProfile ? (
                <button
                  onClick={() => setIsEditing(true)}
                  className="edit-profile-btn"
                >
                  Edit Profile
                </button>
              ) : (
                <button
                  onClick={handleFollow}
                  className={`follow-btn ${isFollowing ? "following" : ""}`}
                >
                  {isFollowing ? "Unfollow" : "Follow"}
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {isEditing && (
        <div className="edit-profile-modal">
          <div className="modal-content">
            <h3>Edit Profile</h3>
            <form onSubmit={handleEditProfile}>
              <div className="form-group">
                <label>Username</label>
                <input
                  type="text"
                  value={editData.username}
                  onChange={(e) =>
                    setEditData({ ...editData, username: e.target.value })
                  }
                />
              </div>
              <div className="form-group">
                <label>Bio</label>
                <textarea
                  value={editData.bio}
                  onChange={(e) =>
                    setEditData({ ...editData, bio: e.target.value })
                  }
                  rows="3"
                />
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setIsEditing(false)}>
                  Cancel
                </button>
                <button type="submit">Save Changes</button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="profile-posts">
        <h3>Posts ({stats.postsCount})</h3>
        {posts.length === 0 ? (
          <div className="no-posts">
            <p>
              {isOwnProfile
                ? "You haven't posted anything yet"
                : "No posts yet"}
            </p>
          </div>
        ) : (
          <div className="posts-grid">
            {posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={currentUser}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Profile;
