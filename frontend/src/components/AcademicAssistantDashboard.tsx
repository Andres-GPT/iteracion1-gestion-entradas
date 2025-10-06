import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { UserCheck, Clock, Users, CheckCircle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { useAuth } from "../contexts/AuthContext";

interface AcademicAssistantDashboardProps {
  onNavigate?: (page: string) => void;
}

export function AcademicAssistantDashboard({ onNavigate }: AcademicAssistantDashboardProps) {
  const { user } = useAuth();

  const activeAttendanceSessions = [
    { course: "Advanced Mathematics", professor: "Dr. García", room: "A-101", present: 28, total: 30, status: "active" },
    { course: "Data Structures", professor: "Prof. Morales", room: "B-205", present: 22, total: 25, status: "active" },
    { course: "Physics Lab", professor: "Dr. Ruiz", room: "LAB-1", present: 15, total: 16, status: "active" },
    { course: "Software Engineering", professor: "Prof. Luna", room: "A-103", present: 0, total: 32, status: "pending" }
  ];

  const quickActions = [
    { title: "Gestión del Sistema", description: "Acceso a funciones principales", icon: UserCheck }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Panel del Amigo Académico</h1>
        <p>Bienvenido al sistema de gestión universitaria</p>
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

      {/* System Information */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <UserCheck className="h-5 w-5" />
            Información del Usuario
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="p-4 bg-gray-50 rounded-lg">
              <p className="text-sm text-gray-600">• Nombre: {user?.nombre || "N/A"}</p>
              <p className="text-sm text-gray-600">• Rol: {user?.rol || "N/A"}</p>
              <p className="text-sm text-gray-600">• Correo: {user?.correo || "N/A"}</p>
              <p className="text-sm text-gray-600">• Cédula: {user?.cedula || "N/A"}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}