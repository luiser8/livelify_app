import { BottomNav } from '@/shared/components';

/**
 * Página de Projects (Proyectos)
 */
export const ProjectsPage = () => {
  return (
    <div className="min-h-screen bg-white flex flex-col pb-20">
      <header className="bg-white border-b border-gray-200 px-4 py-3">
        <h1 className="text-lg font-semibold text-gray-900">Projects</h1>
      </header>

      <main className="flex-1 p-6">
        <p className="text-gray-600">Your projects will appear here...</p>
      </main>

      <BottomNav />
    </div>
  );
};

