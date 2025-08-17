import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "@services/authService";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: localStorage.getItem("token"),
  isLoading: true,
  isAuthenticated: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "LOADING":
      return { ...state, isLoading: true };
    case "LOGIN_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
      };
    case "LOGIN_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "LOGOUT":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
      };
    case "UPDATE_USER":
      return {
        ...state,
        user: { ...state.user, ...action.payload },
      };
    default:
      return state;
  }
};

// Helper function to extract error message from different error formats
const getErrorMessage = (error) => {
  // If it's an axios error with response data
  if (error.response?.data) {
    // Check for validation errors with details
    if (error.response.data.details && Array.isArray(error.response.data.details)) {
      return error.response.data.details.join(', ');
    }
    // Check for single error message
    if (error.response.data.error) {
      return error.response.data.error;
    }
    // Check for message field
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }
  
  // If it's a direct error message
  if (error.message) {
    return error.message;
  }
  
  // Default fallback
  return 'An unexpected error occurred';
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // check token + user when app loads
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem("token");
      if (token) {
        try {
          const user = await authService.getCurrentUser();
          dispatch({
            type: "LOGIN_SUCCESS",
            payload: { user, token },
          });
        } catch (error) {
          console.error('Auth initialization error:', error);
          localStorage.removeItem("token");
          dispatch({ type: "LOGIN_FAILURE" });
        }
      } else {
        dispatch({ type: "LOGIN_FAILURE" });
      }
    };

    initAuth();
  }, []);

  // LOGIN
  const login = async (credentials) => {
    dispatch({ type: "LOADING" });
    try {
      const data = await authService.login(credentials); 
      localStorage.setItem("token", data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: data,
      });
      toast.success("Login successful!");
      return data;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      const errorMessage = getErrorMessage(error);
      console.error('Login error:', error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // REGISTER
  const register = async (userData) => {
    dispatch({ type: "LOADING" });
    try {
      const data = await authService.register(userData);
      localStorage.setItem("token", data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: data,
      });
      toast.success("Registration successful!");
      return data;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      const errorMessage = getErrorMessage(error);
      console.error('Registration error:', error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // LOGOUT
  const logout = () => {
    localStorage.removeItem("token");
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  const updateUser = (userData) => {
    dispatch({ type: "UPDATE_USER", payload: userData });
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};