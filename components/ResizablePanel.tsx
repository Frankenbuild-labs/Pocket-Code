
import React, { useState, useRef, useCallback } from 'react';

interface ResizablePanelProps {
  children: React.ReactNode;
  initialSize: number;
  minSize: number;
  direction: 'horizontal' | 'vertical';
  dividerPosition?: 'left' | 'right' | 'top' | 'bottom';
}

const ResizablePanel: React.FC<ResizablePanelProps> = ({ children, initialSize, minSize, direction, dividerPosition }) => {
  const [size, setSize] = useState(initialSize);
  const isResizing = useRef(false);
  const panelRef = useRef<HTMLDivElement>(null);

  const isHorizontal = direction === 'horizontal';
  const actualDividerPosition = dividerPosition || (isHorizontal ? 'right' : 'bottom');

  const handleMouseDown = (e: React.MouseEvent) => {
    e.preventDefault();
    isResizing.current = true;
    document.addEventListener('mousemove', handleMouseMove);
    document.addEventListener('mouseup', handleMouseUp);
  };

  const handleMouseMove = useCallback((e: MouseEvent) => {
    if (!isResizing.current || !panelRef.current?.parentElement) return;

    const parentRect = panelRef.current.parentElement.getBoundingClientRect();
    let newSize;

    if (isHorizontal) {
      if (actualDividerPosition === 'right') {
        newSize = e.clientX - parentRect.left;
      } else { // 'left'
        newSize = parentRect.right - e.clientX;
      }
    } else { // vertical
      if (actualDividerPosition === 'bottom') {
        newSize = e.clientY - parentRect.top;
      } else { // 'top'
        newSize = parentRect.bottom - e.clientY;
      }
    }
    
    if (newSize >= minSize) {
      setSize(newSize);
    }
  }, [direction, minSize, actualDividerPosition]);

  const handleMouseUp = useCallback(() => {
    isResizing.current = false;
    document.removeEventListener('mousemove', handleMouseMove);
    document.removeEventListener('mouseup', handleMouseUp);
  }, [handleMouseMove]);

  const panelStyle: React.CSSProperties = {
    [isHorizontal ? 'width' : 'height']: `${size}px`,
    flexShrink: 0,
  };

  const getDividerClasses = () => {
    if (isHorizontal) {
      return `cursor-col-resize w-2 h-full top-0 ${actualDividerPosition === 'left' ? 'left-0' : 'right-0'}`;
    }
    return `cursor-row-resize h-2 w-full left-0 ${actualDividerPosition === 'top' ? 'top-0' : 'bottom-0'}`;
  };
  
  const parentClasses = `relative flex ${isHorizontal ? 'flex-row' : 'flex-col'}`;

  return (
    <div ref={panelRef} style={panelStyle} className={parentClasses}>
      <div className="flex-grow overflow-hidden">{children}</div>
      <div
        onMouseDown={handleMouseDown}
        className={`absolute bg-gray-700 hover:bg-cyan-500 transition-colors z-10 ${getDividerClasses()}`}
      />
    </div>
  );
};

export default ResizablePanel;
