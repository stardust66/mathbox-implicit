let mathbox = mathBox({
  plugins: ['core', 'controls', 'cursor', 'mathbox'],
  controls: {
    klass: THREE.OrbitControls,
  },
});
if (mathbox.fallback) throw "WebGL not supported"

let three = mathbox.three;
three.renderer.setClearColor(new THREE.Color(0xFFFFFF), 1.0);

// 2D
let camera = mathbox.camera({
  position: [0, 0, 2],
  proxy: true
});

let view = mathbox.cartesian({
  range: [[-5, 5], [-5, 5], [-5, 5]],
  scale: [1, 1, 1]
});

view
  .axis({
    axis: 1,
    width: 3
  })
  .axis({
    axis: 2,
    width: 3
  })
  .axis({
    axis: 3,
    width: 3
  })
  .grid({
    width: 1
  });

mathbox.set('focus', 2);

const triangleData = view.array({
  channels: 3,
  items: 3,
  width: 0,
  data: [],
  live: false
});

const triangleFaces = view.strip({
  points: triangleData,
  color: '#e31b23',
  shaded: true
});

function implicitFunc(x, y, z) {
  return x**2 + y**2 + z**2 - 1;
}

const T = 1.61803398875;
function implicitFunc2(x, y, z) {
  return (2 - (Math.cos(x + T*y) + Math.cos(x - T*y) + Math.cos(y + T*z)
         + Math.cos(y - T*z) + Math.cos(z - T*x) + Math.cos(z + T*x)));
}

function heart(x, y, z) {
  return (x**2 + 9/4*z**2 + y**2 - 1)**3 - x**2 * y**3 - 9/80 * z**2 * y**3;
}

function cone(x, y, z) {
  return x**2 + y**2 - z**2;
}

const implicitTriangles = marchingCubes(-4.5, 4.5, -4.5, 4.5, -4.5, 4.5, implicitFunc2, 0, 20);

triangleData.set('data', implicitTriangles);
triangleData.set('width', implicitTriangles.length);

function marchingCubes(xMin, xMax, yMin, yMax, zMin, zMax, func,
                       c = 0, resolution = 128) {
  const xStep = (xMax - xMin) / resolution;
  const yStep = (yMax - yMin) / resolution;
  const zStep = (zMax - zMin) / resolution;
  const finalTriangles = [];
  for (let x = xMin; x < xMax; x += xStep) {
    for (let y = yMin; y < yMax; y += yStep) {
      for (let z = zMin; z < zMax; z += zStep) {
        // Same order as on http://paulbourke.net/geometry/polygonise/
        const cube = new MarchingCube(x, y, z, xStep, yStep, zStep, func, c);
        const cubeCase = triangleTable[cube.getIndex()];
        for (let i = 0; i < cubeCase.length; i++) {
          const triangle = cubeCase[i];
          finalTriangles.push([cube.getEdgePoint(triangle[0]),
                               cube.getEdgePoint(triangle[1]),
                               cube.getEdgePoint(triangle[2])]);
        }
      }
    }
  }
  return finalTriangles;
}

