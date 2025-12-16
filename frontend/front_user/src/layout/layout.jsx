import { Outlet } from 'react-router-dom';
import Header from '../components/layout/Header';
import Footer from '../components/layout/Footer';

const Layout = ({
  showHeader = true,
  showFooter = true,
  currentTheme,
  setCurrentTheme,
  darkMode,
  setDarkMode
}) => {
  return (
    <div
      className={`min-h-screen transition-colors duration-300 ${
        darkMode ? 'bg-gray-900' : 'bg-gradient-to-br from-purple-50 via-pink-50 to-blue-50'
      }`}
    >
      {showHeader && (
        <Header
          currentTheme={currentTheme}
          setCurrentTheme={setCurrentTheme}
          darkMode={darkMode}
          setDarkMode={setDarkMode}
        />
      )}

      <main className="min-h-[calc(100vh-200px)]">
        <Outlet />
      </main>

      {showFooter && <Footer />}
    </div>
  );
};

export default Layout;
