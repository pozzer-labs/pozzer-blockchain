import { useRef, useMemo, useState, useEffect } from 'react';
import { Canvas, useFrame } from '@react-three/fiber';
import { Sphere, OrbitControls } from '@react-three/drei';
import * as THREE from 'three';

interface ValidatorNode {
  id: string;
  city: string;
  country: string;
  type: 'compute' | 'storage' | 'bandwidth' | 'iot';
  devices: number;
  uptime: number;
  blocks: number;
  status: 'Active' | 'Idle';
  lat: number;
  lng: number;
}

interface GlobeProps {
  onValidatorHover?: (validator: ValidatorNode | null) => void;
}

interface P2PTransfer {
  id: string;
  from: THREE.Vector3;
  to: THREE.Vector3;
  progress: number;
  speed: number;
}

// Worker node distribution for network visualization
const generateWorkerNodes = () => {
  const workers: { lat: number; lng: number; intensity: number }[] = [];
  
  // Regional clusters with weights (more nodes in tech hubs)
  const regions = [
    // North America
    { lat: 37.7749, lng: -122.4194, spread: 8, count: 45 }, // San Francisco area
    { lat: 40.7128, lng: -74.0060, spread: 6, count: 40 }, // New York area
    { lat: 34.0522, lng: -118.2437, spread: 5, count: 30 }, // Los Angeles
    { lat: 47.6062, lng: -122.3321, spread: 4, count: 25 }, // Seattle
    { lat: 43.6532, lng: -79.3832, spread: 5, count: 20 }, // Toronto
    { lat: 45.5017, lng: -73.5673, spread: 3, count: 15 }, // Montreal
    { lat: 33.4484, lng: -112.0740, spread: 4, count: 15 }, // Phoenix
    { lat: 29.7604, lng: -95.3698, spread: 4, count: 15 }, // Houston
    
    // South America
    { lat: -23.5505, lng: -46.6333, spread: 6, count: 50 }, // São Paulo (major hub)
    { lat: -22.9068, lng: -43.1729, spread: 5, count: 35 }, // Rio de Janeiro
    { lat: -34.6037, lng: -58.3816, spread: 5, count: 25 }, // Buenos Aires
    { lat: -30.0346, lng: -51.2177, spread: 4, count: 20 }, // Porto Alegre
    { lat: -19.9167, lng: -43.9345, spread: 3, count: 15 }, // Belo Horizonte
    { lat: -15.7801, lng: -47.9292, spread: 3, count: 12 }, // Brasília
    { lat: -3.7172, lng: -38.5433, spread: 3, count: 10 }, // Fortaleza
    { lat: -12.9714, lng: -38.5014, spread: 3, count: 10 }, // Salvador
    { lat: -8.0476, lng: -34.8770, spread: 3, count: 8 }, // Recife
    { lat: 4.7110, lng: -74.0721, spread: 3, count: 10 }, // Bogotá
    { lat: -33.4489, lng: -70.6693, spread: 3, count: 12 }, // Santiago
    { lat: -12.0464, lng: -77.0428, spread: 3, count: 8 }, // Lima
    { lat: 19.4326, lng: -99.1332, spread: 4, count: 15 }, // Mexico City
    
    // Europe
    { lat: 51.5074, lng: -0.1278, spread: 5, count: 30 }, // London
    { lat: 50.1109, lng: 8.6821, spread: 4, count: 25 }, // Frankfurt
    { lat: 52.5200, lng: 13.4050, spread: 4, count: 22 }, // Berlin
    { lat: 48.8566, lng: 2.3522, spread: 4, count: 25 }, // Paris
    { lat: 52.3676, lng: 4.9041, spread: 3, count: 18 }, // Amsterdam
    { lat: 55.7558, lng: 37.6173, spread: 5, count: 15 }, // Moscow
    { lat: 41.3851, lng: 2.1734, spread: 3, count: 12 }, // Barcelona
    { lat: 45.4642, lng: 9.1900, spread: 3, count: 12 }, // Milan
    { lat: 59.3293, lng: 18.0686, spread: 3, count: 10 }, // Stockholm
    { lat: 50.0755, lng: 14.4378, spread: 3, count: 8 }, // Prague
    
    // Asia
    { lat: 35.6762, lng: 139.6503, spread: 5, count: 35 }, // Tokyo
    { lat: 1.3521, lng: 103.8198, spread: 4, count: 30 }, // Singapore
    { lat: 22.3193, lng: 114.1694, spread: 4, count: 25 }, // Hong Kong
    { lat: 37.5665, lng: 126.9780, spread: 4, count: 28 }, // Seoul
    { lat: 31.2304, lng: 121.4737, spread: 5, count: 20 }, // Shanghai
    { lat: 39.9042, lng: 116.4074, spread: 5, count: 18 }, // Beijing
    { lat: 19.0760, lng: 72.8777, spread: 5, count: 22 }, // Mumbai
    { lat: 12.9716, lng: 77.5946, spread: 4, count: 20 }, // Bangalore
    { lat: 25.2048, lng: 55.2708, spread: 3, count: 12 }, // Dubai
    { lat: 13.7563, lng: 100.5018, spread: 3, count: 10 }, // Bangkok
    { lat: 14.5995, lng: 120.9842, spread: 3, count: 8 }, // Manila
    { lat: -6.2088, lng: 106.8456, spread: 4, count: 10 }, // Jakarta
    { lat: 3.1390, lng: 101.6869, spread: 3, count: 8 }, // Kuala Lumpur
    
    // Oceania
    { lat: -33.8688, lng: 151.2093, spread: 4, count: 18 }, // Sydney
    { lat: -37.8136, lng: 144.9631, spread: 3, count: 12 }, // Melbourne
    { lat: -36.8485, lng: 174.7633, spread: 3, count: 8 }, // Auckland
    
    // Africa
    { lat: -33.9249, lng: 18.4241, spread: 3, count: 8 }, // Cape Town
    { lat: -26.2041, lng: 28.0473, spread: 3, count: 6 }, // Johannesburg
    { lat: 6.5244, lng: 3.3792, spread: 3, count: 6 }, // Lagos
    { lat: 30.0444, lng: 31.2357, spread: 3, count: 5 }, // Cairo
  ];
  
  regions.forEach(region => {
    for (let i = 0; i < region.count; i++) {
      const lat = region.lat + (Math.random() - 0.5) * region.spread * 2;
      const lng = region.lng + (Math.random() - 0.5) * region.spread * 2;
      const intensity = 0.3 + Math.random() * 0.7; // Varying brightness
      workers.push({ lat, lng, intensity });
    }
  });
  
  return workers;
};

