"use client"

import { useRef, useMemo, useEffect, useState, Suspense, memo } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, ContactShadows, Sparkles } from "@react-three/drei"
import * as THREE from "three"

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
type Weather = "sunny" | "windy" | "rainy"
type Season = "spring" | "summer" | "autumn" | "winter"

interface Garden3DProps {
  level: number
  weather: Weather
  season: Season
}

// ─────────────────────────────────────────────
// Constants & Palettes
// ─────────────────────────────────────────────
const SEASON_PALETTE = {
  spring: {
    grass: new THREE.Color("#6fc07c"),
    foliage: new THREE.Color("#9ac793"),
    particleColor: new THREE.Color("#FFB7C5"),
    sky: new THREE.Color("#c8eaff"),
    ground: new THREE.Color("#4a7a50"),
  },
  summer: {
    grass: new THREE.Color("#2a9147"),
    foliage: new THREE.Color("#166e37"),
    particleColor: new THREE.Color("#34d399"),
    sky: new THREE.Color("#87CEEB"),
    ground: new THREE.Color("#3a6b3a"),
  },
  autumn: {
    grass: new THREE.Color("#be7328"),
    foliage: new THREE.Color("#c26803"),
    particleColor: new THREE.Color("#f59e0b"),
    sky: new THREE.Color("#d4956a"),
    ground: new THREE.Color("#7a4a20"),
  },
  winter: {
    grass: new THREE.Color("#b8c8d8"),
    foliage: new THREE.Color("#cbd7df"),
    particleColor: new THREE.Color("#e2f0ff"),
    sky: new THREE.Color("#b0c4d8"),
    ground: new THREE.Color("#6a7f96"),
  },
}

const DIRT_COLOR = new THREE.Color("#785c33")

// Shared wind state (ref-driven)
const windState = { frequency: 0.8, amplitude: 0.018 }

// Seeded pseudo-random for stable placement
function seededRandom(seed: number) {
  const x = Math.sin(seed + 1) * 43758.5453123
  return x - Math.floor(x)
}

// Global helper to compute displaced terrain height at any (x, z) coordinate
function getTerrainHeight(x: number, z: number, level: number) {
  if (level === 99) return 0
  const dist = Math.sqrt(x * x + z * z)
  // Island edge falloff matching terrain geometry
  const edgeFactor = Math.max(0, 1 - (dist / 2.05) ** 2.2)

  // Low-poly hills noise
  const noise =
    Math.sin(x * 1.8 + 0.3) * Math.cos(z * 1.5 - 0.5) * 0.28 +
    Math.sin(x * 4.2 + 1.1) * Math.cos(z * 3.5 + 0.9) * 0.08

  let height = (noise + 0.08) * edgeFactor

  // Sunken dirt pathways/patches
  const dirtNoise = Math.sin(x * 3.2 + 1.2) * Math.cos(z * 3.2 + 0.4)
  let dirtFactor = 0
  if (dist < 1.6 && dirtNoise > 0.18) {
    dirtFactor = Math.min(1, Math.max(0, (dirtNoise - 0.18) * 8.0))
  }

  // physically sink the dirt geometry
  height -= dirtFactor * 0.07 * edgeFactor

  if (dist > 2.05) {
    height = -Math.min(0.8, (dist - 2.05) * 1.8)
  }

  return height
}

// ─────────────────────────────────────────────
// Low-Poly Rock Geometry Helper
// ─────────────────────────────────────────────
function createLowPolyRockGeometry(radius: number, seed: number) {
  let geo = new THREE.IcosahedronGeometry(radius, 0)
  geo = geo.toNonIndexed() as THREE.IcosahedronGeometry
  const pos = geo.attributes.position
  const count = pos.count
  for (let i = 0; i < count; i++) {
    const rx = (seededRandom(i * 3 + seed) - 0.5) * 0.18 * radius
    const ry = (seededRandom(i * 3 + 1 + seed) - 0.5) * 0.18 * radius
    const rz = (seededRandom(i * 3 + 2 + seed) - 0.5) * 0.18 * radius
    pos.setX(i, pos.getX(i) + rx)
    pos.setY(i, pos.getY(i) + ry)
    pos.setZ(i, pos.getZ(i) + rz)
  }
  geo.computeVertexNormals()
  return geo
}

// ─────────────────────────────────────────────
// Foliage Component with Vertex-Colored Y-Gradient
// ─────────────────────────────────────────────
interface LowPolyFoliageProps {
  radius: number
  detail?: number
  colorDark: THREE.Color
  colorLight: THREE.Color
  position: [number, number, number]
  scale?: [number, number, number]
}

