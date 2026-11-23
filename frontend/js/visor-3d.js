import * as T from '../vendor/three/three.module.min.js';
import { crearMoto } from './moto-3d.js';

export function iniciarVisor(canvas, alPerderContexto) {
  const renderer = new T.WebGLRenderer({canvas, antialias:true, alpha:true});
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = T.PCFSoftShadowMap;
  renderer.toneMapping = T.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.1;
  const scene = new T.Scene();
  const camera = new T.PerspectiveCamera(31, 1, .1, 50);
  const { moto, accesorios } = crearMoto();
  scene.add(moto);
  moto.traverse(part => { if (part.isMesh) part.castShadow = true; });

  // Grandes paneles claros y oscuros del estudio, reflejados en las piezas metálicas.
  const studio = document.createElement('canvas');
  studio.width = 256; studio.height = 128;
  const ctx = studio.getContext('2d');
  const light = ctx.createLinearGradient(0,0,0,128);
  light.addColorStop(0,'#e9edeb'); light.addColorStop(.5,'#b8b8af');
  light.addColorStop(.55,'#57554e'); light.addColorStop(1,'#a29b8d');
  ctx.fillStyle = light; ctx.fillRect(0,0,256,128);
  ctx.fillStyle = '#ffffff'; ctx.fillRect(32,24,62,31); ctx.fillRect(170,17,49,40);
  const environment = new T.CanvasTexture(studio);
  environment.mapping = T.EquirectangularReflectionMapping;
  environment.colorSpace = T.SRGBColorSpace;
  scene.environment = environment;
  scene.add(new T.HemisphereLight(0xfffaf1,0xaba69c,1.25));
  const key = new T.DirectionalLight(0xfff5df,2.8);
  key.position.set(3,6,3); key.castShadow = true;
  key.shadow.mapSize.set(1024,1024);
  Object.assign(key.shadow.camera,{left:-2.1,right:2.1,top:2.1,bottom:-2.1,near:1,far:12});
  key.shadow.camera.updateProjectionMatrix();
  key.shadow.normalBias = .012;
  scene.add(key);
  const floor = new T.Mesh(new T.PlaneGeometry(32,32),new T.ShadowMaterial({opacity:.22}));
  floor.rotation.x = -Math.PI/2; floor.receiveShadow = true; scene.add(floor);

  const target = new T.Vector3(0,.94,0);
  let yaw = .42, pitch = .16, distance;
  let frame = 0;
  function draw() {
    const horizontal = distance * Math.cos(pitch);
    camera.position.set(target.x + horizontal*Math.sin(yaw), target.y + distance*Math.sin(pitch),
      target.z + horizontal*Math.cos(yaw));
    camera.lookAt(target);
    renderer.render(scene,camera);
    frame = 0;
  }
  function invalidate() {
    if (!frame) frame = requestAnimationFrame(draw);
  }
  function resize() {
    const {width,height} = canvas.getBoundingClientRect();
    if (!width || !height) return;
    camera.aspect = width/height;
    distance = Math.max(4.65, 6.85/camera.aspect);
    camera.updateProjectionMatrix();
    renderer.setSize(width,height,false);
    invalidate();
  }
  function rotate(horizontal,vertical) {
    yaw += horizontal;
    pitch = T.MathUtils.clamp(pitch+vertical,.03,1.13);
    invalidate();
  }
  let drag = null;
  canvas.addEventListener('pointerdown', e=>{
    if (drag || e.button !== 0) return;
    drag = {id:e.pointerId,x:e.clientX,y:e.clientY};
    canvas.setPointerCapture(e.pointerId);
  });
  canvas.addEventListener('pointermove', e=>{
    if (e.pointerId !== drag?.id) return;
    rotate((drag.x-e.clientX)*.012,(e.clientY-drag.y)*.009);
    drag.x=e.clientX; drag.y=e.clientY;
  });
  canvas.addEventListener('lostpointercapture', ()=>{ drag=null; });
  canvas.addEventListener('keydown', e=>{
    const moves = {ArrowLeft:[-.16,0], ArrowRight:[.16,0], ArrowUp:[0,.1], ArrowDown:[0,-.1]};
    if (moves[e.key]) {
      e.preventDefault(); rotate(...moves[e.key]);
    }
  });
  const observer = new ResizeObserver(resize);
  observer.observe(canvas);
  canvas.addEventListener('webglcontextlost', ()=>{
    observer.disconnect(); cancelAnimationFrame(frame); alPerderContexto();
  }, {once:true});
  canvas.hidden = false;
  resize();
  return seleccion=>{
    for (const [id,part] of Object.entries(accesorios)) part.visible = seleccion.has(id);
    invalidate();
  };
}