const WORKER_NODES = generateWorkerNodes();

// Validator network topology (testnet simulation)
const VALIDATOR_NODES: ValidatorNode[] = [
  {
    id: 'BR-SP-001',
    city: 'São Paulo',
    country: 'BR',
    type: 'compute',
    devices: 58,
    uptime: 99.92,
    blocks: 847,
    status: 'Active',
    lat: -23.5505,
    lng: -46.6333,
  },
  {
    id: 'BR-RJ-001',
    city: 'Rio de Janeiro',
    country: 'BR',
    type: 'storage',
    devices: 52,
    uptime: 99.88,
    blocks: 823,
    status: 'Active',
    lat: -22.9068,
    lng: -43.1729,
  },
  {
    id: 'AR-BA-001',
    city: 'Buenos Aires',
    country: 'AR',
    type: 'bandwidth',
    devices: 46,
    uptime: 99.85,
    blocks: 612,
    status: 'Active',
    lat: -34.6037,
    lng: -58.3816,
  },
  {
    id: 'BR-PA-001',
    city: 'Porto Alegre',
    country: 'BR',
    type: 'iot',
    devices: 55,
    uptime: 99.9,
    blocks: 734,
    status: 'Active',
    lat: -30.0346,
    lng: -51.2177,
  },
  {
    id: 'US-NY-001',
    city: 'New York',
    country: 'US',
    type: 'compute',
    devices: 49,
    uptime: 99.82,
    blocks: 558,
    status: 'Active',
    lat: 40.7128,
    lng: -74.0060,
  },
  {
    id: 'DE-FR-001',
    city: 'Frankfurt',
    country: 'DE',
    type: 'storage',
    devices: 41,
    uptime: 99.71,
    blocks: 412,
    status: 'Idle',
    lat: 50.1109,
    lng: 8.6821,
  },
  {
    id: 'SG-SG-001',
    city: 'Singapore',
    country: 'SG',
    type: 'bandwidth',
    devices: 38,
    uptime: 99.78,
    blocks: 489,
    status: 'Active',
    lat: 1.3521,
    lng: 103.8198,
  },
  {
    id: 'JP-TK-001',
    city: 'Tokyo',
    country: 'JP',
    type: 'compute',
    devices: 44,
    uptime: 99.86,
    blocks: 631,
    status: 'Active',
    lat: 35.6762,
    lng: 139.6503,
  },
];

