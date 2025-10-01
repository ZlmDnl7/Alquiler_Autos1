import styles from "../../index";
import Herocar from "../../Assets/homepage_car_copy.jpeg";

import { HeroParallax } from "../../components/ui/Paralax";


import Swal from "sweetalert2";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { setIsSweetAlert } from "../../redux/user/userSlice";
import Footers from "../../components/Footer";


function Home() {

  const { isSweetAlert } = useSelector((state) => state.user);
  const dispatch = useDispatch();
  const navigate = useNavigate()

  const sweetalert = () => {
    Swal.fire({
      
      show: true,
      title: "",
      text: "Vehículo Reservado Exitosamente",
      icon: "success",
      showDenyButton: true,
      confirmButtonText: "Ir al Inicio",
      confirmButtonColor:"#22c55e",
      denyButtonColor:'black',
      denyButtonText: `Ver Pedidos`,
    }).then((result) => {
      if (result.isConfirmed) {
        navigate('/')
      }
      else if(result.isDenied){
        navigate('/profile/orders')
      }
    })
    dispatch(setIsSweetAlert(false))
  };

  return (
    <>
      {isSweetAlert && sweetalert()}

      {/* This is div is the container for the dot background */}
      <div className="relative h-[100vh] w-full mx-auto sm:max-w-[900px] lg:max-w-[1500px] bg-white min-h-[72vh] md:min-h-[60vh] lg:min-h-[73vh]">
        <div
          className={`px-12 lg:px-28 absolute top-0   z-10 w-full   justify-between items-center flex flex-col  sm:flex-row mt-[50px] md:mt-[170px] gap-10`}
        >
          <div className="">
            <p className={`py-2 text-[9px] md:text-[12px] ${styles.paragraph}`}>
              Planifica tu viaje ahora
            </p>
            <h1
              className={` md:${styles.heading2} font-extrabold text-[35px] leading-10 lg:font-bold  mb-6  lg:text-[58px] lg:mb-6`}
            >
              Ahorra <span className="text-green-600">mucho</span> con nuestro <br />
              alquiler de autos
            </h1>
            <p className={`${styles.paragraph} text-justify`}>
              Alquila el auto de tus sueños. Precios inmejorables, kilómetros ilimitados,
              opciones de recogida flexibles y mucho más.
            </p>
            <div className=" mt-10  lg:mt-[40px] flex gap-3">
              <button
                onClick={() => navigate('/vehicles')}
                className="bg-green-600 hover:bg-green-700 text-white text-[12px] md:text-[16px] py-3 px-6 rounded-lg font-semibold lg:py-3 lg:px-8 transition-colors"
              >
                Ver Vehículos Disponibles{" "}
                <span className="ml-2">
                  <i className="bi bi-car-front"></i>
                </span>
              </button>
              <button
                onClick={() => navigate('/enterprise')}
                className="bg-gray-800 hover:bg-gray-900 text-white rounded-lg text-[12px] md:text-[16px] px-6 py-3 lg:py-3 lg:px-8 transition-colors"
              >
                Información Empresarial{" "}
                <span>
                  <i className="bi bi-building"></i>
                </span>
              </button>
            </div>
          </div>
          <div className="object-contain hidden sm:block">
            <img src={Herocar} alt="" />
          </div>
        </div>
        <div className="absolute h-full w-full bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] [mask-image:radial-gradient(ellipse_50%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      </div>

      {/* Sección de información adicional */}
      <div className="text-center py-20">
        <h2 className="text-3xl font-bold text-gray-800 mb-4">
          ¿Por qué elegirnos?
        </h2>
        <div className="grid md:grid-cols-3 gap-8 max-w-4xl mx-auto">
          <div className="p-6">
            <div className="text-4xl mb-4">🚗</div>
            <h3 className="text-xl font-semibold mb-2">Vehículos de Calidad</h3>
            <p className="text-gray-600">Autos modernos y bien mantenidos para tu seguridad</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">💰</div>
            <h3 className="text-xl font-semibold mb-2">Precios Justos</h3>
            <p className="text-gray-600">Tarifas competitivas sin cargos ocultos</p>
          </div>
          <div className="p-6">
            <div className="text-4xl mb-4">🛡️</div>
            <h3 className="text-xl font-semibold mb-2">Reserva Segura</h3>
            <p className="text-gray-600">Proceso de reserva simple y confiable</p>
          </div>
        </div>
      </div>

      <HeroParallax />
      <Footers/>
    </>
  );
}

export default Home;
