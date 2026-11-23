// Modelo de referencia. X apunta hacia el faro, Y hacia arriba y Z hacia el escape.
import * as T from '../vendor/three/three.module.min.js';

const v = (x, y, z) => new T.Vector3(x, y, z);
const finish = (color, metalness = 0, roughness = .5) =>
  new T.MeshStandardMaterial({ color, metalness, roughness });
const rubber = finish(0x222321, .03, .88);
const leather = finish(0x292c2c, .04, .78);
const frame = finish(0x252a29, .58, .34);
const silver = finish(0xb7bdbe, .84, .27);
const alloy = finish(0x6c7372, .73, .4);
const paint = finish(0xf4f3ed, .32, .24);
const amber = finish(0xed8c2d, .24, .23);
const seam = finish(0x52544f, .15, .68);
const sphere = new T.SphereGeometry(1, 32, 18);
const cylinder = new T.CylinderGeometry(1, 1, 1, 24);
const up = v(0, 1, 0);

function mesh(parent, geometry, material) {
  const part = new T.Mesh(geometry, material);
  parent.add(part);
  return part;
}
function oval(parent, position, size, material) {
  const part = mesh(parent, sphere, material);
  part.position.set(...position);
  part.scale.set(...size);
  return part;
}
function rod(parent, a, b, radius, material) {
  const direction = v(...b).sub(v(...a));
  const part = mesh(parent, cylinder, material);
  part.position.copy(v(...a).addScaledVector(direction, .5));
  part.scale.set(radius, direction.length(), radius);
  part.quaternion.setFromUnitVectors(up, direction.normalize());
}
function pipe(parent, points, radius, material, segments = 24) {
  const curve = new T.CatmullRomCurve3(points.map(p => v(...p)));
  return mesh(parent, new T.TubeGeometry(curve, segments, radius, 8, false), material);
}
function ring(parent, x, y, z, radius, thickness, material) {
  mesh(parent, new T.TorusGeometry(radius, thickness, 12, 64), material).position.set(x, y, z);
}