const LowPolyFoliage: React.FC<LowPolyFoliageProps> = ({
  radius,
  detail = 1,
  colorDark,
  colorLight,
  position,
  scale = [1, 1, 1],
}) => {
  const geometry = useMemo(() => {
    let geo = new THREE.IcosahedronGeometry(radius, detail)
    geo = geo.toNonIndexed() as THREE.IcosahedronGeometry
    const pos = geo.attributes.position
    const count = pos.count
    const colors = []
    
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i)
      // Normalise local Y coordinate to [0, 1] range
      const factor = Math.max(0, Math.min(1, (y + radius) / (2 * radius)))
      const color = new THREE.Color().lerpColors(colorDark, colorLight, factor)
      colors.push(color.r, color.g, color.b)
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [radius, detail, colorDark, colorLight])

  return (
    <mesh castShadow receiveShadow position={position} scale={scale}>
      <primitive object={geometry} />
      <meshStandardMaterial vertexColors flatShading roughness={0.8} metalness={0.05} />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Rocks (Perimeter Border Detail)
// ─────────────────────────────────────────────
function IslandBorderRocks() {
  const rocks = useMemo(() => {
    const list = []
    const steps = 30
    for (let i = 0; i < steps; i++) {
      const angle = (i / steps) * Math.PI * 2
      const r = 2.05 + (seededRandom(i * 17) - 0.5) * 0.12
      const scale = 0.07 + seededRandom(i * 23) * 0.08
      const x = Math.cos(angle) * r
      const z = Math.sin(angle) * r
      const baseHeight = getTerrainHeight(x, z, 1)
      const y = baseHeight - 0.04 + (seededRandom(i * 11) - 0.5) * 0.03
      
      list.push({
        x,
        y,
        z,
        scale,
        rotY: seededRandom(i * 31) * Math.PI * 2,
        rotX: (seededRandom(i * 37) - 0.5) * 0.4,
        seed: i * 19,
      })
    }
    return list
  }, [])

  return (
    <group>
      {rocks.map((r, i) => {
        const geo = createLowPolyRockGeometry(1, r.seed)
        return (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[r.x, r.y, r.z]}
            rotation={[r.rotX, r.rotY, 0]}
            scale={r.scale}
          >
            <primitive object={geo} />
            <meshStandardMaterial color={i % 2 === 0 ? "#8a8a93" : "#78716c"} flatShading roughness={0.85} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─────────────────────────────────────────────
// Island Terrain with Sunken Geometry & Color Blending
// ─────────────────────────────────────────────
function IslandTerrain({ season, level }: { season: Season; level: number }) {
  const meshRef = useRef<THREE.Mesh>(null)
  const matRef = useRef<THREE.MeshStandardMaterial>(null)

  const geometry = useMemo(() => {
    const geo = new THREE.PlaneGeometry(4.2, 4.2, 35, 35)
    const pos = geo.attributes.position
    const count = pos.count
    
    // 1. Displace heights
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      const edgeFactor = Math.max(0, 1 - (dist / 2.05) ** 2.2)

      const noise =
        Math.sin(x * 1.8 + 0.3) * Math.cos(y * 1.5 - 0.5) * 0.28 +
        Math.sin(x * 4.2 + 1.1) * Math.cos(y * 3.5 + 0.9) * 0.08
      let height = (noise + 0.08) * edgeFactor

      const dirtNoise = Math.sin(x * 3.2 + 1.2) * Math.cos(y * 3.2 + 0.4)
      let dirtFactor = 0
      if (dist < 1.6 && dirtNoise > 0.18) {
        dirtFactor = Math.min(1, Math.max(0, (dirtNoise - 0.18) * 8.0))
      }
      height -= dirtFactor * 0.07 * edgeFactor

      // Slope the corners below water level (dist > 2.05)
      if (dist > 2.05) {
        height = -Math.min(0.8, (dist - 2.05) * 1.8)
      }

      pos.setZ(i, height)
    }
    geo.computeVertexNormals()

    // 2. Convert to non-indexed for faceted look
    const flatGeo = geo.toNonIndexed()
    const flatPos = flatGeo.attributes.position
    const flatCount = flatPos.count
    const colors = []

    const baseGrassCol = level === 0 ? DIRT_COLOR : SEASON_PALETTE[season].grass
    const grassCol1 = baseGrassCol
    const grassCol2 = baseGrassCol.clone().multiplyScalar(1.12)
    const grassCol3 = baseGrassCol.clone().multiplyScalar(0.88)
    const dirtCol = DIRT_COLOR

    for (let i = 0; i < flatCount; i++) {
      const x = flatPos.getX(i)
      const y = flatPos.getY(i)
      const dist = Math.sqrt(x * x + y * y)

      const dirtNoise = Math.sin(x * 3.2 + 1.2) * Math.cos(y * 3.2 + 0.4)
      let dirtFactor = 0
      if (dist < 1.6 && dirtNoise > 0.18) {
        dirtFactor = Math.min(1, Math.max(0, (dirtNoise - 0.18) * 8.0))
      }

      const grassNoise = Math.sin(x * 6.0 + 0.5) * Math.cos(y * 6.0 - 0.5)
      let chosenGrassCol = grassCol1
      if (grassNoise > 0.35) {
        chosenGrassCol = grassCol2
      } else if (grassNoise < -0.35) {
        chosenGrassCol = grassCol3
      }

      const color = new THREE.Color().lerpColors(chosenGrassCol, dirtCol, dirtFactor)
      colors.push(color.r, color.g, color.b)
    }
    
    flatGeo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    flatGeo.computeVertexNormals()
    return flatGeo
  }, [season, level])

  return (
    <group>
      <mesh
        ref={meshRef}
        receiveShadow
        castShadow
        rotation={[-Math.PI / 2, 0, 0]}
      >
        <primitive object={geometry} />
        <meshStandardMaterial
          ref={matRef}
          vertexColors
          flatShading
          roughness={0.85}
          metalness={0.02}
        />
      </mesh>
      <IslandBorderRocks />
    </group>
  )
}

// ─────────────────────────────────────────────
// Island Base Block
// ─────────────────────────────────────────────
function IslandBase() {
  return (
    <mesh castShadow receiveShadow position={[0, -0.61, 0]}>
      <cylinderGeometry args={[2.05, 1.68, 1.2, 7]} />
      <meshStandardMaterial color="#451a03" flatShading roughness={0.9} />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Water Plane with Animated Faceted Wave Motion
// ─────────────────────────────────────────────
const WATER_PALETTE = {
  spring: {
    shallow: new THREE.Color("#22d3ee"), // cyan-400
    deep: new THREE.Color("#0f766e"), // teal-700
  },
  summer: {
    shallow: new THREE.Color("#38bdf8"), // sky-400
    deep: new THREE.Color("#1e3a8a"), // blue-900
  },
  autumn: {
    shallow: new THREE.Color("#64748b"), // slate-500
    deep: new THREE.Color("#0f172a"), // slate-900
  },
  winter: {
    shallow: new THREE.Color("#94a3b8"), // slate-400
    deep: new THREE.Color("#1e293b"), // slate-800
  },
}

function WaterPlane({ season }: { season: Season }) {
  const matRef = useRef<THREE.MeshStandardMaterial>(null)
  const geomRef = useRef<THREE.BufferGeometry>(null)

  const geometry = useMemo(() => {
    // Extended larger water plane to stretch past viewport
    const geo = new THREE.PlaneGeometry(80, 80, 50, 50)
    const pos = geo.attributes.position
    const count = pos.count
    const colors = []
    
    const shallowCol = WATER_PALETTE[season].shallow
    const deepCol = WATER_PALETTE[season].deep
    
    for (let i = 0; i < count; i++) {
      const x = pos.getX(i)
      const y = pos.getY(i)
      const dist = Math.sqrt(x * x + y * y)
      // Lerp color based on distance
      // Near center (dist < 2.05) is shallow. Far (dist > 8) is deep.
      const factor = Math.min(1, Math.max(0, (dist - 2.05) / 10.0))
      const color = new THREE.Color().lerpColors(shallowCol, deepCol, factor)
      colors.push(color.r, color.g, color.b)
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [season])

  useFrame((state) => {
    if (matRef.current) {
      matRef.current.opacity = 0.65 + Math.sin(state.clock.getElapsedTime() * 0.7) * 0.05
    }
    if (geomRef.current) {
      const pos = geomRef.current.attributes.position
      const count = pos.count
      const t = state.clock.getElapsedTime()
      for (let i = 0; i < count; i++) {
        const x = pos.getX(i)
        const y = pos.getY(i)
        const dist = Math.sqrt(x * x + y * y)
        // Damping wave heights near the shoreline
        const waveScale = Math.min(1, Math.max(0, (dist - 1.8) / 3.0))
        
        // Multi-frequency wave formula
        const w1 = Math.sin(x * 0.35 + t * 1.1) * Math.cos(y * 0.35 + t * 1.1)
        const w2 = Math.sin(x * 0.8 - t * 1.6) * Math.cos(y * 0.8 + t * 1.3) * 0.35
        const z = (w1 + w2) * 0.12 * waveScale
        pos.setZ(i, z)
      }
      pos.needsUpdate = true
      geomRef.current.computeVertexNormals()
    }
  })

  return (
    <mesh rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.68, 0]} receiveShadow>
      <primitive object={geometry} ref={geomRef} />
      <meshStandardMaterial
        ref={matRef}
        vertexColors
        transparent
        opacity={0.65}
        roughness={0.6}
        metalness={0.15}
        flatShading
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Rocks (Level 0 / Normal Island)
// ─────────────────────────────────────────────
function Rocks() {
  const rocks = useMemo(() => {
    // 3 organic rock clusters:
    // Cluster 1: near [-1.2, 0.8]
    // Cluster 2: near [0.9, -1.0]
    // Cluster 3: near [1.3, 0.5]
    const list = [
      // Cluster 1
      { x: -1.2, z: 0.8, scale: 0.22, seed: 10 },
      { x: -1.35, z: 0.7, scale: 0.14, seed: 20 },
      { x: -1.1, z: 0.9, scale: 0.11, seed: 30 },
      // Cluster 2
      { x: 0.9, z: -1.0, scale: 0.2, seed: 40 },
      { x: 1.05, z: -0.9, scale: 0.13, seed: 50 },
      // Cluster 3
      { x: 1.3, z: 0.5, scale: 0.16, seed: 60 },
      { x: 1.2, z: 0.6, scale: 0.1, seed: 70 },
    ]
    return list.map((r) => {
      const h = getTerrainHeight(r.x, r.z, 1)
      return {
        ...r,
        y: h - r.scale * 0.15, // slightly embedded
        rotY: seededRandom(r.seed * 3) * Math.PI * 2,
        rotX: (seededRandom(r.seed * 7) - 0.5) * 0.35,
      }
    })
  }, [])

  return (
    <group>
      {rocks.map((r, i) => {
        const geo = createLowPolyRockGeometry(1, r.seed)
        return (
          <mesh
            key={i}
            castShadow
            receiveShadow
            position={[r.x, r.y, r.z]}
            rotation={[r.rotX, r.rotY, 0]}
            scale={r.scale}
          >
            <primitive object={geo} />
            <meshStandardMaterial color={i % 2 === 0 ? "#9ca3af" : "#78716c"} flatShading roughness={0.75} />
          </mesh>
        )
      })}
    </group>
  )
}

// ─────────────────────────────────────────────
// Radial Low-Poly Flower & Wildflowers (Level 1)
// ─────────────────────────────────────────────
const FLOWER_COLORS = ["#ec4899", "#eab308", "#d946ef", "#06b6d4", "#f97316"]

interface FlowerProps {
  color: string
  height: number
  phase: number
}

const LowPolyFlower: React.FC<FlowerProps> = ({ color, height }) => {
  return (
    <group>
      {/* Taller and thicker Stem */}
      <mesh castShadow receiveShadow position={[0, height / 2, 0]}>
        <cylinderGeometry args={[0.02, 0.026, height, 4]} />
        <meshStandardMaterial color="#3f6212" flatShading roughness={0.8} />
      </mesh>
      {/* Larger Head contrasting center */}
      <mesh castShadow receiveShadow position={[0, height, 0]}>
        <icosahedronGeometry args={[0.045, 0]} />
        <meshStandardMaterial color="#facc15" flatShading roughness={0.5} />
      </mesh>
      {/* 5 Petals arranged radially, 4x larger */}
      {[0, 1, 2, 3, 4].map((idx) => {
        const angle = (idx / 5) * Math.PI * 2
        return (
          <mesh
            key={idx}
            position={[Math.sin(angle) * 0.075, height, Math.cos(angle) * 0.075]}
            rotation={[0, angle, 0]}
            castShadow
            receiveShadow
          >
            <boxGeometry args={[0.075, 0.018, 0.035]} />
            <meshStandardMaterial color={color} flatShading roughness={0.65} />
          </mesh>
        )
      })}
    </group>
  )
}

function Wildflowers({ weather }: { weather: Weather }) {
  // Group flowers in 6 distinct clusters
  const clusters = useMemo(() =>
    [...Array(6)].map((_, cIdx) => {
      const cx = (seededRandom(cIdx * 11) - 0.5) * 2.3
      const cz = (seededRandom(cIdx * 19) - 0.5) * 2.3
      
      const count = 3 + Math.floor(seededRandom(cIdx * 31) * 3)
      const flowersList = [...Array(count)].map((_, fIdx) => {
        const angle = seededRandom(cIdx * 7 + fIdx * 13) * Math.PI * 2
        const r = 0.12 + seededRandom(cIdx * 17 + fIdx * 5) * 0.18
        const fx = cx + Math.sin(angle) * r
        const fz = cz + Math.cos(angle) * r
        const terrainHeight = getTerrainHeight(fx, fz, 1)
        return {
          offsetX: Math.sin(angle) * r,
          offsetZ: Math.cos(angle) * r,
          y: terrainHeight,
          color: FLOWER_COLORS[(cIdx + fIdx) % FLOWER_COLORS.length],
          height: 0.22 + seededRandom(cIdx * 23 + fIdx * 29) * 0.12,
          phase: seededRandom(cIdx * 13 + fIdx * 17) * Math.PI * 2,
        }
      })
      return { cx, cz, flowersList }
    }).filter((c) => Math.sqrt(c.cx * c.cx + c.cz * c.cz) < 1.6),
  [])

  const groupRefs = useRef<(THREE.Group | null)[]>([])

  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const freq = weather === "windy" ? 3.0 : 0.9
    const amp = weather === "windy" ? 0.13 : 0.038
    
    groupRefs.current.forEach((g, i) => {
      if (!g || !clusters[i]) return
      g.rotation.z = Math.sin(t * freq + i) * amp
      g.rotation.x = Math.cos(t * freq * 0.85 + i) * amp * 0.5
    })
  })

  return (
    <group>
      {clusters.map((c, cIdx) => (
        <group
          key={cIdx}
          ref={(el) => { groupRefs.current[cIdx] = el }}
          position={[c.cx, 0, c.cz]}
        >
          {c.flowersList.map((f, fIdx) => (
            <group key={fIdx} position={[f.offsetX, f.y, f.offsetZ]}>
              <LowPolyFlower color={f.color} height={f.height} phase={f.phase} />
            </group>
          ))}
        </group>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────
// Isolated single cluster for Lab preview
// ─────────────────────────────────────────────
function IsolatedFlowerCluster({ weather }: { weather: Weather }) {
  const flowersList = useMemo(() => {
    return [
      { offsetX: 0, offsetZ: 0, color: "#ec4899", height: 0.16, phase: 0 },
      { offsetX: -0.07, offsetZ: 0.06, color: "#eab308", height: 0.12, phase: 1 },
      { offsetX: 0.07, offsetZ: -0.06, color: "#d946ef", height: 0.14, phase: 2 },
      { offsetX: 0.05, offsetZ: 0.09, color: "#06b6d4", height: 0.18, phase: 3 },
      { offsetX: -0.06, offsetZ: -0.09, color: "#f97316", height: 0.11, phase: 4 },
    ]
  }, [])

  const ref = useRef<THREE.Group>(null)
  useFrame(({ clock }) => {
    const t = clock.elapsedTime
    const freq = weather === "windy" ? 3.0 : 0.9
    const amp = weather === "windy" ? 0.13 : 0.038
    if (ref.current) {
      ref.current.rotation.z = Math.sin(t * freq) * amp
    }
  })

  return (
    <group ref={ref}>
      {flowersList.map((f, i) => (
        <group key={i} position={[f.offsetX, 0, f.offsetZ]}>
          <LowPolyFlower color={f.color} height={f.height} phase={f.phase} />
        </group>
      ))}
    </group>
  )
}

// ─────────────────────────────────────────────
// Sapling (Level 2)
// ─────────────────────────────────────────────
function Sapling({
  weather,
  season,
  position = [0, 0, 0],
  scale = 1,
  phaseOffset = 0,
}: {
  weather: Weather
  season: Season
  position?: [number, number, number]
  scale?: number
  phaseOffset?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const foliageColorBase = SEASON_PALETTE[season].foliage
  
  const colorDark = useMemo(() => foliageColorBase.clone().multiplyScalar(0.72), [foliageColorBase])
  const colorLight = useMemo(() => foliageColorBase.clone().multiplyScalar(1.22), [foliageColorBase])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const freq = weather === "windy" ? 2.8 : 0.7
    const amp = weather === "windy" ? 0.1 : 0.025
    groupRef.current.rotation.z = Math.sin(t * freq + phaseOffset) * amp
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Tapered Trunk */}
      <mesh castShadow receiveShadow position={[0, 0.18, 0]}>
        <cylinderGeometry args={[0.02, 0.045, 0.36, 5]} />
        <meshStandardMaterial color="#78350f" flatShading roughness={0.8} />
      </mesh>
      
      {/* Foliage spheres */}
      <LowPolyFoliage
        radius={0.16}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0, 0.42, 0]}
      />
      <LowPolyFoliage
        radius={0.11}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0.05, 0.49, 0.02]}
      />
    </group>
  )
}

// ─────────────────────────────────────────────
// Butterfly (Level 2+)
// ─────────────────────────────────────────────
function Butterfly({ weather }: { weather: Weather }) {
  const groupRef = useRef<THREE.Group>(null)
  const wingRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current || !wingRef.current) return
    const t = clock.elapsedTime
    const speed = weather === "windy" ? 2.2 : 1.1
    groupRef.current.position.x = Math.sin(t * speed * 0.6) * 0.9
    groupRef.current.position.y = Math.sin(t * speed * 1.2) * 0.22 + 0.65
    groupRef.current.position.z = Math.cos(t * speed * 0.6) * 0.7
    wingRef.current.rotation.y = Math.sin(t * 8) * 0.7
  })

  return (
    <group ref={groupRef}>
      <mesh ref={wingRef} position={[-0.06, 0, 0]}>
        <planeGeometry args={[0.12, 0.09]} />
        <meshStandardMaterial color="#ff69b4" side={THREE.DoubleSide} transparent opacity={0.85} flatShading />
      </mesh>
      <mesh position={[0.06, 0, 0]} rotation={[0, Math.PI, 0]}>
        <planeGeometry args={[0.12, 0.09]} />
        <meshStandardMaterial color="#ff69b4" side={THREE.DoubleSide} transparent opacity={0.85} flatShading />
      </mesh>
      <mesh castShadow position={[0, 0, 0]}>
        <cylinderGeometry args={[0.012, 0.012, 0.07, 5]} />
        <meshStandardMaterial color="#4a2040" flatShading />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// Mature Tree (Level 3)
// ─────────────────────────────────────────────
function MatureTree({
  weather,
  season,
  position = [0, 0, 0],
  scale = 1,
  phaseOffset = 0,
}: {
  weather: Weather
  season: Season
  position?: [number, number, number]
  scale?: number
  phaseOffset?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const foliageColorBase = SEASON_PALETTE[season].foliage
  
  const colorDark = useMemo(() => foliageColorBase.clone().multiplyScalar(0.7), [foliageColorBase])
  const colorLight = useMemo(() => foliageColorBase.clone().multiplyScalar(1.25), [foliageColorBase])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const freq = weather === "windy" ? 2.5 : windState.frequency
    const amp = weather === "windy" ? 0.09 : windState.amplitude
    groupRef.current.rotation.z = Math.sin(t * freq + phaseOffset) * amp
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Tapered Trunk */}
      <mesh castShadow receiveShadow position={[0, 0.35, 0]}>
        <cylinderGeometry args={[0.04, 0.08, 0.7, 6]} />
        <meshStandardMaterial color="#451a03" flatShading roughness={0.85} />
      </mesh>
      
      {/* Foliage */}
      <LowPolyFoliage
        radius={0.34}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0, 0.8, 0]}
      />
      <LowPolyFoliage
        radius={0.24}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0.16, 0.92, 0.1]}
      />
      <LowPolyFoliage
        radius={0.22}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[-0.15, 0.88, -0.12]}
      />
    </group>
  )
}

// ─────────────────────────────────────────────
// Pine Tree (Overlapping low-poly cones)
// ─────────────────────────────────────────────
function LowPolyPineFoliage({
  radius,
  height,
  colorDark,
  colorLight,
  position,
}: {
  radius: number
  height: number
  colorDark: THREE.Color
  colorLight: THREE.Color
  position: [number, number, number]
}) {
  const geometry = useMemo(() => {
    let geo = new THREE.ConeGeometry(radius, height, 6, 2)
    geo = geo.toNonIndexed() as THREE.ConeGeometry
    const pos = geo.attributes.position
    const count = pos.count
    const colors = []
    
    for (let i = 0; i < count; i++) {
      const y = pos.getY(i)
      const factor = Math.max(0, Math.min(1, (y + height / 2) / height))
      const color = new THREE.Color().lerpColors(colorDark, colorLight, factor)
      colors.push(color.r, color.g, color.b)
    }
    geo.setAttribute("color", new THREE.Float32BufferAttribute(colors, 3))
    geo.computeVertexNormals()
    return geo
  }, [radius, height, colorDark, colorLight])

  return (
    <mesh castShadow receiveShadow position={position}>
      <primitive object={geometry} />
      <meshStandardMaterial vertexColors flatShading roughness={0.72} />
    </mesh>
  )
}

function PineTree({
  weather,
  season,
  position = [0, 0, 0],
  scale = 1,
  phaseOffset = 0,
}: {
  weather: Weather
  season: Season
  position?: [number, number, number]
  scale?: number
  phaseOffset?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  const foliageColorBase = SEASON_PALETTE[season].foliage
  
  const colorDark = useMemo(() => foliageColorBase.clone().multiplyScalar(0.65), [foliageColorBase])
  const colorLight = useMemo(() => foliageColorBase.clone().multiplyScalar(1.15), [foliageColorBase])

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const freq = weather === "windy" ? 2.8 : windState.frequency * 0.9
    const amp = weather === "windy" ? 0.07 : windState.amplitude * 0.8
    groupRef.current.rotation.z = Math.sin(t * freq + phaseOffset) * amp
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Trunk */}
      <mesh castShadow position={[0, 0.2, 0]}>
        <cylinderGeometry args={[0.02, 0.05, 0.4, 5]} />
        <meshStandardMaterial color="#541e1b" flatShading roughness={0.8} />
      </mesh>
      
      {/* Foliage layers */}
      <LowPolyPineFoliage
        radius={0.34}
        height={0.4}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0, 0.46, 0]}
      />
      <LowPolyPineFoliage
        radius={0.25}
        height={0.34}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0, 0.68, 0]}
      />
      <LowPolyPineFoliage
        radius={0.16}
        height={0.28}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0, 0.88, 0]}
      />
    </group>
  )
}

