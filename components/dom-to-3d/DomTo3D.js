const _position = new THREE.Vector3();
const _quaternion = new THREE.Quaternion();
const _scale = new THREE.Vector3();

class CSS3DObject extends THREE.Object3D {
  constructor(element = document.createElement("div")) {
    super();

    this.isCSS3DObject = true;

    this.element = element;
    this.element.style.position = "absolute";
    this.element.style.pointerEvents = "auto";
    this.element.style.userSelect = "none";

    this.element.setAttribute("draggable", false);

    this.addEventListener("removed", function () {
      this.traverse(function (object) {
        if (
          object.element instanceof Element &&
          object.element.parentNode !== null
        ) {
          object.element.parentNode.removeChild(object.element);
        }
      });
    });
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    this.element = source.element.cloneNode(true);

    return this;
  }
}

class CSS3DSprite extends CSS3DObject {
  constructor(element) {
    super(element);

    this.isCSS3DSprite = true;

    this.rotation2D = 0;
  }

  copy(source, recursive) {
    super.copy(source, recursive);

    this.rotation2D = source.rotation2D;

    return this;
  }
}

//

const _matrix = new THREE.Matrix4();
const _matrix2 = new THREE.Matrix4();

class CSS3DRenderer {
  constructor(parameters = {}) {
    const _this = this;

    let _width, _height;
    let _widthHalf, _heightHalf;

    const cache = {
      camera: { fov: 0, style: "" },
      objects: new WeakMap(),
    };

    const domElement =
      parameters.element !== undefined
        ? parameters.element
        : document.createElement("div");

    domElement.style.overflow = "hidden";
    domElement.style.position = "absolute";
    domElement.style.top = "0";
    domElement.style.pointerEvents = "none";
    this.domElement = domElement;

    const cameraElement = document.createElement("div");

    cameraElement.style.transformStyle = "preserve-3d";
    cameraElement.style.pointerEvents = "none";

    domElement.appendChild(cameraElement);

    this.getSize = function () {
      return {
        width: _width,
        height: _height,
      };
    };

    this.render = function (scene, camera) {
      const fov = camera.projectionMatrix.elements[5] * _heightHalf;

      if (cache.camera.fov !== fov) {
        domElement.style.perspective = camera.isPerspectiveCamera
          ? fov + "px"
          : "";
        cache.camera.fov = fov;
      }

      if (scene.autoUpdate === true) scene.updateMatrixWorld();
      if (camera.parent === null) camera.updateMatrixWorld();

      let tx, ty;

      if (camera.isOrthographicCamera) {
        tx = -(camera.right + camera.left) / 2;
        ty = (camera.top + camera.bottom) / 2;
      }

      const cameraCSSMatrix = camera.isOrthographicCamera
        ? "scale(" +
          fov +
          ")" +
          "translate(" +
          epsilon(tx) +
          "px," +
          epsilon(ty) +
          "px)" +
          getCameraCSSMatrix(camera.matrixWorldInverse)
        : "translateZ(" +
          fov +
          "px)" +
          getCameraCSSMatrix(camera.matrixWorldInverse);

      const style =
        cameraCSSMatrix +
        "translate(" +
        _widthHalf +
        "px," +
        _heightHalf +
        "px)";

      if (cache.camera.style !== style) {
        cameraElement.style.transform = style;

        cache.camera.style = style;
      }

      renderObject(scene, scene, camera, cameraCSSMatrix);
    };

    this.setSize = function (width, height) {
      _width = width;
      _height = height;
      _widthHalf = _width / 2;
      _heightHalf = _height / 2;

      domElement.style.width = width + "px";
      domElement.style.height = height + "px";

      cameraElement.style.width = width + "px";
      cameraElement.style.height = height + "px";
    };

    function epsilon(value) {
      return Math.abs(value) < 1e-10 ? 0 : value;
    }

    function getCameraCSSMatrix(matrix) {
      const elements = matrix.elements;

      return (
        "matrix3d(" +
        epsilon(elements[0]) +
        "," +
        epsilon(-elements[1]) +
        "," +
        epsilon(elements[2]) +
        "," +
        epsilon(elements[3]) +
        "," +
        epsilon(elements[4]) +
        "," +
        epsilon(-elements[5]) +
        "," +
        epsilon(elements[6]) +
        "," +
        epsilon(elements[7]) +
        "," +
        epsilon(elements[8]) +
        "," +
        epsilon(-elements[9]) +
        "," +
        epsilon(elements[10]) +
        "," +
        epsilon(elements[11]) +
        "," +
        epsilon(elements[12]) +
        "," +
        epsilon(-elements[13]) +
        "," +
        epsilon(elements[14]) +
        "," +
        epsilon(elements[15]) +
        ")"
      );
    }

    function getObjectCSSMatrix(matrix) {
      const elements = matrix.elements;
      const matrix3d =
        "matrix3d(" +
        epsilon(elements[0]) +
        "," +
        epsilon(elements[1]) +
        "," +
        epsilon(elements[2]) +
        "," +
        epsilon(elements[3]) +
        "," +
        epsilon(-elements[4]) +
        "," +
        epsilon(-elements[5]) +
        "," +
        epsilon(-elements[6]) +
        "," +
        epsilon(-elements[7]) +
        "," +
        epsilon(elements[8]) +
        "," +
        epsilon(elements[9]) +
        "," +
        epsilon(elements[10]) +
        "," +
        epsilon(elements[11]) +
        "," +
        epsilon(elements[12]) +
        "," +
        epsilon(elements[13]) +
        "," +
        epsilon(elements[14]) +
        "," +
        epsilon(elements[15]) +
        ")";

      return "translate(-50%,-50%)" + matrix3d;
    }

    function renderObject(object, scene, camera, cameraCSSMatrix) {
      if (object.isCSS3DObject) {
        const visible =
          object.visible === true && object.layers.test(camera.layers) === true;
        object.element.style.display = visible === true ? "" : "none";

        if (visible === true) {
          object.onBeforeRender(_this, scene, camera);

          let style;

          if (object.isCSS3DSprite) {
            // http://swiftcoder.wordpress.com/2008/11/25/constructing-a-billboard-matrix/

            _matrix.copy(camera.matrixWorldInverse);
            _matrix.transpose();

            if (object.rotation2D !== 0)
              _matrix.multiply(_matrix2.makeRotationZ(object.rotation2D));

            object.matrixWorld.decompose(_position, _quaternion, _scale);
            _matrix.setPosition(_position);
            _matrix.scale(_scale);

            _matrix.elements[3] = 0;
            _matrix.elements[7] = 0;
            _matrix.elements[11] = 0;
            _matrix.elements[15] = 1;

            style = getObjectCSSMatrix(_matrix);
          } else {
            style = getObjectCSSMatrix(object.matrixWorld);
          }

          const element = object.element;
          const cachedObject = cache.objects.get(object);

          if (cachedObject === undefined || cachedObject.style !== style) {
            element.style.transform = style;

            const objectData = { style: style };
            cache.objects.set(object, objectData);
          }

          if (element.parentNode !== cameraElement) {
            cameraElement.appendChild(element);
          }

          object.onAfterRender(_this, scene, camera);
        }
      }

      for (let i = 0, l = object.children.length; i < l; i++) {
        renderObject(object.children[i], scene, camera, cameraCSSMatrix);
      }
    }
  }
}

