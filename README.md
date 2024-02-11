# Pen Tool


### Attributions
- Fabric.js -- http://fabricjs.com/docs/fabric.Canvas.html
- OpenAI ChatGPT -- https://chat.openai.com


---
  
### Installation
```
- pip install react@18.2.0
- pip install fabric@5.3.0
```

--- 

### Running the Program
- Run `npm start` in the terminal.
- Click `shift` to toggle drawing mode, allowing users to enter and exit the pen tool.
- In drawing mode, press on the screen to draw on a point.
- A preview line will follow your cursor until another click is detected, and a line will then be drawn.
- While in drawing mode, click `q` to toggle the ability to draw curves.
- Drawing curves requires the placement of three points:
    - 1st point: where you want the curve to start
    - 2nd point: where the curve will change inflexion
    - 3rd point: where the curve ends

---

### Notes
- The curve tool is modeled after a quadratic function, so its functionality is more limited than other illustrators that model their curve tools after the Bezier curve.
- The limitations of fabrics is that it does not come with tools to implement a Bezier curve.

---