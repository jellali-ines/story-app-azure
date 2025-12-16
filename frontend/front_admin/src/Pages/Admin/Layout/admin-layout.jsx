// AdminLayout.tsx
import { SidebarProvider } from "../../../context/SidebarContext";
import LayoutContent from "../../../layout/AppLayout"; // ou inclure directement AppSidebar + Header
import "./admin.css"
const AdminLayout = () => {
  return (
        <SidebarProvider>
            <LayoutContent /> {/* AppSidebar + AppHeader + Outlet */}
        </SidebarProvider>
  
    
  );
};

export default AdminLayout;