/**
 * Useful for projecting to scale high-resolution DOM elements
 */
const cssFactor = 100;

class DOMContext {
  /**
   * Whether to enable the `DOMContext` and its projection. Default is `true.`
   */
  enabled;
  /**
   * Renderer used for rendering the DOM
   */
  cssRenderer;
  /**
   * Target DOM element to render to
   */
  domElement;
  /**
   * Camera used for CSS projection
   */
  cssCamera;
  /**
   * Parent camera used to sync with WebGL
   */
  camera;
  /**
   * CSS scene used to contain CSS projections
   */
  cssScene;

  /**
   * DOM context instance
   * @param {THREE.PerspectiveCamera} camera  A perspective camera instance to draw from
   */
  constructor(camera) {
    // Set default settings
    this.enabled = true;

    // Init renderer
    this.cssRenderer = new CSS3DRenderer();
    this.domElement = this.cssRenderer.domElement;

    // Init camera
    this.cssCamera = new THREE.PerspectiveCamera(
      camera.fov,
      camera.aspect,
      camera.near * cssFactor,
      camera.far * cssFactor
    );
    this.camera = camera;
    this.camVec = new THREE.Vector3();
    this.camQuat = new THREE.Quaternion();

    // Init scene
    this.cssScene = new THREE.Scene();

    // Bind update
    this.update = this.update.bind(this);
  }

