'use client'

import * as THREE from 'three'
import { Float, RoundedBox, Text } from '@react-three/drei'
import { Canvas, useFrame, useThree } from '@react-three/fiber'
import { useMemo, useRef } from 'react'

export type SceneWord = {
  id?: string
  text: string
  color?: string | null
  fontSize?: number | null
  opacity?: number | null
}

type PortfolioSceneProps = {
  variant?: 'intro' | 'hero'
  words?: SceneWord[]
}

const DEFAULT_WORDS: SceneWord[] = [
  { text: 'DESIGN', color: '#f8fafc', fontSize: 0.72, opacity: 0.88 },
  { text: 'REACT', color: '#8be9fd', fontSize: 0.68, opacity: 0.78 },
  { text: 'MOTION', color: '#c4b5fd', fontSize: 0.64, opacity: 0.76 },
  { text: 'NEXT.JS', color: '#f8fafc', fontSize: 0.62, opacity: 0.72 },
  { text: 'THREE.JS', color: '#67e8f9', fontSize: 0.6, opacity: 0.72 },
  { text: 'CREATIVE', color: '#f0abfc', fontSize: 0.58, opacity: 0.7 },
]

function seededRandom(seed: number) {
  let value = seed
  return () => {
    value = (value * 16807) % 2147483647
    return (value - 1) / 2147483646
  }
}

function ParticleField({ count, radius }: { count: number; radius: number }) {
  const points = useRef<THREE.Points>(null)
  const positions = useMemo(() => {
    const random = seededRandom(23917)
    const values = new Float32Array(count * 3)

    for (let index = 0; index < count; index += 1) {
      const distance = radius * (0.45 + random() * 0.55)
      const theta = random() * Math.PI * 2
      const phi = Math.acos(2 * random() - 1)
      values[index * 3] = distance * Math.sin(phi) * Math.cos(theta)
      values[index * 3 + 1] = distance * Math.cos(phi)
      values[index * 3 + 2] = distance * Math.sin(phi) * Math.sin(theta)
    }

    return values
  }, [count, radius])

  useFrame((_, delta) => {
    if (!points.current) return
    points.current.rotation.y += delta * 0.025
    points.current.rotation.z -= delta * 0.008
  })

  return (
    <points ref={points}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        color="#b8f3ff"
        depthWrite={false}
        opacity={0.58}
        size={0.035}
        sizeAttenuation
        transparent
      />
    </points>
  )
}

function CrystalCore({ compact }: { compact: boolean }) {
  const core = useRef<THREE.Group>(null)
  const knot = useRef<THREE.Mesh>(null)

  useFrame(({ clock }, delta) => {
    if (core.current) {
      core.current.rotation.y += delta * 0.16
      core.current.rotation.x = Math.sin(clock.elapsedTime * 0.38) * 0.16
    }
    if (knot.current) knot.current.rotation.z -= delta * 0.09
  })

  return (
    <group ref={core} scale={compact ? 0.78 : 1}>
      <mesh ref={knot}>
        <torusKnotGeometry args={[1.55, 0.38, 160, 24, 2, 3]} />
        <meshPhysicalMaterial
          clearcoat={1}
          clearcoatRoughness={0.08}
          color="#b8efff"
          envMapIntensity={1.5}
          ior={1.4}
          metalness={0.08}
          opacity={0.92}
          roughness={0.08}
          thickness={1.8}
          transmission={0.72}
          transparent
        />
      </mesh>

      <mesh scale={0.86}>
        <icosahedronGeometry args={[1.45, 2]} />
        <meshStandardMaterial
          color="#7157ff"
          emissive="#3620d4"
          emissiveIntensity={1.5}
          metalness={0.72}
          roughness={0.24}
          wireframe
        />
      </mesh>

      <pointLight color="#7dd3fc" intensity={22} distance={9} />
      <pointLight color="#a855f7" intensity={15} distance={8} position={[0, -1, 1]} />
    </group>
  )
}

type OrbitProps = {
  color: string
  radius: number
  rotation: [number, number, number]
  speed: number
  tube?: number
}

function Orbit({ color, radius, rotation, speed, tube = 0.025 }: OrbitProps) {
  const ring = useRef<THREE.Mesh>(null)

  useFrame((_, delta) => {
    if (!ring.current) return
    ring.current.rotation.z += delta * speed
  })

  return (
    <mesh ref={ring} rotation={rotation}>
      <torusGeometry args={[radius, tube, 12, 160]} />
      <meshStandardMaterial
        color={color}
        emissive={color}
        emissiveIntensity={2.2}
        metalness={0.35}
        roughness={0.2}
        transparent
        opacity={0.72}
      />
    </mesh>
  )
}

function HolographicPanel({ compact }: { compact: boolean }) {
  const panel = useRef<THREE.Group>(null)

  useFrame(({ clock }) => {
    if (!panel.current) return
    panel.current.position.y = Math.sin(clock.elapsedTime * 0.7) * 0.12
    panel.current.rotation.y = -0.28 + Math.sin(clock.elapsedTime * 0.3) * 0.06
  })

  return (
    <group
      ref={panel}
      position={compact ? [0, -2.55, 0] : [0.25, -3.15, 0.2]}
      rotation={[-0.04, -0.28, 0]}
    >
      <RoundedBox args={compact ? [4.8, 0.82, 0.06] : [6.1, 0.9, 0.06]} radius={0.12} smoothness={5}>
        <meshPhysicalMaterial
          color="#91e8ff"
          metalness={0.12}
          opacity={0.11}
          roughness={0.1}
          transmission={0.72}
          transparent
        />
      </RoundedBox>
      <Text
        anchorX="center"
        anchorY="middle"
        fontSize={compact ? 0.24 : 0.27}
        letterSpacing={0.2}
        position={[0, 0, 0.06]}
        material-color="#dff9ff"
        material-toneMapped={false}
      >
        {compact ? 'DEV SAHAD  /  PORTFOLIO' : 'CREATIVE FRONTEND  •  DIGITAL EXPERIENCES'}
      </Text>
    </group>
  )
}