function ValidatorMarker({ 
  validator, 
  position, 
  onHover 
}: { 
  validator: ValidatorNode; 
  position: THREE.Vector3; 
  onHover: (v: ValidatorNode | null) => void;
}) {
  const meshRef = useRef<THREE.Mesh>(null);
  const [hovered, setHovered] = useState(false);

  useFrame(() => {
    if (meshRef.current) {
      // Pulsing animation
      const scale = 1 + Math.sin(Date.now() * 0.003) * 0.2;
      meshRef.current.scale.setScalar(hovered ? scale * 1.3 : scale);
    }
  });

  const color = validator.status === 'Active' ? '#a855f7' : '#888888'; // Violet for validators

  return (
    <group position={position}>
      {/* Main marker - larger for validators */}
      <mesh
        ref={meshRef}
        onPointerOver={() => {
          setHovered(true);
          onHover(validator);
        }}
        onPointerOut={() => {
          setHovered(false);
          onHover(null);
        }}
      >
        <sphereGeometry args={[0.05, 16, 16]} />
        <meshBasicMaterial color={color} transparent opacity={1} />
      </mesh>
      
      {/* Inner glow */}
      <mesh>
        <sphereGeometry args={[0.09, 16, 16]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={hovered ? 0.6 : 0.4}
          blending={THREE.AdditiveBlending}
        />
      </mesh>
      
      {/* Outer glow */}
      <mesh>
        <sphereGeometry args={[0.14, 16, 16]} />
        <meshBasicMaterial
          color="#c084fc"
          transparent
          opacity={hovered ? 0.3 : 0.15}
          blending={THREE.AdditiveBlending}
        />
      </mesh>

      {/* Vertical beam */}
      <mesh position={[0, -1, 0]}>
        <cylinderGeometry args={[0.003, 0.003, 2, 8]} />
        <meshBasicMaterial
          color={color}
          transparent
          opacity={0.5}
        />
      </mesh>
    </group>
  );
}

function GlobeCore({ onValidatorHover }: GlobeProps) {
  const globeRef = useRef<THREE.Mesh>(null);
  const rotatingGroupRef = useRef<THREE.Group>(null);
  const ringsRef = useRef<THREE.Group>(null);
  const [transfers, setTransfers] = useState<P2PTransfer[]>([]);

  // Convert lat/lng to 3D coordinates
  const latLngToVector3 = (lat: number, lng: number, radius: number) => {
    const phi = (90 - lat) * (Math.PI / 180);
    const theta = (lng + 180) * (Math.PI / 180);
    const x = -(radius * Math.sin(phi) * Math.cos(theta));
    const y = radius * Math.cos(phi);
    const z = radius * Math.sin(phi) * Math.sin(theta);
    return new THREE.Vector3(x, y, z);
  };

  // Calculate validator positions
  const validatorPositions = useMemo(() => {
    return VALIDATOR_NODES.map(v => ({
      validator: v,
      position: latLngToVector3(v.lat, v.lng, 2.05),
    }));
  }, []);

  // Create connection lines
  const connectionLines = useMemo(() => {
    const lines: THREE.Vector3[][] = [];
    const activeNodes = VALIDATOR_NODES.filter(v => v.status === 'Active');
    
    // Create connections between active nodes
    for (let i = 0; i < Math.min(activeNodes.length, 6); i++) {
      const start = activeNodes[i];
      const end = activeNodes[(i + 2) % activeNodes.length];
      
      const startPos = latLngToVector3(start.lat, start.lng, 2.05);
      const endPos = latLngToVector3(end.lat, end.lng, 2.05);
      
      lines.push([startPos, endPos]);
    }
    
    return lines;
  }, []);

  // Generate P2P transfers
  useEffect(() => {
    const interval = setInterval(() => {
      const activeNodes = VALIDATOR_NODES.filter(v => v.status === 'Active');
      if (activeNodes.length < 2) return;
      
      const fromIdx = Math.floor(Math.random() * activeNodes.length);
      let toIdx = Math.floor(Math.random() * activeNodes.length);
      while (toIdx === fromIdx) {
        toIdx = Math.floor(Math.random() * activeNodes.length);
      }
      
      const from = latLngToVector3(activeNodes[fromIdx].lat, activeNodes[fromIdx].lng, 2.05);
      const to = latLngToVector3(activeNodes[toIdx].lat, activeNodes[toIdx].lng, 2.05);
      
      const newTransfer: P2PTransfer = {
        id: `${Date.now()}-${Math.random()}`,
        from,
        to,
        progress: 0,
        speed: 0.005 + Math.random() * 0.01,
      };
      
      setTransfers((prev) => [...prev.slice(-6), newTransfer]);
    }, 2000);
    
    return () => clearInterval(interval);
  }, []);

  // Animation loop
  useFrame(() => {
    if (rotatingGroupRef.current) {
      rotatingGroupRef.current.rotation.y += 0.003;
    }
    if (ringsRef.current) {
      ringsRef.current.rotation.y += 0.003;
    }
    
    setTransfers((prev) =>
      prev
        .map((t) => ({ ...t, progress: t.progress + t.speed }))
        .filter((t) => t.progress < 1)
    );
  });

  return (
    <group>
      {/* Rotating group - globe + nodes rotate together */}
      <group ref={rotatingGroupRef}>
        {/* Main Globe with world map shader */}
        <Sphere ref={globeRef} args={[2, 128, 128]}>
        <shaderMaterial
          transparent
          vertexShader={`
            varying vec2 vUv;
            varying vec3 vNormal;
            void main() {
              vUv = uv;
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec2 vUv;
            varying vec3 vNormal;
            
            float hash(vec2 p) {
              return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453);
            }
            
            float noise(vec2 p) {
              vec2 i = floor(p);
              vec2 f = fract(p);
              f = f * f * (3.0 - 2.0 * f);
              
              float a = hash(i);
              float b = hash(i + vec2(1.0, 0.0));
              float c = hash(i + vec2(0.0, 1.0));
              float d = hash(i + vec2(1.0, 1.0));
              
              return mix(mix(a, b, f.x), mix(c, d, f.x), f.y);
            }
            
            void main() {
              float scale = 8.0;
              float n1 = noise(vUv * scale);
              float n2 = noise(vUv * scale * 2.0 + vec2(50.0));
              float pattern = n1 * 0.6 + n2 * 0.4;
              
              float threshold = 0.45;
              bool isLand = pattern > threshold;
              
              vec3 oceanColor = vec3(0.02, 0.15, 0.25);
              vec3 landColor = vec3(0.05, 0.35, 0.4);
              
              vec3 baseColor = isLand ? landColor : oceanColor;
              
              float latLine = abs(fract(vUv.y * 20.0) - 0.5);
              float lngLine = abs(fract(vUv.x * 40.0) - 0.5);
              float gridPattern = smoothstep(0.48, 0.5, latLine) + smoothstep(0.48, 0.5, lngLine);
              
              float fresnel = pow(1.0 - abs(dot(vNormal, vec3(0.0, 0.0, 1.0))), 3.0);
              
              vec3 finalColor = baseColor;
              finalColor += vec3(0.0, 0.5, 0.6) * gridPattern * 0.15;
              finalColor += vec3(0.0, 0.8, 1.0) * fresnel * 0.3;
              
              float alpha = 0.85 + fresnel * 0.15;
              
              gl_FragColor = vec4(finalColor, alpha);
            }
          `}
        />
      </Sphere>

      {/* Atmosphere glow */}
      <Sphere args={[2.15, 64, 64]}>
        <shaderMaterial
          transparent
          side={THREE.BackSide}
          vertexShader={`
            varying vec3 vNormal;
            void main() {
              vNormal = normalize(normalMatrix * normal);
              gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
            }
          `}
          fragmentShader={`
            varying vec3 vNormal;
            void main() {
              float intensity = pow(0.7 - dot(vNormal, vec3(0.0, 0.0, 1.0)), 2.0);
              gl_FragColor = vec4(0.0, 0.8, 1.0, intensity * 0.4);
            }
          `}
        />
      </Sphere>

      {/* Worker nodes (500 distributed nodes with glow effect) */}
      {WORKER_NODES.map((worker, index) => {
        const pos = latLngToVector3(worker.lat, worker.lng, 2.03);
        return (
          <group key={`worker-${index}`} position={pos}>
            {/* Core node */}
            <mesh>
              <sphereGeometry args={[0.025, 12, 12]} />
              <meshBasicMaterial 
                color="#34d399" 
                transparent 
                opacity={0.85 + worker.intensity * 0.15} 
              />
            </mesh>
            {/* Glow effect */}
            <mesh>
              <sphereGeometry args={[0.045, 12, 12]} />
              <meshBasicMaterial 
                color="#10b981" 
                transparent 
                opacity={0.25 + worker.intensity * 0.15} 
              />
            </mesh>
          </group>
        );
      })}

      {/* Validator markers (top 67 - highlighted) */}
      {validatorPositions.map(({ validator, position }) => (
        <ValidatorMarker
          key={validator.id}
          validator={validator}
          position={position}
          onHover={onValidatorHover || (() => {})}
        />
      ))}
      </group>

      {/* P2P Transfer particles */}
      {transfers.map((transfer) => {
        const t = transfer.progress;
        
        const midPoint = new THREE.Vector3().lerpVectors(transfer.from, transfer.to, 0.5);
        const altitude = 0.6;
        const offset = midPoint.clone().normalize().multiplyScalar(altitude);
        midPoint.add(offset);
        
        const currentPos = new THREE.Vector3();
        currentPos.lerpVectors(transfer.from, midPoint, Math.min(t * 2, 1));
        if (t > 0.5) {
          const t2 = (t - 0.5) * 2;
          currentPos.lerpVectors(midPoint, transfer.to, t2);
        }
        
        return (
          <group key={transfer.id}>
            <mesh position={currentPos}>
              <sphereGeometry args={[0.03, 8, 8]} />
              <meshBasicMaterial color="#00ffff" transparent opacity={1 - t * 0.3} />
            </mesh>
            
            <mesh position={currentPos}>
              <sphereGeometry args={[0.08, 8, 8]} />
              <meshBasicMaterial
                color="#00ffff"
                transparent
                opacity={(1 - t) * 0.3}
                blending={THREE.AdditiveBlending}
              />
            </mesh>
          </group>
        );
      })}

      {/* Connection lines */}
      <group ref={ringsRef}>
        {connectionLines.map((line, index) => {
          const points = [];
          const segments = 50;
          
          for (let i = 0; i <= segments; i++) {
            const t = i / segments;
            const point = new THREE.Vector3().lerpVectors(line[0], line[1], t);
            
            const mid = new THREE.Vector3().lerpVectors(line[0], line[1], 0.5);
            const altitude = 0.5;
            const offset = mid.clone().normalize().multiplyScalar(altitude * Math.sin(t * Math.PI));
            point.add(offset);
            
            points.push(point);
          }
          
          const curve = new THREE.CatmullRomCurve3(points);
          const curvePoints = curve.getPoints(50);
          const geometry = new THREE.BufferGeometry().setFromPoints(curvePoints);
          
          return (
            <primitive
              key={index}
              object={new THREE.Line(
                geometry,
                new THREE.LineBasicMaterial({
                  color: '#00ffff',
                  transparent: true,
                  opacity: 0.2,
                  blending: THREE.AdditiveBlending,
                })
              )}
            />
          );
        })}
      </group>

      {/* Orbital rings */}
      <mesh rotation={[Math.PI / 2, 0, 0]}>
        <torusGeometry args={[2.5, 0.005, 16, 100]} />
        <meshBasicMaterial color="#00ffff" transparent opacity={0.25} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 3]}>
        <torusGeometry args={[2.6, 0.005, 16, 100]} />
        <meshBasicMaterial color="#0099ff" transparent opacity={0.2} />
      </mesh>
      <mesh rotation={[Math.PI / 2, 0, Math.PI / 6]}>
        <torusGeometry args={[2.7, 0.005, 16, 100]} />
        <meshBasicMaterial color="#00ccff" transparent opacity={0.15} />
      </mesh>

      {/* Lighting */}
      <ambientLight intensity={0.6} />
      <pointLight position={[10, 10, 10]} intensity={1.2} color="#00ffff" />
      <pointLight position={[-10, -10, -10]} intensity={0.6} color="#0066ff" />
    </group>
  );
}

