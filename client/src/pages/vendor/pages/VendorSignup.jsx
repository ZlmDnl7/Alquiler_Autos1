import { Link, useNavigate } from "react-router-dom";
import styles from "../../..";
import { useState } from "react";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  username: z.string().min(3, { message: "mínimo 3 caracteres requeridos" }),
  email: z
    .string()
    .min(1, { message: "email requerido" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Dirección de email inválida",
    }),
  password: z
    .string()
    .min(8, { message: "mínimo 8 caracteres requeridos" })
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/, {
      message: "La contraseña debe contener al menos una mayúscula, una minúscula, un número y un carácter especial",
    }),
  confirmPassword: z.string().min(1, { message: "confirmar contraseña requerido" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

function VendorSignup() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const [isError, setError] = useState(false);
  const [isLoading, setLoading] = useState(false);
  const navigate = useNavigate();

  const onSubmit = async (formData, e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch("/api/vendor/vendorsignup", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();
      setLoading(false);
      if (data.succes === false) {
        setError(true);
        return;
      }
      setError(false);
      navigate("/vendorSignin");
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <>
      <div
        className={`pb-10 max-w-lg mx-auto mt-16   rounded-lg overflow-hidden  shadow-2xl`}
      >
        <div
          className={`  bg-slate-950 px-6 py-2   rounded-t-lg flex justify-between items-center`}
        >
          <h1 className={`${styles.heading2} text-[28px] text-white`}>
            Registrarse <span className="text-[6px] text-white">como vendedor</span>
          </h1>
          <Link to={"/"}>
            <div className=" px-3  font-bold  hover:bg-slate-700 rounded-md  shadow-inner text-white">
              x
            </div>
          </Link>
        </div>

        <form
          onSubmit={handleSubmit(onSubmit)}
          className="flex flex-col gap-5 pt-10 px-5"
        >
          <div>
            <input
              type="text"
              id="username"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Nombre de Usuario"
              {...register("username")}
            />
            {errors.username && (
              <p className="text-red-500 text-[10px]">
                {errors.username.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="email"
              id="email"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Email"
              {...register("email")}
            />
            {errors.email && (
              <p className="text-red-500 text-[10px]">{errors.email.message}</p>
            )}
          </div>

          <div>
            <input
              type="password"
              id="password"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Contraseña"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-[10px]">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              id="confirmPassword"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Confirmar Contraseña"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-[10px]">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            className={`${styles.button} bg-slate-950 text-white  disabled:bg-slate-500 disabled:text-white`}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Registrarse"}
          </button>
          <div className="flex justify-between">
            <p className="text-[10px]">
              ¿Ya tienes cuenta?{" "}
              <span className="text-blue-600">
                {" "}
                <Link to={`/vendorsignin`}>Iniciar Sesión</Link>
              </span>
            </p>
            <p className="text-[10px] text-red-600">
              {isError && "something went wrong"}
            </p>
          </div>
        </form>

      </div>
    </>
  );
}

export default VendorSignup;
