// store/slices/authSlice.ts
import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { authAPI } from '@/api/auth-api';
import { User } from '@/types';

interface AuthState {
  user: User | null;
  isLoading: boolean;
  error: string | null;
  activeRole: string | null;
  workspaceId: string | null;
  token: string | null;
}

// Safely parse localStorage
const safeParseJson = (jsonString: string | null): any => {
  try {
    return jsonString ? JSON.parse(jsonString) : null;
  } catch (e) {
    console.error('Failed to parse JSON from localStorage:', e);
    return null;
  }
};

// Get initial active role
const getInitialActiveRole = (user: User | null): string | null => {
  if (typeof window === 'undefined') return null;

  const storedRole = localStorage.getItem('activeRole');
  if (storedRole) return storedRole;

  if (!user || !user.roles || user.roles.length === 0) return null;

  // Fallback logic if activeRole is not in localStorage
  if (user.roles.includes('ADMIN')) return 'ADMIN';
  if (user.roles.includes('CUSTOMER')) return 'CUSTOMER';
  return user.roles[0];
};

const initialState: AuthState = {
  user:
    typeof window !== 'undefined'
      ? safeParseJson(localStorage.getItem('user'))
      : null,
  isLoading: false,
  error: null,

  workspaceId:
    typeof window !== 'undefined' ? localStorage.getItem('workspaceId') : null,

  activeRole:
    typeof window !== 'undefined'
      ? localStorage.getItem('activeRole') ||
        getInitialActiveRole(safeParseJson(localStorage.getItem('user')))
      : null,
  token: null,
};

// New action to switch active role
export const switchActiveRole = createAsyncThunk(
  'auth/switchActiveRole',
  async (
    role: 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER',
    { getState, rejectWithValue }
  ) => {
    const state = getState() as { auth: AuthState };
    const { user } = state.auth;

    if (!user || !user.roles || !user.roles.includes(role)) {
      return rejectWithValue(`User does not have ${role} role`);
    }

    // Store the active role in localStorage for persistence
    localStorage.setItem('activeRole', role);

    return { role };
  }
);

// New action to validate user data
export const validateUserData = createAsyncThunk(
  'auth/validateUserData',
  async (_, { dispatch, rejectWithValue }) => {
    try {
      // Get user data from localStorage
      const storedUserData =
        typeof window !== 'undefined' ? localStorage.getItem('user') : null;

      if (!storedUserData) {
        return rejectWithValue('No user data found');
      }

      const userData = safeParseJson(storedUserData);
      if (!userData || !userData.id || !userData.roles) {
        // Invalid user data, clear it
        localStorage.removeItem('user');
        return rejectWithValue('Invalid user data');
      }

      return { user: userData };
    } catch (error: any) {
      localStorage.removeItem('user');
      return rejectWithValue(error.message || 'Failed to validate user data');
    }
  }
);

export const refreshAuthToken = createAsyncThunk(
  'auth/refreshToken',
  async (_, { rejectWithValue }) => {
    try {
      // Get refresh token from localStorage
      const refreshToken = localStorage.getItem('refreshToken');

      if (!refreshToken) {
        return rejectWithValue('No refresh token available');
      }

      const response = await authAPI.refreshToken(refreshToken);

      // Store the updated tokens
      if (response && response.data && response.data.token) {
        if (response && response.data && response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      }

      if (response && response.data && response.data.refreshToken) {
        localStorage.setItem('refreshToken', response.data.refreshToken);
      }

      if (response) {
        return response.data;
      } else {
        throw new Error('Response is undefined');
      }
    } catch (error: any) {
      // Clear tokens on failure
      localStorage.removeItem('token');
      localStorage.removeItem('refreshToken');

      return rejectWithValue(
        error.response?.data?.message || 'Failed to refresh token'
      );
    }
  }
);

export const loginUser = createAsyncThunk(
  'auth/login',
  async (
    { email, password }: { email: string; password: string },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await authAPI.login(email, password);

      // Store the token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Login failed');
    }
  }
);

export const registerUser = createAsyncThunk(
  'auth/register',
  async (
    userData: {
      firstName: string;
      lastName: string;
      email: string;
      password: string;
      roles: string[];
      phone: string;
    },
    { rejectWithValue }
  ) => {
    try {
      const response: any = await authAPI.register(userData);

      // Store the token if provided
      if (response.data.token) {
        localStorage.setItem('token', response.data.token);
      }

      // Store user data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Registration failed'
      );
    }
  }
);

// Modified logout action to clear all persisted data
export const logoutUser = createAsyncThunk(
  'auth/logout',
  async (_, { rejectWithValue }) => {
    try {
      await authAPI.logout();

      // Clear all localStorage items
      if (typeof window !== 'undefined') {
        // Clear specific auth items
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('activeRole');
        localStorage.removeItem('workspaceId');
        localStorage.removeItem('refreshToken');
        localStorage.removeItem('cart');
        localStorage.removeItem('customerOrder');
        localStorage.removeItem('stores');
        localStorage.removeItem('socket');

        // Clear all persist:* items (redux-persist)
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('persist:')) {
            localStorage.removeItem(key);
          }
        });
      }

      return null;
    } catch (error: any) {
      // Still clear localStorage even if API fails
      if (typeof window !== 'undefined') {
        // Clear specific auth items
        localStorage.removeItem('user');
        localStorage.removeItem('token');
        localStorage.removeItem('activeRole');
        localStorage.removeItem('stores');
        localStorage.removeItem('socket');

        // Clear all persist:* items (redux-persist)
        Object.keys(localStorage).forEach((key) => {
          if (key.startsWith('persist:')) {
            localStorage.removeItem(key);
          }
        });
      }

      return rejectWithValue(error.response?.data?.message || 'Logout failed');
    }
  }
);

