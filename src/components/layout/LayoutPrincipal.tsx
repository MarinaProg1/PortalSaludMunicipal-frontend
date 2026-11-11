import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';
import { useAuth } from '../../context/AuthContext';
import type { UserRole } from '../../constants/menus';

const LayoutPrincipal = () => {
  const { rol } = useAuth();
  const userRole = ((rol || 'ADMIN').toUpperCase()) as UserRole;

  return (
    <div className="d-flex w-100 vh-100 bg-light text-dark overflow-hidden m-0 p-0">
      <Sidebar userRole={userRole} />

      <div className="flex-grow-1 d-flex flex-column h-100 overflow-auto m-0 p-0">
        <div className="d-lg-none" style={{ height: '56px' }}></div>

        <main className="flex-grow-1 p-4 w-100 bg-light">
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default LayoutPrincipal;
