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
    var modelColor = 0X00FF00;
    var renderer, camera, banana, cameraHeight;
    var dom_scene = document.getElementById(id)

    var ww = window.innerWidth * 0.8;
    var wh = window.innerHeight * 0.8;

    renderer = new THREE.WebGLRenderer({
      canvas: dom_scene
    });

    renderer.setSize(ww, wh);

    var scene = new THREE.Scene();

    // 摄像机位置
    var fov = 100  //摄像机高度
    var near = 0.1  //最小范围
    var far = 1000 //最大范围
    camera = new THREE.PerspectiveCamera(fov, ww / wh, near, far);
    camera.position.set(0, 0, 300);
    scene.add(camera);

    //灯光位置
    directionalLight = new THREE.DirectionalLight(0xffffff);
    directionalLight.position.set(0, 0, 200);
    directionalLight.lookAt(new THREE.Vector3(0, 0, 0));
    scene.add(directionalLight);

    /**
     * 每次修改参数后，都需要重新render，才会起作用
     */
    var render = function () {
      renderer.render(scene, camera);
    };

    /************************************************************************
     * 根据配置设置背景颜色，边框宽度，边框颜色
     ************************************************************************/
    // 设置背景颜色
    if (data.bgColor) {
      renderer.setClearColor(data.bgColor, 1);
    }
    if (data.modelColor) {
      modelColor = data.modelColor;
    }
    // 设置背景图片
    if (data.bgImgUrl) {
      var skyBoxGeometry = new THREE.BoxGeometry(1000, 1000, 1000);
      var texture = new THREE.TextureLoader().load(data.bgImgUrl);
      var skyBoxMaterial = new THREE.MeshBasicMaterial({ map: texture, side: THREE.DoubleSide });
      var skyBox = new THREE.Mesh(skyBoxGeometry, skyBoxMaterial);
      scene.add(skyBox);
    }

    /************************************************************************
     * 加载Obj文件
     ************************************************************************/
    var loadOBJ = function () {
      var manager = new THREE.LoadingManager();
      var loader = new THREE.OBJLoader(manager);

      // 可以设置一个loading效果
      manager.onProgress = function (item, loaded, total) {
        // TODO:增加一个loading效果
        console.log('progress ：', item, loaded, total);
      };

      // objUrl = '/assets/basketball.obj'
      loader.load(objUrl, function (object) {
        banana = object;
        object.traverse(function (child) {
          if (child instanceof THREE.Mesh) {
            child.material.color = new THREE.Color(modelColor);
            child.geometry.computeVertexNormals();

            // TODO:模型组的话，没有办法设置中心轴旋转
            // 设置单个模型的放置在中心点，如果是一个模型组，这样会有问题
            if (banana.children.length === 1) {
              child.geometry.center()
            }
          }
        });
        scene.add(banana);
        render();
      });
    };
    loadOBJ();

    /************************************************************************
     * 放大缩小,旋转等功能
     ************************************************************************/
    var mc = new Hammer.Manager(dom_scene);
    mc.add(new Hammer.Pinch({ threshold: 0 }));
    mc.add(new Hammer.Pan({ threshold: 0 }));

    mc.on('pinchstart pinchmove', function (ev) {
      banana.position.y += -ev.deltaY / 10
      banana.position.x += ev.deltaX / 10
      render()
    })

    // mc.on('pinchin pinchout', function (ev) {
    //   banana.scale.x = ev.scale;
    //   banana.scale.y = ev.scale;
    //   banana.scale.z = ev.scale;
    // })

    mc.on('pinchin', function () {
      camera.position.z += 3;
      camera.updateProjectionMatrix()
      render()
    })
    mc.on('pinchout', function () {
      camera.position.z -= 3;
      camera.updateProjectionMatrix()
      render()
    })

    dom_scene.addEventListener('mousewheel', mousewheel, false);

    mc.on('panleft', function () {
      banana.rotation.z += 0.1;
      render()
    })
    mc.on("panright", function () {
      banana.rotation.z -= 0.1;
      render()
    });
    mc.on("panup", function () {
      banana.rotation.x -= 0.1;
      render()
    });
    mc.on("pandown", function () {
      banana.rotation.x += 0.1;
      render()
    });


    //鼠标滑轮
    function mousewheel(e) {
      e.preventDefault();
      if (e.wheelDelta) {  //判断浏览器IE，谷歌滑轮事件
        if (e.wheelDelta > 0) { //当滑轮向上滚动时
          fov -= (near < fov ? 1 : 0);
        }
        if (e.wheelDelta < 0) { //当滑轮向下滚动时
          fov += (fov < far ? 1 : 0);
        }
      } else if (e.detail) {  //Firefox滑轮事件
        if (e.detail > 0) { //当滑轮向上滚动时
          fov -= 1;
        }
        if (e.detail < 0) { //当滑轮向下滚动时
          fov += 1;
        }
      }
      camera.fov = fov;
      camera.updateProjectionMatrix();
      render()
    }
  }

  return ObjViewer
})()