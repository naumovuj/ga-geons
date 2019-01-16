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
  "  float h = normalize( vWorldPosition + offset ).y;",
  "  gl_FragColor = vec4( mix( bottomColor, topColor, max( pow( h, exponent ), 0.0 ) ), 1.0 );",
  "}",
].join("\n");

var ViewControl = {
  
  scene: null,
  camera: null,
  renderer: null,
  container: null,
  controls: null,
  clock: null,
  plane: null,
  selection: null,
  offset: new THREE.Vector3(),
  objects: [],
  raycaster: new THREE.Raycaster(),  
  geonGenerator: new GeonGenerator(),
  selectedToEdit: null,

  init: function()
  {
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
    this.controls.maxDistance = 150;

    // Prepare clock
    this.clock = new THREE.Clock();

    // Add lights
    this.scene.add( new THREE.AmbientLight(0x444444) );

    var dirLight = new THREE.DirectionalLight(0xffffff);
    dirLight.position.set(200, 200, 1000).normalize();
    this.camera.add(dirLight);
    this.camera.add(dirLight.target);

    // Display skybox
    this.addSkybox();

    // Plane, that helps to determinate an intersection position
    this.plane = new THREE.Mesh( new THREE.PlaneBufferGeometry(500, 500, 8, 8),
                                 new THREE.MeshBasicMaterial( {color: 0xff0000} ) );
    this.plane.visible = false;
    this.scene.add(this.plane);

    // show axes
    var axes = new THREE.AxisHelper(30);
    this.scene.add(axes);

  },

  addSkybox: function()
  {
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

  onDocumentMouseDown: function(event)
  {
    // Get mouse position
    var mouseX = 2 * event.clientX / window.innerWidth - 1;
    var mouseY = -2 * event.clientY / window.innerHeight + 1;

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(ViewControl.camera);

    // Set the raycaster position
    ViewControl.raycaster.set(ViewControl.camera.position,
                              vector.sub(ViewControl.camera.position).normalize());

    // Find all intersected objects
    var intersects = ViewControl.raycaster.intersectObjects(ViewControl.objects);

    if (intersects.length > 0) {
      // Disable the controls
      ViewControl.controls.enabled = false;

      // Set the selection - first intersected object
      ViewControl.selection = intersects[0].object;
      ViewControl.selectedToEdit = intersects[0].object;

      // Calculate the offset
      var intersects = ViewControl.raycaster.intersectObject(ViewControl.plane);
      ViewControl.offset.copy(intersects[0].point).sub(ViewControl.plane.position);
    }
    else
    {
      // ViewControl.selectedToEdit = null;
    }
  },

  onDocumentMouseMove: function(event) {
    event.preventDefault();

    // Get mouse position
    var mouseX = 2 * event.clientX / window.innerWidth - 1;
    var mouseY = -2 * event.clientY / window.innerHeight + 1;

    // Get 3D vector from 3D mouse position using 'unproject' function
    var vector = new THREE.Vector3(mouseX, mouseY, 1);
    vector.unproject(ViewControl.camera);

    // Set the raycaster position
    ViewControl.raycaster.set( ViewControl.camera.position,
                               vector.sub(ViewControl.camera.position).normalize() );
    if (ViewControl.selection)
    {
      // Check the position where the plane is intersected
      var intersects = ViewControl.raycaster.intersectObject(ViewControl.plane);
      // Reposition the object based on the intersection point with the plane
      ViewControl.selection.position.copy(intersects[0].point.sub(ViewControl.offset));      
    }
    else
    {
      // Update position of the plane if need
      var intersects = ViewControl.raycaster.intersectObjects(ViewControl.objects);
      if (intersects.length > 0)
      {
        ViewControl.plane.position.copy(intersects[0].object.position);
        ViewControl.plane.lookAt(ViewControl.camera.position);
      }
    }
  },

  onDocumentMouseUp: function(event) {
    // Enable the controls
    ViewControl.controls.enabled = true;
    ViewControl.selection = null;
  },

  addUserGeon: function(geonTypeIndex)
  {
    var geon = this.geonGenerator.addUserGeon(geonTypeIndex);
    
    geon.solid.position.x = 0;
    geon.solid.position.y = Math.random() * 50 - 25;
    geon.solid.position.z = Math.random() * 50 - 25;
    
    this.scene.add(geon.solid);
    this.objects.push(geon.solid);
  },

  scalePlusClick: function()
  {  
    if (ViewControl.selectedToEdit != null)
    {
      ViewControl.selectedToEdit.scale.set(ViewControl.selectedToEdit.scale.x * 1.1,
                                           ViewControl.selectedToEdit.scale.y * 1.1,
                                           ViewControl.selectedToEdit.scale.z * 1.1);
    }
  },

  scaleMinusClick: function()
  {
    if (ViewControl.selectedToEdit != null)
    {
      ViewControl.selectedToEdit.scale.set(ViewControl.selectedToEdit.scale.x * 0.9,
                                           ViewControl.selectedToEdit.scale.y * 0.9,
                                           ViewControl.selectedToEdit.scale.z * 0.9);
    }
  },

  rotateUpClick: function()
  {
    if (ViewControl.selectedToEdit != null)
    {
      ViewControl.selectedToEdit.rotation.y += 0.1;
    }    
  },
  
  rotateDownClick: function()
  {
    if (ViewControl.selectedToEdit != null)
    {
      ViewControl.selectedToEdit.rotation.y -= 0.1;
    }    
  },  
  
  rotateRightClick: function()
  {
    if (ViewControl.selectedToEdit != null)
    {
      ViewControl.selectedToEdit.rotation.x -= 0.1;
    }    
  },  
  
  rotateLeftClick: function()
  {
    if (ViewControl.selectedToEdit != null)
    {
      ViewControl.selectedToEdit.rotation.x += 0.1;
    }    
  },    
};



// animate the scene
function animate()
{
  requestAnimationFrame(animate);
  render();
  update();
}

// update controls
function update()
{
  var delta = ViewControl.clock.getDelta();
  ViewControl.controls.update(delta);
}

// render the scene
function render()
{
  if (ViewControl.renderer)
  {
    ViewControl.renderer.render(ViewControl.scene, ViewControl.camera);
  }
}

// initialize ViewControl on page load
function initializeViewControl()
{
  ViewControl.init();
  animate();
}

if (window.addEventListener)
{
  window.addEventListener('load', initializeViewControl, false);
}
else
{
  if (window.attachEvent) 
  {
    window.attachEvent('onload', initializeViewControl);
  }
  else
  {
    window.onload = initializeViewControl;
  }
}
