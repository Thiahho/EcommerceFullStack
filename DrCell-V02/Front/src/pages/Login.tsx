import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useAuthStore } from "@/store/auth-store";
import axios from "../config/axios";
import { toast } from "sonner";
import { Label } from "@radix-ui/react-label";

export const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { setUser } = useAuthStore();
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await axios.post("/Admin/login", formData);
      const { usuario, message, token, debug } = response.data;

      console.log("🔧 DEBUG Login Response:", debug);

      // 🔧 TEMP: Para desarrollo, usar token de la respuesta si no hay cookies
      if (token && process.env.NODE_ENV === "development") {
        localStorage.setItem("authToken", token);
        console.log(
          "🔧 TEMP: Token almacenado en localStorage para desarrollo"
        );
      }

      // 🔍 DEBUG: Verificar cookies después del login
      setTimeout(() => {
        const cookiesAfterLogin = document.cookie;
        console.log("🍪 Cookies después del login:", cookiesAfterLogin);
        const hasAuthCookie = cookiesAfterLogin.includes("AuthToken");
        console.log("🔍 Cookie AuthToken establecida:", hasAuthCookie);

        if (!hasAuthCookie) {
          console.log(
            "⚠️ ADVERTENCIA: Cookie no establecida, usando localStorage como respaldo"
          );
        }
      }, 100);

      // Actualizar el estado del usuario
      setUser({
        id: usuario.id,
        email: usuario.email,
        role: usuario.rol.toLowerCase(),
      });

      // Redirigir según el rol
      if (usuario.rol === "ADMIN") {
        navigate("/admin");
      } else {
        navigate("/dashboard");
      }

      toast.success(message || "Inicio de sesión exitoso");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Error al iniciar sesión");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-[#17436b]">
            Iniciar Sesión
          </h2>
        </div>
        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          <div className="rounded-md shadow-sm -space-y-px">
            <div>
              <Label htmlFor="email">Email</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                value={formData.email}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-t-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Email"
              />
            </div>
            <div>
              <Label htmlFor="password">Contraseña</Label>
              <Input
                id="password"
                name="password"
                type="password"
                required
                value={formData.password}
                onChange={handleChange}
                className="appearance-none rounded-none relative block w-full px-3 py-2 border border-gray-300 placeholder-gray-500 text-gray-900 rounded-b-md focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 focus:z-10 sm:text-sm"
                placeholder="Contraseña"
              />
            </div>
          </div>

          <div>
            <Button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-2xl text-white bg-[#17436b] hover:bg-[#0d2b4a] focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#17436b]"
            >
              {loading ? "Iniciando sesión..." : "Iniciar Sesión"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
};
