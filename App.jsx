import { Canvas, useFrame, useThree } from "@react-three/fiber";
import { EffectComposer, Bloom } from "@react-three/postprocessing";
import { useMemo, useRef, useState } from "react";
import * as THREE from "three";

function Streaks({ count = 400, color = "cyan" }) {
  const mesh = useRef();
  const { mouse } = useThree();

  const particles = useMemo(() => {
    const temp = [];
    for (let i = 0; i < count; i++) {
      const radius = THREE.MathUtils.randFloat(200, 600);
      const angle = THREE.MathUtils.randFloat(0, Math.PI * 2);
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      const z = THREE.MathUtils.randFloat(-1000, -200);
      temp.push({ x, y, z, speed: THREE.MathUtils.randFloat(6, 14) });
    }
    return temp;
  }, [count]);

  useFrame((state) => {
    mesh.current.children.forEach((child, i) => {
      // Parallax: shift x/y based on mouse
      child.position.x = particles[i].x + mouse.x * 100;
      child.position.y = particles[i].y + mouse.y * 100;

      // Move in z
      child.position.z += particles[i].speed;

      // Reset when out of view
      if (child.position.z > 50) {
        child.position.z = THREE.MathUtils.randFloat(-1000, -200);
      }

      // Simulate motion blur by scaling opacity with speed
      const material = child.material;
      material.opacity = Math.min(1, particles[i].speed / 10);
    });
  });

  return (
    <group ref={mesh}>
      {particles.map((p, i) => (
        <mesh key={i} position={[p.x, p.y, p.z]}>
          <planeGeometry args={[2, 100]} />
          <meshBasicMaterial
            color={color}
            transparent
            opacity={0.8}
            blending={THREE.AdditiveBlending}
          />
        </mesh>
      ))}
    </group>
  );
}

export default function App() {
  const [color, setColor] = useState("#00ffff");

  return (
    <>
      <Canvas camera={{ fov: 75, position: [0, 0, 10] }}>
        <color attach="background" args={["black"]} />
        <Streaks count={400} color={color} />
        <EffectComposer>
          <Bloom luminanceThreshold={0} luminanceSmoothing={0.9} intensity={2} />
        </EffectComposer>
      </Canvas>
      <div
        style={{
          position: "absolute",
          top: "10px",
          left: "10px",
          zIndex: 10,
          color: "white",
          background: "rgba(0,0,0,0.4)",
          padding: "10px",
          borderRadius: "8px",
          fontFamily: "sans-serif",
        }}
      >
        <label>Color: </label>
        <input
          type="color"
          value={color}
          onChange={(e) => setColor(e.target.value)}
        />
      </div>
    </>
  );
}
