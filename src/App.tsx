import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import Home from './pages/Home';
import ProjectsGrid from './pages/ProjectsGrid';
import ProjectDetail from './pages/ProjectDetail';
import GISLab from './pages/GISLab';
import Contact from './pages/Contact';
import MockupShowcase from './pages/MockupShowcase';

// Admin Pages
import AdminLayout from './components/admin/AdminLayout';
import AdminLogin from './pages/admin/Login';
import AdminDashboard from './pages/admin/Dashboard';
import AdminProjects from './pages/admin/Projects';
import AdminSettings from './pages/admin/Settings';
import AdminEnquiries from './pages/admin/Enquiries';
import ContentManager from './pages/admin/ContentManager';
import CVManager from './pages/admin/CVManager';
import AdminTestimonials from './pages/admin/Testimonials';
import MediaLibrary from './pages/admin/MediaLibrary';
import GISLabManager from './pages/admin/GISLabManager';
import GISToolsManager from './pages/admin/GISToolsManager';
import AdminSignup from './pages/admin/Signup';

import MainLayout from './components/MainLayout';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes with Nav/Footer */}
          <Route element={<MainLayout />}>
            <Route index element={<Home />} />
            <Route path="projects" element={<ProjectsGrid />} />
            <Route path="projects/:slug" element={<ProjectDetail />} />
            <Route path="gis-lab" element={<GISLab />} />
            <Route path="contact" element={<Contact />} />
          </Route>

          <Route path="/mockup" element={<MockupShowcase />} />

          {/* Login/Signup pages — public, standalone (no nav/footer) */}
          <Route path="/console/login" element={<AdminLogin />} />
          <Route path="/console/signup" element={<AdminSignup />} />

          {/* Protected Admin — all child routes require auth */}
          <Route path="/console" element={<AdminLayout />}>
            <Route index element={<AdminDashboard />} />
            <Route path="dashboard" element={<AdminDashboard />} />
            <Route path="content" element={<ContentManager />} />
            <Route path="projects" element={<AdminProjects />} />
            <Route path="testimonials" element={<AdminTestimonials />} />
            <Route path="media" element={<MediaLibrary />} />
            <Route path="gis-lab" element={<GISLabManager />} />
            <Route path="gis-tools" element={<GISToolsManager />} />
            <Route path="enquiries" element={<AdminEnquiries />} />
            <Route path="settings" element={<AdminSettings />} />
            <Route path="settings/cv" element={<CVManager />} />
          </Route>

          {/* Catch-all */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
