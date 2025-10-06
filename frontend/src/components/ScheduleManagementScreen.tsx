import { useState, useRef, useEffect, useMemo } from "react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./ui/select";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Badge } from "./ui/badge";
import { Upload, Plus, FileText, Calendar, Filter, X, Edit2, Trash2, Eye, ArrowLeft } from "lucide-react";
import {
  importSchedulePDF,
  getAllHorarios,
  crearHorario,
  verificarDisponibilidadSalon,
  verificarDisponibilidadProfesor,
  actualizarHorario,
  eliminarHorario
} from "../services/horarioService";
import { getGruposActivos } from "../services/grupoService";
import { getSalones } from "../services/salonService";
import { TablePagination } from "./ui/table-pagination";
import { usePagination } from "../hooks/usePagination";
import toast from "react-hot-toast";
import { ConfirmModal } from "./ui/confirm-modal";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "./ui/dialog";
import { CalendarioSemanal } from "./CalendarioSemanal";
import { VistaMateria } from "./VistaMateria";

interface Horario {
  id_horario: number;
  dia_semana: string;
  hora_inicio: string;
  hora_fin: string;
  grupo: {
    id_grupo: number;
    codigo_grupo: string;
    materia: {
      codigo: string;
      nombre: string;
    };
    profesor: {
      cedula: string;
      codigo: string;
      nombre: string;
    };
    periodo: {
      id_periodo: number;
      codigo: string;
      estado: string;
    };
  };
  salon: {
    id_salon: number;
    codigo: string;
    nombre: string | null;
  };
}

interface Grupo {
  id_grupo: number;
  codigo_grupo: string;
  materia: {
    id_materia: number;
    codigo: string;
    nombre: string;
  };
  profesor: {
    cedula: string;
    codigo: string;
    nombre: string;
  };
  periodo: {
    id_periodo: number;
    codigo: string;
    estado: string;
  };
}

interface Salon {
  id_salon: number;
  codigo: string;
  nombre: string | null;
  estado: string;
}

