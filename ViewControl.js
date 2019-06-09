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
  objects: [], // VN: geons added to the current view

  init: function() {

    // picture parameters
    var SCREEN_WIDTH = window.innerWidth, SCREEN_HEIGHT = window.innerHeight;
    var VIEW_ANGLE = 45, ASPECT = SCREEN_WIDTH / SCREEN_HEIGHT, NEAR = 1, FAR = 1000;

    // create main scene
    this.scene = new THREE.Scene();

    // prepare perspective camera
    this.camera = new THREE.PerspectiveCamera(VIEW_ANGLE, ASPECT, NEAR, FAR);
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
    this.scene.add(new THREE.AmbientLight(0x444444) );

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
    this.scene.add(this.plane);

    // show axes
    var axes = new THREE.AxisHelper(50);
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
    skyMat = new THREE.ShaderMaterial( { vertexShader: sbVertexShader,
                                         fragmentShader: sbFragmentShader,
                                         uniforms: uniforms,
                                         side: THREE.DoubleSide,
                                         fog: false } );
    skyMesh = new THREE.Mesh(skyGeo, skyMat);
    this.scene.add(skyMesh);
  },

  showShape: function() {
    
    // clear current view
    // this.init();
    this.objects = new Array(); 

    var code = this.GA.generateCode();
    console.log(code);

    var objs = this.GA.objects; //retrieveObjects(code);
    console.log(objs);

    for (var i = 0; i < objs.length; i++) {

      var obj = objs[i];

      var geon = this.geonGenerator.createUserGeon(obj.geonTypeIndex);
      geon.solid.position.x = obj.x * this.geonGenerator.SIZE;
      geon.solid.position.y = obj.y * this.geonGenerator.SIZE;
      geon.solid.position.z = obj.z * this.geonGenerator.SIZE;
      this.scene.add(geon.solid);
      this.objects.push(geon.solid);
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