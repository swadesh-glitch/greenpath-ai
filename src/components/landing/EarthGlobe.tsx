"use client"

import React, { useRef, useEffect, useState } from "react"
import { Canvas, useFrame } from "@react-three/fiber"
import { OrbitControls, Stars } from "@react-three/drei"
import * as THREE from "three"

// Coordinates for actual Earth continents (Equirectangular projection on 1024x512 canvas)
const CONTINENT_POLYGONS = [
  // North America
  [
    [80, 60], [120, 40], [160, 40], [180, 50], [210, 30], [240, 40], 
    [260, 65], [250, 95], [260, 110], [290, 120], [300, 140], [290, 160], 
    [270, 175], [240, 165], [220, 170], [210, 190], [195, 230], [185, 250],
    [175, 250], [180, 220], [165, 205], [160, 185], [130, 175], [115, 185],
    [105, 170], [110, 140], [90, 135], [75, 110], [60, 105], [55, 90],
    [70, 75]
  ],
  // South America
  [
    [175, 250], [190, 260], [210, 275], [220, 290], [230, 315], [235, 335],
    [220, 370], [200, 410], [185, 440], [175, 465], [170, 470], [165, 465],
    [165, 440], [155, 400], [145, 360], [135, 315], [130, 295], [140, 275],
    [155, 260], [170, 250]
  ],
  // Greenland
  [
    [265, 25], [285, 20], [315, 25], [325, 40], [310, 70], [295, 80],
    [275, 75], [255, 55], [260, 35]
  ],
  // Africa
  [
    [480, 205], [500, 195], [520, 190], [550, 195], [580, 210], [595, 230],
    [595, 260], [585, 280], [575, 305], [575, 335], [555, 365], [545, 400],
    [540, 415], [535, 420], [530, 415], [525, 390], [515, 360], [510, 330],
    [505, 315], [490, 290], [475, 275], [465, 260], [465, 240], [470, 220],
    [480, 205]
  ],
  // Europe & Asia (Eurasia)
  [
    [450, 110], [465, 85], [480, 75], [505, 60], [535, 50], [580, 45],
    [630, 45], [680, 40], [740, 35], [800, 35], [860, 50], [900, 65],
    [930, 85], [940, 110], [925, 140], [905, 175], [895, 205], [885, 235],
    [865, 260], [840, 250], [820, 225], [810, 205], [785, 215], [755, 230],
    [725, 250], [705, 270], [675, 285], [660, 280], [665, 250], [685, 235],
    [695, 215], [695, 190], [665, 175], [640, 185], [610, 195], [590, 210],
    [575, 195], [560, 180], [540, 170], [520, 175], [490, 170], [480, 155],
    [470, 135], [450, 110]
  ],
  // Australia
  [
    [780, 325], [805, 315], [830, 320], [855, 335], [870, 360], [875, 385],
    [855, 410], [820, 415], [795, 400], [775, 370], [770, 345], [780, 325]
  ],
  // Antarctica
  [
    [50, 480], [100, 475], [200, 470], [300, 470], [400, 465], [500, 470],
    [600, 470], [700, 470], [800, 475], [900, 480], [980, 490], [980, 505],
    [50, 505], [50, 480]
  ]
]

