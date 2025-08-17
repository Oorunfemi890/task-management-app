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
      // Expecting backend to return { token, user }
      localStorage.setItem("token", data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: data,
      });
      toast.success("Login successful!");
      return data;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      toast.error(error.response?.data?.message || error.message || "Login failed");
      throw error;
    }
  };

  // REGISTER
  const register = async (userData) => {
    dispatch({ type: "LOADING" });
    try {
      const data = await authService.register(userData);
      // Expecting backend to return { token, user }
      localStorage.setItem("token", data.token);
      dispatch({
        type: "LOGIN_SUCCESS",
        payload: data,
      });
      toast.success("Registration successful!");
      return data;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      toast.error(error.response?.data?.message || error.message || "Registration failed");
      throw error;
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
