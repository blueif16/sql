import React from 'react';

const DraggableDivider = ({ isDragging, setIsDragging }) => {
  return (
    <div 
      className="w-1 bg-gray-300 hover:bg-gray-400 cursor-col-resize transition-colors relative group border-r border-gray-300"
      onMouseDown={() => setIsDragging(true)}
    >
      <div className="absolute inset-y-0 -left-1 -right-1 group-hover:bg-gray-400/20"></div>
    </div>
  );
};

export default DraggableDivider;
