import React, {useEffect} from 'react';
import {MdClose} from 'react-icons/md';

const Snackbar = ({isActive, message, handleClick, isDismiss, dismissTime}) => {
  useEffect(() => {
    if (isActive === true && isDismiss === true) {
      setTimeout(() => {
        handleClick(false);
      }, dismissTime || 3000);
    }
  }, [isDismiss, dismissTime, handleClick, isActive]);

  return (
    <div className={`snack-bar ${isActive === true && `snack-bar-active`}`}>
      <div>{message}</div>
      <span className="close-button" onClick={() => handleClick(false)}>
        <MdClose size={23} />
      </span>
    </div>
  );
};
export default Snackbar;
