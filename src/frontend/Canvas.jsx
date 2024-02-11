import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';

const PenToolCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const drawingModeRef = useRef('line');
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const tempLineRef = useRef(null);
  const pointsRef = useRef([]);

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
      const threshold = 20;
      let nearestNode = null;
      let minDist = threshold;

      canvas.getObjects().forEach((obj) => {
        if (obj.type === 'circle') {
          const dist = Math.sqrt(Math.pow(obj.left - pointer.x, 2) + Math.pow(obj.top - pointer.y, 2));
          if (dist < minDist) {
            nearestNode = { x: obj.left, y: obj.top };
            minDist = dist;
          }
        }
      });

      return nearestNode;
    };

    const drawNode = (pointer) => {
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
    };

    const drawLine = (pointer) => {
      if (lastPointRef.current) {
        const line = new fabric.Line([lastPointRef.current.x, lastPointRef.current.y, pointer.x, pointer.y], {
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
      lastPointRef.current = pointer;
      if (tempLineRef.current) {
        canvas.remove(tempLineRef.current);
        tempLineRef.current = null;
      }
    };

    const drawCurve = (pointer) => {
      pointsRef.current.push(pointer);
      if (pointsRef.current.length === 3) {
        const [start, control, end] = pointsRef.current;
        const curve = new fabric.Path(`M ${start.x} ${start.y} Q ${control.x} ${control.y}, ${end.x} ${end.y}`, {
          stroke: 'black',
          strokeWidth: 2,
          fill: '',
          selectable: false,
          evented: false,
        });
        canvas.add(curve);
        pointsRef.current = [];
        lastPointRef.current = null;
        canvas.getObjects('circle').forEach((obj) => {
          if (obj.left === control.x && obj.top === control.y) {
            canvas.remove(obj);
          }
        });
      }
    };

    const toggleDrawingMode = (event) => {
      if (event.keyCode === 16) {
        isDrawingRef.current = !isDrawingRef.current;
        setIsDrawing(isDrawingRef.current);
        if (!isDrawingRef.current) {
          resetDrawingState();
        }
      } else if (event.keyCode === 81) {
        if (tempLineRef.current) {
          canvas.remove(tempLineRef.current);
          tempLineRef.current = null;
        }
        drawingModeRef.current = drawingModeRef.current === 'line' ? 'curve' : 'line';
      }
    };

    const resetDrawingState = () => {
      lastPointRef.current = null;
      pointsRef.current = [];
      if (tempLineRef.current) {
        canvas.remove(tempLineRef.current);
        tempLineRef.current = null;
      }
    };

    canvas.on('mouse:down', (o) => {
      if (!isDrawingRef.current) return;
      let originalPointer = canvas.getPointer(o.e);
      const nearestNode = findNearestNode(originalPointer);
      let effectivePointer = nearestNode || originalPointer; // Use nearestNode if exists, otherwise use originalPointer

      drawNode(effectivePointer);

      if (drawingModeRef.current === 'line') {
        drawLine(effectivePointer);
      } else if (drawingModeRef.current === 'curve') {
        drawCurve(effectivePointer);
      }
    });

    canvas.on('mouse:move', (o) => {
      if (!isDrawingRef.current || drawingModeRef.current !== 'line' || !lastPointRef.current) return;
      let pointer = canvas.getPointer(o.e);
      const nearestNode = findNearestNode(pointer);
      if (nearestNode) {
        pointer = nearestNode;
      }

      if (tempLineRef.current) {
        tempLineRef.current.set({ x1: lastPointRef.current.x, y1: lastPointRef.current.y, x2: pointer.x, y2: pointer.y });
        canvas.renderAll();
      } else {
        const tempLine = new fabric.Line([lastPointRef.current.x, lastPointRef.current.y, pointer.x, pointer.y], {
          strokeWidth: 2,
          fill: 'red',
          stroke: 'red',
          originX: 'center',
          originY: 'center',
          selectable: false,
          evented: false,
        });
        canvas.add(tempLine);
        tempLineRef.current = tempLine;
      }
    });

    document.addEventListener('keydown', toggleDrawingMode);
    updateCanvasSize();
    window.addEventListener('resize', updateCanvasSize);

    return () => {
      window.removeEventListener('resize', updateCanvasSize);
      document.removeEventListener('keydown', toggleDrawingMode);
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
