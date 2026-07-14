  import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
  import api, { setAccessToken, clearAccessToken } from "../services/auth.api";

  // On app mount — calls /auth/refresh using the httpOnly cookie
  // If it works, user is silently restored
  export const restoreSession = createAsyncThunk(
    "auth/restoreSession",
    async (_, { rejectWithValue }) => {
      try {
        const { data } = await api.post("/auth/refresh");
        setAccessToken(data.accessToken);
        return data.user; // { id, name, username, role }
      } catch {
        return rejectWithValue(null);
      }
    }
  );

  export const loginThunk = createAsyncThunk(
    "auth/login",
    async ({ username, password }, { rejectWithValue }) => {
      try {
        const { data } = await api.post("/auth/login", { username, password });
        setAccessToken(data.accessToken);
        return data.user;
      } catch (err) {
        const message =
          err?.response?.data?.message || "Login failed. Please try again.";
        return rejectWithValue(message);
      }
    }
  );

  export const logoutThunk = createAsyncThunk(
    "auth/logout",
    async (_, { rejectWithValue }) => {
      try {
        await api.post("/auth/logout");
      } catch {
        // ignore — clear client state regardless
      } finally {
        clearAccessToken();
      }
    }
  );

  const authSlice = createSlice({
    name: "auth",
    initialState: {
      user: null,
      isAuthenticated: false,
      initializing: true,
      loading: false,
      error: null,
    },
    reducers: {
      clearAuth(state) {
        state.user = null;
        state.isAuthenticated = false;
        state.error = null;
        clearAccessToken();
      },
      clearError(state) {
        state.error = null;
      },
    },
    extraReducers: (builder) => {
      builder
        .addCase(restoreSession.pending, (state) => {
          state.initializing = true;
        })
        .addCase(restoreSession.fulfilled, (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.initializing = false;
        })
        .addCase(restoreSession.rejected, (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.initializing = false;
        });

      builder
        .addCase(loginThunk.pending, (state) => {
          state.loading = true;
          state.error = null;
        })
        .addCase(loginThunk.fulfilled, (state, action) => {
          state.user = action.payload;
          state.isAuthenticated = true;
          state.loading = false;
          state.error = null;
        })
        .addCase(loginThunk.rejected, (state, action) => {
          state.user = null;
          state.isAuthenticated = false;
          state.loading = false;
          state.error = action.payload;
        });

      builder
        .addCase(logoutThunk.fulfilled, (state) => {
          state.user = null;
          state.isAuthenticated = false;
          state.error = null;
        });
    },
  });

  export const { clearAuth, clearError } = authSlice.actions;

  export const selectUser = (state) => state.auth.user;
  export const selectIsAuthenticated = (state) => state.auth.isAuthenticated;
  export const selectInitializing = (state) => state.auth.initializing;
  export const selectAuthLoading = (state) => state.auth.loading;
  export const selectAuthError = (state) => state.auth.error;

  export default authSlice.reducer;