import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "./theme/ThemeContext";
import { AuthProvider } from "./auth/AuthContext";
import { AuthModalProvider } from "./context/AuthModalContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { AppRoutes } from "./routes";

import "./styles/index.css";

export function App() {
  return (
    <BrowserRouter>
      <ThemeProvider>
        <AuthProvider>
          <AuthModalProvider>
            <FavoritesProvider>
              <AppRoutes />
            </FavoritesProvider>
          </AuthModalProvider>
        </AuthProvider>
      </ThemeProvider>
    </BrowserRouter>
  );
}
