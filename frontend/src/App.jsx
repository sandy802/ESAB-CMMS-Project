// App.jsx

import { useEffect, useRef } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Outlet,
} from "react-router-dom";
import { Provider, useSelector, useDispatch } from "react-redux";
import store from "./store/store";
import {
  restoreSession,
  selectUser,
  selectIsAuthenticated,
  selectInitializing,
  logoutThunk,
} from "./store/authSlice";
import AppLayout from "./layouts/AppLayout";
import LoginPage from "./pages/LoginPage";
import DashboardPage from "./pages/DashboardPage";
import ReportsPage from "./pages/ReportsPage";
import UnauthorizedPage from "./pages/UnauthorizedPage";
// ─── Master Data pages (Dev B) ────────────────────────────────────
//────────────
import MachinesPage       from "./pages/master-data/MachinesPage";
import LocationsPage      from "./pages/master-data/LocationsPage";
import BreakdownTypesPage from "./pages/master-data/BreakdownTypesPage";
import RootCausesPage     from "./pages/master-data/RootCausesPage";
import MttrReasonsPage    from "./pages/master-data/MttrReasonsPage";
import UsersPage from "./pages/UsersPage";
// ─── Ticket pages (Dev B) ─────────────────────────────────────────────────────
import TicketsPage       from "./pages/tickets/TicketsPage";
import NewTicketPage     from "./pages/tickets/NewTicketPage";
import TicketDetailPage  from "./pages/tickets/TicketDetailPage";

// ─── Loaders & Guards ─────────────────────────────────────────────────────────

const AppLoader = () => (
  <div className="min-h-screen bg-gray-950 flex items-center justify-center">
    <div className="flex flex-col items-center gap-3">
      <div className="w-8 h-8 bg-amber-500 animate-pulse" />
      <span className="text-xs font-bold uppercase tracking-widest text-gray-600">
        Loading…
      </span>
    </div>
  </div>
);

const ProtectedRoute = () => {
  const isAuthenticated = useSelector(selectIsAuthenticated);
  const initializing = useSelector(selectInitializing);

  if (initializing) return <AppLoader />;
  return isAuthenticated ? <Outlet /> : <Navigate to="/login" replace />;
};


const RoleRoute = ({ allowedRoles }) => {
  const user = useSelector(selectUser);
  const initializing = useSelector(selectInitializing);

  if (initializing) return <AppLoader />;

  if (!allowedRoles.includes(user?.role))
    return <Navigate to="/unauthorized" replace />;

  return <Outlet />;
};

const RoleHome = () => {
  const user = useSelector(selectUser);
  if (user?.role === "admin") return <Navigate to="/dashboard" replace />;
  return <Navigate to="/tickets" replace />;
};

const PlaceholderPage = ({ title }) => (
  <div className="flex items-center justify-center h-64">
    <div className="text-center">
      <p className="text-xs font-bold uppercase tracking-widest text-amber-500 mb-2">
        Coming Soon
      </p>
      <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100">
        {title}
      </h1>
    </div>
  </div>
);

// ─── Router (no session logic here) ──────────────────────────────────────────

const AppRouter = () => (
  <BrowserRouter>
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/unauthorized" element={<UnauthorizedPage />} />

      <Route element={<ProtectedRoute />}>
        <Route element={<AppLayout />}>
          <Route path="/" element={<RoleHome />} />

          <Route
            element={<RoleRoute allowedRoles={["admin", "maintenance"]} />}
          >
            <Route path="/dashboard" element={<DashboardPage />} />
            <Route
              path="/reports"
element={<ReportsPage />}
            />
          </Route>

          <Route element={<RoleRoute allowedRoles={["admin"]} />}>
            {/* Master Data sub-routes — added by Dev B */}
            <Route path="/master-data"                 element={<MachinesPage />} />
            <Route path="/master-data/machines"        element={<MachinesPage />} />
            <Route path="/master-data/locations"       element={<LocationsPage />} />
            <Route path="/master-data/breakdown-types" element={<BreakdownTypesPage />} />
            <Route path="/master-data/root-causes"     element={<RootCausesPage />} />
            <Route path="/master-data/mttr-reasons"    element={<MttrReasonsPage />} />
            <Route path="/users" element={<UsersPage />} />
            </Route>

          {/* Ticket routes — all authenticated roles */}
          <Route path="/tickets"     element={<TicketsPage />} />
          {/* Only operator + maintenance can create tickets */}
          <Route element={<RoleRoute allowedRoles={['operator', 'maintenance']} />}>
            <Route path="/tickets/new" element={<NewTicketPage />} />
          </Route>
          <Route path="/tickets/:id" element={<TicketDetailPage />} />
        </Route>
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  </BrowserRouter>
);

// ─── App root — restoreSession fires ONCE here, above the router ──────────────

const AppRoot = () => {
  const dispatch = useDispatch();
  const initialized = useRef(false);

  useEffect(() => {
    if (initialized.current) return;
    initialized.current = true;
    dispatch(restoreSession());
  }, []);

  return <AppRouter />;
};

const App = () => (
  <Provider store={store}>
    <AppRoot />
  </Provider>
);

export default App;