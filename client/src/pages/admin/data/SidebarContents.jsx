
import { AiOutlineCalendar, AiOutlineShoppingCart, AiOutlineAreaChart, AiOutlineBarChart, AiOutlineStock } from 'react-icons/ai';
import { FiShoppingBag, FiEdit, FiPieChart } from 'react-icons/fi';
import { BsKanban, BsBarChart  } from 'react-icons/bs';
import { BiColorFill } from 'react-icons/bi';
import { IoMdContacts } from 'react-icons/io';
import { RiContactsLine, RiStockLine } from 'react-icons/ri';
import { IoHomeOutline } from "react-icons/io5";
import { GiLouvrePyramid } from 'react-icons/gi';




export const links = [
    {
      title: 'Panel de Control',
      links: [
        {
          name:'Inicio',
          icon:<IoHomeOutline />,
        },
        {
          name: 'Todos los Productos',
          icon: <FiShoppingBag />,
        },
        {
          name: 'Solicitudes de Vendedores',
          icon: <FiShoppingBag />,
        },
        
      ],
    },
  
    {
      title: 'Páginas',
      links: [
        {
          name: 'Pedidos',
          icon: <AiOutlineShoppingCart />,
        },
        {
          name: 'Empleados',
          icon: <IoMdContacts />,
        },
        {
          name: 'Clientes',
          icon: <RiContactsLine />,
        },
      ],
    },
    {
      title: 'Aplicaciones',
      links: [
        {
          name: 'Calendario',
          icon: <AiOutlineCalendar />,
        },
        {
          name: 'Tablero',
          icon: <BsKanban />,
        },
        {
          name: 'Editor',
          icon: <FiEdit />,
        },
        {
          name: 'Selector de Colores',
          icon: <BiColorFill />,
        },
      ],
    },
    {
        title: 'Gráficos',
        links: [
          {
            name: 'Línea',
            icon: <AiOutlineStock />,
          },
          {
            name: 'Área',
            icon: <AiOutlineAreaChart />,
          },
    
          {
            name: 'Barras',
            icon: <AiOutlineBarChart />,
          },
          {
            name: 'Circular',
            icon: <FiPieChart />,
          },
          {
            name: 'Financiero',
            icon: <RiStockLine />,
          },
          {
            name: 'Mapa de Colores',
            icon: <BsBarChart />,
          },
          {
            name: 'Pirámide',
            icon: <GiLouvrePyramid />,
          },
          {
            name: 'Apilado',
            icon: <AiOutlineBarChart />,
          },
        ],
      },
     
    ];
    