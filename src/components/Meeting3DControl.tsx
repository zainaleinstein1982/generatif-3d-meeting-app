import React, { useRef, useState } from 'react';
import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { STLLoader } from 'three/examples/jsm/loaders/STLLoader.js';

interface Meeting3DControlProps {
  // Callback untuk mengirim objek 3D yang berhasil dimuat ke scene utama meeting room
  onModelLoaded: (object: THREE.Object3D) => void;
  // Callback jika mengambil foto dari kamera untuk diproses
  onCameraCapture?: (imageSrc: string) => void;
}

export const Meeting3DControl: React.FC<Meeting3DControlProps> = ({
  onModelLoaded,
  onCameraCapture,
}) => {
  const [isCameraActive, setIsCameraActive] = useState(false);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);

  // --- 1. LOGIKA LOAD FILE .GLB, .GLTF, .STL ---
  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const files = event.target.files;
    if (!files || files.length === 0) return;

    const file = files[0];
    const extension = file.name.split('.').pop()?.toLowerCase();
    const objectUrl = URL.createObjectURL(file);

    if (extension === 'glb' || extension === 'gltf') {
      const loader = new GLTFLoader();
      loader.load(
        objectUrl,
        (gltf) => {
          onModelLoaded(gltf.scene);
          URL.revokeObjectURL(objectUrl);
        },
        undefined,
        (error) => console.error('Gagal memuat file GLTF/GLB:', error)
      );
    } else if (extension === 'stl') {
      const loader = new STLLoader();
      loader.load(
        objectUrl,
        (geometry) => {
          geometry.computeVertexNormals();
          const material = new THREE.MeshStandardMaterial({
            color: 0x9aa0a6,
            roughness: 0.5,
            metalness: 0.2,
          });
          const mesh = new THREE.Mesh(geometry, material);
          onModelLoaded(mesh);
          URL.revokeObjectURL(objectUrl);
        },
        undefined,
        (error) => console.error('Gagal memuat file STL:', error)
      );
    } else {
      alert('Format file tidak didukung! Gunakan .glb, .gltf, atau .stl');
    }

    // Reset input agar bisa upload file yang sama jika diperlukan
    event.target.value = '';
  };

  // --- 2. LOGIKA WEBCAM / USE CAMERA ---
  const startCamera = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment' },
        audio: false,
      });
      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
      }
      setIsCameraActive(true);
    } catch (err) {
      alert('Gagal mengakses kamera: ' + (err as Error).message);
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/png');
      if (onCameraCapture) {
        onCameraCapture(dataUrl);
      }
    }
    stopCamera();
  };

  return (
    <div style={{ display: 'flex', gap: '10px', padding: '10px', background: '#14171B', borderRadius: '8px' }}>
      {/* Tombol Load File 3D */}
      <button
        onClick={() => fileInputRef.current?.click()}
        style={{
          padding: '8px 14px',
          background: '#262B32',
          color: '#E9EBEE',
          border: '1px solid #4DE8C7',
          borderRadius: '6px',
          cursor: 'pointer',
        }}
      >
        📦 Load .glb / .gltf / .stl
      </button>
      <input
        type="file"
        ref={fileInputRef}
        onChange={handleFileUpload}
        accept=".glb,.gltf,.stl"
        style={{ display: 'none' }}
      />

      {/* Tombol Kamera */}
      <button
        onClick={startCamera}
        style={{
          padding: '8px 14px',
          background: '#F2A340',
          color: '#14171B',
          border: 'none',
          borderRadius: '6px',
          fontWeight: 'bold',
          cursor: 'pointer',
        }}
      >
        📷 Use Camera
      </button>

      {/* Modal Preview Kamera */}
      {isCameraActive && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            background: 'rgba(0,0,0,0.8)',
            zIndex: 999,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            style={{ width: '80%', maxWidth: '500px', borderRadius: '8px' }}
          />
          <div style={{ marginTop: '15px', display: 'flex', gap: '10px' }}>
            <button
              onClick={capturePhoto}
              style={{ padding: '10px 20px', background: '#4DE8C7', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Ambil Foto
            </button>
            <button
              onClick={stopCamera}
              style={{ padding: '10px 20px', background: '#5B6169', color: '#fff', border: 'none', borderRadius: '6px', cursor: 'pointer' }}
            >
              Batal
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