// Una sección indica [x, altura central, semialtura, semiancho].
// Las mismas secciones definen la chapa y las gráficas que siguen su curvatura.
function sectionPoint([x, y, h, w], angle, power = .72) {
  const rounded = n => Math.sign(n) * Math.pow(Math.abs(n), power);
  return [x, y + h * rounded(Math.sin(angle)), w * rounded(Math.cos(angle))];
}
function surface(parent, rows, columns, point, material) {
  const positions = [], uv = [], indices = [];
  for (let r = 0; r <= rows; r++) {
    for (let c = 0; c <= columns; c++) {
      positions.push(...point(r, c / columns));
      uv.push(r / rows, c / columns);
      if (r < rows && c < columns) {
        const a = r * (columns + 1) + c, b = a + columns + 1;
        indices.push(a, b, a + 1, b, b + 1, a + 1);
      }
    }
  }
  const geometry = new T.BufferGeometry();
  geometry.setAttribute('position', new T.Float32BufferAttribute(positions, 3));
  geometry.setAttribute('uv', new T.Float32BufferAttribute(uv, 2));
  geometry.setIndex(indices);
  geometry.computeVertexNormals();
  return mesh(parent, geometry, material);
}
function body(parent, sections, material, power) {
  return surface(parent, sections.length - 1, 32,
    (r, t) => sectionPoint(sections[r], t * Math.PI * 2, power), material);
}
function fender(parent, x, y, radius, width, start, end, material) {
  material.side = T.DoubleSide;
  surface(parent, 36, 12, (r, t) => {
    const angle = start + (end - start) * r / 36;
    const crown = radius + .037 * Math.sin(t * Math.PI);
    return [x + crown * Math.cos(angle), y + crown * Math.sin(angle), (t - .5) * width];
  }, material);
}
function tireMaterial() {
  const texture = document.createElement('canvas');
  texture.width = 64; texture.height = 128;
  const ctx = texture.getContext('2d');
  ctx.fillStyle = '#a4a4a4'; ctx.fillRect(0, 0, 64, 128);
  ctx.strokeStyle = '#282828'; ctx.lineWidth = 5;
  for (const y of [0, 128]) {
    ctx.beginPath();
    ctx.moveTo(-6, y - 25); ctx.lineTo(22, y - 14); ctx.lineTo(32, y - 3);
    ctx.moveTo(40, y + 3); ctx.lineTo(47, y + 15); ctx.lineTo(70, y + 25);
    ctx.stroke();
  }
  const tread = new T.CanvasTexture(texture);
  tread.wrapS = tread.wrapT = T.RepeatWrapping;
  tread.repeat.set(48, 1);
  return new T.MeshStandardMaterial({color:0x252524,roughness:.83,bumpMap:tread,bumpScale:.003});
}
function wheel(parent, x, front, tire) {
  const y = .52;
  ring(parent, x, y, 0, .441, .079, tire);
  for (const side of [-1, 1]) {
    const z = side * .047;
    ring(parent, x, y, z, .381, .015, silver);
    ring(parent, x, y, z * 1.23, .448, .003, seam);
    for (let i = 0; i < 20; i++) {
      const a = i * Math.PI / 10;
      const b = a + side * .37;
      rod(parent, [x + .096 * Math.cos(b), y + .096 * Math.sin(b), z * 1.5],
        [x + .378 * Math.cos(a), y + .378 * Math.sin(a), z], .0048, silver);
    }
  }
  rod(parent, [x,y,-.082], [x,y,.082], .103, alloy);
  if (front) {
    ring(parent, x, y, .085, .162, .017, silver);
    for (let i = 0; i < 6; i++) {
      const a = i * Math.PI / 3;
      rod(parent,[x,y,.086],[x+.16*Math.cos(a), y+.16*Math.sin(a),.086],.012,alloy);
    }
    oval(parent,[x-.12,y+.096,.107],[.047,.064,.031],frame);
  }
}
function tankGraphic() {
  const canvas = document.createElement('canvas');
  canvas.width = 512; canvas.height = 160;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#bec54b';
  ctx.beginPath(); ctx.moveTo(35,108); ctx.lineTo(475,5); ctx.lineTo(424,45); ctx.closePath(); ctx.fill();
  ctx.fillStyle = '#242825';
  ctx.font = 'italic 900 112px Arial'; ctx.fillText('NKD',79,130,365);
  const map = new T.CanvasTexture(canvas);
  map.colorSpace = T.SRGBColorSpace;
  return new T.MeshStandardMaterial({map, transparent:true, depthWrite:false, side:T.DoubleSide,
    polygonOffset:true, polygonOffsetFactor:-3});
}

