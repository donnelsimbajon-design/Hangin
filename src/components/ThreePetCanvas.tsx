import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import { PetSpecies, PetAnimationMood, EquippedAccessories, TimeOfDay } from '../types';

interface ThreePetCanvasProps {
  species: PetSpecies;
  animationMood?: PetAnimationMood | string;
  equipped?: EquippedAccessories;
  timeOfDay?: TimeOfDay;
  onPet?: () => void;
  interactive?: boolean;
  className?: string;
  size?: 'sm' | 'md' | 'lg' | 'hero';
  showBowl?: boolean;
  isEating?: boolean;
  isSniffing?: boolean;
}

// ---------------------------------------------------------------------------
// High-Fidelity Procedural Fur, Eye & Nose Texture Generators
// ---------------------------------------------------------------------------

function createRealisticFurTexture(isDog: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm Golden Retriever coat base gradient
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  if (isDog) {
    grad.addColorStop(0, '#e59d43');    // Golden honey
    grad.addColorStop(0.35, '#d98b2f'); // Warm amber
    grad.addColorStop(0.7, '#c27421');  // Rich caramel
    grad.addColorStop(1, '#9e5614');    // Deep chestnut shadow
  } else {
    grad.addColorStop(0, '#fca855');
    grad.addColorStop(0.4, '#e68733');
    grad.addColorStop(0.75, '#c96a1e');
    grad.addColorStop(1, '#9e460d');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Layer 1: Directional micro-hair fibers (dense velvety undercoat)
  ctx.fillStyle = 'rgba(255, 240, 215, 0.08)';
  for (let i = 0; i < 22000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 3 + Math.random() * 7;
    ctx.fillRect(x, y, 1.2, len);
  }

  // Layer 2: Deep shadow fibers for depth and tactile softness
  ctx.fillStyle = 'rgba(60, 25, 0, 0.07)';
  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 3 + Math.random() * 6;
    ctx.fillRect(x, y, 1.1, len);
  }

  // Layer 3: Soft golden highlights on guard hairs
  ctx.fillStyle = 'rgba(255, 255, 230, 0.12)';
  for (let i = 0; i < 9000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 4 + Math.random() * 9;
    ctx.fillRect(x, y, 1.3, len);
  }

  const texture = new THREE.CanvasTexture(canvas);
  texture.wrapS = THREE.RepeatWrapping;
  texture.wrapT = THREE.RepeatWrapping;
  texture.repeat.set(2, 2);
  return texture;
}

