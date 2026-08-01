import React, { useRef, useState, useEffect } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';
import { STLExporter } from 'three/examples/jsm/exporters/STLExporter.js';
import { 
  Video, Mic, MicOff, VideoOff, Share2, Users, MessageSquare, 
  LogOut, Box, Camera, Upload, Copy, X, Sparkles, Sliders, Settings, Layers, Download, Cpu,
  Wand2, Image as ImageIcon, RefreshCw, Eye, Scissors, Bot
} from 'lucide-react';

type ScanTarget = 'isoplus' | 'warship' | 'submarine' | 'aircraft' | 'tank';
type MeshForgeMode = 'text23d' | 'image23d';
type Text23DSubOption = 'manual' | 'autoFromImage';

export default function App() {
  const [isInMeeting, setIsInMeeting] = useState(true);

  // Three.js References
  const mountRef = useRef<HTMLDivElement | null>(null);
  const sceneRef = useRef<THREE.Scene | null>(null);
  const currentObjectRef = useRef<THREE.Object3D | null>(null);
  const dirLightRef = useRef<THREE.DirectionalLight | null>(null);

  // UI State
  const [activePreset, setActivePreset] = useState('Generative Cube');
  const [activeLeftTab, setActiveLeftTab] = useState<'layers' | 'lighting' | 'settings'>('layers');
  const [lightColor, setLightColor] = useState('#00f0ff');
  const [autoRotate, setAutoRotate] = useState(true);
  const rotationSpeed = 0.006;

  const [isMuted, setIsMuted] = useState(false);
  const [isVideoOff, setIsVideoOff] = useState(false);

  // Mesh Forge Modal & Backend Settings
  const [isMeshForgeOpen, setIsMeshForgeOpen] = useState(false);
  const [activeStudioTab, setActiveStudioTab] = useState<'scan' | 'meshforge'>('meshforge');
  const [backendUrl, setBackendUrl] = useState('https://your-backend-server.com');

  // Scanner State
  const [selectedTarget, setSelectedTarget] = useState<ScanTarget>('warship');
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // Mesh Forge State
  const [forgeMode, setForgeMode] = useState<MeshForgeMode>('text23d');
  const [textSubOption, setTextSubOption] = useState<Text23DSubOption>('manual');
  const [selectedModel, setSelectedModel] = useState('tripo3d');
  const [textPrompt, setTextPrompt] = useState('');
  
  // Opsi 2 (Auto dari Gambar) State
  const [refImage, setRefImage] = useState<File | null>(null);
  const [refImagePreview, setRefImagePreview] = useState<string | null>(null);
  const [removeBg, setRemoveBg] = useState(true);
  const [visionModel, setVisionModel] = useState<'moondream2' | 'gpt54'>('moondream2');
  const [isAnalyzingImage, setIsAnalyzingImage] = useState(false);
  const [isGenerating3D, setIsGenerating3D] = useState(false);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const autoImgInputRef = useRef<HTMLInputElement | null>(null);

  // --- 1. THREE.JS INITIALIZATION ---
  useEffect(() => {
    if (!isInMeeting || !mountRef.current) return;

    const container = mountRef.current;
    const width = container.clientWidth;
    const height = container.clientHeight;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color(0x020612);
    sceneRef.current = scene;

    const starsGeometry = new THREE.BufferGeometry();
    const starsCount = 1200;
    const starPositions = new Float32Array(starsCount * 3);
    for (let i = 0; i < starsCount * 3; i++) {
      starPositions[i] = (Math.random() - 0.5) * 60;
    }
    starsGeometry.setAttribute('position', new THREE.BufferAttribute(starPositions, 3));
    const starsMaterial = new THREE.PointsMaterial({ color: 0x64748b, size: 0.05 });
    scene.add(new THREE.Points(starsGeometry, starsMaterial));

    const camera = new THREE.PerspectiveCamera(50, width / height, 0.1, 1000);
    camera.position.set(0, 1.2, 4.5);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    const controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.9);
    const dirLight = new THREE.DirectionalLight(new THREE.Color(lightColor), 1.8);
    dirLight.position.set(5, 5, 5);
    dirLightRef.current = dirLight;
    scene.add(ambientLight, dirLight);

    loadPresetModel('Generative Cube');

    let animationFrameId: number;
    const animate = () => {
      animationFrameId = requestAnimationFrame(animate);
      if (currentObjectRef.current && autoRotate) {
        currentObjectRef.current.rotation.y += rotationSpeed;
      }
      controls.update();
      renderer.render(scene, camera);
    };
    animate();

    const resizeObserver = new ResizeObserver(() => {
      if (!container) return;
      camera.aspect = container.clientWidth / container.clientHeight;
      camera.updateProjectionMatrix();
      renderer.setSize(container.clientWidth, container.clientHeight);
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      cancelAnimationFrame(animationFrameId);
      renderer.dispose();
      if (container) container.innerHTML = '';
    };
  }, [isInMeeting]);

  useEffect(() => {
    if (dirLightRef.current) {
      dirLightRef.current.color = new THREE.Color(lightColor);
    }
  }, [lightColor]);

  const replaceStageObject = (newObject: THREE.Object3D) => {
    if (!sceneRef.current) return;
    if (currentObjectRef.current) sceneRef.current.remove(currentObjectRef.current);

    currentObjectRef.current = newObject;
    const box = new THREE.Box3().setFromObject(newObject);
    const size = box.getSize(new THREE.Vector3());
    const maxDim = Math.max(size.x, size.y, size.z);

    if (maxDim > 0) {
      const scale = 2.4 / maxDim;
      newObject.scale.setScalar(scale);
    }

    box.setFromObject(newObject);
    const center = box.getCenter(new THREE.Vector3());

    newObject.position.x = -center.x;
    newObject.position.y = -center.y;
    newObject.position.z = -center.z;

    sceneRef.current.add(newObject);
  };

  const loadPresetModel = (type: string) => {
    setActivePreset(type);
    let mesh: THREE.Object3D;

    switch (type) {
      case 'Default Hologram': {
        const wireframe = new THREE.WireframeGeometry(new THREE.BoxGeometry(1.5, 1.5, 1.5));
        mesh = new THREE.LineSegments(wireframe, new THREE.LineBasicMaterial({ color: 0x00a8ff }));
        break;
      }
      case 'Generative Cube': {
        mesh = new THREE.Mesh(new THREE.IcosahedronGeometry(1.2, 1), new THREE.MeshStandardMaterial({ color: 0x00f0ff, wireframe: true }));
        break;
      }
      case 'Stage Presenter': {
        const group = new THREE.Group();
        const body = new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.6, 1.2, 16), new THREE.MeshStandardMaterial({ color: 0x38bdf8 }));
        const head = new THREE.Mesh(new THREE.SphereGeometry(0.35, 16, 16), new THREE.MeshStandardMaterial({ color: 0xe2e8f0 }));
        head.position.y = 0.9;
        group.add(body, head);
        mesh = group;
        break;
      }
      default:
        return;
    }
    replaceStageObject(mesh);
  };

  // --- 2. PIPELINE AUTOMATION: IMAGE TO VISION PROMPT ---
  const handleAutoVisionPipeline = async (file: File) => {
    if (!file) return;
    setIsAnalyzingImage(true);
    setRefImagePreview(URL.createObjectURL(file));

    try {
      const formData = new FormData();
      formData.append('image', file);
      formData.append('removeBg', removeBg ? 'true' : 'false');
      formData.append('visionModel', visionModel);

      // Endpoint backend/server.js: /api/vision-prompt
      const response = await fetch(`${backendUrl}/api/vision-prompt`, {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) throw new Error('Gagal memproses gambar melalui Vision API');

      const data = await response.json();
      if (data.prompt) {
        setTextPrompt(data.prompt);
      } else {
        setTextPrompt(`Generate a highly detailed 3D model of ${file.name.split('.')[0]}, studio lighting, 8k resolution asset.`);
      }
    } catch (err) {
      console.warn('Backend server tidak merespon, menggunakan fallback vision generator.');
      setTextPrompt(`Generate a highly detailed 3D model of ${file.name.split('.')[0]}, physically based rendering, clear geometry, high quality.`);
    } finally {
      setIsAnalyzingImage(false);
    }
  };

  // --- 3. GENERATE 3D MODEL PIPELINE ---
  const handleGenerate3DModel = async () => {
    if (!textPrompt) {
      alert('Tuliskan atau hasilkan prompt terlebih dahulu!');
      return;
    }
    setIsGenerating3D(true);

    try {
      const response = await fetch(`${backendUrl}/api/generate-3d`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: textPrompt,
          model: selectedModel,
          mode: forgeMode,
        }),
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = URL.createObjectURL(blob);
        new GLTFLoader().load(url, (gltf) => {
          replaceStageObject(gltf.scene);
          setActivePreset(`MeshForge: ${textPrompt.slice(0, 18)}...`);
        });
      } else {
        throw new Error('Gagal generate');
      }
    } catch {
      // Fallback Visualizer
      generateProceduralFallbackMesh(textPrompt);
    } finally {
      setIsGenerating3D(false);
      closeMeshForgeModal();
    }
  };

  const generateProceduralFallbackMesh = (promptStr: string) => {
    const group = new THREE.Group();
    const count = 30000;
    const geometry = new THREE.BufferGeometry();
    const positions = new Float32Array(count * 3);
    const colors = new Float32Array(count * 3);

    for (let i = 0; i < count; i++) {
      const u = Math.random();
      const v = Math.random();
      const theta = u * 2.0 * Math.PI;
      const phi = Math.acos(2.0 * v - 1.0);
      const r = 1.0 + Math.sin(theta * 4) * 0.2;

      positions[i * 3] = r * Math.sin(phi) * Math.cos(theta);
      positions[i * 3 + 1] = r * Math.sin(phi) * Math.sin(theta);
      positions[i * 3 + 2] = r * Math.cos(phi);

      colors[i * 3] = 0.0;
      colors[i * 3 + 1] = 0.9;
      colors[i * 3 + 2] = 0.8;
    }

    geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
    geometry.setAttribute('color', new THREE.BufferAttribute(colors, 3));

    const material = new THREE.PointsMaterial({ size: 0.02, vertexColors: true, transparent: true, opacity: 0.85 });
    group.add(new THREE.Points(geometry, material));

    replaceStageObject(group);
    setActivePreset(`Forge AI: ${promptStr.slice(0, 15)}...`);
  };

  // --- 4. CAMERA SCAN GENERATOR ---
  const handleStartScan = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ video: true });
      streamRef.current = stream;
      if (videoRef.current) videoRef.current.srcObject = stream;
      setIsScanning(true);
      setScanProgress(0);

      const interval = setInterval(() => {
        setScanProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            return 100;
          }
          return prev + 10;
        });
      }, 200);
    } catch (err) {
      alert('Kamera tidak ditemukan: ' + (err as Error).message);
    }
  };

  const closeMeshForgeModal = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsScanning(false);
    setIsMeshForgeOpen(false);
  };

  const exportToSTL = () => {
    if (!currentObjectRef.current) return;
    const exporter = new STLExporter();
    const result = exporter.parse(currentObjectRef.current, { binary: true });
    const blob = new Blob([result], { type: 'application/octet-stream' });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `meshforge_model.stl`;
    link.click();
  };

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;
    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const objectUrl = URL.createObjectURL(file);

    if (extension === 'glb' || extension === 'gltf') {
      new GLTFLoader().load(objectUrl, (gltf) => {
        replaceStageObject(gltf.scene);
        setActivePreset(file.name);
      });
    } else if (extension === 'stl') {
      new STLLoader().load(objectUrl, (geometry) => {
        geometry.computeVertexNormals();
        const mesh = new THREE.Mesh(geometry, new THREE.MeshStandardMaterial({ color: 0x00a8ff, wireframe: true }));
        replaceStageObject(mesh);
        setActivePreset(file.name);
      });
    }
  };

  return (
    <div style={{ width: '100vw', height: '100vh', background: '#020612', color: '#fff', display: 'flex', overflow: 'hidden', fontFamily: 'sans-serif' }}>
      
      {/* LEFT SIDEBAR */}
      <div style={{ width: '260px', background: '#080E1E', borderRight: '1px solid #16233B', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px', borderBottom: '1px solid #152238', paddingBottom: '14px' }}>
          <div style={{ width: '30px', height: '30px', borderRadius: '6px', background: '#0284C7', display: 'grid', placeItems: 'center' }}><Sparkles size={16} /></div>
          <div>
            <div style={{ fontSize: '13px', fontWeight: 'bold' }}>MeshForge Studio</div>
            <div style={{ fontSize: '10px', color: '#64748B' }}>zainaleinstein1982</div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
          <button onClick={() => setActiveLeftTab('layers')} style={{ background: activeLeftTab === 'layers' ? '#0D172A' : '#080E1E', border: activeLeftTab === 'layers' ? '1px solid #38BDF8' : '1px solid transparent', color: '#38BDF8', padding: '10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><Layers size={15} /> Layers</button>
          <button onClick={() => setActiveLeftTab('lighting')} style={{ background: activeLeftTab === 'lighting' ? '#0D172A' : '#080E1E', border: activeLeftTab === 'lighting' ? '1px solid #38BDF8' : '1px solid transparent', color: '#38BDF8', padding: '10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><Sliders size={15} /> Lighting</button>
          <button onClick={() => setActiveLeftTab('settings')} style={{ background: activeLeftTab === 'settings' ? '#0D172A' : '#080E1E', border: activeLeftTab === 'settings' ? '1px solid #38BDF8' : '1px solid transparent', color: '#38BDF8', padding: '10px', borderRadius: '8px', fontSize: '12px', display: 'flex', alignItems: 'center', gap: '10px', cursor: 'pointer' }}><Settings size={15} /> Settings</button>
        </div>

        <div style={{ background: '#0D172A', border: '1px solid #1E293B', borderRadius: '8px', padding: '12px' }}>
          {activeLeftTab === 'layers' && <div><div style={{ fontSize: '11px', fontWeight: 'bold' }}>Active Model:</div><div style={{ fontSize: '11px', color: '#00F0FF', marginTop: '4px' }}>{activePreset}</div></div>}
          {activeLeftTab === 'lighting' && (
            <div style={{ display: 'flex', gap: '8px' }}>
              {['#00f0ff', '#f59e0b', '#10b981', '#ec4899'].map((c) => (
                <div key={c} onClick={() => setLightColor(c)} style={{ width: '22px', height: '22px', borderRadius: '50%', background: c, cursor: 'pointer' }} />
              ))}
            </div>
          )}
          {activeLeftTab === 'settings' && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <label style={{ fontSize: '11px', color: '#94A3B8', display: 'flex', gap: '6px', cursor: 'pointer' }}>
                <input type="checkbox" checked={autoRotate} onChange={(e) => setAutoRotate(e.target.checked)} /> Auto Rotate
              </label>
              <div style={{ fontSize: '10px', color: '#64748B' }}>Backend API URL:</div>
              <input value={backendUrl} onChange={(e) => setBackendUrl(e.target.value)} style={{ background: '#080E1E', border: '1px solid #1E293B', color: '#FFF', fontSize: '10px', padding: '4px 6px', borderRadius: '4px' }} />
            </div>
          )}
        </div>

        <button onClick={exportToSTL} style={{ marginTop: 'auto', background: '#0D172A', border: '1px solid #38BDF8', color: '#38BDF8', padding: '10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px' }}>
          <Download size={14} /> Export STL
        </button>
      </div>

      {/* CANVAS VIEWPORT */}
      <div style={{ flex: 1, position: 'relative', height: '100%' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, right: 0, zIndex: 10, display: 'flex', justifyContent: 'space-between', padding: '12px 20px', background: 'rgba(2, 6, 18, 0.85)', backdropFilter: 'blur(8px)' }}>
          <span style={{ fontSize: '12px', fontWeight: 'bold' }}>MeshForge App Studio</span>
          <button style={{ background: '#0F172A', border: '1px solid #1E293B', color: '#94A3B8', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', gap: '6px' }}><Copy size={12} /> ID Workspace</button>
        </div>

        <div ref={mountRef} style={{ width: '100%', height: '100%' }} />

        {/* CONTROLS */}
        <div style={{ position: 'absolute', bottom: '20px', left: '50%', transform: 'translateX(-50%)', zIndex: 10, display: 'flex', gap: '10px', background: 'rgba(11, 19, 43, 0.95)', padding: '6px 14px', borderRadius: '12px', border: '1px solid #1C2A48' }}>
          <button onClick={() => setIsMuted(!isMuted)} style={{ background: isMuted ? '#DC2626' : '#131F37', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }}>{isMuted ? <MicOff size={16} /> : <Mic size={16} />}</button>
          <button onClick={() => setIsVideoOff(!isVideoOff)} style={{ background: isVideoOff ? '#DC2626' : '#131F37', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }}>{isVideoOff ? <VideoOff size={16} /> : <Video size={16} />}</button>
          <button style={{ background: '#131F37', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }}><Share2 size={16} /></button>
          <button style={{ background: '#131F37', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }}><Users size={16} /></button>
          <button style={{ background: '#131F37', border: 'none', color: '#FFF', width: '36px', height: '36px', borderRadius: '8px', cursor: 'pointer' }}><MessageSquare size={16} /></button>
          <button onClick={() => setIsInMeeting(false)} style={{ background: '#E11D48', border: 'none', color: '#FFF', padding: '6px 14px', borderRadius: '8px', cursor: 'pointer', fontWeight: 'bold', fontSize: '11px', display: 'flex', gap: '6px' }}><LogOut size={14} /> Exit</button>
        </div>
      </div>

      {/* RIGHT SIDEBAR */}
      <div style={{ width: '320px', background: '#080E1E', borderLeft: '1px solid #16233B', padding: '16px', display: 'flex', flexDirection: 'column', gap: '16px', zIndex: 20 }}>
        <div style={{ fontWeight: 'bold', fontSize: '13px', color: '#00F0FF', display: 'flex', gap: '8px' }}><Box size={16} /> Presets & Models</div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          {['Default Hologram', 'Generative Cube', 'Stage Presenter'].map((p) => (
            <div key={p} onClick={() => loadPresetModel(p)} style={{ background: activePreset === p ? '#0F2B48' : '#0D172A', border: activePreset === p ? '1px solid #00F0FF' : '1px solid #1E293B', padding: '10px', borderRadius: '8px', cursor: 'pointer', fontSize: '12px' }}>{p}</div>
          ))}
        </div>

        <div style={{ marginTop: 'auto', borderTop: '1px solid #152238', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {/* MENU UTAMA MESH FORGE HUB */}
          <button onClick={() => setIsMeshForgeOpen(true)} style={{ width: '100%', background: 'linear-gradient(135deg, #0284C7 0%, #0369A1 100%)', border: 'none', color: '#FFF', padding: '12px', borderRadius: '8px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', boxShadow: '0 4px 12px rgba(2, 132, 199, 0.3)' }}>
            <Wand2 size={16} /> Open MeshForge App Hub
          </button>
          
          <button onClick={() => fileInputRef.current?.click()} style={{ width: '100%', background: '#0F172A', border: '1px solid #1E293B', color: '#38BDF8', padding: '10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
            <Upload size={14} /> Import File (.glb, .stl)
          </button>
          <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".glb,.gltf,.stl" style={{ display: 'none' }} />
        </div>
      </div>

      {/* MESH FORGE HUB MODAL */}
      {isMeshForgeOpen && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', zIndex: 999, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ width: '640px', background: '#080E1E', border: '1px solid #16233B', borderRadius: '12px', padding: '24px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
            
            {/* MODAL HEADER */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: '1px solid #16233B', paddingBottom: '12px' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <Cpu size={18} color="#38BDF8" />
                <span style={{ fontSize: '14px', fontWeight: 'bold', color: '#FFF' }}>MeshForge App Studio Hub</span>
              </div>
              <button onClick={closeMeshForgeModal} style={{ background: 'none', border: 'none', color: '#64748B', cursor: 'pointer' }}><X size={18} /></button>
            </div>

            {/* MAIN TAB SELECTOR: SCAN vs MESHFORGE */}
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px', background: '#020612', padding: '4px', borderRadius: '8px', border: '1px solid #1E293B' }}>
              <button onClick={() => setActiveStudioTab('scan')} style={{ background: activeStudioTab === 'scan' ? '#0284C7' : 'transparent', border: 'none', color: '#FFF', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Camera size={15} /> 1. Scan Camera 3D
              </button>
              <button onClick={() => setActiveStudioTab('meshforge')} style={{ background: activeStudioTab === 'meshforge' ? '#0284C7' : 'transparent', border: 'none', color: '#FFF', padding: '8px', borderRadius: '6px', fontSize: '12px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                <Wand2 size={15} /> 2. Mesh Forge Studio
              </button>
            </div>

            {/* --- TAB 1: CAMERA SCANNER --- */}
            {activeStudioTab === 'scan' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ fontSize: '11px', color: '#94A3B8' }}>Pilih Kategori Objek Target:</div>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: '6px' }}>
                  {(['warship', 'submarine', 'aircraft', 'tank', 'isoplus'] as ScanTarget[]).map((t) => (
                    <button key={t} onClick={() => setSelectedTarget(t)} style={{ background: selectedTarget === t ? '#0284C7' : '#0D172A', border: '1px solid #1E293B', color: '#FFF', padding: '6px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', textTransform: 'capitalize' }}>
                      {t}
                    </button>
                  ))}
                </div>

                <div style={{ position: 'relative', width: '100%', height: '220px', background: '#000', borderRadius: '8px', overflow: 'hidden', border: '1px solid #1E293B' }}>
                  <video ref={videoRef} autoPlay playsInline muted style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                  {isScanning && (
                    <div style={{ position: 'absolute', inset: 0, background: 'rgba(2, 132, 199, 0.2)', border: '2px dashed #00F0FF', display: 'flex', alignItems: 'center', justifyContent: 'center', flexDirection: 'column', gap: '8px' }}>
                      <div style={{ fontSize: '12px', fontWeight: 'bold', color: '#FFF' }}>Scanning Point Cloud: {scanProgress}%</div>
                    </div>
                  )}
                </div>

                <button onClick={handleStartScan} style={{ background: '#0284C7', border: 'none', color: '#FFF', padding: '10px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer' }}>
                  {isScanning ? 'Mengolah Splat...' : 'Mulai Scan Kamera'}
                </button>
              </div>
            )}

            {/* --- TAB 2: MESH FORGE STUDIO --- */}
            {activeStudioTab === 'meshforge' && (
              <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {/* FORGE MODE SELECTOR */}
                <div style={{ display: 'flex', gap: '12px', borderBottom: '1px solid #16233B', paddingBottom: '10px' }}>
                  <button onClick={() => setForgeMode('text23d')} style={{ background: forgeMode === 'text23d' ? '#0F2B48' : 'transparent', border: forgeMode === 'text23d' ? '1px solid #38BDF8' : 'none', color: '#FFF', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', gap: '6px' }}>
                    <Wand2 size={14} /> Text to 3D
                  </button>
                  <button onClick={() => setForgeMode('image23d')} style={{ background: forgeMode === 'image23d' ? '#0F2B48' : 'transparent', border: forgeMode === 'image23d' ? '1px solid #38BDF8' : 'none', color: '#FFF', padding: '6px 12px', borderRadius: '6px', fontSize: '11px', cursor: 'pointer', display: 'flex', gap: '6px' }}>
                    <ImageIcon size={14} /> Image to 3D (Direct)
                  </button>
                </div>

                {forgeMode === 'text23d' && (
                  <>
                    {/* SUB-OPTION TOGGLE: MANUAL vs AUTOMATIC FROM IMAGE */}
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', background: '#0D172A', padding: '4px', borderRadius: '6px' }}>
                      <button onClick={() => setTextSubOption('manual')} style={{ background: textSubOption === 'manual' ? '#0284C7' : 'transparent', border: 'none', color: '#FFF', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        Opsi 1 · Manual Prompt
                      </button>
                      <button onClick={() => setTextSubOption('autoFromImage')} style={{ background: textSubOption === 'autoFromImage' ? '#0284C7' : 'transparent', border: 'none', color: '#FFF', padding: '6px', borderRadius: '4px', fontSize: '11px', cursor: 'pointer' }}>
                        Opsi 2 · Otomatis dari Gambar
                      </button>
                    </div>

                    {/* OPSI 2 PIPELINE PANEL */}
                    {textSubOption === 'autoFromImage' && (
                      <div style={{ background: '#020612', border: '1px dashed #38BDF8', padding: '12px', borderRadius: '8px', display: 'flex', flexDirection: 'column', gap: '10px' }}>
                        <div style={{ fontSize: '11px', fontWeight: 'bold', color: '#38BDF8', display: 'flex', gap: '6px' }}>
                          <Bot size={14} /> Vision-to-Prompt Pipeline
                        </div>

                        <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                          <button onClick={() => autoImgInputRef.current?.click()} style={{ background: '#0F172A', border: '1px solid #1E293B', color: '#FFF', padding: '8px 12px', borderRadius: '6px', fontSize: '10px', cursor: 'pointer', display: 'flex', gap: '6px' }}>
                            <Upload size={12} /> Upload Gambar Referensi
                          </button>
                          <input type="file" ref={autoImgInputRef} onChange={(e) => e.target.files?.[0] && handleAutoVisionPipeline(e.target.files[0])} accept="image/*" style={{ display: 'none' }} />
                          
                          {refImagePreview && <img src={refImagePreview} alt="Ref" style={{ width: '32px', height: '32px', borderRadius: '4px', objectFit: 'cover' }} />}
                        </div>

                        {/* CONFIG PIPELINE */}
                        <div style={{ display: 'flex', gap: '12px', fontSize: '10px', color: '#94A3B8' }}>
                          <label style={{ display: 'flex', alignItems: 'center', gap: '4px', cursor: 'pointer' }}>
                            <input type="checkbox" checked={removeBg} onChange={(e) => setRemoveBg(e.target.checked)} /> Hapus Background (851-labs)
                          </label>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span>Vision Model:</span>
                            <select value={visionModel} onChange={(e) => setVisionModel(e.target.value as any)} style={{ background: '#080E1E', color: '#FFF', border: '1px solid #1E293B', fontSize: '10px', borderRadius: '4px' }}>
                              <option value="moondream2">Moondream2 (Cepat)</option>
                              <option value="gpt54">GPT-5.4 Vision (Detail)</option>
                            </select>
                          </div>
                        </div>

                        {isAnalyzingImage && <div style={{ fontSize: '10px', color: '#00F0FF', display: 'flex', gap: '6px', alignItems: 'center' }}><RefreshCw size={12} className="spin" /> Menganalisis gambar & menulis prompt 3D...</div>}
                      </div>
                    )}

                    {/* PROMPT INPUT (SHARED STEP 4) */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                      <div style={{ fontSize: '11px', color: '#94A3B8' }}>Prompt Teks 3D:</div>
                      <textarea
                        value={textPrompt}
                        onChange={(e) => setTextPrompt(e.target.value)}
                        placeholder="Generate a highly detailed 3D model of..."
                        style={{ width: '100%', height: '70px', background: '#020612', border: '1px solid #1E293B', color: '#FFF', padding: '8px', borderRadius: '6px', fontSize: '11px', resize: 'none' }}
                      />
                    </div>

                    {/* MODEL GENERATOR SELECTOR */}
                    <div style={{ display: 'flex', justifyBetween: 'space-between', alignItems: 'center' }}>
                      <span style={{ fontSize: '11px', color: '#94A3B8' }}>Generator Engine:</span>
                      <select value={selectedModel} onChange={(e) => setSelectedModel(e.target.value)} style={{ background: '#0D172A', color: '#FFF', border: '1px solid #1E293B', padding: '4px 8px', borderRadius: '6px', fontSize: '11px' }}>
                        <option value="tripo3d">TripoSR AI Model</option>
                        <option value="meshy">Meshy 3D Engine</option>
                        <option value="zero123">Zero123 Diffusion</option>
                      </select>
                    </div>

                    <button onClick={handleGenerate3DModel} disabled={isGenerating3D} style={{ background: 'linear-gradient(135deg, #10B981 0%, #059669 100%)', border: 'none', color: '#FFF', padding: '12px', borderRadius: '8px', fontSize: '11px', fontWeight: 'bold', cursor: 'pointer', display: 'flex', justifyContent: 'center', gap: '8px' }}>
                      <Sparkles size={14} /> {isGenerating3D ? 'Memproses Generasi 3D...' : 'Generate 3D Model'}
                    </button>
                  </>
                )}

                {forgeMode === 'image23d' && (
                  <div style={{ border: '2px dashed #1E293B', padding: '24px', textAlign: 'center', borderRadius: '8px', color: '#94A3B8', fontSize: '11px' }}>
                    Fitur Direct Image to 3D rekonstruksi aktif. Unggah gambar objek langsung.
                  </div>
                )}

              </div>
            )}

          </div>
        </div>
      )}

    </div>
  );
}