export default function Globe3D() {
  const [hoveredValidator, setHoveredValidator] = useState<ValidatorNode | null>(null);
  const [tooltipPosition, setTooltipPosition] = useState({ x: 0, y: 0 });

  const handleMouseMove = (e: React.MouseEvent) => {
    setTooltipPosition({ x: e.clientX, y: e.clientY });
  };

  return (
    <div className="w-full h-[350px] sm:h-[450px] md:h-[500px] lg:h-[600px] relative" onMouseMove={handleMouseMove}>
      <Canvas
        camera={{ position: [0, 0, 6], fov: 45 }}
        gl={{ alpha: true, antialias: true }}
      >
        <GlobeCore onValidatorHover={setHoveredValidator} />
        <OrbitControls
          enableZoom={false}
          enablePan={false}
          autoRotate={false}
          minPolarAngle={Math.PI / 4}
          maxPolarAngle={Math.PI - Math.PI / 4}
        />
      </Canvas>
      
      {/* Glow effect overlay */}
      <div className="absolute inset-0 pointer-events-none">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-cyan-500/20 rounded-full blur-[120px]" />
      </div>

      {/* Tooltip */}
      {hoveredValidator && (
        <div
          className="fixed z-50 pointer-events-none"
          style={{
            left: tooltipPosition.x + 20,
            top: tooltipPosition.y + 20,
          }}
        >
          <div className="bg-background/95 backdrop-blur-sm border border-purple-500/30 rounded-lg p-4 shadow-xl min-w-[250px]">
            <div className="flex items-center justify-between mb-3">
              <div className="font-mono text-sm text-purple-400">{hoveredValidator.id}</div>
              <div className={`text-xs px-2 py-1 rounded ${
                hoveredValidator.status === 'Active' 
                  ? 'bg-green-500/20 text-green-400' 
                  : 'bg-gray-500/20 text-gray-400'
              }`}>
                {hoveredValidator.status}
              </div>
            </div>
            
            <div className="text-lg font-semibold mb-2">
              {hoveredValidator.city}, {hoveredValidator.country}
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex items-center gap-2">
                <span className="text-purple-400 capitalize">{hoveredValidator.type}</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">{hoveredValidator.devices} devices</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">{hoveredValidator.uptime}% uptime</span>
              </div>
              
              <div className="flex items-center gap-2">
                <span className="text-muted-foreground">•</span>
                <span className="text-foreground">{hoveredValidator.blocks} blocks</span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
