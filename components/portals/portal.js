AFRAME.registerComponent("portal", {
  schema: {
    destination: { default: "" },
    href: { default: "" },
    img: { default: "" },
    width: { default: 2.0 },
    height: { default: 3.0 },
    maxRecursion: { default: 0 },
    teleportCooldown: { default: 150 },
    enableTeleport: { default: !0 },
  },
  init: function () {
    let el = this.el;
    let sceneEl = el.sceneEl;
    let href = this.data.href;
    this.el.object3D.href = href;
    let img = this.data.img;
    let data = this.data;
    (el.justTeleported = !1), (el.isCameraColliding = !1);
    let geo = new THREE.BoxBufferGeometry(data.width, data.height, 1e-4);
    geo.setDrawRange(0, 32);
    if(img.length < 1){
      this.mat = new THREE.MeshBasicMaterial({ colorWrite: !1 });
    } else {
      let tex = new THREE.TextureLoader().load(`..${img}`);
      this.mat = new THREE.MeshBasicMaterial({map:tex})
    }
    let mesh = new THREE.Mesh(geo, this.mat);
    if (
      ((mesh.name = "portal-surface"),
      el.object3D.add(mesh),
      sceneEl.addEventListener("portal-teleported", function () {
        el.justTeleported = !0;
      }),
      el.addEventListener("camera-collision-start", function () {
        if (href.length > 0) {
          window.location.href = href;
          console.log("hit")
          return;
        }
        let pos = new THREE.Vector3();
        let camPos = new THREE.Vector3();
        let dir = new THREE.Vector3();
        el.object3D.getWorldPosition(pos),
          sceneEl.camera.getWorldPosition(camPos),
          el.object3D.getWorldDirection(dir);
        let heading = pos.sub(camPos);
        let dot = heading.dot(dir);
        if (0 != data.enableTeleport && !0 !== el.justTeleported && dot < 0) {
          (el.justTeleported = !0), sceneEl.emit("portal-teleported");
          let cam = sceneEl.camera;
          let camEl = cam.el;
          let destinationP = document.querySelector(data.destination).object3D;
          let rotation = el.object3D.rotation;
          let destRotation = destinationP.rotation;
          let rotDif = new THREE.Euler(
            rotation.x - destRotation.x,
            rotation.y - destRotation.y + Math.PI,
            rotation.z - destRotation.z
          );
          camEl.components["look-controls"] &&
            (camEl.components["look-controls"].yawObject.rotation.y -= rotDif.y);
          let objDir = el.object3D
            .getWorldDirection(new THREE.Vector3())
            .multiplyScalar(0.075);
          let camPos = cam.getWorldPosition(new THREE.Vector3());
          let objPos = el.object3D.getWorldPosition(new THREE.Vector3());
          let posDif = new THREE.Vector3().subVectors(camPos, objPos).sub(objDir);
          let posDifClone = posDif.clone();
          let rotDifY = rotDif.y;
          (posDifClone.x =
            posDif.x * Math.cos(rotDifY) - posDif.z * Math.sin(rotDifY)),
            (posDifClone.z =
              posDif.x * Math.sin(rotDifY) + posDif.z * Math.cos(rotDifY));
          let destPos = destinationP.position.clone().add(posDifClone);
          (camEl.object3D.position.x = destPos.x),
            (camEl.object3D.position.y = destPos.y),
            (camEl.object3D.position.z = destPos.z);
        }
      }),
      sceneEl.portals || (sceneEl.portals = []),
      !1 ===
        Array.from(sceneEl.children).reduce(function (e, t) {
          return e || t.hasAttribute("portal-manager");
        }, !1))
    ) {
      let portalManager = document.createElement("a-entity");
      portalManager.setAttribute("portal-manager", {
        maxRecursion: data.maxRecursion,
      }),
        sceneEl.appendChild(portalManager);
    }
    let portals = sceneEl.portals;
    let destinationPortal = document.querySelector(data.destination);
    // if (href.length < 1) {
      portals.push({
        portal: el.object3D,
        destination: destinationPortal.object3D,
        maxRecursion: data.maxRecursion,
        distance: 0,
      });
    // }

    this.el.object3D.renderable = true;
  },

  // load: async function() {
  //   this.beginningRender = true;
  //   await setTimeout(()=> {this.beginningRender = false}, 1000)
  //   return;
  // },

  tick: function () {
    let el = this.el;
    let object = el.object3D.children[0];
    let boxMatrix = object.matrixWorld;
    let data = this.data;
    let camera = this.el.sceneEl.camera;
    !0 === el.justTeleported &&
      setTimeout(function () {
        el.justTeleported = !1;
      }, this.data.teleportCooldown);

    const points = [];
    points.push(new THREE.Vector3(data.width / 2, data.height / 2, 1e-4));
    points.push(new THREE.Vector3(-data.width / 2, data.height / 2, 1e-4));
    points.push(new THREE.Vector3(data.width / 2, -data.height / 2, 1e-4));
    points.push(new THREE.Vector3(-data.width / 2, -data.height / 2, 1e-4));

    const frustum = new THREE.Frustum();
    const matrix = new THREE.Matrix4().multiplyMatrices(
      camera.projectionMatrix,
      camera.matrixWorldInverse
    );
    let isVisible = false;
    // !this.beginningRender ? isVisible = false : isVisible = true;
    frustum.setFromProjectionMatrix(matrix);
    for (let point of points) {
      point.applyMatrix4(boxMatrix);
      if (
        frustum.containsPoint(point) ||
        camera.position.distanceTo(object.position) < 2
      ) {
        isVisible = true;
      }
    }
    this.el.object3D.renderable = isVisible;
    // let boundingBox = computeScreenSpaceBoundingBox(
    //   e.object3D.children[0],
    //   camera
    // );
    // if (this.mainScreenRect.intersectsBox(boundingBox)) {
    //   // this.el.object3D.visible = false
    //   console.log("seen");
    //   this.el.object3D.renderable = true;
    // } else {
    //   // this.el.object3D.visible = true
    //   this.el.object3D.renderable = false;
    // }
  },
});

