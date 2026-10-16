import {
  Component,
  Suspense,
  useEffect,
  useMemo,
  useRef,
  useState,
  type MutableRefObject,
  type ReactNode,
} from "react";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { Billboard, OrbitControls } from "@react-three/drei";
import { RoundedBoxGeometry } from "three/addons/geometries/RoundedBoxGeometry.js";
import * as THREE from "three";
import type { OrbitControls as Controls } from "three-stdlib";
import {
  DEPARTMENTS,
  TILLS,
  ENTRY,
  PICKUP,
  FLOOR,
  FIXTURE_WIDTH,
  stock,
  type StoreState,
} from "../simulation/store";
const GREEN = "#28594a",
  WOOD = "#c99e70",
  CREAM = "#f5edda";
const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
const roundedGeometry = new RoundedBoxGeometry(1, 1, 1, 1, 0.1);
const materials = new Map<string, THREE.MeshStandardMaterial>();
function material(color: string) {
  if (!materials.has(color))
    materials.set(
      color,
      new THREE.MeshStandardMaterial({ color, roughness: 0.85 }),
    );
  return materials.get(color)!;
}
function Box({
  at,
  size,
  color,
  ...props
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
  onClick?: () => void;
}) {
  return (
    <mesh
      position={at}
      scale={size}
      geometry={boxGeometry}
      castShadow
      receiveShadow
      material={material(color)}
      dispose={null}
      {...props}
    />
  );
}
function SoftBox({
  at,
  size,
  color,
}: {
  at: [number, number, number];
  size: [number, number, number];
  color: string;
}) {
  return (
    <mesh
      position={at}
      scale={size}
      geometry={roundedGeometry}
      material={material(color)}
      castShadow
      receiveShadow
      dispose={null}
    />
  );
}
function Sign({
  text,
  at,
  width = 4,
  color = GREEN,
  background = CREAM,
  small = false,
  flat = false,
}: {
  text: string;
  at: [number, number, number];
  width?: number;
  color?: string;
  background?: string;
  small?: boolean;
  flat?: boolean;
}) {
  const texture = useMemo(() => {
    const canvas = document.createElement("canvas");
    canvas.width = 768;
    canvas.height = small ? 128 : 180;
    const ctx = canvas.getContext("2d")!;
    ctx.fillStyle = background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    ctx.fillStyle = color;
    ctx.font = `600 ${small ? 62 : 70}px system-ui, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, 384, canvas.height / 2, 730);
    const t = new THREE.CanvasTexture(canvas);
    t.colorSpace = THREE.SRGBColorSpace;
    return t;
  }, [text, color, background, small]);
  useEffect(() => () => texture.dispose(), [texture]);
  return (
    <mesh position={at} rotation={flat ? [-Math.PI / 2, 0, 0] : [0, 0, 0]}>
      <planeGeometry args={[width, (width * (small ? 128 : 180)) / 768]} />
      <meshBasicMaterial
        map={texture}
        side={THREE.DoubleSide}
        toneMapped={false}
      />
    </mesh>
  );
}
function DealFlag({
  at,
  store,
}: {
  at: [number, number, number];
  store: StoreState;
}) {
  const flag = useRef<THREE.Group>(null!);
  const reduced = matchMedia("(prefers-reduced-motion: reduce)").matches;
  useFrame(() => {
    if (flag.current)
      flag.current.rotation.z = reduced
        ? 0
        : Math.sin(store.time * 2.2) * 0.045;
  });
  return (
    <group position={at} ref={flag}>
      <Sign
        text="FRESH DEAL −20%"
        at={[0, 0, 0]}
        width={4.6}
        color="#7d4531"
        background="#f2cf96"
      />
      <Box at={[-1.9, -0.7, 0]} size={[0.07, 1.4, 0.07]} color={WOOD} />
      <Box at={[1.9, -0.7, 0]} size={[0.07, 1.4, 0.07]} color={WOOD} />
    </group>
  );
}
function Entrance({
  store,
  running,
  reduced,
}: {
  store: MutableRefObject<StoreState>;
  running: MutableRefObject<boolean>;
  reduced: boolean;
}) {
  const left = useRef<THREE.Group>(null!),
    right = useRef<THREE.Group>(null!);
  useFrame((_, dt) => {
    if (!running.current) return;
    const nearby = store.current.people.some(
      (p) =>
        p.stage !== "outside" &&
        Math.hypot(p.position[0] - ENTRY[0], p.position[1] - ENTRY[1]) < 4.5,
    );
    const target = nearby ? 1.85 : 0.67,
      amount = reduced ? 1 : 1 - Math.exp(-dt * 7);
    left.current.position.x = THREE.MathUtils.lerp(
      left.current.position.x,
      -target,
      amount,
    );
    right.current.position.x = THREE.MathUtils.lerp(
      right.current.position.x,
      target,
      amount,
    );
  });
  return (
    <group position={[ENTRY[0], 0, ENTRY[1] - 0.5]}>
      <Box at={[0, 0.07, -0.4]} size={[5.8, 0.04, 2.3]} color="#8da17e" />
      <Sign
        text="HELLO, NEIGHBOUR"
        at={[0, 0.12, -0.55]}
        width={4.4}
        flat
        background="#8da17e"
        color="#eef0dc"
      />
      {[-2.6, 2.6].map((x) => (
        <SoftBox
          key={x}
          at={[x, 1.18, 0]}
          size={[0.14, 2.36, 0.17]}
          color={GREEN}
        />
      ))}
      <SoftBox at={[0, 2.4, 0]} size={[5.4, 0.16, 0.2]} color={GREEN} />
      {[left, right].map((ref, i) => (
        <group ref={ref} key={i} position={[i ? 0.67 : -0.67, 1.2, 0]}>
          <mesh>
            <boxGeometry args={[1.3, 2.1, 0.04]} />
            <meshStandardMaterial
              color="#b2d2c9"
              transparent
              opacity={0.2}
              roughness={0.3}
            />
          </mesh>
          <Box at={[0, 0, 0.04]} size={[1.3, 0.09, 0.04]} color="#dce4d1" />
        </group>
      ))}
    </group>
  );
}
function CheckoutBelt({
  index,
  store,
  running,
}: {
  index: number;
  store: MutableRefObject<StoreState>;
  running: MutableRefObject<boolean>;
}) {
  const belt = useRef<THREE.Group>(null!);
  const payer = store.current.people.find(
    (p) => p.stage === "paying" && p.checkout === index,
  );
  useFrame(() => {
    if (!running.current || !belt.current) return;
    const person = store.current.people.find(
      (p) => p.stage === "paying" && p.checkout === index,
    );
    belt.current.position.z = person
      ? -0.35 + (Math.max(0, person.timer) / 4) * 0.7
      : 0;
  });
  return (
    <group ref={belt} position={[0.45, 1.6, 0]}>
      {payer?.basket.slice(0, 2).map((line, i) => (
        <SoftBox
          key={line.batchId}
          at={[0, 0.02, i * 0.37]}
          size={[0.28, 0.27, 0.27]}
          color={
            store.current.products.find((p) => p.id === line.productId)!.color
          }
        />
      ))}
    </group>
  );
}
function ProductStock({ state }: { state: StoreState }) {
  const refs = useRef<(THREE.InstancedMesh | null)[]>([]);
  const matrix = useMemo(() => new THREE.Object3D(), []);
  const shapes = ["box", "bottle", "round"] as const;
  useEffect(() => {
    shapes.forEach((shape, k) => {
      const mesh = refs.current[k];
      if (!mesh) return;
      let n = 0;
      for (const p of state.products.filter((p) => p.shape === shape)) {
        const dept = DEPARTMENTS.find((d) => d.id === p.department)!;
        const quantity = Math.min(24, stock(state, p.id).shelf);
        for (let i = 0; i < quantity; i++) {
          matrix.position.set(
            p.position[0] + ((i % 3) - 1) * 0.38,
            0.63 + Math.floor(i / (dept.kind === "produce" ? 12 : 6)) * 0.5,
            dept.position[1] +
              (dept.kind === "produce" ? 0.55 : 0.38) -
              Math.floor((i % (dept.kind === "produce" ? 12 : 6)) / 3) *
                (dept.kind === "produce" ? 0.32 : 0.62),
          );
          matrix.scale.set(
            shape === "round" ? 0.27 : 0.29,
            shape === "bottle" ? 0.48 : shape === "round" ? 0.3 : 0.4,
            0.3,
          );
          matrix.updateMatrix();
          mesh.setMatrixAt(n, matrix.matrix);
          mesh.setColorAt(n, new THREE.Color(p.color));
          n++;
        }
      }
      mesh.count = n;
      mesh.instanceMatrix.needsUpdate = true;
      if (mesh.instanceColor) mesh.instanceColor.needsUpdate = true;
      mesh.computeBoundingSphere();
    });
  }, [state, matrix]);
  return (
    <>
      {shapes.map((shape, i) => (
        <instancedMesh
          key={shape}
          ref={(el) => {
            refs.current[i] = el;
          }}
          args={[undefined, undefined, 24 * 24]}
          castShadow
        >
          {shape === "round" ? (
            <sphereGeometry args={[0.65, 8, 6]} />
          ) : shape === "bottle" ? (
            <cylinderGeometry args={[0.36, 0.46, 1, 8]} />
          ) : (
            <boxGeometry args={[1, 1, 1]} />
          )}
          <meshStandardMaterial roughness={0.8} />
        </instancedMesh>
      ))}
    </>
  );
}
function DepartmentFixture({
  department,
  state,
  selected,
  onSelect,
}: {
  department: (typeof DEPARTMENTS)[number];
  state: StoreState;
  selected: boolean;
  onSelect: (id: string) => void;
}) {
  const {
    position: [x, z],
    color,
    kind,
  } = department;
  const flash = state.events.find(
    (e) =>
      e.target === department.id &&
      state.time - e.at < (e.topic.includes("/strategy/") ? 8 : 1.2),
  );
  return (
    <group
      onClick={(e) => {
        e.stopPropagation();
        onSelect(department.id);
      }}
    >
      <SoftBox
        at={[x, 0.21, z]}
        size={[FIXTURE_WIDTH, 0.42, 2]}
        color={selected ? "#7bad92" : WOOD}
      />
      <Box
        at={[x, kind === "produce" ? 0.8 : 1.35, z - 0.72]}
        size={[FIXTURE_WIDTH - 0.1, kind === "produce" ? 1.2 : 2.3, 0.15]}
        color={kind === "fridge" ? "#bdd1cc" : "#d9c4a2"}
      />
      {(kind === "produce" ? [0.42, 0.94] : [0.42, 0.94, 1.45, 1.96]).map(
        (y) => (
          <Box
            key={y}
            at={[x, y, z]}
            size={[FIXTURE_WIDTH - 0.1, 0.09, 1.7]}
            color={kind === "fridge" ? "#e0e8dc" : CREAM}
          />
        ),
      )}
      {[-3.95, 3.95].map((a) => (
        <Box
          key={a}
          at={[x + a, kind === "produce" ? 0.8 : 1.4, z]}
          size={[0.12, kind === "produce" ? 1.2 : 2.5, 1.7]}
          color={color}
        />
      ))}
      {kind === "produce" &&
        [-3.95, 3.95].map((a) => (
          <Box
            key={`sign-post-${a}`}
            at={[x + a, 1.9, z - 0.65]}
            size={[0.09, 1.8, 0.09]}
            color={WOOD}
          />
        ))}
      <SoftBox
        at={[x, 2.7, z - 0.65]}
        size={[FIXTURE_WIDTH + 0.1, 0.48, 0.25]}
        color={GREEN}
      />
      <Sign
        text={department.name.toUpperCase()}
        at={[x, 2.72, z - 0.5]}
        width={6.8}
        color={CREAM}
        background={GREEN}
        small
      />
      {state.products
        .filter((p) => p.department === department.id)
        .map((p) => (
          <Sign
            key={p.id}
            text={`${p.name}  €${(p.price / 100).toFixed(2)}`}
            at={[p.position[0], 0.45, z + 0.92]}
            width={1.65}
            small
            color={
              state.mealActive && department.id === "bakery" ? "#a15b3c" : GREEN
            }
          />
        ))}
      {kind === "produce" &&
        state.products
          .filter((p) => p.department === department.id)
          .map((p) => (
            <group key={`crate-${p.id}`}>
              {[0.63, 1.14].map((y) => (
                <Box
                  key={y}
                  at={[p.position[0], y, z + 0.84]}
                  size={[1.5, 0.25, 0.1]}
                  color={WOOD}
                />
              ))}
            </group>
          ))}
      {kind === "fridge" && (
        <>
          {state.products
            .filter((p) => p.department === department.id)
            .map((p) => (
              <group key={`door-${p.id}`}>
                <mesh position={[p.position[0], 1.4, z + 0.9]}>
                  <planeGeometry args={[1.55, 1.9]} />
                  <meshStandardMaterial
                    color="#cce0db"
                    transparent
                    opacity={0.12}
                  />
                </mesh>
                <Box
                  at={[p.position[0] + 0.67, 1.4, z + 0.93]}
                  size={[0.05, 1.9, 0.06]}
                  color="#acbbb2"
                />
                <Box
                  at={[p.position[0] + 0.53, 1.4, z + 1]}
                  size={[0.05, 0.38, 0.08]}
                  color="#546f64"
                />
              </group>
            ))}
          <Box
            at={[x, 2.3, z]}
            size={[FIXTURE_WIDTH - 0.1, 0.08, 1.7]}
            color="#cae6df"
          />
          <Sign
            text={`${state.fridge.toFixed(1)}°C`}
            at={[x + 2.8, 2.73, z - 0.48]}
            width={0.85}
            background="#cae6df"
            small
          />
        </>
      )}
      {state.mealActive && department.id === "bakery" && (
        <DealFlag at={[x, 3.6, z]} store={state} />
      )}
      {(selected || flash) && (
        <mesh position={[x, 0.025, z]} rotation={[-Math.PI / 2, 0, 0]}>
          <planeGeometry args={[FIXTURE_WIDTH + 0.5, 2.6]} />
          <meshBasicMaterial
            color={selected ? "#b2ccb7" : "#f1d996"}
            transparent
            opacity={0.45}
          />
        </mesh>
      )}
    </group>
  );
}
const hairDome = new THREE.SphereGeometry(
  0.337,
  12,
  8,
  0,
  Math.PI * 2,
  0,
  1.36,
);
const curlGeometry = new THREE.SphereGeometry(1, 9, 7);
function Hair({ id }: { id: number }) {
  const style = id % 6,
    color = ["#44332b", "#b67948", "#70503d", "#302d2a", "#c7ab75", "#93958d"][
      Math.floor(id / 3) % 6
    ];
  const puff = (
    at: [number, number, number],
    scale: [number, number, number],
    key: string,
  ) => (
    <mesh
      key={key}
      position={at}
      scale={scale}
      geometry={curlGeometry}
      material={material(color)}
      castShadow
      dispose={null}
    />
  );
  return (
    <group>
      {style !== 3 && (
        <mesh
          geometry={hairDome}
          material={material(color)}
          position={[0, 0.02, -0.025]}
          scale={[1, style === 0 ? 0.8 : 1, 1]}
          castShadow
          dispose={null}
        />
      )}
      {style === 0 &&
        [-0.15, 0, 0.15].map((x, i) => (
          <group key={i} position={[x, 0.22, 0.22]} rotation={[0, 0, -0.16]}>
            <SoftBox at={[0, 0, 0]} size={[0.15, 0.09, 0.14]} color={color} />
          </group>
        ))}
      {style === 1 && (
        <group rotation={[0, 0, -0.3]} position={[-0.055, 0.29, 0.11]}>
          <SoftBox at={[0, 0, 0]} size={[0.43, 0.14, 0.3]} color={color} />
          <SoftBox
            at={[-0.11, -0.065, 0.13]}
            size={[0.17, 0.18, 0.15]}
            color={color}
          />
        </group>
      )}
      {style === 2 && (
        <>
          <SoftBox
            at={[-0.275, -0.045, -0.055]}
            size={[0.17, 0.39, 0.33]}
            color={color}
          />
          <SoftBox
            at={[0.275, -0.045, -0.055]}
            size={[0.17, 0.39, 0.33]}
            color={color}
          />
          <SoftBox
            at={[0, -0.09, -0.245]}
            size={[0.47, 0.37, 0.17]}
            color={color}
          />
          <SoftBox
            at={[0, 0.15, 0.26]}
            size={[0.46, 0.14, 0.12]}
            color={color}
          />
        </>
      )}
      {style === 3 && (
        <>
          {Array.from({ length: 9 }, (_, i) => {
            const angle = (i * Math.PI * 2) / 9;
            return puff(
              [
                Math.cos(angle) * 0.245,
                0.16 + Math.sin(i * 2) * 0.025,
                Math.sin(angle) * 0.245 - 0.015,
              ],
              [0.135, 0.14, 0.135],
              `curl-${i}`,
            );
          })}
          {[-0.14, 0, 0.14].map((x, i) =>
            puff([x, 0.31, -0.02], [0.15, 0.12, 0.16], `top-${i}`),
          )}
        </>
      )}
      {style === 4 && (
        <>
          {puff([0, 0.23, -0.33], [0.18, 0.17, 0.18], "bun")}
          <SoftBox
            at={[-0.27, 0.06, -0.02]}
            size={[0.085, 0.24, 0.19]}
            color={color}
          />
        </>
      )}
      {style === 5 && (
        <>
          {[-1, 1].map((side) => (
            <group key={side}>
              {puff(
                [side * 0.27, -0.035, -0.13],
                [0.12, 0.2, 0.17],
                `wave-${side}`,
              )}
              {puff(
                [side * 0.23, -0.16, -0.23],
                [0.13, 0.12, 0.14],
                `end-${side}`,
              )}
            </group>
          ))}
          <group position={[0.09, 0.25, 0.18]} rotation={[0, 0, 0.2]}>
            <SoftBox at={[0, 0, 0]} size={[0.3, 0.15, 0.18]} color={color} />
          </group>
        </>
      )}
    </group>
  );
}
function Human({
  id,
  store,
  running,
  reduced,
}: {
  id: number;
  store: MutableRefObject<StoreState>;
  running: MutableRefObject<boolean>;
  reduced: boolean;
}) {
  const person = store.current.people.find((p) => p.id === id)!;
  const root = useRef<THREE.Group>(null!),
    legA = useRef<THREE.Group>(null!),
    legB = useRef<THREE.Group>(null!),
    arm = useRef<THREE.Group>(null!),
    rightArm = useRef<THREE.Group>(null!),
    head = useRef<THREE.Group>(null!),
    body = useRef<THREE.Group>(null!),
    cargoBox = useRef<THREE.Group>(null!),
    pickedItem = useRef<THREE.Group>(null!),
    eyes = useRef<THREE.Group>(null!),
    basketRef = useRef<THREE.Group>(null!);
  const initialPosition = useRef<[number, number, number]>([
    person.position[0],
    0,
    person.position[1],
  ]);
  const stride = useRef(id),
    lastTime = useRef(store.current.time);
  const angle = useRef(0),
    previous = useRef(
      new THREE.Vector3(
        ...([person.position[0], 0, person.position[1]] as [
          number,
          number,
          number,
        ]),
      ),
    );
  const basket = person.basket.reduce((n, l) => n + l.quantity, 0),
    task = store.current.tasks.find((t) => t.id === person.taskId),
    carrying = !!task?.cargo.length;
  useFrame((_, dt) => {
    const p = store.current.people.find((p) => p.id === id)!;
    if (!root.current) return;
    root.current.visible = p.stage !== "outside";
    if (store.current.time < lastTime.current) {
      root.current.position.set(p.position[0], 0, p.position[1]);
      previous.current.copy(root.current.position);
    }
    lastTime.current = store.current.time;
    if (!running.current) return;
    const target = new THREE.Vector3(p.position[0], 0, p.position[1]);
    const factor = 1 - Math.exp(-Math.min(dt, 0.1) * 16);
    root.current.position.lerp(target, factor);
    const dx = target.x - previous.current.x,
      dz = target.z - previous.current.z,
      walking = p.moving;
    if (Math.abs(dx) + Math.abs(dz) > 0.001) angle.current = Math.atan2(dx, dz);
    if (p.stage === "picking") angle.current = Math.PI;
    if (p.stage === "paying") angle.current = -Math.PI / 2;
    if (p.role === "employee" && p.stage === "working" && !walking)
      angle.current = p.id < 102 || task?.kind === "checkout" ? 0 : Math.PI;
    root.current.rotation.y +=
      Math.atan2(
        Math.sin(angle.current - root.current.rotation.y),
        Math.cos(angle.current - root.current.rotation.y),
      ) * Math.min(dt * 12, 1);
    const distance = root.current.position.distanceTo(previous.current);
    const phase = (stride.current += walking
        ? Math.min(distance, 0.3) * 5.6
        : 0),
      idlePhase = store.current.time * 2 + id,
      gesture = !reduced;
    previous.current.copy(root.current.position);
    legA.current.rotation.x = gesture && walking ? Math.sin(phase) * 0.38 : 0;
    legB.current.rotation.x = -legA.current.rotation.x;
    arm.current.rotation.x = gesture
      ? p.stage === "picking"
        ? -1.1 + Math.sin(idlePhase * 3) * 0.12
        : p.stage === "paying"
          ? -0.8
          : walking
            ? Math.sin(phase) * 0.2
            : p.role === "employee"
              ? -0.65 + Math.sin(idlePhase) * 0.3
              : Math.sin(idlePhase * 0.6) * 0.06
      : 0;
    rightArm.current.rotation.x = carrying
      ? -0.9
      : gesture && p.role === "employee" && !walking
        ? -0.5 + Math.sin(idlePhase + 1) * 0.2
        : 0;
    head.current.position.y =
      1.39 + (gesture && !walking ? Math.sin(idlePhase * 0.6) * 0.013 : 0);
    head.current.rotation.z =
      gesture && p.stage === "picking" ? -0.12 + Math.sin(idlePhase) * 0.07 : 0;
    head.current.rotation.y =
      gesture && p.stage === "queueing" ? Math.sin(idlePhase * 0.5) * 0.16 : 0;
    eyes.current.scale.y =
      gesture && (store.current.time + id * 0.47) % 4.8 < 0.13 ? 0.12 : 1;
    if (p.stage === "leaving" && gesture)
      rightArm.current.rotation.z = -1.8 + Math.sin(idlePhase * 4) * 0.2;
    else rightArm.current.rotation.z = 0;
    body.current.rotation.z = gesture && walking ? Math.sin(phase) * 0.025 : 0;
    if (basketRef.current)
      basketRef.current.rotation.z =
        gesture && walking ? Math.sin(phase + 1) * 0.05 : 0;
    if (cargoBox.current)
      cargoBox.current.rotation.z =
        gesture && walking ? Math.sin(phase) * 0.045 : 0;
    pickedItem.current.visible =
      gesture && p.stage === "picking" && p.timer < 0.9;
    pickedItem.current.position.y =
      1.1 +
      (p.stage === "picking"
        ? Math.sin(Math.min(1, (0.9 - p.timer) / 0.9) * Math.PI) * 0.2
        : 0);
    root.current.position.y =
      gesture && walking ? Math.abs(Math.sin(phase)) * 0.025 : 0;
  });
  const employee = person.role === "employee";
  return (
    <group ref={root} position={initialPosition.current}>
      <group ref={body}>
        <group ref={legA} position={[-0.13, 0.44, 0]}>
          <SoftBox
            at={[0, -0.16, 0]}
            size={[0.18, 0.43, 0.2]}
            color="#394b50"
          />
          <Box at={[0, -0.37, 0.05]} size={[0.2, 0.12, 0.32]} color="#f2e9d3" />
        </group>
        <group ref={legB} position={[0.13, 0.44, 0]}>
          <SoftBox
            at={[0, -0.16, 0]}
            size={[0.18, 0.43, 0.2]}
            color="#394b50"
          />
          <Box at={[0, -0.37, 0.05]} size={[0.2, 0.12, 0.32]} color="#f2e9d3" />
        </group>
        <SoftBox
          at={[0, 0.83, 0]}
          size={[0.56, 0.66, 0.35]}
          color={person.outfit}
        />
        {employee && (
          <>
            <Box
              at={[0, 0.75, 0.19]}
              size={[0.38, 0.48, 0.035]}
              color="#b1c4a0"
            />
            <Box
              at={[-0.14, 1, 0.2]}
              size={[0.11, 0.065, 0.025]}
              color={CREAM}
            />
          </>
        )}
        <group ref={head} position={[0, 1.39, 0]}>
          <mesh castShadow>
            <sphereGeometry args={[0.32, 12, 10]} />
            <meshStandardMaterial color={person.skin} />
          </mesh>
          <Hair id={id} />
          <group ref={eyes}>
            {[-0.11, 0.11].map((x) => (
              <mesh key={x} position={[x, 0.02, 0.29]}>
                <sphereGeometry args={[0.027, 6, 6]} />
                <meshBasicMaterial color="#334137" />
              </mesh>
            ))}
          </group>
          {[-0.31, 0.31].map((x) => (
            <mesh
              key={`ear-${x}`}
              position={[x, -0.035, 0]}
              scale={[0.065, 0.09, 0.065]}
              geometry={curlGeometry}
              material={material(person.skin)}
              dispose={null}
            />
          ))}
          <mesh
            position={[0, -0.06, 0.3]}
            scale={[0.045, 0.05, 0.065]}
            geometry={curlGeometry}
            material={material(person.skin)}
            dispose={null}
          />
          <mesh position={[0, -0.12, 0.3]} rotation={[0, 0, Math.PI]}>
            <torusGeometry args={[0.065, 0.009, 4, 10, Math.PI]} />
            <meshBasicMaterial color="#7e5141" />
          </mesh>
        </group>
        <group ref={arm} position={[-0.36, 1.05, 0]}>
          <SoftBox
            at={[0, -0.2, 0]}
            size={[0.16, 0.42, 0.19]}
            color={person.skin}
          />
        </group>
        <group ref={rightArm} position={[0.36, 1.05, 0]}>
          <SoftBox
            at={[0, -0.2, 0]}
            size={[0.16, 0.42, 0.19]}
            color={person.skin}
          />
        </group>
        {!employee && (
          <group ref={basketRef} position={[0.48, 0.58, 0.2]}>
            <Box at={[0, 0, 0]} size={[0.48, 0.28, 0.38]} color="#c49a5c" />
            <Box
              at={[0, 0.07, 0]}
              size={[0.4, 0.22, 0.3]}
              color={basket ? "#9fb078" : "#7f765e"}
            />
            <mesh position={[0, 0.27, 0]} rotation={[0, Math.PI / 2, 0]}>
              <torusGeometry args={[0.2, 0.025, 5, 12, Math.PI]} />
              <meshStandardMaterial color="#776951" />
            </mesh>
            {person.basket.slice(0, 3).map((line, i) => (
              <Box
                key={line.batchId}
                at={[
                  -0.11 + (i % 2) * 0.19,
                  0.17 + (i === 2 ? 0.08 : 0),
                  i === 2 ? -0.07 : 0.06,
                ]}
                size={[0.15, 0.23, 0.15]}
                color={
                  store.current.products.find((p) => p.id === line.productId)!
                    .color
                }
              />
            ))}
          </group>
        )}
        {carrying && (
          <group ref={cargoBox} position={[0, 0.7, 0.5]}>
            <SoftBox at={[0, 0, 0]} size={[0.65, 0.55, 0.5]} color={WOOD} />
            <Box at={[0, 0.28, 0]} size={[0.09, 0.015, 0.51]} color="#e8d1aa" />
          </group>
        )}
        {task && task.stage !== "complete" && (
          <mesh position={[0, 0.07, 0]} rotation={[-Math.PI / 2, 0, 0]}>
            <ringGeometry args={[0.56, 0.65, 24]} />
            <meshBasicMaterial
              color={
                task.kind === "checkout"
                  ? "#e3bb68"
                  : task.kind === "online"
                    ? "#a798c3"
                    : "#8eae73"
              }
              transparent
              opacity={0.75}
            />
          </mesh>
        )}
      </group>
      {task && task.stage !== "complete" && (
        <Billboard position={[0, 2.25, 0]}>
          <Sign
            text={
              task.kind === "checkout"
                ? "OPENING TILL 3"
                : task.kind === "online"
                  ? "COLLECTION"
                  : "STOCK RUN"
            }
            at={[0, 0, 0]}
            width={3.2}
            small
            background={task.kind === "checkout" ? "#f2ddac" : "#e3ebd3"}
          />
        </Billboard>
      )}
      <group ref={pickedItem} position={[-0.38, 1.1, 0.42]} visible={false}>
        <SoftBox
          at={[0, 0, 0]}
          size={[0.19, 0.22, 0.2]}
          color={
            store.current.products.find(
              (v) => v.id === person.list[person.visited],
            )?.color ?? "#debc70"
          }
        />
      </group>
    </group>
  );
}
function Camera({ reset }: { reset: number }) {
  const { camera, size } = useThree();
  const controls = useRef<Controls>(null!);
  useEffect(() => {
    const scale = Math.min(
      size.width / (size.width < 700 ? 59 : 58),
      size.height / 35,
    );
    (camera as THREE.OrthographicCamera).zoom = scale;
    camera.position.set(35, 43, 45);
    camera.lookAt(0, 0, 1.5);
    camera.updateProjectionMatrix();
    if (controls.current) {
      controls.current.target.set(0, 0, 1.5);
      controls.current.update();
    }
  }, [camera, reset, size.width, size.height]);
  return (
    <OrbitControls
      ref={controls}
      makeDefault
      enableDamping
      dampingFactor={0.13}
      minZoom={5}
      maxZoom={75}
      maxPolarAngle={Math.PI * 0.38}
      minPolarAngle={Math.PI * 0.17}
      minAzimuthAngle={-0.2}
      maxAzimuthAngle={Math.PI * 0.48}
      maxDistance={90}
      enablePan
      screenSpacePanning={false}
      mouseButtons={{
        LEFT: THREE.MOUSE.PAN,
        MIDDLE: THREE.MOUSE.DOLLY,
        RIGHT: THREE.MOUSE.ROTATE,
      }}
      touches={{ ONE: THREE.TOUCH.PAN, TWO: THREE.TOUCH.DOLLY_ROTATE }}
    />
  );
}
function World({
  state,
  store,
  running,
  reduced,
  selected,
  onSelect,
}: {
  state: StoreState;
  store: MutableRefObject<StoreState>;
  running: MutableRefObject<boolean>;
  reduced: boolean;
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <group>
      <SoftBox
        at={[0, -0.45, 0]}
        size={[FLOOR.width, 0.8, FLOOR.depth]}
        color="#d5c9ad"
      />
      <Box
        at={[0, -0.03, 0]}
        size={[FLOOR.width - 0.6, 0.12, FLOOR.depth - 0.6]}
        color="#f0e7d1"
      />
      {Array.from({ length: 21 }, (_, i) => (
        <Box
          key={`x${i}`}
          at={[-20 + i * 2, 0.04, 0]}
          size={[0.018, 0.006, 35.5]}
          color="#ddd2bb"
        />
      ))}
      {Array.from({ length: 19 }, (_, i) => (
        <Box
          key={`z${i}`}
          at={[0, 0.04, -18 + i * 2]}
          size={[41.5, 0.006, 0.018]}
          color="#ddd2bb"
        />
      ))}
      {/* Low cutaway walls keep the backroom visible at every supported camera angle. */}
      <Box at={[0, 0.26, -17.8]} size={[42, 0.52, 0.28]} color="#c3ceb7" />
      <Box at={[-20.8, 0.18, 0]} size={[0.28, 0.36, 36]} color="#d2d8bc" />
      <Box at={[20.8, 0.18, 0]} size={[0.28, 0.36, 36]} color="#d2d8bc" />
      <Box at={[0, 0.56, -17.8]} size={[42, 0.12, 0.4]} color={GREEN} />
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect("stockroom");
        }}
      >
        <Box at={[10, 0.07, -13.8]} size={[17, 0.06, 5.4]} color="#d5d2b8" />
        <Sign text="BACKROOM STOCK" at={[9, 0.13, -12]} width={7} flat />
        {[5, 8.5, 12, 15.5].map((x, i) => (
          <group key={x}>
            <Box at={[x, 0.6, -14.8]} size={[2, 1.2, 1.3]} color={WOOD} />
            <Box
              at={[x, 0.65, -14.12]}
              size={[0.12, 1, 0.02]}
              color="#e8d1aa"
            />
            {i % 2 === 0 && (
              <Box
                at={[x, 1.5, -14.8]}
                size={[1.8, 0.6, 1.2]}
                color="#b48f68"
              />
            )}
          </group>
        ))}
      </group>
      <group
        onClick={(e) => {
          e.stopPropagation();
          onSelect("receiving");
        }}
      >
        <Box at={[-13, 0.08, -13.8]} size={[10, 0.08, 5.4]} color="#dbd7bc" />
        <Sign text="DELIVERIES" at={[-13, 0.15, -12]} width={6} flat />
        {[0, 1, 2].map((i) => (
          <Box
            key={i}
            at={[-16 + i * 2.6, 0.5, -14.8]}
            size={[1.5, 1, 1.4]}
            color={
              state.batches.some((b) => b.receiving > 0) ? "#c39460" : "#d6b78d"
            }
          />
        ))}
      </group>
      {DEPARTMENTS.map((d) => (
        <DepartmentFixture
          key={d.id}
          department={d}
          state={state}
          selected={selected === d.id}
          onSelect={onSelect}
        />
      ))}
      <ProductStock state={state} />
      {TILLS.map(([x, z], i) => (
        <group
          key={i}
          onClick={(e) => {
            e.stopPropagation();
            onSelect("checkouts");
          }}
        >
          <SoftBox at={[x, 0.65, z]} size={[2.4, 1.3, 2]} color={GREEN} />
          <Box at={[x, 1.35, z]} size={[2.6, 0.12, 2.15]} color="#ddc7a0" />
          <Box
            at={[x, 1.45, z + 0.2]}
            size={[1.8, 0.07, 1.2]}
            color="#586e60"
          />
          <SoftBox
            at={[x - 0.5, 1.65, z - 0.5]}
            size={[0.72, 0.48, 0.14]}
            color="#344e46"
          />
          <Box
            at={[x - 0.5, 1.67, z - 0.41]}
            size={[0.56, 0.3, 0.02]}
            color="#a6c8a0"
          />
          <group position={[x, 0, z]}>
            <CheckoutBelt index={i} store={store} running={running} />
          </group>
          <Sign
            text={`${i + 1}  ${state.checkouts[i] ? "OPEN" : "CLOSED"}`}
            at={[x, 2.2, z - 0.5]}
            width={2.4}
            color={state.checkouts[i] ? GREEN : "#877565"}
          />
          <Box
            at={[x + 1.6, 0.08, z + 2]}
            size={[0.06, 0.04, 3.2]}
            color="#baa77e"
          />
        </group>
      ))}
      <group
        position={[PICKUP[0] - 14, 0, PICKUP[1] - 8]}
        onClick={(e) => {
          e.stopPropagation();
          onSelect("pickup");
        }}
      >
        <SoftBox at={[14, 0.6, 6.2]} size={[3.2, 1.2, 2]} color="#b2bc9b" />
        <Sign text="COLLECT" at={[14, 1.8, 5.4]} width={3.1} />
        {state.onlineComplete > 0 && (
          <Box at={[14, 1.5, 6.2]} size={[0.8, 0.6, 0.7]} color={WOOD} />
        )}
      </group>
      <Entrance store={store} running={running} reduced={reduced} />
      {[-19, 20].map((x) => (
        <group key={x}>
          <mesh position={[x, 0.4, 15]}>
            <cylinderGeometry args={[0.5, 0.4, 0.8, 10]} />
            <meshStandardMaterial color="#bd9672" />
          </mesh>
          {[-0.35, 0, 0.35].map((a, i) => (
            <mesh
              key={i}
              position={[x + a, 1.2 + i * 0.2, 15]}
              rotation={[0, 0, a]}
              scale={[0.5, 1, 0.4]}
            >
              <sphereGeometry args={[0.6, 8, 6]} />
              <meshStandardMaterial color={i % 2 ? "#738d59" : "#8fa66b"} />
            </mesh>
          ))}
        </group>
      ))}
      <Box at={[18, 1.5, -17]} size={[0.09, 3, 0.09]} color={GREEN} />
      <group position={[18, 3, -17]}>
        <Box at={[0, 0, 0]} size={[0.35, 0.25, 0.65]} color="#ece8d8" />
        <mesh position={[0, 0, 0.35]} rotation={[Math.PI / 2, 0, 0]}>
          <cylinderGeometry args={[0.1, 0.1, 0.1, 10]} />
          <meshStandardMaterial color="#344d42" />
        </mesh>
      </group>
      {state.people.map((p) => (
        <Human
          key={p.id}
          id={p.id}
          store={store}
          running={running}
          reduced={reduced}
        />
      ))}
    </group>
  );
}
class SceneBoundary extends Component<
  { children: ReactNode; fallback: ReactNode },
  { failed: boolean }
> {
  state = { failed: false };
  static getDerivedStateFromError() {
    return { failed: true };
  }
  render() {
    return this.state.failed ? this.props.fallback : this.props.children;
  }
}
function Fallback({ onSelect }: { onSelect: (id: string) => void }) {
  return (
    <div className="scene-fallback">
      <h2>Your store, at a glance</h2>
      <p>
        The 3D view is unavailable on this device. All store operations and
        decisions are available below.
      </p>
      <div>
        {DEPARTMENTS.map((d) => (
          <button key={d.id} onClick={() => onSelect(d.id)}>
            {d.name}
          </button>
        ))}
      </div>
    </div>
  );
}
export default function StoreScene({
  state,
  store,
  running,
  selected,
  onSelect,
  cameraReset,
  active,
}: {
  state: StoreState;
  store: MutableRefObject<StoreState>;
  running: MutableRefObject<boolean>;
  selected: string | null;
  onSelect: (id: string) => void;
  cameraReset: number;
  active: boolean;
}) {
  const [reduced, setReduced] = useState(
    () => matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const query = matchMedia("(prefers-reduced-motion: reduce)");
    const handler = () => setReduced(query.matches);
    query.addEventListener("change", handler);
    return () => query.removeEventListener("change", handler);
  }, []);
  const [webgl] = useState(() => {
    try {
      const c = document.createElement("canvas");
      const gl = c.getContext("webgl2");
      if (!gl) return false;
      gl.getExtension("WEBGL_lose_context")?.loseContext();
      return true;
    } catch {
      return false;
    }
  });
  const small = typeof window !== "undefined" && window.innerWidth < 700;
  const fallback = <Fallback onSelect={onSelect} />;
  return (
    <SceneBoundary fallback={fallback}>
      {webgl ? (
        <Suspense
          fallback={<div className="scene-loading">Opening your store…</div>}
        >
          <Canvas
            orthographic
            frameloop={running.current && active ? "always" : "demand"}
            shadows={!small}
            dpr={[1, small ? 1.25 : 1.6]}
            camera={{ position: [35, 43, 45], zoom: 18, near: 0.1, far: 150 }}
            gl={{
              antialias: true,
              powerPreference: small ? "low-power" : "high-performance",
            }}
            fallback={fallback}
            onCreated={({ gl }) => {
              gl.setClearColor("#e7e3d4");
            }}
            aria-label="Interactive 3D supermarket. Drag to pan, pinch or scroll to zoom. Select a department to inspect it."
          >
            <ambientLight intensity={0.9} />
            <hemisphereLight args={["#fff4d6", "#aabda4", 1.0]} />
            <directionalLight
              position={[2, 22, 12]}
              intensity={2.2}
              castShadow={!small}
              shadow-mapSize={[1024, 1024]}
              shadow-camera-left={-25}
              shadow-camera-right={25}
              shadow-camera-top={25}
              shadow-camera-bottom={-25}
              shadow-normalBias={0.06}
            />
            <World
              state={state}
              store={store}
              running={running}
              reduced={reduced}
              selected={selected}
              onSelect={onSelect}
            />
            <Camera reset={cameraReset} />
          </Canvas>
        </Suspense>
      ) : (
        fallback
      )}
    </SceneBoundary>
  );
}