// ─────────────────────────────────────────────
// Bird (Level 4+)
// ─────────────────────────────────────────────
function Bird({ startOffset = 0, weather }: { startOffset?: number; weather: Weather }) {
  const groupRef = useRef<THREE.Group>(null)
  const wingLRef = useRef<THREE.Mesh>(null)
  const wingRRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime + startOffset
    const speed = weather === "windy" ? 1.6 : 0.9
    const rx = 1.8, rz = 1.2, ry = 0.15
    groupRef.current.position.x = Math.cos(t * speed) * rx
    groupRef.current.position.z = Math.sin(t * speed) * rz
    groupRef.current.position.y = 1.2 + Math.sin(t * speed * 2) * ry
    groupRef.current.rotation.y = -t * speed + Math.PI / 2
    
    const flapAmp = 0.5
    const flapSpeed = weather === "windy" ? 10 : 6
    if (wingLRef.current) wingLRef.current.rotation.z = Math.sin(t * flapSpeed) * flapAmp + 0.2
    if (wingRRef.current) wingRRef.current.rotation.z = -Math.sin(t * flapSpeed) * flapAmp - 0.2
  })

  return (
    <group ref={groupRef} scale={0.09}>
      <mesh castShadow receiveShadow>
        <sphereGeometry args={[1, 7, 7]} />
        <meshStandardMaterial color="#3f6212" flatShading roughness={0.7} />
      </mesh>
      <mesh castShadow receiveShadow position={[1.1, 0.4, 0]}>
        <sphereGeometry args={[0.6, 6, 6]} />
        <meshStandardMaterial color="#2d4a0f" flatShading roughness={0.7} />
      </mesh>
      <mesh ref={wingLRef} castShadow position={[0, 0, -1.2]}>
        <boxGeometry args={[1.6, 0.12, 1]} />
        <meshStandardMaterial color="#3f6212" flatShading roughness={0.7} />
      </mesh>
      <mesh ref={wingRRef} castShadow position={[0, 0, 1.2]}>
        <boxGeometry args={[1.6, 0.12, 1]} />
        <meshStandardMaterial color="#3f6212" flatShading roughness={0.7} />
      </mesh>
    </group>
  )
}

