var RSCanvas = function(canvas, materialData) {
	
	

	//------------------privileged methods---------------------------------
	//------------------event handlers-------------------------------------
    this.handleMouseDown = function(event) {
        mouseDown = true;
        console.log("mode down", that, that.rsCanvasId);
        var canvasPos = UIU.getMousePos(that.canvas3d, event);
        var its = that.converter.getIntersects(canvasPos);
        if (its.length) {
        	var sphere_index = -1;
        	for (var i = 0; i < its.length; i++) {
         		if (its[i].object == that.sphere) {
        			sphere_index = i;
        			break;
        		}
        	}

        	if (sphere_index >= 0 && event.ctrlKey) {
        		
    	    	curMouseLocalPos = that.converter.canvasPosToLocal(canvasPos);
    	    	drawingOnTheSphere = true;
    		    vectorStartDraw(curMouseLocalPos);
        	} else if ((sphere_index >= 0 && !its[0].object.marker)|| 
        			(its[0].object.marker && (transformAnchorsValues.length == 1 && its[0].object.marker.numInArray !== undefined))) {
    	        startRotWorldMousePos = that.converter.canvasPosToWorld(canvasPos);
    	        startRotLocalMousePos = curMouseLocalPos.clone();
    	        startRotQuaternion.copy(that.sphere.quaternion);
    	        rotating = true;
        	} else if (its[0].object.marker && its[0].object.marker.numInArray === undefined 
        			&& !its[0].object.marker.fixed) {
        		movingSelectedPoint = its[0].object.marker;
        	}
        	if (its[0].object.marker && transformAnchorsValues.length > 1) {
        		movingAnchor = its[0].object.marker.numInArray;
        	}
        		
        }

    },
     this.handleDoubleClick = function(event) {	
    	//Preventing text selection, the default double-click behavior in some browsers
    	if (window.getSelection)
            window.getSelection().removeAllRanges();
        else if (document.selection)
            document.selection.empty();
    	//-----------------------------------------------
    	var dblclickPos = UIU.getMousePos(that.canvas3d, event);
    	var its = that.converter.getIntersects(dblclickPos);
    	if (its.length) {
    		if (its[0].object.marker) {
    			removeAnchor (its[0].object.marker);
    			
    			
    		} else {
    			for (var i = 0; i < its.length; i ++) {
    				if (its[i].object == that.sphere) {
		    			if (event.shiftKey) {
		    				addSelectedPointAnchor(that.sphere.worldToLocal(its[i].point));
		    			} else {
		    				addAnchor(dblclickPos);
		    			}
    					break;
    				}
    			}
    		}
    	}
    };
    this.handleMouseUp = function(event) {
        mouseDown = false;
        drawingOnTheSphere = false;
        rotating = false;
        movingAnchor = -1;
        movingSelectedPoint = null;
    };

    this.handleMouseMove = function(event) {
        if (!mouseDown) {
            return;
         
       } else {
        	var canvasPos = UIU.getMousePos(that.canvas3d, event);
    	    var newWorldMousePos = that.converter.canvasPosToWorld(canvasPos);
        	if (newWorldMousePos && newWorldMousePos.distanceTo(curWorldMousePos) > vectorChangeBarrier) {
        		curWorldMousePos.copy(newWorldMousePos);
        		curMouseLocalPos = that.sphere.worldToLocal(newWorldMousePos);
        		mouseMoved = true;
        	}
        }
    };
    this.isMovingSelectedPoint = function( ) {return movingSelectedPoint != null }
    //------------------end event handlers------------------------------------
    
	this.showGrid = function(newShowGrid) {
		if (newShowGrid !== false) newShowGrid = true;
		if ( newShowGrid != this.showGrid) {
			this.showGrid = newShowGrid;
			updateGrid();
			this.somethingChanged = true;
		}
	};
	this.hideGrid = function() {this.showGrid(false);},
	
	/*this.resetTransform = function() {
		this.setTransform(MoebiusTransform.identity);
	};*/
	
	this.render = function() {
		if (!this.inited) return;
		if (mouseMoved) {
			if (rotating) performRotation();
			if (drawingOnTheSphere) vectorDrawTo(curMouseLocalPos);
			if (movingAnchor >= 0) this.updateTransform();
			if (movingSelectedPoint) {
				movingSelectedPoint.setPosition(curMouseLocalPos);
				that.dispatchEvent( new CustomEvent("selectedPointsChanged"));
			}
			mouseMoved = false;
			this.somethingChanged = true;
		}
		if ( this.showGridChanged) {
			
			this.grid.updateGrid();
			this.somethingChanged = true;
			this.showGridChanged = false;
			
		} else if (this.showGrid && this.transformUpdated) {
			this.grid.updateGrid();
			this.somethingChanged = true;
		}

		if (this.transformUpdated) {
			if (this.sphere.material instanceof THREE.ShaderMaterial){
				updateComplexAttribute(this.sphere.geometry, 
						this.sphere.material.complexShaderMap, 
						this.sphere.material.attributes);
				
				this.sphere.material.attributes.c.needsUpdate = true;
				this.sphere.material.attributes.scale.needsUpdate = true;
			}
			updateAnchors();
			transformDrawings();
			this.transformUpdated = false;
			this.somethingChanged = true;
			//if (showGrid) updateGrid();		
		}


		if (this.somethingChanged) {
			this.renderer.render(this.scene, this.camera);
			this.somethingChanged = false;
		}

		
	}
	
	//------------private vars-------------------------------------------
	var mouseDown = false;
	var mouseMoved = false; 
	var lastMouseX = null;
	var lastMouseY = null;
	
	var rotating = false;
	var movingAnchor = -1;
	
	var curMouseLocalPos = new THREE.Vector3();
	var curWorldMousePos = new THREE.Vector3();
	var startRotWorldMousePos = new THREE.Vector3();
	var startRotLocalMousePos = new THREE.Vector3();
	var startRotMatrix = new THREE.Matrix4();
	var startRotQuaternion = new THREE.Quaternion();
	var vectorChangeBarrier = 0.01;
	//var rotationNeedsUpdate = false;
	var rotQuaternion = new THREE.Quaternion();
	
	
	var transformAnchors = [];
	var transformAnchorsValues = [];
	

	//------------end private vars---------------------------------------
	//------------private methods----------------------------------------
	//---------------grid------------------------------------------------
	this.createGrid = function () {
		this.grid.createGrid();
	};
	function updateGrid() {
		this.grid.updateGrid();
	};
	//---------------end grid------------------------------------------
	
	//---------transform anchors---------------------------------------
	this.createTransformAnchors = function() {
	    for (var i = 0; i < 3; i++) {
	    	var p = new PointMarker(new Complex(), this);
	    	transformAnchors.push(p);
	    	p.numInArray = i;
	    	p.hide();
	    }

	};

	/*function addAnchor() {};
	function removeAnchor() {};
	function updateAnchors() {};*/
	//----------end transform anchors----------------------------------
	
	//-------------drawings--------------------------------------------
	var drawingOnTheSphere = false;

	var curLineVertices = [];
	var lastDrawingLine = null;
	var lastVertex = new THREE.Vector3();
	var curDrawingVertexIndex = 0;
	var maxDrawingBufferSize = 1000;
	var lineOverTheSphere = 1.01;
	var drawedLines = [];
	
	//Arrays of Complex
	var curDrawedLineData = [];
	var drawedLinesData = [];

	function vectorStartDraw(pos, continueLogical) {
		
		lastDrawingLine = new THREE.Line(new THREE.Geometry({vertices: [pos.clone().multiplyScalar(lineOverTheSphere)]}), 
				new THREE.LineBasicMaterial({color: RSCanvas.drawingColor}));
		drawedLines.push(lastDrawingLine);
		if (continueLogical) {
			curDrawedLineData.push(CU.localToComplex(pos, that.currentTransform));
		} else {
			curDrawedLineData = [CU.localToComplex(pos, that.currentTransform)];
			drawedLinesData.push(curDrawedLineData);
		}
		while (lastDrawingLine.geometry.vertices.length < maxDrawingBufferSize)
			lastDrawingLine.geometry.vertices.push(new THREE.Vector3());
		//console.log("start draw", this)
		that.sphere.add(lastDrawingLine);
		curDrawingVertexIndex = 1;
		//curLineVertices = [pos.clone().multiplyScalar(1.2)];
		lastVertex = pos.clone();
		
	}

	function vectorDrawTo(pos) {
		if (pos.distanceTo(lastVertex) > 0.1) {
			lastDrawingLine.geometry.vertices[curDrawingVertexIndex++] = 
				pos.clone().multiplyScalar(lineOverTheSphere);
			
			lastDrawingLine.geometry.verticesNeedUpdate = true;
			lastDrawingLine.geometry.buffersNeedUpdate = true;
			lastDrawingLine.visible = true;
			lastVertex = pos;
			if (curDrawingVertexIndex >= maxDrawingBufferSize) {vectorStartDraw(pos, true);}
			else {			curDrawedLineData.push(CU.localToComplex(pos, that.currentTransform));};
			//console.log("vectorDrawTo", pos, lastDrawingLine.geometry.vertices, sphere.children);
		}
	}
	this.clearDrawing = function() {
		if (this.sphere.material.map) {
			drawTexture(textureCanvas.getContext("2d"), 2*textureSize, textureSize);
			this.sphere.material.map.needsUpdate = true;
		}
		for (var j = 0; j < drawedLines.length; j++) {
			this.sphere.remove(drawedLines[j]);
			
			//drawedLines[j].dispose();
		}
		drawedLines = [];
		this.curDrawedLineData = [];
		this.drawedLinesData = [];

		
		this.somethingChanged = true;
	};
	
	function transformDrawings() {
		var drawedLineIndex = -1;
		var vertexIndex = -1;
		for (var i = 0; i < drawedLinesData.length; i++) {
			drawedLineIndex ++;
			
			
			vertexIndex = -1;
			for (var j = 0; j < drawedLinesData[i].length; j++) {
				vertexIndex++;
				if (vertexIndex >= maxDrawingBufferSize) {
					drawedLineIndex ++;
					vertexIndex = 0;
				}
				if (drawedLines[drawedLineIndex]) {
					drawedLines[drawedLineIndex].geometry.vertices[vertexIndex] = 
						CU.complexToLocalNormalized(drawedLinesData[i][j], that.currentTransform).multiplyScalar(RSCanvas.SPHERE_RADIUS*lineOverTheSphere);
				}
			}
		}
		for (var l = 0; l < drawedLines.length; l++) {
			drawedLines[l].geometry.verticesNeedUpdate = true;
		}
	};


	//-------------end drawings----------------------------------------
	
	//------------rotation---------------------------------------------
	var rotAxis = new THREE.Vector3();
	var rotAngle;
	function performRotation() {
		rotAxis.crossVectors(startRotWorldMousePos, curWorldMousePos);
		rotAxis.normalize();
		rotAngle = curWorldMousePos.angleTo(startRotWorldMousePos);
		rotQuaternion.setFromAxisAngle(rotAxis, rotAngle);
		that.sphere.quaternion.multiplyQuaternions(rotQuaternion, startRotQuaternion);
		//rotationNeedsUpdate = false;
		
		//sphere.material.attributes.normal.needsUpdate = true;
		//console.log("attr", sphere.material.attributes);
		
	}
	//--------------end rotation----------------------------------------

	//-------------Moebius transformations---------------------------
	this.updateTransform = function() {
		if (transformAnchorsValues.length < 2) return;
		transformAnchors[movingAnchor].moveTo(curMouseLocalPos);
		var zs = [];
		var ws = [];
		for (var i = 0; i < transformAnchorsValues.length; i++) {
			ws.push(transformAnchors[i].value);
			zs.push(transformAnchors[i].baseValue);
		}
		if (transformAnchorsValues.length == 2) {
			var j = movingAnchor == 0 ? 1 : 0;
			ws.push(transformAnchors[j].oppositeValue);
			zs.push(transformAnchors[j].oppositeBaseValue);
		}
		this.currentTransform = MoebiusTransform.byInitEndVectors(zs, ws);
		//updateTextUI();
		
		this.transformUpdated = true;
	};
	this.resetTransform = function() {
		this.currentTransform = MoebiusTransform.identity;
		//updateTextUI();
		this.transformUpdated = true;
	};
	function addAnchor (canvasPos) {
		var transformAnchorsNum = transformAnchorsValues.length;
		var pm = transformAnchorsNum < 3 ? transformAnchors[transformAnchorsNum] :transformAnchors[2];
		pm.show();
		pm.setPosition(that.converter.canvasPosToLocal(canvasPos));
		if (transformAnchorsNum < 3) {
			transformAnchorsValues.push(pm.value);
			transformAnchorsNum ++;
		} else {
			transformAnchorsValues[2] = pm.value;
		}
		that.somethingChanged = true;
		
	}
	
	var selectedPointsAnchors = [];
	
	function addSelectedPointAnchor (pos) {
		var spa; 
		var firstHiddenPointIndex = -1;
		var selectedPointsCount = 0;
		for (var i = 0; i < selectedPointsAnchors.length; i++) {
			if (selectedPointsAnchors[i].hidden) {
				firstHiddenPointIndex = i;
				
			} else {selectedPointsCount ++;}
		}
		if (this.selectedPointsLimit < 0 || selectedPointsCount < that.selectedPointsLimit) {
			if (firstHiddenPointIndex >= 0) {
				spa = selectedPointsAnchors[firstHiddenPointIndex];
				spa.show();
				spa.setPosition(pos);
			}  else {
				spa = new PointMarker(pos, that, "selected point");
				selectedPointsAnchors.push(spa);
				spa.show();
			}
			that.dispatchEvent( new CustomEvent("selectedPointsChanged"));

		}
		console.log("addSelectedPointAnchor", pos.x, pos.y, pos.z, "selectedPointsCount", selectedPointsCount, "limit", that.selectedPointsLimit, this);
		that.somethingChanged = true;
	}
	function removeAnchor (pm) {
		if (pm.numInArray !== undefined) {
			var na = pm.numInArray;
			transformAnchorsValues.splice(na, 1);
			//transformAnchorsNum --;
			var i = -1;
			while (++i < transformAnchorsValues.length) {
				pm = transformAnchors[i];
				pm.show();
				pm.setValue(transformAnchorsValues[i]);
			}
			while (i < 3) {
				transformAnchors[i++].hide();
			}
		} else {
			pm.hide();
			that.dispatchEvent( new CustomEvent("selectedPointsChanged"));

			
		}
		that.somethingChanged = true;

	}

	function updateAnchors() {
		for (var i = 0; i < transformAnchorsValues.length; i++) {
			transformAnchors[i].setValue(transformAnchorsValues[i]);
		}
		for (var j = 0; j < selectedPointsAnchors.length; j++) {
			if (!selectedPointsAnchors[j].hidden) {
				selectedPointsAnchors[j].updatePosition();
			}
		}
		this.somethingChanged = true;
	}
	this.hideAnchors = function() {
		transformAnchorsValues = [];
		for (var i = 0; i<3; i++)
			transformAnchors[i].hide();
		this.somethingChanged = true;
	}
	//--------------End Moebius transformation--------------------------
	//-----------------shader material----------------------------------
	this.initShaderMaterial = function(geom, shaderMap) {
		if (!shaderMap) shaderMap = new ComplexShaderMap();
		sphereShaderAttributes = {
				c: {type: "v2", value: []},
				scale: {type: "f", value: []}};
		updateComplexAttribute(geom, shaderMap, sphereShaderAttributes);
		var uniforms = THREE.UniformsUtils.merge ([
			THREE.UniformsLib[ "lights" ],
		{
			diffuse: {type: "c", value: new THREE.Color( 0xffffff )}, 
			ambient: {type: "c", value: new THREE.Color( 0xffffff )},
			emissive: {type: "c", value: new THREE.Color( 0x000000 )}
				},
				shaderMap.uniforms]);

		                                           
		                                       
		var shaderMaterial = new THREE.ShaderMaterial({
			  attributes: sphereShaderAttributes,
			  uniforms:uniforms,
			  vertexShader: vertexShaderString,//document.getElementById('vertexShader').textContent,
			  fragmentShader: this.getFragmentShaderString(shaderMap),//document.getElementById('fragmentShader').textContent,
			  lights: true
			  });
		shaderMaterial.complexShaderMap = shaderMap;
		return shaderMaterial;
	}
	var vertexShaderString = [
	                      	//"attribute vec3 aLocalPosition;",
	                      	"attribute vec2 c;",
	                      	"attribute float scale;",
	                      	"varying vec3 vPosition;",
	                      	"varying vec3 vLightFront;",
	                      	"varying vec2 vC;",
	                      	"varying float vScale;",
	                      	"uniform vec3 diffuse;",
	                      	"uniform vec3 ambient;",
	                      	"uniform vec3 emissive;",
	                      	"uniform vec3 ambientLightColor;",
	                      	"#if MAX_DIR_LIGHTS > 0",
	                      		"uniform vec3 directionalLightColor[ MAX_DIR_LIGHTS ];",
	                      		"uniform vec3 directionalLightDirection[ MAX_DIR_LIGHTS ];",
	                      	"#endif",

	                      	"void main() {",
	                      		"vec3 transformedNormal = normalMatrix * normal;",
	                      		"vLightFront = vec3( 0.0 );",
	                      		"#if MAX_DIR_LIGHTS > 0",
	                      			"for( int i = 0; i < MAX_DIR_LIGHTS; i ++ ) {",
	                      		
	                      				"vec4 lDirection = viewMatrix * vec4( directionalLightDirection[ i ], 0.0 );",
	                      				"vec3 dirVector = normalize( lDirection.xyz );",
	                      		
	                      				"float dotProduct = dot( transformedNormal, dirVector );",
	                      				"vec3 directionalLightWeighting = vec3( max( dotProduct, 0.0 ) );",
	                      		
	                      		
	                      				"vLightFront += directionalLightColor[ i ] * directionalLightWeighting;",
	                      			"}",
	                      		
	                      		"#endif",
	                      		"vLightFront = vLightFront * diffuse + ambient * ambientLightColor + emissive;",
//	                      		"vLightFront = vLightFront + ambient;",
	                      	
	                      		//"vPosition = aLocalPosition;",
	                      		"vC =c;",
	                      		"vScale = scale;",
	                      		"gl_Position = projectionMatrix * modelViewMatrix * vec4(position,1.0);",
	                      	 "}"
	                      ].join("\n");



	                      this.getFragmentShaderString = function (complexShaderMap) {
	                      	if (!complexShaderMap) {
	                      		complexShaderMap = new ComplexShaderMap();
	                      	}
	                      	var fragmentShaderString = [
	                      	                           	complexShaderMap.uniformsDeclaration,
	                      	                           	"varying vec3 vLightFront;",

	                      	                            //"varying vec3 vPosition;",
	                      	                            "varying vec2 vC;",
	                      	                            "varying float vScale;",
	                      	                            complexShaderMap.methods ? complexShaderMap.methods : "",

	                      	                            "void main() {",
	                      	                            "float r, g, b;",
	                      	                            "vec2 c = vC;",
	                      	                            "float scale = vScale;",
	                      	                            complexShaderMap.code,
	                      	                            
	                      	                            "gl_FragColor = vec4(r, g, b, 1.0);",
	                      	                           	"gl_FragColor.xyz *= vLightFront;",
	                      	                        	"}"
	                      	                        ].join("\n");
	                      	return fragmentShaderString;
	                      };
	                      function updateComplexAttribute(geom, shaderMap, attr){
	                    		if (!attr) {
	                    			attr = {};
	                    		}
	                    		var newArray = false;
	                    		if (!attr.c) {
	                    			attr.c = {type: "v2", value:[]};
	                    			attr.scale = {type: "f", value: []};
	                    			newArray = true;
	                    		}
	                    		
	                    		
	                    		for (var i = 0; i < geom.vertices.length; i++){
	                    			var c0 = CU.localToComplex(geom.vertices[i]);
	                    			var c, scale;
	                    			if (that.currentTransform) {
	                    				c = that.currentTransform.apply(c0);
	                    				scale = that.currentTransform.scale(c);
	                    			} else {
	                    				c = c0; 
	                    				scale = 1;
	                    			}
	                    			var vec = shaderMap.polar ? new THREE.Vector2(c.r, c.t):
	                    				new THREE.Vector2(c.re, c.i);
	                    			if (newArray) {
	                    				attr.c.value.push(vec);
	                    				attr.scale.value.push(scale);
	                    				}
	                    			else {
	                    				attr.c.value[i] = vec;
	                    				attr.scale.value[i] = scale;
	                    				}
	                    		}
	                    		attr.c.needsUpdate = true;
	                    		attr.scale.needsUpdate = true;
	                    		return attr;
	                    	}


	                    	var sphereShaderAttributes = {};

	//---------------end shader material--------------------------------
	
	//------------end private methods-----------------------------------

	                		this.addSelectedPoint= function(z) {
	                			
	                				var exists = false;
	                			for (var i = 0; i < selectedPointsAnchors.length; i++){
	                				if (!selectedPointsAnchors[i].hidden && 
	                						(selectedPointsAnchors[i].value.equals(z))){
	                					exists = true;
	                					
	                				}
	                			}
	                			if (!exists) 
	                				addSelectedPointAnchor(CU.complexToLocalNormalized(z, this.currentTransform).multiplyScalar(RSCanvas.SPHERE_RADIUS));
	                		};
	                		this.addSelectedPoints= function(zs) {
	                			console.log("addSelectedPoints", zs);
	                			for (var i = 0; i < zs.length; i++){
	                				this.addSelectedPoint(zs[i]);
	                			}
	                		};
	                		this.getSelectedPoints = function() {
	                			var res = [];
	                			for (var i = 0; i < selectedPointsAnchors.length; i++){
	                				if (!selectedPointsAnchors[i].hidden) res.push(selectedPointsAnchors[i].value);
	                			}
	                			return res;
	                		};
    
    //-----------initial function calls---------------------------
	var that = this;
	this.init(canvas, materialData);
	
    this.canvas3d.onmousedown = that.handleMouseDown;
    this.canvas3d.ondblclick = that.handleDoubleClick;
    this.canvas3d.oncontextmenu=function () {return false;};
    //?????
    document.addEventListener("mouseup", this.handleMouseUp);
    document.addEventListener("mousemove",this.handleMouseMove);

	this.render();

	
};
//static vars
RSCanvas.SPHERE_RADIUS = 20;

