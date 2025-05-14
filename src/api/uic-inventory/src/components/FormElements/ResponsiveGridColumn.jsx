import clsx from 'clsx';
import PropTypes from 'prop-types';

export function ResponsiveGridColumn({ full, half, third, className, children }) {
  const classes = clsx(className, {
    'col-span-6': full,
    'sm:col-span-3': half,
    'lg:col-span-2': third,
  });
  return <div className={classes}>{children}</div>;
}
export function FullGridColumn({ children }) {
  return <div className="col-span-6">{children}</div>;
}

export function FullHalfGridColumn({ children }) {
  return <div className="col-span-6 sm:col-span-3">{children}</div>;
}

export function FullHalfThirdGridColumn({ children }) {
  return <div className="col-span-6 sm:col-span-6 lg:col-span-2">{children}</div>;
}

ResponsiveGridColumn.propTypes = {
  full: PropTypes.bool,
  half: PropTypes.bool,
  third: PropTypes.bool,
  className: PropTypes.string,
  children: PropTypes.node.isRequired,
};

FullGridColumn.propTypes = {
  children: PropTypes.node.isRequired,
};

FullHalfGridColumn.propTypes = {
  children: PropTypes.node.isRequired,
};

FullHalfThirdGridColumn.propTypes = {
  children: PropTypes.node.isRequired,
};