// ─────────────────────────────────────────────
// Cherry Blossom Tree (Level 5)
// ─────────────────────────────────────────────
function CherryBlossomTree({
  weather,
  position = [0, 0, 0],
  scale = 1,
  phaseOffset = 0,
}: {
  weather: Weather
  position?: [number, number, number]
  scale?: number
  phaseOffset?: number
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  const colorDark = useMemo(() => new THREE.Color("#db2777"), []) // Deep pink
  const colorLight = useMemo(() => new THREE.Color("#fbcfe8"), []) // Light pink

  useFrame(({ clock }) => {
    if (!groupRef.current) return
    const t = clock.elapsedTime
    const freq = weather === "windy" ? 2.6 : 0.8
    const amp = weather === "windy" ? 0.08 : 0.022
    groupRef.current.rotation.z = Math.sin(t * freq + phaseOffset) * amp
  })

  return (
    <group ref={groupRef} position={position} scale={scale}>
      {/* Tapered Trunk */}
      <mesh castShadow position={[0, 0.3, 0]}>
        <cylinderGeometry args={[0.045, 0.08, 0.6, 6]} />
        <meshStandardMaterial color="#3b2314" flatShading roughness={0.85} />
      </mesh>
      
      {/* Blossom clouds */}
      <LowPolyFoliage
        radius={0.32}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0, 0.78, 0]}
      />
      <LowPolyFoliage
        radius={0.23}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[0.18, 0.86, 0.1]}
      />
      <LowPolyFoliage
        radius={0.25}
        detail={1}
        colorDark={colorDark}
        colorLight={colorLight}
        position={[-0.16, 0.82, -0.1]}
      />
    </group>
  )
}

