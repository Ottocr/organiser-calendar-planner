import React, { useState, useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import LoginForm from './LoginForm';
import RegisterForm from './RegisterForm';
import { clearError } from '../../store/slices/userSlice';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const isAuthenticated = useSelector(state => state.user.isAuthenticated);
  const dispatch = useDispatch();

  // Clear any errors when switching forms or unmounting
  useEffect(() => {
    return () => {
      dispatch(clearError());
    };
  }, [isLogin, dispatch]);

  // If user is already authenticated, don't show auth forms
  if (isAuthenticated) {
    return null;
  }

  const toggleForm = () => {
    dispatch(clearError());
    setIsLogin(!isLogin);
  };

  return (
    <AnimatePresence mode="wait">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-gray-50 z-50"
      >
        <motion.div
          key={isLogin ? 'login' : 'register'}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {isLogin ? (
            <LoginForm onToggleForm={toggleForm} />
          ) : (
            <RegisterForm onToggleForm={toggleForm} />
          )}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default Auth;
