import React from 'react'

export function MainContainer({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <div className={`main-container ${className}`}>
      {children}
    </div>
  );
}

export default MainContainer;