export const getCurrentUser = createAsyncThunk(
  'auth/getCurrentUser',
  async (_, { rejectWithValue }) => {
    try {
      // First check if we have a token
      const token = localStorage.getItem('token');
      if (!token) {
        return rejectWithValue('No authentication token');
      }

      const response = await authAPI.getCurrentUser();

      // Update localStorage with fresh data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      // On 401 errors, clear the storage
      if (error.response?.status === 401) {
        localStorage.removeItem('user');
        localStorage.removeItem('token');
      }
      return rejectWithValue(
        error.response?.data?.message || 'Failed to get user'
      );
    }
  }
);

// Add update profile or roles functionality
export const updateUserRoles = createAsyncThunk(
  'auth/updateUserRoles',
  async (_, { getState, rejectWithValue }) => {
    try {
      // Call your API to update user roles (e.g., add ADMIN role)
      const response = await authAPI.becomeAdmin();

      // Update localStorage with fresh data
      if (response.data.user) {
        localStorage.setItem('user', JSON.stringify(response.data.user));
      }

      return response.data;
    } catch (error: any) {
      return rejectWithValue(
        error.response?.data?.message || 'Failed to update roles'
      );
    }
  }
);

const authSlice = createSlice({
  name: 'auth',
  initialState,
  reducers: {
    clearErrors: (state) => {
      state.error = null;
    },

    setActiveRole: (state, action: PayloadAction<string>) => {
      // Only set if user has this role
      if (
        state.user &&
        state.user.roles &&
        state.user.roles.includes(
          action.payload as 'ADMIN' | 'MANAGER' | 'STAFF' | 'CUSTOMER'
        )
      ) {
        state.activeRole = action.payload;
        // Also update in localStorage for persistence
        if (typeof window !== 'undefined') {
          localStorage.setItem('activeRole', action.payload);
        }
      }
    },
    setWorkspaceId: (state, action) => {
      state.workspaceId = action.payload;
    },
  },
  extraReducers: (builder) => {
    // Validate User Data
    builder.addCase(validateUserData.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(validateUserData.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      // Set initial active role
      state.activeRole = getInitialActiveRole(action.payload.user);
      if (state.activeRole && typeof window !== 'undefined') {
        localStorage.setItem('activeRole', state.activeRole);
      }
    });
    builder.addCase(validateUserData.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.activeRole = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('activeRole');
      }
    });

    // Refresh Token
    builder.addCase(refreshAuthToken.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(refreshAuthToken.fulfilled, (state) => {
      state.isLoading = false;
      state.error = null;
    });
    builder.addCase(refreshAuthToken.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.user = null;
      state.activeRole = null;
    });

    // Login
    builder.addCase(loginUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(loginUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.error = null;
      if (action.payload.user?.workspaceId) {
        state.workspaceId = action.payload.user?.workspaceId;
      }
      // Set active role on login
      state.activeRole = getInitialActiveRole(action.payload.user);
      if (state.activeRole && typeof window !== 'undefined') {
        localStorage.setItem('activeRole', state.activeRole);
      }
    });
    builder.addCase(loginUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      state.activeRole = null;
    });

    // Register
    builder.addCase(registerUser.pending, (state) => {
      state.isLoading = true;
      state.error = null;
    });
    builder.addCase(registerUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      state.error = null;
      // Set active role on registration
      state.activeRole = getInitialActiveRole(action.payload.user);
      if (state.activeRole && typeof window !== 'undefined') {
        localStorage.setItem('activeRole', state.activeRole);
      }
    });
    builder.addCase(registerUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });

    // Logout
    builder.addCase(logoutUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(logoutUser.fulfilled, (state) => {
      state.isLoading = false;
      state.user = null;
      state.activeRole = null;
      state.workspaceId = null;
    });
    builder.addCase(logoutUser.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
      // Still clear user on error
      state.user = null;
      state.activeRole = null;
      state.workspaceId = null;
    });

    // Get Current User
    builder.addCase(getCurrentUser.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(getCurrentUser.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;
      // Preserve activeRole if user already has one, otherwise set default
      if (!state.activeRole) {
        state.activeRole = getInitialActiveRole(action.payload.user);
        if (state.activeRole && typeof window !== 'undefined') {
          localStorage.setItem('activeRole', state.activeRole);
        }
      }
    });
    builder.addCase(getCurrentUser.rejected, (state) => {
      state.isLoading = false;
      state.user = null;
      state.activeRole = null;
      if (typeof window !== 'undefined') {
        localStorage.removeItem('activeRole');
      }
    });

    // Switch Active Role
    builder.addCase(switchActiveRole.fulfilled, (state, action) => {
      state.activeRole = action.payload.role;
    });

    // Update User Roles (e.g., when becoming admin)
    builder.addCase(updateUserRoles.pending, (state) => {
      state.isLoading = true;
    });
    builder.addCase(updateUserRoles.fulfilled, (state, action) => {
      state.isLoading = false;
      state.user = action.payload.user;

      // If the user just gained ADMIN role, make it active
      if (
        action.payload.user.roles.includes('ADMIN') &&
        (!state.activeRole || state.activeRole === 'CUSTOMER')
      ) {
        state.activeRole = 'ADMIN';
        if (typeof window !== 'undefined') {
          localStorage.setItem('activeRole', 'ADMIN');
        }
      }
    });
    builder.addCase(updateUserRoles.rejected, (state, action) => {
      state.isLoading = false;
      state.error = action.payload as string;
    });
  },
});

export const { clearErrors, setActiveRole, setWorkspaceId } = authSlice.actions;
export default authSlice.reducer;
