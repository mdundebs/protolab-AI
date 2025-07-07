import { DocumentContext } from './document-intelligence';

export interface Video3DSlide {
  slideNumber: number;
  title: string;
  subtitle?: string;
  content: string[];
  animation: {
    type: '3d_rotate' | '3d_zoom' | '3d_flip' | '3d_cube' | '3d_spiral';
    duration: number;
    easing: string;
    perspective: number;
  };
  threeDElements: {
    geometry: 'sphere' | 'cube' | 'cylinder' | 'pyramid' | 'torus';
    material: 'metallic' | 'glass' | 'plastic' | 'fabric' | 'neon';
    lighting: 'ambient' | 'directional' | 'point' | 'spotlight';
    environment: 'studio' | 'outdoor' | 'futuristic' | 'minimal';
  };
  visualEffects: {
    particles: boolean;
    fog: boolean;
    bloom: boolean;
    shadows: boolean;
  };
  cameraMovement: {
    path: 'orbit' | 'dolly' | 'crane' | 'tracking' | 'static';
    speed: number;
    focus: 'center' | 'object' | 'text' | 'dynamic';
  };
}

export interface Video3DPitch {
  title: string;
  duration: number; // in seconds
  resolution: {
    width: number;
    height: number;
    fps: number;
  };
  audio: {
    narration: boolean;
    backgroundMusic: string;
    soundEffects: boolean;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
    style: 'corporate' | 'modern' | 'futuristic' | 'creative' | 'minimal';
  };
  slides: Video3DSlide[];
  transitions: {
    type: 'morph' | 'dissolve' | 'wipe' | 'zoom' | 'rotate';
    duration: number;
  };
  branding: {
    logo?: string;
    watermark: boolean;
    brandColors: string[];
  };
}

