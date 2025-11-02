"use client"

import { useState } from "react"
import axios from "axios"
import "./CreatePost.css"

const CreatePost = ({ user, onPostCreated }) => {
  const [content, setContent] = useState("")
  const [image, setImage] = useState(null)
  const [imagePreview, setImagePreview] = useState("")
  const [loading, setLoading] = useState(false)
  const [uploadError, setUploadError] = useState("")

  // ✅ Use environment variable for backend URL
  const API_BASE_URL = process.env.REACT_APP_API_URL

  const handleImageChange = (e) => {
    const file = e.target.files[0]
    if (!file) return

    const fileExtension = file.name.split(".").pop().toLowerCase()
    const validExtensions = ["jpg", "jpeg", "png"]

    if (!validExtensions.includes(fileExtension)) {
      setUploadError("Invalid file type. Please select a JPG, JPEG, or PNG file.")
      return
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("File is too large. Maximum size is 5MB.")
      return
    }

    setUploadError("")
    setImage(file)

    const reader = new FileReader()
    reader.onloadend = () => setImagePreview(reader.result)
    reader.onerror = () => setUploadError("Failed to read file")
    reader.readAsDataURL(file)
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!content.trim() && !image) {
      setUploadError("Please add some content or select an image")
      return
    }

    setLoading(true)
    setUploadError("")

    try {
      let imageUrl = ""
      const token = localStorage.getItem("token")

      // ✅ Upload image if present
      if (image) {
        const formData = new FormData()
        formData.append("image", image)

        const uploadResponse = await axios.post(
          `${API_BASE_URL}/upload`,
          formData,
          {
            headers: {
              "Content-Type": "multipart/form-data",
              Authorization: `Bearer ${token}`,
            },
            timeout: 30000,
          }
        )

        console.log("Upload successful:", uploadResponse.data)
        imageUrl = `${API_BASE_URL.replace("/api", "")}${uploadResponse.data.imageUrl}`
      }

      // ✅ Create post
      const postData = {
        content: content.trim(),
        image: imageUrl,
      }

      const postResponse = await axios.post(
        `${API_BASE_URL}/posts`,
        postData,
        {
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      )

      console.log("Post created successfully:", postResponse.data)

      // Reset form
      setContent("")
      setImage(null)
      setImagePreview("")
      setUploadError("")
      onPostCreated()
    } catch (error) {
      console.error("Post creation error:", error.response?.data || error)
      setUploadError("Failed to create post: " + (error.response?.data?.error || error.message))
    } finally {
      setLoading(false)
    }
  }

  const removeImage = () => {
    setImage(null)
    setImagePreview("")
    setUploadError("")
  }

  return (
    <div className="create-post">
      <div className="create-post-header">
        <div className="avatar">
          {user.avatar ? (
            <img src={user.avatar || "/placeholder.svg"} alt={user.username} />
          ) : (
            <div className="avatar-placeholder">
              {user.username.charAt(0).toUpperCase()}
            </div>
          )}
        </div>
        <h3>Create a Post</h3>
      </div>

      <form onSubmit={handleSubmit}>
        <textarea
          placeholder={`What's on your mind, ${user.username}?`}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows="3"
        />

        {uploadError && <div className="error-message">{uploadError}</div>}

        {imagePreview && (
          <div className="image-preview">
            <img src={imagePreview || "/placeholder.svg"} alt="Preview" />
            <button type="button" onClick={removeImage} className="remove-image">
              ✕
            </button>
          </div>
        )}

        <div className="post-actions">
          <label className="image-upload">
            <input
              type="file"
              accept=".jpg,.jpeg,.png"
              onChange={handleImageChange}
              style={{ display: "none" }}
            />
            📷 Photo (JPG, JPEG, PNG)
          </label>

          <button type="submit" disabled={loading} className="post-button">
            {loading ? "Posting..." : "Post"}
          </button>
        </div>
      </form>
    </div>
  )
}

export default CreatePost