export function crearMoto() {
  const moto = new T.Group();
  const tire = tireMaterial();
  wheel(moto, -1.02, false, tire);
  wheel(moto, 1.06, true, tire);
  fender(moto, 1.06,.52,.535,.19,.54,2.76,paint);
  fender(moto,-1.02,.52,.55,.21,.44,2.92,frame);
  for (const s of [-1,1]) {
    const z = .125*s;
    pipe(moto, [[-.98,1.21,z],[-.43,1.18,z],[.56,1.45,z],[.28,.59,z],[.10,.44,z],[-.4,.49,z],[-.65,1.13,z]],.036,frame);
    rod(moto,[-1.02,.52,z],[-.34,.59,z],.043,frame);
    rod(moto,[1.06,.52,z],[.91,1.04,z],.042,alloy);
    rod(moto,[.91,1.04,z],[.74,1.53,z],.028,silver);
    rod(moto,[-.94,.55,z],[-.72,1.16,z],.033,silver);
    const coil = [];
    for (let i=0; i<=120; i++) {
      const t=i/120, a=t*16*Math.PI;
      coil.push([-.92+.18*t+.057*Math.cos(a), .64+.46*t, z+.057*Math.sin(a)]);
    }
    pipe(moto,coil,.012,frame,150);
    rod(moto,[-.5,.56,z],[-.5,.56,.27*s],.032,rubber);
    // Manillar, puños y retrovisores.
    pipe(moto,[[.71,1.53,0],[.73,1.67,.12*s],[.62,1.73,.25*s],[.54,1.72,.36*s]],.019,silver);
    rod(moto,[.61,1.73,.27*s],[.53,1.72,.38*s],.028,rubber);
    pipe(moto,[[.62,1.74,.26*s],[.64,1.83,.31*s],[.68,1.91,.42*s]],.009,alloy);
    oval(moto,[.68,1.93,.43*s],[.037,.063,.091],frame);
    oval(moto,[.655,1.934,.43*s],[.019,.053,.08],silver);
    for (const x of [-1.25,.91]) {
      const h=x<0?1.15:1.4;
      rod(moto,[x,h,.08*s],[x,h,.24*s],.018,frame);
      oval(moto,[x,h,.24*s],[.048,.036,.031],amber);
    }
  }
  // Pipa de dirección, tijas y cableado entre el manillar y el chasis.
  rod(moto,[.47,1.39,0],[.76,1.44,0],.067,frame);
  for (const y of [1.34,1.52]) {
    const x=y<1.4?.81:.75;
    rod(moto,[x,y,-.14],[x,y,.14],.042,alloy);
  }
  pipe(moto,[[.56,1.72,.34],[.72,1.65,.37],[.88,1.43,.17],[.94,1.02,.15],[1.02,.68,.15],[.96,.62,.13]],.009,rubber);
  pipe(moto,[[.58,1.71,-.33],[.70,1.6,-.28],[.71,1.30,-.13],[.42,1.20,-.12],[.18,1.14,-.08]],.009,rubber);
  for (const s of [-1,1]) {
    pipe(moto,[[.63,1.73,.24*s],[.66,1.74,.31*s],[.60,1.72,.4*s]],.009,silver);
    rod(moto,[.77,1.4,.12*s],[.91,1.44,.10*s],.019,frame);
  }
  // Motor monocilíndrico, aletas y escape por el lateral derecho.
  oval(moto,[-.12,.71,0],[.285,.205,.182],alloy);
  for (const s of [-1,1]) {
    rod(moto,[-.13,.7,.15*s],[-.13,.7,.20*s],.132,frame);
    for (let i=0;i<6;i++) {
      const a=i*Math.PI/3;
      oval(moto,[-.13+.11*Math.cos(a),.7+.11*Math.sin(a),.201*s],[.012,.012,.008],silver);
    }
  }
  rod(moto,[.05,.78,0],[.19,1.14,0],.129,frame);
  for (let i=0;i<9;i++) {
    const y=.85+.033*i, x=.07+.011*i;
    const fin=oval(moto,[x,y,0],[.135,.014,.162],alloy);
    fin.rotation.z=-.24;
  }
  const head = oval(moto,[.174,1.145,0],[.141,.055,.15],alloy);
  head.rotation.z = -.26;
  oval(moto,[-.017,.666,.067],[.175,.141,.144],alloy);
  rod(moto,[-.16,1.03,0],[.067,1.05,0],.045,alloy);
  oval(moto,[-.099,1.017,0],[.051,.083,.067],alloy);
  pipe(moto,[[.16,1.17,.08],[.13,1.22,.12],[-.04,1.22,.13],[-.15,1.13,.11]],.012,rubber);
  // Transmisión por cadena en el costado izquierdo.
  ring(moto,-1.02,.52,-.109,.145,.016,alloy);
  pipe(moto,[[-1.02,.666,-.12],[-.68,.693,-.12],[-.32,.71,-.12],[-.27,.625,-.12],[-.64,.49,-.12],[-1.02,.375,-.12],[-1.16,.52,-.12],[-1.02,.666,-.12]],.012,frame,54);
  pipe(moto,[[.24,1.04,.045],[.39,.97,.08],[.36,.59,.114],[.19,.45,.17],[-.26,.45,.204],[-.53,.49,.205]],.031,silver);
  rod(moto,[-.42,.47,.21],[-1.33,.61,.21],.068,silver);
  rod(moto,[-1.33,.61,.21],[-1.337,.613,.21],.049,frame);
  // Guarniciones, asiento corrido y depósito blanco.
  body(moto,[[-.98,1.17,.01,.01],[-.85,1.13,.088,.13],[-.54,1.025,.153,.185],[-.30,1.03,.15,.16],[-.12,1.12,.07,.10],[-.1,1.13,.01,.01]],frame);
  body(moto,[[-1.32,1.26,.006,.015],[-1.28,1.25,.062,.13],[-1.12,1.24,.072,.168],[-.78,1.22,.075,.18],[-.49,1.20,.063,.165],[-.28,1.22,.065,.13],[-.19,1.25,.025,.075],[-.18,1.25,.005,.01]],leather,.50);
  for (const s of [-1,1]) {
    pipe(moto,[[-1.32,1.26,.09*s],[-1.27,1.25,.145*s],[-1.10,1.24,.17*s],[-.77,1.22,.182*s],[-.48,1.20,.166*s],[-.28,1.22,.131*s]],.005,seam);
    pipe(moto,[[-1.05,1.16,.14*s],[-1.27,1.20,.17*s],[-1.37,1.27,.10*s],[-1.38,1.27,0]],.016,silver);
  }
  oval(moto,[-1.35,1.16,0],[.054,.04,.095],finish(0xa5231a,.1,.24));
  const tank=[[-.32,1.27,.025,.045],[-.25,1.29,.088,.133],[-.12,1.32,.143,.186],[.12,1.36,.17,.211],[.35,1.38,.174,.212],[.49,1.39,.138,.18],[.56,1.40,.07,.115],[.58,1.40,.012,.025]];
  body(moto,tank,paint);
  const graphic=tankGraphic();
  for (const s of [-1,1]) {
    surface(moto,4,16,(r,t)=>{
      const p=sectionPoint(tank[s===1?r+1:5-r],(t-.5)*1.45);
      p[2]=(p[2]+.002)*s;
      return p;
    },graphic);
  }
  oval(moto,[.24,1.549,0],[.07,.012,.057],silver);
  // Faro, bisel, lente y tablero.
  oval(moto,[.90,1.43,0],[.137,.132,.132],frame);
  rod(moto,[.972,1.43,0],[1.003,1.43,0],.121,silver);
  oval(moto,[1.003,1.43,0],[.027,.111,.111],finish(0xe5e7dc,.36,.16));
  for (const s of [-1,1]) {
    rod(moto,[.785,1.48,.074*s],[.75,1.60,.074*s],.061,frame);
    oval(moto,[.75,1.603,.074*s],[.055,.009,.055],alloy);
  }
  const cupula=new T.Group(), alforjas=new T.Group();
  moto.add(cupula,alforjas);
  const smoke= new T.MeshPhysicalMaterial({color:0x47575c, transparent:true,opacity:.72,
    roughness:.16,metalness:.16,side:T.DoubleSide,depthWrite:false});
  surface(cupula,18,22,(r,t)=>{
    const h=r/18, lateral=t*2-1;
    const width=.14+.055*Math.sin(h*Math.PI)-.012*h;
    return [.981-.145*h-.067*lateral*lateral,1.51+.37*h-.045*h*lateral*lateral,width*lateral];
  },smoke);
  for (const s of [-1,1]) {
    rod(cupula,[.82,1.44,.12*s],[.91,1.64,.112*s],.013,alloy);
    oval(cupula,[.907,1.64,.12*s],[.014,.013,.013],silver);
    const bag=new T.Group();
    bag.position.set(-.91,.98,s*.247);
    alforjas.add(bag);
    pipe(alforjas,[[-1.11,1.16,s*.12],[-1.10,1.15,s*.234],[-.67,1.13,s*.234],[-.68,1.14,s*.13]],.018,alloy);
    body(bag,[[-.294,.03,.02,.025],[-.275,.01,.135,.084],[-.24,0,.17,.099],[.22,0,.173,.101],[.266,.02,.145,.09],[.28,.03,.024,.034]],leather,.38);
    body(bag,[[-.29,.08,.006,.018],[-.267,.084,.07,.093],[-.22,.083,.086,.106],[.221,.084,.086,.107],[.27,.087,.063,.092],[.28,.09,.008,.02]],frame,.45);
    for (const x of [-.155,.155]) {
      const strap=mesh(bag,new T.BoxGeometry(.037,.205,.016),seam);
      strap.position.set(x,.045,.107*s);
      const buckle=mesh(bag,new T.BoxGeometry(.055,.032,.019),silver);
      buckle.position.set(x,.035,.12*s);
    }
  }
  return {moto, accesorios:{cupula,alforjas}};
}
