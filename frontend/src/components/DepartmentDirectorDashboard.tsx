import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Calendar, FileSpreadsheet, BarChart3, Users, Clock } from "lucide-react";
import { Button } from "./ui/button";
import { useUsuarios } from "../contexts/UsuariosContext";
import { useSalones } from "../contexts/SalonesContext";
import { usePeriodos } from "../contexts/PeriodosContext";

interface DepartmentDirectorDashboardProps {
  onNavigate?: (page: string) => void;
}

export function DepartmentDirectorDashboard({ onNavigate }: DepartmentDirectorDashboardProps) {
  const { usuarios } = useUsuarios();
  const { salones } = useSalones();
  const { periodos } = usePeriodos();

  // Obtener período activo
  const periodoActivo = periodos.find(p => p.estado === "abierto");
  const stats = [
    {
      title: "Horarios Activos",
      value: "128",
      description: "Este semestre",
      icon: Calendar,
      color: "bg-blue-500"
    },
    {
      title: "Facultad del Departamento",
      value: "34",
      description: "Profesores activos",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Clases Hoy",
      value: "23",
      description: "Sesiones programadas",
      icon: Clock,
      color: "bg-purple-500"
    }
  ];

  const quickActions = [
    { title: "Gestionar Horarios", description: "Ver y editar horarios de clases", icon: Calendar, page: "schedules" },
    { title: "Generar Reportes", description: "Reportes de rendimiento del departamento", icon: BarChart3, page: null },
    { title: "Importar Horarios", description: "Subir nuevos archivos de horarios", icon: FileSpreadsheet, page: "schedules" }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Panel del Director de Departamento</h1>
        <p>Gestiona horarios del departamento y asignaciones de facultad</p>
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

      {/* Today's Schedule and Recent Changes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Resumen de Horarios de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {[
                { course: "Advanced Mathematics", professor: "Dr. García", time: "08:00 - 09:30", room: "A-101" },
                { course: "Data Structures", professor: "Prof. Morales", time: "10:00 - 11:30", room: "B-205" },
                { course: "Database Systems", professor: "Dr. Herrera", time: "14:00 - 15:30", room: "C-301" },
                { course: "Software Engineering", professor: "Prof. Luna", time: "16:00 - 17:30", room: "A-103" }
              ].map((schedule, index) => (
                <div key={index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                  <div>
                    <p className="font-medium text-gray-900">{schedule.course}</p>
                    <p className="text-sm text-gray-500">{schedule.professor} • {schedule.room}</p>
                  </div>
                  <span className="text-sm text-gray-600">{schedule.time}</span>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Estadísticas del Sistema
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Total Usuarios</span>
                <span className="text-sm font-medium">{usuarios.length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Usuarios Activos</span>
                <span className="text-sm font-medium text-green-600">{usuarios.filter(u => u.estado === "activo").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Salones Disponibles</span>
                <span className="text-sm font-medium text-green-600">{salones.filter(s => s.estado === "activo").length}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-gray-600">Período Activo</span>
                <span className="text-sm font-medium">{periodoActivo ? periodoActivo.codigo : "Ninguno"}</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}