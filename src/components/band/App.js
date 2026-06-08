import * as THREE from 'three'
import { useRef, useState, useMemo } from 'react'
import { Canvas, useFrame } from '@react-three/fiber'
import { Text } from '@react-three/drei'
import { useRouter } from 'next/navigation'

function Word({ children, position, isLink, path }) {
  const color = new THREE.Color()
  const ref = useRef()
  const [hovered, setHovered] = useState(false)
  const router = useRouter()

  useFrame(({ camera }) => {
    if (!ref.current) return
    ref.current.quaternion.copy(camera.quaternion)
    if (ref.current.material) {
      ref.current.material.color.lerp(
        color.set(hovered ? '#fa2720' : 'white'),
        0.1,
      )
    }
  })

  return (
    <Text
      ref={ref}
      position={position}
      fontSize={2.2}
      letterSpacing={-0.05}
      lineHeight={1}
      material-toneMapped={false}
      onPointerOver={(e) => { e.stopPropagation(); setHovered(true); if (isLink) document.body.style.cursor = 'pointer' }}
      onPointerOut={() => { setHovered(false); document.body.style.cursor = 'auto' }}
      onClick={() => { if (isLink && path) { if (path.startsWith('http')) window.open(path, '_blank'); else router.push(path) } }}
    >
      {children}
    </Text>
  )
}

const cloudWords = [
  { text: '設計', isLink: false },
  { text: '開発', isLink: false },
  { text: 'Design', isLink: false },
  { text: 'Dev', isLink: false },
  { text: 'About', isLink: true, path: '/#about' },
  { text: 'Portfolio', isLink: true, path: '/#portfolio' },
  { text: 'Contact', isLink: true, path: '/#contact' },
  { text: 'Github', isLink: true, path: 'https://github.com/Dev-Sahad' },
  { text: 'LinkedIn', isLink: true, path: 'https://www.linkedin.com/in/muhammad-sahad-78b827352' },
]

function Cloud({ count = 4, radius = 18 }) {
  const words = useMemo(() => {
    const temp = []
    const spherical = new THREE.Spherical()
    const phiSpan = Math.PI / (count + 1)
    const thetaSpan = (Math.PI * 2) / count
    for (let i = 1; i < count + 1; i++) {
      for (let j = 0; j < count; j++) {
        temp.push({
          pos: new THREE.Vector3().setFromSpherical(
            spherical.set(radius, phiSpan * i, thetaSpan * j)
          ),
          word: cloudWords[(i * count + j) % cloudWords.length],
        })
      }
    }
    return temp
  }, [count, radius])

  return words.map(({ pos, word }, i) => (
    <Word key={i} position={pos} isLink={word.isLink} path={word.path}>
      {word.text}
    </Word>
  ))
}

// Auto-rotate the scene group — no user drag controls needed
function AutoRotate({ children }) {
  const groupRef = useRef()
  useFrame((_, delta) => {
    if (groupRef.current) {
      groupRef.current.rotation.y += delta * 0.18
      groupRef.current.rotation.x += delta * 0.05
    }
  })
  return <group ref={groupRef}>{children}</group>
}

export default function App() {
  return (
    <Canvas
      dpr={[1, 2]}
      camera={{ position: [0, 0, 35], fov: 80 }}
      // Disable all event handling on the canvas so scroll works
      events={false}
      style={{ pointerEvents: 'none' }}
    >
      <fog attach="fog" args={['#0a0a0a', 10, 45]} />
      <AutoRotate>
        <Cloud count={6} radius={20} />
      </AutoRotate>
    </Canvas>
  )
}
