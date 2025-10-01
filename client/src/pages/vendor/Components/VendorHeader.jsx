import PropTypes from 'prop-types';

const VendorHeader = ({category, title, onAddVehicle}) => {
  return (
    <div className="mb-10 flex justify-between items-center ">
      <div>
      <p className="text-gray-400">
        {category}
      </p>
      <p className="text-slate--900 text-3xl font-extrabold tracking-tight ">
        {title}
      </p>
      </div>
      <button 
        className='bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors'
        onClick={onAddVehicle}
      >
        <div className='text-white px-5 py-2 font-bold'>Agregar +</div>
      </button>
    </div>
  )
}

VendorHeader.propTypes = {
  category: PropTypes.string,
  title: PropTypes.string.isRequired,
  onAddVehicle: PropTypes.func.isRequired,
};

export default VendorHeader;