  /**
   * Resizes the DOM context's renderer and camera
   * @param {Number} width Target width
   * @param {Number} height Target height
   */
  setSize(width, height) {
    this.cssRenderer.setSize(width, height);
    this.cssCamera.aspect = width / height;
    this.cssCamera.updateProjectionMatrix();
  }

  /**
   * Updates the DOM context's renderer and camera states
   */
  update() {
    // Sync CSS camera with WebGL camera
    this.camera.getWorldPosition(this.camVec);
    this.camera.getWorldQuaternion(this.camQuat);
    this.cssCamera.quaternion.copy(this.camQuat);
    this.cssCamera.position.copy(this.camVec).multiplyScalar(cssFactor);

    // Update descendants
    if (this.enabled) {
      this.cssScene.traverse((element) => {
        if (!element.update) return;

        element.update();
      });
    }

    // Render projection
    this.cssRenderer.render(this.cssScene, this.cssCamera);
  }
}

class DOMElement extends THREE.Mesh {
  /**
   * The active `DOMContext` to draw on
   */
  context;
  /**
   * The projected 2D DOM element
   */
  domElement;
  /**
   * DOM element aspect artio
   */
  aspectRatio;
  /**
   * DOM element width
   */
  elementWidth;
  /**
   * DOM element height
   */
  elementHeight;
  /**
   * 3D projection width
   */
  width;
  /**
   * 3D projection height
   */
  height;
  /**
   * The projecting 3D object
   */
  cssObject;
  /**
   * Internal `Vector3` for WebGL size/scale calculations
   */
  size;
  /**
   * Internal `Box` used for bounding box calculations
   */
  box;

  /**
   * DOM element that is projected into 3D space
   * @param {DOMContext} context A DOM context instance to draw on
   * @param {HTMLElement} domElement A DOM element to project
   * @param {Object} options DOM element options
   * @param {Number} options.elementWidth DOM element width
   * @param {Number} options.width 3D plane width
   * @param {Number} options.height 3D plane height
   */
  constructor(context, domElement, width, height, elementWidth = 768) {
    // Create portal mesh
    const geometry = new THREE.PlaneGeometry(width, height);
    const material = new THREE.MeshBasicMaterial({
      transparent: true,
      opacity: 0,
      blending: THREE.NoBlending,
      side: THREE.DoubleSide,
    });
    super(geometry, material);
    console.log(domElement);
    // Expose params
    this.context = context;
    this.domElement = domElement;
    this.aspectRatio = height / width;
    this.elementWidth = elementWidth;
    this.elementHeight = this.elementWidth * this.aspectRatio;
    this.width = width;
    this.height = height;

    this.worldPos = new THREE.Vector3();

    // Set initial size
    this.resizeElement();

    // Init 3D DOM
    this.cssObject = new CSS3DObject(this.domElement);
    this.cssObject.scale.multiplyScalar(
      cssFactor / (this.elementWidth / this.width)
    );

    // Init helpers
    this.size = new THREE.Vector3();
    this.box = new THREE.Box3();

    // Init events
    this.addEventListener("added", this.handleAdded);
    this.addEventListener("removed", this.handleRemoved);

    // Bind update
    this.update = this.update.bind(this);
  }

