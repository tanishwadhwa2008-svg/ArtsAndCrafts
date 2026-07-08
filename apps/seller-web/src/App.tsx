import { Route, Routes } from 'react-router-dom';
import { RedirectIfAuthed, RequireAuth } from './auth/guards.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ProductsPage } from './pages/ProductsPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { SettingsPage } from './pages/SettingsPage.js';

export default function App() {
  return (
    <Routes>
      <Route
        path="/login"
        element={
          <RedirectIfAuthed>
            <LoginPage />
          </RedirectIfAuthed>
        }
      />

      <Route element={<RequireAuth />}>
        <Route element={<AppLayout />}>
          <Route index element={<DashboardPage />} />
          <Route path="products" element={<ProductsPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
