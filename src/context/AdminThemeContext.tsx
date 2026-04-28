import { createContext, useContext, useEffect, useState, ReactNode } from 'react';

type AdminTheme = 'dark' | 'light';

interface AdminThemeContextType {
  adminTheme: AdminTheme;
  toggleAdminTheme: () => void;
}

const AdminThemeContext = createContext<AdminThemeContextType>({
  adminTheme: 'dark',
  toggleAdminTheme: () => {},
});

export const AdminThemeProvider = ({ children }: { children: ReactNode }) => {
  const [adminTheme, setAdminTheme] = useState<AdminTheme>(() => {
    return (localStorage.getItem('admin-theme') as AdminTheme) ?? 'dark';
  });

  useEffect(() => {
    localStorage.setItem('admin-theme', adminTheme);
    // Apply to admin container ONLY — not to <html>
    const adminRoot = document.getElementById('admin-root');
    if (adminRoot) {
      adminRoot.setAttribute('data-admin-theme', adminTheme);
    }
  }, [adminTheme]);

  const toggleAdminTheme = () =>
    setAdminTheme(prev => (prev === 'dark' ? 'light' : 'dark'));

  return (
    <AdminThemeContext.Provider value={{ adminTheme, toggleAdminTheme }}>
      {children}
    </AdminThemeContext.Provider>
  );
};

export const useAdminTheme = () => useContext(AdminThemeContext);
