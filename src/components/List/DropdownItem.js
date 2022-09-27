import React from 'react';

const DropdownItem = (li, itemProps) => {
  const itemChildren = (
    <span className="dropdown-item">{li.props.children}</span>
  );

  return React.cloneElement(li, li.props, itemChildren);
};

export default DropdownItem;
