import React from 'react';

const ErrorMessage = ({ children }) => {
  return (
    <p className="text-rose-500 text-xs mt-1">{children}</p>
  );
};

export default ErrorMessage;