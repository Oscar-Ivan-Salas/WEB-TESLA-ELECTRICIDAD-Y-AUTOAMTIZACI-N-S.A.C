import * as THREE from 'three';
import {
  IfcAPI,
  IFCWALLSTANDARDCASE,
  IFCSLAB,
  IFCCOLUMN,
  IFCBEAM,
  IFCDUCTSEGMENT,
  IFCDUCTFITTING,
  IFCFLOWTERMINAL,
  IFCCABLECARRIERSEGMENT,
  IFCCABLESEGMENT,
  IFCPIPESEGMENT,
  IFCPIPEFITTING,
  IFCPUMP,
  IFCVALVE,
} from 'web-ifc';
import ifcWasmUrl from 'web-ifc/web-ifc.wasm?url';

export interface IfcElementCounts {
  Muros: number;
  Losas: number;
  Columnas: number;
  Bandejas: number;
  Conductos: number;
  Tuberías: number;
  Terminales: number;
}

export interface IfcLoadResult {
  group: THREE.Group;
  meshCount: number;
  counts: IfcElementCounts;
}

const MAT = {
  structure: new THREE.MeshPhysicalMaterial({ color: 0x1e293b, roughness: 0.9, transparent: true, opacity: 0.25, side: THREE.DoubleSide }),
  electrical: new THREE.MeshPhysicalMaterial({ color: 0xffb800, metalness: 0.6, roughness: 0.4, transparent: true, opacity: 0.6, side: THREE.DoubleSide }),
  sanitary: new THREE.MeshPhysicalMaterial({ color: 0x00a8e8, metalness: 0.5, roughness: 0.3, transparent: true, opacity: 0.55, side: THREE.DoubleSide }),
  hvac: new THREE.MeshPhysicalMaterial({ color: 0x9ca3af, metalness: 0.7, roughness: 0.3, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
  generic: new THREE.MeshPhysicalMaterial({ color: 0x8fa8c8, metalness: 0.2, roughness: 0.45, side: THREE.DoubleSide }),
} as const;

type LayerKey = 'electrical' | 'sanitary' | 'hvac' | 'structure';

function classifyType(typeId: number): { layer?: LayerKey; mat: THREE.Material } {
  if (typeId === IFCWALLSTANDARDCASE || typeId === IFCSLAB || typeId === IFCCOLUMN || typeId === IFCBEAM) {
    return { layer: 'structure', mat: MAT.structure };
  }
  if (typeId === IFCCABLECARRIERSEGMENT || typeId === IFCCABLESEGMENT) {
    return { layer: 'electrical', mat: MAT.electrical };
  }
  if (typeId === IFCDUCTSEGMENT || typeId === IFCDUCTFITTING || typeId === IFCFLOWTERMINAL) {
    return { layer: 'hvac', mat: MAT.hvac };
  }
  if (typeId === IFCPIPESEGMENT || typeId === IFCPIPEFITTING || typeId === IFCPUMP || typeId === IFCVALVE) {
    return { layer: 'sanitary', mat: MAT.sanitary };
  }
  return { mat: MAT.generic };
}

export async function loadIfcToThree(buffer: ArrayBuffer, onProgress?: (p: number) => void): Promise<IfcLoadResult> {
  const api = new IfcAPI();
  await api.Init(() => ifcWasmUrl);

  const modelID = api.OpenModel(new Uint8Array(buffer), {
    COORDINATE_TO_ORIGIN: true,
  });

  const group = new THREE.Group();
  const flatMeshes = api.LoadAllGeometry(modelID);
  let meshCount = 0;

  for (let i = 0; i < flatMeshes.size(); i++) {
    const flatMesh = flatMeshes.get(i);
    const placed = flatMesh.geometries.get(0);
    const geom = api.GetGeometry(modelID, placed.geometryExpressID);
    const vSize = geom.GetVertexDataSize();
    const iSize = geom.GetIndexDataSize();
    if (!vSize || !iSize) continue;

    const verts = api.GetVertexArray(geom.GetVertexData(), vSize);
    const indices = api.GetIndexArray(geom.GetIndexData(), iSize);

    let maxIndex = 0;
    for (let m = 0; m < indices.length; m++) {
      if (indices[m] > maxIndex) maxIndex = indices[m];
    }
    const vertsCount = maxIndex + 1;
    const stride = vertsCount > 0 ? Math.round(vSize / vertsCount) : 3;
    const positions = new Float32Array(vertsCount * 3);
    if (stride >= 6) {
      for (let j = 0, k = 0; j < vertsCount; j++, k += 6) {
        positions[j * 3] = verts[k];
        positions[j * 3 + 1] = verts[k + 1];
        positions[j * 3 + 2] = verts[k + 2];
      }
    } else {
      positions.set(verts.subarray(0, vertsCount * 3));
    }

    const bgeo = new THREE.BufferGeometry();
    bgeo.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    bgeo.setIndex(new THREE.BufferAttribute(indices, 1));
    bgeo.computeVertexNormals();

    const type = api.GetLineType(modelID, flatMesh.expressID) as number;
    const { layer, mat } = classifyType(type);
    const mesh = new THREE.Mesh(bgeo, mat);
    if (layer) mesh.userData.layer = layer;
    mesh.applyMatrix4(new THREE.Matrix4().fromArray(placed.flatTransformation));
    group.add(mesh);
    meshCount++;
    onProgress?.(Math.round(((i + 1) / flatMeshes.size()) * 100));
  }

  const countType = (typeId: number) => api.GetLineIDsWithType(modelID, typeId).size();
  const counts: IfcElementCounts = {
    Muros: countType(IFCWALLSTANDARDCASE),
    Losas: countType(IFCSLAB),
    Columnas: countType(IFCCOLUMN),
    Bandejas: countType(IFCCABLECARRIERSEGMENT),
    Conductos: countType(IFCDUCTSEGMENT),
    Tuberías: countType(IFCPIPESEGMENT),
    Terminales: countType(IFCFLOWTERMINAL),
  };

  api.CloseModel(modelID);
  return { group, meshCount, counts };
}
