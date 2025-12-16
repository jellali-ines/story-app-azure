// LayoutContent.tsx
import { useSidebar } from "../context/SidebarContext";
import { Outlet } from "react-router";
import AppHeader from "./AppHeader";
import Backdrop from "./Backdrop";
import AppSidebar from "./AppSidebar";

const LayoutContent = () => {
  const { isExpanded, isHovered, isMobileOpen } = useSidebar();

  return (
    <div className="min-h-screen flex xl:flex-row">
      {/* Sidebar */}
      <AppSidebar />
      <Backdrop />

      {/* Contenu principal */}
      <div
        className={`flex-1 flex flex-col min-h-screen  transition-all duration-300 ease-in-out ${
          isExpanded || isHovered ? "lg:ml-[290px]" : "lg:ml-[90px]"
        } ${isMobileOpen ? "ml-0" : ""}`}
      >
        {/* Header */}
        <AppHeader />

        {/* Page content */}
       <main className="p-4 md:p-6 mx-auto max-w-[1440px] w-full overflow-y-auto h-screen">
  <Outlet />
</main>

      </div>
    </div>
  );
};

export default LayoutContent;
