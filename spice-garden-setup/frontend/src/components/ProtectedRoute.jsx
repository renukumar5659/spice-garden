import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import Loading from "./Loading";

const protectedRouteStyles = `
  .protected-route-loading {
    width: 100%;
    min-height: 120px;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .protected-route-denied {
    width: 100%;
    max-width: 560px;
    margin: 24px auto;
    padding: 20px;
    box-sizing: border-box;
    text-align: center;
    border: 1px solid #dedede;
    border-radius: 10px;
    background: #fff;
    font-size: 13px;
  }
`;

export default function ProtectedRoute({ children, adminOnly = false }) {
  const { isAuthenticated, isAdmin, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <>
        <style>{protectedRouteStyles}</style>
        <div className="protected-route-loading">
          <Loading />
        </div>
      </>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (adminOnly && !isAdmin) {
    return <Navigate to="/" replace />;
  }

  return children;
}
