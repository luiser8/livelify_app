import { AppRouter } from './routes';
import { AuthProvider } from './features/auth/context';

/**
 * Componente principal de la aplicación
 */
function App() {
  return (
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  );
}

export default App;
