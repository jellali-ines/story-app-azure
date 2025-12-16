// AdminLayout.tsx
import { SidebarProvider } from "../context/SidebarContext";
import { ThemeProvider } from "../context/ThemeContext";
import Navbar from "../Components/Navbar";
const Test = () => {
  return (
    <ThemeProvider>
        <SidebarProvider>
            <Navbar />
        </SidebarProvider>
    </ThemeProvider>
    
  );
};

export default Test;
