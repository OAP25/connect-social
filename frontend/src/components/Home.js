import { useState, useEffect } from "react"
import axios from "axios"
import PostCard from "./PostCard"
import CreatePost from "./CreatePost"
import "./Home.css"

const Home = ({ user }) => {
  const [posts, setPosts] = useState([])
  const [loading, setLoading] = useState(true)
  const [page, setPage] = useState(1)
  const [hasMore, setHasMore] = useState(true)

  // ✅ Use environment variable for backend URL
  const API_BASE = process.env.REACT_APP_API_URL

  useEffect(() => {
    fetchPosts()
  }, [])

  const fetchPosts = async (pageNum = 1) => {
    try {
      const response = await axios.get(`${API_BASE}/posts?page=${pageNum}&limit=10`)

      if (pageNum === 1) {
        setPosts(response.data.posts)
      } else {
        setPosts((prev) => [...prev, ...response.data.posts])
      }

      setHasMore(response.data.pagination.page < response.data.pagination.pages)
      setPage(pageNum)
    } catch (error) {
      console.error("Error fetching posts:", error)
    } finally {
      setLoading(false)
    }
  }

  const handlePostCreated = () => {
    fetchPosts(1) // Refresh posts after creating new one
  }

  const handleLike = async (postId) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(`${API_BASE}/posts/${postId}/like`, {}, {
        headers: { Authorization: `Bearer ${token}` },
      })

      setPosts(
        posts.map((post) =>
          post._id === postId
            ? {
                ...post,
                likes: response.data.liked
                  ? [...post.likes, user.id]
                  : post.likes.filter((id) => id !== user.id),
              }
            : post
        )
      )
    } catch (error) {
      console.error("Error liking post:", error)
    }
  }

  const handleComment = async (postId, content) => {
    try {
      const token = localStorage.getItem("token")
      const response = await axios.post(
        `${API_BASE}/posts/${postId}/comments`,
        { content },
        { headers: { Authorization: `Bearer ${token}` } }
      )

      setPosts(
        posts.map((post) =>
          post._id === postId
            ? { ...post, comments: [...post.comments, response.data.comment] }
            : post
        )
      )
    } catch (error) {
      console.error("Error adding comment:", error)
    }
  }

  const loadMore = () => {
    if (hasMore && !loading) {
      fetchPosts(page + 1)
    }
  }

  if (loading && posts.length === 0) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <div className="home-container">
      <div className="home-content">
        <CreatePost user={user} onPostCreated={handlePostCreated} />

        <div className="posts-container">
          {posts.length === 0 ? (
            <div className="no-posts">
              <h3>No posts yet</h3>
              <p>Be the first to share something!</p>
            </div>
          ) : (
            posts.map((post) => (
              <PostCard
                key={post._id}
                post={post}
                currentUser={user}
                onLike={handleLike}
                onComment={handleComment}
              />
            ))
          )}

          {hasMore && (
            <button onClick={loadMore} className="load-more-btn" disabled={loading}>
              {loading ? "Loading..." : "Load More"}
            </button>
          )}
        </div>
      </div>
    </div>
  )
}

export default Home
