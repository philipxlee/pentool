import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const PenToolCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false); // Use a ref to hold the drawing state for event handlers
  const lastPointRef = useRef(null); // Ref to hold the last point
  const tempLineRef = useRef(null); // Ref to hold the temporary preview line

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
          if (tempLineRef.current) {
            canvas.remove(tempLineRef.current);
            tempLineRef.current = null;
          }
        }
        event.preventDefault();
      }
    };

    canvas.on('mouse:down', (o) => {
      if (!isDrawingRef.current) return;

      const pointer = canvas.getPointer(o.e);
      if (lastPointRef.current && tempLineRef.current) {
        // Finalize the temporary line as a permanent line
        tempLineRef.current.set({ x2: pointer.x, y2: pointer.y, stroke: 'black', fill: 'black' });
        tempLineRef.current = null; // Clear the temporary line reference
      }

      const circle = new fabric.Circle({
        radius: 3, // Adjust the size of the circle here
        fill: 'black', // Circle color
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      canvas.add(circle);
      
      // Update lastPointRef to the current point for the next line
      lastPointRef.current = [pointer.x, pointer.y];
    });

    canvas.on('mouse:move', (o) => {
      if (!isDrawingRef.current || !lastPointRef.current) return;

      const pointer = canvas.getPointer(o.e);
      // Update or create the temporary preview line
      if (tempLineRef.current) {
        // Update the existing temporary line
        tempLineRef.current.set({ x2: pointer.x, y2: pointer.y });
      } else {
        // Create a new temporary line
        const tempLine = new fabric.Line([...lastPointRef.current, pointer.x, pointer.y], {
          strokeWidth: 2,
          fill: 'red', // Temporary line in red to distinguish it
          stroke: 'red',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        canvas.add(tempLine);
        tempLineRef.current = tempLine;
      }
      canvas.renderAll();
    });

    // Setup event listeners and initialize canvas size
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