// ─────────────────────────────────────────────
// Sun Disc
// ─────────────────────────────────────────────
function SunDisc({ weather }: { weather: Weather }) {
  const meshRef = useRef<THREE.Mesh>(null)

  useFrame(({ clock }) => {
    if (!meshRef.current) return
    const mat = meshRef.current.material as THREE.MeshStandardMaterial
    mat.emissiveIntensity = 0.6 + Math.sin(clock.elapsedTime * 1.2) * 0.15
    meshRef.current.rotation.z = clock.elapsedTime * 0.05
  })

  if (weather !== "sunny") return null

  return (
    <mesh ref={meshRef} position={[4, 7, -3]}>
      <sphereGeometry args={[0.35, 12, 12]} />
      <meshStandardMaterial
        color="#FDE68A"
        emissive="#FBBF24"
        emissiveIntensity={0.7}
        toneMapped={false}
      />
    </mesh>
  )
}

// ─────────────────────────────────────────────
// Rain Particles
// ─────────────────────────────────────────────
function RainSystem({ weather }: { weather: Weather }) {
  const COUNT = 150
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const drops = useMemo(() =>
    [...Array(COUNT)].map((_, i) => ({
      x: (seededRandom(i * 7) - 0.5) * 8,
      z: (seededRandom(i * 13) - 0.5) * 8,
      y: seededRandom(i * 31) * 6,
      speed: 3.5 + seededRandom(i * 19) * 2,
    })), [])

  const positions = useRef(drops.map((d) => ({ ...d })))

  useFrame((_, delta) => {
    if (!instancedRef.current || weather !== "rainy") return
    positions.current.forEach((p, i) => {
      p.y -= p.speed * delta
      if (p.y < -0.8) p.y = 5.5 + seededRandom(i * 41 + performance.now() * 0.0001) * 1.5
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.z = -0.22
      dummy.scale.set(1, 1, 1)
      dummy.updateMatrix()
      instancedRef.current!.setMatrixAt(i, dummy.matrix)
    })
    instancedRef.current.instanceMatrix.needsUpdate = true
  })

  if (weather !== "rainy") return null

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, COUNT]}>
      <cylinderGeometry args={[0.008, 0.008, 0.35, 4]} />
      <meshBasicMaterial color="#93c5fd" transparent opacity={0.55} />
    </instancedMesh>
  )
}

