"use client";

import { useState } from "react";
import { Link } from "react-router-dom";
import "./PostCard.css";

const PostCard = ({ post, currentUser, onLike, onComment }) => {
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState("");
  const [isCommenting, setIsCommenting] = useState(false);

  const isLiked = post.likes.includes(currentUser.id);
  const isOwner = post.author._id === currentUser.id;

  const handleLike = () => {
    onLike(post._id);
  };

  const handleCommentSubmit = async (e) => {
    e.preventDefault();
    if (!newComment.trim()) return;

    setIsCommenting(true);
    await onComment(post._id, newComment);
    setNewComment("");
    setIsCommenting(false);
  };

  const formatDate = (date) => {
    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  // ✅ Production-safe image URL builder
  const getImageUrl = (path) => {
    if (!path) return null;
    if (path.startsWith("http")) return path;
    return `${process.env.REACT_APP_API_URL}${path}`;
  };

  return (
    <div className="post-card">
      <div className="post-header">
        <div className="post-author">
          <div className="avatar">
            {post.author.avatar ? (
              <img
                src={post.author.avatar || "/placeholder.svg"}
                alt={post.author.username}
              />
            ) : (
              <div className="avatar-placeholder">
                {post.author.username.charAt(0).toUpperCase()}
              </div>
            )}
          </div>
          <div className="author-info">
            <Link to={`/profile/${post.author._id}`} className="author-name">
              {post.author.username}
            </Link>
            <span className="post-date">{formatDate(post.createdAt)}</span>
          </div>
        </div>
      </div>

      <div className="post-content">
        <p>{post.content}</p>
        {post.image && (
          <div className="post-image">
            <img
              src={getImageUrl(post.image)}
              alt="Post content"
              onError={(e) => {
                console.error("Image failed to load:", post.image);
                e.target.style.display = "none";
              }}
            />
          </div>
        )}
      </div>

      <div className="post-actions">
        <button
          className={`action-btn like-btn ${isLiked ? "liked" : ""}`}
          onClick={handleLike}
        >
          <span className="icon">❤️</span>
          <span>{post.likes.length}</span>
        </button>

        <button
          className="action-btn comment-btn"
          onClick={() => setShowComments(!showComments)}
        >
          <span className="icon">💬</span>
          <span>{post.comments.length}</span>
        </button>
      </div>

      {showComments && (
        <div className="comments-section">
          <form onSubmit={handleCommentSubmit} className="comment-form">
            <input
              type="text"
              placeholder="Write a comment..."
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              disabled={isCommenting}
            />
            <button
              type="submit"
              disabled={isCommenting || !newComment.trim()}
            >
              {isCommenting ? "Posting..." : "Post"}
            </button>
          </form>

          <div className="comments-list">
            {post.comments.map((comment, index) => (
              <div key={index} className="comment">
                <div className="comment-author">
                  <strong>{comment.author?.username || "User"}</strong>
                  <span className="comment-date">
                    {formatDate(comment.createdAt)}
                  </span>
                </div>
                <p className="comment-content">{comment.content}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default PostCard;
