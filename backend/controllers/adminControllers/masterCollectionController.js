import mongoose from "mongoose";
import MasterData from '../../models/masterDataModel.js'
import { v4 as uuidv4 } from 'uuid';

const dummyData = [

    // Colombia
    { id: uuidv4(), district: 'Bogotá', location: 'Centro Histórico : Plaza de Bolívar', type: 'location' },
    { id: uuidv4(), district: 'Bogotá', location: 'Chapinero : Zona T', type: 'location' },
    { id: uuidv4(), district: 'Bogotá', location: 'Usaquén : Centro Comercial Santa Ana', type: 'location' },
    { id: uuidv4(), district: 'Medellín', location: 'El Poblado : Parque Lleras', type: 'location' },
    { id: uuidv4(), district: 'Medellín', location: 'Laureles : Estadio', type: 'location' },
    { id: uuidv4(), district: 'Cartagena', location: 'Centro Histórico : Plaza de los Coches', type: 'location' },
    { id: uuidv4(), district: 'Cartagena', location: 'Bocagrande : Playa', type: 'location' },

    // Estados Unidos
    { id: uuidv4(), district: 'Nueva York', location: 'Manhattan : Times Square', type: 'location' },
    { id: uuidv4(), district: 'Nueva York', location: 'Brooklyn : Brooklyn Bridge', type: 'location' },
    { id: uuidv4(), district: 'Los Ángeles', location: 'Hollywood : Walk of Fame', type: 'location' },
    { id: uuidv4(), district: 'Los Ángeles', location: 'Venice Beach : Boardwalk', type: 'location' },
    { id: uuidv4(), district: 'Miami', location: 'South Beach : Ocean Drive', type: 'location' },
    { id: uuidv4(), district: 'Miami', location: 'Downtown : Brickell', type: 'location' },

    // España
    { id: uuidv4(), district: 'Madrid', location: 'Centro : Puerta del Sol', type: 'location' },
    { id: uuidv4(), district: 'Madrid', location: 'Retiro : Parque del Retiro', type: 'location' },
    { id: uuidv4(), district: 'Barcelona', location: 'Ciutat Vella : Las Ramblas', type: 'location' },
    { id: uuidv4(), district: 'Barcelona', location: 'Eixample : Sagrada Familia', type: 'location' },
    { id: uuidv4(), district: 'Sevilla', location: 'Centro : Plaza de España', type: 'location' },

    // Italia
    { id: uuidv4(), district: 'Roma', location: 'Centro : Coliseo', type: 'location' },
    { id: uuidv4(), district: 'Roma', location: 'Vaticano : Basílica de San Pedro', type: 'location' },
    { id: uuidv4(), district: 'Milán', location: 'Centro : Duomo', type: 'location' },
    { id: uuidv4(), district: 'Florencia', location: 'Centro : Piazza del Duomo', type: 'location' },

    // Francia
    { id: uuidv4(), district: 'París', location: 'Centro : Torre Eiffel', type: 'location' },
    { id: uuidv4(), district: 'París', location: 'Louvre : Museo del Louvre', type: 'location' },
    { id: uuidv4(), district: 'Lyon', location: 'Centro : Place Bellecour', type: 'location' },

    // Alemania
    { id: uuidv4(), district: 'Berlín', location: 'Centro : Puerta de Brandeburgo', type: 'location' },
    { id: uuidv4(), district: 'Berlín', location: 'Mitte : Alexanderplatz', type: 'location' },
    { id: uuidv4(), district: 'Múnich', location: 'Centro : Marienplatz', type: 'location' },

    // Portugal
    { id: uuidv4(), district: 'Lisboa', location: 'Centro : Plaza del Comercio', type: 'location' },
    { id: uuidv4(), district: 'Lisboa', location: 'Alfama : Castillo de San Jorge', type: 'location' },
    { id: uuidv4(), district: 'Oporto', location: 'Centro : Ribeira', type: 'location' },
    

    //cars


    //alto
    { id: uuidv4(), model: 'Alto 800', variant: 'manual', type: 'car' , brand:'maruthi' },
    { id: uuidv4(), model: 'Alto 800', variant: 'automatic', type: 'car' , brand:'maruthi' },
    { id: uuidv4(), model: 'SKODA SLAVIA PETROL AT', variant: 'automatic', type: 'car' , brand:'maruthi' },
    { id: uuidv4(), model: 'NISSAN MAGNITE PETROL MT', variant: 'manual', type: 'car' , brand:'nissan' },
    { id: uuidv4(), model: 'SKODA KUSHAQ Petrol MT', variant: 'manual', type: 'car' , brand:'skoda' },
    { id: uuidv4(), model: 'SKODA KUSHAQ Petrol AT', variant: 'automatic', type: 'car' , brand:'skoda' },
    { id: uuidv4(), model: 'MG HECTOR Petrol MT', variant: 'manual', type: 'car' , brand:'mg' },
    { id: uuidv4(), model: 'MG HECTOR Petrol AT', variant: 'automatic', type: 'car' , brand:'mg' },
    { id: uuidv4(), model: 'MG HECTOR Diesel MT', variant: 'manual', type: 'car' , brand:'mg' },
    { id: uuidv4(), model: 'NISSAN TERRANO Diesel MT', variant: 'manual', type: 'car' , brand:'nissan' },
    { id: uuidv4(), model: 'NISSAN KICKS Petrol MT', variant: 'manual', type: 'car' , brand:'nissan' },
    { id: uuidv4(), model: 'NISSAN KICKS Petrol AT', variant: 'manual', type: 'car' , brand:'nissan' },
    { id: uuidv4(), model: 'VW TAIGUN Petrol MT', variant: 'manual', type: 'car' , brand:'volkswagen' },
    { id: uuidv4(), model: 'NISSAN MAGNITE Petrol MT', variant: 'manual', type: 'car' , brand:'nissan' },
    { id: uuidv4(), model: 'HYUNDAI ALCAZAR Diesel AT', variant: 'automatic', type: 'car' , brand:'hyundai' },
    { id: uuidv4(), model: 'CITROEN C3 Petrol MT', variant: 'automatic', type: 'car' , brand:'citroen' },
    { id: uuidv4(), model: 'ISUZU MUX Diesel AT', variant: 'automatic', type: 'car' , brand:'isuzu' },
    { id: uuidv4(), model: 'MG HECTOR PLUS Petrol MT', variant: 'manual', type: 'car' , brand:'mg' },
    { id: uuidv4(), model: 'MG HECTOR PLUS Petrol AT', variant: 'automatic', type: 'car' , brand:'mg' },
    { id: uuidv4(), model: 'MG HECTOR PLUS Diesel MT', variant: 'manual', type: 'car' , brand:'mg' },


    { id: uuidv4(), model: 'MARUTI SWIFT Petrol AT', variant: 'automatic', type: 'car' , brand:'maruthi' },
    { id: uuidv4(), model: 'DATSUN REDI GO Petrol MT', variant: 'manual', type: 'car' , brand:'DATSUN' },
    { id: uuidv4(), model: 'DATSUN REDI GO Petrol AT', variant: 'automatic', type: 'car' , brand:'DATSUN' },
    { id: uuidv4(), model: 'NISSAN MICRA Petrol MT', variant: 'automatic', type: 'car' , brand:'NISSAN' },
    { id: uuidv4(), model: 'VW AMEO Diesel MT', variant: 'manual', type: 'car' , brand:'volkswagen' },
    { id: uuidv4(), model: 'SKODA RAPID Petrol MT', variant: 'manual', type: 'car' , brand:'skoda' },
    { id: uuidv4(), model: 'MARUTI DZIRE Petrol MT', variant: 'manual', type: 'car' , brand:'maruthi' },
    { id: uuidv4(), model: 'VW VENTO Petrol MT', variant: 'manual', type: 'car' , brand:'volkswagen' },
    { id: uuidv4(), model: 'VW VENTO Petrol AT', variant: 'automatic', type: 'car' , brand:'volkswagen' },
    { id: uuidv4(), model: 'VW VENTO Diesel AT', variant: 'automatic', type: 'car' , brand:'volkswagen' },
    { id: uuidv4(), model: 'VW POLO Petrol MT', variant: 'manual', type: 'car' , brand:'volkswagen' },
    { id: uuidv4(), model: 'VW POLO Petrol AT', variant: 'automatic', type: 'car' , brand:'volkswagen' },
    { id: uuidv4(), model: 'VW POLO Diesel MT', variant: 'manual', type: 'car' , brand:'volkswagen' },
    

    

  ];
  
  // Function to insert dummy data into the database
 export  async function insertDummyData() {
    try {
        // Insert the dummy data into the collection
        await MasterData.insertMany(dummyData);
        console.log('Dummy data inserted successfully.');
    } catch (error) {
        console.error('Error inserting dummy data:', error);
    }
    finally{
        mongoose.disconnect();
    }
  }

//app product modal data fetching from db
  export const getCarModelData = async (req,res,next)=> {
    try{
            const availableVehicleModels  = await MasterData.find()
            
            // Si no hay datos en la BD, devolver los datos dummy
            if(!availableVehicleModels || availableVehicleModels.length === 0){
                console.log("No hay datos en BD, devolviendo datos dummy");
                return res.status(200).json(dummyData);
            }
            
            res.status(200).json(availableVehicleModels)
    }
    catch(error){
        console.log("Error al obtener datos, devolviendo datos dummy:", error);
        // En caso de error, devolver datos dummy
        return res.status(200).json(dummyData);
    }
  }
  

  


