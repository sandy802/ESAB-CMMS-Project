import { useDispatch, useSelector } from 'react-redux';
import {
  logoutThunk
} from '../store/authSlice';


const UnauthorizedPage = () => {
  const dispatch = useDispatch();
  const handleLogout = async () => {
    await dispatch(logoutThunk());
    window.location.href = '/login';
  };
  return (
    <div className="min-h-screen bg-gray-950 flex items-center justify-center">
      <div className="text-center">
        <p className="text-xs font-bold uppercase tracking-widest text-red-500 mb-2">Access Denied</p>
        <h1 className="text-2xl font-black uppercase tracking-tight text-gray-100 mb-6">Unauthorized</h1>
        <div className="flex gap-3 justify-center">
          <button
            onClick={() => window.history.back()}
            className="px-4 py-2 text-sm border border-gray-700 text-gray-400 hover:text-gray-200 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={handleLogout}
            className="px-4 py-2 text-sm bg-amber-500 text-gray-950 font-semibold hover:bg-amber-400 transition-colors"
          >
            Sign Out
          </button>
        </div>
      </div>
    </div>
  );
};


export default UnauthorizedPage;