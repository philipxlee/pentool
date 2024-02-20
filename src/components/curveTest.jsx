import React, { useEffect } from 'react';
import { fabric } from 'fabric';
 
const BezierCurveCanvas = () => {
  useEffect(() => {
    // Initialize Fabric Canvas
    const canvas = new fabric.Canvas('bezier-canvas');
 
    // Define points
    const startPoint = { x: 100, y: 100 };
    const controlPoint1 = { x: 150, y: 50 };
    const controlPoint2 = { x: 250, y: 250 };
    const endPoint = { x: 300, y: 100 };
 
    // Define path string for cubic Bézier curve
    // M = moveto, C = curveto (cubic Bézier)
    const pathString = `M ${startPoint.x} ${startPoint.y} C ${controlPoint1.x} ${controlPoint1.y}, ${controlPoint2.x} ${controlPoint2.y}, ${endPoint.x} ${endPoint.y}`;
 
    // Create a path object and add it to the canvas
    const path = new fabric.Path(pathString);
    path.set({ fill: 'transparent', stroke: 'black', strokeWidth: 2 });
    canvas.add(path);

    const dotOptions1 = { radius: 3, fill: 'red', originX: 'center', originY: 'center' };
    const dotOptions2 = { radius: 3, fill: 'blue', originX: 'center', originY: 'center' };
    const controlPoint1Dot = new fabric.Circle({ ...dotOptions1, left: controlPoint1.x, top: controlPoint1.y });
    const controlPoint2Dot = new fabric.Circle({ ...dotOptions1, left: controlPoint2.x, top: controlPoint2.y });
    const controlPoint3Dot = new fabric.Circle({ ...dotOptions2, left: startPoint.x, top: startPoint.y });
    const controlPoint4Dot = new fabric.Circle({ ...dotOptions2, left: endPoint.x, top: endPoint.y });

    // Add dots to the canvas
    canvas.add(controlPoint1Dot, controlPoint2Dot, controlPoint3Dot, controlPoint4Dot);

 
  }, []);
 
  return <canvas id="bezier-canvas" width="400" height="200" />;
};
 
export default BezierCurveCanvas;