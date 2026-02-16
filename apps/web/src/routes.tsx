import { Routes, Route } from "react-router-dom";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";
import { Main } from "./pages/Main";
import { Catalog } from "./pages/Catalog";
import { Lot } from "./pages/Lot";
import { AddLot } from "./pages/AddLot";
import { Profile } from "./pages/Profile";
import { Favorites } from "./pages/Favorites";
import { About } from "./pages/About";
import { Contacts } from "./pages/Contacts";
import { Login } from "./pages/Login";
import { Register } from "./pages/Register";

export function AppRoutes() {
  return (
    <Routes>
      <Route path="/" element={<Layout />}>
        <Route index element={<Main />} />
        <Route path="catalog" element={<Catalog />} />
        <Route path="catalog/:id" element={<Lot />} />
        <Route
          path="catalog/add"
          element={
            <ProtectedRoute>
              <AddLot />
            </ProtectedRoute>
          }
        />
        <Route
          path="profile"
          element={
            <ProtectedRoute>
              <Profile />
            </ProtectedRoute>
          }
        />
        <Route path="favorites" element={<Favorites />} />
        <Route path="about" element={<About />} />
        <Route path="contacts" element={<Contacts />} />
        <Route path="login" element={<Login />} />
        <Route path="register" element={<Register />} />
      </Route>
    </Routes>
  );
}
