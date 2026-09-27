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
// High-Fidelity Procedural Fur, Eye, Nose & Blush Texture Generators
// ---------------------------------------------------------------------------

function createRealisticFurTexture(isDog: boolean): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext('2d')!;

  // Warm Golden Retriever coat base gradient (rich honey amber)
  const grad = ctx.createLinearGradient(0, 0, 0, 1024);
  if (isDog) {
    grad.addColorStop(0, '#f2a949');    // Radiant golden honey
    grad.addColorStop(0.35, '#e49432'); // Warm amber
    grad.addColorStop(0.7, '#cc7b20');  // Rich caramel
    grad.addColorStop(1, '#9b5310');    // Deep warm chestnut shadow
  } else {
    grad.addColorStop(0, '#fca855');
    grad.addColorStop(0.4, '#e68733');
    grad.addColorStop(0.75, '#c96a1e');
    grad.addColorStop(1, '#9e460d');
  }
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 1024, 1024);

  // Layer 1: Directional micro-hair fibers (dense velvety undercoat)
  ctx.fillStyle = 'rgba(255, 245, 220, 0.09)';
  for (let i = 0; i < 24000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 3 + Math.random() * 7;
    ctx.fillRect(x, y, 1.2, len);
  }

  // Layer 2: Deep shadow fibers for depth and tactile softness
  ctx.fillStyle = 'rgba(70, 30, 5, 0.08)';
  for (let i = 0; i < 18000; i++) {
    const x = Math.random() * 1024;
    const y = Math.random() * 1024;
    const len = 3 + Math.random() * 6;
    ctx.fillRect(x, y, 1.1, len);
  }

  // Layer 3: Soft golden highlights on guard hairs
  ctx.fillStyle = 'rgba(255, 255, 235, 0.14)';
  for (let i = 0; i < 10000; i++) {
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
  ctx.fillStyle = '#0f0a07';
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
    irisGrad.addColorStop(0, '#542c0c');
    irisGrad.addColorStop(0.3, '#854514');
    irisGrad.addColorStop(0.65, '#bc6d1e');
    irisGrad.addColorStop(0.88, '#e49232');
    irisGrad.addColorStop(1, '#3b1c05');
  } else {
    irisGrad.addColorStop(0, '#3e6220');
    irisGrad.addColorStop(0.35, '#71a12e');
    irisGrad.addColorStop(0.75, '#a7d142');
    irisGrad.addColorStop(1, '#22380d');
  }
  ctx.fillStyle = irisGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, radius - 18, 0, Math.PI * 2);
  ctx.fill();

  // Fine radial iris striations
  ctx.strokeStyle = isDog ? 'rgba(255, 230, 170, 0.28)' : 'rgba(235, 255, 180, 0.3)';
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
  ctx.fillStyle = '#050302';
  ctx.beginPath();
  if (isDog) {
    ctx.arc(cx, cy, 94, 0, Math.PI * 2);
  } else {
    ctx.ellipse(cx, cy, 40, 128, 0, 0, Math.PI * 2);
  }
  ctx.fill();

  // Primary moist glossy catchlight (upper right)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.beginPath();
  ctx.arc(cx + 44, cy - 52, 38, 0, Math.PI * 2);
  ctx.fill();

  // Secondary soft ambient catchlight (lower left)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.62)';
  ctx.beginPath();
  ctx.arc(cx - 48, cy + 46, 18, 0, Math.PI * 2);
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

  // Leathery cobblestone bump pattern
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
  gloss.addColorStop(0, 'rgba(255, 255, 255, 0.35)');
  gloss.addColorStop(0.5, 'rgba(255, 255, 255, 0.12)');
  gloss.addColorStop(1, 'rgba(255, 255, 255, 0)');
  ctx.fillStyle = gloss;
  ctx.beginPath();
  ctx.ellipse(256, 140, 130, 50, 0, 0, Math.PI * 2);
  ctx.fill();

  const texture = new THREE.CanvasTexture(canvas);
  return texture;
}

