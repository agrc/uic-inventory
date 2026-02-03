import PropTypes from 'prop-types';
import { cloneElement } from 'react';
import { useTooltip, FloatingPortal } from '../Hooks/useTooltip';
import Tooltip from './Tooltip';

export default function FloatingTooltip({ children, content, delay = 0, placement = 'top' }) {
  const { isOpen, refs, floatingStyles, getReferenceProps, getFloatingProps } = useTooltip({
    delay,
    placement,
  });

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: refs.setReference, ...children.props }))}
      {isOpen && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <Tooltip attrs={{}}>{content}</Tooltip>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

FloatingTooltip.propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.node.isRequired,
  delay: PropTypes.number,
  placement: PropTypes.string,
};
