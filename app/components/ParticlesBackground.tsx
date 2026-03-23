'use client'

import { useEffect, useState } from 'react'
import Particles, { initParticlesEngine } from "@tsparticles/react"
import { loadSlim } from "@tsparticles/slim"

export default function ParticlesBackground() {
  const [init, setInit] = useState(false)

  useEffect(() => {
    initParticlesEngine(async (engine) => {
      await loadSlim(engine)
    }).then(() => {
      setInit(true)
    })
  }, [])

  if (!init) return null

  return (
    <Particles
      id="tsparticles"
      className="absolute inset-0 z-0 pointer-events-none"
      options={{
        background: { color: { value: "transparent" } },
        fpsLimit: 60,
        interactivity: {
          events: { onHover: { enable: true, mode: "grab" }, resize: { enable: true } },
          modes: { grab: { distance: 180, links: { opacity: 0.8, color: "#f97316" } } },
        },
        particles: {
          color: { value: ["#3b82f6", "#f97316", "#ffffff"] },
          links: {
            color: "#ffffff",
            distance: 150,
            enable: true,
            opacity: 0.15,
            width: 1
          },
          move: { direction: "none", enable: true, outModes: { default: "bounce" }, random: false, speed: 0.6, straight: false },
          number: { density: { enable: true }, value: 70 },
          opacity: { value: 0.4 },
          shape: { type: "circle" },
          size: { value: { min: 1, max: 3 } },
        },
        detectRetina: true,
      }}
    />
  )
}
