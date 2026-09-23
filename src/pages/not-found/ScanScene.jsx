import { useEffect, useRef } from "react";
import * as THREE from "three";

/** 3D scanner scene (rings, laser line, floating modules). 404 page only. */
export default function ScanScene({ isDark }) {
  const mountRef = useRef(null);

  useEffect(() => {
    const mount = mountRef.current;
    if (!mount) return;
    const reduceMotion = matchMedia("(prefers-reduced-motion: reduce)").matches;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(55, mount.clientWidth / mount.clientHeight, 0.1, 200);
    camera.position.set(0, 0, 22);

    let renderer;
    try {
      renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    } catch {
      return; // No WebGL: the page still works without the scene.
    }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 1.5));
    renderer.setSize(mount.clientWidth, mount.clientHeight);
    renderer.setClearColor(0x000000, 0);
    mount.appendChild(renderer.domElement);

    const ink = isDark ? 0x52c78e : 0x188054;
    const soft = isDark ? 0x2f3431 : 0xc9d3cc;
    const op = isDark ? 0.28 : 0.2;

    const ring1 = new THREE.Mesh(
      new THREE.TorusGeometry(7, 0.14, 16, 120),
      new THREE.MeshPhongMaterial({ color: ink, emissive: ink, emissiveIntensity: 0.35, transparent: true, opacity: op }),
    );
    const ring2 = new THREE.Mesh(
      new THREE.TorusGeometry(7, 0.07, 12, 80),
      new THREE.MeshPhongMaterial({ color: soft, emissive: soft, emissiveIntensity: 0.2, transparent: true, opacity: op }),
    );
    ring2.rotation.x = Math.PI / 2;
    const laser = new THREE.Mesh(
      new THREE.PlaneGeometry(15, 0.04),
      new THREE.MeshBasicMaterial({ color: ink, transparent: true, opacity: 0.5, side: THREE.DoubleSide }),
    );
    scene.add(ring1, ring2, laser);

    const cubeGeo = new THREE.BoxGeometry(0.32, 0.32, 0.32);
    const cubeMat = new THREE.MeshPhongMaterial({ color: ink, transparent: true, opacity: isDark ? 0.45 : 0.3 });
    const cubes = [];
    for (let i = -9; i <= 9; i += 2.6)
      for (let j = -9; j <= 9; j += 2.6) {
        if (Math.random() > 0.45) continue;
        const m = new THREE.Mesh(cubeGeo, cubeMat);
        m.position.set(i + (Math.random() - 0.5) * 0.6, j + (Math.random() - 0.5) * 0.6, -9 + Math.random() * 2);
        m.userData = { baseY: m.position.y, phase: Math.random() * Math.PI * 2 };
        scene.add(m);
        cubes.push(m);
      }

    scene.add(new THREE.AmbientLight(0xffffff, 0.6));
    const light = new THREE.DirectionalLight(0xffffff, 1.2);
    light.position.set(5, 10, 8);
    scene.add(light);

    const onResize = () => {
      renderer.setSize(mount.clientWidth, mount.clientHeight);
      camera.aspect = mount.clientWidth / mount.clientHeight;
      camera.updateProjectionMatrix();
    };
    window.addEventListener("resize", onResize);

    let t = 0, frame;
    const render = () => {
      ring1.rotation.x = Math.sin(t * 0.35) * 0.3;
      ring1.rotation.y = t * 0.18;
      ring2.rotation.y = t * 0.13;
      ring2.rotation.z = Math.cos(t * 0.28) * 0.2;
      laser.position.y = Math.sin(t * 1.1) * 6;
      cubes.forEach((c) => {
        c.position.y = c.userData.baseY + Math.sin(t * 0.8 + c.userData.phase) * 0.45;
        c.rotation.x = c.rotation.y = t * 0.3 + c.userData.phase;
      });
      renderer.render(scene, camera);
    };
    const loop = () => {
      t += 0.007;
      render();
      frame = requestAnimationFrame(loop);
    };
    if (reduceMotion) render();
    else loop();

    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener("resize", onResize);
      scene.traverse((o) => {
        o.geometry?.dispose();
        o.material?.dispose();
      });
      renderer.dispose();
      renderer.domElement.remove();
    };
  }, [isDark]);

  return <div ref={mountRef} className="pointer-events-none fixed inset-0 z-0" aria-hidden />;
}
