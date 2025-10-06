import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Shield, Key, UserCheck, Clock, AlertTriangle } from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";

interface GuardDashboardProps {
  onNavigate?: (page: string) => void;
}

export function GuardDashboard({ onNavigate }: GuardDashboardProps) {
  // Removed stats as requested

  const activeLoanedClassrooms = [
    { room: "A-101", requester: "Prof. García", purpose: "Extra Class", startTime: "14:00", endTime: "16:00", status: "active" },
    { room: "B-205", requester: "Student Council", purpose: "Meeting", startTime: "15:30", endTime: "17:00", status: "active" },
    { room: "C-301", requester: "Dr. Herrera", purpose: "Workshop", startTime: "13:00", endTime: "15:00", status: "overdue" },
    { room: "LAB-2", requester: "Engineering Club", purpose: "Project Work", startTime: "16:00", endTime: "18:00", status: "pending" }
  ];

  const quickActions = [
    { title: "Control de Acceso", description: "Gestión de entradas y salidas", icon: Key }
  ];

  return (
    <div className="space-y-6">
      {/* Welcome Section */}
      <div className="bg-primary text-primary-foreground p-6 rounded-lg">
        <h1 className="text-2xl font-bold mb-2">Panel del Vigilante</h1>
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

      
    </div>
  );
}