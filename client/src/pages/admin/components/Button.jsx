
import PropTypes from 'prop-types';

function Button({bgColor,color,size,text,borderRadius}) {
  return (
    <button type="button" style={{backgroundColor:bgColor,color,borderRadius}} className={`text-${size} p-3 hover:drop-shadow-xl`}>
      {text || 'Download'}
    </button>
  )
}

Button.propTypes = {
  bgColor: PropTypes.string,
  color: PropTypes.string,
  size: PropTypes.string,
  text: PropTypes.string,
  borderRadius: PropTypes.string,
};

export default Button