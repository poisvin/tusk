import { BrowserRouter, Routes, Route } from 'react-router-dom';
import Layout from './components/Layout';
import DesktopLayout from './components/layouts/DesktopLayout';
import Today from './pages/Today';
import Dashboard from './pages/Dashboard';
import Calendar from './pages/Calendar';
import Notes from './pages/Notes';
import Settings from './pages/Settings';
import { useResponsive } from './hooks/useResponsive';

function AppRoutes() {
  const { isDesktop } = useResponsive();

  if (isDesktop) {
    return (
      <Routes>
        <Route path="/" element={<DesktopLayout />}>
          <Route index element={<Dashboard />} />
          <Route path="today" element={<Dashboard showRightSidebar={false} />} />
          <Route path="calendar" element={<Calendar />} />
          <Route path="notes" element={<Notes />} />
          <Route path="settings" element={<Settings />} />
        </Route>
      </Routes>
    );
  }

  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Today />} />
        <Route path="today" element={<Today />} />
        <Route path="calendar" element={<Calendar />} />
        <Route path="notes" element={<Notes />} />
        <Route path="settings" element={<Settings />} />
      </Route>
    </Routes>
  );
}

function App() {
  return (
    <BrowserRouter>
      <AppRoutes />
    </BrowserRouter>
  );
}

export default App;
