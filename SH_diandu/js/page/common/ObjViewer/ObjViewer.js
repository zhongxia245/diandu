/**
 * 预览3Dobj的模型
 * TODO
 * 1. 支持放大缩小用两个手指
 * 2. 支持左右转动，上下转动
 */
window.ObjViewer = (function () {

  function ObjViewer(id, options) {
    options = options || {}
    var objUrl = options.url;
    var data = options.data || {}

    var scene = new THREE.Scene();
    var renderer, camera, banana, cameraHeight;
    var dom_scene = document.getElementById(id)

    cameraHeight = options.cameraHeight || 1000;

    var ww = options.width || window.innerWidth;
    var wh = options.height || window.innerHeight;

    renderer = new THREE.WebGLRenderer({
      canvas: dom_scene
    });

    renderer.setSize(ww, wh);

    // if (data.bgImgUrl) {
    //   var manager = new THREE.LoadingManager();
    //   manager.onProgress = function (item, loaded, total) {
    //     console.log(item, loaded, total);
    //   };
    //   var texture = new THREE.Texture();
    //   var loader = new THREE.ImageLoader(manager);
    //   loader.load(data.bgImgUrl, function (image) {
    //     texture.image = image;
    //     texture.needsUpdate = true;
    //     renderer.setTexture2D(texture)
    //   });
    // }

    camera = new THREE.PerspectiveCamera(50, ww / wh, 0.1, cameraHeight);
    camera.position.set(0, 0, cameraHeight);
    scene.add(camera);

    /**
     * 左右，上下翻动
     */
    var startX, startY, tempX, tempY;
    dom_scene.addEventListener('touchstart', function (e) {
      startX = e.changedTouches[0].pageX;
      startY = e.changedTouches[0].pageY;
      dom_scene.addEventListener('touchmove', function (e1) {
        tempX = e1.changedTouches[0].pageX;
        tempY = e1.changedTouches[0].pageY;

        var distX = tempX - startX;
        var distY = tempY - startY;

        if (distX > 0) {
          banana.rotation.z += 0.08;
        } else if (distX < 0) {
          banana.rotation.z -= 0.08;
        }
        if (distY > 0) {
          banana.rotation.x += 0.08;
        } else if (distY < 0) {
          banana.rotation.x -= 0.08;
        }
        render()
        startX = tempX;
        startY = tempY;
      })
    })

    /**
     * 放大缩小
     */
    var initScale = 1;
    var mc = new Hammer.Manager(dom_scene);
    mc.add(new Hammer.Pinch({ threshold: 0 }));
    mc.on("pinchstart pinchmove", onPinch);
    function onPinch(ev) {
      if (ev.type == 'pinchstart') {
        initScale = 1;
      }
      if (ev.scale > initScale) {
        cameraHeight -= 10;
      } else {
        cameraHeight += 10;
      }
      initScale = ev.scale;
      camera.position.set(0, 0, cameraHeight);
    }



    directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
    directionalLight.position.set(0, 0, 100);
    directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(directionalLight);

    /**
     * 每次修改参数后，都需要重新render，才会起作用
     */
    var render = function () {
      renderer.render(scene, camera);
    };

    /**
     * 加载Obj文件
     */
    var loadOBJ = function () {
      var manager = new THREE.LoadingManager();
      var loader = new THREE.OBJLoader(manager);

      loader.load(objUrl, function (object) {
        banana = object;
        banana.rotation.x = Math.PI / 2;
        banana.position.y = 100;
        banana.position.z = 50;
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material.color = new THREE.Color(0X00FF00);
            child.geometry.computeVertexNormals();
          }
        });
        scene.add(banana);
        render();
      });
    };
    loadOBJ();
  }

  return ObjViewer
})()