AFRAME.registerComponent("portal-manager", {
  schema: { skipTicks: { default: 25 }, maxRecursion: { default: 0 } },
  init: function () {
    let data = this.data;
    let scene = this.el.sceneEl;
    (data.ticks = 0),
      (data.maxRecursion = scene.portals.reduce(function (e, t) {
        return Math.max(e, t.maxRecursion);
      }, data.maxRecursion));
  },
  tick: function () {
    let data = this.data;
    let scene = this.el.sceneEl;
    let portals = scene.portals;
    if (data.ticks % data.skipTicks == 0) {
      var camPos = scene.camera.getWorldPosition(new THREE.Vector3());
      portals.forEach(function (portal) {
        portal.distance = portal.portal
          .getWorldPosition(new THREE.Vector3())
          .distanceTo(camPos);
      }),
        portals.sort(function (e, t) {
          return t.distance - e.distance;
        });
    }
    data.ticks++;
  },
  tock: function () {
    let scene = this.el.sceneEl;
    this.renderRecursivePortals(scene.renderer, scene.camera, 0);
    this.collisionDetection();
  },
  renderRecursivePortals: function (renderer, cam, n) {
    let m = this;
    let scene = this.el.sceneEl;
    let portals = scene.portals;
    let gl = renderer.getContext();
    let tmpScene = scene.object3D.clone();
    (renderer.autoClear = !1),
      (cam.matrixAutoUpdate = !1),
      portals.forEach(function (portal) {
        // console.log(a)
        if (portal.portal.renderable === true && portal.portal.href.length < 1) {
          let r = portal.portal;
          let dest = portal.destination;
          gl.colorMask(!1, !1, !1, !1),
            gl.depthMask(!1),
            gl.disable(gl.DEPTH_TEST),
            gl.enable(gl.STENCIL_TEST),
            gl.stencilFunc(gl.NOTEQUAL, n, 255),
            gl.stencilOp(gl.INCR, gl.KEEP, gl.KEEP),
            gl.stencilMask(255),
            renderer.render(r, cam);
          let camClone = cam.clone();
          (camClone.matrixWorld = (function (e, t, n) {
            var o = e.matrixWorld.clone();
            o.invert().multiply(t.matrixWorld);
            var a = n.matrixWorld.clone().invert(),
              r = new THREE.Matrix4().makeRotationY(Math.PI);
            return new THREE.Matrix4()
              .multiply(o)
              .multiply(r)
              .multiply(a)
              .invert();
          })(cam, r, dest)),
            (camClone.projectionMatrix = (function (e, t, n) {
              var o = t.clone().invert(),
                a = new THREE.Matrix4().extractRotation(e.matrixWorld),
                r = new THREE.Vector3().set(0, 0, 1).applyMatrix4(a),
                i = new THREE.Plane();
              i.setFromNormalAndCoplanarPoint(
                r,
                e.getWorldPosition(new THREE.Vector3())
              ),
                i.applyMatrix4(o);
              var l = new THREE.Vector4();
              l.set(i.normal.x, i.normal.y, i.normal.z, i.constant);
              var s = n.clone(),
                c = new THREE.Vector4();
              return (
                (c.x = (Math.sign(l.x) + s.elements[8]) / s.elements[0]),
                (c.y = (Math.sign(l.y) + s.elements[9]) / s.elements[5]),
                (c.z = -1),
                (c.w = (1 + s.elements[10]) / n.elements[14]),
                l.multiplyScalar(2 / l.dot(c)),
                (s.elements[2] = l.x),
                (s.elements[6] = l.y),
                (s.elements[10] = l.z + 1),
                (s.elements[14] = l.w),
                s
              );
            })(dest, camClone.matrixWorld, camClone.projectionMatrix)),
            n == m.data.maxRecursion
              ? (gl.colorMask(!0, !0, !0, !0),
                gl.depthMask(!0),
                renderer.clear(!1, !0, !1),
                gl.enable(gl.DEPTH_TEST),
                gl.enable(gl.STENCIL_TEST),
                gl.stencilMask(0),
                gl.stencilFunc(gl.EQUAL, n + 1, 255),
                renderer.render(tmpScene, camClone))
              : m.renderRecursivePortals(renderer, camClone, n + 1),
            gl.colorMask(!1, !1, !1, !1),
            gl.depthMask(!1),
            gl.enable(gl.STENCIL_TEST),
            gl.stencilMask(255),
            gl.stencilFunc(gl.NOTEQUAL, n + 1, 255),
            gl.stencilOp(gl.DECR, gl.KEEP, gl.KEEP),
            renderer.render(r, cam);
        }
      }),
      gl.disable(gl.STENCIL_TEST),
      gl.stencilMask(0),
      gl.colorMask(!1, !1, !1, !1),
      gl.enable(gl.DEPTH_TEST),
      gl.depthMask(!0),
      gl.depthFunc(gl.ALWAYS),
      renderer.clear(!1, !0, !1),
      portals.forEach(function (n) {
        if (n.portal.renderable === true) renderer.render(n.portal, cam);
      }),
      gl.depthFunc(gl.LESS),
      gl.enable(gl.STENCIL_TEST),
      gl.stencilMask(0),
      gl.stencilFunc(gl.LEQUAL, n, 255),
      gl.colorMask(!0, !0, !0, !0),
      gl.depthMask(!0),
      renderer.render(tmpScene, cam),
      (cam.matrixAutoUpdate = !0);
  },
  collisionDetection: function () {
    let scene = this.el.sceneEl;
    let cam = scene.camera;
    let portalBounds = scene.portals.map(function (portal) {
        let r = portal.portal;
        let surface = r.children.filter(function (e) {
          return "portal-surface" == e.name;
        })[0];
        let bounds = new THREE.Box3().setFromObject(surface);
        return {
          portal: r,
          xMin: bounds.min.x,
          xMax: bounds.max.x,
          yMin: bounds.min.y,
          yMax: bounds.max.y,
          zMin: bounds.min.z,
          zMax: bounds.max.z,
        };
      }),
      camPos = cam.getWorldPosition(new THREE.Vector3()),
      a = camPos.x - 0.05,
      r = camPos.x + 0.05,
      i = camPos.y - 0.05,
      l = camPos.y + 0.05,
      s = camPos.z - 0.05,
      c = camPos.z + 0.05;
    portalBounds.forEach(function (e) {
      if (
        a <= e.xMax &&
        r >= e.xMin &&
        i <= e.yMax &&
        l >= e.yMin &&
        s <= e.zMax &&
        c >= e.zMin
      ) {
        let portalEl = e.portal.el;
        !1 === portalEl.isCameraColliding &&
          (portalEl.emit("camera-collision-start"),
          (portalEl.isCameraColliding = !0));
      } else {
        let portalEl = e.portal.el;
        !0 === portalEl.isCameraColliding &&
          (portalEl.emit("camera-collision-end"),
          (portalEl.isCameraColliding = !1));
      }
    });
  },
});

function computeScreenSpaceBoundingBox(mesh, camera) {
  const positionAttribute = mesh.geometry.getAttribute("position");

  let points = [];
  const vertex = new THREE.Vector3();
  let screenPt = new THREE.Vector2();
  let box = new THREE.Box2();

  for (
    let vertexIndex = 0;
    vertexIndex < positionAttribute.count;
    vertexIndex++
  ) {
    vertex.fromBufferAttribute(positionAttribute, vertexIndex);
    let vertexWorldCoord = vertex.applyMatrix4(mesh.matrixWorld);
    let vertexScreenSpace = vertexWorldCoord.project(camera);
    screenPt.x = Math.round(
      vertexScreenSpace.x * (window.innerWidth / 2) + window.innerWidth / 2
    );
    screenPt.y = Math.round(
      -(vertexScreenSpace.y * (window.innerHeight / 2)) + window.innerHeight / 2
    );

    box.expandByPoint(screenPt);
    // do something with vertex
  }
  // console.log(box);
  return box;

  // return normalizedToPixels(box.getSize());
}