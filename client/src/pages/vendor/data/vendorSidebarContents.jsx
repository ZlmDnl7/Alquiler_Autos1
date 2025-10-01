

import { FiShoppingBag, FiTruck, FiCalendar } from 'react-icons/fi';

import { IoHomeOutline } from "react-icons/io5";





export const links = [
    {
      title: 'Panel de Control',
      links: [
        {
          name:'adminHome',
          icon:<IoHomeOutline />,
          displayName: 'Inicio'
        },
        {
          name: 'vendorAllVeihcles',
          icon: <FiTruck />,
          displayName: 'Mis Vehículos'
        },
        {
          name: 'Bookings',
          icon: <FiCalendar />,
          displayName: 'Reservas'
        },
        
      ],
    },
  
    
     
    ];
    