export function generate3DVideoPitch(
  businessData: {
    businessName: string;
    industry: string;
    country: string;
    businessType: string;
    description: string;
    fundingAmount: number;
    useCase: string;
  },
  context?: DocumentContext
): Video3DPitch {
  
  const industryThemes = {
    'agtech': {
      primaryColor: '#2E7D32',
      secondaryColor: '#4CAF50',
      accentColor: '#81C784',
      style: 'modern' as const,
      environment: 'outdoor' as const
    },
    'fintech': {
      primaryColor: '#1565C0',
      secondaryColor: '#2196F3',
      accentColor: '#64B5F6',
      style: 'corporate' as const,
      environment: 'futuristic' as const
    },
    'healthtech': {
      primaryColor: '#C62828',
      secondaryColor: '#F44336',
      accentColor: '#EF5350',
      style: 'minimal' as const,
      environment: 'studio' as const
    },
    'default': {
      primaryColor: '#1976D2',
      secondaryColor: '#2196F3',
      accentColor: '#42A5F5',
      style: 'modern' as const,
      environment: 'futuristic' as const
    }
  };

  const theme = industryThemes[businessData.industry.toLowerCase() as keyof typeof industryThemes] || industryThemes.default;

  const slides: Video3DSlide[] = [
    {
      slideNumber: 1,
      title: businessData.businessName,
      subtitle: `Transforming ${businessData.industry} in ${businessData.country}`,
      content: [
        businessData.description,
        `Seeking $${(businessData.fundingAmount || 100000).toLocaleString()} for ${businessData.useCase || 'growth and expansion'}`,
        "Revolutionary 3D Innovation Showcase"
      ],
      animation: {
        type: '3d_spiral',
        duration: 5,
        easing: 'ease-in-out',
        perspective: 1200
      },
      threeDElements: {
        geometry: 'sphere',
        material: 'metallic',
        lighting: 'spotlight',
        environment: theme.environment
      },
      visualEffects: {
        particles: true,
        fog: false,
        bloom: true,
        shadows: true
      },
      cameraMovement: {
        path: 'orbit',
        speed: 0.5,
        focus: 'center'
      }
    },
    {
      slideNumber: 2,
      title: "Market Opportunity",
      subtitle: `${businessData.country} ${businessData.industry} Revolution`,
      content: [
        `Total Addressable Market: $${(businessData.fundingAmount * 200).toLocaleString()}M`,
        `Rapid growth driven by digital transformation`,
        `First-mover advantage in emerging technologies`,
        `Massive untapped potential in African markets`
      ],
      animation: {
        type: '3d_cube',
        duration: 4,
        easing: 'cubic-bezier(0.4, 0, 0.2, 1)',
        perspective: 1000
      },
      threeDElements: {
        geometry: 'cube',
        material: 'glass',
        lighting: 'directional',
        environment: 'futuristic'
      },
      visualEffects: {
        particles: false,
        fog: true,
        bloom: false,
        shadows: true
      },
      cameraMovement: {
        path: 'dolly',
        speed: 0.3,
        focus: 'object'
      }
    },
    {
      slideNumber: 3,
      title: "Our Solution",
      subtitle: "Innovation Meets Implementation",
      content: [
        businessData.description,
        "Proprietary technology stack with measurable results",
        "Scalable architecture built for African growth",
        "User-centric design with seamless integration"
      ],
      animation: {
        type: '3d_flip',
        duration: 3.5,
        easing: 'ease-out',
        perspective: 800
      },
      threeDElements: {
        geometry: 'pyramid',
        material: 'neon',
        lighting: 'point',
        environment: 'minimal'
      },
      visualEffects: {
        particles: true,
        fog: false,
        bloom: true,
        shadows: false
      },
      cameraMovement: {
        path: 'crane',
        speed: 0.4,
        focus: 'text'
      }
    },
    {
      slideNumber: 4,
      title: "Technology Stack",
      subtitle: "3D Visualization of Our Architecture",
      content: [
        "AI-powered core processing engine",
        "Blockchain-secured transaction layer", 
        "IoT sensor network integration",
        "Real-time analytics dashboard"
      ],
      animation: {
        type: '3d_rotate',
        duration: 6,
        easing: 'linear',
        perspective: 1500
      },
      threeDElements: {
        geometry: 'torus',
        material: 'metallic',
        lighting: 'ambient',
        environment: 'studio'
      },
      visualEffects: {
        particles: true,
        fog: true,
        bloom: true,
        shadows: true
      },
      cameraMovement: {
        path: 'tracking',
        speed: 0.2,
        focus: 'dynamic'
      }
    },
    {
      slideNumber: 5,
      title: "Financial Projections",
      subtitle: "3D Growth Trajectory",
      content: [
        `Year 1 Revenue: $${(businessData.fundingAmount * 0.5).toLocaleString()}k`,
        `Year 2 Revenue: $${(businessData.fundingAmount * 1.5).toLocaleString()}k`,
        `Year 3 Revenue: $${(businessData.fundingAmount * 3).toLocaleString()}k`,
        "Break-even by Month 18 with exponential growth"
      ],
      animation: {
        type: '3d_zoom',
        duration: 4.5,
        easing: 'ease-in-out',
        perspective: 1200
      },
      threeDElements: {
        geometry: 'cylinder',
        material: 'glass',
        lighting: 'spotlight',
        environment: 'futuristic'
      },
      visualEffects: {
        particles: false,
        fog: false,
        bloom: true,
        shadows: true
      },
      cameraMovement: {
        path: 'orbit',
        speed: 0.6,
        focus: 'center'
      }
    },
    {
      slideNumber: 6,
      title: "Join the Revolution",
      subtitle: `The Future of ${businessData.industry} Starts Here`,
      content: [
        "Transform your industry with cutting-edge innovation",
        "Partner with Africa's most ambitious entrepreneurs",
        "Scale across continental markets with proven technology",
        "Contact us to be part of the next big breakthrough"
      ],
      animation: {
        type: '3d_spiral',
        duration: 5,
        easing: 'ease-out',
        perspective: 1000
      },
      threeDElements: {
        geometry: 'sphere',
        material: 'neon',
        lighting: 'point',
        environment: 'outdoor'
      },
      visualEffects: {
        particles: true,
        fog: true,
        bloom: true,
        shadows: false
      },
      cameraMovement: {
        path: 'dolly',
        speed: 0.3,
        focus: 'text'
      }
    }
  ];

  return {
    title: `${businessData.businessName} - 3D Innovation Showcase`,
    duration: 30, // 30 seconds total
    resolution: {
      width: 1920,
      height: 1080,
      fps: 60
    },
    audio: {
      narration: true,
      backgroundMusic: `${businessData.industry.toLowerCase()}_ambient`,
      soundEffects: true
    },
    theme: {
      primaryColor: theme.primaryColor,
      secondaryColor: theme.secondaryColor,
      accentColor: theme.accentColor,
      style: theme.style
    },
    slides,
    transitions: {
      type: 'morph',
      duration: 1.5
    },
    branding: {
      watermark: true,
      brandColors: [theme.primaryColor, theme.secondaryColor, theme.accentColor]
    }
  };
}

