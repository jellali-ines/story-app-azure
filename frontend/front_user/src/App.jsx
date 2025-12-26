import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import MainLayout from './layout/MainLayout';
import Layout from './layout/layout';
import useTheme from './hooks/useTheme';

// ================= Lazy Pages =================
// Lazy loading يسمح بتحميل الـ component فقط عند الحاجة (performance أفضل)
const StoryLunch = lazy(() => import('./components/story/StoryLunch'));

const HomePage = lazy(() => import('./Pages/HomePage'));

// الصفحات التالية غير موجودة حاليا، لذلك التعليق يمنع أخطاء "is not defined"
// const GrammarPage = lazy(() => import('./Pages/GrammarPage'));
// const StoryPage = lazy(() => import('./Pages/StoryPage'));

const AdminPage = lazy(() => import('./Pages/AdminPage'));
const Stories = lazy(() => import('./Pages/Stories'));
const Home = lazy(() => import('./Pages/Home'));

// صفحات إدارة قوائم التشغيل والمجلدات
const AllPlaylistsPage = lazy(() => import('./Pages/AllPlaylistsPage'));
const FolderDetailPage = lazy(() => import('./Pages/FolderDetailPage'));
const StoryPagePlaylist = lazy(() => import('./Pages/StoryPagePlaylist'));
const FoldersPage = lazy(() => import('./Pages/FoldersPage'));

// صفحات التفاصيل والقراءة
const StoryDetails = lazy(() => import('./components/story/StoryDetails'));
const ReadTheStory = lazy(() => import('./components/story/StoryReader'));

// ⭐ صفحة تقييم النطق (Speech Evaluation)
const SpeechEvaluation = lazy(() => import('./Pages/SpeechEvaluation'));

function App() {
  const {
    currentTheme,
    setCurrentTheme,
    darkMode,
    setDarkMode,
    theme
  } = useTheme('purple');

  return (
    <BrowserRouter>
      <Suspense
        fallback={
          <div className="min-h-screen flex items-center justify-center text-lg">
            Chargement... {/* رسالة تحميل أثناء lazy loading */}
          </div>
        }
      >
        <Routes>

          {/* ================= Routes مع Header + Footer ================= */}
          <Route
            element={
              <MainLayout
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          >
            <Route path="/" element={<HomePage theme={theme} darkMode={darkMode} />} />
            
            {/* الصفحات الغير موجودة حاليا للتعليق */}
            {/* <Route path="/grammar" element={<GrammarPage theme={theme} darkMode={darkMode} />} /> */}
            {/* <Route path="/story" element={<StoryPage theme={theme} darkMode={darkMode} />} /> */}
            
            <Route path="/admin" element={<AdminPage theme={theme} darkMode={darkMode} />} />
            <Route path="/playlists" element={<AllPlaylistsPage />} />
            <Route path="/StoryPagePlaylist" element={<StoryPagePlaylist />} />
            <Route path="/folders" element={<FoldersPage />} />
            <Route path="/folder/:folderId" element={<FolderDetailPage />} />

            <Route
              path="/stories"
              element={
                <Stories
                  currentTheme={currentTheme}
                  setCurrentTheme={setCurrentTheme}
                  darkMode={darkMode}
                  setDarkMode={setDarkMode}
                  THEMES={theme}
                />
              }
            />
          </Route>

          {/* ================= Routes بدون Header (مع Footer) ================= */}
          <Route
            element={
              <Layout
                showHeader={false}
                showFooter={true}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          >
            <Route
              path="/story/read/:id"
              element={
                <ReadTheStory
                  currentTheme={currentTheme}
                  darkMode={darkMode}
                  THEMES={theme}
                />
              }
            />
          </Route>

          {/* ================= Routes بدون Header و Footer ================= */}
          <Route
            element={
              <Layout
                showHeader={false}
                showFooter={false}
                currentTheme={currentTheme}
                setCurrentTheme={setCurrentTheme}
                darkMode={darkMode}
                setDarkMode={setDarkMode}
              />
            }
          >
            <Route
              path="/story/:id"
              element={
                <StoryDetails
                  currentTheme={currentTheme}
                  darkMode={darkMode}
                  THEMES={theme}
                />
              }
            />

            <Route path="/story/StoryLunch" element={<StoryLunch />} />
            <Route path="/story/listen/:id" element={<StoryLunch />} />
            <Route path="/storyApp" element={<Home />} />

            {/* صفحة الملفات الشخصية غير موجودة حاليا */}
            {/* <Route path="/profiles" element={<ChildProfilesPage />} /> */}

            {/* ⭐ ROUTE تقييم النطق */}
            <Route
              path="/speech-evaluation/:id"
              element={<StoryLunch />}
            />
          </Route>

          {/* ================= 404 Page ================= */}
          <Route
            path="*"
            element={
              <div className="min-h-screen flex items-center justify-center text-center">
                <div>
                  <div className="text-6xl mb-4">🤔</div>
                  <h1 className="text-3xl font-bold mb-2">Page Not Found</h1>
                  <a href="/" className="text-purple-600 underline">
                    Retour à l'accueil
                  </a>
                </div>
              </div>
            }
          />

        </Routes>
      </Suspense>
    </BrowserRouter>
  );
}

export default App;
