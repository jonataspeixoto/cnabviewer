import { useState, useCallback, useEffect } from 'react';

export const useResizable = (initialWidth, min = 150, max = 800, direction = 'right') => {
  const [width, setWidth] = useState(initialWidth);
  const [isResizing, setIsResizing] = useState(false);

  const startResizing = useCallback((e) => {
    e.preventDefault();
    setIsResizing(true);
  }, []);

  const stopResizing = useCallback(() => {
    setIsResizing(false);
  }, []);

  const resize = useCallback((e) => {
    if (!isResizing) return;
    
    let newWidth;
    if (direction === 'right') {
      newWidth = window.innerWidth - e.clientX;
    } else {
      newWidth = e.clientX;
    }

    if (newWidth >= min && newWidth <= max) {
      setWidth(newWidth);
    }
  }, [isResizing, min, max, direction]);

  useEffect(() => {
    if (isResizing) {
      window.addEventListener('mousemove', resize);
      window.addEventListener('mouseup', stopResizing);
    }
    return () => {
      window.removeEventListener('mousemove', resize);
      window.removeEventListener('mouseup', stopResizing);
    };
  }, [isResizing, resize, stopResizing]);

  return { width, isResizing, startResizing };
};
