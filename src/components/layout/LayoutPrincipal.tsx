
import { Outlet } from 'react-router-dom';
import { Sidebar } from '../sidebar/Sidebar';


// NOTA PARA EL EQUIPO: 
// Cuando el módulo de autenticación esté listo, puedes reemplazar 
// este rol estático por la llamada real (ej: getSession() o tu AuthContext).
const LayoutPrincipal = () => {
    // Definimos un rol por defecto (ej. 'recepcionista' o 'admin') para que la UI renderice bien
    const userRole = 'ADMIN'; 

    return (
        // Contenedor principal en modo claro que ocupa toda la pantalla sin scroll general
        <div className="d-flex w-100 vh-100 bg-light text-dark overflow-hidden m-0 p-0">
            
            {/* 1. Sidebar lateral izquierdo (Fijo en escritorio, Offcanvas en móviles) */}
            <Sidebar userRole={userRole} />

            {/* 2. Contenedor derecho que abarca el resto de la pantalla */}
            <div className="flex-grow-1 d-flex flex-column h-100 overflow-auto m-0 p-0">
                
                {/* Espaciador superior en móviles para que el botón hamburguesa no tape el contenido */}
                <div className="d-lg-none" style={{ height: '56px' }}></div>

                {/* 3. Área dinámica donde se renderizan las sub-rutas */}
                <main className="flex-grow-1 p-1 w-100 bg-light">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default LayoutPrincipal;