// Custom Earth Mesh Component to handle satellite textures, bump mapping, and day/night transitions
const EarthMesh: React.FC<{ progress: number }> = ({ progress }) => {
  const earthRef = useRef<THREE.Mesh>(null)
  const cloudsRef = useRef<THREE.Mesh>(null)
  
  const [earthTexture, setEarthTexture] = useState<THREE.CanvasTexture | null>(null)
  const [bumpTexture, setBumpTexture] = useState<THREE.CanvasTexture | null>(null)
  const [cloudsTexture, setCloudsTexture] = useState<THREE.CanvasTexture | null>(null)

  // 1. Generate procedural high-detail Earth texture mapping actual continents
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 2048
    canvas.height = 1024
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    // Draw Ocean Background
    // Damaged (0): Dark murky brown-grey (rgb(20, 18, 15))
    // Healthy (1): Rich sapphire-teal blue (rgb(12, 38, 55))
    const oceanR = Math.round(20 + (12 - 20) * progress)
    const oceanG = Math.round(18 + (38 - 18) * progress)
    const oceanB = Math.round(15 + (55 - 15) * progress)
    ctx.fillStyle = `rgb(${oceanR}, ${oceanG}, ${oceanB})`
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Draw coastal shallow reef shelves (Cyan outlines around continents)
    if (progress > 0.1) {
      ctx.strokeStyle = `rgba(0, 240, 255, ${progress * 0.28})`
      ctx.lineWidth = 16
      ctx.shadowBlur = 10
      ctx.shadowColor = "rgba(0, 240, 255, 0.4)"
      
      CONTINENT_POLYGONS.forEach((poly) => {
        ctx.beginPath()
        poly.forEach((pt, i) => {
          const x = pt[0] * 2
          const y = pt[1] * 2
          if (i === 0) ctx.moveTo(x, y)
          else ctx.lineTo(x, y)
        })
        ctx.closePath()
        ctx.stroke()
      })
      
      // Reset shadow mapping parameters
      ctx.shadowBlur = 0
    }

    // Draw Continents Lands
    CONTINENT_POLYGONS.forEach((poly, idx) => {
      ctx.beginPath()
      poly.forEach((pt, i) => {
        const x = pt[0] * 2
        const y = pt[1] * 2
        if (i === 0) ctx.moveTo(x, y)
        else ctx.lineTo(x, y)
      })
      ctx.closePath()

      // Land colors depending on region and health
      // Greenland and Antarctica (idx 2 & 6) are Ice Caps: always white
      const isPolar = idx === 2 || idx === 6
      
      if (isPolar) {
        // Polluted: grey-black soot ice caps. Healthy: pristine white
        const iceVal = Math.round(100 + (255 - 100) * progress)
        ctx.fillStyle = `rgb(${iceVal}, ${iceVal}, ${iceVal})`
      } else {
        // Standard continents
        // Damaged: Dusty dry brown (rgb(70, 60, 52))
        // Healthy: Lush green with geographical details (Sahara Desert, forests)
        const landR = Math.round(70 + (25 - 70) * progress)
        const landG = Math.round(60 + (95 - 60) * progress)
        const landB = Math.round(52 + (50 - 52) * progress)
        
        // Add geographical satellite gradients to lands (Sahara etc.)
        const grad = ctx.createLinearGradient(0, 300, 2048, 700)
        grad.addColorStop(0, `rgb(${landR}, ${landG}, ${landB})`)
        
        if (progress > 0.4) {
          // Sahara desert beige highlights (around center Africa / x: 500-600)
          grad.addColorStop(0.5, "rgb(230, 205, 160)")
          grad.addColorStop(0.65, "rgb(16, 120, 80)")
        }
        
        ctx.fillStyle = grad
      }
      ctx.fill()
    })

    // Draw minor forest details & glowing industrial heatspots (damaged city spots / fires)
    if (progress < 0.4) {
      // Toxic orange scars on industrial zones
      ctx.fillStyle = "rgba(239, 68, 68, 0.45)"
      ctx.beginPath()
      ctx.arc(400, 200, 35, 0, Math.PI * 2)
      ctx.arc(1200, 180, 55, 0, Math.PI * 2)
      ctx.arc(1400, 260, 25, 0, Math.PI * 2)
      ctx.fill()
    } else {
      // Lush forest overlays (Deep rich emerald green)
      ctx.fillStyle = `rgba(4, 120, 87, ${progress * 0.4})`
      ctx.beginPath()
      ctx.arc(380, 220, 45, 0, Math.PI * 2)
      ctx.arc(1150, 190, 65, 0, Math.PI * 2)
      ctx.arc(1350, 280, 35, 0, Math.PI * 2)
      ctx.fill()
    }

    const texture = new THREE.CanvasTexture(canvas)
    texture.colorSpace = THREE.SRGBColorSpace
    setEarthTexture(texture)
  }, [progress])

  // 2. Generate high-frequency noise map for bump mapping terrain realism
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.fillStyle = "#808080"
    ctx.fillRect(0, 0, canvas.width, canvas.height)

    // Render rough noise details on continents
    CONTINENT_POLYGONS.forEach((poly) => {
      ctx.beginPath()
      poly.forEach((pt, i) => {
        if (i === 0) ctx.moveTo(pt[0], pt[1])
        else ctx.lineTo(pt[0], pt[1])
      })
      ctx.closePath()
      ctx.fillStyle = "#959595"
      ctx.fill()
    })

    // Sprinkle random granular height variance noise
    for (let i = 0; i < 2000; i++) {
      const rx = Math.random() * canvas.width
      const ry = Math.random() * canvas.height
      const rSize = Math.random() * 2 + 1
      ctx.fillStyle = Math.random() > 0.5 ? "#b0b0b0" : "#505050"
      ctx.fillRect(rx, ry, rSize, rSize)
    }

    const texture = new THREE.CanvasTexture(canvas)
    setBumpTexture(texture)
  }, [])

  // 3. Generate high-resolution swirling cloud systems (Smog -> Fluffy white clouds)
  useEffect(() => {
    const canvas = document.createElement("canvas")
    canvas.width = 1024
    canvas.height = 512
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)

    // Cloud systems transition: 0: dusty grey smog bands -> 1: white swirling hurricanes
    const r = Math.round(110 + (255 - 110) * progress)
    const g = Math.round(95 + (255 - 95) * progress)
    const b = Math.round(80 + (255 - 80) * progress)
    const opacity = 0.18 + progress * 0.35

    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity})`

    // Swirling storm 1
    ctx.beginPath()
    ctx.arc(200, 150, 60, 0, Math.PI * 2)
    ctx.arc(260, 160, 80, 0, Math.PI * 2)
    ctx.arc(310, 140, 50, 0, Math.PI * 2)
    ctx.fill()

    // Swirling storm 2
    ctx.beginPath()
    ctx.arc(680, 240, 70, 0, Math.PI * 2)
    ctx.arc(750, 220, 95, 0, Math.PI * 2)
    ctx.arc(810, 250, 60, 0, Math.PI * 2)
    ctx.fill()

    // Wispy atmospheric bands
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${opacity * 0.4})`
    ctx.fillRect(0, 60, canvas.width, 25)
    ctx.fillRect(0, 380, canvas.width, 35)

    const texture = new THREE.CanvasTexture(canvas)
    setCloudsTexture(texture)
  }, [progress])

  // Continuous Earth & clouds rotation
  useFrame((state) => {
    if (earthRef.current) {
      earthRef.current.rotation.y = state.clock.getElapsedTime() * 0.035
    }
    if (cloudsRef.current) {
      cloudsRef.current.rotation.y = state.clock.getElapsedTime() * 0.048
      // Subtle cloud swaying
      cloudsRef.current.rotation.x = Math.sin(state.clock.getElapsedTime() * 0.1) * 0.02
    }
  })

  return (
    <group>
      {/* Volumetric satellite Earth sphere */}
      {earthTexture && (
        <mesh ref={earthRef} castShadow receiveShadow>
          <sphereGeometry args={[2, 64, 64]} />
          <meshStandardMaterial
            map={earthTexture}
            bumpMap={bumpTexture || undefined}
            bumpScale={0.035}
            roughness={0.7}
            metalness={0.12}
          />
        </mesh>
      )}

      {/* Dynamic Parallax Clouds Mesh */}
      {cloudsTexture && (
        <mesh ref={cloudsRef}>
          <sphereGeometry args={[2.025, 64, 64]} />
          <meshStandardMaterial
            map={cloudsTexture}
            transparent
            depthWrite={false}
            blending={THREE.NormalBlending}
          />
        </mesh>
      )}

      {/* Atmospheric glowing rim highlight (Grey-Orange at 0 -> Electric Blue at 1) */}
      <mesh>
        <sphereGeometry args={[2.05, 32, 32]} />
        <meshBasicMaterial
          color={progress > 0.5 ? "#2563eb" : "#c2410c"}
          transparent
          opacity={0.08 + (progress * 0.08)}
          side={THREE.BackSide}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
    </group>
  )
}

