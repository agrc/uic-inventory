import PropTypes from 'prop-types';

export default function Tooltip({ children, attrs }) {
  return (
    <div
      className="pointer-events-none z-20 max-w-[10rem] rounded-lg bg-gray-800 px-3 py-1 text-sm lowercase text-white shadow-xl"
      tabIndex={-1}
      {...attrs}
    >
      {children}
      <svg
        className="absolute left-0 top-full h-2 w-full text-black"
        x="0px"
        y="0px"
        viewBox="0 0 255 255"
        xmlSpace="preserve"
      >
        <polygon className="fill-current" points="0,0 127.5,127.5 255,0" />
      </svg>
    </div>
  );
}

Tooltip.propTypes = {
  children: PropTypes.node.isRequired,
  attrs: PropTypes.object,
};

Tooltip.defaultProps = {
  attrs: {},
};