RSCanvas.prototype = new Object(EventDispatcher);
var rp = RSCanvas.prototype;

		//--public functions----------------
		rp.constructor = RSCanvas;
		rp.init = function(canvas, materialData) {
			this.canvas3d = canvas;
			var sphGeom = new THREE.SphereGeometry(RSCanvas.SPHERE_RADIUS, 64 , 64);

			var sphMaterial = new THREE.MeshLambertMaterial({ color: 0xff0000 }); 
			if (materialData) { 
				if (materialData instanceof ComplexShaderMap) {
					sphMaterial = this.initShaderMaterial(sphGeom, materialData);
				} else if (materialData instanceof HTMLCanvasElement){
					sphMaterial = new THREE.MeshLambertMaterial({
						map: new THREE.Texture(materialData)
					});
					sphMaterial.needsUpdate = true;
				}
			}
			this.sphere = new THREE.Mesh( sphGeom, sphMaterial );
			this.sphere.dynamic = true;

			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera( 45, this.canvas3d.width / this.canvas3d.height, 0.1, 1000 );
			//setStyleConstants();
			this.renderer = new THREE.WebGLRenderer({canvas: this.canvas3d});

			this.renderer.setSize( this.canvas3d.width, this.canvas3d.height );


			var light = new THREE.AmbientLight( 0x666666 ); 
			var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
			directionalLight.position.set( -2, 1, 1 );
			this.scene.add( directionalLight );
			this.scene.add( light );
			
			    
			this.scene.add( this.sphere );
			this.sphere.rotation.x = .6;
			this.sphere.rotation.y = 1;
			
			this.grid = new Grid(this);


			this.camera.position.z = 60;

			//this.marker = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({ color = 0xff0000 }));
			//this.localMarker = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({ color = 0x0000ff }));
			//scene.add(marker);
			//sphere.add(localMarker);
		    this.converter = new RSCanvas.PointConverter(this);
		    this.createGrid();
		    this.createTransformAnchors();
		    
		    this.inited = true;
		    

			

		};
		rp.setTransform = function(transform) {
			this.currentTransform = transform.copy();
			this.updateTransform();
			this.transformUpdated = true;
			this.somethingChanged = true;
		};
		rp.getTransform = function() {
			return this.currentTransform.copy();
		};
		rp.addDrawing = function(drawing) {};
		rp.addDrawings = function(drawings) {};
		rp.getDrawings = function() {};
		rp.updateSphereMaterial = function (materialData, rebuildShader) {
			if (materialData instanceof ComplexShaderMap) {
				if (rebuildShader) {
					this.sphere.material.fragmentShader = this.getFragmentShaderString(materialData);
					//= this.initShaderMaterial(this.sphere.geometry, materialData);
					this.sphere.material.needsUpdate = true;
				} else {
					for (var s in materialData.uniforms) {
						if (!ComplexShaderMap.uniformsTypesMap[materialData.uniforms[s].type].array) {
							
							this.sphere.material.uniforms[s].value = materialData.uniforms[s].value;
							this.sphere.material.uniforms[s].needsUpdate = true;
						}
					}
				}
				console.log("uniforms", this.sphere.material.uniforms);
				this.somethingChanged = true;

			}
			
		};
		
		//------ end of public functions ----------------------
		//--------------vars---------------------------------
		rp.currentTransform = MoebiusTransform.identity;
		rp.somethingChanged = true;
		rp.showGrid = true;
		rp.transformUpdated = true;
		rp.inited = false;
		rp.electedPointsLimit = -1;


		
		rp.sphere = {};
		rp.renderer = {};
		rp.scene = {};
		rp.camera = {};
		rp.marker = {};
		rp.localMarker = {};
		rp.canvasStyle = {};
		rp.canvas3d = {};
		rp.converter = {}; 



		//----------------------------------------------------------
		

