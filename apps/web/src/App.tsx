import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { AuthProvider } from "./auth/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AppRoutes } from "./routes";

import "./styles/index.css";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <FavoritesProvider>
            <AppRoutes />
          </FavoritesProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
