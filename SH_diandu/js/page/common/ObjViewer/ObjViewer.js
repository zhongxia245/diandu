/**
 * 预览3Dobj的模型
 * TODO
 * 1. 支持放大缩小用两个手指
 * 2. 支持左右转动，上下转动
 */
window.ObjViewer = (function () {

	// 方位
	var DIRECTION = {
		left: 'left',
		top: 'top',
		bottom: 'bottom',
		right: 'right',
		center: 'center'
	}

	function ObjViewer(id, options) {
		options = options || {}
		var objUrl = options.url;
		var data = options.data || {}
		var modelColor = 0X00FF00;
		var renderer, camera, banana, cameraHeight;
		var dom_scene = document.getElementById(id)

		var ww = options.width || window.innerWidth * 0.8;
		var wh = options.height || window.innerHeight * 0.8;


    /************************************************************************
     * 初始化场景（摄像机，光源）
     ************************************************************************/
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

		//平行光
		var directionalLightY = new THREE.DirectionalLight(0xffffff);
		directionalLightY.position.set(50, 50, 100);
		directionalLightY.intensity = 0.5;
		directionalLightY.lookAt(new THREE.Vector3(0, 0, 0));
		scene.add(directionalLightY);

		var directionalLightX = new THREE.DirectionalLight(0xffffff);
		directionalLightX.intensity = 0.5;
		directionalLightX.position.set(100, 100, 100);
		directionalLightX.rotation.y = Math.PI / 4
		directionalLightX.lookAt(new THREE.Vector3(0, 0, 0));
		scene.add(directionalLightX);

		var directionalLightZ = new THREE.DirectionalLight(0xffffff);
		directionalLightZ.intensity = 0.3;
		directionalLightZ.position.set(0, 0, 200);
		directionalLightX.rotation.y = -Math.PI / 4
		directionalLightZ.lookAt(new THREE.Vector3(0, 0, 0));
		scene.add(directionalLightZ);

		// // 环境光【】
		var ambientLight = new THREE.AmbientLight(0x0c0c0c)
		ambientLight.intensity = 0.2
		scene.add(ambientLight);

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
		if (data.bg_opacity) {
			renderer.setClearAlpha(data.bg_opacity)
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
    /**
     * 使模型在视野中居中
     * @param {any} aroundObject3D 
     */
		function centerCam(aroundObject3D) {
			//calc cam pos from Bounding Box
			var BB = new THREE.Box3().setFromObject(aroundObject3D);
			var centerpoint = BB.center();
			var size = BB.size();
			var backup = (size.y / 2) / Math.sin((camera.fov / 2) * (Math.PI / 180));

			// TIP：如果要修改模型居中时的模型大小，增加或者减少摄像机的高度即可
			var camZpos = BB.max.z + backup + camera.near;
			//move cam
			camera.position.set(centerpoint.x, centerpoint.y, camZpos);
			camera.far = camera.near + 10 * size.z;
			camera.updateProjectionMatrix();

		}

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
				rotateDefault()
				centerCam(banana)
				scene.add(banana);
				render();
			});
		};
		loadOBJ();

		initOperatorEvent(dom_scene)

		/************************************************************************
		 * 放大缩小,旋转等功能
		 * 如何使用，查看文档 http://hammerjs.github.io/getting-started/
		 ************************************************************************/
		function initOperatorEvent(dom) {
			var hammerDom = new Hammer(dom, {
				domEvents: true
			});
			hammerDom.get('pan').set({ direction: Hammer.DIRECTION_ALL });
			hammerDom.get('pinch').set({ enable: true });

			hammerDom.on('press', function (ev) {
				console.log('press')
				var offset = {
					w: $(ev.target).width(),
					h: $(ev.target).height(),
					x: ev.pointers[0].offsetX,
					y: ev.pointers[0].offsetY
				}
				customRotate(getLocation(offset.w, offset.h, offset.x, offset.y))
			})

			hammerDom.on('pinchstart pinchmove', function (ev) {
				banana.position.y += -ev.deltaY / 20
				banana.position.x += ev.deltaX / 20
				render()
			})

			hammerDom.on('pinchin', function (ev) {
				if (ev.scale < 0.9) {
					fov += 1;
					camera.fov = fov;
					camera.updateProjectionMatrix();
					render()
				}
			})
			hammerDom.on('pinchout', function (ev) {
				if (ev.scale > 1.1) {
					fov -= 1;
					camera.fov = fov;
					camera.updateProjectionMatrix()
					render()
				}
			})

			hammerDom.on('panleft', function (e) {
				banana.rotation.y += 0.1;
				render()
			})
			hammerDom.on("panright", function (e) {
				banana.rotation.y -= 0.1;
				render()
			});
			hammerDom.on("panup", function () {
				banana.rotation.x -= 0.1;
				render()
			});
			hammerDom.on("pandown", function () {
				banana.rotation.x += 0.1;
				render()
			});


			/*****************更多手指的操作***************************/
			var mc = new Hammer.Manager(dom);
			mc.add(new Hammer.Tap({ event: 'trebleTap', pointers: 3 }));

			// 三个手指点击，返回默认状态
			mc.on('trebleTap', function () {
				banana.position.x = 0;
				banana.position.y = 0;
				banana.position.z = 0;
				setEmptyPosition()
				rotateDefault()
				centerCam(banana);
				render();
			})

			dom_scene.addEventListener('mousewheel', mousewheel, false);

			//鼠标滑轮放大缩小
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

		/********************************** 上下左右视图操作 START *********************************/

    /**
     * top right bottom left center
     * 判断坐标在区域内，上下左右中，什么方位
     * @param {any} w 
     * @param {any} h 
     * @param {any} x 
     * @param {any} y 
     */
		function getLocation(w, h, x, y) {
			// 上下左右30%，算上下左右，去掉右上角，左上角，左下角，右下角。 30% 之外算中间
			var range = 0.3;

			// top
			var maxTopY = h * range;
			var minTopX = w * range;
			var maxTopX = w * (1 - range);
			if (x >= minTopX && x <= maxTopX && y <= maxTopY) {
				return DIRECTION.top;
			}

			// bottom
			var minBottomY = h * (1 - range)
			var minBottomX = w * range;
			var maxBottomX = w * (1 - range);
			if (x >= minBottomX && x <= maxBottomX && y >= minBottomY) {
				return DIRECTION.bottom;
			}

			// left
			var minLeftY = h * range
			var maxLeftY = h * (1 - range)
			var maxLeftX = w * range;
			if (y >= minLeftY && y <= maxLeftY && x <= maxLeftX) {
				return DIRECTION.left;
			}

			// right
			var minRightY = h * range
			var maxRightY = h * (1 - range)
			var minRightX = w * (1 - range);
			if (y >= minRightY && y <= maxRightY && x >= minRightX) {
				return DIRECTION.right;
			}

			return DIRECTION.center
		}

		/*************** 上下左右视图旋转 START ***************************** */

		function customRotate(direction) {
			setEmptyPosition()
			switch (direction) {
				case DIRECTION.left:
					rotateLeft()
					break;
				case DIRECTION.right:
					rotateRight()
					break;
				case DIRECTION.top:
					rotateTop()
					break;
				case DIRECTION.bottom:
					rotateBottom()
					break;
				case DIRECTION.center:
					rotateCenter()
					break;
			}
		}

		function setEmptyPosition() {
			banana.rotation.x = 0;
			banana.rotation.y = 0;
			banana.rotation.z = 0;
		}

		//加载模型后的默认位置
		function rotateDefault() {
			banana.rotation.y = -Math.PI / 4;
			// banana.rotation.z = Math.PI / 180 * 35;
			banana.rotation.x = Math.PI / 180 * 35;
		}

		function rotateLeft() {
			banana.rotation.y = (Math.PI / 2)
			render()
		}

		function rotateRight() {
			banana.rotation.y = -(Math.PI / 2)
			render()
		}

		function rotateTop() {
			banana.rotation.x = Math.PI / 2
			render()
		}

		function rotateBottom() {
			banana.rotation.x = -(Math.PI / 2)
			render()
		}

		function rotateCenter() {
			banana.rotation.x = 0
			banana.rotation.y = 0
			render()
		}

	}

	return ObjViewer
})()
