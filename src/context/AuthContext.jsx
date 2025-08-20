// src/context/AuthContext.jsx
import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authService } from "@services/authService";
import toast from "react-hot-toast";

const AuthContext = createContext(null);

const initialState = {
  user: null,
  token: null,
  isLoading: true,
  isAuthenticated: false,
  isInitialized: false,
};

const authReducer = (state, action) => {
  switch (action.type) {
    case "SET_LOADING":
      return { ...state, isLoading: action.payload };
    case "INITIALIZE_START":
      return { ...state, isLoading: true, isInitialized: false };
    case "INITIALIZE_SUCCESS":
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        isInitialized: true,
      };
    case "INITIALIZE_FAILURE":
      return {
        ...state,
        user: null,
        token: null,
        isAuthenticated: false,
        isLoading: false,
        isInitialized: true,
      };
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
    case "TOKEN_REFRESHED":
      return {
        ...state,
        token: action.payload.token,
        user: action.payload.user,
      };
    default:
      return state;
  }
};

// Helper function to extract error message from different error formats
const getErrorMessage = (error) => {
  // If it's a direct error message
  if (error.message) {
    return error.message;
  }

  // If it's an axios error with response data
  if (error.response?.data) {
    if (
      error.response.data.details &&
      Array.isArray(error.response.data.details)
    ) {
      return error.response.data.details.join(", ");
    }
    if (error.response.data.error) {
      return error.response.data.error;
    }
    if (error.response.data.message) {
      return error.response.data.message;
    }
  }

  // Default fallback
  return "An unexpected error occurred";
};

export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Initialize authentication on app load
  useEffect(() => {
    const initializeAuth = async () => {
      dispatch({ type: "INITIALIZE_START" });

      try {
        // Check if we have stored auth data
        const token = authService.getToken();
        const user = authService.getUser();

        if (!token || !user) {
          throw new Error("No stored authentication data");
        }

        // Check if token is expired
        if (authService.isTokenExpired()) {
          console.log("Token expired, attempting refresh...");
          try {
            const refreshResult = await authService.refreshToken();
            dispatch({
              type: "INITIALIZE_SUCCESS",
              payload: {
                user: refreshResult.user,
                token: refreshResult.token,
              },
            });

            // Start auto-refresh timer
            authService.startTokenRefreshTimer();
            return;
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            authService.logout();
            throw new Error("Session expired");
          }
        }

        // Validate token with backend
        try {
          const currentUser = await authService.getCurrentUser();
          dispatch({
            type: "INITIALIZE_SUCCESS",
            payload: { user: currentUser, token },
          });

          // Start auto-refresh timer
          authService.startTokenRefreshTimer();
        } catch (validateError) {
          console.error("Token validation failed:", validateError);

          // If validation fails, try refresh once
          try {
            const refreshResult = await authService.refreshToken();
            dispatch({
              type: "INITIALIZE_SUCCESS",
              payload: {
                user: refreshResult.user,
                token: refreshResult.token,
              },
            });

            // Start auto-refresh timer
            authService.startTokenRefreshTimer();
          } catch (refreshError) {
            console.error("Token refresh failed:", refreshError);
            authService.logout();
            throw new Error("Authentication failed");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
        dispatch({ type: "INITIALIZE_FAILURE" });
      }
    };

    initializeAuth();
  }, []);

  // Handle token refresh
  const handleTokenRefresh = async () => {
    try {
      const result = await authService.refreshToken();
      dispatch({
        type: "TOKEN_REFRESHED",
        payload: result,
      });
      return result;
    } catch (error) {
      console.error("Token refresh error:", error);
      logout();
      throw error;
    }
  };

  // LOGIN
  const login = async (credentials) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await authService.login(credentials);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: data,
      });

      // Start auto-refresh timer
      authService.startTokenRefreshTimer();

      toast.success("Login successful!");
      return data;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      const errorMessage = getErrorMessage(error);
      console.error("Login error:", error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // REGISTER
  const register = async (userData) => {
    dispatch({ type: "SET_LOADING", payload: true });
    try {
      const data = await authService.register(userData);

      dispatch({
        type: "LOGIN_SUCCESS",
        payload: data,
      });

      // Start auto-refresh timer
      authService.startTokenRefreshTimer();

      toast.success("Registration successful!");
      return data;
    } catch (error) {
      dispatch({ type: "LOGIN_FAILURE" });
      const errorMessage = getErrorMessage(error);
      console.error("Registration error:", error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // LOGOUT
  const logout = () => {
    authService.logout();
    dispatch({ type: "LOGOUT" });
    toast.success("Logged out successfully");
  };

  // UPDATE USER
  const updateUser = (userData) => {
    // Update local state
    dispatch({ type: "UPDATE_USER", payload: userData });

    // Update stored user data
    const updatedUser = { ...state.user, ...userData };
    authService.setUser(updatedUser);
  };

  // UPDATE PROFILE
  const updateProfile = async (userData) => {
    try {
      const result = await authService.updateProfile(userData);
      if (result.user) {
        updateUser(result.user);
      }
      toast.success("Profile updated successfully");
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // CHANGE PASSWORD
  const changePassword = async (passwordData) => {
    try {
      const result = await authService.changePassword(passwordData);
      toast.success("Password changed successfully");
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // FORGOT PASSWORD
  const forgotPassword = async (email) => {
    try {
      const result = await authService.forgotPassword(email);
      toast.success("Password reset email sent");
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // RESET PASSWORD
  const resetPassword = async (token, newPassword) => {
    try {
      const result = await authService.resetPassword(token, newPassword);
      toast.success("Password reset successful");
      return result;
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      toast.error(errorMessage);
      throw new Error(errorMessage);
    }
  };

  // Check if user has specific role
  const hasRole = (role) => {
    return state.user?.role === role;
  };

  // Check if user has any of the specified roles
  const hasAnyRole = (roles) => {
    return roles.includes(state.user?.role);
  };

  // Check if user is admin
  const isAdmin = () => {
    return state.user?.role === "admin";
  };

  // Check if user is manager or admin
  const canManage = () => {
    return ["admin", "manager"].includes(state.user?.role);
  };

  const value = {
    ...state,
    login,
    register,
    logout,
    updateUser,
    updateProfile,
    changePassword,
    forgotPassword,
    resetPassword,
    handleTokenRefresh,
    hasRole,
    hasAnyRole,
    isAdmin,
    canManage,
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
