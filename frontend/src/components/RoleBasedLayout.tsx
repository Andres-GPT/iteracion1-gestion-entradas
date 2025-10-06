import { ReactNode, useState } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { ConfirmModal } from "./ui/confirm-modal";
import {
  Users,
  UserCheck,
  School,
  Calendar,
  Clock,
  User,
  LogOut,
  Search,
  BarChart3,
  Shield,
  Key,
  BookOpen,
  Eye,
} from "lucide-react";

interface RoleBasedLayoutProps {
  children: ReactNode;
  currentPage: string;
  userRole: string;
  onNavigate: (page: string) => void;
  onLogout: () => void;
}

const getMenuItemsForRole = (role: string) => {
  switch (role) {
    case "director":
      return [
        { id: "dashboard", label: "Panel Principal", icon: School },
        { id: "users", label: "Usuarios", icon: Users },
        { id: "classrooms", label: "Aulas", icon: School },
        { id: "periods", label: "Períodos Académicos", icon: Calendar },
        { id: "profile", label: "Perfil", icon: User },
      ];
    case "department-director":
      return [
        { id: "dashboard", label: "Panel Principal", icon: School },
        { id: "schedules", label: "Horarios", icon: Calendar },
        { id: "profile", label: "Perfil", icon: User },
      ];
    case "academic-assistant":
      return [
        { id: "dashboard", label: "Panel Principal", icon: School },
        { id: "profile", label: "Perfil", icon: User },
      ];
    case "guard":
      return [
        { id: "dashboard", label: "Panel Principal", icon: Shield },
        { id: "profile", label: "Perfil", icon: User },
      ];
    case "professor":
      return [
        { id: "dashboard", label: "Panel Principal", icon: BookOpen },
        { id: "profile", label: "Perfil", icon: User },
      ];
    default:
      return [
        { id: "dashboard", label: "Panel Principal", icon: School },
        { id: "profile", label: "Perfil", icon: User },
      ];
  }
};

const getRoleTitle = (role: string) => {
  switch (role) {
    case "director":
      return "Director de Programa";
    case "department-director":
      return "Director de Departamento";
    case "academic-assistant":
      return "Amigo Académico";
    case "guard":
      return "Vigilante";
    case "professor":
      return "Profesor";
    default:
      return "Administrador Universitario";
  }
};

const getPageTitle = (currentPage: string) => {
  switch (currentPage) {
    case "dashboard":
      return "Panel Principal";
    case "users":
      return "Gestión de Usuarios";
    case "visitors":
      return "Registro de Visitantes";
    case "classrooms":
      return "Gestión de Aulas";
    case "schedules":
      return "Gestión de Horarios";
    case "periods":
      return "Períodos Académicos";
    case "reports":
      return "Reportes";
    case "statistics":
      return "Estadísticas";
    case "attendance":
      return "Gestión de Asistencia";
    case "lending":
      return "Préstamo de Aulas";
    case "real-time":
      return "Asistencia en Tiempo Real";
    case "my-classes":
      return "Mis Clases";
    case "profile":
      return "Configuración de Perfil";
    default:
      return currentPage;
  }
};

export function RoleBasedLayout({
  children,
  currentPage,
  userRole,
  onNavigate,
  onLogout,
}: RoleBasedLayoutProps) {
  const [logoutModalOpen, setLogoutModalOpen] = useState(false);
  const menuItems = getMenuItemsForRole(userRole);
  const roleTitle = getRoleTitle(userRole);
  const pageTitle = getPageTitle(currentPage);

  const handleLogoutClick = () => {
    setLogoutModalOpen(true);
  };

  const handleConfirmLogout = () => {
    setLogoutModalOpen(false);
    onLogout();
  };

  return (
    <div className="min-h-screen bg-white flex">
      {/* Sidebar - Sticky sidebar that pushes content */}
      <div className="w-64 bg-gray-900 text-white flex flex-col min-h-screen sticky top-0 h-screen">
        <div className="p-4 border-b border-gray-700 flex-shrink-0">
          <h1 className="text-xl">Sistema Universitario</h1>
          <p className="text-gray-400 text-sm">{roleTitle}</p>
        </div>

        <nav className="flex-1 p-4 overflow-y-auto">
          <ul className="space-y-2">
            {menuItems.map((item) => {
              const Icon = item.icon;
              return (
                <li key={item.id}>
                  <button
                    onClick={() => onNavigate(item.id)}
                    className={`w-full flex items-center space-x-3 px-3 py-2 rounded-md transition-colors ${
                      currentPage === item.id
                        ? "bg-[#b71c1c] text-white"
                        : "text-gray-300 hover:bg-gray-800 hover:text-white"
                    }`}
                  >
                    <Icon className="w-5 h-5" />
                    <span>{item.label}</span>
                  </button>
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="p-4 border-t border-gray-700 flex-shrink-0">
          <button
            onClick={handleLogoutClick}
            className="w-full flex items-center space-x-3 px-3 py-2 rounded-md text-gray-300 hover:bg-gray-800 hover:text-white transition-colors"
          >
            <LogOut className="w-5 h-5" />
            <span>Cerrar Sesión</span>
          </button>
        </div>
      </div>

      {/* Main Content - No margin needed, sidebar pushes content naturally */}
      <div className="flex-1 flex flex-col">
        {/* Page Content */}
        <main className="flex-1 p-6 bg-gray-50 overflow-y-auto">
          {children}
        </main>
      </div>

      {/* Logout Confirmation Modal */}
      <ConfirmModal
        isOpen={logoutModalOpen}
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={handleConfirmLogout}
        title="Cerrar Sesión"
        message="¿Estás seguro de que deseas cerrar sesión?"
        confirmText="Cerrar Sesión"
        cancelText="Cancelar"
        confirmVariant="destructive"
      />
    </div>
  );
}
