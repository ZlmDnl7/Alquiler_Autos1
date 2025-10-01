import { useDispatch, useSelector } from "react-redux";
import { Link, useNavigate } from "react-router-dom";
import {
  signInFailure,
  signInStart,
  signInSuccess,
} from "../../../redux/user/userSlice";
import styles from "../../..";

import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

const schema = z.object({
  email: z
    .string()
    .min(1, { message: "email requerido" })
    .refine((value) => /\S+@\S+\.\S+/.test(value), {
      message: "Dirección de email inválida",
    }),
  password: z.string().min(1, { message: "contraseña requerida" }),
});

function VendorSignin() {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(schema) });

  const { isLoading, isError } = useSelector((state) => state.user);
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const onSubmit = async (formData, e) => {
    e.preventDefault();
    try {
      dispatch(signInStart());
      const res = await fetch("api/vendor/vendorsignin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });
      const data = await res.json();

      if (data.succes === false) {
        dispatch(signInFailure(data));
        return;
      }
      if (data.isVendor) {
        navigate("/vendorDashboard");
        dispatch(signInSuccess(data));
      }
    } catch (error) {
      dispatch(signInFailure(error));
    }
  };

  return (
    <>
      <div
        className={`pb-10 max-w-lg mx-auto mt-16  rounded-lg overflow-hidden  shadow-2xl`}
      >
        <div
          className={` bg-slate-950 px-6 py-2   rounded-t-lg flex justify-between items-center`}
        >
          <h1 className={`${styles.heading2}  text-normal text-white `}>
            Iniciar Sesión <span className="text-white text-[8px]">como vendedor</span>
          </h1>
          <Link to={"/"}>
            <div className=" px-3  font-bold  hover:bg-slate-600 rounded-md text-white  shadow-inner">
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
              placeholder="Password"
              {...register("password")}
            />
            {errors.password && (
              <p className="text-red-500 text-[10px]">
                {errors.password.message}
              </p>
            )}
          </div>

          <button
            className={`${styles.button} bg-slate-950 text-white  disabled:bg-slate-500 disabled:text-white`}
            disabled={isLoading}
          >
            {isLoading ? "Cargando..." : "Iniciar Sesión"}
          </button>
          <div className="flex justify-between">
            <div className="flex justify-between">
              <p className="text-[10px] border-r border-black">
                ¿No tienes cuenta?{" "}
                <span className="text-blue-600 pr-2">
                  {" "}
                  <Link to={`/vendorsignup`}>Registrarse</Link>
                </span>
              </p>
              <p className="text-[10px] pl-2 text-blue-600">olvidaste contraseña</p>
            </div>

            <p className="text-[10px] text-red-600">
              {isError ? isError.message || "something went wrong" : " "}
            </p>
          </div>
        </form>
        
      </div>
    </>
  );
}

export default VendorSignin;