export function ScheduleManagementScreen() {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Filtros
  const [filterDia, setFilterDia] = useState<string>("todos");
  const [filterProfesor, setFilterProfesor] = useState<string>("todos");
  const [filterSalon, setFilterSalon] = useState<string>("todos");
  const [filterMateria, setFilterMateria] = useState<string>("todos");

  // Manual form state
  const [grupos, setGrupos] = useState<Grupo[]>([]);
  const [salones, setSalones] = useState<Salon[]>([]);
  const [selectedGrupo, setSelectedGrupo] = useState<string>("");
  const [selectedProfesor, setSelectedProfesor] = useState<string>(""); // Profesor independiente
  const [selectedSalon, setSelectedSalon] = useState<string>("");
  const [selectedDia, setSelectedDia] = useState<string>("");
  const [duracion, setDuracion] = useState<number | null>(null); // Sin duración por defecto
  const [horaInicio, setHoraInicio] = useState<string>("");
  const [horaFin, setHoraFin] = useState<string>("");
  const [isCreating, setIsCreating] = useState(false);
  const [checkingAvailability, setCheckingAvailability] = useState(false);
  const [availableSlots, setAvailableSlots] = useState<string[]>([]);

  // Edit/Delete state
  const [editingHorario, setEditingHorario] = useState<Horario | null>(null);
  const [editModalOpen, setEditModalOpen] = useState(false);
  const [editSalon, setEditSalon] = useState<string>("");
  const [editDia, setEditDia] = useState<string>("");
  const [editDuracion, setEditDuracion] = useState<number | null>(null); // Sin duración por defecto
  const [editHoraInicio, setEditHoraInicio] = useState<string>("");
  const [editHoraFin, setEditHoraFin] = useState<string>("");
  const [checkingEditAvailability, setCheckingEditAvailability] = useState(false);
  const [editAvailableSlots, setEditAvailableSlots] = useState<string[]>([]);
  const [isUpdating, setIsUpdating] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [horarioToDelete, setHorarioToDelete] = useState<Horario | null>(null);

  // Vista interactiva state
  type VistaMode = "normal" | "calendario";
  type TipoVista = "salon" | "profesor" | "materia" | null;
  const [vistaActual, setVistaActual] = useState<VistaMode>("normal");
  const [vistaModalOpen, setVistaModalOpen] = useState(false);
  const [tipoVista, setTipoVista] = useState<TipoVista>(null);
  const [selectedVistaId, setSelectedVistaId] = useState<string>("");

  const fetchHorarios = async () => {
    try {
      setIsLoading(true);
      const response = await getAllHorarios();
      if (response.data.success) {
        setHorarios(response.data.data);
      }
    } catch (error) {
      console.error("Error al cargar horarios:", error);
      toast.error("Error al cargar horarios");
    } finally {
      setIsLoading(false);
    }
  };

  const fetchGruposActivos = async () => {
    try {
      const response = await getGruposActivos();
      if (response.data.success) {
        // Backend returns { periodo, grupos } structure
        const grupos = response.data.data?.grupos || [];
        setGrupos(Array.isArray(grupos) ? grupos : []);
      }
    } catch (error) {
      console.error("Error al cargar grupos:", error);
      toast.error("Error al cargar grupos activos");
      setGrupos([]); // Set empty array on error
    }
  };

  const fetchSalones = async () => {
    try {
      const response = await getSalones();
      if (response.data.success && Array.isArray(response.data.data)) {
        setSalones(response.data.data.filter((s: Salon) => s.estado === "activo"));
      }
    } catch (error) {
      console.error("Error al cargar salones:", error);
      toast.error("Error al cargar salones");
      setSalones([]); // Set empty array on error
    }
  };

  useEffect(() => {
    fetchHorarios();
    fetchGruposActivos();
    fetchSalones();
  }, []);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      if (file.type !== "application/pdf") {
        toast.error("Solo se permiten archivos PDF");
        return;
      }
      setPdfFile(file);
      toast.success(`Archivo seleccionado: ${file.name}`);
    }
  };

  const handleUpload = async () => {
    if (!pdfFile) {
      toast.error("Por favor selecciona un archivo PDF");
      return;
    }

    setIsUploading(true);
    const loadingToast = toast.loading("Procesando PDF y cargando horarios...");

    try {
      const response = await importSchedulePDF(pdfFile);
      toast.dismiss(loadingToast);

      if (response.data.success) {
        const { materiasCreadas, gruposCreados, horariosCreados, advertencias } = response.data.data;

        toast.success(
          `Importación exitosa:\n${materiasCreadas} materias, ${gruposCreados} grupos, ${horariosCreados} horarios creados`,
          { duration: 5000 }
        );

        if (advertencias && advertencias.length > 0) {
          toast.error(`Se encontraron ${advertencias.length} advertencias`, { duration: 4000 });
          console.warn("Advertencias:", advertencias);
        }

        // Limpiar archivo seleccionado
        setPdfFile(null);
        if (fileInputRef.current) {
          fileInputRef.current.value = "";
        }

        // Recargar horarios
        fetchHorarios();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Error al procesar el archivo PDF");
      console.error("Error al importar horarios:", error);
    } finally {
      setIsUploading(false);
    }
  };

  // Generar slots de tiempo (6am - 10pm, cada hora)
  const generateTimeSlots = () => {
    const slots = [];
    for (let hour = 6; hour <= 22; hour++) {
      const hourStr = hour.toString().padStart(2, '0');
      slots.push(`${hourStr}:00`);
    }
    return slots;
  };

  // Auto-seleccionar el profesor del grupo cuando se selecciona un grupo
  useEffect(() => {
    if (selectedGrupo) {
      const grupo = grupos.find((g) => g.id_grupo === parseInt(selectedGrupo));
      if (grupo) {
        setSelectedProfesor(grupo.profesor.cedula);
      }
    } else {
      setSelectedProfesor("");
    }
  }, [selectedGrupo, grupos]);

  // Verificar disponibilidad cuando cambien grupo, salón, día, duración o profesor
  useEffect(() => {
    const checkAvailability = async () => {
      if (!selectedGrupo || !selectedSalon || !selectedDia || !duracion || !selectedProfesor) {
        setAvailableSlots([]);
        return;
      }

      const grupo = grupos.find((g) => g.id_grupo === parseInt(selectedGrupo));
      if (!grupo) return;

      setCheckingAvailability(true);
      const allSlots = generateTimeSlots();
      const available: string[] = [];

      try {
        // Verificar cada slot según la duración seleccionada
        for (let i = 0; i < allSlots.length - duracion; i++) {
          const inicio = allSlots[i];
          const fin = allSlots[i + duracion] || "22:00";

          // Verificar disponibilidad de salón
          const salonResponse = await verificarDisponibilidadSalon(parseInt(selectedSalon), {
            dia: selectedDia,
            hora_inicio: inicio,
            hora_fin: fin,
            id_periodo: grupo.periodo.id_periodo,
          });

          // Verificar disponibilidad de profesor (usar el profesor seleccionado)
          const profesorResponse = await verificarDisponibilidadProfesor(selectedProfesor, {
            dia: selectedDia,
            hora_inicio: inicio,
            hora_fin: fin,
            id_periodo: grupo.periodo.id_periodo,
          });

          if (salonResponse.data.disponible && profesorResponse.data.disponible) {
            available.push(`${inicio} - ${fin}`);
          }
        }

        setAvailableSlots(available);
      } catch (error) {
        console.error("Error al verificar disponibilidad:", error);
        toast.error("Error al verificar disponibilidad");
      } finally {
        setCheckingAvailability(false);
      }
    };

    checkAvailability();
  }, [selectedGrupo, selectedSalon, selectedDia, duracion, selectedProfesor, grupos]);

  const handleSelectTimeSlot = (slot: string) => {
    const [inicio, fin] = slot.split(" - ");
    // Toggle: si ya está seleccionado, deseleccionar
    if (horaInicio === inicio && horaFin === fin) {
      setHoraInicio("");
      setHoraFin("");
    } else {
      setHoraInicio(inicio);
      setHoraFin(fin);
    }
  };

  const handleCreateHorario = async () => {
    if (!selectedGrupo || !selectedSalon || !selectedDia || !horaInicio || !horaFin || !selectedProfesor) {
      toast.error("Por favor selecciona un horario disponible");
      return;
    }

    setIsCreating(true);
    const loadingToast = toast.loading("Creando horario...");

    try {
      const response = await crearHorario({
        id_grupo: parseInt(selectedGrupo),
        id_salon: parseInt(selectedSalon),
        dia_semana: selectedDia,
        hora_inicio: horaInicio,
        hora_fin: horaFin,
        cedula_profesor: selectedProfesor, // Enviar el profesor seleccionado
      });

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success("Horario creado exitosamente");
        // Limpiar formulario
        setSelectedGrupo("");
        setSelectedProfesor("");
        setSelectedSalon("");
        setSelectedDia("");
        setDuracion(null);
        setHoraInicio("");
        setHoraFin("");
        setAvailableSlots([]);
        // Recargar horarios
        fetchHorarios();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Error al crear horario");
      console.error("Error al crear horario:", error);
    } finally {
      setIsCreating(false);
    }
  };

  // Verificar disponibilidad en edición cuando cambien salón, día o duración
  useEffect(() => {
    const checkEditAvailability = async () => {
      if (!editingHorario || !editSalon || !editDia || !editDuracion) {
        setEditAvailableSlots([]);
        return;
      }

      setCheckingEditAvailability(true);
      const allSlots = generateTimeSlots();
      const available: string[] = [];

      try {
        // Verificar cada slot según la duración seleccionada
        for (let i = 0; i < allSlots.length - editDuracion; i++) {
          const inicio = allSlots[i];
          const fin = allSlots[i + editDuracion] || "22:00";

          // Verificar disponibilidad de salón (excluyendo horario actual)
          const salonResponse = await verificarDisponibilidadSalon(parseInt(editSalon), {
            dia: editDia,
            hora_inicio: inicio,
            hora_fin: fin,
            id_periodo: editingHorario.grupo.periodo.id_periodo,
            id_horario_excluir: editingHorario.id_horario,
          });

          // Verificar disponibilidad de profesor (excluyendo horario actual)
          const profesorResponse = await verificarDisponibilidadProfesor(editingHorario.grupo.profesor.cedula, {
            dia: editDia,
            hora_inicio: inicio,
            hora_fin: fin,
            id_periodo: editingHorario.grupo.periodo.id_periodo,
            id_horario_excluir: editingHorario.id_horario,
          });

          if (salonResponse.data.disponible && profesorResponse.data.disponible) {
            available.push(`${inicio} - ${fin}`);
          }
        }

        setEditAvailableSlots(available);
      } catch (error) {
        console.error("Error al verificar disponibilidad:", error);
      } finally {
        setCheckingEditAvailability(false);
      }
    };

    if (editModalOpen) {
      checkEditAvailability();
    }
  }, [editSalon, editDia, editDuracion, editingHorario, editModalOpen]);

  const handleEditClick = (horario: Horario) => {
    setEditingHorario(horario);
    setEditSalon(horario.salon.id_salon.toString());
    setEditDia(horario.dia_semana);
    setEditHoraInicio(horario.hora_inicio);
    setEditHoraFin(horario.hora_fin);
    // Calcular duración actual
    const inicio = parseInt(horario.hora_inicio.split(':')[0]);
    const fin = parseInt(horario.hora_fin.split(':')[0]);
    setEditDuracion(fin - inicio);
    setEditModalOpen(true);
  };

  const handleSelectEditTimeSlot = (slot: string) => {
    const [inicio, fin] = slot.split(" - ");
    // Toggle: si ya está seleccionado, deseleccionar
    if (editHoraInicio === inicio && editHoraFin === fin) {
      setEditHoraInicio("");
      setEditHoraFin("");
    } else {
      setEditHoraInicio(inicio);
      setEditHoraFin(fin);
    }
  };

  const handleUpdateHorario = async () => {
    if (!editingHorario || !editSalon || !editDia || !editHoraInicio || !editHoraFin) {
      toast.error("Por favor selecciona un horario disponible");
      return;
    }

    setIsUpdating(true);
    const loadingToast = toast.loading("Actualizando horario...");

    try {
      const response = await actualizarHorario(editingHorario.id_horario, {
        id_salon: parseInt(editSalon),
        dia_semana: editDia,
        hora_inicio: editHoraInicio,
        hora_fin: editHoraFin,
      });

      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success("Horario actualizado exitosamente");
        setEditModalOpen(false);
        setEditingHorario(null);
        setEditAvailableSlots([]);
        fetchHorarios();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Error al actualizar horario");
      console.error("Error al actualizar horario:", error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDeleteHorario = async () => {
    if (!horarioToDelete) return;

    const loadingToast = toast.loading("Eliminando horario...");

    try {
      const response = await eliminarHorario(horarioToDelete.id_horario);
      toast.dismiss(loadingToast);

      if (response.data.success) {
        toast.success("Horario eliminado exitosamente");
        setDeleteConfirmOpen(false);
        setHorarioToDelete(null);
        fetchHorarios();
      }
    } catch (error: any) {
      toast.dismiss(loadingToast);
      toast.error(error.response?.data?.message || "Error al eliminar horario");
      console.error("Error al eliminar horario:", error);
    }
  };

  const handleOpenVistaInteractiva = () => {
    setVistaModalOpen(true);
  };

  const handleConfirmVistaInteractiva = () => {
    if (!tipoVista || !selectedVistaId) {
      toast.error("Por favor selecciona una opción");
      return;
    }
    setVistaActual("calendario");
    setVistaModalOpen(false);
    toast.success("Vista interactiva activada");
  };

  const handleVolverVistaNormal = () => {
    setVistaActual("normal");
    setTipoVista(null);
    setSelectedVistaId("");
    toast.success("Vista normal restaurada");
  };

  const getDayBadge = (day: string) => {
    const colors: { [key: string]: string } = {
      Lunes: "bg-blue-100 text-blue-800",
      Martes: "bg-green-100 text-green-800",
      Miércoles: "bg-yellow-100 text-yellow-800",
      Jueves: "bg-purple-100 text-purple-800",
      Viernes: "bg-red-100 text-red-800",
      Sábado: "bg-orange-100 text-orange-800",
    };
    return (
      <Badge className={colors[day] || "bg-gray-100 text-gray-800"}>
        {day}
      </Badge>
    );
  };

  // Listas únicas para filtros
  const diasUnicos = useMemo(() => {
    const dias = new Set(horarios.map((h) => h.dia_semana));
    return Array.from(dias).sort();
  }, [horarios]);

  const profesoresUnicos = useMemo(() => {
    const profesores = horarios
      .map((h) => ({
        cedula: h.grupo?.profesor?.cedula,
        codigo: h.grupo?.profesor?.codigo,
        nombre: h.grupo?.profesor?.nombre
      }))
      .filter((p) => p.cedula);
    const uniqueMap = new Map(profesores.map((p) => [p.cedula, p]));
    return Array.from(uniqueMap.values()).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }, [horarios]);

  const salonesUnicos = useMemo(() => {
    const salones = horarios
      .map((h) => ({ codigo: h.salon?.codigo, nombre: h.salon?.nombre }))
      .filter((s) => s.codigo);
    const uniqueMap = new Map(salones.map((s) => [s.codigo, s]));
    return Array.from(uniqueMap.values()).sort((a, b) => (a.codigo || "").localeCompare(b.codigo || ""));
  }, [horarios]);

  const materiasUnicas = useMemo(() => {
    const materias = horarios
      .map((h) => ({ codigo: h.grupo?.materia?.codigo, nombre: h.grupo?.materia?.nombre }))
      .filter((m) => m.codigo);
    const uniqueMap = new Map(materias.map((m) => [m.codigo, m]));
    return Array.from(uniqueMap.values()).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }, [horarios]);

  // Aplicar filtros
  const horariosFiltrados = useMemo(() => {
    return horarios.filter((horario) => {
      if (filterDia !== "todos" && horario.dia_semana !== filterDia) return false;
      if (filterProfesor !== "todos" && horario.grupo?.profesor?.codigo !== filterProfesor) return false;
      if (filterSalon !== "todos" && horario.salon?.codigo !== filterSalon) return false;
      if (filterMateria !== "todos" && horario.grupo?.materia?.codigo !== filterMateria) return false;
      return true;
    });
  }, [horarios, filterDia, filterProfesor, filterSalon, filterMateria]);

  // Paginación
  const {
    currentPage,
    itemsPerPage,
    paginatedData: horariosPaginados,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(horariosFiltrados, { initialItemsPerPage: 10 });

  // Limpiar filtros
  const limpiarFiltros = () => {
    setFilterDia("todos");
    setFilterProfesor("todos");
    setFilterSalon("todos");
    setFilterMateria("todos");
  };

  const filtrosActivos = [filterDia, filterProfesor, filterSalon, filterMateria].filter((f) => f !== "todos").length;

  // Get professor from selected grupo
  const selectedGrupoData = useMemo(() => {
    if (!selectedGrupo) return null;
    return grupos.find((g) => g.id_grupo === parseInt(selectedGrupo)) || null;
  }, [selectedGrupo, grupos]);

  // Obtener lista de todos los profesores únicos del periodo activo
  const profesoresDelPeriodo = useMemo(() => {
    const profesores = grupos
      .map((g) => ({
        cedula: g.profesor.cedula,
        codigo: g.profesor.codigo,
        nombre: g.profesor.nombre,
      }))
      .filter((p) => p.cedula);
    const uniqueMap = new Map(profesores.map((p) => [p.cedula, p]));
    return Array.from(uniqueMap.values()).sort((a, b) => (a.nombre || "").localeCompare(b.nombre || ""));
  }, [grupos]);

  // Horarios filtrados para vista interactiva
  const horariosVista = useMemo(() => {
    if (vistaActual === "normal" || !tipoVista || !selectedVistaId) {
      return [];
    }

    if (tipoVista === "salon") {
      return horarios.filter(h => h.salon.id_salon === parseInt(selectedVistaId));
    } else if (tipoVista === "profesor") {
      return horarios.filter(h => h.grupo.profesor.cedula === selectedVistaId);
    } else if (tipoVista === "materia") {
      return horarios.filter(h => h.grupo.materia.codigo === selectedVistaId);
    }

    return [];
  }, [horarios, vistaActual, tipoVista, selectedVistaId]);

  // Título para la vista interactiva
  const tituloVista = useMemo(() => {
    if (!tipoVista || !selectedVistaId) return "";

    if (tipoVista === "salon") {
      const salon = salones.find(s => s.id_salon === parseInt(selectedVistaId));
      return `Horario del Salón ${salon?.codigo || selectedVistaId}`;
    } else if (tipoVista === "profesor") {
      const profesor = profesoresUnicos.find(p => p.cedula === selectedVistaId);
      return `Horario de ${profesor?.nombre || selectedVistaId}`;
    } else if (tipoVista === "materia") {
      const materia = materiasUnicas.find(m => m.codigo === selectedVistaId);
      return `Horarios de ${materia?.nombre || selectedVistaId}`;
    }

    return "";
  }, [tipoVista, selectedVistaId, salones, profesoresUnicos, materiasUnicas]);

  // Estadísticas calculadas
  const totalHorarios = horarios.length;
  const totalProfesores = profesoresUnicos.length;
  const totalSalones = salonesUnicos.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards - Moved to top */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total Horarios</p>
                <p className="text-2xl font-bold text-gray-900">{totalHorarios}</p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <Calendar className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Profesores Activos</p>
                <p className="text-2xl font-bold text-green-600">{totalProfesores}</p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">👨‍🏫</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Salones en Uso</p>
                <p className="text-2xl font-bold text-purple-600">{totalSalones}</p>
              </div>
              <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                <span className="text-purple-600 text-xl">🏫</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Gestión de Horarios</CardTitle>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="upload" className="space-y-6">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="upload">Upload Schedule</TabsTrigger>
              <TabsTrigger value="manual">Manual Entry</TabsTrigger>
            </TabsList>

            <TabsContent value="upload" className="space-y-4">
              <div className="border rounded-lg p-4">
                <div className="flex items-center gap-2 mb-3">
                  <Upload className="w-4 h-4 text-gray-600" />
                  <h3 className="text-sm font-medium">Importar desde PDF</h3>
                </div>

                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileChange}
                  className="hidden"
                  id="pdf-upload"
                  disabled={isUploading}
                />

                {isUploading ? (
                  <div className="border-2 border-dashed border-blue-300 bg-blue-50 rounded-lg p-6 text-center">
                    <div className="space-y-3">
                      <div className="w-12 h-12 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                      <div>
                        <p className="text-sm font-medium text-blue-900">Procesando PDF...</p>
                        <p className="text-xs text-blue-700">Esto puede tomar unos segundos</p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div
                    className="border-2 border-dashed border-gray-300 rounded-lg p-4 text-center hover:border-gray-400 transition-colors cursor-pointer"
                    onClick={() => fileInputRef.current?.click()}
                  >
                    <div className="flex items-center justify-center gap-4">
                      <div className="w-10 h-10 bg-gray-100 rounded-full flex items-center justify-center flex-shrink-0">
                        <FileText className="w-5 h-5 text-gray-400" />
                      </div>
                      <div className="text-left flex-1">
                        <p className="text-sm font-medium text-gray-700">
                          {pdfFile ? pdfFile.name : "Seleccionar archivo PDF"}
                        </p>
                        <p className="text-xs text-gray-500">Arrastra o haz clic para elegir</p>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                      >
                        Buscar
                      </Button>
                    </div>
                  </div>
                )}

                <div className="flex justify-end mt-3">
                  <Button
                    className="bg-[#b71c1c] hover:bg-[#8f1616]"
                    size="sm"
                    onClick={handleUpload}
                    disabled={!pdfFile || isUploading}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    {isUploading ? "Procesando..." : "Cargar Horarios"}
                  </Button>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="manual" className="space-y-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Plus className="w-5 h-5" />
                    <span>Crear Horario Manualmente</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="grupo">Materia y Grupo</Label>
                      <Select value={selectedGrupo} onValueChange={setSelectedGrupo} disabled={isCreating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione materia y grupo" />
                        </SelectTrigger>
                        <SelectContent>
                          {grupos.map((grupo) => (
                            <SelectItem key={grupo.id_grupo} value={grupo.id_grupo.toString()}>
                              {grupo.materia.nombre} - Grupo {grupo.codigo_grupo} ({grupo.materia.codigo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="profesor">Profesor</Label>
                      <Select
                        value={selectedProfesor}
                        onValueChange={setSelectedProfesor}
                        disabled={!selectedGrupo || isCreating}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione un profesor" />
                        </SelectTrigger>
                        <SelectContent>
                          {profesoresDelPeriodo.map((prof) => (
                            <SelectItem key={prof.cedula} value={prof.cedula}>
                              {prof.nombre} ({prof.codigo})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      {selectedProfesor && selectedGrupoData && selectedProfesor !== selectedGrupoData.profesor.cedula && (
                        <p className="text-xs text-orange-600">⚠️ Profesor diferente al asignado al grupo</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="dia">Día</Label>
                      <Select value={selectedDia} onValueChange={setSelectedDia} disabled={isCreating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione día" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="Lunes">Lunes</SelectItem>
                          <SelectItem value="Martes">Martes</SelectItem>
                          <SelectItem value="Miércoles">Miércoles</SelectItem>
                          <SelectItem value="Jueves">Jueves</SelectItem>
                          <SelectItem value="Viernes">Viernes</SelectItem>
                          <SelectItem value="Sábado">Sábado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="salon">Salón</Label>
                      <Select value={selectedSalon} onValueChange={setSelectedSalon} disabled={isCreating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione salón" />
                        </SelectTrigger>
                        <SelectContent>
                          {salones.map((salon) => (
                            <SelectItem key={salon.id_salon} value={salon.id_salon.toString()}>
                              {salon.codigo} - {salon.nombre || "Sin nombre"}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="duracion">Duración de la Clase</Label>
                      <Select value={duracion?.toString() || ""} onValueChange={(val) => setDuracion(parseInt(val))} disabled={isCreating}>
                        <SelectTrigger>
                          <SelectValue placeholder="Seleccione duración" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="1">1 hora</SelectItem>
                          <SelectItem value="2">2 horas</SelectItem>
                          <SelectItem value="3">3 horas</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2 md:col-span-2">
                      <Label htmlFor="horario">Horario Disponible</Label>
                      {checkingAvailability ? (
                        <div className="border rounded-md p-3 text-center text-sm text-gray-500">
                          <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                          Verificando disponibilidad...
                        </div>
                      ) : !selectedGrupo || !selectedSalon || !selectedDia || !duracion || !selectedProfesor ? (
                        <div className="border rounded-md p-3 text-center text-sm text-gray-500">
                          Selecciona materia, profesor, día, salón y duración primero
                        </div>
                      ) : availableSlots.length === 0 ? (
                        <div className="border rounded-md p-3 text-center text-sm text-red-600">
                          ⚠️ No hay horarios disponibles para esta combinación
                        </div>
                      ) : (
                        <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                          <div className="grid grid-cols-2 gap-2">
                            {availableSlots.map((slot) => (
                              <button
                                key={slot}
                                type="button"
                                onClick={() => handleSelectTimeSlot(slot)}
                                disabled={isCreating}
                                className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                                  `${horaInicio} - ${horaFin}` === slot
                                    ? "bg-blue-600 text-white border-blue-600"
                                    : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                                } disabled:opacity-50 disabled:cursor-not-allowed`}
                              >
                                {slot}
                              </button>
                            ))}
                          </div>
                        </div>
                      )}
                      {horaInicio && horaFin && (
                        <p className="text-sm text-green-600 flex items-center gap-1">
                          ✓ Horario seleccionado: {horaInicio} - {horaFin}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="flex justify-end mt-6">
                    <Button
                      className="bg-[#b71c1c] hover:bg-[#8f1616]"
                      onClick={handleCreateHorario}
                      disabled={isCreating}
                    >
                      <Plus className="w-4 h-4 mr-2" />
                      {isCreating ? "Creando..." : "Crear Horario"}
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>

      {/* Current Schedules */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="w-5 h-5" />
              <span>Horarios Registrados</span>
            </CardTitle>
            <div className="flex gap-2">
              {vistaActual === "normal" ? (
                <>
                  {filtrosActivos > 0 && (
                    <Button variant="outline" size="sm" onClick={limpiarFiltros}>
                      <X className="w-4 h-4 mr-1" />
                      Limpiar {filtrosActivos} {filtrosActivos === 1 ? "filtro" : "filtros"}
                    </Button>
                  )}
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleOpenVistaInteractiva}
                    className="bg-blue-50 hover:bg-blue-100 text-blue-700 border-blue-300"
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    Vista Interactiva
                  </Button>
                </>
              ) : (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleVolverVistaNormal}
                  className="bg-gray-50 hover:bg-gray-100"
                >
                  <ArrowLeft className="w-4 h-4 mr-1" />
                  Volver a Vista Normal
                </Button>
              )}
            </div>
          </div>

          {/* Filtros - Solo en vista normal */}
          {vistaActual === "normal" && (
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mt-4">
            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Día</Label>
              <Select value={filterDia} onValueChange={setFilterDia}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {diasUnicos.map((dia) => (
                    <SelectItem key={dia} value={dia}>
                      {dia}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Profesor</Label>
              <Select value={filterProfesor} onValueChange={setFilterProfesor}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {profesoresUnicos.map((prof) => (
                    <SelectItem key={prof.codigo} value={prof.codigo!}>
                      {prof.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Salón</Label>
              <Select value={filterSalon} onValueChange={setFilterSalon}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todos</SelectItem>
                  {salonesUnicos.map((salon) => (
                    <SelectItem key={salon.codigo} value={salon.codigo!}>
                      {salon.nombre || salon.codigo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-1">
              <Label className="text-xs text-gray-600">Materia</Label>
              <Select value={filterMateria} onValueChange={setFilterMateria}>
                <SelectTrigger className="h-9">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="todos">Todas</SelectItem>
                  {materiasUnicas.map((materia) => (
                    <SelectItem key={materia.codigo} value={materia.codigo!}>
                      {materia.nombre}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          )}
        </CardHeader>
        <CardContent className="p-6">
          {vistaActual === "normal" ? (
            // Vista normal - Tabla
            <div className="p-0 -m-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Course</TableHead>
                <TableHead>Teacher</TableHead>
                <TableHead>Classroom</TableHead>
                <TableHead>Day</TableHead>
                <TableHead>Time</TableHead>
                <TableHead>Semester</TableHead>
                <TableHead className="text-right">Acciones</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {isLoading ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8">
                    Cargando horarios...
                  </TableCell>
                </TableRow>
              ) : horariosFiltrados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-gray-500">
                    {horarios.length === 0
                      ? "No hay horarios registrados. Importa un archivo PDF para comenzar."
                      : "No se encontraron horarios con los filtros aplicados."}
                  </TableCell>
                </TableRow>
              ) : (
                horariosPaginados.map((horario) => (
                  <TableRow key={horario.id_horario}>
                    <TableCell className="font-medium">
                      {horario.grupo?.materia?.nombre || "N/A"}
                      <div className="text-xs text-gray-500">
                        {horario.grupo?.materia?.codigo}-{horario.grupo?.codigo_grupo}
                      </div>
                    </TableCell>
                    <TableCell>
                      {horario.grupo?.profesor?.nombre || "N/A"}
                      <div className="text-xs text-gray-500">
                        {horario.grupo?.profesor?.codigo}
                      </div>
                    </TableCell>
                    <TableCell>
                      {horario.salon?.nombre || horario.salon?.codigo || "N/A"}
                    </TableCell>
                    <TableCell>{getDayBadge(horario.dia_semana)}</TableCell>
                    <TableCell>
                      {horario.hora_inicio.slice(0, 5)} - {horario.hora_fin.slice(0, 5)}
                    </TableCell>
                    <TableCell>
                      <Badge variant="outline">
                        {horario.grupo?.periodo?.codigo || "N/A"}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(horario)}
                          className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
                        >
                          <Edit2 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setHorarioToDelete(horario);
                            setDeleteConfirmOpen(true);
                          }}
                          className="text-red-600 hover:text-red-700 hover:bg-red-50"
                        >
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
          {horariosFiltrados.length > 0 && (
            <div className="px-6 py-4 border-t -mx-6 -mb-6">
              <TablePagination
                currentPage={currentPage}
                totalItems={horariosFiltrados.length}
                itemsPerPage={itemsPerPage}
                onPageChange={setCurrentPage}
                onItemsPerPageChange={setItemsPerPage}
              />
            </div>
          )}
          </div>
          ) : (
            // Vista interactiva - Calendario o Materia
            <>
              {tipoVista === "materia" ? (
                <VistaMateria horarios={horariosVista} titulo={tituloVista} />
              ) : (
                <CalendarioSemanal
                  horarios={horariosVista}
                  tipo={tipoVista as "salon" | "profesor"}
                  titulo={tituloVista}
                />
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Vista Interactiva Modal */}
      <Dialog open={vistaModalOpen} onOpenChange={setVistaModalOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Vista Interactiva</DialogTitle>
            <DialogDescription>
              Selecciona cómo deseas visualizar los horarios
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Opción Salón */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="tipo-salon"
                  name="tipoVista"
                  checked={tipoVista === "salon"}
                  onChange={() => {
                    setTipoVista("salon");
                    setSelectedVistaId("");
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="tipo-salon" className="font-semibold cursor-pointer">
                  🏫 Por Salón
                </Label>
              </div>
              {tipoVista === "salon" && (
                <Select value={selectedVistaId} onValueChange={setSelectedVistaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un salón" />
                  </SelectTrigger>
                  <SelectContent>
                    {salones.map((salon) => (
                      <SelectItem key={salon.id_salon} value={salon.id_salon.toString()}>
                        {salon.codigo} - {salon.nombre || "Sin nombre"}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Opción Profesor */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="tipo-profesor"
                  name="tipoVista"
                  checked={tipoVista === "profesor"}
                  onChange={() => {
                    setTipoVista("profesor");
                    setSelectedVistaId("");
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="tipo-profesor" className="font-semibold cursor-pointer">
                  👨‍🏫 Por Profesor
                </Label>
              </div>
              {tipoVista === "profesor" && (
                <Select value={selectedVistaId} onValueChange={setSelectedVistaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione un profesor" />
                  </SelectTrigger>
                  <SelectContent>
                    {profesoresUnicos.map((prof) => (
                      <SelectItem key={prof.cedula} value={prof.cedula!}>
                        {prof.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>

            {/* Opción Materia */}
            <div className="space-y-2">
              <div className="flex items-center space-x-2">
                <input
                  type="radio"
                  id="tipo-materia"
                  name="tipoVista"
                  checked={tipoVista === "materia"}
                  onChange={() => {
                    setTipoVista("materia");
                    setSelectedVistaId("");
                  }}
                  className="w-4 h-4 text-blue-600"
                />
                <Label htmlFor="tipo-materia" className="font-semibold cursor-pointer">
                  📚 Por Materia
                </Label>
              </div>
              {tipoVista === "materia" && (
                <Select value={selectedVistaId} onValueChange={setSelectedVistaId}>
                  <SelectTrigger>
                    <SelectValue placeholder="Seleccione una materia" />
                  </SelectTrigger>
                  <SelectContent>
                    {materiasUnicas.map((materia) => (
                      <SelectItem key={materia.codigo} value={materia.codigo!}>
                        {materia.nombre}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setVistaModalOpen(false);
                setTipoVista(null);
                setSelectedVistaId("");
              }}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#b71c1c] hover:bg-[#8f1616]"
              onClick={handleConfirmVistaInteractiva}
              disabled={!tipoVista || !selectedVistaId}
            >
              Ver Calendario
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Modal */}
      <Dialog open={editModalOpen} onOpenChange={setEditModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Horario</DialogTitle>
            <DialogDescription>
              {editingHorario && (
                <>
                  {editingHorario.grupo?.materia?.nombre} - Grupo {editingHorario.grupo?.codigo_grupo}
                  <br />
                  Profesor: {editingHorario.grupo?.profesor?.nombre}
                </>
              )}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-dia">Día</Label>
              <Select value={editDia} onValueChange={setEditDia} disabled={isUpdating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="Lunes">Lunes</SelectItem>
                  <SelectItem value="Martes">Martes</SelectItem>
                  <SelectItem value="Miércoles">Miércoles</SelectItem>
                  <SelectItem value="Jueves">Jueves</SelectItem>
                  <SelectItem value="Viernes">Viernes</SelectItem>
                  <SelectItem value="Sábado">Sábado</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-salon">Salón</Label>
              <Select value={editSalon} onValueChange={setEditSalon} disabled={isUpdating}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {salones.map((salon) => (
                    <SelectItem key={salon.id_salon} value={salon.id_salon.toString()}>
                      {salon.codigo} - {salon.nombre || "Sin nombre"}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="edit-duracion">Duración de la Clase</Label>
              <Select value={editDuracion?.toString() || ""} onValueChange={(val) => setEditDuracion(parseInt(val))} disabled={isUpdating}>
                <SelectTrigger>
                  <SelectValue placeholder="Seleccione duración" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="1">1 hora</SelectItem>
                  <SelectItem value="2">2 horas</SelectItem>
                  <SelectItem value="3">3 horas</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="edit-horario">Horario Disponible</Label>
              {checkingEditAvailability ? (
                <div className="border rounded-md p-3 text-center text-sm text-gray-500">
                  <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-2"></div>
                  Verificando disponibilidad...
                </div>
              ) : !editSalon || !editDia || !editDuracion ? (
                <div className="border rounded-md p-3 text-center text-sm text-gray-500">
                  Selecciona día, salón y duración primero
                </div>
              ) : editAvailableSlots.length === 0 ? (
                <div className="border rounded-md p-3 text-center text-sm text-red-600">
                  ⚠️ No hay horarios disponibles para esta combinación
                </div>
              ) : (
                <div className="border rounded-md p-3 max-h-48 overflow-y-auto">
                  <div className="grid grid-cols-2 gap-2">
                    {editAvailableSlots.map((slot) => (
                      <button
                        key={slot}
                        type="button"
                        onClick={() => handleSelectEditTimeSlot(slot)}
                        disabled={isUpdating}
                        className={`px-3 py-2 text-sm rounded-md border transition-colors ${
                          `${editHoraInicio} - ${editHoraFin}` === slot
                            ? "bg-blue-600 text-white border-blue-600"
                            : "bg-white text-gray-700 border-gray-300 hover:bg-blue-50 hover:border-blue-300"
                        } disabled:opacity-50 disabled:cursor-not-allowed`}
                      >
                        {slot}
                      </button>
                    ))}
                  </div>
                </div>
              )}
              {editHoraInicio && editHoraFin && (
                <p className="text-sm text-green-600 flex items-center gap-1">
                  ✓ Horario seleccionado: {editHoraInicio} - {editHoraFin}
                </p>
              )}
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setEditModalOpen(false);
                setEditingHorario(null);
              }}
              disabled={isUpdating}
            >
              Cancelar
            </Button>
            <Button
              className="bg-[#b71c1c] hover:bg-[#8f1616]"
              onClick={handleUpdateHorario}
              disabled={isUpdating}
            >
              {isUpdating ? "Actualizando..." : "Guardar Cambios"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Modal */}
      <ConfirmModal
        isOpen={deleteConfirmOpen}
        onClose={() => {
          setDeleteConfirmOpen(false);
          setHorarioToDelete(null);
        }}
        onConfirm={handleDeleteHorario}
        title="Eliminar Horario"
        message={
          horarioToDelete
            ? `¿Estás seguro de que deseas eliminar el horario de ${horarioToDelete.grupo?.materia?.nombre} - Grupo ${horarioToDelete.grupo?.codigo_grupo} el ${horarioToDelete.dia_semana} de ${horarioToDelete.hora_inicio.slice(0, 5)} a ${horarioToDelete.hora_fin.slice(0, 5)}?`
            : ""
        }
        confirmText="Eliminar"
        confirmVariant="destructive"
      />
    </div>
  );
}