RSCanvas.drawingColor = 0xff0000;
RSCanvas.PointConverter = function (rsc) {
	this.canvasObj = rsc;
	
},

RSCanvas.PointConverter.prototype = {
		constructor: RSCanvas.PointConverter,
		canvasObj: {},
        raycaster: new THREE.Raycaster(),
        projector: new THREE.Projector(),
        directionVector: new THREE.Vector3(),
        //--------------functions ------------------------
        
        canvasPosToWorld: function (pos) {
            var intersects = this.getIntersects(pos);
            if (intersects.length) {
            	var i = 0;
            	while (i < intersects.length) {
             		if (intersects[i].object == this.canvasObj.sphere) {
            			return intersects[i].point;
            		}
            		i++;
            	}
            	return intersects[0].point.normalize().multiplyScalar(RSCanvas.SPHERE_RADIUS);
            	
            }
            else return null;
        	
        },


        getIntersects: function(pos) {
        	var x = ( pos.x / this.canvasObj.canvas3d.width ) * 2 - 1;
            var y = -( pos.y / this.canvasObj.canvas3d.height ) * 2 + 1;

            this.directionVector.set(x, y, 1);
            this.projector.unprojectVector(this.directionVector, this.canvasObj.camera);
            this.directionVector.sub(this.canvasObj.camera.position);
            this.directionVector.normalize();
            this.raycaster.set(this.canvasObj.camera.position, this.directionVector);
            var intersects = this.raycaster.intersectObjects(this.canvasObj.scene.children, true);
        	return intersects;
        },



        localToSpherical: function(pos) {
        	return RSCanvas.PointConverter.localToSpherical(pos);
        	
        },
        localToUV: function(pos) {	
        	return sphericalToUV(this.localToSpherical(pos));
        },
        sphericalToUV: function(sph) {
        	return {u: 0.5*(sph.phi/Math.PI+1), v: sph.theta/Math.PI+.5};
        },
        sphericalToLocalNormalized: function(sph) {
        	RSCanvas.PointConverter.sphericalToLocalNormalized (sph);
        },
        canvasPosToLocal: function(pos) {
        	var p = this.canvasPosToWorld(pos);
        	if (p) return this.canvasObj.sphere.worldToLocal(p);
            else return null;

        }

}

RSCanvas.PointConverter.sphericalToLocalNormalized = function(sph) {
	return new THREE.Vector3(
			Math.cos(sph.theta)*Math.cos(sph.phi),
			-Math.sin(sph.theta),
			-Math.cos(sph.theta)*Math.sin(sph.phi)
		);
},


RSCanvas.PointConverter.localToSpherical = function(pos) {
	var r = pos.clone().normalize();
	var phi = -Math.atan2(r.z, r.x);
	var theta = -Math.asin(r.y);
	return {phi: phi, theta: theta}
	
}
