import PropTypes from 'prop-types';

export function Header({ children }) {
  return (
    <header>
      <div>{children}</div>
    </header>
  );
}

export default Header;

Header.propTypes = {
  children: PropTypes.node.isRequired,
};
