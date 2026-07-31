'use client'

import React, { useRef, useState } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Html, OrbitControls, Float } from '@react-three/drei'
import * as THREE from 'three'
import { useAudio } from '@/context/AudioContext'

interface TechNode {
  name: string
  color: string
  icon: string
  level: string
  experience: string
  position: [number, number, number]
}

const TECH_NODES: TechNode[] = [
  { name: 'Next.js 15', color: '#ffffff', icon: '▲', level: '95%', experience: '2+ yrs', position: [2.2, 0.8, 0] },
  { name: 'React 19', color: '#61dafb', icon: '⚛', level: '95%', experience: '2+ yrs', position: [-2.2, -0.6, 0.5] },
  { name: 'TypeScript', color: '#3178c6', icon: 'TS', level: '90%', experience: '2 yrs', position: [0.6, -2.0, 1.2] },
  { name: 'Three.js', color: '#00ff88', icon: '3D', level: '85%', experience: '1.5 yrs', position: [-1.2, 2.0, -0.8] },
  { name: 'Supabase', color: '#3ecf8e', icon: '⚡', level: '90%', experience: '2 yrs', position: [1.8, -1.2, -1.5] },
  { name: 'Tailwind CSS', color: '#38bdf8', icon: '🌊', level: '98%', experience: '2+ yrs', position: [-1.8, 1.2, 1.5] },
]

function SkillNodeMesh({ node, onSelect }: { node: TechNode; onSelect: (node: TechNode) => void }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const [hovered, setHovered] = useState(false)
  const { playHover, playClick } = useAudio()

  useFrame((state, delta) => {
    if (meshRef.current) {
      meshRef.current.rotation.y += delta * 0.8
    }
  })

  return (
    <Float speed={2} rotationIntensity={0.5} floatIntensity={1}>
      <group position={node.position}>
        <mesh
          ref={meshRef}
          onPointerOver={(e) => {
            e.stopPropagation()
            setHovered(true)
            playHover()
          }}
          onPointerOut={() => setHovered(false)}
          onClick={(e) => {
            e.stopPropagation()
            playClick()
            onSelect(node)
          }}
        >
          <sphereGeometry args={[0.42, 32, 32]} />
          <meshStandardMaterial
            color={node.color}
            emissive={node.color}
            emissiveIntensity={hovered ? 0.8 : 0.25}
            roughness={0.2}
            metalness={0.8}
          />
        </mesh>

        <Html distanceFactor={10} center>
          <div
            onClick={() => onSelect(node)}
            className={`cursor-pointer select-none whitespace-nowrap rounded-xl border px-2.5 py-1 text-center font-mono text-[10px] font-bold backdrop-blur-md transition-all duration-300 ${
              hovered
                ? 'scale-110 border-white bg-white/20 text-white shadow-[0_0_15px_rgba(255,255,255,0.4)]'
                : 'border-white/20 bg-black/60 text-white/70 hover:text-white'
            }`}
          >
            <span className="mr-1">{node.icon}</span>
            {node.name}
          </div>
        </Html>
      </group>
    </Float>
  )
}

function OrbitRings() {
  const groupRef = useRef<THREE.Group>(null)

  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.15
      groupRef.current.rotation.x += delta * 0.05
    }
  })

  return (
    <group ref={groupRef}>
      <mesh rotation={[Math.PI / 3, 0, 0]}>
        <ringGeometry args={[2.19, 2.21, 64]} />
        <meshBasicMaterial color="#ffffff" opacity={0.15} transparent side={THREE.DoubleSide} />
      </mesh>
      <mesh rotation={[Math.PI / 6, Math.PI / 4, 0]}>
        <ringGeometry args={[2.79, 2.81, 64]} />
        <meshBasicMaterial color="#a855f7" opacity={0.2} transparent side={THREE.DoubleSide} />
      </mesh>
    </group>
  )
}

export default function SkillOrbitGalaxy() {
  const [selectedNode, setSelectedNode] = useState<TechNode | null>(TECH_NODES[0])

  return (
    <div className="relative my-8 h-[340px] w-full overflow-hidden rounded-3xl border border-white/10 bg-[#07070b]/90 shadow-2xl backdrop-blur-xl">
      {/* 3D Canvas */}
      <Canvas camera={{ position: [0, 0, 6], fov: 50 }}>
        <ambientLight intensity={0.6} />
        <pointLight position={[10, 10, 10]} intensity={1.5} />
        <pointLight position={[-10, -10, -10]} color="#a855f7" intensity={1} />

        <OrbitRings />

        {TECH_NODES.map((node) => (
          <SkillNodeMesh key={node.name} node={node} onSelect={setSelectedNode} />
        ))}

        <OrbitControls enableZoom={false} autoRotate autoRotateSpeed={0.8} />
      </Canvas>

      {/* Selected Skill Overlay */}
      {selectedNode && (
        <div className="absolute bottom-4 left-4 right-4 flex items-center justify-between rounded-2xl border border-white/15 bg-black/70 p-3.5 backdrop-blur-md">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-white/10 font-mono text-base font-bold text-cyan-300">
              {selectedNode.icon}
            </span>
            <div>
              <p className="text-xs font-bold text-white flex items-center gap-2">
                {selectedNode.name}
                <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-[9px] font-mono text-emerald-300">
                  {selectedNode.level} Mastery
                </span>
              </p>
              <p className="text-[11px] text-white/40 font-mono">Production Experience: {selectedNode.experience}</p>
            </div>
          </div>
          <span className="text-[10px] text-white/30 font-mono hidden sm:inline">Drag 3D viewport to orbit</span>
        </div>
      )}
    </div>
  )
}
