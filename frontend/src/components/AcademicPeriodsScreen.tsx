import { useState, useEffect } from "react";
import toast from "react-hot-toast";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "./ui/table";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from "./ui/dialog";
import { Badge } from "./ui/badge";
import { Alert, AlertDescription } from "./ui/alert";
import { Plus, Calendar, Clock, Loader2 } from "lucide-react";
import { ConfirmModal } from "./ui/confirm-modal";
import { LoadingSpinner } from "./ui/loading-spinner";
import { usePeriodos } from "../contexts/PeriodosContext";
import { usePagination } from "../hooks/usePagination";
import { TablePagination } from "./ui/table-pagination";

interface Periodo {
  id_periodo: number;
  codigo: string;
  fecha_inicio: string;
  fecha_fin: string;
  estado: "abierto" | "cerrado" | "planificado";
}

export function AcademicPeriodsScreen() {
  const {
    periodos: periods,
    loading,
    error,
    fetchPeriodos,
    createPeriodo,
    abrirPeriodo,
    cerrarPeriodo,
  } = usePeriodos();

  const [showNewPeriodDialog, setShowNewPeriodDialog] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [confirmOpenModalOpen, setConfirmOpenModalOpen] = useState(false);
  const [confirmCloseModalOpen, setConfirmCloseModalOpen] = useState(false);

  // Form states
  const [formData, setFormData] = useState({
    codigo: "",
    fecha_inicio: "",
    fecha_fin: "",
  });

  // Cargar periodos al montar el componente
  useEffect(() => {
    fetchPeriodos();
  }, [fetchPeriodos]);

  // Mostrar errores con toast
  useEffect(() => {
    if (error) {
      toast.error(error);
    }
  }, [error]);

  const handleCreatePeriod = async () => {
    if (!formData.codigo.trim() || !formData.fecha_inicio || !formData.fecha_fin) {
      toast.error("Todos los campos son requeridos");
      return;
    }

    setSubmitting(true);
    const loadingToast = toast.loading("Creando período académico...");

    try {
      await createPeriodo({
        codigo: formData.codigo,
        fecha_inicio: formData.fecha_inicio,
        fecha_fin: formData.fecha_fin,
      });

      toast.dismiss(loadingToast);
      toast.success("Período académico creado exitosamente");

      // Limpiar formulario y cerrar diálogo
      setFormData({ codigo: "", fecha_inicio: "", fecha_fin: "" });
      setShowNewPeriodDialog(false);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || "Error al crear el período académico";
      toast.error(errorMessage);
    } finally {
      setSubmitting(false);
    }
  };

  const confirmOpenNewPeriod = () => {
    // Buscar el primer periodo planificado
    const plannedPeriod = periods.find(p => p.estado === "planificado");

    if (!plannedPeriod) {
      toast.error("No hay períodos planificados para abrir");
      return;
    }

    setConfirmOpenModalOpen(true);
  };

  const handleOpenNewPeriod = async () => {
    // Buscar el primer periodo planificado
    const plannedPeriod = periods.find(p => p.estado === "planificado");
    if (!plannedPeriod) return;

    const loadingToast = toast.loading("Abriendo nuevo período...");

    try {
      // Cerrar el periodo actual si existe
      const currentPeriod = periods.find(p => p.estado === "abierto");
      if (currentPeriod) {
        await cerrarPeriodo(currentPeriod.id_periodo);
      }

      // Abrir el periodo planificado
      await abrirPeriodo(plannedPeriod.id_periodo);

      toast.dismiss(loadingToast);
      toast.success(`Período ${plannedPeriod.codigo} abierto exitosamente`);

      setConfirmOpenModalOpen(false);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || "Error al abrir el período";
      toast.error(errorMessage);
    }
  };

  const confirmCloseCurrentPeriod = () => {
    const currentPeriod = periods.find(p => p.estado === "abierto");

    if (!currentPeriod) {
      toast.error("No hay un período abierto actualmente");
      return;
    }

    setConfirmCloseModalOpen(true);
  };

  const handleCloseCurrentPeriod = async () => {
    const currentPeriod = periods.find(p => p.estado === "abierto");
    if (!currentPeriod) return;

    const loadingToast = toast.loading("Cerrando período actual...");

    try {
      await cerrarPeriodo(currentPeriod.id_periodo);

      toast.dismiss(loadingToast);
      toast.success(`Período ${currentPeriod.codigo} cerrado exitosamente`);

      setConfirmCloseModalOpen(false);
    } catch (err: any) {
      toast.dismiss(loadingToast);
      const errorMessage = err.response?.data?.message || "Error al cerrar el período";
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: "abierto" | "cerrado" | "planificado") => {
    const variants = {
      abierto: "bg-green-100 text-green-800",
      cerrado: "bg-red-100 text-red-800",
      planificado: "bg-blue-100 text-blue-800"
    };
    const statusNames = {
      abierto: "Abierto",
      cerrado: "Cerrado",
      planificado: "Planificado"
    };
    return (
      <Badge className={variants[status]}>
        {statusNames[status]}
      </Badge>
    );
  };

  // Aplicar paginación a los períodos
  const {
    currentPage,
    itemsPerPage,
    paginatedData: paginatedPeriods,
    setCurrentPage,
    setItemsPerPage,
  } = usePagination(periods, { initialItemsPerPage: 10 });

  const currentPeriod = periods.find(p => p.estado === "abierto");
  const plannedPeriod = periods.find(p => p.estado === "planificado");

  if (loading) {
    return <LoadingSpinner size="lg" message="Cargando períodos académicos..." fullScreen />;
  }

  return (
    <div className="space-y-6">

      {/* Current Period Alert */}
      {currentPeriod && (
        <Alert className="border-green-200 bg-green-50">
          <Calendar className="w-5 h-5 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Período Académico Actual:</strong> {currentPeriod.codigo}
            <br />
            El período transcurre desde {new Date(currentPeriod.fecha_inicio).toLocaleDateString()} hasta {new Date(currentPeriod.fecha_fin).toLocaleDateString()}
          </AlertDescription>
        </Alert>
      )}

      {/* Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Gestión de Períodos Académicos</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col sm:flex-row gap-4 items-center justify-between">
            <div className="flex flex-col sm:flex-row gap-4">
              <Button
                onClick={confirmOpenNewPeriod}
                className="bg-[#b71c1c] hover:bg-[#8f1616]"
                disabled={!periods.some(p => p.estado === "planificado")}
              >
                <Plus className="w-4 h-4 mr-2" />
                Abrir Nuevo Período
              </Button>
              <Button
                onClick={confirmCloseCurrentPeriod}
                variant="outline"
                disabled={!currentPeriod}
              >
                <Clock className="w-4 h-4 mr-2" />
                Cerrar Período Actual
              </Button>
            </div>

            <Dialog open={showNewPeriodDialog} onOpenChange={setShowNewPeriodDialog}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Calendar className="w-4 h-4 mr-2" />
                  Planificar Nuevo Período
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Planificar Nuevo Período Académico</DialogTitle>
                  <DialogDescription>
                    Configurar un nuevo período académico con fechas de inicio y fin.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="periodCode">Código del Período *</Label>
                    <Input
                      id="periodCode"
                      placeholder="ej., 2025-1"
                      value={formData.codigo}
                      onChange={(e) => setFormData({ ...formData, codigo: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="startDate">Fecha de Inicio *</Label>
                    <Input
                      id="startDate"
                      type="date"
                      value={formData.fecha_inicio}
                      onChange={(e) => setFormData({ ...formData, fecha_inicio: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="endDate">Fecha de Fin *</Label>
                    <Input
                      id="endDate"
                      type="date"
                      value={formData.fecha_fin}
                      onChange={(e) => setFormData({ ...formData, fecha_fin: e.target.value })}
                    />
                  </div>
                  <div className="flex gap-2 pt-4">
                    <Button
                      className="flex-1 bg-[#b71c1c] hover:bg-[#8f1616]"
                      onClick={handleCreatePeriod}
                      disabled={submitting}
                    >
                      {submitting ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Creando...
                        </>
                      ) : (
                        "Crear Período"
                      )}
                    </Button>
                    <Button
                      variant="outline"
                      className="flex-1"
                      onClick={() => {
                        setShowNewPeriodDialog(false);
                        setFormData({ codigo: "", fecha_inicio: "", fecha_fin: "" });
                      }}
                      disabled={submitting}
                    >
                      Cancelar
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardContent>
      </Card>

      {/* Periods Table */}
      <Card>
        <CardHeader>
          <CardTitle>Períodos Académicos</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Código</TableHead>
                <TableHead>Fecha de Inicio</TableHead>
                <TableHead>Fecha de Fin</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Duración</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {periods.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-gray-500 py-8">
                    No hay períodos registrados
                  </TableCell>
                </TableRow>
              ) : (
                paginatedPeriods.map((period) => {
                  const startDate = new Date(period.fecha_inicio);
                  const endDate = new Date(period.fecha_fin);
                  const durationDays = Math.ceil((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
                  const durationWeeks = Math.ceil(durationDays / 7);

                  return (
                    <TableRow key={period.id_periodo} className={period.estado === "abierto" ? "bg-green-50" : ""}>
                      <TableCell className="font-medium">{period.codigo}</TableCell>
                      <TableCell>{startDate.toLocaleDateString()}</TableCell>
                      <TableCell>{endDate.toLocaleDateString()}</TableCell>
                      <TableCell>{getStatusBadge(period.estado)}</TableCell>
                      <TableCell>{durationWeeks} semanas</TableCell>
                    </TableRow>
                  );
                })
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Paginación */}
      <TablePagination
        currentPage={currentPage}
        totalItems={periods.length}
        itemsPerPage={itemsPerPage}
        onPageChange={setCurrentPage}
        onItemsPerPageChange={setItemsPerPage}
      />

      {/* Period Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Total de Períodos</p>
                <p className="text-2xl font-bold text-gray-900">{periods.length}</p>
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
                <p className="text-sm text-gray-600">Períodos Abiertos</p>
                <p className="text-2xl font-bold text-green-600">
                  {periods.filter(p => p.estado === "abierto").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                <span className="text-green-600 text-xl">📖</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Periodos Cerrados</p>
                <p className="text-2xl font-bold text-red-600">
                  {periods.filter(p => p.estado === "cerrado").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center">
                <span className="text-red-600 text-xl">📚</span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600">Periodos Planeados</p>
                <p className="text-2xl font-bold text-blue-600">
                  {periods.filter(p => p.estado === "planificado").length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                <span className="text-blue-600 text-xl">📅</span>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Confirmation Modal for Opening Period */}
      <ConfirmModal
        isOpen={confirmOpenModalOpen}
        onClose={() => setConfirmOpenModalOpen(false)}
        onConfirm={handleOpenNewPeriod}
        title="Abrir Nuevo Período Académico"
        message={
          plannedPeriod
            ? `¿Estás seguro de que deseas abrir el período ${plannedPeriod.codigo}? ${
                currentPeriod ? `El período actual ${currentPeriod.codigo} se cerrará automáticamente.` : ""
              }`
            : "No hay períodos planificados para abrir."
        }
        confirmText="Abrir Período"
        cancelText="Cancelar"
      />

      {/* Confirmation Modal for Closing Period */}
      <ConfirmModal
        isOpen={confirmCloseModalOpen}
        onClose={() => setConfirmCloseModalOpen(false)}
        onConfirm={handleCloseCurrentPeriod}
        title="Cerrar Período Académico"
        message={
          currentPeriod
            ? `¿Estás seguro de que deseas cerrar el período ${currentPeriod.codigo}?`
            : "No hay un período abierto actualmente."
        }
        confirmText="Cerrar Período"
        cancelText="Cancelar"
        confirmVariant="destructive"
      />
    </div>
  );
}
