"use client"

import { useState, useEffect } from "react"
import { BrowserRouter as Router, Routes, Route, Navigate } from "react-router-dom"
import axios from "axios"
import "./App.css"

// Components
import Navbar from "./components/Navbar"
import Login from "./components/Login"
import Register from "./components/Register"
import Home from "./components/Home"
import Profile from "./components/Profile"
import CreatePost from "./components/CreatePost"

// ✅ Automatically switch backend based on environment
axios.defaults.baseURL =
  process.env.NODE_ENV === "production"
    ? "https://connect-social.onrender.com/api"
    : "http://localhost:5000/api"

function App() {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  const setupAxiosInterceptors = () => {
    axios.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem("token")
        if (token) {
          config.headers.Authorization = `Bearer ${token}`
        }
        return config
      },
      (error) => Promise.reject(error)
    )
  }

  useEffect(() => {
    const token = localStorage.getItem("token")
    if (token) {
      axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
      const userData = localStorage.getItem("user")
      if (userData) {
        setUser(JSON.parse(userData))
      }
    }
    setupAxiosInterceptors()
    setLoading(false)
  }, [])

  const login = (userData, token) => {
    localStorage.setItem("token", token)
    localStorage.setItem("user", JSON.stringify(userData))
    axios.defaults.headers.common["Authorization"] = `Bearer ${token}`
    setUser(userData)
  }

  const logout = () => {
    // Clear stored data and axios headers
    localStorage.clear()
    sessionStorage.clear()
    delete axios.defaults.headers.common["Authorization"]
    setUser(null)
    console.log("User logged out - all data cleared")
  }

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
      </div>
    )
  }

  return (
    <Router>
      <div className="App">
        {user && <Navbar user={user} onLogout={logout} />}

        <Routes>
          <Route
            path="/login"
            element={!user ? <Login onLogin={login} /> : <Navigate to="/" />}
          />
          <Route
            path="/register"
            element={!user ? <Register onLogin={login} /> : <Navigate to="/" />}
          />
          <Route
            path="/"
            element={user ? <Home user={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/profile/:userId"
            element={user ? <Profile currentUser={user} /> : <Navigate to="/login" />}
          />
          <Route
            path="/create-post"
            element={user ? <CreatePost user={user} /> : <Navigate to="/login" />}
          />
        </Routes>
      </div>
    </Router>
  )
}

export default App
