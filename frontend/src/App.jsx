import React from "react";
import AppRouter from "@router/AppRouter";
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// ✅ Global CSS Imports
import "@shared/styles/vendor.css";

export default function App() {
  return (
    <>
      <ToastContainer 
        position="top-center"
        autoClose={3500}
        hideProgressBar={false}
        closeOnClick
        pauseOnHover
        draggable
      />
      <AppRouter />
    </>
  );
}