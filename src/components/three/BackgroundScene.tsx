'use client'

import { useEffect, useMemo, useRef } from 'react'
import type { MutableRefObject } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import * as THREE from 'three'

type SceneSignals = {
  pointer: MutableRefObject<THREE.Vector2>
  scroll: MutableRefObject<number>
}

type ParticleLayerProps = SceneSignals & {
  color: string
  count: number
  depth: number
  seed: number
  size: number
  speed: number
}

function seededUnit(index: number, seed: number) {
  const value = Math.sin((index + 1) * 12.9898 + seed * 78.233) * 43758.5453
  return value - Math.floor(value)
}

function createParticlePositions(count: number, depth: number, seed: number) {
  const positions = new Float32Array(count * 3)

  for (let index = 0; index < count; index += 1) {
    const offset = index * 3
    positions[offset] = (seededUnit(index * 3, seed) - 0.5) * 22
    positions[offset + 1] = (seededUnit(index * 3 + 1, seed) - 0.5) * 14
    positions[offset + 2] = -seededUnit(index * 3 + 2, seed) * depth
  }

  return positions
}

function ParticleLayer({
  color,
  count,
  depth,
  pointer,
  scroll,
  seed,
  size,
  speed,
}: ParticleLayerProps) {
  const particles = useRef<THREE.Points>(null)
  const positions = useMemo(
    () => createParticlePositions(count, depth, seed),
    [count, depth, seed],
  )

  useFrame((_, delta) => {
    if (!particles.current) return

    particles.current.rotation.y += delta * speed
    particles.current.rotation.x = THREE.MathUtils.damp(
      particles.current.rotation.x,
      pointer.current.y * 0.08,
      3,
      delta,
    )
    particles.current.position.x = THREE.MathUtils.damp(
      particles.current.position.x,
      pointer.current.x * 0.42,
      3,
      delta,
    )
    particles.current.position.y = THREE.MathUtils.damp(
      particles.current.position.y,
      pointer.current.y * 0.28 + (scroll.current % 5) * 0.12,
      3,
      delta,
    )
  })

  return (
    <points ref={particles}>
      <bufferGeometry>
        <bufferAttribute attach="attributes-position" args={[positions, 3]} />
      </bufferGeometry>
      <pointsMaterial
        blending={THREE.AdditiveBlending}
        color={color}
        depthWrite={false}
        opacity={0.72}
        size={size}
        sizeAttenuation
        transparent
      />
    </points>
  )
}

