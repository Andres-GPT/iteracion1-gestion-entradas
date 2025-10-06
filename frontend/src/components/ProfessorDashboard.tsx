import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { BookOpen, Users, Clock, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useUsuarios } from "../contexts/UsuariosContext";

interface ProfessorDashboardProps {
  onNavigate?: (page: string) => void;
}

export function ProfessorDashboard({ onNavigate }: ProfessorDashboardProps) {
  const { usuarios } = useUsuarios();

  // Contar estudiantes (usuarios con rol "Estudiante")
  const totalEstudiantes = usuarios.filter(u => u.rol === "Estudiante" && u.estado === "activo").length;

  const stats = [
    {
      title: "Mis Clases",
      value: "6",
      description: "Este semestre",
      icon: BookOpen,
      color: "bg-blue-500"
    },
    {
      title: "Total Estudiantes",
      value: totalEstudiantes.toString(),
      description: "Activos en el sistema",
      icon: Users,
      color: "bg-green-500"
    },
    {
      title: "Clases Hoy",
      value: "3",
      description: "Sesiones programadas",
      icon: Clock,
      color: "bg-purple-500"
    },
    {
      title: "Tasa de Asistencia",
      value: "89%",
      description: "Promedio semanal",
      icon: CheckCircle,
      color: "bg-orange-500"
    }
  ];

  const todaysClasses = [
    { 
      course: "Advanced Mathematics", 
      time: "08:00 - 09:30", 
      room: "A-101", 
      students: 30, 
      present: 28, 
      status: "completed" 
    },
    { 
      course: "Calculus II", 
      time: "10:00 - 11:30", 
      room: "A-103", 
      students: 25, 
      present: 0, 
      status: "upcoming" 
    },
    { 
      course: "Linear Algebra", 
      time: "14:00 - 15:30", 
      room: "B-201", 
      students: 28, 
      present: 0, 
      status: "upcoming" 
    }
  ];

  const myClasses = [
    { course: "Advanced Mathematics", code: "MATH401", students: 30, schedule: "Mon, Wed, Fri 08:00" },
    { course: "Calculus II", code: "MATH302", students: 25, schedule: "Mon, Wed 10:00" },
    { course: "Linear Algebra", code: "MATH301", students: 28, schedule: "Tue, Thu 14:00" },
    { course: "Statistics", code: "MATH205", students: 35, schedule: "Tue, Thu 16:00" },
    { course: "Discrete Mathematics", code: "MATH204", students: 22, schedule: "Wed, Fri 14:00" },
    { course: "Mathematical Analysis", code: "MATH501", students: 16, schedule: "Mon, Fri 16:00" }
  ];

  const quickActions = [
    { title: "Iniciar Asistencia", description: "Abrir asistencia para próxima clase", icon: Clock },
    { title: "Ver Mis Clases", description: "Ver todos los cursos asignados", icon: BookOpen },
    { title: "Monitor en Tiempo Real", description: "Revisar asistencia actual", icon: Users }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Panel del Profesor</h1>
        <p>Gestiona tus clases y controla la asistencia estudiantil</p>
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

      {/* Today's Classes and My Classes */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5" />
              Clases de Hoy
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {todaysClasses.map((classItem, index) => (
                <div key={index} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="font-medium text-gray-900">{classItem.course}</h3>
                      <Badge variant={classItem.status === "completed" ? "default" : "secondary"}>
                        {classItem.status === "completed" ? "Completada" : "Próxima"}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">{classItem.time} • {classItem.room}</p>
                    {classItem.status === "completed" && (
                      <p className="text-sm text-gray-500">
                        Asistencia: {classItem.present}/{classItem.students} estudiantes
                      </p>
                    )}
                  </div>
                  <div>
                    {classItem.status === "upcoming" ? (
                      <Button size="sm" className="bg-primary hover:bg-primary/90">
                        Iniciar Sesión
                      </Button>
                    ) : (
                      <Button size="sm" variant="outline">
                        Ver Detalles
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BookOpen className="h-5 w-5" />
              Mis Clases
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {myClasses.map((classItem, index) => (
                <div key={index} className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0">
                  <div className="flex-1">
                    <h3 className="font-medium text-gray-900">{classItem.course}</h3>
                    <p className="text-sm text-gray-600">{classItem.code}</p>
                    <p className="text-sm text-gray-500">{classItem.schedule}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-medium text-gray-900">{classItem.students} estudiantes</p>
                    <Button size="sm" variant="ghost" className="text-primary hover:text-primary/80">
                      Ver →
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}