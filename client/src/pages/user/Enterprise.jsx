import { Link } from "react-router-dom"
import styles from "../.."
import Footers from "../../components/Footer"



function Enterprise() {
  return (
    <>
    <div className="text-center ">
        <h1 className={`${styles.heading2}`}>
            Lista tu vehículo con nosotros
        </h1>
        <p>Para listar tu vehículo, inicia sesión como vendedor primero <span className="text-blue-600 cursor-pointer"><Link to={'/vendorSignin'}>iniciar sesión como vendedor</Link></span></p>

    </div>
    <Footers/>
    </>
  )
}

export default Enterprise