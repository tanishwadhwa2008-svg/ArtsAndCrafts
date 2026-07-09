import { Route, Routes } from 'react-router-dom';
import { RedirectIfAuthed, RequireAuth } from './auth/guards.js';
import { AppLayout } from './components/layout/AppLayout.js';
import { LoginPage } from './pages/LoginPage.js';
import { DashboardPage } from './pages/DashboardPage.js';
import { ProductsPage } from './pages/ProductsPage.js';
import { ProductFormPage } from './pages/products/ProductFormPage.js';
import { CategoriesPage } from './pages/CategoriesPage.js';
import { CollectionsPage } from './pages/CollectionsPage.js';
import { CollectionFormPage } from './pages/collections/CollectionFormPage.js';
import { HomepagePage } from './pages/HomepagePage.js';
import { PagesPage } from './pages/PagesPage.js';
import { PageEditorPage } from './pages/content/PageEditorPage.js';
import { InventoryPage } from './pages/InventoryPage.js';
import { SettingsPage } from './pages/SettingsPage.js';
import { ContactSettingsPage } from './pages/ContactSettingsPage.js';

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
          <Route path="products/new" element={<ProductFormPage />} />
          <Route path="products/:id/edit" element={<ProductFormPage />} />
          <Route path="categories" element={<CategoriesPage />} />
          <Route path="collections" element={<CollectionsPage />} />
          <Route path="collections/new" element={<CollectionFormPage />} />
          <Route path="collections/:id/edit" element={<CollectionFormPage />} />
          <Route path="homepage" element={<HomepagePage />} />
          <Route path="pages" element={<PagesPage />} />
          <Route path="pages/new" element={<PageEditorPage />} />
          <Route path="pages/:id/edit" element={<PageEditorPage />} />
          <Route path="inventory" element={<InventoryPage />} />
          <Route path="contact" element={<ContactSettingsPage />} />
          <Route path="settings" element={<SettingsPage />} />
        </Route>
      </Route>
    </Routes>
  );
}
