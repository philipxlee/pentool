import React, { useState, useEffect, useRef } from 'react';
import { fabric } from 'fabric';
import shirtImage from '../assets/outline.png';
const imageUrl = shirtImage;

const PenToolCanvas = () => {
  const [isDrawing, setIsDrawing] = useState(false);
  const canvasRef = useRef(null);
  const drawingModeRef = useRef('line');
  const isDrawingRef = useRef(false);
  const lastPointRef = useRef(null);
  const tempLineRef = useRef(null);
  const pointsRef = useRef([]);
  const handleLineRef = useRef(null);
  const startCircleRef = useRef(null);
  const endCircleRef = useRef(null);

  useEffect(() => {
    let isMounted = true;
    const canvasElement = canvasRef.current;
    const canvas = new fabric.Canvas(canvasElement, {
      selection: false,
    });

    fabric.Image.fromURL(imageUrl, function(img) {
      if (!isMounted) return;
      const centeredLeftPosition = (canvas.width - img.getScaledWidth()) / 1.2;
      img.set({
        scaleX: 0.6,
        scaleY: 0.6,
      });
      // Set the image as background with centered position
      canvas.setBackgroundImage(img, canvas.renderAll.bind(canvas), {
        top: 0,
        left: centeredLeftPosition,
        originX: 'left',
        originY: 'top',
      });
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
        radius: 5,
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
          strokeWidth: 5,
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
          strokeWidth: 5,
          fill: '',
          selectable: false,
          evented: false,
        });
        canvas.add(curve);
        pointsRef.current = [];
        lastPointRef.current = { x: end.x, y: end.y };
        canvas.getObjects('circle').forEach((obj) => {
          if (obj.left === control.x && obj.top === control.y) {
            canvas.remove(obj);
          }
        });
      }
    };

    const updateHandle = (circle, isStartCircle) => {
      const oppositeCircleRef = isStartCircle ? endCircleRef : startCircleRef;
      const line = handleLineRef.current;
      const lastPoint = lastPointRef.current;

      if (!line || !circle || !oppositeCircleRef.current || !lastPoint) return;

      const currentCircle = circle;
      const oppositeCircle = oppositeCircleRef.current;

      // Calculate angle
      const dx = oppositeCircle.left - currentCircle.left;
      const dy = oppositeCircle.top - currentCircle.top;
      const angle = Math.atan2(dy, dx);

      // Update line position
      line.set({
        x1: currentCircle.left,
        y1: currentCircle.top,
        x2: oppositeCircle.left,
        y2: oppositeCircle.top,
      });

      // Ensure the line's midpoint stays at the last point
      const midX = (line.x1 + line.x2) / 2;
      const midY = (line.y1 + line.y2) / 2;
      const deltaX = lastPoint.x - midX;
      const deltaY = lastPoint.y - midY;

      line.set({
        x1: line.x1 + deltaX,
        y1: line.y1 + deltaY,
        x2: line.x2 + deltaX,
        y2: line.y2 + deltaY,
      });

      currentCircle.set({ left: line.x1, top: line.y1 });
      oppositeCircle.set({ left: line.x2, top: line.y2 });

      // Ensure the circles move with the line ends
      currentCircle.setCoords();
      oppositeCircle.setCoords();

      canvas.renderAll();
    };

    const drawHandle = () => {
      if (!lastPointRef.current) return;

      const handleLength = 100; 
      const halfLength = handleLength / 2;
      const startX = lastPointRef.current.x - halfLength;
      const startY = lastPointRef.current.y;
      const endX = lastPointRef.current.x + halfLength;
      const endY = lastPointRef.current.y;

      const handleLine = new fabric.Line([startX, startY, endX, endY], {
        strokeWidth: 2,
        stroke: 'blue',
        selectable: false,
        evented: false,
      });

      canvas.add(handleLine);
      handleLineRef.current = handleLine;

      // Create draggable circles
      const createCircle = (left, top, isStartCircle) => {
        const circle = new fabric.Circle({
          left,
          top,
          strokeWidth: 2,
          radius: 5,
          fill: '#fff',
          stroke: '#666',
          originX: 'center',
          originY: 'center',
          hasControls: false,
          hasBorders: false,
          selectable: true,
          lockRotation: true,
        });

        circle.on('moving', function () {
          updateHandle(circle, isStartCircle);
        });

        return circle;
      };

      const startCircle = createCircle(startX, startY, true);
      const endCircle = createCircle(endX, endY, false);

      canvas.add(startCircle, endCircle);
      startCircleRef.current = startCircle;
      endCircleRef.current = endCircle;

      // Disable further drawing
      setIsDrawing(false);
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
      } else if (event.keyCode == 87) {
        isDrawingRef.current = false; // Disable drawing mode
        setIsDrawing(false)

        if (tempLineRef.current) {
          canvas.remove(tempLineRef.current);
          tempLineRef.current = null;
        }

        if (!handleLineRef.current && lastPointRef.current) {
          drawHandle();
        }
        canvas.renderAll();
      }
    };

    const removeHandle = () => {
      if (handleLineRef.current) {
        canvas.remove(handleLineRef.current);
        handleLineRef.current = null;
      }
      if (startCircleRef.current) {
        canvas.remove(startCircleRef.current);
        startCircleRef.current = null;
      }
      if (endCircleRef.current) {
        canvas.remove(endCircleRef.current);
        endCircleRef.current = null;
      }
      canvas.renderAll();
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
      removeHandle()
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
          strokeWidth: 3,
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
      isMounted = false;
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
