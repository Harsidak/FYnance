
const MAX_COLORS = 8;

const frag = `
#define MAX_COLORS ${MAX_COLORS}
uniform vec2 uCanvas;
uniform float uTime;
uniform float uSpeed;
uniform vec2 uRot;
uniform int uColorCount;
uniform vec3 uColors[MAX_COLORS];
uniform int uTransparent;
uniform float uScale;
uniform float uFrequency;
uniform float uWarpStrength;
uniform vec2 uPointer; // in NDC [-1,1]
uniform float uMouseInfluence;
uniform float uParallax;
uniform float uNoise;
varying vec2 vUv;

void main() {
  float t = uTime * uSpeed;
  vec2 p = vUv * 2.0 - 1.0;
  p += uPointer * uParallax * 0.1;
  vec2 rp = vec2(p.x * uRot.x - p.y * uRot.y, p.x * uRot.y + p.y * uRot.x);
  vec2 q = vec2(rp.x * (uCanvas.x / uCanvas.y), rp.y);
  q /= max(uScale, 0.0001);
  q /= 0.5 + 0.2 * dot(q, q);
  q += 0.2 * cos(t) - 7.56;
  vec2 toward = (uPointer - rp);
  q += toward * uMouseInfluence * 0.2;

    vec3 col = vec3(0.0);
    float a = 1.0;

    if (uColorCount > 0) {
      vec2 s = q;
      vec3 sumCol = vec3(0.0);
      float cover = 0.0;
      for (int i = 0; i < MAX_COLORS; ++i) {
            if (i >= uColorCount) break;
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3); // strong response across 0..1
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0); // allow >1 to amplify displacement
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(i)) / 4.0);
            float m = mix(m0, m1, kMix);
            float w = 1.0 - exp(-6.0 / exp(6.0 * m));
            sumCol += uColors[i] * w;
            cover = max(cover, w);
      }
      col = clamp(sumCol, 0.0, 1.0);
      a = uTransparent > 0 ? cover : 1.0;
    } else {
        vec2 s = q;
        for (int k = 0; k < 3; ++k) {
            s -= 0.01;
            vec2 r = sin(1.5 * (s.yx * uFrequency) + 2.0 * cos(s * uFrequency));
            float m0 = length(r + sin(5.0 * r.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float kBelow = clamp(uWarpStrength, 0.0, 1.0);
            float kMix = pow(kBelow, 0.3);
            float gain = 1.0 + max(uWarpStrength - 1.0, 0.0);
            vec2 disp = (r - s) * kBelow;
            vec2 warped = s + disp * gain;
            float m1 = length(warped + sin(5.0 * warped.y * uFrequency - 3.0 * t + float(k)) / 4.0);
            float m = mix(m0, m1, kMix);
            col[k] = 1.0 - exp(-6.0 / exp(6.0 * m));
        }
        a = uTransparent > 0 ? max(max(col.r, col.g), col.b) : 1.0;
    }

    if (uNoise > 0.0001) {
      float n = fract(sin(dot(gl_FragCoord.xy + vec2(uTime), vec2(12.9898, 78.233))) * 43758.5453123);
      col += (n - 0.5) * uNoise;
      col = clamp(col, 0.0, 1.0);
    }

    vec3 rgb = (uTransparent > 0) ? col * a : col;
    gl_FragColor = vec4(rgb, a);
}
`;

const vert = `
varying vec2 vUv;
void main() {
  vUv = uv;
  gl_Position = vec4(position, 1.0);
}
`;

export default class ColorBends {
    constructor(container, options = {}) {
        this.container = container;

        // User-Specific Parameters
        this.rotation = options.rotation || 0;
        this.speed = options.speed || 0.2;
        this.colors = options.colors || ["#6f2dbd", "#b298dc", "#b9faf8"];
        this.transparent = false; // FORCE OPAQUE so clearColor shows
        this.scale = options.scale || 1.0;
        this.frequency = options.frequency || 1.0;
        this.warpStrength = options.warpStrength || 1.0;
        this.mouseInfluence = options.mouseInfluence || 1.0;
        this.parallax = options.parallax || 0.5;
        this.noise = options.noise || 0.1;
        this.autoRotate = options.autoRotate || 0;

        this.pointer = new THREE.Vector2(0, 0);
        this.pointerTarget = new THREE.Vector2(0, 0);
        console.log("ColorBends: Initializing with parameters", this);
        this.init();
    }