function OrbitalSculpture({ pointer, scroll }: SceneSignals) {
  const rig = useRef<THREE.Group>(null)
  const core = useRef<THREE.Mesh>(null)
  const halo = useRef<THREE.Group>(null)

  useFrame(({ clock }, delta) => {
    const elapsed = clock.getElapsedTime()

    if (rig.current) {
      rig.current.rotation.x = THREE.MathUtils.damp(
        rig.current.rotation.x,
        pointer.current.y * 0.22 - 0.16,
        3.2,
        delta,
      )
      rig.current.rotation.y = THREE.MathUtils.damp(
        rig.current.rotation.y,
        pointer.current.x * 0.3 + elapsed * 0.025,
        3.2,
        delta,
      )
      rig.current.position.y = THREE.MathUtils.damp(
        rig.current.position.y,
        Math.sin(elapsed * 0.35) * 0.18 - (scroll.current % 4) * 0.08,
        2.5,
        delta,
      )
    }

    if (core.current) {
      core.current.rotation.x += delta * 0.08
      core.current.rotation.y += delta * 0.12
    }

    if (halo.current) {
      halo.current.rotation.z -= delta * 0.035
      halo.current.rotation.x = Math.sin(elapsed * 0.18) * 0.16
    }
  })

  return (
    <group ref={rig} position={[4.8, 0.2, -4.5]} scale={1.18}>
      <mesh ref={core}>
        <icosahedronGeometry args={[2.15, 2]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color="#67e8f9"
          depthWrite={false}
          opacity={0.1}
          transparent
          wireframe
        />
      </mesh>

      <mesh scale={0.72} rotation={[0.45, 0.2, 0.25]}>
        <octahedronGeometry args={[2.15, 1]} />
        <meshBasicMaterial
          blending={THREE.AdditiveBlending}
          color="#c4b5fd"
          depthWrite={false}
          opacity={0.08}
          transparent
          wireframe
        />
      </mesh>

      <group ref={halo} rotation={[0.9, 0.18, 0.3]}>
        <mesh>
          <torusGeometry args={[2.85, 0.012, 8, 140]} />
          <meshBasicMaterial
            blending={THREE.AdditiveBlending}
            color="#a78bfa"
            depthWrite={false}
            opacity={0.34}
            transparent
          />
        </mesh>
        <mesh rotation={[1.05, 0.3, 0.55]}>
          <torusGeometry args={[3.35, 0.009, 8, 140]} />
          <meshBasicMaterial
            blending={THREE.AdditiveBlending}
            color="#22d3ee"
            depthWrite={false}
            opacity={0.2}
            transparent
          />
        </mesh>
      </group>
    </group>
  )
}

function FloatingGeometry({ pointer }: Pick<SceneSignals, 'pointer'>) {
  const object = useRef<THREE.Mesh>(null)

  useFrame(({ clock }, delta) => {
    if (!object.current) return

    const elapsed = clock.getElapsedTime()
    object.current.rotation.x += delta * 0.045
    object.current.rotation.y -= delta * 0.07
    object.current.position.x = THREE.MathUtils.damp(
      object.current.position.x,
      -4.7 + pointer.current.x * 0.24,
      2.8,
      delta,
    )
    object.current.position.y = -2.5 + Math.sin(elapsed * 0.42) * 0.22
  })

  return (
    <mesh ref={object} position={[-4.7, -2.5, -5.8]} rotation={[0.3, 0.2, 0]}>
      <torusKnotGeometry args={[1.3, 0.23, 96, 10, 2, 3]} />
      <meshBasicMaterial
        blending={THREE.AdditiveBlending}
        color="#d946ef"
        depthWrite={false}
        opacity={0.07}
        transparent
        wireframe
      />
    </mesh>
  )
}

function Scene({ pointer, scroll }: SceneSignals) {
  return (
    <>
      <fog attach="fog" args={['#07070a', 8, 24]} />
      <ParticleLayer
        color="#67e8f9"
        count={92}
        depth={18}
        pointer={pointer}
        scroll={scroll}
        seed={3}
        size={0.045}
        speed={0.008}
      />
      <ParticleLayer
        color="#c4b5fd"
        count={56}
        depth={14}
        pointer={pointer}
        scroll={scroll}
        seed={11}
        size={0.032}
        speed={-0.012}
      />
      <OrbitalSculpture pointer={pointer} scroll={scroll} />
      <FloatingGeometry pointer={pointer} />
    </>
  )
}

export default function BackgroundScene() {
  const pointer = useRef(new THREE.Vector2())
  const scroll = useRef(0)

  useEffect(() => {
    const handlePointerMove = (event: PointerEvent) => {
      pointer.current.set(
        (event.clientX / window.innerWidth) * 2 - 1,
        -(event.clientY / window.innerHeight) * 2 + 1,
      )
    }
    const handlePointerLeave = () => pointer.current.set(0, 0)
    const handleScroll = () => {
      scroll.current = window.scrollY / Math.max(window.innerHeight, 1)
    }

    window.addEventListener('pointermove', handlePointerMove, { passive: true })
    window.addEventListener('pointerleave', handlePointerLeave)
    window.addEventListener('scroll', handleScroll, { passive: true })
    handleScroll()

    return () => {
      window.removeEventListener('pointermove', handlePointerMove)
      window.removeEventListener('pointerleave', handlePointerLeave)
      window.removeEventListener('scroll', handleScroll)
    }
  }, [])

  return (
    <Canvas
      camera={{ fov: 52, position: [0, 0, 9] }}
      dpr={[1, 1.4]}
      gl={{
        alpha: true,
        antialias: false,
        powerPreference: 'high-performance',
        toneMapping: THREE.ACESFilmicToneMapping,
      }}
    >
      <Scene pointer={pointer} scroll={scroll} />
    </Canvas>
  )
}