  /**
   * Adds the current cssObject to the scene
   */
  handleAdded() {
    this.context.cssScene.add(this.cssObject);
  }

  /**
   * Removes the current cssObject from the scene
   */
  handleRemoved() {
    this.context.cssScene.remove(this.cssObject);
  }

  /**
   * Resizes DOM element to sync with projection
   */
  resizeElement() {
    this.domElement.style.width = `${this.elementWidth}px`;
    this.domElement.style.height = `${this.elementHeight}px`;
  }

  /**
   * Updates the projected DOM element
   * @param {HTMLElement} domElement A DOM element to project
   */
  setElement(domElement) {
    // Cleanup previous element
    if (this.domElement.parentNode) {
      this.domElement.parentNode.removeChild(this.domElement);
    }

    // Set new element
    this.domElement = domElement;
    this.cssObject.element = domElement;

    // Reset element size
    this.resizeElement();
  }

  /**
   * Updates the DOM element and its projection states
   */
  update() {
    // Get global transform
    this.updateMatrixWorld();
    const worldMatrix = this.matrixWorld;
    // worldMatrix.decompose(this.position, this.quaternion, this.scale);

    this.getWorldPosition(this.worldPos);
    // Sync CSS properties with WebGL mesh
    this.cssObject.quaternion.copy(this.quaternion);
    this.cssObject.position.copy(this.worldPos).multiplyScalar(cssFactor);

    // Calculate CSS scale factor
    this.box.setFromObject(this).getSize(this.size);
    const scaleFactor = this.elementWidth / (this.size.x * this.scale.x);

    // Sync CSS scale with WebGL projection
    // this.cssObject.scale.multiplyScalar(cssFactor / scaleFactor);
    this.cssObject.visible = this.visible;
  }

  /**
   * Disposes WebGL and DOM elements
   */
  dispose() {
    // Cleanup events
    this.removeEventListener("added", this.handleAdded);
    this.removeEventListener("removed", this.handleRemoved);

    // Cleanup DOM
    this.domElement.remove();

    // Cleanup WebGL
    this.geometry.dispose();
    this.material.dispose();
  }
}

// ---------------------------------------------------- COMPONENT BEGINS HERE -------------------------------------------------------------------- //

AFRAME.registerComponent("dom-element", {
  schema: {
    element: { default: "" },
    url: { default: "" },
    height: { default: 1 },
    width: { default: 1 },
    elementWidth: { default: 500 },
  },
  init: function () {},
  postLoad: function () {
    this.context = new DOMContext(this.el.sceneEl.camera, this.el);
    this.context.setSize(window.innerWidth, window.innerHeight);
    document.body.appendChild(this.context.domElement);
    if (this.data.url.length > 1) {
      this.domelement = document.createElement("iframe");
      domelement.src = this.data.url;
      domelement.style.border = "none";
    } else if(!this.element) {
      this.domelement = document.createElement("div");
      this.domelement.style.background = "white";
      this.domelement.innerText = "Blank";
      this.domelement.style.border = "none";
    } else {
      this.domelement = document.querySelector(this.data.element);
    }
    this.element = new DOMElement(
      this.context,
      this.domelement,
      this.data.width,
      this.data.height,
      this.data.elementWidth
    );
    this.el.object3D.add(this.element);

    window.addEventListener("resize", () => {
      context.setSize(window.innerWidth, window.innerHeight);
    });
  },
  tick: function () {
    if (this.context) this.context.update();
    if (this.element) this.element.update();
  },
});