// Soft Airbrushed Cheek Blush (Radial Gradient)
function createBlushTexture(): THREE.CanvasTexture {
  const canvas = document.createElement('canvas');
  canvas.width = 256;
  canvas.height = 256;
  const ctx = canvas.getContext('2d')!;

  const grad = ctx.createRadialGradient(128, 128, 0, 128, 128, 128);
  grad.addColorStop(0, 'rgba(255, 95, 120, 0.88)');
  grad.addColorStop(0.35, 'rgba(255, 115, 138, 0.55)');
  grad.addColorStop(0.7, 'rgba(255, 140, 160, 0.18)');
  grad.addColorStop(1.0, 'rgba(255, 160, 175, 0.0)');

  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, 256, 256);

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
    bandanaGroup: THREE.Group;
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

    // Perfectly framed camera: whole dog is 100% visible, no cut-offs at top of head or bottom
    const camera = new THREE.PerspectiveCamera(36, width / height, 0.1, 50);
    camera.position.set(0, 0.46, 2.7);
    camera.lookAt(0, 0.42, 0);

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
    renderer.toneMappingExposure = 1.08;

    container.replaceChildren(renderer.domElement);

    // --- Warm Studio Lighting ---
    const isNight = timeOfDay === 'night';
    const isSunset = timeOfDay === 'sunset';

    const ambientLight = new THREE.AmbientLight(
      isNight ? 0xa5b4fc : isSunset ? 0xfef08a : 0xfffaf0,
      isNight ? 1.15 : isSunset ? 1.45 : 1.5
    );
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(
      isNight ? 0xc7d2fe : isSunset ? 0xfb923c : 0xfffbeb,
      isNight ? 1.15 : 1.7
    );
    keyLight.position.set(1.8, 3.5, 2.6);
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

    const rimLight = new THREE.DirectionalLight(
      isNight ? 0x818cf8 : isSunset ? 0xf472b6 : 0xfde68a,
      0.9
    );
    rimLight.position.set(-2.0, 2.2, -2.4);
    scene.add(rimLight);

    const bounceLight = new THREE.DirectionalLight(0xe4f9dc, 0.4);
    bounceLight.position.set(0, -2, 1);
    scene.add(bounceLight);

    // -----------------------------------------------------------------------
    // Contact Shadow & Zen Ring
    // -----------------------------------------------------------------------
    const groundGroup = new THREE.Group();

    const shadowGeo = new THREE.CircleGeometry(0.68, 32);
    const shadowMat = new THREE.MeshBasicMaterial({
      color: 0x0a140d,
      transparent: true,
      opacity: isNight ? 0.32 : 0.24,
    });
    const shadowDisc = new THREE.Mesh(shadowGeo, shadowMat);
    shadowDisc.rotation.x = -Math.PI / 2;
    shadowDisc.position.y = 0.005;
    groundGroup.add(shadowDisc);

    // Mindful Grounding Ring
    const zenRingGeo = new THREE.RingGeometry(0.74, 0.84, 48);
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
    // Anatomical Canine / Feline Sculpting (NO TAIL)
    // -----------------------------------------------------------------------
    const petGroup = new THREE.Group();
    const isDog = species === 'dog';

    // Procedural Textures
    const furTexture = createRealisticFurTexture(isDog);
    const eyeTexture = createRealisticEyeTexture(isDog);
    const noseTexture = createRealisticNoseTexture();
    const blushTexture = createBlushTexture();

    // PBR Materials
    const furMaterial = new THREE.MeshStandardMaterial({
      map: furTexture,
      bumpMap: furTexture,
      bumpScale: 0.008,
      roughness: 0.68,
      metalness: 0.02,
    });

    const creamFurMaterial = new THREE.MeshStandardMaterial({
      color: 0xfdf4e4,
      roughness: 0.78,
      metalness: 0.02,
    });

    const darkEarFurMaterial = new THREE.MeshStandardMaterial({
      color: isDog ? 0xb56c1d : 0xab5010,
      map: furTexture,
      roughness: 0.74,
      metalness: 0.02,
    });

    const noseMaterial = new THREE.MeshStandardMaterial({
      color: isDog ? 0x18120e : 0xe88a9c,
      bumpMap: noseTexture,
      bumpScale: 0.03,
      roughness: 0.22,
      metalness: 0.08,
    });

    const eyeCorneaMaterial = new THREE.MeshStandardMaterial({
      map: eyeTexture,
      roughness: 0.03,
      metalness: 0.12,
    });

    const pawPadMaterial = new THREE.MeshStandardMaterial({
      color: 0x241812,
      roughness: 0.65,
    });

    // --- Body Group (Chubby, seated companion torso) ---
    const bodyGroup = new THREE.Group();
    bodyGroup.position.set(0, 0.30, 0);

    // Torso: Plump cuddly companion body
    const torsoGeo = new THREE.SphereGeometry(0.33, 32, 28);
    torsoGeo.scale(0.96, 1.05, 0.95);
    const chestMesh = new THREE.Mesh(torsoGeo, furMaterial);
    chestMesh.castShadow = true;
    chestMesh.receiveShadow = true;
    bodyGroup.add(chestMesh);

    // Soft Cream Chest Fluff (peeks out under bandana)
    const chestFluffGeo = new THREE.SphereGeometry(0.24, 24, 20);
    chestFluffGeo.scale(0.74, 0.88, 0.44);
    const chestFluff = new THREE.Mesh(chestFluffGeo, creamFurMaterial);
    chestFluff.position.set(0, -0.02, 0.17);
    bodyGroup.add(chestFluff);

    // --- Neck & Head Articulation ---
    const neckGroup = new THREE.Group();
    neckGroup.position.set(0, 0.25, 0.05);
    bodyGroup.add(neckGroup);

    const headGroup = new THREE.Group();
    headGroup.position.set(0, 0.23, 0.06);
    neckGroup.add(headGroup);

    // Sculpted Head Cranium (Warm golden honey, chubby cheeks)
    const skullGeo = new THREE.SphereGeometry(0.31, 32, 28);
    skullGeo.scale(1.08, 0.96, 1.0);
    const skullMesh = new THREE.Mesh(skullGeo, furMaterial);
    skullMesh.castShadow = true;
    headGroup.add(skullMesh);

    // Soft Airbrushed Rosy Cheeks (Radial gradient blush)
    const blushMat = new THREE.MeshBasicMaterial({
      map: blushTexture,
      transparent: true,
      opacity: 0.88,
      depthWrite: false,
    });
    const blushGeo = new THREE.CircleGeometry(0.085, 24);

    const leftBlush = new THREE.Mesh(blushGeo, blushMat);
    leftBlush.position.set(-0.20, -0.04, 0.23);
    leftBlush.rotation.set(-0.05, -0.32, 0);
    headGroup.add(leftBlush);

    const rightBlush = leftBlush.clone();
    rightBlush.position.x = 0.20;
    rightBlush.rotation.set(-0.05, 0.32, 0);
    headGroup.add(rightBlush);

    // Expressive Warm Puppy Eyebrows (above eyes for soulful gaze)
    if (isDog) {
      const browMat = new THREE.MeshBasicMaterial({ color: 0x6e3d15 });
      const browGeo = new THREE.CylinderGeometry(0.011, 0.007, 0.07, 8);
      browGeo.rotateZ(Math.PI * 0.5);

      const leftBrow = new THREE.Mesh(browGeo, browMat);
      leftBrow.position.set(-0.115, 0.145, 0.26);
      leftBrow.rotation.set(0.12, 0.14, -0.24);
      headGroup.add(leftBrow);

      const rightBrow = new THREE.Mesh(browGeo, browMat);
      rightBrow.position.set(0.115, 0.145, 0.26);
      rightBrow.rotation.set(0.12, -0.14, 0.24);
      headGroup.add(rightBrow);
    }

    // --- Muzzle & Button Nose ---
    const snoutGroup = new THREE.Group();
    snoutGroup.position.set(0, -0.015, 0.20);
    headGroup.add(snoutGroup);

    if (isDog) {
      // Upper Muzzle Pad (sits strictly above mouth so mouth is never blocked!)
      const muzzleGeo = new THREE.SphereGeometry(0.088, 20, 16);
      muzzleGeo.scale(1.15, 0.65, 0.85);
      const muzzle = new THREE.Mesh(muzzleGeo, creamFurMaterial);
      muzzle.position.set(0, 0.02, 0.02);
      snoutGroup.add(muzzle);

      // Truffle Black Button Nose
      const noseGeo = new THREE.SphereGeometry(0.044, 20, 16);
      noseGeo.scale(1.22, 0.82, 0.85);
      const noseMesh = new THREE.Mesh(noseGeo, noseMaterial);
      noseMesh.position.set(0, 0.045, 0.085);
      snoutGroup.add(noseMesh);

      // Nostrils
      const nostrilMat = new THREE.MeshBasicMaterial({ color: 0x050302 });
      const nostrilGeo = new THREE.SphereGeometry(0.010, 8, 8);
      const leftNostril = new THREE.Mesh(nostrilGeo, nostrilMat);
      leftNostril.position.set(-0.020, 0.042, 0.115);
      snoutGroup.add(leftNostril);

      const rightNostril = leftNostril.clone();
      rightNostril.position.x = 0.020;
      snoutGroup.add(rightNostril);
    } else {
      // Cat Muzzle Pads
      const catPadGeo = new THREE.SphereGeometry(0.075, 18, 14);
      catPadGeo.scale(1.0, 0.82, 0.78);
      const leftPad = new THREE.Mesh(catPadGeo, creamFurMaterial);
      leftPad.position.set(-0.045, 0.01, 0.05);
      snoutGroup.add(leftPad);

      const rightPad = leftPad.clone();
      rightPad.position.x = 0.045;
      snoutGroup.add(rightPad);

      // Cat Button Pink Nose
      const catNoseGeo = new THREE.ConeGeometry(0.032, 0.030, 12);
      catNoseGeo.rotateX(Math.PI);
      const catNose = new THREE.Mesh(catNoseGeo, noseMaterial);
      catNose.position.set(0, 0.03, 0.10);
      snoutGroup.add(catNose);

      // Whiskers (3 on each side)
      const whiskerMat = new THREE.MeshBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.85 });
      const whiskerGeo = new THREE.CylinderGeometry(0.003, 0.002, 0.20, 6);
      whiskerGeo.rotateZ(Math.PI * 0.5);
      [-0.08, 0, 0.08].forEach((angle, i) => {
        const leftW = new THREE.Mesh(whiskerGeo, whiskerMat);
        leftW.position.set(-0.14, 0.01 + (i - 1) * 0.02, 0.07);
        leftW.rotation.set(0, 0.25, angle);
        snoutGroup.add(leftW);

        const rightW = new THREE.Mesh(whiskerGeo, whiskerMat);
        rightW.position.set(0.14, 0.01 + (i - 1) * 0.02, 0.07);
        rightW.rotation.set(0, -0.25, -angle);
        snoutGroup.add(rightW);
      });
    }

    // --- Joyful Open Smiling Mouth & Pink Tongue (100% VISIBLE!) ---
    const jawGroup = new THREE.Group();
    jawGroup.position.set(0, -0.05, 0.22);
    headGroup.add(jawGroup);

    // Mouth Cavity (Dark smiling crescent opening)
    const mouthShape = new THREE.Shape();
    mouthShape.moveTo(-0.085, 0.018);
    mouthShape.quadraticCurveTo(0, 0.032, 0.085, 0.018);
    mouthShape.quadraticCurveTo(0.075, -0.062, 0, -0.075);
    mouthShape.quadraticCurveTo(-0.075, -0.062, -0.085, 0.018);

    const mouthGeo = new THREE.ShapeGeometry(mouthShape);
    const mouthMat = new THREE.MeshBasicMaterial({ color: 0x1f070c, side: THREE.DoubleSide });
    const mouthMesh = new THREE.Mesh(mouthGeo, mouthMat);
    mouthMesh.position.set(0, 0, 0.055);
    mouthMesh.rotation.x = -0.08;
    jawGroup.add(mouthMesh);

    // Bright Pink Puppy Tongue resting happily in the smile
    const tongueGroup = new THREE.Group();
    tongueGroup.position.set(0, -0.015, 0.065);

    const tongueShape = new THREE.Shape();
    tongueShape.moveTo(-0.046, 0.010);
    tongueShape.quadraticCurveTo(0, 0.020, 0.046, 0.010);
    tongueShape.quadraticCurveTo(0.042, -0.050, 0, -0.060);
    tongueShape.quadraticCurveTo(-0.042, -0.050, -0.046, 0.010);

    const tongueGeo = new THREE.ShapeGeometry(tongueShape);
    const tongueMat = new THREE.MeshStandardMaterial({
      color: 0xff5277,
      roughness: 0.28,
      side: THREE.DoubleSide,
    });
    const tongueMesh = new THREE.Mesh(tongueGeo, tongueMat);
    tongueMesh.position.set(0, 0, 0.005);
    tongueMesh.rotation.x = -0.06;
    tongueGroup.add(tongueMesh);
    jawGroup.add(tongueGroup);

    // Upper smile lip contour
    const upperLipGeo = new THREE.TorusGeometry(0.076, 0.007, 8, 20, Math.PI);
    upperLipGeo.rotateX(Math.PI);
    const upperLipMat = new THREE.MeshBasicMaterial({ color: 0x180b06 });
    const upperLip = new THREE.Mesh(upperLipGeo, upperLipMat);
    upperLip.position.set(0, 0.018, 0.060);
    jawGroup.add(upperLip);

    // Tiny white corner teeth peeks
    const toothMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
    const toothGeo = new THREE.SphereGeometry(0.009, 8, 8);
    const leftTooth = new THREE.Mesh(toothGeo, toothMat);
    leftTooth.position.set(-0.042, 0.008, 0.062);
    jawGroup.add(leftTooth);

    const rightTooth = leftTooth.clone();
    rightTooth.position.x = 0.042;
    jawGroup.add(rightTooth);

    // Cream Lower Chin (under mouth)
    const chinGeo = new THREE.SphereGeometry(0.06, 16, 12);
    chinGeo.scale(1.0, 0.6, 0.75);
    const chin = new THREE.Mesh(chinGeo, creamFurMaterial);
    chin.position.set(0, -0.055, 0.035);
    jawGroup.add(chin);

    // --- Soulful Anime / Pixar Eyes with Catchlights ---
    const eyeGeo = new THREE.SphereGeometry(0.072, 24, 20);

    // Left Eye
    const leftEyeGroup = new THREE.Group();
    leftEyeGroup.position.set(-0.125, 0.055, 0.235);
    leftEyeGroup.rotation.y = -0.06;
    const leftEyeMesh = new THREE.Mesh(eyeGeo, eyeCorneaMaterial);
    leftEyeMesh.rotation.y = 0;
    leftEyeGroup.add(leftEyeMesh);
    headGroup.add(leftEyeGroup);

    // Right Eye
    const rightEyeGroup = new THREE.Group();
    rightEyeGroup.position.set(0.125, 0.055, 0.235);
    rightEyeGroup.rotation.y = 0.06;
    const rightEyeMesh = new THREE.Mesh(eyeGeo, eyeCorneaMaterial);
    rightEyeMesh.rotation.y = 0;
    rightEyeGroup.add(rightEyeMesh);
    headGroup.add(rightEyeGroup);

    // Eyelids (Upper and Lower for fluid blinking)
    const upperLidGeo = new THREE.SphereGeometry(0.079, 20, 12, 0, Math.PI * 2, 0, Math.PI * 0.5);
    const lowerLidGeo = new THREE.SphereGeometry(0.078, 20, 12, 0, Math.PI * 2, Math.PI * 0.5, Math.PI * 0.5);

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

    // --- Floppy Puppy Ears / Cat Ears ---
    const leftEarGroup = new THREE.Group();
    const rightEarGroup = new THREE.Group();

    if (isDog) {
      // Natural, silky floppy golden ears that drape forward to frame the cheeks!
      leftEarGroup.position.set(-0.24, 0.14, 0.03);
      rightEarGroup.position.set(0.24, 0.14, 0.03);

      const earGeo = new THREE.SphereGeometry(0.125, 22, 18);
      earGeo.scale(0.85, 1.70, 0.38);

      const earL = new THREE.Mesh(earGeo, darkEarFurMaterial);
      earL.position.set(-0.04, -0.13, 0.02);
      earL.rotation.set(0.15, 0.18, 0.15);
      leftEarGroup.add(earL);

      const earR = new THREE.Mesh(earGeo, darkEarFurMaterial);
      earR.position.set(0.04, -0.13, 0.02);
      earR.rotation.set(0.15, -0.18, -0.15);
      rightEarGroup.add(earR);
    } else {
      // Pointed, perky cat ears
      leftEarGroup.position.set(-0.19, 0.22, 0.02);
      rightEarGroup.position.set(0.19, 0.22, 0.02);

      const catEarGeo = new THREE.ConeGeometry(0.12, 0.22, 16);
      catEarGeo.scale(1.0, 1.0, 0.45);
      const leftCatEar = new THREE.Mesh(catEarGeo, furMaterial);
      leftCatEar.rotation.z = 0.24;
      leftCatEar.rotation.x = -0.12;
      leftEarGroup.add(leftCatEar);

      const earInnerMat = new THREE.MeshStandardMaterial({ color: 0xfca5a5, roughness: 0.88 });
      const catInnerGeo = new THREE.ConeGeometry(0.085, 0.17, 12);
      catInnerGeo.scale(1.0, 1.0, 0.35);
      const leftInner = new THREE.Mesh(catInnerGeo, earInnerMat);
      leftInner.rotation.z = 0.24;
      leftInner.rotation.x = -0.12;
      leftInner.position.set(0, -0.01, 0.02);
      leftEarGroup.add(leftInner);

      const rightCatEar = new THREE.Mesh(catEarGeo, furMaterial);
      rightCatEar.rotation.z = -0.24;
      rightCatEar.rotation.x = -0.12;
      rightEarGroup.add(rightCatEar);

      const rightInner = new THREE.Mesh(catInnerGeo, earInnerMat);
      rightInner.rotation.z = -0.24;
      rightInner.rotation.x = -0.12;
      rightInner.position.set(0, -0.01, 0.02);
      rightEarGroup.add(rightInner);
    }

    headGroup.add(leftEarGroup);
    headGroup.add(rightEarGroup);

    // -----------------------------------------------------------------------
    // Signature Green Bandana with 100% VISIBLE White Sprout Emblem
    // -----------------------------------------------------------------------
    const bandanaGroup = new THREE.Group();
    bandanaGroup.position.set(0, 0.06, 0.02);

    const bandanaMat = new THREE.MeshStandardMaterial({
      color: 0x48bb37, // Fresh soothing Hangin Green
      roughness: 0.65,
      side: THREE.DoubleSide,
    });

    // Folded Band Collar around neck
    const bandCollarGeo = new THREE.TorusGeometry(0.24, 0.036, 14, 28);
    bandCollarGeo.scale(1.0, 0.75, 1.0);
    bandCollarGeo.rotateX(Math.PI * 0.5);
    const bandCollar = new THREE.Mesh(bandCollarGeo, bandanaMat);
    bandCollar.position.set(0, 0.02, 0.02);
    bandanaGroup.add(bandCollar);

    // Triangular Bandana Bib extending down chest
    const bibShape = new THREE.Shape();
    bibShape.moveTo(-0.16, 0.03);
    bibShape.lineTo(0.16, 0.03);
    bibShape.quadraticCurveTo(0.14, -0.10, 0, -0.22); // pointed bottom tip
    bibShape.quadraticCurveTo(-0.14, -0.10, -0.16, 0.03);

    const bibGeo = new THREE.ShapeGeometry(bibShape);
    const bibMesh = new THREE.Mesh(bibGeo, bandanaMat);
    bibMesh.position.set(0, -0.01, 0.22);
    bibMesh.rotation.set(-0.20, 0, 0);
    bibMesh.castShadow = true;
    bandanaGroup.add(bibMesh);

    // Crisp White Hangin Sprout Logo (3D Mesh on front of Bandana - 100% Guaranteed Visible!)
    const whiteLogoMat = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide });

    // Sprout Stem
    const sproutStemGeo = new THREE.CylinderGeometry(0.006, 0.006, 0.055, 10);
    const sproutStem = new THREE.Mesh(sproutStemGeo, whiteLogoMat);
    sproutStem.position.set(0, -0.08, 0.235);
    sproutStem.rotation.set(-0.20, 0, 0);
    bandanaGroup.add(sproutStem);

    // Sprout Left Leaf
    const sproutLeftLeafGeo = new THREE.SphereGeometry(0.024, 14, 10);
    sproutLeftLeafGeo.scale(1.3, 0.65, 0.25);
    const sproutLeftLeaf = new THREE.Mesh(sproutLeftLeafGeo, whiteLogoMat);
    sproutLeftLeaf.position.set(-0.026, -0.062, 0.236);
    sproutLeftLeaf.rotation.set(-0.20, 0, -0.62);
    bandanaGroup.add(sproutLeftLeaf);

    // Sprout Right Leaf
    const sproutRightLeaf = new THREE.Mesh(sproutLeftLeafGeo, whiteLogoMat);
    sproutRightLeaf.position.set(0.026, -0.062, 0.236);
    sproutRightLeaf.rotation.set(-0.20, 0, 0.62);
    bandanaGroup.add(sproutRightLeaf);

    neckGroup.add(bandanaGroup);

    // --- Chubby Forelegs & Soft Defined Rounded Paws ---
    const frontLeftLeg = new THREE.Group();
    frontLeftLeg.position.set(-0.085, 0.14, 0.18);

    const legGeo = new THREE.CylinderGeometry(0.060, 0.054, 0.22, 16);
    const frontLLegMesh = new THREE.Mesh(legGeo, furMaterial);
    frontLLegMesh.position.y = -0.04;
    frontLeftLeg.add(frontLLegMesh);

    // Rounded cream front paw base
    const pawGeo = new THREE.SphereGeometry(0.075, 18, 14);
    pawGeo.scale(1.1, 0.55, 1.2);
    const frontLPaw = new THREE.Mesh(pawGeo, creamFurMaterial);
    frontLPaw.position.set(0, -0.14, 0.04);
    frontLPaw.castShadow = true;
    frontLeftLeg.add(frontLPaw);

    // 3 Rounded soft toe beans on front of paw
    [-0.036, 0, 0.036].forEach((toex) => {
      const toeGeo = new THREE.SphereGeometry(0.024, 10, 8);
      const toe = new THREE.Mesh(toeGeo, creamFurMaterial);
      toe.position.set(toex, -0.14, 0.095);
      frontLeftLeg.add(toe);
    });

    // Paw pad on bottom
    const padGeo = new THREE.CircleGeometry(0.045, 14);
    const frontLPad = new THREE.Mesh(padGeo, pawPadMaterial);
    frontLPad.rotation.x = Math.PI * 0.5;
    frontLPad.position.set(0, -0.17, 0.04);
    frontLeftLeg.add(frontLPad);

    const frontRightLeg = frontLeftLeg.clone();
    frontRightLeg.position.x = 0.085;

    petGroup.add(frontLeftLeg);
    petGroup.add(frontRightLeg);

    // --- Seated Rear Legs & Cozy Haunches ---
    const backLeftLeg = new THREE.Group();
    backLeftLeg.position.set(-0.21, 0.14, -0.02);

    const thighGeo = new THREE.SphereGeometry(0.17, 18, 16);
    thighGeo.scale(0.85, 1.0, 1.1);
    const backLThigh = new THREE.Mesh(thighGeo, furMaterial);
    backLeftLeg.add(backLThigh);

    const backLPaw = frontLPaw.clone();
    backLPaw.position.set(0.03, -0.14, 0.18);
    backLeftLeg.add(backLPaw);

    const backRightLeg = backLeftLeg.clone();
    backRightLeg.position.x = 0.21;
    backRightLeg.children[1].position.x = -0.03;

    petGroup.add(backLeftLeg);
    petGroup.add(backRightLeg);

    petGroup.add(bodyGroup);
    scene.add(petGroup);

    // -----------------------------------------------------------------------
    // Equipped Accessories (Salakot, Beanie, Glasses, Scarf, Collar)
    // -----------------------------------------------------------------------
    // 1. Salakot Hat
    const salakotGroup = new THREE.Group();
    const salakotMat = new THREE.MeshStandardMaterial({ color: 0xd4a373, roughness: 0.9 });
    const salakotCone = new THREE.Mesh(new THREE.ConeGeometry(0.42, 0.17, 32), salakotMat);
    salakotCone.position.set(0, 0.30, 0.02);
    salakotCone.rotation.x = -0.08;
    salakotGroup.add(salakotCone);
    salakotGroup.visible = equipped.hat === 'salakot';
    headGroup.add(salakotGroup);

    // 2. Beanie Hat
    const beanieGroup = new THREE.Group();
    const beanieMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.85 });
    const beanieDome = new THREE.Mesh(new THREE.SphereGeometry(0.34, 24, 20, 0, Math.PI * 2, 0, Math.PI * 0.55), beanieMat);
    beanieDome.position.set(0, 0.15, 0);
    beanieGroup.add(beanieDome);
    beanieGroup.visible = equipped.hat === 'beanie';
    headGroup.add(beanieGroup);

    // 3. Cool Sunglasses
    const glassesGroup = new THREE.Group();
    const frameMat = new THREE.MeshStandardMaterial({ color: 0x18181b, roughness: 0.2, metalness: 0.4 });
    const lensMat = new THREE.MeshStandardMaterial({ color: 0x09090b, roughness: 0.08, metalness: 0.85 });

    const leftFrame = new THREE.Mesh(new THREE.TorusGeometry(0.085, 0.015, 12, 24), frameMat);
    leftFrame.position.set(-0.125, 0.055, 0.30);
    const leftLens = new THREE.Mesh(new THREE.CircleGeometry(0.078, 20), lensMat);
    leftLens.position.set(-0.125, 0.055, 0.305);
    glassesGroup.add(leftFrame);
    glassesGroup.add(leftLens);

    const rightFrame = leftFrame.clone();
    rightFrame.position.x = 0.125;
    const rightLens = leftLens.clone();
    rightLens.position.x = 0.125;
    glassesGroup.add(rightFrame);
    glassesGroup.add(rightLens);

    const bridge = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.012, 0.11), frameMat);
    bridge.rotation.z = Math.PI * 0.5;
    bridge.position.set(0, 0.055, 0.30);
    glassesGroup.add(bridge);
    glassesGroup.visible = !!equipped.glasses;
    headGroup.add(glassesGroup);

    // 4. Cozy Scarf
    const scarfGroup = new THREE.Group();
    const scarfMat = new THREE.MeshStandardMaterial({ color: 0xe11d48, roughness: 0.85 });
    const scarfRing = new THREE.Mesh(new THREE.TorusGeometry(0.28, 0.065, 16, 32), scarfMat);
    scarfRing.rotateX(Math.PI * 0.5);
    scarfRing.position.set(0, 0.04, 0.05);
    scarfGroup.add(scarfRing);
    scarfGroup.visible = !!equipped.scarf;
    neckGroup.add(scarfGroup);

    // If scarf is equipped, hide the bandana; otherwise show the signature green sprout bandana!
    bandanaGroup.visible = !equipped.scarf;

    // 5. Mindful Bell Collar
    const collarGroup = new THREE.Group();
    const collarMat = new THREE.MeshStandardMaterial({ color: 0x059669, roughness: 0.6 });
    const bellMat = new THREE.MeshStandardMaterial({ color: 0xfbbf24, roughness: 0.2, metalness: 0.85 });
    const collarRing = new THREE.Mesh(new THREE.TorusGeometry(0.27, 0.03, 14, 30), collarMat);
    collarRing.rotateX(Math.PI * 0.5);
    collarRing.position.set(0, 0.08, 0.04);
    collarGroup.add(collarRing);

    const bell = new THREE.Mesh(new THREE.SphereGeometry(0.040, 16, 14), bellMat);
    bell.position.set(0, 0.04, 0.30);
    collarGroup.add(bell);
    collarGroup.visible = !!equipped.collar && !!equipped.scarf;
    neckGroup.add(collarGroup);

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

    // -----------------------------------------------------------------------
    // 3D Ceramic Pet Food Bowl (Directly on floor in front of the pet!)
    // -----------------------------------------------------------------------
    const bowlGroup = new THREE.Group();
    bowlGroup.position.set(0, 0.04, 0.44);

    const bowlOuterGeo = new THREE.CylinderGeometry(0.18, 0.14, 0.08, 32);
    const bowlOuterMat = new THREE.MeshStandardMaterial({
      color: isDog ? 0xf59e0b : 0x06b6d4,
      roughness: 0.18,
      metalness: 0.25,
    });
    const bowlOuter = new THREE.Mesh(bowlOuterGeo, bowlOuterMat);
    bowlOuter.castShadow = true;
    bowlOuter.receiveShadow = true;
    bowlGroup.add(bowlOuter);

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

    const foodGeo = new THREE.CylinderGeometry(0.15, 0.12, 0.035, 24);
    const foodMat = new THREE.MeshStandardMaterial({
      color: isDog ? 0x78350f : 0xf97316,
      roughness: 0.85,
    });
    const foodMesh = new THREE.Mesh(foodGeo, foodMat);
    foodMesh.position.y = 0.03;
    bowlGroup.add(foodMesh);

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
      bandanaGroup,
      salakotHat: salakotGroup,
      beanieHat: beanieGroup,
      sunglasses: glassesGroup,
      cozyScarf: scarfGroup,
      collar: collarGroup,
      animState,
      particlesGroup,
      bubblesGroup,
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
      const intersects = raycaster.intersectObjects([chestMesh, skullMesh], true);

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
        const rect = container.getBoundingClientRect();
        const normX = ((clientX - rect.left) / rect.width) * 2 - 1;
        const normY = -(((clientY - rect.top) / rect.height) * 2 - 1);
        animState.targetLookY = normX * 0.25;
        animState.targetLookX = -normY * 0.14;
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

      // Smooth Head Tracking
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
        leftUpperLid.rotation.x = -0.32;
        rightUpperLid.rotation.x = -0.32;
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
        // Joyful Playful Puppy: Bouncy hops, panting, glowing happiness
        const happyHop = Math.abs(Math.sin(t * 7.5)) * 0.05;
        bodyGroup.position.y = 0.30 + happyHop;

        headGroup.position.set(0, 0.23 + happyHop * 0.7, 0.06);
        headGroup.rotation.set(
          animState.headLookX + Math.sin(t * 8) * 0.05,
          animState.headLookY + Math.sin(t * 6) * 0.05,
          Math.sin(t * 4) * 0.06
        );

        tongueGroup.scale.set(1.15, 1.15, 1.15);
        tongueGroup.position.y = -0.010 + Math.sin(t * 9) * 0.012;

        if (isDog) {
          leftEarGroup.rotation.set(0.15 + Math.sin(t * 12) * 0.12, 0.18, 0.15);
          rightEarGroup.rotation.set(0.15 + Math.sin(t * 12) * 0.12, -0.18, -0.15);
        }

        frontLeftLeg.position.y = 0.14 + happyHop * 0.35;
        frontRightLeg.position.y = 0.14 + (Math.abs(Math.cos(t * 7.5)) * 0.025);

        if (Math.random() < 0.06) {
          spawnParticle(0, 0.9, 0, 'sparkle');
        }

        shadowDisc.scale.set(1 - happyHop * 1.2, 1 - happyHop * 1.2, 1);
        zenRing.material.opacity = 0;
      } else if (isCalm) {
        // Serene Diaphragmatic Breathing
        const breathCycle = Math.sin(t * 1.6);
        const breath = breathCycle * 0.02;

        chestMesh.scale.set(0.96 + breath * 0.5, 1.05 + breath * 0.4, 0.95 - breath * 0.2);
        bodyGroup.position.y = 0.30 + breath * 0.25;

        headGroup.position.set(0, 0.23 + breath * 0.35, 0.06);
        headGroup.rotation.set(
          animState.headLookX + breath * 0.03,
          animState.headLookY,
          Math.sin(t * 0.8) * 0.02
        );

        tongueGroup.scale.set(1.0, 1.0, 1.0);
        tongueGroup.position.y = -0.015;

        if (isDog) {
          leftEarGroup.rotation.set(0.12, 0.18, 0.15);
          rightEarGroup.rotation.set(0.12, -0.18, -0.15);
        }

        zenRing.material.opacity = 0.32 + (breathCycle + 1) * 0.18;
        zenRing.scale.set(1 + breath * 1.1, 1 + breath * 1.1, 1);
      } else if (isSad) {
        // Comforting posture: sweet empathetic head tilt
        const sighBreath = Math.sin(t * 1.2);
        const sigh = sighBreath * 0.012;

        bodyGroup.position.set(0, 0.28, 0.03);
        chestMesh.scale.set(0.98 + sigh, 1.05, 0.95);

        headGroup.position.set(0, 0.19, 0.08);
        headGroup.rotation.set(-0.06 + sigh * 0.03, animState.headLookY * 0.5, 0.12);

        if (isDog) {
          leftEarGroup.rotation.set(0.18, 0.12, 0.08);
          rightEarGroup.rotation.set(0.18, -0.12, -0.08);
        }

        tongueGroup.scale.set(0.9, 0.9, 0.9);
        tongueGroup.position.y = -0.018;
        zenRing.material.opacity = 0;
      } else if (isOverwhelmed) {
        // Mindful Box Breathing Grounding (4s Inhale / 4s Exhale)
        const boxPhase = (t % 8.0) / 8.0;
        const boxExpand = boxPhase < 0.5 ? boxPhase / 0.5 : 1.0 - ((boxPhase - 0.5) / 0.5);
        const smoothBox = (1 - Math.cos(boxExpand * Math.PI)) / 2;

        bodyGroup.position.set(0, 0.30 + smoothBox * 0.025, 0);
        chestMesh.scale.set(0.96 + smoothBox * 0.07, 1.05 + smoothBox * 0.05, 0.95);

        headGroup.position.set(0, 0.23 + smoothBox * 0.035, 0.06);
        headGroup.rotation.set(animState.headLookX * 0.35, animState.headLookY * 0.35, 0);

        tongueGroup.scale.set(1.0, 1.0, 1.0);
        tongueGroup.position.y = -0.015;

        zenRing.material.opacity = 0.25 + smoothBox * 0.6;
        zenRing.scale.set(1.0 + smoothBox * 0.3, 1.0 + smoothBox * 0.3, 1);
      } else if (isTired) {
        // Sleepy Yawn & Rest
        const tiredSway = Math.sin(t * 1.4) * 0.012;
        bodyGroup.position.set(0, 0.28, 0);

        const yawnCycle = (t % 9.0);
        if (yawnCycle > 6.0 && yawnCycle < 8.2) {
          const yp = Math.sin(((yawnCycle - 6.0) / 2.2) * Math.PI);
          headGroup.position.set(0, 0.20 + yp * 0.04, 0.07);
          headGroup.rotation.set(0.18 * yp, 0, 0);
          tongueGroup.scale.set(1.25 * yp, 1.25 * yp, 1.25 * yp);
        } else {
          headGroup.position.set(0, 0.20 + tiredSway, 0.07);
          headGroup.rotation.set(0.08, animState.headLookY * 0.5, 0);
          tongueGroup.scale.set(0.95, 0.95, 0.95);
          tongueGroup.position.y = -0.016;
        }
        zenRing.material.opacity = 0;
      } else if (isSleeping) {
        // Curled Sleep
        const sleepBreath = Math.sin(t * 1.5) * 0.025;
        bodyGroup.position.set(0, 0.26, 0);
        chestMesh.scale.set(0.98 + sleepBreath * 0.3, 1.02 - sleepBreath * 0.15, 0.96 + sleepBreath * 0.2);

        headGroup.position.set(0.08, 0.13, 0.10);
        headGroup.rotation.set(0.24, 0.16, 0.12);

        tongueGroup.scale.set(0.001, 0.001, 0.001);
        zenRing.material.opacity = 0;
      } else if (isBathing) {
        // Wet Dog Shake
        const shakeCycle = Math.sin(t * 26);
        bodyGroup.rotation.y = shakeCycle * 0.14;
        headGroup.rotation.y = -shakeCycle * 0.22;
        headGroup.rotation.z = Math.sin(t * 14) * 0.08;

        if (isDog) {
          leftEarGroup.rotation.z = 0.15 + Math.sin(t * 26) * 0.25;
          rightEarGroup.rotation.z = -0.15 - Math.sin(t * 26) * 0.25;
        }

        if (Math.random() < 0.25) spawnBubble();
        zenRing.material.opacity = 0;
      } else if (isEating) {
        // Deep eating dive into 3D food bowl
        const chewSpeed = t * 16;
        const chewBob = Math.sin(chewSpeed) * 0.03;
        const headDips = 0.44 + Math.sin(t * 8) * 0.06;

        headGroup.position.set(0, 0.09 + chewBob, 0.26);
        headGroup.rotation.set(headDips, Math.sin(t * 6) * 0.04, Math.sin(t * 8) * 0.03);

        jawGroup.rotation.x = -0.12 - Math.abs(Math.sin(chewSpeed)) * 0.20;
        tongueGroup.scale.set(1.1, 1.1, 1.1);
        tongueGroup.position.set(0, -0.015 + Math.sin(chewSpeed) * 0.015, 0.07);

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
        const sniffTwitch = Math.sin(t * 24) * 0.018;
        headGroup.position.set(0, 0.23 + sniffTwitch, 0.13);
        headGroup.rotation.set(-0.10 + Math.sin(t * 10) * 0.04, animState.headLookY * 0.6, 0);
        snoutGroup.position.y = -0.015 + sniffTwitch * 0.5;

        if (isDog) {
          leftEarGroup.rotation.set(-0.10, 0.12, 0.10);
          rightEarGroup.rotation.set(-0.10, -0.12, -0.10);
        }

        tongueGroup.scale.set(1.05, 1.05, 1.05);
        tongueGroup.position.y = -0.012 + Math.sin(t * 14) * 0.008;

        if (Math.random() < 0.08) {
          spawnParticle(0, 0.7, 0.2, 'sparkle');
        }
        zenRing.material.opacity = 0;
      } else {
        // Natural Living Idle: gentle breathing, direct warm eye contact, joyful open smile
        const breath = Math.sin(t * 2.0) * 0.014;
        bodyGroup.position.set(0, 0.30 + breath, 0);
        chestMesh.scale.set(0.96 + breath * 0.35, 1.05 + breath * 0.35, 0.95 - breath * 0.18);

        headGroup.position.set(0, 0.23 + breath * 0.45, 0.06);
        headGroup.rotation.set(
          animState.headLookX + Math.sin(t * 1.5) * 0.018,
          animState.headLookY,
          Math.sin(t * 1.1) * 0.018
        );

        // Open mouth smile with cute tongue tip resting comfortably
        tongueGroup.scale.set(1.0, 1.0, 1.0);
        tongueGroup.position.y = -0.015 + Math.sin(t * 3.5) * 0.004;

        if (isDog) {
          leftEarGroup.rotation.set(0.12 + Math.sin(t * 2.0) * 0.03, 0.18, 0.15);
          rightEarGroup.rotation.set(0.12 + Math.sin(t * 2.0) * 0.03, -0.18, -0.15);
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
        b.userData.life -= delta * 0.6;
        (b.material as THREE.MeshStandardMaterial).opacity = Math.max(0, b.userData.life * 0.65);
        if (b.userData.life <= 0) bubblesGroup.remove(b);
      }

      // Smooth Orbit Camera Interpolation (Generous framing, zero top clipping)
      const camDist = 2.7;
      const targetCamX = Math.sin(animState.orbitAngle) * camDist;
      const targetCamZ = Math.cos(animState.orbitAngle) * camDist;
      const targetCamY = 0.46 + animState.orbitPitch * 0.9;
      camera.position.x += (targetCamX - camera.position.x) * 0.1;
      camera.position.y += (targetCamY - camera.position.y) * 0.1;
      camera.position.z += (targetCamZ - camera.position.z) * 0.1;
      camera.lookAt(0, 0.42, 0);

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
    const { salakotHat, beanieHat, sunglasses, cozyScarf, collar, bandanaGroup } = sceneRef.current;
    if (salakotHat) salakotHat.visible = equipped.hat === 'salakot';
    if (beanieHat) beanieHat.visible = equipped.hat === 'beanie';
    if (sunglasses) sunglasses.visible = !!equipped.glasses;
    if (cozyScarf) cozyScarf.visible = !!equipped.scarf;
    if (bandanaGroup) bandanaGroup.visible = !equipped.scarf;
    if (collar) collar.visible = !!equipped.collar && !!equipped.scarf;
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