    init() {
        if (typeof THREE === 'undefined') {
            console.error("ColorBends: THREE.js not found!");
            return;
        }

        this.scene = new THREE.Scene();
        this.camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.camera.position.z = 1;
        this.geometry = new THREE.PlaneGeometry(2, 2);

        const uColorsArray = Array.from({ length: MAX_COLORS }, () => new THREE.Vector3(0, 0, 0));

        const toVec3 = hex => {
            const h = hex.replace('#', '').trim();
            const v =
                h.length === 3
                    ? [parseInt(h[0] + h[0], 16), parseInt(h[1] + h[1], 16), parseInt(h[2] + h[2], 16)]
                    : [parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16)];
            return new THREE.Vector3(v[0] / 255, v[1] / 255, v[2] / 255);
        };

        const arr = (this.colors || []).filter(Boolean).slice(0, MAX_COLORS).map(toVec3);
        arr.forEach((vec, i) => uColorsArray[i].copy(vec));

        console.log("ColorBends: Shader Uniform uColorCount:", arr.length);

        this.material = new THREE.ShaderMaterial({
            vertexShader: vert,
            fragmentShader: frag,
            uniforms: {
                uCanvas: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) }, // Init with real size
                uTime: { value: 0 },
                uSpeed: { value: this.speed },
                uRot: { value: new THREE.Vector2(1, 0) },
                uColorCount: { value: arr.length },
                uColors: { value: uColorsArray },
                uTransparent: { value: 0 }, // Force opaque
                uScale: { value: this.scale },
                uFrequency: { value: this.frequency },
                uWarpStrength: { value: this.warpStrength },
                uPointer: { value: new THREE.Vector2(0, 0) },
                uMouseInfluence: { value: this.mouseInfluence },
                uParallax: { value: this.parallax },
                uNoise: { value: this.noise }
            },
            premultipliedAlpha: true,
            transparent: false
        });

        this.mesh = new THREE.Mesh(this.geometry, this.material);
        this.scene.add(this.mesh);

        this.renderer = new THREE.WebGLRenderer({
            antialias: false,
            powerPreference: 'high-performance',
            alpha: false // Opaque
        });

        this.renderer.outputColorSpace = THREE.SRGBColorSpace;
        this.renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        this.renderer.setClearColor(0x050011, 1); // Dark Purple Safety Background
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.domElement.style.display = "block"; // Vis Fix

        this.container.appendChild(this.renderer.domElement);
        this.clock = new THREE.Clock();

        this.bindEvents();
        this.handleResize(); // Initialize uniforms
        this.animate();
    }

    bindEvents() {
        window.addEventListener('resize', this.handleResize.bind(this));
        window.addEventListener('pointermove', this.handlePointerMove.bind(this));
    }

    handleResize() {
        const w = window.innerWidth;
        const h = window.innerHeight;
        this.renderer.setSize(w, h);
        if (this.material && this.material.uniforms && this.material.uniforms.uCanvas) {
            this.material.uniforms.uCanvas.value.set(w, h);
        }
    }

    handlePointerMove(e) {
        const x = (e.clientX / window.innerWidth) * 2 - 1;
        const y = -(e.clientY / window.innerHeight) * 2 + 1;
        this.pointerTarget.set(x, y);
    }

    animate() {
        this.rafId = requestAnimationFrame(this.animate.bind(this));

        const dt = this.clock.getDelta();
        const elapsed = this.clock.elapsedTime;
        this.material.uniforms.uTime.value = elapsed;

        const deg = (this.rotation % 360) + this.autoRotate * elapsed;
        const rad = (deg * Math.PI) / 180;
        this.material.uniforms.uRot.value.set(Math.cos(rad), Math.sin(rad));

        // Smooth pointer
        this.pointer.lerp(this.pointerTarget, 0.1); // simple smooth
        this.material.uniforms.uPointer.value.copy(this.pointer);

        this.renderer.render(this.scene, this.camera);
    }

    destroy() {
        cancelAnimationFrame(this.rafId);
        window.removeEventListener('resize', this.handleResize.bind(this));
        window.removeEventListener('pointermove', this.handlePointerMove.bind(this));
        this.geometry.dispose();
        this.material.dispose();
        this.renderer.dispose();
        if (this.renderer.domElement.parentElement) {
            this.renderer.domElement.parentElement.removeChild(this.renderer.domElement);
        }
    }
}
