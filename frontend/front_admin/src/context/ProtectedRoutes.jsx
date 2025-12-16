import { useAuth } from "./useAuth";
import { Navigate } from "react-router-dom";

export default function ProtectedRoutes({ children }) {
  const { user } = useAuth();
  
  return user ? children : <Navigate to="/signin" />;
} 