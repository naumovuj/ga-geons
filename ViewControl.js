sbVertexShader = [
  "varying vec3 vWorldPosition;",
  "void main() {",
  "  vec4 worldPosition = modelMatrix * vec4( position, 1.0 );",
  "  vWorldPosition = worldPosition.xyz;",
  "  gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );",
  "}",
].join("\n");

sbFragmentShader = [
  "uniform vec3 topColor;",
  "uniform vec3 bottomColor;",
  "uniform float offset;",
  "uniform float exponent;",
  "varying vec3 vWorldPosition;",
  "void main() {",
  "  float h = normalize(vWorldPosition + offset).y;",
  "  gl_FragColor = vec4(mix(bottomColor, topColor, max(pow(h, exponent), 0.0)), 1.0);",
  "}",
].join("\n");

var GEON_SIZE = 1;

var ViewControl = {

  scene: null,
  camera: null,
  renderer: null,
  container: null,
  controls: null,
  clock: null,
  plane: null,
  offset: new THREE.Vector3(),

  GA: new GA(),
  geonGenerator: new GeonGenerator(GEON_SIZE),

  init: function() {
    // picture parameters
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
  
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;

    // create main scene
    this.scene = new THREE.Scene();

    // prepare perspective camera
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
    this.camera.name = "camera"; // #1
    this.scene.add(this.camera);
    this.camera.position.set(100, 0, 0);
    // this.camera.lookAt(new THREE.Vector3(0, 0, 0));

    // prepare webGL renderer
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(SCREEN_WIDTH, SCREEN_HEIGHT);
    this.renderer.setClearColor(this.scene.color);

    // prepare container
    var toolsMenu = document.getElementById('tools');
    this.container = document.createElement('div');
    document.body.appendChild(this.container);
    this.container.appendChild(this.renderer.domElement);
    this.container.appendChild(toolsMenu);

    // events
    THREEx.WindowResize(this.renderer, this.camera);
    document.addEventListener('mousedown', this.onDocumentMouseDown, false);
    document.addEventListener('mousemove', this.onDocumentMouseMove, false);
    document.addEventListener('mouseup', this.onDocumentMouseUp, false);

    // Prepare Orbit controls
    this.controls = new THREE.OrbitControls(this.camera);
    this.controls.target = new THREE.Vector3(0, 0, 0);
    this.controls.maxDistance = 250;

    // Prepare clock
    this.clock = new THREE.Clock();

    // Add lights
    var light = new THREE.AmbientLight(0x444444);
    light.name = "light"; // #2
    this.scene.add(light);

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();
    this.camera.add(dirLight);
    this.camera.add(dirLight.target);
    // Display skybox
    this.addSkybox();
    // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh(new THREE.PlaneBufferGeometry(500, 500, 8, 8),
                                new THREE.MeshBasicMaterial({color: 0xff0000}));
    this.plane.visible = false;
    this.plane.name = "plane"; // #3
    this.scene.add(this.plane);
    // show axes
    var axes = new THREE.AxisHelper(50);
    axes.name = "axes"; // #4
    this.scene.add(axes);
  },

  addSkybox: function() {
    var iSBrsize = 500;
    var uniforms =
    {
      topColor: {type: "c", value: new THREE.Color(0x0077ff)},
      bottomColor: {type: "c", value: new THREE.Color(0xffffff)},
      offset: {type: "f", value: iSBrsize},
      exponent: {type: "f", value: 1.5}
    }

    var skyGeo = new THREE.SphereGeometry(iSBrsize, 32, 32);
    var skyMat = new THREE.ShaderMaterial( { vertexShader: sbVertexShader,
                                             fragmentShader: sbFragmentShader,
                                             uniforms: uniforms,
                                             side: THREE.DoubleSide,
                                             fog: false } );
    var skyMesh = new THREE.Mesh(skyGeo, skyMat);
    
    skyMesh.name = "sky"; // #5
    this.scene.add(skyMesh);
  },

  runGA: function() {
    this.clearScene();
    var code = this.GA.evolve();
    var objs = this.GA.retrieveObjects(code);
    console.log("Geons number in the shape: " + objs.length);
    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];
      var geon = this.geonGenerator.createUserGeon(obj.geonTypeIndex);
      geon.solid.position.x = obj.x * this.geonGenerator.SIZE;
      geon.solid.position.y = obj.y * this.geonGenerator.SIZE;
      geon.solid.position.z = obj.z * this.geonGenerator.SIZE;
      geon.solid.name = "geon";
      this.scene.add(geon.solid);
    }
  },

  showShape: function() {
    this.clearScene();
    var code = this.GA.generateCode();
    var objs = this.GA.retrieveObjects(code);
    console.log("Geons number in the shape: " + objs.length);
    for (var i = 0; i < objs.length; i++) {
      var obj = objs[i];
      var geon = this.geonGenerator.createUserGeon(obj.geonTypeIndex);
      geon.solid.position.x = obj.x * this.geonGenerator.SIZE;
      geon.solid.position.y = obj.y * this.geonGenerator.SIZE;
      geon.solid.position.z = obj.z * this.geonGenerator.SIZE;
      geon.solid.name = "geon";
      this.scene.add(geon.solid);
    }
  },

  clearScene: function() {
    // this.scene.children[0] --> camera
    // this.scene.children[1] --> light
    // this.scene.children[2] --> sky
    // this.scene.children[3] --> plane
    // this.scene.children[4] --> axes
    
    // remove geons from the scene
    while (this.scene.children.length > 5) {
      if (this.scene.children[5].name == "geon") // just in case: not to delete smth important
        this.scene.remove(this.scene.children[5]);
    }
  }
};

// animate the scene
function animate() {
  requestAnimationFrame(animate);
  render();
  update();
}

// update controls
function update() {
  var delta = ViewControl.clock.getDelta();
  ViewControl.controls.update(delta);
}

// render the scene
function render() {
  if (ViewControl.renderer)
    ViewControl.renderer.render(ViewControl.scene, ViewControl.camera);
}

// initialize ViewControl on page load
function initializeViewControl() {
  ViewControl.init();
  animate();
}

if (window.addEventListener) {
  window.addEventListener('load', initializeViewControl, false);
} else if (window.attachEvent) {
    window.attachEvent('onload', initializeViewControl);
  }
  else {
    window.onload = initializeViewControl;
  }