function SpatialWords({ words }: { words: SceneWord[] }) {
  const positions: Array<[number, number, number]> = [
    [-4.7, 2.7, -0.8],
    [4.6, 2.1, -1.2],
    [-5.2, -1.25, -1.5],
    [4.9, -1.5, -0.6],
    [-2.7, 4.25, -1.9],
    [3.1, 4.05, -1.3],
    [-3.7, -3.7, -1.2],
    [4.05, -3.5, -1.4],
  ]

  return (
    <group>
      {words.slice(0, positions.length).map((word, index) => {
        const baseSize = word.fontSize ?? 0.62
        const normalizedSize = baseSize > 1 ? Math.min(0.88, baseSize * 0.35) : baseSize
        return (
          <Float
            key={word.id ?? `${word.text}-${index}`}
            floatIntensity={0.35}
            rotationIntensity={0.08}
            speed={0.7 + (index % 3) * 0.15}
          >
            <Text
              anchorX="center"
              anchorY="middle"
              fontSize={normalizedSize}
              letterSpacing={0.12}
              position={positions[index]}
              material-color={word.color ?? '#eafaff'}
              material-opacity={word.opacity ?? 0.72}
              material-transparent
              material-toneMapped={false}
            >
              {word.text.toUpperCase()}
            </Text>
          </Float>
        )
      })}
    </group>
  )
}

function Scene({ variant, words }: Required<Pick<PortfolioSceneProps, 'variant'>> & Pick<PortfolioSceneProps, 'words'>) {
  const compact = variant === 'intro'
  const rig = useRef<THREE.Group>(null)
  const viewport = useThree((state) => state.viewport)
  const activeWords = words?.length ? words : DEFAULT_WORDS
  const introIsNarrow = viewport.width < 7
  const rigPosition: [number, number, number] = compact
    ? introIsNarrow
      ? [0, 3.15, -0.5]
      : [4.15, 0, -0.5]
    : [0, 0, 0]
  const introTitlePosition: [number, number, number] = introIsNarrow
    ? [0, -3.55, -0.3]
    : [-4.15, 2.1, -0.3]
  const introSubtitlePosition: [number, number, number] = introIsNarrow
    ? [0, -4.05, -0.3]
    : [-4.15, 1.5, -0.3]

  useFrame(({ clock, pointer }) => {
    if (!rig.current) return
    const targetX = pointer.y * 0.16 + Math.sin(clock.elapsedTime * 0.18) * 0.05
    const targetY = pointer.x * 0.2 + Math.cos(clock.elapsedTime * 0.15) * 0.07
    rig.current.rotation.x = THREE.MathUtils.lerp(rig.current.rotation.x, targetX, 0.035)
    rig.current.rotation.y = THREE.MathUtils.lerp(rig.current.rotation.y, targetY, 0.035)
  })

  return (
    <>
      <ambientLight intensity={0.45} />
      <directionalLight color="#e0f7ff" intensity={3} position={[4, 6, 5]} />
      <directionalLight color="#8b5cf6" intensity={2} position={[-5, -3, 2]} />
      <fog attach="fog" args={['#05060a', compact ? 10 : 12, compact ? 23 : 27]} />

      <ParticleField count={compact ? 110 : 190} radius={compact ? 8.5 : 10.5} />

      <group ref={rig} position={rigPosition} scale={compact ? 0.88 : 1}>
        <CrystalCore compact={compact} />
        <Orbit color="#8be9fd" radius={2.55} rotation={[1.08, 0.18, 0.22]} speed={0.2} />
        <Orbit color="#a78bfa" radius={3.25} rotation={[0.25, 0.95, 0.42]} speed={-0.14} tube={0.018} />
        <Orbit color="#f0abfc" radius={3.85} rotation={[0.72, -0.48, 0.85]} speed={0.1} tube={0.014} />
        <HolographicPanel compact={compact} />
        {!compact ? <SpatialWords words={activeWords} /> : null}
      </group>

      {compact ? (
        <>
          <Text
            anchorX="center"
            anchorY="middle"
            fontSize={0.42}
            letterSpacing={0.28}
            position={introTitlePosition}
            material-color="#f8fafc"
            material-toneMapped={false}
          >
            ENTERING DIGITAL SPACE
          </Text>
          <Text
            anchorX="center"
            anchorY="middle"
            fontSize={0.18}
            letterSpacing={0.32}
            position={introSubtitlePosition}
            material-color="#94a3b8"
            material-toneMapped={false}
          >
            DESIGN  /  CODE  /  MOTION
          </Text>
        </>
      ) : null}
    </>
  )
}

export default function PortfolioScene({ variant = 'hero', words = [] }: PortfolioSceneProps) {
  const compact = variant === 'intro'

  return (
    <Canvas
      camera={{ fov: compact ? 48 : 50, position: [0, 0, compact ? 12 : 13.5] }}
      dpr={[1, 1.6]}
      gl={{
        alpha: true,
        antialias: true,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <Scene variant={variant} words={words} />
    </Canvas>
  )
}
