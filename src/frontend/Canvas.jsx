import React, { useEffect, useRef, useState } from 'react';
import { fabric } from 'fabric';
import '../Canvas.css'; // Ensure the path is correct based on your project structure

const PenToolCanvas = () => {
  const canvasRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false); // Use useState for drawing state
  let line = null;

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const canvas = new fabric.Canvas(canvasElement, {
      selection: false // Disable object selection
    });

    const updateCanvasSize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.renderAll();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    const toggleDrawingMode = (event) => {
      if (event.keyCode === 16) { // Check if Shift key was pressed (keyCode 16)
        setIsDrawing(!isDrawing); // Toggle the drawing state
        event.preventDefault(); // Prevent default to avoid any unwanted side effects
      }
    };

    const onMouseDown = (o) => {
      if (!isDrawing) return;
      const pointer = canvas.getPointer(o.e);
      line = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        strokeWidth: 2,
        fill: 'black',
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      canvas.add(line);
    };

    const onMouseMove = (o) => {
      if (!isDrawing || !line) return;
      const pointer = canvas.getPointer(o.e);
      line.set({ x2: pointer.x, y2: pointer.y });
      canvas.requestRenderAll();
    };

    document.addEventListener('keydown', toggleDrawingMode);

    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('keydown', toggleDrawingMode);
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.dispose();
    };
  }, [isDrawing]); // Add isDrawing as a dependency to useEffect

  return <div className="canvasContainer">
    <canvas ref={canvasRef} className="myCanvas" />
  </div>;
};

export default PenToolCanvas;
