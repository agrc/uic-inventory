import {
  useFloating,
  autoUpdate,
  offset,
  flip,
  shift,
  useHover,
  useFocus,
  useDismiss,
  useRole,
  useInteractions,
  FloatingPortal,
  FloatingTree,
  useFloatingTree,
  useFloatingParentNodeId,
  useFloatingNodeId,
} from '@floating-ui/react';
import PropTypes from 'prop-types';
import { createContext, useContext, useState, useMemo, cloneElement } from 'react';
import Tooltip from '../PageElements/Tooltip';

const SingletonContext = createContext(null);

export function TooltipProvider({ children, delay = 25 }) {
  const [content, setContent] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const [activeId, setActiveId] = useState(null);

  const value = useMemo(
    () => ({
      content,
      setContent,
      isOpen,
      setIsOpen,
      activeId,
      setActiveId,
      delay,
    }),
    [content, isOpen, activeId, delay],
  );

  return (
    <FloatingTree>
      <SingletonContext.Provider value={value}>{children}</SingletonContext.Provider>
    </FloatingTree>
  );
}

TooltipProvider.propTypes = {
  children: PropTypes.node.isRequired,
  delay: PropTypes.number,
};

export function TooltipTrigger({ children, content }) {
  const singleton = useContext(SingletonContext);
  const nodeId = useFloatingNodeId();
  const parentId = useFloatingParentNodeId();
  const tree = useFloatingTree();

  const { refs, floatingStyles, context } = useFloating({
    open: singleton.isOpen && singleton.activeId === nodeId,
    onOpenChange: (open) => {
      singleton.setIsOpen(open);
      if (open) {
        singleton.setActiveId(nodeId);
        singleton.setContent(content);
      }
    },
    placement: 'top',
    middleware: [offset(8), flip(), shift({ padding: 8 })],
    whileElementsMounted: autoUpdate,
    nodeId,
  });

  const hover = useHover(context, {
    delay: singleton.delay,
    move: false,
  });
  const focus = useFocus(context);
  const dismiss = useDismiss(context);
  const role = useRole(context, { role: 'tooltip' });

  const { getReferenceProps, getFloatingProps } = useInteractions([hover, focus, dismiss, role]);

  // Register node in tree
  if (tree && parentId === null) {
    tree.nodesRef.current[nodeId] = { id: nodeId, parentId };
  }

  return (
    <>
      {cloneElement(children, getReferenceProps({ ref: refs.setReference, ...children.props }))}
      {singleton.isOpen && singleton.activeId === nodeId && (
        <FloatingPortal>
          <div ref={refs.setFloating} style={floatingStyles} {...getFloatingProps()}>
            <Tooltip attrs={{}}>{singleton.content}</Tooltip>
          </div>
        </FloatingPortal>
      )}
    </>
  );
}

TooltipTrigger.propTypes = {
  children: PropTypes.element.isRequired,
  content: PropTypes.node.isRequired,
};
