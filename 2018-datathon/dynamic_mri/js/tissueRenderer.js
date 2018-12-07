PJP.TissueViewer = function(PanelName)  {

	var textureScene;
	var sceneFirstPass, sceneSecondPass, renderer;
	
	var rtTexture, pickerRTTexture;
	var cubeTextures = ['dynamic_heart-0.png'];
	var materialFirstPass;
	var materialSecondPass;
	var tissueRenderer;
	var sphere, sphere2, pickerSphere, pickerSphere2;
	var tissueScene;
	var meshFirstPass, meshSecondPass;
	var secondTexture;
	var cellPickerScene;
	var gui;
	var guiControls;
	var constitutiveLawsLink = "https://models.physiomeproject.org/mechanical_constitutive_laws";
	var UIIsReady = false;
	var cellPanel = undefined;
	var modelPanel = undefined;
	var timeSlider = undefined;
	var myGeometry = undefined;
	var _this = this;
	var screenSize;
	
	this.setCellPanel = function(CellPanelIn) {
		cellPanel = CellPanelIn;
	}
	
	this.setModelPanel = function(ModelPanelIn) {
		modelPanel = ModelPanelIn;
	}
	
	var showCellTooltip = function(id, x, y) {
		tiptextElement.innerHTML = "Cell model " + id;
		tooltipcontainerElement.style.left = x +"px";
		tooltipcontainerElement.style.top = (y - 20) + "px";
		tipElement.style.visibility = "visible";
		tipElement.style.opacity = 1;
		tiptextElement.style.visibility = "visible";
		tiptextElement.style.opacity = 1;
		currentHoverId = id;
	}
	
	var hideCellTooltip = function() {
		tipElement.style.visibility = "hidden";
		tipElement.style.opacity = 0;
		tiptextElement.style.visibility = "hidden";
		tiptextElement.style.opacity = 0;
	}
	
	var openConstitutiveLawsLink = function() {
		window.open(constitutiveLawsLink, '');
	}
	
	var openCellModelUI = function(id) {
		var cellTitle = "<strong>Cell: <span style='color:#FF4444'>" + id + "</span></strong>";
		if (cellPanel) {
			cellPanel.setCellPanelTitle(cellTitle);
			cellPanel.openCell();
		}
		if (modelPanel)
			modelPanel.openModel("Myocyte_v6_Grouped.svg");
	}
	
	var _pickingCellCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined) {
				console.log("click");
				var rawRenderer = tissueRenderer.getThreeJSRenderer();
				var currentScene = tissueRenderer.getCurrentScene();
				rawRenderer.render( currentScene.getThreeJSScene(), currentScene.camera, pickerRTTexture, true );
				var instanceBuffer = new Uint8Array(4);
				rawRenderer.readRenderTargetPixels ( pickerRTTexture, window_x, screenSize.y - window_y, 1, 1, instanceBuffer );
				guiControls.targetIntensity = instanceBuffer[0]/255.0;
				materialSecondPass.uniforms.targetIntensity.value = guiControls.targetIntensity;
				updateDatGui();	
			}
		}	
	};
	
	var _hoverCellCallback = function() {
		return function(intersects, window_x, window_y) {
			if (intersects[0] !== undefined && intersects[0].object !== undefined &&
					(intersects[0].object.geometry instanceof THREE.SphereGeometry)) {
				showCellTooltip(1, window_x, window_y);
				document.getElementById("tissueDisplayArea").style.cursor = "pointer";
			}
			else {
				hideCellTooltip();
				document.getElementById("tissueDisplayArea").style.cursor = "auto";
			}
		}	
	};
	
	
	var changeModels = function(value) {
		materialSecondPass.uniforms.cubeTex.value =  cubeTextures[value];
		if (value.includes('crop')|| value.includes('dynamic_heart')) {
			materialSecondPass.uniforms.black_flip.value = false;
		} else {
			materialSecondPass.uniforms.black_flip.value = true;
		}
		console.log(value);
		if (value.includes('dynamic_heart')) {
			materialSecondPass.uniforms.slides_per_side.value = 17;
		} else {
			materialSecondPass.uniforms.slides_per_side.value = 16;
		}
	}
	
	var renderFirstPass = function() {
		return function() {
			//Render first pass and store the world space coords of the back face fragments into the texture.
			tissueRenderer.getThreeJSRenderer().render( sceneFirstPass, tissueRenderer.getCurrentScene().camera, rtTexture, true );
		}	
	}
	
	var updateDatGui = function()
	{
		for (var i in gui.__controllers) {
			gui.__controllers[i].updateDisplay();
		}
	}
	
	var updateUniforms = function() {
		materialFirstPass.uniforms.min_x.value = guiControls.min_x;
		materialFirstPass.uniforms.max_x.value = guiControls.max_x;
		materialFirstPass.uniforms.min_y.value = guiControls.min_y;
		materialFirstPass.uniforms.max_y.value = guiControls.max_y;		
		materialFirstPass.uniforms.min_z.value = guiControls.min_z;
		materialFirstPass.uniforms.max_z.value = guiControls.max_z;		
		
		materialSecondPass.uniforms.min_x.value = guiControls.min_x;
		materialSecondPass.uniforms.max_x.value = guiControls.max_x;
		materialSecondPass.uniforms.min_y.value = guiControls.min_y;
		materialSecondPass.uniforms.max_y.value = guiControls.max_y;		
		materialSecondPass.uniforms.min_z.value = guiControls.min_z;
		materialSecondPass.uniforms.max_z.value = guiControls.max_z;	
		materialSecondPass.uniforms.current_time.value = guiControls.current_time;
		
		materialSecondPass.uniforms.alphaCorrection.value = guiControls.alphaCorrection;
		materialSecondPass.uniforms.steps.value = guiControls.steps;
		materialSecondPass.uniforms.upperTolerance.value = guiControls.upperTolerance;
		materialSecondPass.uniforms.lowerTolerance.value = guiControls.lowerTolerance;
		materialSecondPass.uniforms.targetIntensity.value = guiControls.targetIntensity;
	}
	
	var resetSlider = function() {
		guiControls.min_x = 0;
		guiControls.max_x = 1.0;
		guiControls.min_y = 0;
		guiControls.max_y = 1.0;
		guiControls.min_z = 0;
		guiControls.max_z = 1.0;
		guiControls.current_time = 0.0;
		guiControls.alphaCorrection = 5.0;
		guiControls.steps = 256.0;
		guiControls.Speed = 29.0;
		guiControls.contrast = false;
		guiControls.upperTolerance = 1.0;
		guiControls.lowerTolerance = 1.0;
		guiControls.targetIntensity = 0.0;
		updateUniforms();
		updateDatGui();	
	}
	
	var changeBoundary = function(name) {
		return function(value) {
			if (name == "min_x")
			{
				if (guiControls.min_x >= guiControls.max_x)
					guiControls.max_x = guiControls.min_x + 0.01;
			}
			if (name == "min_y")
			{
				if (guiControls.min_y >= guiControls.max_y)
					guiControls.max_y = guiControls.min_y + 0.01;
			}
			if (name == "min_z")
			{
				if (guiControls.min_z >= guiControls.max_z)
					guiControls.max_z = guiControls.min_z + 0.01;
			}
			if (name == "max_x")
			{
				if (guiControls.max_x <= guiControls.min_x)
					guiControls.min_x = guiControls.max_x - 0.01;
			}
			if (name == "max_y")
			{
				if (guiControls.max_y <= guiControls.min_y)
					guiControls.min_y = guiControls.max_y - 0.01;
			}
			if (name == "max_z")
			{
				if (guiControls.max_z <= guiControls.min_z)
					guiControls.min_z = guiControls.max_z - 0.01;
			}
			updateUniforms();		
			updateDatGui();
		}	
	}
	
	var changeSteps = function() {
		return function(value) {
			guiControls.steps = value;
			updateUniforms();
			updateDatGui();	
		}
	}
	
	var changeAlphaCorrection = function() {
		return function(value) {
			guiControls.alphaCorrection = value;
			updateUniforms();
			updateDatGui();	
		}
	}
	
	var changeCurrentTime = function() {
		return function(value) {
			guiControls.current_time = value;
			tissueScene.setMorphsTime(value);
			updateUniforms();
			updateDatGui();	
		}
	}
	
	var changeUpperTolerance  = function() {
		return function(value) {
			guiControls.upperTolerance = value;
			updateUniforms();
			updateDatGui();	
		}
	}
	
	var changeLowerTolerance  = function() {
		return function(value) {
			guiControls.lowerTolerance = value;
			updateUniforms();
			updateDatGui();	
		}
	}
	
	var changeTargetIntensity  = function() {
		return function(value) {
			guiControls.targetIntensity = value;
			updateUniforms();
			updateDatGui();	
		}
	}
	
	var triggerContrast = function() {
		if (guiControls.contrast == false) {
			guiControls.contrast = true;
		} else {
			guiControls.contrast = false;
		}
		materialSecondPass.uniforms.contrast.value = guiControls.contrast;
	}

	var volumeRenderBackGroundChanged = function() {
		return function(value) {
			var redValue = parseInt(value[0]);
			var greenValue = parseInt(value[1]);
			var blueValue = parseInt(value[2]);
			var backgroundColourString = 'rgb(' + redValue + ',' + greenValue + ',' + blueValue + ')';
			var colour = new THREE.Color(backgroundColourString);
			var renderer = tissueRenderer.getThreeJSRenderer();
			renderer.setClearColor( colour, 1 );
		}
	}
	
	var triggerAnimation = function() {
		if (tissueRenderer.playAnimation == true) {
			tissueRenderer.playAnimation = false;
		} else {
			tissueRenderer.playAnimation = true;	
		}
	}
	
	var updateTimeSlider = function() {
		var currentTime = tissueScene.getCurrentTime();
		guiControls.current_time = currentTime;
		timeSlider.updateDisplay();
		materialSecondPass.uniforms.current_time.value = guiControls.current_time;
	}
	
	var updateTimeSliderCallback = function() {
		return function() {
			updateTimeSlider();
		}	
	}
	
	var speedSliderChanged = function() {
		return function(value) {
			tissueRenderer.setPlayRate(value);
		}
	}
	
	var volumeRenderStart = function(shaderText) {
		guiControls = new function() {
			this.model = 'dynamic_heart';
			this.steps = 256.0;
			this.alphaCorrection = 5.0;pickerRTTexture
			this.min_x = 0.01;
			this.max_x = 0.99;
			this.min_y = 0.01;
			this.max_y = 0.99;
			this.min_z = 0.01;
			this.max_z = 0.99;
			this.Speed = 29.0;
			this.current_time = 0.0;
			this.contrast = false;
			this.upperTolerance = 1.0;
			this.lowerTolerance = 1.0;
			this.targetIntensity = 0.0;
			this.Background = [ 0, 0, 0 ]; // RGB array
		};
		
		activated = false;
		
		var container = document.createElement( 'div' );
		document.getElementById("tissueDisplayArea").appendChild( container );
		container.style.height = "100%"
		container.style.backgroundColor = "black";
		tissueRenderer = new Zinc.Renderer(container, window);
		tissueRenderer.initialiseVisualisation();
		tissueRenderer.playAnimation = false;
		tissueRenderer.setPlayRate(29.0);
		tissueScene = tissueRenderer.getCurrentScene();
		tissueScene.setDuration(29.0);
		var renderer = tissueRenderer.getThreeJSRenderer();
		renderer.setClearColor( 0x000000, 1 );
		var camera = tissueScene.camera;
		camera.near = 0.01;
		camera.far = 3000.0;
		camera.position.z = 3.0;
	
		//Load the 2D texture containing the Z slices.

		cubeTextures['dynamic_heart'] = THREE.ImageUtils.loadTexture('textures/dynamic_heart-0.png');
		cubeTextures['dynamic_heart'].wrapT = THREE.RepeatWrapping;
		secondTexture = THREE.ImageUtils.loadTexture('textures/dynamic_heart-1.png');
		secondTexture.wrapT = THREE.RepeatWrapping;
	 
		screenSize = new THREE.Vector2( container.clientWidth, container.clientHeight );
		rtTexture = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y,
												{ 	minFilter: THREE.LinearFilter,
													magFilter: THREE.LinearFilter,
													wrapS:  THREE.ClampToEdgeWrapping,
													wrapT:  THREE.ClampToEdgeWrapping,
													format: THREE.RGBFormat,
													generateMipmaps: false} );
		
		pickerRTTexture = new THREE.WebGLRenderTarget( screenSize.x, screenSize.y );
		pickerRTTexture.texture.minFilter = THREE.LinearFilter;

		materialFirstPass = new THREE.ShaderMaterial( {
			vertexShader: shaderText[0],
			fragmentShader: shaderText[1],
			side: THREE.BackSide,
			uniforms: {	min_x : {type: "1f" , value: guiControls.min_x },
				max_x : {type: "1f" , value: guiControls.max_x },
				min_y : {type: "1f" , value: guiControls.min_y },
				max_y : {type: "1f" , value: guiControls.max_y },
				min_z : {type: "1f" , value: guiControls.min_z },
				max_z : {type: "1f" , value: guiControls.max_z }}
		} );
	
		materialSecondPass = new THREE.ShaderMaterial( {
			vertexShader: shaderText[2],
			fragmentShader: shaderText[3],
			transparent: true,
			depthTest: true,
			side: THREE.FrontSide,
			uniforms: {	tex:  { type: "t", value: rtTexture.texture },
						cubeTex:  { type: "t", value: cubeTextures['dynamic_heart'] },
						secondTex: { type: "t", value: secondTexture },
						steps : {type: "1f" , value: guiControls.steps },
						alphaCorrection : {type: "1f" , value: guiControls.alphaCorrection },
						min_x : {type: "1f" , value: guiControls.min_x },
						max_x : {type: "1f" , value: guiControls.max_x },
						min_y : {type: "1f" , value: guiControls.min_y },
						max_y : {type: "1f" , value: guiControls.max_y },
						min_z : {type: "1f" , value: guiControls.min_z },
						max_z : {type: "1f" , value: guiControls.max_z },
						max_z : {type: "1f" , value: guiControls.max_z },
						slides_per_side : {type: "1f" , value: 17 },
						number_of_times : {type: "1f" , value: 30 },
						current_time : {type: "1f" , value: 0},
						black_flip : {value: false},
						upperTolerance : {type: "1f" , value: guiControls.upperTolerance },
						lowerTolerance : {type: "1f" , value: guiControls.lowerTolerance },
						targetIntensity : {type: "1f" , value: guiControls.targetIntensity },
						contrast: {value: false}}
		 });
	
		sceneFirstPass = new THREE.Scene();
	
		var boxGeometry = new THREE.BoxGeometry(1.0, 1.0, 1.0);
		boxGeometry.doubleSided = true;
	
		meshFirstPass = new THREE.Mesh( boxGeometry, materialFirstPass );
		//meshSecondPass = new THREE.Mesh( boxGeometry, materialSecondPass );
	
		sceneFirstPass.add( meshFirstPass );
		
		myGeometry = tissueScene.addZincGeometry(boxGeometry, 20001, undefined, undefined, undefined, undefined, true, undefined, materialSecondPass);
		myGeometry.duration = 29.0;
		//tissueScene.addObject( meshSecondPass );
		
		
		var geometry = new THREE.SphereGeometry( 0.02, 16, 16 );
		var material = new THREE.MeshPhongMaterial( { color: 0x3920d9, shading: THREE.SmoothShading,  shininess: 0.5 } );
		
		var zincCameraControl = tissueScene.getZincCameraControls();
		zincCameraControl.setMouseButtonAction("AUXILIARY", "ZOOM");
		zincCameraControl.setMouseButtonAction("SECONDARY", "PAN");
		zincCameraControl.enableRaycaster(tissueScene, _pickingCellCallback(), undefined);
		tissueScene.autoClearFlag = false;
		
		gui = new dat.GUI({autoPlace: false});
		gui.domElement.id = 'gui';
		gui.close();
		var customContainer = document.getElementById("tissueGui").append(gui.domElement);
		var controller = gui.addColor(guiControls, 'Background');
		controller.onChange(volumeRenderBackGroundChanged());
		var modelSelected = gui.add(guiControls, 'model', [ 'dynamic_heart'] );
		var playButton = { 'Play/Pause':function(){ triggerAnimation() }};
		var contrastButton = { 'Deformation':function(){ triggerContrast() }};
		var resetSliderButton = { 'Reset':function(){ resetSlider() }};
		gui.add(guiControls, 'steps', 128, 512).step(1).onChange(changeSteps());
		gui.add(guiControls, 'alphaCorrection', 1.0, 20.0).step(0.1).onChange(changeAlphaCorrection());
		gui.add(guiControls, 'min_x', 0.00, 0.99).step(0.01).onChange(changeBoundary("min_x"));
		gui.add(guiControls, 'max_x', 0.01, 1.0).step(0.01).onChange(changeBoundary("max_x"));
		gui.add(guiControls, 'min_y', 0.00, 0.99).step(0.01).onChange(changeBoundary("min_y"));
		gui.add(guiControls, 'max_y', 0.01, 1.0).step(0.01).onChange(changeBoundary("max_y"));
		gui.add(guiControls, 'min_z', 0.00, 0.99).step(0.01).onChange(changeBoundary("min_z"));
		gui.add(guiControls, 'max_z', 0.01, 1.0).step(0.01).onChange(changeBoundary("max_z"));
		timeSlider = gui.add(guiControls, 'current_time', 0.0, 29.0).step(0.1).onChange(changeCurrentTime());
		gui.add(guiControls, 'Speed', 0, 290.0).step(1.0).onChange(speedSliderChanged());
		gui.add(playButton, 'Play/Pause');
		gui.add(contrastButton, 'Deformation');
		gui.add(guiControls, 'lowerTolerance', 0.001, 1.0).step(0.001).onChange(changeLowerTolerance());
		gui.add(guiControls, 'upperTolerance', 0.001, 1.0).step(0.001).onChange(changeUpperTolerance());
		gui.add(guiControls, 'targetIntensity', 0.001, 1.0).step(0.001).onChange(changeTargetIntensity());
		gui.add(resetSliderButton,'Reset');
		
		modelSelected.onChange(function(value) {
			changeModels(value);
		} );
		
		resetSlider();
		materialSecondPass.visible = false;
		_this.showCollagenVisible(true);
		tissueRenderer.addPreRenderCallbackFunction(renderFirstPass());
		tissueRenderer.addPreRenderCallbackFunction(updateTimeSliderCallback());
		tissueRenderer.animate();
	}
	
	var addUICallback = function() {
		var callbackElement = document.getElementById("cellButton1");
		callbackElement.onclick = function() { openCellModelUI('Cardiac myocyte'); };
		callbackElement = document.getElementById("cellButton2");
		callbackElement.onclick = function() { openCellModelUI('Cardiac fibroblast'); };
		callbackElement = document.getElementById("cellButton3");
		callbackElement.onclick = function() { openConstitutiveLawsLink(); };
	}
	
	var volumeRenderInit = function() {
		loadExternalFiles(['shaders/tissueShaderFirstPass.vs', 'shaders/tissueShaderFirstPass.fs',
			'shaders/dynamicTissueShaderSecondPass.vs', 'shaders/dynamicTissueShaderSecondPass.fs'], 
			function (shaderText) {
								volumeRenderStart(shaderText);
							}, function (url) {
							alert('Failed to download "' + url + '"');});
	}
	
	var loadHTMLComplete = function(link) {
		return function(event) {
			var localDOM = document.getElementById(PanelName);
			var childNodes = null;
			if (link.import.body !== undefined)
				childNodes = link.import.body.childNodes;
			else if (link.childNodes !== undefined)
				childNodes = link.childNodes;
			for (i = 0; i < childNodes.length; i++) {
				localDOM.appendChild(childNodes[i]);
			}
			addUICallback();
			volumeRenderInit();
			document.head.removeChild(link);
			UIIsReady = true;
		}
	}
	
	var initialise = function() {
		var link = document.createElement('link');
		link.rel = 'import';
		link.href = 'snippets/tissueViewer.html';
		link.onload = loadHTMLComplete(link);
		link.onerror = loadHTMLComplete(link);
		document.head.appendChild(link);	
	}
	
	this.setTissueTitleString = function(text) {
	 	var text_display = document.getElementById('TissueTitle');
	 	text_display.innerHTML = text;
	}
	
	this.showButtons = function(flag) {
		if (flag)
			document.getElementById("cellButtonContainer").style.visibility = "visible";
		else
			document.getElementById("cellButtonContainer").style.visibility = "hidden";
	}
	
	this.showCollagenVisible = function(flag) {
		changeModels(guiControls.model);
		materialSecondPass.visible = flag;
		tissueScene.getZincCameraControls().updateDirectionalLight();
	}
	
	this.resetTissuePanel = function() {
	 	var text_display = document.getElementById('TissueTitle');
	 	text_display.innerHTML = "<strong>Tissue</strong>";
	 	_this.showCollagenVisible(false);
		_this.showButtons(false);
	}
	
	
	initialise();
}
