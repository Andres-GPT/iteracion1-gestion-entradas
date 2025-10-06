import { Badge } from "./ui/badge";
import { Card, CardContent } from "./ui/card";

interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  grupo: {
    codigo_grupo: string;
    materia: {
      codigo: string;
      nombre: string;
    };
    profesor: {
      codigo: string;
      nombre: string;
    };
  };
  salon: {
    codigo: string;
    nombre: string | null;
  };
}

interface VistaMateriaProps {
  horarios: Horario[];
  titulo: string;
}

const getDayColor = (day: string) => {
  const colors: { [key: string]: string } = {
    Lunes: "bg-blue-100 text-blue-800",
    Martes: "bg-green-100 text-green-800",
    Miércoles: "bg-yellow-100 text-yellow-800",
    Jueves: "bg-purple-100 text-purple-800",
    Viernes: "bg-red-100 text-red-800",
    Sábado: "bg-orange-100 text-orange-800",
  };
  return colors[day] || "bg-gray-100 text-gray-800";
};

export function VistaMateria({ horarios, titulo }: VistaMateriaProps) {
  // Agrupar horarios por grupo
  const horariosPorGrupo = horarios.reduce((acc, horario) => {
    const grupoKey = horario.grupo.codigo_grupo;
    if (!acc[grupoKey]) {
      acc[grupoKey] = [];
    }
    acc[grupoKey].push(horario);
    return acc;
  }, {} as { [key: string]: Horario[] });

  const grupos = Object.keys(horariosPorGrupo).sort();

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>

      {horarios.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No hay horarios registrados para esta materia
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {grupos.map(grupoKey => {
            const horariosGrupo = horariosPorGrupo[grupoKey];
            const primerHorario = horariosGrupo[0];

            return (
              <Card key={grupoKey} className="hover:shadow-lg transition-shadow">
                <CardContent className="p-4">
                  <div className="space-y-3">
                    {/* Header del grupo */}
                    <div className="border-b pb-2">
                      <h4 className="text-lg font-semibold text-gray-900">
                        Grupo {grupoKey}
                      </h4>
                      <p className="text-sm text-gray-600 flex items-center gap-1">
                        👨‍🏫 {primerHorario.grupo.profesor.nombre}
                      </p>
                      <p className="text-xs text-gray-500">
                        Código: {primerHorario.grupo.profesor.codigo}
                      </p>
                    </div>

                    {/* Horarios del grupo */}
                    <div className="space-y-2">
                      {horariosGrupo.map(horario => (
                        <div
                          key={horario.id_horario}
                          className="bg-gray-50 rounded-lg p-3 space-y-1"
                        >
                          <div className="flex items-center justify-between">
                            <Badge className={getDayColor(horario.dia_semana)}>
                              {horario.dia_semana}
                            </Badge>
                            <span className="text-xs text-gray-600">
                              {horario.hora_inicio.slice(0, 5)} - {horario.hora_fin.slice(0, 5)}
                            </span>
                          </div>
                          <div className="text-sm text-gray-700 flex items-center gap-1">
                            🏫 {horario.salon.nombre || horario.salon.codigo}
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Footer con total de sesiones */}
                    <div className="pt-2 border-t text-xs text-gray-500">
                      {horariosGrupo.length} {horariosGrupo.length === 1 ? 'sesión' : 'sesiones'} por semana
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}