// ─────────────────────────────────────────────
// Season Particles
// ─────────────────────────────────────────────
function SeasonParticles({ season, level }: { season: Season; level: number }) {
  const COUNT = level >= 3 ? 60 : 30
  const instancedRef = useRef<THREE.InstancedMesh>(null)
  const dummy = useMemo(() => new THREE.Object3D(), [])

  const particles = useMemo(() =>
    [...Array(COUNT)].map((_, i) => ({
      x: (seededRandom(i * 7) - 0.5) * 7,
      z: (seededRandom(i * 13) - 0.5) * 7,
      y: seededRandom(i * 29) * 5,
      speedY: 0.3 + seededRandom(i * 17) * 0.4,
      speedX: (seededRandom(i * 23) - 0.5) * 0.3,
      rot: seededRandom(i * 37) * Math.PI * 2,
      rotSpeed: (seededRandom(i * 43) - 0.5) * 2.0,
    })), [COUNT])

  const positions = useRef(particles.map((p) => ({ ...p })))
  const matRef = useRef<THREE.MeshBasicMaterial>(null)

  useEffect(() => {
    positions.current = particles.map((p) => ({ ...p }))
  }, [particles])

  useEffect(() => {
    if (matRef.current) {
      matRef.current.color.copy(SEASON_PALETTE[season].particleColor)
    }
  }, [season])

  useFrame((_, delta) => {
    if (!instancedRef.current) return
    positions.current.forEach((p, i) => {
      p.y -= p.speedY * delta
      p.x += p.speedX * delta
      p.rot += p.rotSpeed * delta
      if (p.y < -1.5) {
        p.y = 4.5 + seededRandom(i + Date.now() * 0.000001) * 2
        p.x = (seededRandom(i * 7 + Date.now() * 0.0000013) - 0.5) * 7
      }
      dummy.position.set(p.x, p.y, p.z)
      dummy.rotation.set(p.rot, p.rot * 0.5, p.rot)
      dummy.scale.setScalar(0.035)
      dummy.updateMatrix()
      instancedRef.current!.setMatrixAt(i, dummy.matrix)
    })
    instancedRef.current.instanceMatrix.needsUpdate = true
  })

  if (level === 0 || level === 99) return null

  return (
    <instancedMesh ref={instancedRef} args={[undefined, undefined, COUNT]}>
      <dodecahedronGeometry args={[1, 0]} />
      <meshBasicMaterial
        ref={matRef}
        color={SEASON_PALETTE[season].particleColor}
        transparent
        opacity={0.65}
      />
    </instancedMesh>
  )
}

