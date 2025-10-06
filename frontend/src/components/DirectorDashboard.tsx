import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Users, School, Calendar, BarChart3, UserCheck, ClipboardList } from "lucide-react";
import { Button } from "./ui/button";
import { useUsuarios } from "../contexts/UsuariosContext";
import { useSalones } from "../contexts/SalonesContext";
import { usePeriodos } from "../contexts/PeriodosContext";

interface DirectorDashboardProps {
  onNavigate?: (page: string) => void;
}

export function DirectorDashboard({ onNavigate }: DirectorDashboardProps) {
  const { usuarios } = useUsuarios();
  const { salones } = useSalones();
  const { periodos } = usePeriodos();

  // Calcular estadísticas reales
  const totalUsuarios = usuarios.filter(u => u.estado === "activo").length;
  const totalSalones = salones.filter(s => s.estado === "activo").length;
  const totalPeriodos = periodos.length;

  const stats = [
    {
      title: "Total Usuarios",
      value: totalUsuarios.toString(),
      description: "Usuarios activos",
      icon: Users,
      color: "bg-blue-500"
    },
    {
      title: "Aulas",
      value: totalSalones.toString(),
      description: "Salas disponibles",
      icon: School,
      color: "bg-purple-500"
    },
    {
      title: "Períodos Académicos",
      value: totalPeriodos.toString(),
      description: "Total de períodos",
      icon: Calendar,
      color: "bg-green-500"
    },
    {
      title: "Visitantes Activos",
      value: "23",
      description: "Actualmente en el edificio",
      icon: UserCheck,
      color: "bg-orange-500"
    }
  ];

  const quickActions = [
    { title: "Gestionar Usuarios", description: "Agregar o editar cuentas de estudiantes y profesores", icon: Users, page: "users" },
    { title: "Configurar Aulas", description: "Configurar disponibilidad de aulas", icon: School, page: "classrooms" },
    { title: "Períodos Académicos", description: "Configurar nuevos períodos académicos", icon: Calendar, page: "periods" },
    { title: "Ver Reportes", description: "Generar reportes del sistema", icon: BarChart3, page: null }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Bienvenido, Director</h1>
        <p>Gestiona las operaciones universitarias y monitorea el rendimiento del sistema</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {stats.map((stat, index) => {
          const Icon = stat.icon;
          return (
            <Card key={index}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  {stat.title}
                </CardTitle>
                <div className={`${stat.color} p-2 rounded-md`}>
                  <Icon className="h-4 w-4 text-white" />
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <p className="text-xs text-gray-500 mt-1">{stat.description}</p>
              </CardContent>
            </Card>
          );
        })}
      </div>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Acciones Rápidas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {quickActions.map((action, index) => {
              const Icon = action.icon;
              return (
                <Button
                  key={index}
                  variant="outline"
                  className="h-auto p-4 flex flex-col items-center gap-2 hover:bg-gray-50"
                  onClick={() => action.page && onNavigate?.(action.page)}
                  disabled={!action.page}
                >
                  <Icon className="h-6 w-6 text-primary" />
                  <div className="text-center">
                    <div className="font-medium">{action.title}</div>
                    <div className="text-xs text-gray-500 mt-1">{action.description}</div>
                  </div>
                </Button>
              );
            })}
          </div>
        </CardContent>
      </Card>

      {/* Recent Activities and System Status */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ClipboardList className="h-5 w-5" />
              Actividades Recientes
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {usuarios
                .sort((a, b) => new Date(b.creado_en).getTime() - new Date(a.creado_en).getTime())
                .slice(0, 4)
                .map((user, index) => {
                  const createdDate = new Date(user.creado_en);
                  const now = new Date();
                  const diffInMs = now.getTime() - createdDate.getTime();
                  const diffInDays = Math.floor(diffInMs / (1000 * 60 * 60 * 24));
                  const diffInHours = Math.floor(diffInMs / (1000 * 60 * 60));

                  let timeText = "";
                  if (diffInDays > 0) {
                    timeText = `hace ${diffInDays} día${diffInDays > 1 ? 's' : ''}`;
                  } else if (diffInHours > 0) {
                    timeText = `hace ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`;
                  } else {
                    timeText = "hace menos de 1 hora";
                  }

                  return (
                    <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                      <div>
                        <p className="font-medium text-gray-900">Usuario registrado</p>
                        <p className="text-sm text-gray-500">{user.nombre}</p>
                      </div>
                      <span className="text-xs text-gray-400">{timeText}</span>
                    </div>
                  );
                })}
              {usuarios.length === 0 && (
                <p className="text-sm text-gray-500 text-center py-4">No hay actividades recientes</p>
              )}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Resumen del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuarios Activos</span>
                <span className="text-sm font-medium text-green-600">{usuarios.filter(u => u.estado === "activo").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuarios Inactivos</span>
                <span className="text-sm font-medium text-gray-600">{usuarios.filter(u => u.estado === "inactivo").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Salones Activos</span>
                <span className="text-sm font-medium text-green-600">{salones.filter(s => s.estado === "activo").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Períodos Abiertos</span>
                <span className="text-sm font-medium text-green-600">{periodos.filter(p => p.estado === "abierto").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Estado General</span>
                <span className="text-sm font-medium text-green-600">Operacional</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}