function createRealisticEyeTexture(isDog: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  const cx = 256;
  const cy = 256;
  const radius = 240;

  // Dark sclera / outer eye rim
  ctx.fillStyle = '#110b08';
  ctx.beginPath();
  ctx.arc(cx, cy, radius, 0, Math.PI * 2);
  ctx.fill();

  // Dark limbal ring
  ctx.strokeStyle = '#180e07';
  ctx.lineWidth = 14;
  ctx.stroke();

  // Radiant canine amber iris gradient
  const irisGrad = ctx.createRadialGradient(cx, cy, 40, cx, cy, radius - 16);
  if (isDog) {
    irisGrad.addColorStop(0, '#5a3010');
    irisGrad.addColorStop(0.3, '#8c4b18');
    irisGrad.addColorStop(0.65, '#bd7122');
    irisGrad.addColorStop(0.88, '#e09133');
    irisGrad.addColorStop(1, '#3b1d06');
  } else {
    irisGrad.addColorStop(0, '#426823');
    irisGrad.addColorStop(0.35, '#75a631');
    irisGrad.addColorStop(0.75, '#add645');
    irisGrad.addColorStop(1, '#253d0e');
  }
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 18, 0, Math.PI * 2);
  ctx.fill();

  // Fine radial iris striations
  ctx.strokeStyle = isDog ? 'rgba(255, 225, 160, 0.28)' : 'rgba(235, 255, 180, 0.3)';
  ctx.lineWidth = 1.8;
  for (let a = 0; a < Math.PI * 2; a += 0.05) {
    const r1 = 50 + Math.random() * 20;
    const r2 = radius - 24 - Math.random() * 12;
    ctx.beginPath();
    ctx.moveTo(cx + Math.cos(a) * r1, cy + Math.sin(a) * r1);
    ctx.lineTo(cx + Math.cos(a) * r2, cy + Math.sin(a) * r2);
    ctx.stroke();
  }

  // Deep velvet black pupil
  ctx.fillStyle = '#060403';
  ctx.beginPath();
  if (isDog) {
    ctx.arc(cx, cy, 88, 0, Math.PI * 2);
  } else {
    ctx.ellipse(cx, cy, 38, 125, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Primary moist glossy catchlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.92)';
  ctx.beginPath();
  ctx.arc(cx - 48, cy - 54, 30, 0, Math.PI * 2);
  ctx.fill();

  // Secondary soft ambient catchlight
  ctx.fillStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.beginPath();
  ctx.arc(cx + 52, cy + 50, 16, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

function createRealisticNoseTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 512;
  canvas.height = 512;
  const ctx = canvas.getContext('2d')!;

  ctx.fillStyle = '#1c1511';
  ctx.fillRect(0, 0, 512, 512);

  // Leathery cobblestone pebble bump pattern
  for (let i = 0; i < 4200; i++) {
    const x = Math.random() * 512;
    const y = Math.random() * 512;
    const r = 1.5 + Math.random() * 3.5;
    ctx.fillStyle = Math.random() > 0.5 ? 'rgba(50, 40, 35, 0.45)' : 'rgba(8, 6, 5, 0.45)';
    ctx.beginPath();
    ctx.arc(x, y, r, 0, Math.PI * 2);
    ctx.fill();
  }

  // Wet specular shine across top surface of the nose
  const gloss = ctx.createLinearGradient(120, 80, 392, 240);
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.32)');
  gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0.1)');
  gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.ellipse(256, 140, 130, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// ---------------------------------------------------------------------------
// Realistic 3D Dog & Companion Canvas Component
// ---------------------------------------------------------------------------

export const ThreePetCanvas: React.FC<ThreePetCanvasProps> = ({
  species,
  animationMood = 'idle',
  equipped = { hat: null, glasses: false, scarf: false, collar: true },
  timeOfDay = 'day',
  onPet,
  interactive = true,
  className = '',
  size = 'lg',
  showBowl = false,
  isEating = false,
  isSniffing = false,
}) => {
  const mountRef = useRef<HTMLDivElement>(null);
  const showBowlRef = useRef(showBowl);
  const isEatingRef = useRef(isEating);
  const isSniffingRef = useRef(isSniffing);

  useEffect(() => {
    showBowlRef.current = showBowl;
    isEatingRef.current = isEating;
    isSniffingRef.current = isSniffing;
  }, [showBowl, isEating, isSniffing]);

  const sceneRef = useRef<{
    scene: THREE.Scene;
    camera: THREE.PerspectiveCamera;
    renderer: THREE.WebGLRenderer;
    petGroup: THREE.Group;
    bodyGroup: THREE.Group;
    headGroup: THREE.Group;
    neckGroup: THREE.Group;
    snoutGroup: THREE.Group;
    jawGroup: THREE.Group;
    tongueGroup: THREE.Group;
    tailGroup: THREE.Group;
    tailJoints: THREE.Group[];
    leftEarGroup: THREE.Group;
    rightEarGroup: THREE.Group;
    leftUpperLid: THREE.Mesh;
    rightUpperLid: THREE.Mesh;
    leftLowerLid: THREE.Mesh;
    rightLowerLid: THREE.Mesh;
    frontLeftLeg: THREE.Group;
    frontRightLeg: THREE.Group;
    backLeftLeg: THREE.Group;
    backRightLeg: THREE.Group;
    shadowDisc: THREE.Mesh;
    zenRing: THREE.Mesh;
    chestMesh: THREE.Mesh;
    bowlGroup: THREE.Group;
    foodMesh: THREE.Mesh;
    salakotHat?: THREE.Group;
    beanieHat?: THREE.Group;
    sunglasses?: THREE.Group;
    cozyScarf?: THREE.Group;
    collar?: THREE.Group;
    particlesGroup: THREE.Group;
    bubblesGroup: THREE.Group;
    animState: {
      time: number;
      blinkTimer: number;
      isBlinking: boolean;
      petReaction: number;
      headLookX: number;
      headLookY: number;
      targetLookX: number;
      targetLookY: number;
      isDragging: boolean;
      prevMouseX: number;
      prevMouseY: number;
      orbitAngle: number;
      orbitPitch: number;
      earSpringL: number;
      earSpringR: number;
      currentMood: string;
    };
  } | null>(null);

  const moodRef = useRef(animationMood);
  useEffect(() => {
    moodRef.current = animationMood;
    if (sceneRef.current) {
      sceneRef.current.animState.currentMood = animationMood;
    }
  }, [animationMood]);

  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();

    // Natural camera angle: eye-to-eye level, looking slightly down at seated puppy
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.95, 3.2);
    camera.lookAt(0, 0.58, 0);

    const renderer = new THREE.WebGLRenderer({
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance',
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFShadowMap;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.06;

    container.replaceChildren(renderer.domElement);

    // --- Realistic Warm Studio Lighting ---
    const isNight = timeOfDay === 'night';
    const isSunset = timeOfDay === 'sunset';

    // Ambient fill
    const ambientLight = new THREE.AmbientLight(
      isNight ? 0xa5b4fc : isSunset ? 0xfef08a : 0xfffaf0,
      isNight ? 1.05 : isSunset ? 1.35 : 1.4
    );
    scene.add(ambientLight);

    // Warm Sun Key Light with soft shadows
    const keyLight = new THREE.DirectionalLight(
      isNight ? 0xc7d2fe : isSunset ? 0xfb923c : 0xfffbeb,
      isNight ? 1.1 : 1.65
    );
    keyLight.position.set(2.0, 3.8, 2.8);
    keyLight.castShadow = true;
    keyLight.shadow.mapSize.width = 1024;
    keyLight.shadow.mapSize.height = 1024;
    keyLight.shadow.camera.near = 0.5;
    keyLight.shadow.camera.far = 7;
    keyLight.shadow.camera.left = -1.4;
    keyLight.shadow.camera.right = 1.4;
    keyLight.shadow.camera.top = 1.5;
    keyLight.shadow.camera.bottom = -1.2;
    keyLight.shadow.bias = -0.0006;
    scene.add(keyLight);

    // Soft Rim Light (simulates backlit fuzzy golden fur silhouette)
    const rimLight = new THREE.DirectionalLight(
      isNight ? 0x818cf8 : isSunset ? 0xf472b6 : 0xfde68a,
      0.85
    );
    rimLight.position.set(-2.2, 2.4, -2.6);
    scene.add(rimLight);

    // Soft Ground Bounce
    const bounceLight = new THREE.DirectionalLight(0xe2f8d8, 0.35);
    bounceLight.position.set(0, -2, 1);
    scene.add(bounceLight);

    // -----------------------------------------------------------------------
    // Soft Ambient Occlusion Contact Shadow (NO harsh grey cylinder!)
    // -----------------------------------------------------------------------
    const groundGroup = new THREE.Group();

    // Multi-ring soft diffused shadow that blends into any room background
    const shadowGeo = new THREE.CircleGeometry(0.72, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a140d,
      transparent: true,
      opacity: isNight ? 0.32 : 0.24,
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.005;
    groundGroup.add(shadowDisc);

    // Calming Zen / Mindful Grounding Ring (pulses during 'calm' or 'overwhelmed')
    const zenRingGeo = new THREE.RingGeometry(0.78, 0.88, 48);
    const zenRingMat = new THREE.MeshBasicMaterial({
      color: 0x34d399,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0,
    });
    const zenRing = new THREE.Mesh(zenRingGeo, zenRingMat);
    zenRing.rotation.x = -Math.PI / 2;
    zenRing.position.y = 0.008;
    groundGroup.add(zenRing);

    scene.add(groundGroup);

    // -----------------------------------------------------------------------
    // Anatomical Realistic Canine Sculpting (Golden Retriever Puppy)
    // -----------------------------------------------------------------------
    const petGroup = new THREE.Group();
    const isDog = species === 'dog';

    // Textures
    const furTexture = createRealisticFurTexture(isDog);
    const eyeTexture = createRealisticEyeTexture(isDog);
    const noseTexture = createRealisticNoseTexture();

    // Realistic PBR Materials
    const furMaterial = new THREE.MeshStandardMaterial({
      map: furTexture,
      bumpMap: furTexture,
      bumpScale: 0.012,
      roughness: 0.74,
      metalness: 0.03,
    });

    const creamFurMaterial = new THREE.MeshStandardMaterial({
      color: 0xfff5e4,
      roughness: 0.82,
      metalness: 0.02,
    });

    const darkEarFurMaterial = new THREE.MeshStandardMaterial({
      color: isDog ? 0xb56c1d : 0xab5010,
      map: furTexture,
      roughness: 0.78,
      metalness: 0.02,
    });

    const noseMaterial = new THREE.MeshStandardMaterial({
      color: isDog ? 0x1f1612 : 0xe88a9c,
      bumpMap: noseTexture,
      bumpScale: 0.03,
      roughness: 0.28,
      metalness: 0.08,
    });

    const eyeCorneaMaterial = new THREE.MeshStandardMaterial({
      map: eyeTexture,
      roughness: 0.04,
      metalness: 0.1,
    });

    const tongueMaterial = new THREE.MeshStandardMaterial({
      color: 0xff6680,
      roughness: 0.26,
      metalness: 0.04,
    });

    const lipMaterial = new THREE.MeshStandardMaterial({
      color: 0x18100c,
      roughness: 0.6,
    });

    const earInnerMaterial = new THREE.MeshStandardMaterial({
      color: isDog ? 0xf0b0b0 : 0xfca5a5,
      roughness: 0.88,
    });

    const pawPadMaterial = new THREE.MeshStandardMaterial({
      color: 0x221711,
      roughness: 0.62,
    });

    // --- Body Group (Deep chest, tucked flank, seated hips) ---
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.44, 0);

    // 1. Deep Contoured Ribcage (Thorax)
    const chestGeo = new THREE.SphereGeometry(0.42, 32, 28);
    chestGeo.scale(0.96, 1.12, 1.15);
    const chestMesh = new THREE.Mesh(chestGeo, furMaterial);
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    bodyGroup.add(chestMesh);

    // 2. Soft Cream Brisket & Chest Fur (seamlessly contoured)
    const brisketGeo = new THREE.SphereGeometry(0.32, 24, 20);
    brisketGeo.scale(0.8, 1.05, 0.65);
    const brisket = new THREE.Mesh(brisketGeo, creamFurMaterial);
    brisket.position.set(0, -0.02, 0.38);
    bodyGroup.add(brisket);

    // 3. Tummy / Belly Undercoat
    const bellyGeo = new THREE.SphereGeometry(0.36, 24, 20);
    bellyGeo.scale(0.84, 0.82, 0.72);
    const belly = new THREE.Mesh(bellyGeo, creamFurMaterial);
    belly.position.set(0, -0.15, 0.12);
    bodyGroup.add(belly);

    // 4. Seated Rump / Pelvis
    const rumpGeo = new THREE.SphereGeometry(0.4, 28, 24);
    rumpGeo.scale(0.95, 0.9, 0.95);
    const rump = new THREE.Mesh(rumpGeo, furMaterial);
    rump.position.set(0, -0.08, -0.28);
    rump.castShadow = true;
    bodyGroup.add(rump);

    // --- Neck & Head Articulation ---
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.28, 0.22);
    neckGroup.rotation.x = 0.12; // Natural puppy neck posture
    bodyGroup.add(neckGroup);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.22, 0.08);
    neckGroup.add(headGroup);

    // Sculpted Canine Cranium (Smooth forehead dome)
    const skullGeo = new THREE.SphereGeometry(0.38, 32, 28);
    skullGeo.scale(1.04, 0.96, 0.98);
    const skullMesh = new THREE.Mesh(skullGeo, furMaterial);
    skullMesh.castShadow = true;
    headGroup.add(skullMesh);

    // Soft Cheek Feathers (tucked smoothly into jawline, NOT protruding spheres!)
    const cheekGeo = new THREE.SphereGeometry(0.18, 20, 18);
    cheekGeo.scale(0.88, 0.85, 0.65);
    const leftCheek = new THREE.Mesh(cheekGeo, creamFurMaterial);
    leftCheek.position.set(-0.21, -0.09, 0.18);
    headGroup.add(leftCheek);

    const rightCheek = leftCheek.clone();
    rightCheek.position.x = 0.21;
    headGroup.add(rightCheek);

    // Subtle Cute Puppy Cheerful Blush
    const blushMat = new THREE.MeshBasicMaterial({ color: 0xff8b80, transparent: true, opacity: 0.38 });
    const blushGeo = new THREE.CircleGeometry(0.065, 16);
    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.26, -0.03, 0.26);
    leftBlush.rotation.y = -0.32;
    headGroup.add(leftBlush);

    const rightBlush = leftBlush.clone();
    rightBlush.position.x = 0.26;
    rightBlush.rotation.y = 0.32;
    headGroup.add(rightBlush);

    // --- Muzzle & Snout (Realistic Smooth Sloping Canine Nasal Bridge) ---
    const snoutGroup = new THREE.Group();
    snoutGroup.position.set(0, -0.05, 0.28);
    headGroup.add(snoutGroup);

    if (isDog) {
      // Sloping Nasal Bridge (starts below forehead stop, tapers to nose)
      const bridgeGeo = new THREE.CylinderGeometry(0.12, 0.17, 0.28, 24);
      bridgeGeo.rotateX(Math.PI * 0.5);
      bridgeGeo.scale(1.08, 0.72, 1.0);
      const bridgeMesh = new THREE.Mesh(bridgeGeo, creamFurMaterial);
      bridgeMesh.position.set(0, -0.01, 0.12);
      snoutGroup.add(bridgeMesh);

      // Chin / Mandible Under-Jaw
      const chinGeo = new THREE.SphereGeometry(0.14, 18, 16);
      chinGeo.scale(0.9, 0.55, 0.9);
      const chin = new THREE.Mesh(chinGeo, creamFurMaterial);
      chin.position.set(0, -0.1, 0.14);
      snoutGroup.add(chin);

      // Leathery Wet Truffle Nose with distinct Nostril cavities
      const noseGeo = new THREE.SphereGeometry(0.068, 20, 16);
      noseGeo.scale(1.22, 0.78, 0.85);
      const noseMesh = new THREE.Mesh(noseGeo, noseMaterial);
      noseMesh.position.set(0, 0.04, 0.25);
      snoutGroup.add(noseMesh);

      // Distinct Nostril curves
      const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x080605 });
      const nostrilGeo = new THREE.SphereGeometry(0.018, 10, 8);
      nostrilGeo.scale(0.8, 1.1, 0.5);

      const leftNostril = new THREE.Mesh(nostrilGeo, nostrilMat);
      leftNostril.position.set(-0.032, 0.035, 0.29);
      snoutGroup.add(leftNostril);

      const rightNostril = leftNostril.clone();
      rightNostril.position.x = 0.032;
      snoutGroup.add(rightNostril);
    } else {
      // Cat Delicate Muzzle
      const catMuzzleGeo = new THREE.SphereGeometry(0.16, 20, 16);
      catMuzzleGeo.scale(1.08, 0.65, 0.8);
      const catMuzzle = new THREE.Mesh(catMuzzleGeo, creamFurMaterial);
      catMuzzle.position.set(0, -0.02, 0.1);
      snoutGroup.add(catMuzzle);

      const catNoseGeo = new THREE.ConeGeometry(0.048, 0.045, 4);
      catNoseGeo.rotateX(Math.PI);
      const catNose = new THREE.Mesh(catNoseGeo, noseMaterial);
      catNose.position.set(0, 0.015, 0.2);
      snoutGroup.add(catNose);
    }

    // --- Black Canine Lips (Flews) & Panting Tongue ---
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.13, 0.22);
    headGroup.add(jawGroup);

    const lipGeo = new THREE.TorusGeometry(0.11, 0.018, 10, 20, Math.PI);
    lipGeo.rotateX(Math.PI * 0.5);
    const lips = new THREE.Mesh(lipGeo, lipMaterial);
    lips.position.set(0, 0.015, 0.06);
    jawGroup.add(lips);

    const tongueGroup = new THREE.Group();
    tongueGroup.position.set(0, 0.015, 0.08);

    const tongueGeo = new THREE.CylinderGeometry(0.055, 0.07, 0.14, 16);
    tongueGeo.scale(1.08, 0.26, 1.15);
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMaterial);
    tongueMesh.position.set(0, -0.035, 0.05);
    tongueMesh.rotation.x = 0.42;
    tongueGroup.add(tongueMesh);
    tongueGroup.scale.set(0.001, 0.001, 0.001); // hidden until happy/eating
    jawGroup.add(tongueGroup);

    // --- Soulful Eyes with Realistic Eyelids ---
    const eyeGeo = new THREE.SphereGeometry(0.082, 24, 20);

    // Left Eye (angled 10° outward naturally)
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.17, 0.05, 0.32);
    leftEyeGroup.rotation.y = -0.12;
    const leftEyeMesh = new THREE.Mesh(eyeGeo, eyeCorneaMaterial);
    leftEyeGroup.add(leftEyeMesh);
    headGroup.add(leftEyeGroup);

    // Right Eye
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.17, 0.05, 0.32);
    rightEyeGroup.rotation.y = 0.12;
    const rightEyeMesh = new THREE.Mesh(eyeGeo, eyeCorneaMaterial);
    rightEyeGroup.add(rightEyeMesh);
    headGroup.add(rightEyeGroup);

    // Eyelids (Upper and Lower for fluid blinking, happy crescent smiles, sleepy droop)
    const upperLidGeo = new THREE.SphereGeometry(0.09, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const lowerLidGeo = new THREE.SphereGeometry(0.089, 20, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);

    const leftUpperLid = new THREE.Mesh(upperLidGeo, furMaterial);
    leftUpperLid.position.copy(leftEyeGroup.position);
    leftUpperLid.rotation.x = -Math.PI * 0.5; // open
    headGroup.add(leftUpperLid);

    const rightUpperLid = new THREE.Mesh(upperLidGeo, furMaterial);
    rightUpperLid.position.copy(rightEyeGroup.position);
    rightUpperLid.rotation.x = -Math.PI * 0.5;
    headGroup.add(rightUpperLid);

    const leftLowerLid = new THREE.Mesh(lowerLidGeo, furMaterial);
    leftLowerLid.position.copy(leftEyeGroup.position);
    leftLowerLid.rotation.x = Math.PI * 0.5; // open
    headGroup.add(leftLowerLid);

    const rightLowerLid = new THREE.Mesh(lowerLidGeo, furMaterial);
    rightLowerLid.position.copy(rightEyeGroup.position);
    rightLowerLid.rotation.x = Math.PI * 0.5;
    headGroup.add(rightLowerLid);

    // --- Floppy Dog Ears (Draping naturally down along the cheeks!) ---
    const leftEarGroup = new THREE.Group();
    const rightEarGroup = new THREE.Group();

    if (isDog) {
      // Natural floppy retriever ears hanging gracefully alongside cheeks
      leftEarGroup.position.set(-0.32, 0.18, 0.04);
      rightEarGroup.position.set(0.32, 0.18, 0.04);

      // Curved floppy ear flap
      const earFlapGeo = new THREE.CylinderGeometry(0.12, 0.16, 0.48, 16);
      earFlapGeo.scale(0.85, 1.0, 0.25);
      earFlapGeo.rotateZ(0.2);

      const leftEarMesh = new THREE.Mesh(earFlapGeo, darkEarFurMaterial);
      leftEarMesh.position.set(-0.06, -0.22, 0);
      leftEarGroup.add(leftEarMesh);

      const rightEarMesh = new THREE.Mesh(earFlapGeo, darkEarFurMaterial);
      rightEarMesh.position.set(0.06, -0.22, 0);
      rightEarMesh.rotation.y = Math.PI;
      rightEarGroup.add(rightEarMesh);
    } else {
      // Pointed Cat Ears
      leftEarGroup.position.set(-0.24, 0.34, 0.04);
      rightEarGroup.position.set(0.24, 0.34, 0.04);

      const catEarGeo = new THREE.ConeGeometry(0.18, 0.32, 4);
      catEarGeo.scale(0.9, 1, 0.36);
      catEarGeo.rotateY(Math.PI * 0.25);

      const leftCatEar = new THREE.Mesh(catEarGeo, furMaterial);
      leftCatEar.rotation.z = 0.22;
      leftCatEar.rotation.x = -0.1;
      leftEarGroup.add(leftCatEar);

      const leftInner = new THREE.Mesh(catEarGeo, earInnerMaterial);
      leftInner.scale.set(0.72, 0.72, 0.72);
      leftInner.position.set(0, 0, 0.025);
      leftEarGroup.add(leftInner);

      const rightCatEar = new THREE.Mesh(catEarGeo, furMaterial);
      rightCatEar.rotation.z = -0.22;
      rightCatEar.rotation.x = -0.1;
      rightEarGroup.add(rightCatEar);

      const rightInner = new THREE.Mesh(catEarGeo, earInnerMaterial);
      rightInner.scale.set(0.72, 0.72, 0.72);
      rightInner.position.set(0, 0, 0.025);
      rightEarGroup.add(rightInner);
    }

    headGroup.add(leftEarGroup);
    headGroup.add(rightEarGroup);

    // --- Articulated Multi-Joint Fluffy Puppy Tail ---
    const tailGroup = new THREE.Group();
    tailGroup.position.set(0, 0.36, -0.38);
    tailGroup.rotation.x = Math.PI * 0.32;

    const tailJoints: THREE.Group[] = [];
    let parentJoint = tailGroup;

    for (let i = 0; i < 4; i++) {
      const joint = new THREE.Group();
      if (i > 0) joint.position.set(0, 0.12, 0.02);

      const rTop = 0.07 - i * 0.012;
      const rBot = 0.09 - i * 0.012;
      const tSegGeo = new THREE.CylinderGeometry(rTop, rBot, 0.14, 14);
      const tMesh = new THREE.Mesh(tSegGeo, i === 3 ? creamFurMaterial : furMaterial);
      tMesh.position.y = 0.07;
      joint.add(tMesh);

      parentJoint.add(joint);
      tailJoints.push(joint);
      parentJoint = joint;
    }
    petGroup.add(tailGroup);

    // --- Forelegs & Defined Rounded Paws with Pads ---
    const frontLeftLeg = new THREE.Group();
    frontLeftLeg.position.set(-0.2, 0.34, 0.24);

    const legGeo = new THREE.CylinderGeometry(0.075, 0.07, 0.36, 16);
    const frontLLegMesh = new THREE.Mesh(legGeo, furMaterial);
    frontLLegMesh.position.y = -0.15;
    frontLeftLeg.add(frontLLegMesh);

    // Rounded puppy front paw
    const pawGeo = new THREE.SphereGeometry(0.095, 18, 16);
    pawGeo.scale(1.15, 0.65, 1.25);
    const frontLPaw = new THREE.Mesh(pawGeo, creamFurMaterial);
    frontLPaw.position.set(0, -0.32, 0.05);
    frontLPaw.castShadow = true;
    frontLeftLeg.add(frontLPaw);

    // Dark paw pad on bottom
    const padGeo = new THREE.CircleGeometry(0.055, 14);
    const frontLPad = new THREE.Mesh(padGeo, pawPadMaterial);
    frontLPad.rotation.x = Math.PI * 0.5;
    frontLPad.position.set(0, -0.36, 0.04);
    frontLeftLeg.add(frontLPad);

    const frontRightLeg = frontLeftLeg.clone();
    frontRightLeg.position.x = 0.2;

    petGroup.add(frontLeftLeg);
    petGroup.add(frontRightLeg);

    // --- Seated Rear Legs & Resting Paws ---
    const backLeftLeg = new THREE.Group();
    backLeftLeg.position.set(-0.32, 0.28, -0.12);

    const thighGeo = new THREE.SphereGeometry(0.22, 18, 16);
    thighGeo.scale(0.85, 1.15, 1.05);
    const backLThigh = new THREE.Mesh(thighGeo, furMaterial);
    backLeftLeg.add(backLThigh);

    const backLPaw = frontLPaw.clone();
    backLPaw.position.set(0.05, -0.26, 0.28);
    backLeftLeg.add(backLPaw);

    const backRightLeg = backLeftLeg.clone();
    backRightLeg.position.x = 0.32;
    backRightLeg.children[1].position.x = -0.05;

    petGroup.add(backLeftLeg);
    petGroup.add(backRightLeg);

    petGroup.add(bodyGroup);
    scene.add(petGroup);

    // -----------------------------------------------------------------------
    // Equipped Accessories (Salakot, Beanie, Glasses, Scarf, Collar)
    // -----------------------------------------------------------------------
    const accessoriesGroup = new THREE.Group();

    // 1. Salakot Hat
    const salakotGroup = new THREE.Group();
    const salakotMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
    const salakotCone = new THREE.Mesh(new THREE.ConeGeometry(0.48, 0.2, 32), salakotMat);
    salakotCone.position.set(0, 0.38, 0.02);
    salakotCone.rotation.x = -0.08;
    salakotGroup.add(salakotCone);
    salakotGroup.visible = equipped.hat === 'salakot';
    headGroup.add(salakotGroup);

    // 2. Beanie Hat
    const beanieGroup = new THREE.Group();
    const beanieMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.85 });
    const beanieDome = new THREE.Mesh(new THREE.SphereGeometry(0.4, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), beanieMat);
    beanieDome.position.set(0, 0.16, 0);
    beanieGroup.add(beanieDome);
    beanieGroup.visible = equipped.hat === 'beanie';
    headGroup.add(beanieGroup);

    // 3. Cool Sunglasses
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2, metalness: 0.4 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.08, metalness: 0.85 });

    const leftFrame = new THREE.Mesh(new THREE.TorusGeometry(0.1, 0.018, 12, 24), frameMat);
    leftFrame.position.set(-0.17, 0.05, 0.38);
    const leftLens = new THREE.Mesh(new THREE.CircleGeometry(0.09, 20), lensMat);
    leftLens.position.set(-0.17, 0.05, 0.385);
    glassesGroup.add(leftFrame);
    glassesGroup.add(leftLens);

    const rightFrame = leftFrame.clone();
    rightFrame.position.x = 0.17;
    const rightLens = leftLens.clone();
    rightLens.position.x = 0.17;
    glassesGroup.add(rightFrame);
    glassesGroup.add(rightLens);

    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.014, 0.014, 0.14), frameMat);
    bridge.rotation.z = Math.PI * 0.5;
    bridge.position.set(0, 0.06, 0.38);
    glassesGroup.add(bridge);
    glassesGroup.visible = !!equipped.glasses;
    headGroup.add(glassesGroup);

    // 4. Cozy Scarf
    const scarfGroup = new THREE.Group();
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.85 });
    const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.38, 0.09, 16, 32), scarfMat);
    scarfRing.rotateX(Math.PI * 0.5);
    scarfRing.position.set(0, 0.14, 0.12);
    scarfGroup.add(scarfRing);
    scarfGroup.visible = !!equipped.scarf;
    bodyGroup.add(scarfGroup);

    // 5. Mindful Bell Collar
    const collarGroup = new THREE.Group();
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.6 });
    const bellMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.85 });
    const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.36, 0.038, 14, 30), collarMat);
    collarRing.rotateX(Math.PI * 0.5);
    collarRing.position.set(0, 0.18, 0.1);
    collarGroup.add(collarRing);

    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.05, 16, 14), bellMat);
    bell.position.set(0, 0.13, 0.44);
    collarGroup.add(bell);
    collarGroup.visible = !!equipped.collar;
    bodyGroup.add(collarGroup);

    // -----------------------------------------------------------------------
    // Floating Emotional Particle Systems
    // -----------------------------------------------------------------------
    const particlesGroup = new THREE.Group();
    scene.add(particlesGroup);

    const bubblesGroup = new THREE.Group();
    scene.add(bubblesGroup);

    const spawnParticle = (originX = 0, originY = 1.0, originZ = 0, type: 'heart' | 'sparkle' = 'heart') => {
      let mesh: THREE.Mesh;
      if (type === 'heart') {
        const heartShape = new THREE.Shape();
        const x = 0, y = 0;
        heartShape.moveTo(x + 0.05, y + 0.05);
        heartShape.bezierCurveTo(x + 0.05, y + 0.05, x + 0.04, y, x, y);
        heartShape.bezierCurveTo(x - 0.06, y, x - 0.06, y + 0.07, x - 0.06, y + 0.07);
        heartShape.bezierCurveTo(x - 0.06, y + 0.11, x - 0.02, y + 0.154, x + 0.05, y + 0.19);
        heartShape.bezierCurveTo(x + 0.12, y + 0.154, x + 0.16, y + 0.11, x + 0.16, y + 0.07);
        heartShape.bezierCurveTo(x + 0.16, y + 0.07, x + 0.16, y, x + 0.1, y);
        heartShape.bezierCurveTo(x + 0.07, y, x + 0.05, y + 0.05, x + 0.05, y + 0.05);

        const geom = new THREE.ShapeGeometry(heartShape);
        geom.center();
        const mat = new THREE.MeshBasicMaterial({
          color: 0xf43f5e,
          side: THREE.DoubleSide,
          transparent: true,
          opacity: 0.95,
        });
        mesh = new THREE.Mesh(geom, mat);
        mesh.scale.set(1.4, 1.4, 1.4);
      } else {
        const starGeo = new THREE.SphereGeometry(0.04, 8, 8);
        const starMat = new THREE.MeshBasicMaterial({
          color: 0xfde047,
          transparent: true,
          opacity: 0.9,
        });
        mesh = new THREE.Mesh(starGeo, starMat);
      }

      mesh.position.set(
        originX + (Math.random() - 0.5) * 0.35,
        originY + (Math.random() - 0.5) * 0.2,
        originZ + (Math.random() - 0.5) * 0.3
      );
      mesh.userData = {
        vy: 0.016 + Math.random() * 0.016,
        rotSpd: (Math.random() - 0.5) * 0.06,
        life: 1.0,
      };
      particlesGroup.add(mesh);
    };

    const spawnBubble = () => {
      const bubbleGeo = new THREE.SphereGeometry(0.065 + Math.random() * 0.05, 14, 14);
      const bubbleMat = new THREE.MeshStandardMaterial({
        color: 0xe0f2fe,
        roughness: 0.1,
        metalness: 0.9,
        transparent: true,
        opacity: 0.65,
      });
      const bubble = new THREE.Mesh(bubbleGeo, bubbleMat);
      bubble.position.set(
        (Math.random() - 0.5) * 0.7,
        0.4 + Math.random() * 0.7,
        (Math.random() - 0.5) * 0.7
      );
      bubble.userData = {
        vy: 0.01 + Math.random() * 0.012,
        vx: (Math.random() - 0.5) * 0.005,
        life: 1.0,
      };
      bubblesGroup.add(bubble);
    };

    // =======================================================================
    // 3D Ceramic Pet Food Bowl (Directly on floor in front of the pet!)
    // =======================================================================
    const bowlGroup = new THREE.Group();
    bowlGroup.position.set(0, 0.04, 0.44);

    // Ceramic outer bowl basin
    const bowlOuterGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.08, 32);
    const bowlOuterMat = new THREE.MeshStandardMaterial({
      color: isDog ? 0xf59e0b : 0x06b6d4, // Warm Amber bowl for dog, Cyan/Aquamarine for cat!
      roughness: 0.18,
      metalness: 0.25,
    });
    const bowlOuter = new THREE.Mesh(bowlOuterGeo, bowlOuterMat);
    bowlOuter.castShadow = true;
    bowlOuter.receiveShadow = true;
    bowlGroup.add(bowlOuter);

    // Smooth White Ceramic Rim
    const rimGeo = new THREE.TorusGeometry(0.18, 0.016, 16, 32);
    rimGeo.rotateX(Math.PI / 2);
    const rimMat = new THREE.MeshStandardMaterial({
      color: 0xffffff,
      roughness: 0.12,
      metalness: 0.08,
    });
    const rim = new THREE.Mesh(rimGeo, rimMat);
    rim.position.y = 0.04;
    bowlGroup.add(rim);

    // Realistic Food Fill (Brown Beef Kibble for Dog / Steamed Salmon & Tuna for Cat)
    const foodGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.035, 24);
    const foodMat = new THREE.MeshStandardMaterial({
      color: isDog ? 0x78350f : 0xf97316,
      roughness: 0.85,
    });
    const foodMesh = new THREE.Mesh(foodGeo, foodMat);
    foodMesh.position.y = 0.03;
    bowlGroup.add(foodMesh);

    // Cute White Paw Emblem on the front of the Bowl
    const pawEmblemGeo = new THREE.CircleGeometry(0.028, 16);
    const pawEmblemMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const pawEmblem = new THREE.Mesh(pawEmblemGeo, pawEmblemMat);
    pawEmblem.position.set(0, 0, 0.182);
    bowlGroup.add(pawEmblem);

    petGroup.add(bowlGroup);
    bowlGroup.visible = showBowlRef.current || isEatingRef.current || isSniffingRef.current;

    // -----------------------------------------------------------------------
    // Interactive Handlers
    // -----------------------------------------------------------------------
    const animState = {
      time: 0,
      blinkTimer: 3.2,
      isBlinking: false,
      petReaction: 0,
      headLookX: 0,
      headLookY: 0,
      targetLookX: 0,
      targetLookY: 0,
      isDragging: false,
      prevMouseX: 0,
      prevMouseY: 0,
      orbitAngle: 0,
      orbitPitch: 0,
      earSpringL: 0,
      earSpringR: 0,
      currentMood: moodRef.current,
    };

    sceneRef.current = {
      scene,
      camera,
      renderer,
      petGroup,
      bodyGroup,
      headGroup,
      neckGroup,
      snoutGroup,
      jawGroup,
      tongueGroup,
      tailGroup,
      tailJoints,
      leftEarGroup,
      rightEarGroup,
      leftUpperLid,
      rightUpperLid,
      leftLowerLid,
      rightLowerLid,
      frontLeftLeg,
      frontRightLeg,
      backLeftLeg,
      backRightLeg,
      shadowDisc,
      zenRing,
      chestMesh,
      bowlGroup,
      foodMesh,
      salakotHat: salakotGroup,
      beanieHat: beanieGroup,
      sunglasses: glassesGroup,
      cozyScarf: scarfGroup,
      collar: collarGroup,
      particlesGroup,
      bubblesGroup,
      animState,
    };

    const handlePointerDown = (e: MouseEvent | TouchEvent) => {
      if (!interactive) return;
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;
      animState.isDragging = true;
      animState.prevMouseX = clientX;
      animState.prevMouseY = clientY;

      const rect = container.getBoundingClientRect();
      const mouse = new THREE.Vector2(
        ((clientX - rect.left) / rect.width) * 2 - 1,
        -((clientY - rect.top) / rect.height) * 2 + 1
      );

      const raycaster = new THREE.Raycaster();
      raycaster.setFromCamera(mouse, camera);
      const intersects = raycaster.intersectObjects([chestMesh, skullMesh, leftCheek, rightCheek], true);

      if (intersects.length > 0) {
        animState.petReaction = 1.0;
        spawnParticle(intersects[0].point.x, intersects[0].point.y + 0.15, intersects[0].point.z, 'heart');
        spawnParticle(intersects[0].point.x, intersects[0].point.y + 0.25, intersects[0].point.z, 'sparkle');
        onPet?.();
      }
    };

    const handlePointerMove = (e: MouseEvent | TouchEvent) => {
      const clientX = 'touches' in e ? e.touches[0].clientX : e.clientX;
      const clientY = 'touches' in e ? e.touches[0].clientY : e.clientY;

      if (animState.isDragging && interactive) {
        const deltaX = clientX - animState.prevMouseX;
        const deltaY = clientY - animState.prevMouseY;
        animState.orbitAngle += deltaX * 0.007;
        animState.orbitPitch = Math.max(-0.2, Math.min(0.35, animState.orbitPitch + deltaY * 0.004));
        animState.prevMouseX = clientX;
        animState.prevMouseY = clientY;
      } else {
        // Natural gentle head tracking: subtle eye contact
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        animState.targetLookY = normX * 0.28;
        animState.targetLookX = -normY * 0.16;
      }
    };

    const handlePointerUp = () => {
      animState.isDragging = false;
    };

    container.addEventListener('mousedown', handlePointerDown);
    window.addEventListener('mousemove', handlePointerMove);
    window.addEventListener('mouseup', handlePointerUp);
    container.addEventListener('touchstart', handlePointerDown, { passive: true });
    window.addEventListener('touchmove', handlePointerMove, { passive: true });
    window.addEventListener('touchend', handlePointerUp);

    // -----------------------------------------------------------------------
    // Main Render & Emotional Animation Engine
    // -----------------------------------------------------------------------
    let reqId: number;
    let lastTime = performance.now();

    const animate = (currentTime: number = performance.now()) => {
      reqId = requestAnimationFrame(animate);
      const delta = Math.min((currentTime - lastTime) / 1000, 0.1);
      lastTime = currentTime;
      animState.time += delta;
      const t = animState.time;
      const activeMood = moodRef.current;

      // Natural Eye Blinking
      animState.blinkTimer -= delta;
      if (animState.blinkTimer <= 0) {
        animState.isBlinking = true;
        animState.blinkTimer = 3.0 + Math.random() * 3.5;
      }

      // Smooth Head Tracking Interpolation
      animState.headLookX += (animState.targetLookX - animState.headLookX) * 0.08;
      animState.headLookY += (animState.targetLookY - animState.headLookY) * 0.08;

      if (animState.petReaction > 0) {
        animState.petReaction = Math.max(0, animState.petReaction - delta * 0.85);
      }

      // Feelings State Classification
      const isHappy = activeMood === 'happy' || activeMood === 'excited' || animState.petReaction > 0;
      const isCalm = activeMood === 'calm' || activeMood === 'peaceful';
      const isSad = activeMood === 'sad';
      const isTired = activeMood === 'tired';
      const isOverwhelmed = activeMood === 'overwhelmed';
      const isEating = activeMood === 'eating' || isEatingRef.current;
      const isSniffing = activeMood === 'sniffing' || isSniffingRef.current;
      const isBathing = activeMood === 'bathing';
      const isSleeping = activeMood === 'sleeping';

      const shouldShowBowl = showBowlRef.current || isEating || isSniffing || activeMood === 'eating';
      bowlGroup.visible = shouldShowBowl;

      // 1. Eyelid Expressions
      if (isSleeping) {
        leftUpperLid.rotation.x = 0;
        rightUpperLid.rotation.x = 0;
        leftLowerLid.rotation.x = 0;
        rightLowerLid.rotation.x = 0;
      } else if (isHappy) {
        leftUpperLid.rotation.x = -0.3;
        rightUpperLid.rotation.x = -0.3;
        leftLowerLid.rotation.x = 0.28;
        rightLowerLid.rotation.x = 0.28;
      } else if (isSad) {
        leftUpperLid.rotation.x = -Math.PI * 0.48;
        rightUpperLid.rotation.x = -Math.PI * 0.48;
        leftLowerLid.rotation.x = Math.PI * 0.48;
        rightLowerLid.rotation.x = Math.PI * 0.48;
      } else if (isTired) {
        leftUpperLid.rotation.x = -0.16;
        rightUpperLid.rotation.x = -0.16;
        leftLowerLid.rotation.x = 0.12;
        rightLowerLid.rotation.x = 0.12;
      } else if (animState.isBlinking) {
        leftUpperLid.rotation.x = 0;
        rightUpperLid.rotation.x = 0;
        setTimeout(() => {
          animState.isBlinking = false;
        }, 110);
      } else {
        leftUpperLid.rotation.x = -Math.PI * 0.5;
        rightUpperLid.rotation.x = -Math.PI * 0.5;
        leftLowerLid.rotation.x = Math.PI * 0.5;
        rightLowerLid.rotation.x = Math.PI * 0.5;
      }

      // 2. Emotional Movement & Respiration Dynamics
      if (isHappy) {
        // Joyful Playful Puppy: Bouncy hops, panting, fast organic tail wag
        const happyHop = Math.abs(Math.sin(t * 7.5)) * 0.06;
        bodyGroup.position.y = 0.44 + happyHop;

        // 4-joint harmonic S-wave tail wag
        const wagFreq = 22;
        tailJoints.forEach((joint, idx) => {
          joint.rotation.y = Math.sin(t * wagFreq - idx * 0.35) * (0.35 + idx * 0.1);
        });

        // Panting head & tongue
        headGroup.position.set(0, 0.22 + happyHop * 0.7, 0.08);
        headGroup.rotation.set(
          animState.headLookX + Math.sin(t * 8) * 0.06,
          animState.headLookY + Math.sin(t * 6) * 0.06,
          Math.sin(t * 4) * 0.08
        );

        tongueGroup.scale.set(1, 1, 1);
        tongueGroup.rotation.y = Math.sin(t * 8) * 0.12;
        tongueGroup.position.y = 0.015 + Math.sin(t * 10) * 0.015;

        // Floppy ears spring
        if (isDog) {
          leftEarGroup.rotation.z = 0.12 + Math.sin(t * 14) * 0.15;
          rightEarGroup.rotation.z = -0.12 - Math.sin(t * 14) * 0.15;
        }

        frontLeftLeg.position.y = 0.34 + happyHop * 0.4;
        frontRightLeg.position.y = 0.34 + (Math.abs(Math.cos(t * 7.5)) * 0.03);

        if (Math.random() < 0.06) {
          spawnParticle(0, 1.0, 0, 'sparkle');
        }

        shadowDisc.scale.set(1 - happyHop * 1.2, 1 - happyHop * 1.2, 1);
        zenRing.material.opacity = 0;
      } else if (isCalm) {
        // Serene Diaphragmatic Breathing: chest expands softly
        const breathCycle = Math.sin(t * 1.6);
        const breath = breathCycle * 0.025;

        chestMesh.scale.set(0.96 + breath * 0.6, 1.12 + breath * 0.5, 1.15 - breath * 0.3);
        bodyGroup.position.y = 0.44 + breath * 0.3;

        headGroup.position.set(0, 0.22 + breath * 0.4, 0.08);
        headGroup.rotation.set(
          animState.headLookX + breath * 0.04,
          animState.headLookY,
          Math.sin(t * 0.8) * 0.025
        );

        // Gentle slow floor-tap tail
        tailJoints.forEach((joint, idx) => {
          joint.rotation.y = Math.sin(t * 3.2 - idx * 0.3) * (0.12 + idx * 0.04);
        });

        tongueGroup.scale.set(0.001, 0.001, 0.001);

        leftEarGroup.rotation.set(0, 0, 0.04);
        rightEarGroup.rotation.set(0, 0, -0.04);

        zenRing.material.opacity = 0.32 + (breathCycle + 1) * 0.18;
        zenRing.scale.set(1 + breath * 1.1, 1 + breath * 1.1, 1);
      } else if (isSad) {
        // Empathetic comforting posture: head lowers gently, soulful upward puppy gaze
        const sighBreath = Math.sin(t * 1.2);
        const sigh = sighBreath * 0.015;

        bodyGroup.position.set(0, 0.42, 0.06);
        chestMesh.scale.set(0.98 + sigh, 1.1, 1.14);

        headGroup.position.set(0, 0.18, 0.12);
        headGroup.rotation.set(
          -0.08 + sigh * 0.04,
          animState.headLookY * 0.5,
          0.12 // sweet empathetic head tilt
        );

        if (isDog) {
          leftEarGroup.rotation.set(0.12, 0, -0.12);
          rightEarGroup.rotation.set(0.12, 0, 0.12);
        }

        tailJoints.forEach((joint, idx) => {
          joint.rotation.y = Math.sin(t * 3.4 - idx * 0.35) * (0.14 + idx * 0.04);
        });

        tongueGroup.scale.set(0.001, 0.001, 0.001);
        zenRing.material.opacity = 0;
      } else if (isOverwhelmed) {
        // Mindful Box Breathing Grounding: exactly 4.0s Inhale -> 4.0s Exhale
        const boxPhase = (t % 8.0) / 8.0;
        const boxExpand = boxPhase < 0.5 ? boxPhase / 0.5 : 1.0 - ((boxPhase - 0.5) / 0.5);
        const smoothBox = (1 - Math.cos(boxExpand * Math.PI)) / 2;

        bodyGroup.position.set(0, 0.44 + smoothBox * 0.03, 0);
        chestMesh.scale.set(0.96 + smoothBox * 0.08, 1.12 + smoothBox * 0.06, 1.15);

        headGroup.position.set(0, 0.22 + smoothBox * 0.04, 0.08);
        headGroup.rotation.set(animState.headLookX * 0.35, animState.headLookY * 0.35, 0);

        tailJoints.forEach((joint) => {
          joint.rotation.set(0.15, 0, 0);
        });

        tongueGroup.scale.set(0.001, 0.001, 0.001);

        zenRing.material.opacity = 0.25 + smoothBox * 0.6;
        zenRing.scale.set(1.0 + smoothBox * 0.3, 1.0 + smoothBox * 0.3, 1);
      } else if (isTired) {
        // Sleepy Yawn & Rest
        const tiredSway = Math.sin(t * 1.4) * 0.015;
        bodyGroup.position.set(0, 0.42, 0);

        const yawnCycle = (t % 9.0);
        if (yawnCycle > 6.0 && yawnCycle < 8.2) {
          const yp = Math.sin(((yawnCycle - 6.0) / 2.2) * Math.PI);
          headGroup.position.set(0, 0.2 + yp * 0.05, 0.1);
          headGroup.rotation.set(0.2 * yp, 0, 0);
          tongueGroup.scale.set(yp * 1.05, yp * 1.05, yp * 1.05);
        } else {
          headGroup.position.set(0, 0.18 + tiredSway, 0.1);
          headGroup.rotation.set(0.1, animState.headLookY * 0.5, 0);
          tongueGroup.scale.set(0.001, 0.001, 0.001);
        }

        tailJoints.forEach((joint, idx) => {
          joint.rotation.y = Math.sin(t * 1.8 - idx * 0.3) * (0.06 + idx * 0.02);
        });
        zenRing.material.opacity = 0;
      } else if (isSleeping) {
        // Curled Sleep
        const sleepBreath = Math.sin(t * 1.5) * 0.03;
        bodyGroup.position.set(0, 0.38, 0);
        chestMesh.scale.set(1.0 + sleepBreath * 0.4, 1.0 - sleepBreath * 0.2, 1.12 + sleepBreath * 0.3);

        headGroup.position.set(0.1, 0.12, 0.14);
        headGroup.rotation.set(0.28, 0.18, 0.14);

        tailJoints.forEach((joint) => {
          joint.rotation.set(0.06, 0, 0);
        });
        tongueGroup.scale.set(0.001, 0.001, 0.001);
        zenRing.material.opacity = 0;
      } else if (isBathing) {
        // Wet Dog Shake
        const shakeCycle = Math.sin(t * 26);
        bodyGroup.rotation.y = shakeCycle * 0.16;
        headGroup.rotation.y = -shakeCycle * 0.24;
        headGroup.rotation.z = Math.sin(t * 14) * 0.1;

        if (isDog) {
          leftEarGroup.rotation.z = 0.2 + Math.sin(t * 26) * 0.3;
          rightEarGroup.rotation.z = -0.2 - Math.sin(t * 26) * 0.3;
        }

        tailJoints.forEach((joint) => {
          joint.rotation.y = -shakeCycle * 0.35;
        });

        if (Math.random() < 0.25) spawnBubble();
        zenRing.material.opacity = 0;
      } else if (isEating) {
        // Deep realistic 3D eating dive into the 3D food bowl!
        const chewSpeed = t * 16;
        const chewBob = Math.sin(chewSpeed) * 0.035;
        const headDips = 0.46 + Math.sin(t * 8) * 0.08;

        // Head dips down directly over the 3D ceramic bowl!
        headGroup.position.set(0, 0.07 + chewBob, 0.32);
        headGroup.rotation.set(headDips, Math.sin(t * 6) * 0.05, Math.sin(t * 8) * 0.04);

        // Jaw rhythmically chews & mouth opens/closes
        jawGroup.rotation.x = -0.15 - Math.abs(Math.sin(chewSpeed)) * 0.22;
        tongueGroup.scale.set(0.9, 0.9, 0.9);
        tongueGroup.position.set(0, -0.015 + Math.sin(chewSpeed) * 0.02, 0.08);

        // Tail wags with high happiness in an energetic S-curve!
        tailJoints.forEach((joint, idx) => {
          joint.rotation.y = Math.sin(t * 22 - idx * 0.35) * (0.35 + idx * 0.08);
          joint.rotation.x = 0.18 + Math.sin(t * 12) * 0.08;
        });

        // Little happy food crumbs / crunch sparkles pop up from the bowl!
        if (Math.random() < 0.14) {
          spawnParticle(
            (Math.random() - 0.5) * 0.16,
            0.12 + Math.random() * 0.22,
            0.42 + (Math.random() - 0.5) * 0.16,
            Math.random() < 0.4 ? 'heart' : 'sparkle'
          );
        }
        zenRing.material.opacity = 0;
      } else if (isSniffing) {
        // The pet smells food! Head reaches forward, nose wiggles, ears perk up, tail wags in high excitement!
        const sniffTwitch = Math.sin(t * 24) * 0.02;
        headGroup.position.set(0, 0.26 + sniffTwitch, 0.16);
        headGroup.rotation.set(-0.12 + Math.sin(t * 10) * 0.05, animState.headLookY * 0.6, 0);

        // Nose twitch
        snoutGroup.position.y = sniffTwitch * 0.5;

        // Ears perk forward in eager anticipation
        if (isDog) {
          leftEarGroup.rotation.set(-0.18, 0, 0.08);
          rightEarGroup.rotation.set(-0.18, 0, -0.08);
        } else {
          leftEarGroup.rotation.set(-0.25, 0, 0.1);
          rightEarGroup.rotation.set(-0.25, 0, -0.1);
        }

        // Happy mouth slightly open, tongue panting
        tongueGroup.scale.set(0.65, 0.65, 0.65);
        tongueGroup.position.y = 0.01 + Math.sin(t * 14) * 0.01;

        // Eager tail wagging
        tailJoints.forEach((joint, idx) => {
          joint.rotation.y = Math.sin(t * 18 - idx * 0.35) * (0.28 + idx * 0.06);
        });

        // Little sparkle of excitement
        if (Math.random() < 0.08) {
          spawnParticle(0, 0.7, 0.2, 'sparkle');
        }
        zenRing.material.opacity = 0;
      } else {
        // Natural Living Idle: gentle breathing, direct warm eye contact
        const breath = Math.sin(t * 2.0) * 0.018;
        bodyGroup.position.set(0, 0.44 + breath, 0);
        chestMesh.scale.set(0.96 + breath * 0.4, 1.12 + breath * 0.5, 1.15 - breath * 0.2);

        headGroup.position.set(0, 0.22 + breath * 0.5, 0.08);
        headGroup.rotation.set(
          animState.headLookX + Math.sin(t * 1.5) * 0.02,
          animState.headLookY,
          Math.sin(t * 1.1) * 0.025
        );

        tailJoints.forEach((joint, idx) => {
          joint.rotation.y = Math.sin(t * 4.2 - idx * 0.35) * (0.18 + idx * 0.06);
        });

        tongueGroup.scale.set(0.001, 0.001, 0.001);

        if (Math.sin(t * 3.2) > 0.95 && isDog) {
          leftEarGroup.rotation.z = 0.18;
        } else {
          leftEarGroup.rotation.set(0, 0, 0);
          rightEarGroup.rotation.set(0, 0, 0);
        }

        zenRing.material.opacity = 0;
      }

      // 3. Particle Updates
      for (let i = particlesGroup.children.length - 1; i >= 0; i--) {
        const p = particlesGroup.children[i] as THREE.Mesh;
        p.position.y += p.userData.vy;
        p.position.x += Math.sin(t * 5 + i) * 0.003;
        p.rotation.z += p.userData.rotSpd;
        p.userData.life -= delta * 0.85;
        (p.material as THREE.MeshBasicMaterial).opacity = Math.max(0, p.userData.life);
        if (p.userData.life <= 0) particlesGroup.remove(p);
      }

      for (let i = bubblesGroup.children.length - 1; i >= 0; i--) {
        const b = bubblesGroup.children[i] as THREE.Mesh;
        b.position.y += b.userData.vy;
        b.position.x += b.userData.vx;
        b.userData.life -= delta * 0.7;
        (b.material as THREE.MeshStandardMaterial).opacity = Math.max(0, b.userData.life * 0.65);
        if (b.userData.life <= 0) bubblesGroup.remove(b);
      }

      // Smooth Orbit Camera Interpolation
      const targetCamX = Math.sin(animState.orbitAngle) * 3.2;
      const targetCamZ = Math.cos(animState.orbitAngle) * 3.2;
      const targetCamY = 0.95 + animState.orbitPitch * 1.5;
      camera.position.x += (targetCamX - camera.position.x) * 0.1;
      camera.position.y += (targetCamY - camera.position.y) * 0.1;
      camera.position.z += (targetCamZ - camera.position.z) * 0.1;
      camera.lookAt(0, 0.58, 0);

      renderer.render(scene, camera);
    };

    animate();

    const handleResize = () => {
      if (!container) return;
      const newW = container.clientWidth || 320;
      const newH = container.clientHeight || 320;
      camera.aspect = newW / newH;
      camera.updateProjectionMatrix();
      renderer.setSize(newW, newH);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      cancelAnimationFrame(reqId);
      window.removeEventListener('resize', handleResize);
      container.removeEventListener('mousedown', handlePointerDown);
      window.removeEventListener('mousemove', handlePointerMove);
      window.removeEventListener('mouseup', handlePointerUp);
      container.removeEventListener('touchstart', handlePointerDown);
      window.removeEventListener('touchmove', handlePointerMove);
      window.removeEventListener('touchend', handlePointerUp);
      renderer.dispose();
    };
  }, [species, timeOfDay]);

  useEffect(() => {
    if (!sceneRef.current) return;
    const { salakotHat, beanieHat, sunglasses, cozyScarf, collar } = sceneRef.current;
    if (salakotHat) salakotHat.visible = equipped.hat === 'salakot';
    if (beanieHat) beanieHat.visible = equipped.hat === 'beanie';
    if (sunglasses) sunglasses.visible = !!equipped.glasses;
    if (cozyScarf) cozyScarf.visible = !!equipped.scarf;
    if (collar) collar.visible = !!equipped.collar;
  }, [equipped]);

  const dimensions = {
    sm: 'w-24 h-24 min-h-[96px]',
    md: 'w-44 h-44 min-h-[176px]',
    lg: 'w-64 h-64 sm:w-72 sm:h-72 min-h-[256px]',
    hero: 'w-72 h-72 sm:w-84 sm:h-84 min-h-[288px]',
  }[size] || 'w-64 h-64 min-h-[256px]';

  return (
    <div className={`relative select-none ${dimensions} ${className}`}>
      <div ref={mountRef} className="w-full h-full cursor-grab active:cursor-grabbing" />
    </div>
  );
};
