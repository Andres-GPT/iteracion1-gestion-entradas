import { useState, useEffect } from "react";
import { Toaster } from "react-hot-toast";
import { LoginScreen } from "./components/LoginScreen";
import { PasswordRecoveryScreen } from "./components/PasswordRecoveryScreen";
import { ResetPasswordScreen } from "./components/ResetPasswordScreen";
import { RoleBasedLayout } from "./components/RoleBasedLayout";

// Context Providers
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { UsuariosProvider } from "./contexts/UsuariosContext";
import { SalonesProvider } from "./contexts/SalonesContext";
import { PeriodosProvider } from "./contexts/PeriodosContext";

// Dashboard Components
import { DirectorDashboard } from "./components/DirectorDashboard";
import { DepartmentDirectorDashboard } from "./components/DepartmentDirectorDashboard";
import { AcademicAssistantDashboard } from "./components/AcademicAssistantDashboard";
import { GuardDashboard } from "./components/GuardDashboard";
import { ProfessorDashboard } from "./components/ProfessorDashboard";

// Screen Components
import { UserManagementScreen } from "./components/UserManagementScreen";
import { VisitorRegistrationScreen } from "./components/VisitorRegistrationScreen";
import { ProfileScreen } from "./components/ProfileScreen";
import { ClassroomManagementScreen } from "./components/ClassroomManagementScreen";
import { ScheduleManagementScreen } from "./components/ScheduleManagementScreen";
import { AcademicPeriodsScreen } from "./components/AcademicPeriodsScreen";

type Screen =
  | "login"
  | "password-recovery"
  | "reset-password"
  | "dashboard"
  | "users"
  | "visitors"
  | "profile"
  | "classrooms"
  | "schedules"
  | "periods"
  | "attendance"
  | "lending"
  | "real-time"
  | "my-classes"
  | "reports"
  | "statistics";

// Mapeo de roles del backend a roles del frontend
const roleMapping: Record<string, string> = {
  "Director Programa": "director",
  "Director Departamento": "department-director",
  Profesor: "professor",
  "Amigo Académico": "academic-assistant",
  Estudiante: "professor", // Por defecto mostramos dashboard de profesor
  Visitante: "professor",
  Vigilante: "guard",
};

function AppContent() {
  const { isAuthenticated, user, logout: authLogout } = useAuth();
  const [currentScreen, setCurrentScreen] = useState<Screen>("dashboard");
  const [resetToken, setResetToken] = useState<string>("");

  useEffect(() => {
    if (isAuthenticated) {
      setCurrentScreen("dashboard");
    } else {
      // Check if URL contains reset-password token
      const hash = window.location.hash;
      if (hash.startsWith("#/reset-password/")) {
        const token = hash.replace("#/reset-password/", "");
        if (token) {
          setResetToken(token);
          setCurrentScreen("reset-password");
        }
      }
    }
  }, [isAuthenticated]);

  const handleLoginSuccess = () => {
    setCurrentScreen("dashboard");
  };

  const handleLogout = async () => {
    await authLogout();
    setCurrentScreen("login");
  };

  const handleForgotPassword = () => {
    setCurrentScreen("password-recovery");
  };

  const handleBackToLogin = () => {
    window.location.hash = "";
    setResetToken("");
    setCurrentScreen("login");
  };

  const handleResetPasswordSuccess = () => {
    window.location.hash = "";
    setResetToken("");
    setCurrentScreen("login");
  };

  const handleNavigate = (page: string) => {
    setCurrentScreen(page as Screen);
  };

  // Authentication screens
  if (!isAuthenticated) {
    if (currentScreen === "reset-password" && resetToken) {
      return (
        <ResetPasswordScreen
          token={resetToken}
          onSuccess={handleResetPasswordSuccess}
          onBackToLogin={handleBackToLogin}
        />
      );
    }

    if (currentScreen === "password-recovery") {
      return <PasswordRecoveryScreen onBackToLogin={handleBackToLogin} />;
    }

    return (
      <LoginScreen
        onLoginSuccess={handleLoginSuccess}
        onForgotPassword={handleForgotPassword}
      />
    );
  }

  // Obtener el rol mapeado del usuario
  const userRoleMapped = user?.rol
    ? roleMapping[user.rol] || "professor"
    : "professor";

  // Role-based dashboard rendering
  const renderDashboard = () => {
    switch (userRoleMapped) {
      case "director":
        return <DirectorDashboard onNavigate={handleNavigate} />;
      case "department-director":
        return <DepartmentDirectorDashboard onNavigate={handleNavigate} />;
      case "academic-assistant":
        return <AcademicAssistantDashboard onNavigate={handleNavigate} />;
      case "guard":
        return <GuardDashboard onNavigate={handleNavigate} />;
      case "professor":
        return <ProfessorDashboard onNavigate={handleNavigate} />;
      default:
        return <DirectorDashboard onNavigate={handleNavigate} />;
    }
  };

  // Screen content rendering
  const renderContent = () => {
    switch (currentScreen) {
      case "dashboard":
        return renderDashboard();
      case "users":
        return <UserManagementScreen />;
      case "visitors":
        return <VisitorRegistrationScreen />;
      case "profile":
        return <ProfileScreen />;
      case "classrooms":
        return <ClassroomManagementScreen />;
      case "schedules":
        return <ScheduleManagementScreen />;
      case "periods":
        return <AcademicPeriodsScreen />;
      case "my-classes":
        return <ProfessorDashboard />;
      default:
        return renderDashboard();
    }
  };

  return (
    <RoleBasedLayout
      currentPage={currentScreen}
      userRole={userRoleMapped}
      onNavigate={handleNavigate}
      onLogout={handleLogout}
    >
      {renderContent()}
    </RoleBasedLayout>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <UsuariosProvider>
        <SalonesProvider>
          <PeriodosProvider>
            <Toaster
              position="top-center"
              toastOptions={{
                duration: 3000,
                style: {
                  background: "#363636",
                  color: "#fff",
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: "#4ade80",
                    secondary: "#fff",
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: "#ef4444",
                    secondary: "#fff",
                  },
                },
              }}
            />
            <AppContent />
          </PeriodosProvider>
        </SalonesProvider>
      </UsuariosProvider>
    </AuthProvider>
  );
}
