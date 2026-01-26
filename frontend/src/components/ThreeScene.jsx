import { useEffect } from 'react'
import * as THREE from 'three'
import { OrbitControls } from 'three/addons/controls/OrbitControls.js'
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js'
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js'
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js'

export default function ThreeScene() {
  useEffect(() => {
    let renderer, scene, camera, composer, animationId

    try {
      scene = new THREE.Scene()
      scene.background = new THREE.Color(0x000000)

      camera = new THREE.PerspectiveCamera(
        75,
        window.innerWidth / window.innerHeight,
        0.1,
        1000
      )
      camera.position.z = 2.5

      renderer = new THREE.WebGLRenderer({ antialias: true })
      renderer.setSize(window.innerWidth, window.innerHeight)
      renderer.setPixelRatio(window.devicePixelRatio)
      renderer.toneMapping = THREE.ReinhardToneMapping
      renderer.domElement.style.position = 'fixed'
      renderer.domElement.style.top = '0'
      renderer.domElement.style.left = '0'
      renderer.domElement.style.zIndex = '0'
      document.body.appendChild(renderer.domElement)

      const controls = new OrbitControls(camera, renderer.domElement)
      controls.enableDamping = true

      scene.add(new THREE.AmbientLight(0xffffff, 0.2))
      const light = new THREE.DirectionalLight(0xffffff, 2)
      light.position.set(5, 10, 7)
      scene.add(light)

      const geo = new THREE.IcosahedronGeometry(1, 2)
      const mesh = new THREE.Mesh(
        geo,
        new THREE.MeshPhysicalMaterial({
          color: 0x000000,
          flatShading: true,
          metalness: 0.9,
          roughness: 0.1,
          clearcoat: 1
        })
      )
      scene.add(mesh)

      mesh.add(
        new THREE.Mesh(
          geo,
          new THREE.MeshBasicMaterial({ color: 0xffffff, wireframe: true })
        )
      )

      // STARS
      const starsGeo = new THREE.BufferGeometry()
      const count = 1200
      const pos = new Float32Array(count * 3)
      for (let i = 0; i < pos.length; i++) {
        pos[i] = (Math.random() - 0.5) * 6
      }
      starsGeo.setAttribute('position', new THREE.BufferAttribute(pos, 3))

      const stars = new THREE.Points(
        starsGeo,
        new THREE.PointsMaterial({
          size: 0.05,
          color: 0xffffff,
          transparent: true,
          depthWrite: false,
          blending: THREE.AdditiveBlending
        })
      )
      scene.add(stars)

      composer = new EffectComposer(renderer)
      composer.addPass(new RenderPass(scene, camera))
      composer.addPass(
        new UnrealBloomPass(
          new THREE.Vector2(window.innerWidth, window.innerHeight),
          1.5,
          0.4,
          0
        )
      )

      const animate = (time) => {
        animationId = requestAnimationFrame(animate)
        const t = time * 0.001
        mesh.rotation.y = t * 0.2
        mesh.rotation.x = Math.sin(t * 0.5) * 0.2
        stars.rotation.y = -t * 0.05
        controls.update()
        composer.render()
      }

      animate(0)

      const onResize = () => {
        camera.aspect = window.innerWidth / window.innerHeight
        camera.updateProjectionMatrix()
        renderer.setSize(window.innerWidth, window.innerHeight)
        composer.setSize(window.innerWidth, window.innerHeight)
      }

      window.addEventListener('resize', onResize)

      return () => {
        cancelAnimationFrame(animationId)
        window.removeEventListener('resize', onResize)
        controls.dispose()
        renderer.dispose()
        document.body.removeChild(renderer.domElement)
      }
    } catch (err) {
      console.error('ThreeScene error:', err)
    }
  }, [])

  return null
}
