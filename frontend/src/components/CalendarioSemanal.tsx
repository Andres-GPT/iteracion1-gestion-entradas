import { useMemo } from "react";
import { Badge } from "./ui/badge";

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

interface CalendarioSemanalProps {
  horarios: Horario[];
  tipo: "salon" | "profesor";
  titulo: string;
}

const DIAS = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
const HORAS = Array.from({ length: 17 }, (_, i) => i + 6); // 6 AM - 10 PM

// Función para generar color único por materia
const getColorForMateria = (codigoMateria: string): string => {
  const colors = [
    "bg-blue-100 text-blue-800 border-blue-300",
    "bg-green-100 text-green-800 border-green-300",
    "bg-yellow-100 text-yellow-800 border-yellow-300",
    "bg-purple-100 text-purple-800 border-purple-300",
    "bg-pink-100 text-pink-800 border-pink-300",
    "bg-indigo-100 text-indigo-800 border-indigo-300",
    "bg-red-100 text-red-800 border-red-300",
    "bg-orange-100 text-orange-800 border-orange-300",
    "bg-teal-100 text-teal-800 border-teal-300",
    "bg-cyan-100 text-cyan-800 border-cyan-300",
  ];

  // Hash simple basado en el código de materia
  const hash = codigoMateria.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  return colors[hash % colors.length];
};

export function CalendarioSemanal({ horarios, tipo, titulo }: CalendarioSemanalProps) {
  // Agrupar horarios por día
  const horariosPorDia = useMemo(() => {
    const grouped: { [key: string]: Horario[] } = {};
    DIAS.forEach(dia => {
      grouped[dia] = horarios.filter(h => h.dia_semana === dia);
    });
    return grouped;
  }, [horarios]);

  const getHoraNumber = (hora: string) => {
    return parseInt(hora.split(':')[0]);
  };

  // Verificar si una materia se dicta en este rango de hora
  const materiaDictadaEnRango = (horario: Horario, horaRango: number) => {
    const horaInicio = getHoraNumber(horario.hora_inicio);
    const horaFin = getHoraNumber(horario.hora_fin);
    // La materia se dicta si el rango está entre hora_inicio y hora_fin
    // Por ejemplo: si la materia es de 8:00 a 10:00, aparece en rangos 8-9 y 9-10
    return horaRango >= horaInicio && horaRango < horaFin;
  };

  return (
    <div className="space-y-4">
      <h3 className="text-lg font-semibold text-gray-900">{titulo}</h3>

      {horarios.length === 0 ? (
        <div className="border rounded-lg p-8 text-center text-gray-500">
          No hay horarios registrados para esta selección
        </div>
      ) : (
        <div className="border rounded-lg overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full border-collapse table-fixed">
              {/* Header */}
              <thead>
                <tr className="bg-gray-50">
                  <th className="p-3 text-sm font-semibold text-gray-700 border-r border-b text-left" style={{ width: '100px' }}>
                    Hora
                  </th>
                  {DIAS.map(dia => (
                    <th key={dia} className="p-3 text-sm font-semibold text-gray-700 text-center border-r border-b last:border-r-0" style={{ width: `${100/6}%` }}>
                      {dia}
                    </th>
                  ))}
                </tr>
              </thead>

              {/* Grid de horarios */}
              <tbody>
                {HORAS.map((hora) => {
                  const horaInicio = hora.toString().padStart(2, '0');
                  const horaFin = (hora + 1).toString().padStart(2, '0');

                  return (
                    <tr key={hora} className="border-b last:border-b-0" style={{ height: '60px' }}>
                      {/* Columna de hora con rango */}
                      <td className="p-2 text-xs text-gray-600 border-r align-top font-medium">
                        {`${horaInicio}:00 - ${horaFin}:00`}
                      </td>

                      {/* Columnas de días */}
                      {DIAS.map(dia => {
                        const horariosDelDia = horariosPorDia[dia] || [];
                        // Filtrar materias que se dictan en este rango de hora
                        const horariosEnEsteRango = horariosDelDia.filter(h =>
                          materiaDictadaEnRango(h, hora)
                        );

                        return (
                          <td key={`${dia}-${hora}`} className="border-r last:border-r-0 p-1 align-top">
                            {horariosEnEsteRango.map(horario => {
                              const colorClass = getColorForMateria(horario.grupo.materia.codigo);

                              return (
                                <div
                                  key={horario.id_horario}
                                  className={`border rounded p-2 text-xs ${colorClass} shadow-sm mb-1`}
                                >
                                  <div className="font-semibold truncate">
                                    {horario.grupo.materia.nombre}
                                  </div>
                                  <div className="text-xs opacity-90">
                                    Grupo {horario.grupo.codigo_grupo}
                                  </div>
                                  {tipo === "salon" ? (
                                    <div className="text-xs opacity-75 truncate">
                                      👨‍🏫 {horario.grupo.profesor.nombre}
                                    </div>
                                  ) : (
                                    <div className="text-xs opacity-75">
                                      🏫 {horario.salon.codigo}
                                    </div>
                                  )}
                                </div>
                              );
                            })}
                          </td>
                        );
                      })}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
