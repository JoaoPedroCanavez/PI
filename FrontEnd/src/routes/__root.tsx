import { createRootRoute, Outlet } from '@tanstack/react-router';

export const Route = createRootRoute({
  component: RootComponent,
});

function RootComponent() {
  return (
    <>
      {/* O Outlet é o espaço onde o TanStack Router vai injetar 
          as suas telas (index.tsx, aluno.tsx, instrutor.tsx) */}
      <Outlet />
    </>
  );
}