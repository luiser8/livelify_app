import { Fragment, Suspense } from 'react';
import { AppRouter } from './routes';

/**
 * Componente principal de la aplicación
 */
function App() {
  return (
    <Suspense fallback={
      <Fragment>Loading...</Fragment>
    }>
        <AppRouter />
    </Suspense>
  );
}

export default App;
