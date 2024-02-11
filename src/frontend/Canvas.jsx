import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const PenToolCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const tempLineRef = useRef(null);

  useEffect(() => {
    const canvasElement = canvasRef.current;
    const canvas = new fabric.Canvas(canvasElement, {
      selection: false,
    });

    const updateCanvasSize = () => {
      canvas.setWidth(window.innerWidth);
      canvas.setHeight(window.innerHeight);
      canvas.renderAll();
    };

    const findNearestNode = (pointer) => {
      const threshold = 20; // Pixel range to snap to the nearest node
      let nearestNode = null;
      let minDist = threshold;

      canvas.getObjects().forEach((obj) => {
        if (obj.type === 'circle') {
          const dist = Math.sqrt(Math.pow(obj.left - pointer.x, 2) + Math.pow(obj.top - pointer.y, 2));
          if (dist < minDist) {
            nearestNode = obj;
            minDist = dist;
          }
        }
      });

      return nearestNode ? { x: nearestNode.left, y: nearestNode.top } : null;
    };

    const toggleDrawingMode = (event) => {
      if (event.keyCode === 16) {
        isDrawingRef.current = !isDrawingRef.current;
        setIsDrawing(isDrawingRef.current);
        if (!isDrawingRef.current) {
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

      let pointer = canvas.getPointer(o.e);
      const nearestNode = findNearestNode(pointer);
      if (nearestNode) {
        pointer = nearestNode; // Snap to the nearest node
      }

      if (lastPointRef.current && tempLineRef.current) {
        // Finalize the temporary line as a permanent line with black stroke
        tempLineRef.current.set({ x2: pointer.x, y2: pointer.y, stroke: 'black' });
        canvas.add(tempLineRef.current); // Re-add to ensure properties are updated
        tempLineRef.current = null; // Clear the temporary line reference
      }

      const circle = new fabric.Circle({
        radius: 3,
        fill: 'black',
        left: pointer.x,
        top: pointer.y,
        originX: 'center',
        originY: 'center',
        selectable: false,
        evented: false,
      });
      canvas.add(circle);

      lastPointRef.current = [pointer.x, pointer.y];
    });

    canvas.on('mouse:move', (o) => {
      if (!isDrawingRef.current || !lastPointRef.current) return;

      let pointer = canvas.getPointer(o.e);
      const nearestNode = findNearestNode(pointer);
      if (nearestNode) {
        pointer = nearestNode; // Snap to the nearest node
      }

      if (tempLineRef.current) {
        tempLineRef.current.set({ x2: pointer.x, y2: pointer.y });
      } else {
        // Create a new temporary line with red stroke for preview
        const tempLine = new fabric.Line([...lastPointRef.current, pointer.x, pointer.y], {
          strokeWidth: 2,
          fill: 'red', // Keep temporary line red
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

    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);
    document.addEventListener('keydown', toggleDrawingMode);

    return () => {
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
