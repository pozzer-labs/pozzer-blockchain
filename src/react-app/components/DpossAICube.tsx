import { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';

interface DpossAICubeProps {
  onClick?: () => void;
  hasNotification?: boolean;
  size?: number;
}

export default function DpossAICube({ onClick, hasNotification, size = 80 }: DpossAICubeProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    cube: THREE.Group;
    particles: THREE.Points;
    targetRotation: { x: number; y: number };
    animationId: number;
  } | null>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const container = containerRef.current;
    const width = size;
    const height = size;

    // Scene setup
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(45, width / height, 0.1, 100);
    camera.position.z = 4;

    const renderer = new THREE.WebGLRenderer({ 
      antialias: true, 
      alpha: true,
      powerPreference: 'low-power'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);
    container.appendChild(renderer.domElement);

    // Create cube group
    const cubeGroup = new THREE.Group();

    // Main cube - wireframe
    const cubeGeometry = new THREE.BoxGeometry(1.2, 1.2, 1.2);
    const wireframeMaterial = new THREE.LineBasicMaterial({ 
      color: 0x10b981,
      transparent: true,
      opacity: 0.9
    });
    const wireframe = new THREE.LineSegments(
      new THREE.EdgesGeometry(cubeGeometry),
      wireframeMaterial
    );
    cubeGroup.add(wireframe);

    // Inner cube - solid with low opacity
    const innerGeometry = new THREE.BoxGeometry(1.15, 1.15, 1.15);
    const innerMaterial = new THREE.MeshBasicMaterial({
      color: 0x10b981,
      transparent: true,
      opacity: 0.08,
      side: THREE.BackSide
    });
    const innerCube = new THREE.Mesh(innerGeometry, innerMaterial);
    cubeGroup.add(innerCube);

    // Grid lines on faces
    const gridMaterial = new THREE.LineBasicMaterial({ 
      color: 0x10b981, 
      transparent: true, 
      opacity: 0.3 
    });

    // Create grid pattern for each face
    const createFaceGrid = (axis: 'x' | 'y' | 'z', position: number) => {
      const gridGroup = new THREE.Group();
      const size = 1.2;
      const divisions = 3;
      const step = size / divisions;
      const half = size / 2;

      for (let i = 1; i < divisions; i++) {
        const offset = -half + step * i;
        const points1: THREE.Vector3[] = [];
        const points2: THREE.Vector3[] = [];

        if (axis === 'z') {
          points1.push(new THREE.Vector3(-half, offset, position));
          points1.push(new THREE.Vector3(half, offset, position));
          points2.push(new THREE.Vector3(offset, -half, position));
          points2.push(new THREE.Vector3(offset, half, position));
        } else if (axis === 'x') {
          points1.push(new THREE.Vector3(position, -half, offset));
          points1.push(new THREE.Vector3(position, half, offset));
          points2.push(new THREE.Vector3(position, offset, -half));
          points2.push(new THREE.Vector3(position, offset, half));
        } else {
          points1.push(new THREE.Vector3(-half, position, offset));
          points1.push(new THREE.Vector3(half, position, offset));
          points2.push(new THREE.Vector3(offset, position, -half));
          points2.push(new THREE.Vector3(offset, position, half));
        }

        const line1 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points1),
          gridMaterial
        );
        const line2 = new THREE.Line(
          new THREE.BufferGeometry().setFromPoints(points2),
          gridMaterial
        );
        gridGroup.add(line1, line2);
      }
      return gridGroup;
    };

    cubeGroup.add(createFaceGrid('z', 0.6));
    cubeGroup.add(createFaceGrid('z', -0.6));
    cubeGroup.add(createFaceGrid('x', 0.6));
    cubeGroup.add(createFaceGrid('x', -0.6));
    cubeGroup.add(createFaceGrid('y', 0.6));
    cubeGroup.add(createFaceGrid('y', -0.6));

    // Corner points (glowing dots)
    const cornerPositions: number[] = [];
    const cornerSize = 0.62;
    for (let x = -1; x <= 1; x += 2) {
      for (let y = -1; y <= 1; y += 2) {
        for (let z = -1; z <= 1; z += 2) {
          cornerPositions.push(x * cornerSize, y * cornerSize, z * cornerSize);
        }
      }
    }
    const cornerGeometry = new THREE.BufferGeometry();
    cornerGeometry.setAttribute('position', new THREE.Float32BufferAttribute(cornerPositions, 3));
    const cornerMaterial = new THREE.PointsMaterial({
      color: 0x34d399,
      size: 0.08,
      transparent: true,
      opacity: 1,
      sizeAttenuation: true
    });
    const cornerPoints = new THREE.Points(cornerGeometry, cornerMaterial);
    cubeGroup.add(cornerPoints);

    scene.add(cubeGroup);

    // Floating particles around the cube
    const particleCount = 20;
    const particlePositions = new Float32Array(particleCount * 3);
    for (let i = 0; i < particleCount; i++) {
      const angle = (i / particleCount) * Math.PI * 2;
      const radius = 1.5 + Math.random() * 0.5;
      particlePositions[i * 3] = Math.cos(angle) * radius;
      particlePositions[i * 3 + 1] = (Math.random() - 0.5) * 2;
      particlePositions[i * 3 + 2] = Math.sin(angle) * radius;
    }
    const particleGeometry = new THREE.BufferGeometry();
    particleGeometry.setAttribute('position', new THREE.Float32BufferAttribute(particlePositions, 3));
    const particleMaterial = new THREE.PointsMaterial({
      color: 0x10b981,
      size: 0.04,
      transparent: true,
      opacity: 0.6,
      sizeAttenuation: true
    });
    const particles = new THREE.Points(particleGeometry, particleMaterial);
    scene.add(particles);

    // Initial rotation
    cubeGroup.rotation.x = 0.4;
    cubeGroup.rotation.y = 0.4;

    const targetRotation = { x: 0.4, y: 0.4 };

    // Animation loop
    let time = 0;
    const animate = () => {
      const animationId = requestAnimationFrame(animate);
      sceneRef.current!.animationId = animationId;
      
      time += 0.01;

      // Smooth rotation towards target
      cubeGroup.rotation.x += (targetRotation.x - cubeGroup.rotation.x) * 0.08;
      cubeGroup.rotation.y += (targetRotation.y - cubeGroup.rotation.y) * 0.08;

      // Gentle idle animation
      cubeGroup.rotation.z = Math.sin(time) * 0.05;

      // Rotate particles
      particles.rotation.y += 0.003;

      // Pulse effect on wireframe
      wireframeMaterial.opacity = 0.7 + Math.sin(time * 2) * 0.2;

      renderer.render(scene, camera);
    };

    sceneRef.current = {
      scene,
      camera,
      renderer,
      cube: cubeGroup,
      particles,
      targetRotation,
      animationId: 0
    };

    animate();

    // Mouse move handler - global tracking
    const handleMouseMove = (e: MouseEvent) => {
      if (!sceneRef.current) return;
      
      // Calculate mouse position relative to viewport center
      const centerX = window.innerWidth / 2;
      const centerY = window.innerHeight / 2;
      const deltaX = (e.clientX - centerX) / centerX;
      const deltaY = (e.clientY - centerY) / centerY;

      // Update target rotation based on mouse position
      sceneRef.current.targetRotation.x = 0.4 + deltaY * 0.5;
      sceneRef.current.targetRotation.y = 0.4 + deltaX * 0.5;
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      if (sceneRef.current) {
        cancelAnimationFrame(sceneRef.current.animationId);
        sceneRef.current.renderer.dispose();
      }
      if (container.contains(renderer.domElement)) {
        container.removeChild(renderer.domElement);
      }
    };
  }, [size]);

  return (
    <button
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={`relative transition-all duration-300 flex items-center justify-center ${
        isHovered 
          ? 'scale-105' 
          : ''
      }`}
      style={{ width: `${size}px`, height: `${size}px` }}
    >
      {/* Notification badge */}
      {hasNotification && (
        <div className="absolute -top-1.5 -right-1.5 w-5 h-5 rounded-full bg-red-500 border-2 border-background flex items-center justify-center text-[10px] font-bold text-white z-10">
          1
        </div>
      )}
      
      {/* 3D Canvas */}
      <div 
        ref={containerRef} 
        className="pointer-events-none"
        style={{ width: `${size}px`, height: `${size}px` }}
      />
      

    </button>
  );
}