export function generate3DVideoHTML(videoPitch: Video3DPitch): string {
  return `
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>${videoPitch.title}</title>
    <script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>
    <style>
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            background: linear-gradient(135deg, ${videoPitch.theme.primaryColor}15 0%, ${videoPitch.theme.secondaryColor}15 100%);
            font-family: 'Arial', sans-serif;
            overflow: hidden;
            height: 100vh;
        }
        
        #canvas-container {
            position: relative;
            width: 100vw;
            height: 100vh;
        }
        
        #three-canvas {
            position: absolute;
            top: 0;
            left: 0;
            z-index: 1;
        }
        
        #content-overlay {
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            z-index: 2;
            pointer-events: none;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            color: white;
        }
        
        .slide-title {
            font-size: 4rem;
            font-weight: 900;
            margin-bottom: 1rem;
            text-shadow: 2px 2px 4px rgba(0,0,0,0.7);
            opacity: 0;
            transform: translateY(50px);
            transition: all 1s ease-out;
        }
        
        .slide-title.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .slide-subtitle {
            font-size: 1.8rem;
            margin-bottom: 2rem;
            color: ${videoPitch.theme.accentColor};
            text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
            opacity: 0;
            transform: translateY(30px);
            transition: all 1s ease-out 0.5s;
        }
        
        .slide-subtitle.active {
            opacity: 1;
            transform: translateY(0);
        }
        
        .slide-content {
            max-width: 800px;
            margin: 0 auto;
        }
        
        .slide-content ul {
            list-style: none;
            font-size: 1.3rem;
            line-height: 2;
        }
        
        .slide-content li {
            margin-bottom: 1rem;
            padding: 0.5rem 1rem;
            background: rgba(255,255,255,0.1);
            border-radius: 8px;
            backdrop-filter: blur(10px);
            opacity: 0;
            transform: translateX(-50px);
            transition: all 0.8s ease-out;
        }
        
        .slide-content li.active {
            opacity: 1;
            transform: translateX(0);
        }
        
        .controls {
            position: absolute;
            bottom: 20px;
            left: 50%;
            transform: translateX(-50%);
            z-index: 3;
            display: flex;
            gap: 10px;
        }
        
        .control-btn {
            padding: 10px 20px;
            background: ${videoPitch.theme.primaryColor};
            color: white;
            border: none;
            border-radius: 25px;
            cursor: pointer;
            font-weight: bold;
            transition: all 0.3s ease;
            pointer-events: auto;
        }
        
        .control-btn:hover {
            background: ${videoPitch.theme.secondaryColor};
            transform: scale(1.05);
        }
        
        .progress-bar {
            position: absolute;
            bottom: 0;
            left: 0;
            height: 4px;
            background: ${videoPitch.theme.accentColor};
            transition: width 0.1s ease;
            z-index: 3;
        }
    </style>
</head>
<body>
    <div id="canvas-container">
        <canvas id="three-canvas"></canvas>
        <div id="content-overlay">
            <div class="slide-content">
                <h1 class="slide-title"></h1>
                <h2 class="slide-subtitle"></h2>
                <ul class="slide-list"></ul>
            </div>
        </div>
        <div class="controls">
            <button class="control-btn" onclick="previousSlide()">Previous</button>
            <button class="control-btn" onclick="playPause()">Play/Pause</button>
            <button class="control-btn" onclick="nextSlide()">Next</button>
        </div>
        <div class="progress-bar" id="progress"></div>
    </div>

    <script>
        // 3D Scene Setup
        let scene, camera, renderer, currentMesh;
        let currentSlide = 0;
        let isPlaying = false;
        let slideStartTime = 0;
        
        const slides = ${JSON.stringify(videoPitch.slides)};
        const totalDuration = ${videoPitch.duration};
        
        function initThreeJS() {
            scene = new THREE.Scene();
            camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
            renderer = new THREE.WebGLRenderer({ 
                canvas: document.getElementById('three-canvas'),
                alpha: true,
                antialias: true
            });
            
            renderer.setSize(window.innerWidth, window.innerHeight);
            renderer.shadowMap.enabled = true;
            renderer.shadowMap.type = THREE.PCFSoftShadowMap;
            
            // Lighting setup
            const ambientLight = new THREE.AmbientLight(0x404040, 0.6);
            scene.add(ambientLight);
            
            const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
            directionalLight.position.set(10, 10, 5);
            directionalLight.castShadow = true;
            scene.add(directionalLight);
            
            camera.position.z = 5;
            
            displaySlide(0);
        }
        
        function create3DObject(slide) {
            if (currentMesh) {
                scene.remove(currentMesh);
            }
            
            let geometry;
            switch(slide.threeDElements.geometry) {
                case 'sphere':
                    geometry = new THREE.SphereGeometry(1.5, 32, 32);
                    break;
                case 'cube':
                    geometry = new THREE.BoxGeometry(2, 2, 2);
                    break;
                case 'cylinder':
                    geometry = new THREE.CylinderGeometry(1, 1, 2, 32);
                    break;
                case 'pyramid':
                    geometry = new THREE.ConeGeometry(1.5, 2, 8);
                    break;
                case 'torus':
                    geometry = new THREE.TorusGeometry(1.2, 0.4, 16, 100);
                    break;
                default:
                    geometry = new THREE.SphereGeometry(1.5, 32, 32);
            }
            
            let material;
            switch(slide.threeDElements.material) {
                case 'metallic':
                    material = new THREE.MeshStandardMaterial({ 
                        color: '${videoPitch.theme.primaryColor}',
                        metalness: 0.8,
                        roughness: 0.2
                    });
                    break;
                case 'glass':
                    material = new THREE.MeshPhysicalMaterial({
                        color: '${videoPitch.theme.secondaryColor}',
                        metalness: 0,
                        roughness: 0,
                        transmission: 0.9,
                        transparent: true
                    });
                    break;
                case 'neon':
                    material = new THREE.MeshBasicMaterial({
                        color: '${videoPitch.theme.accentColor}',
                        emissive: '${videoPitch.theme.accentColor}',
                        emissiveIntensity: 0.5
                    });
                    break;
                default:
                    material = new THREE.MeshStandardMaterial({ 
                        color: '${videoPitch.theme.primaryColor}'
                    });
            }
            
            currentMesh = new THREE.Mesh(geometry, material);
            currentMesh.castShadow = true;
            currentMesh.receiveShadow = true;
            scene.add(currentMesh);
            
            return currentMesh;
        }
        
        function animateObject(slide, mesh) {
            const animation = slide.animation;
            const startTime = Date.now();
            
            function animate() {
                const elapsed = (Date.now() - startTime) / 1000;
                const progress = Math.min(elapsed / animation.duration, 1);
                
                switch(animation.type) {
                    case '3d_rotate':
                        mesh.rotation.x = progress * Math.PI * 2;
                        mesh.rotation.y = progress * Math.PI * 4;
                        break;
                    case '3d_zoom':
                        const scale = 0.5 + Math.sin(progress * Math.PI * 2) * 0.5;
                        mesh.scale.set(scale, scale, scale);
                        break;
                    case '3d_flip':
                        mesh.rotation.y = progress * Math.PI;
                        break;
                    case '3d_cube':
                        mesh.rotation.x = progress * Math.PI / 2;
                        mesh.rotation.z = progress * Math.PI / 3;
                        break;
                    case '3d_spiral':
                        mesh.rotation.y = progress * Math.PI * 6;
                        mesh.position.y = Math.sin(progress * Math.PI * 4) * 0.5;
                        break;
                }
                
                if (progress < 1 && isPlaying) {
                    requestAnimationFrame(animate);
                }
            }
            
            animate();
        }
        
        function displaySlide(index) {
            if (index < 0 || index >= slides.length) return;
            
            currentSlide = index;
            const slide = slides[index];
            
            // Update content
            document.querySelector('.slide-title').textContent = slide.title;
            document.querySelector('.slide-subtitle').textContent = slide.subtitle || '';
            
            const listElement = document.querySelector('.slide-list');
            listElement.innerHTML = '';
            slide.content.forEach((item, i) => {
                const li = document.createElement('li');
                li.textContent = item;
                li.style.transitionDelay = \`\${i * 0.2}s\`;
                listElement.appendChild(li);
            });
            
            // Trigger animations
            setTimeout(() => {
                document.querySelector('.slide-title').classList.add('active');
                document.querySelector('.slide-subtitle').classList.add('active');
                document.querySelectorAll('.slide-content li').forEach(li => {
                    li.classList.add('active');
                });
            }, 100);
            
            // Create and animate 3D object
            const mesh = create3DObject(slide);
            animateObject(slide, mesh);
            
            slideStartTime = Date.now();
        }
        
        function nextSlide() {
            if (currentSlide < slides.length - 1) {
                displaySlide(currentSlide + 1);
            }
        }
        
        function previousSlide() {
            if (currentSlide > 0) {
                displaySlide(currentSlide - 1);
            }
        }
        
        function playPause() {
            isPlaying = !isPlaying;
            if (isPlaying) {
                autoProgress();
            }
        }
        
        function autoProgress() {
            if (!isPlaying) return;
            
            const slideProgress = (Date.now() - slideStartTime) / 1000;
            const slideDuration = totalDuration / slides.length;
            
            if (slideProgress >= slideDuration) {
                if (currentSlide < slides.length - 1) {
                    nextSlide();
                } else {
                    isPlaying = false;
                    currentSlide = 0;
                    displaySlide(0);
                }
            }
            
            // Update progress bar
            const totalProgress = ((currentSlide * slideDuration) + slideProgress) / totalDuration;
            document.getElementById('progress').style.width = \`\${totalProgress * 100}%\`;
            
            if (isPlaying) {
                requestAnimationFrame(autoProgress);
            }
        }
        
        function animate3D() {
            requestAnimationFrame(animate3D);
            renderer.render(scene, camera);
        }
        
        window.addEventListener('resize', () => {
            camera.aspect = window.innerWidth / window.innerHeight;
            camera.updateProjectionMatrix();
            renderer.setSize(window.innerWidth, window.innerHeight);
        });
        
        // Initialize
        initThreeJS();
        animate3D();
        
        // Auto-start after 2 seconds
        setTimeout(() => {
            isPlaying = true;
            autoProgress();
        }, 2000);
    </script>
</body>
</html>
  `;
}