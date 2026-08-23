import * as THREE from 'three';
import { SVGLoader } from 'three/addons/loaders/SVGLoader.js';

export const DEPTH = 0.14;

const extrudeSettings = {
  depth: DEPTH,
  bevelEnabled: true,
  bevelThickness: DEPTH * 0.07,
  bevelSize: 0.008,
  bevelSegments: 4,
  curveSegments: 24,
};

function materialForFill(fill, materials) {
  if (fill === '#c9a227') return materials.gold;
  return materials.burgundy;
}

export async function createLogoGroupFromFile(materials) {
  const group = new THREE.Group();
  const loader = new SVGLoader();
  const response = await fetch('./logo.svg');
  const data = loader.parse(await response.text());

  data.paths.forEach((path) => {
    const fill = path.userData?.style?.fill || '#722f37';
    const mat = materialForFill(fill, materials);
    SVGLoader.createShapes(path).forEach((shape) => {
      const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);
      geometry.computeVertexNormals();
      group.add(new THREE.Mesh(geometry, mat));
    });
  });

  group.scale.set(0.011, -0.011, 0.011);
  group.position.set(0, 0.05, -DEPTH / 2);
  return group;
}
