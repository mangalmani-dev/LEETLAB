import React, { useEffect } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from "react-hot-toast";
import { Loader } from 'lucide-react';
import Layout from './layout/Layout';
import AdminRoute from "./component/AdminRoute"
import SignUpPage from './page/SignUpPage';
import LoginPage from './page/LoginPage';
import HomePage from './page/HomePage';

import AddProblem from './page/AddProblem';

import { useAuthStore } from './store/useAuthStore';
import ProblemPage from './page/ProblemPage';


const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className='flex flex-col items-center justify-start w-full'>
      <Toaster />
      <Routes>
        {/* Layout parent route for pages with Navbar */}
        <Route path="/" element={<Layout />}>
          <Route
            index
            element={authUser ? <HomePage /> : <Navigate to="/login" />}
          />
        </Route>

        {/* Login and Signup routes */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/" />}
        />
        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/" />}
        />
   
        <Route

        path='/problem/:id'
           element =  {authUser ? <ProblemPage/>: <Navigate to={"/login"}/>}
        />
           


        {/* Admin-only route */}
        <Route element={<AdminRoute />}>
          <Route
            path='/add-problem'
            element={authUser ? <AddProblem /> : <Navigate to="/" />}
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
