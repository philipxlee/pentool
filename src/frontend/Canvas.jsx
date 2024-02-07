import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const PenToolCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const lineRef = useRef(null);
  const isDrawingRef = useRef(isDrawing); // Use a ref to hold the drawing state for event handlers

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const canvas = new fabric.Canvas(canvasElement, {
      selection: false, // Disable object selection
    });

    // This function adjusts the canvas size to the window's dimensions
    const updateCanvasSize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.renderAll();
    };

    // Toggle drawing mode based on Shift key without re-initializing the effect
    const toggleDrawingMode = (event) => {
      if (event.keyCode === 16) { // Shift key
        const newIsDrawing = !isDrawingRef.current;
        setIsDrawing(newIsDrawing); // Update state
        isDrawingRef.current = newIsDrawing; // Update ref to current drawing state
        event.preventDefault();
      }
    };

    // Begins a new line on mouse down, if in drawing mode
    const onMouseDown = (o) => {
      if (!isDrawingRef.current) return; // Use ref to check drawing state
      const pointer = canvas.getPointer(o.e);
      const newLine = new fabric.Line([pointer.x, pointer.y, pointer.x, pointer.y], {
        strokeWidth: 2,
        fill: 'black',
        stroke: 'black',
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      lineRef.current = newLine;
      canvas.add(newLine);
    };

    // Updates the current line's end point on mouse move, if in drawing mode
    const onMouseMove = (o) => {
      if (!isDrawingRef.current || !lineRef.current) return; // Use ref to check drawing state
      const pointer = canvas.getPointer(o.e);
      lineRef.current.set({ x2: pointer.x, y2: pointer.y });
      canvas.requestRenderAll();
    };

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    document.addEventListener('keydown', toggleDrawingMode);
    canvas.on('mouse:down', onMouseDown);
    canvas.on('mouse:move', onMouseMove);

    // Cleanup event listeners and Fabric.js canvas on component unmount
    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('keydown', toggleDrawingMode);
      canvas.off('mouse:down', onMouseDown);
      canvas.off('mouse:move', onMouseMove);
      canvas.dispose();
    };
  }, []); // No dependencies to avoid re-initializing the effect

  return (
    <div className="canvasContainer">
      <canvas ref={canvasRef} className="myCanvas" />
    </div>
  );
};

export default PenToolCanvas;
