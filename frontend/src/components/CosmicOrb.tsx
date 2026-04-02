"use client";

import { useRef } from "react";
import { Canvas, useFrame } from "@react-three/fiber";
import { Sphere, MeshDistortMaterial, Float } from "@react-three/drei";
import * as THREE from "three";

interface CosmicOrbProps {
  isSpeaking?: boolean;
  isProcessing?: boolean;
}

function AnimatedOrb({ isSpeaking = false, isProcessing = false }: CosmicOrbProps) {
  const meshRef = useRef<THREE.Mesh>(null);
  const materialRef = useRef<any>(null);

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.x += delta * 0.2;
      meshRef.current.rotation.y += delta * 0.3;
      
      // Pulse scale if speaking
      if (isSpeaking) {
        const scale = 1 + Math.sin(state.clock.elapsedTime * 5) * 0.05;
        meshRef.current.scale.set(scale, scale, scale);
      } else {
        meshRef.current.scale.lerp(new THREE.Vector3(1, 1, 1), 0.1);
      }
    }

    if (materialRef.current) {
      if (isProcessing) {
        materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.6, 0.05);
        materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, 4, 0.05);
      } else if (isSpeaking) {
        materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.3, 0.05);
        materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, 6, 0.05);
      } else {
        materialRef.current.distort = THREE.MathUtils.lerp(materialRef.current.distort, 0.2, 0.05);
        materialRef.current.speed = THREE.MathUtils.lerp(materialRef.current.speed, 2, 0.05);
      }
    }
  });

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <Sphere ref={meshRef} args={[1, 64, 64]} scale={1.2}>
        <MeshDistortMaterial
          ref={materialRef}
          color={isProcessing ? "#FF9933" : "#D4AF37"}
          emissive="#D4AF37"
          emissiveIntensity={isSpeaking ? 1.5 : 0.8}
          roughness={0.2}
          metalness={0.8}
          distort={0.2}
          speed={2}
          wireframe={false}
        />
      </Sphere>
    </Float>
  );
}

export default function CosmicOrbContainer({ isSpeaking, isProcessing }: CosmicOrbProps) {
  return (
    <div className="w-full h-[300px] flex justify-center items-center relative">
      <div className="absolute inset-0 bg-gold/10 blur-[100px] rounded-full pointer-events-none" />
      <Canvas camera={{ position: [0, 0, 4] }} gl={{ alpha: true }}>
        <ambientLight intensity={0.5} />
        <directionalLight position={[2, 5, 2]} intensity={2} color="#ffffff" />
        <pointLight position={[-2, -2, -2]} intensity={1} color="#FF9933" />
        <AnimatedOrb isSpeaking={isSpeaking} isProcessing={isProcessing} />
      </Canvas>
    </div>
  );
}