// ─────────────────────────────────────────────
// 3-Point Shadow-Casting Lighting Rig
// ─────────────────────────────────────────────
function DynamicLighting({
  weather,
  season,
}: {
  weather: Weather
  season: Season
}) {
  const dirRef = useRef<THREE.DirectionalLight>(null)
  const hemiRef = useRef<THREE.HemisphereLight>(null)

  useFrame(({ clock }) => {
    if (dirRef.current) {
      const base = weather === "rainy" ? 0.4 : weather === "windy" ? 1.0 : 1.5
      dirRef.current.intensity = base + Math.sin(clock.elapsedTime * 1.0) * (weather === "sunny" ? 0.12 : 0.03)
    }
    if (hemiRef.current) {
      const palette = SEASON_PALETTE[season]
      hemiRef.current.color.copy(palette.sky)
      hemiRef.current.groundColor.copy(palette.ground)
    }
  })

  return (
    <>
      {/* 1. Fill light 1: Soft Ambient */}
      <ambientLight intensity={weather === "rainy" ? 0.15 : 0.22} />
      
      {/* 2. Fill light 2: Soft Hemisphere */}
      <hemisphereLight
        ref={hemiRef}
        args={[
          SEASON_PALETTE[season].sky,
          SEASON_PALETTE[season].ground,
          0.38,
        ]}
      />

      {/* 3. Key Light: Sun (casts shadows, higher intensity) */}
      <directionalLight
        ref={dirRef}
        position={[6, 9, 5]}
        intensity={1.5}
        castShadow
        shadow-mapSize={[2048, 2048]}
        shadow-camera-near={0.5}
        shadow-camera-far={25}
        shadow-camera-left={-4}
        shadow-camera-right={4}
        shadow-camera-top={4}
        shadow-camera-bottom={-4}
        shadow-bias={0.0002}
      />

      {/* 4. Rim / Back Light: Adds edge highlights to low-poly models */}
      <directionalLight
        position={[-6, 4, -6]}
        intensity={0.35}
        color="#a5f3fc" // soft blue
      />

      {weather === "rainy" && (
        <fog attach="fog" args={["#8090a0", 9, 22]} />
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// Asset Isolation Lab (Level 99 Playground)
// ─────────────────────────────────────────────
function AssetIsolationLab({ weather, season }: { weather: Weather; season: Season }) {
  const rockGeo = useMemo(() => createLowPolyRockGeometry(1.2, 42), [])

  return (
    <group position={[0, 0.2, 0]}>
      {/* Simple dark test plane */}
      <mesh receiveShadow rotation={[-Math.PI / 2, 0, 0]} position={[0, -0.02, 0]}>
        <planeGeometry args={[6.5, 6.5]} />
        <meshStandardMaterial color="#1e293b" roughness={0.8} flatShading />
      </mesh>
      
      {/* Grid helper for scale visual */}
      <gridHelper args={[6.5, 12, "#10b981", "#334155"]} position={[0, 0.001, 0]} />

      {/* 1. Low-Poly Tree (Isolated) */}
      <group position={[-1.6, 0, -0.4]}>
        <MatureTree weather={weather} season={season} position={[0, 0, 0]} scale={1.3} />
      </group>

      {/* 2. Low-Poly Flower Cluster (Isolated) */}
      <group position={[1.4, 0, -0.6]}>
        <IsolatedFlowerCluster weather={weather} />
      </group>

      {/* 3. Low-Poly Rock (Isolated) */}
      <group position={[0.2, 0, 1.2]}>
        <mesh castShadow receiveShadow position={[0, 1.2 * 0.25, 0]}>
          <primitive object={rockGeo} />
          <meshStandardMaterial color="#6b7280" flatShading roughness={0.8} />
        </mesh>
      </group>
    </group>
  )
}

// ─────────────────────────────────────────────
// Level-Driven Vegetation Content
// ─────────────────────────────────────────────
function LevelContent({
  level,
  weather,
  season,
}: {
  level: number
  weather: Weather
  season: Season
}) {
  return (
    <>
      {/* Level 0: just rocks */}
      {level === 0 && <Rocks />}

      {/* Level 1: wildflowers + rocks */}
      {level === 1 && (
        <>
          <Rocks />
          <Wildflowers weather={weather} />
        </>
      )}

      {/* Level 2: sapling + butterfly + wildflowers */}
      {level === 2 && (
        <>
          <Wildflowers weather={weather} />
          <Sapling weather={weather} season={season} position={[0, getTerrainHeight(0, 0, 2), 0]} scale={1} />
          <Sapling weather={weather} season={season} position={[-0.8, getTerrainHeight(-0.8, 0.5, 2), 0.5]} scale={0.65} phaseOffset={1} />
          <Butterfly weather={weather} />
        </>
      )}

      {/* Level 3: mature tree + sapling + butterfly */}
      {level === 3 && (
        <>
          <Wildflowers weather={weather} />
          <MatureTree weather={weather} season={season} position={[0, getTerrainHeight(0, 0, 3), 0]} scale={1} />
          <Sapling weather={weather} season={season} position={[0.9, getTerrainHeight(0.9, -0.5, 3), -0.5]} scale={0.55} phaseOffset={0.8} />
          <Sapling weather={weather} season={season} position={[-0.8, getTerrainHeight(-0.8, 0.7, 3), 0.7]} scale={0.5} phaseOffset={1.4} />
          <Butterfly weather={weather} />
        </>
      )}

      {/* Level 4: young forest */}
      {level === 4 && (
        <>
          <Wildflowers weather={weather} />
          <MatureTree weather={weather} season={season} position={[0, getTerrainHeight(0, 0, 4), 0]} scale={1} phaseOffset={0} />
          <PineTree weather={weather} season={season} position={[-1.0, getTerrainHeight(-1.0, -0.4, 4), -0.4]} scale={0.85} phaseOffset={0.6} />
          <PineTree weather={weather} season={season} position={[0.8, getTerrainHeight(0.8, 0.7, 4), 0.7]} scale={0.75} phaseOffset={1.1} />
          <Sapling weather={weather} season={season} position={[-0.4, getTerrainHeight(-0.4, 0.9, 4), 0.9]} scale={0.6} phaseOffset={0.3} />
          <Sapling weather={weather} season={season} position={[1.1, getTerrainHeight(1.1, -0.8, 4), -0.8]} scale={0.5} phaseOffset={1.8} />
          <Butterfly weather={weather} />
          <Bird startOffset={0} weather={weather} />
          <Bird startOffset={Math.PI} weather={weather} />
        </>
      )}

      {/* Level 5: thriving sanctuary */}
      {level >= 5 && level !== 99 && (
        <>
          <Wildflowers weather={weather} />
          <CherryBlossomTree weather={weather} position={[0, getTerrainHeight(0, 0, 5), 0]} scale={1} phaseOffset={0} />
          <MatureTree weather={weather} season={season} position={[-0.95, getTerrainHeight(-0.95, -0.5, 5), -0.5]} scale={0.9} phaseOffset={0.5} />
          <PineTree weather={weather} season={season} position={[0.85, getTerrainHeight(0.85, 0.6, 5), 0.6]} scale={0.8} phaseOffset={0.9} />
          <CherryBlossomTree weather={weather} position={[-0.5, getTerrainHeight(-0.5, 0.95, 5), 0.95]} scale={0.7} phaseOffset={1.3} />
          <Sapling weather={weather} season={season} position={[1.1, getTerrainHeight(1.1, -0.7, 5), -0.7]} scale={0.5} phaseOffset={1.7} />
          <Butterfly weather={weather} />
          <Bird startOffset={0} weather={weather} />
          <Bird startOffset={Math.PI} weather={weather} />
          <Sparkles
            count={28}
            scale={3.5}
            size={2.5}
            speed={0.35}
            color="#fbbf24"
            opacity={0.7}
          />
        </>
      )}
    </>
  )
}

// ─────────────────────────────────────────────
// Main 3D Scene Controller
// ─────────────────────────────────────────────
function GardenScene({
  level,
  weather,
  season,
}: {
  level: number
  weather: Weather
  season: Season
}) {
  const groupRef = useRef<THREE.Group>(null)
  
  // Local fly-in state running on mount
  const [localIntro, setLocalIntro] = useState(true)
  useEffect(() => {
    const timer = setTimeout(() => setLocalIntro(false), 2000)
    return () => clearTimeout(timer)
  }, [])

  const camStartPos = useMemo(() => new THREE.Vector3(15, 12, 15), [])
  const camEndPos = useMemo(() => new THREE.Vector3(6.8, 5.6, 6.8), [])

  useFrame((state) => {
    if (groupRef.current) {
      if (localIntro && level !== 99) {
        // scale island up from 0 during intro
        const elapsed = state.clock.getElapsedTime()
        const scaleVal = Math.min(1, elapsed / 1.5)
        groupRef.current.scale.setScalar(scaleVal)
        
        // smooth camera zoom/dolly-in animation on mount
        state.camera.position.lerpVectors(camStartPos, camEndPos, Math.min(1, elapsed / 1.5))
        state.camera.lookAt(0, 0.4, 0)
      } else {
        groupRef.current.scale.setScalar(1)
      }
    }
  })

  // Update wind state when weather changes
  useEffect(() => {
    if (weather === "windy") {
      windState.frequency = 3.0
      windState.amplitude = 0.09
    } else if (weather === "rainy") {
      windState.frequency = 1.2
      windState.amplitude = 0.03
    } else {
      windState.frequency = 0.8
      windState.amplitude = 0.018
    }
  }, [weather])

  return (
    <>
      <DynamicLighting weather={weather} season={season} />
      <SunDisc weather={weather} />

      {level === 99 ? (
        <AssetIsolationLab weather={weather} season={season} />
      ) : (
        <group ref={groupRef}>
          <IslandTerrain season={season} level={level} />
          <IslandBase />
          <WaterPlane season={season} />
          <LevelContent level={level} weather={weather} season={season} />
          <RainSystem weather={weather} />
          <SeasonParticles season={season} level={level} />
        </group>
      )}

      {level !== 99 && (
        <ContactShadows
          position={[0, -0.67, 0]}
          opacity={0.4}
          scale={7}
          blur={2.0}
          far={2.0}
        />
      )}

      <OrbitControls
        enabled={!localIntro || level === 99}
        minPolarAngle={Math.PI / 6}
        maxPolarAngle={level === 99 ? Math.PI / 2.15 : Math.PI / 2.25}
        autoRotate={level === 99 ? false : !localIntro}
        autoRotateSpeed={0.45}
        enablePan={false}
        enableZoom={true}
        minDistance={5}
        maxDistance={15}
        target={level === 99 ? [0, 0.6, 0] : [0, 0.4, 0]}
        makeDefault
      />
    </>
  )
}

// ─────────────────────────────────────────────
// Loading fallback
// ─────────────────────────────────────────────
function GardenFallback() {
  return (
    <div className="w-full h-full flex items-center justify-center bg-forest-950">
      <div className="flex flex-col items-center gap-3 animate-pulse">
        <div className="text-3xl">🌱</div>
        <p className="text-xs font-bold text-emerald-500/70 uppercase tracking-widest">Growing Garden…</p>
      </div>
    </div>
  )
}

// ─────────────────────────────────────────────
// Exported Garden3D Component
// ─────────────────────────────────────────────
function Garden3D({ level, weather, season }: Garden3DProps) {
  const isLowEnd = typeof navigator !== "undefined" && navigator.hardwareConcurrency < 4

  return (
    <Suspense fallback={<GardenFallback />}>
      <Canvas
        shadows={!isLowEnd}
        dpr={[1, isLowEnd ? 1 : 2]}
        camera={{ position: [15, 12, 15], fov: 42, near: 0.1, far: 50 }}
        gl={{ antialias: !isLowEnd, powerPreference: "high-performance" }}
        style={{ width: "100%", height: "100%" }}
      >
        <GardenScene level={level} weather={weather} season={season} />
      </Canvas>
    </Suspense>
  )
}

export default memo(Garden3D)
