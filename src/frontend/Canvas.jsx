import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const PenToolCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false); // Use a ref to hold the drawing state for event handlers
  const lastPointRef = useRef(null); // Ref to hold the last point

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const canvas = new fabric.Canvas(canvasElement, {
      selection: false, // Disable object selection
    });

    const updateCanvasSize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.renderAll();
    };

    const toggleDrawingMode = (event) => {
      if (event.keyCode === 16) { // Shift key
        isDrawingRef.current = !isDrawingRef.current;
        setIsDrawing(isDrawingRef.current); // Update state to reflect the drawing mode
        if (!isDrawingRef.current) {
          // Reset drawing state when exiting drawing mode
          lastPointRef.current = null;
        }
        event.preventDefault();
      }
    };

    canvas.on('mouse:down', (o) => {
      if (!isDrawingRef.current) return;

      const pointer = canvas.getPointer(o.e);
      if (lastPointRef.current) {
        // Draw a line from the last point to the current point
        const line = new fabric.Line([...lastPointRef.current, pointer.x, pointer.y], {
          strokeWidth: 2,
          fill: 'black',
          stroke: 'black',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        canvas.add(line);
      }
      // Update lastPointRef to the current point for the next line
      lastPointRef.current = [pointer.x, pointer.y];
    });

    canvas.on('mouse:move', (o) => {
      if (!isDrawingRef.current || !lastPointRef.current) return;

      // Temporarily display a line to follow the cursor
      const pointer = canvas.getPointer(o.e);
      // Remove any existing temporary line
      if (canvas.contains(canvas._objects[canvas._objects.length - 1])) {
        canvas.remove(canvas._objects[canvas._objects.length - 1]);
      }
      const tempLine = new fabric.Line([...lastPointRef.current, pointer.x, pointer.y], {
        strokeWidth: 2,
        fill: 'black', // Temporary line in red to distinguish it
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      canvas.add(tempLine);
      canvas.renderAll();
    });

    // Add event listeners and initialize canvas size
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    document.addEventListener('keydown', toggleDrawingMode);

    return () => {
      // Cleanup event listeners and Fabric.js canvas on component unmount
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('keydown', toggleDrawingMode);
      canvas.off('mouse:down');
      canvas.off('mouse:move');
      canvas.dispose();
    };
  }, []);

  return (
    <div className="canvasContainer">
      <canvas ref={canvasRef} className="myCanvas" />
    </div>
  );
};

export default PenToolCanvas;
