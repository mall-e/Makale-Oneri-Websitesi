import React, { useEffect } from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
} from "react-router-dom";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css'; // Toastify CSS'ini eklemeyi unutmayın
import NotFoundPage from "./pages/notfound";
import AuthForm from "./pages/login";
import Home from "./pages/home";
import Profile from "./pages/profile";
import { AuthProvider } from './contexts/AuthContext';
import Details from './pages/Details';
import Search from "./pages/search";

function App() {
  return (
    <Router>
      <AuthProvider>
        <ToastContainer position="top-right" autoClose={5000} hideProgressBar={false} newestOnTop={false} closeOnClick rtl={false} pauseOnFocusLoss draggable pauseOnHover />
        <Routes>
          <Route path="/" element={<AuthForm />} />
          <Route path="/home" element={<Home />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/details" element={<Details />} />
          <Route path="/search/:searchTerm" element={<Search />} />
          <Route path="*" element={<NotFoundPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