// Particle field (Smog smoke clouds at 0 -> leaves/sparks stardust at 1)
const SmokeParticles: React.FC<{ progress: number }> = ({ progress }) => {
  const pointsRef = useRef<THREE.Points>(null)
  
  const particleCount = 220
  const positions = React.useMemo(() => {
    const arr = new Float32Array(particleCount * 3)
    for (let i = 0; i < particleCount * 3; i += 3) {
      const u = Math.random()
      const v = Math.random()
      const theta = u * 2.0 * Math.PI
      const phi = Math.acos(2.0 * v - 1.0)
      const r = 2.4 + Math.random() * 1.8 // Shell boundary
      
      arr[i] = r * Math.sin(phi) * Math.cos(theta)
      arr[i + 1] = r * Math.sin(phi) * Math.sin(theta)
      arr[i + 2] = r * Math.cos(phi)
    }
    return arr
  }, [])

  useFrame((state) => {
    if (pointsRef.current) {
      pointsRef.current.rotation.y = state.clock.getElapsedTime() * 0.015
      pointsRef.current.rotation.x = state.clock.getElapsedTime() * 0.008
    }
  })

  // Smooth color transitions
  const color = progress > 0.5 ? new THREE.Color("#10b981") : new THREE.Color("#ef4444")

  return (
    <points ref={pointsRef}>
      <bufferGeometry>
        <bufferAttribute
          attach="attributes-position"
          args={[positions, 3]}
        />
      </bufferGeometry>
      <pointsMaterial
        color={color}
        size={0.04}
        sizeAttenuation
        transparent
        opacity={0.3 + (1 - progress) * 0.4}
        blending={THREE.AdditiveBlending}
      />
    </points>
  )
}

interface EarthGlobeProps {
  progress: number
}

const EarthGlobe: React.FC<EarthGlobeProps> = ({ progress }) => {
  return (
    <div className="w-full h-full relative flex items-center justify-center">
      {/* 3D Canvas wrapper */}
      <Canvas
        camera={{ position: [0, 0, 4.3], fov: 60 }}
        gl={{ antialias: true, alpha: true }}
        style={{ background: "transparent" }}
      >
        <ambientLight intensity={0.45} />
        
        {/* Dynamic Sunlight highlighting the globe curves (Apple keynote style) */}
        <directionalLight 
          position={[-3.5, 2.5, 2.5]} 
          intensity={1.8 + progress * 0.6} 
          color={progress > 0.5 ? "#f0fdf4" : "#fef3c7"} 
        />
        <pointLight position={[3.5, -3.5, -2]} intensity={0.25} color="#10b981" />

        {/* Cinematic deep-space stardust field */}
        <Stars radius={120} depth={60} count={350} factor={5} saturation={0.6} fade speed={1.2} />

        {/* Volumetric procedural Earth */}
        <EarthMesh progress={progress} />

        {/* Smog or healing particles */}
        <SmokeParticles progress={progress} />

        <OrbitControls enableZoom={false} autoRotate={false} />
      </Canvas>
    </div>
  )
}

export default EarthGlobe
