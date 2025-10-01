import { useState } from "react";
import styles from "../../index";
import { Link, useNavigate } from "react-router-dom";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

//zod validation schema
const schema = z.object({
  username: z.string().min(3, { message: "Mínimo 3 caracteres requeridos" }),
  email: z
    .string()
    .min(1, { message: "Email requerido" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Email inválido",
    }),
  password: z.string()
    .min(8, { message: "Mínimo 8 caracteres" })
    .regex(/[A-Z]/, { message: "Al menos una mayúscula" })
    .regex(/[a-z]/, { message: "Al menos una minúscula" })
    .regex(/[0-9]/, { message: "Al menos un número" })
    .regex(/[^A-Za-z0-9]/, { message: "Al menos un carácter especial" }),
  confirmPassword: z.string()
    .min(1, { message: "Confirma tu contraseña" }),
}).refine((data) => data.password === data.confirmPassword, {
  message: "Las contraseñas no coinciden",
  path: ["confirmPassword"],
});

function SignUp() {
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
      const res = await fetch("/api/auth/signup", {
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
      navigate("/signin");
    } catch (error) {
      setLoading(false);
      setError(true);
    }
  };

  return (
    <>
      <div
        className={`pb-10 max-w-lg mx-auto mt-16  rounded-lg overflow-hidden  shadow-2xl`}
      >
        <div
          className={` green px-6 py-2   rounded-t-lg flex justify-between items-center`}
        >
          <h1 className={`${styles.heading2} text-[28px]`}>Registrarse</h1>
          <Link to={"/"}>
            <div className=" px-3  font-bold  hover:bg-green-300 rounded-md  shadow-inner">
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
              <p className="text-red-500 text-[8px] pt-1">
                {" "}
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
              <p className="text-red-500 text-[8px] pt-1">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              id="password"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-[8px] pt-1">
                {errors.password.message}
              </p>
            )}
          </div>

          <div>
            <input
              type="password"
              id="confirmPassword"
              className="text-black bg-slate-100 p-3 rounded-md w-full"
              placeholder="Confirmar Password"
              {...register("confirmPassword")}
            />
            {errors.confirmPassword && (
              <p className="text-red-500 text-[8px] pt-1">
                {errors.confirmPassword.message}
              </p>
            )}
          </div>

          <button
            className={`${styles.button}  disabled:bg-slate-500 text-black disabled:text-white`}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Registrarse"}
          </button>
          <div className="flex justify-between">
            <p className="text-[10px]">
              ¿Ya tienes cuenta?{" "}
              <span className="text-blue-600">
                {" "}
                <Link to={`/signin`}>Iniciar Sesión</Link>
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

export default SignUp;
