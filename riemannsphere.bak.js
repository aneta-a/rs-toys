

var somethingChanged = true;
function render() {
	requestAnimationFrame(render);
	
	/*
	var curRadius=document.getElementById("radius-input").valueAsNumber;
	
	if (curRadius != PROJECTION_SPHERE_RADIUS) {
		PROJECTION_SPHERE_RADIUS = curRadius;
		document.getElementById("radius-input").title=curRadius;
		document.getElementById("radius-label").innerHTML=curRadius;
		updateComplexAttribute(sphere.geometry, 
				sphere.material.complexShaderMap, 
				sphere.material.attributes);
		
		sphere.material.attributes.c.needsUpdate = true;
		updateAnchors();
		
	}*/
	if (mouseMoved) {
		if (rotating) performRotation();
		if (drawingOnTheSphere) vectorDrawTo(curMouseLocalPos);
		if (movingAnchor >= 0) updateTransform();
		mouseMoved = false;
		somethingChanged = true;
	}
	var newShowGrid = document.getElementById("show-grid-cb").checked;
	//console.log("show grid", newShowGrid);
	if ( newShowGrid != showGrid) {
		showGrid = newShowGrid;
		updateGrid();
		somethingChanged = true;
		
	} else if (showGrid && transformUpdated) {
		updateGrid();
		somethingChanged = true;
	}
	if (transformUpdated) {
		updateComplexAttribute(sphere.geometry, 
				sphere.material.complexShaderMap, 
				sphere.material.attributes);
		
		sphere.material.attributes.c.needsUpdate = true;
		//console.log("update transform", currentTransform.toString());
		updateAnchors();
		transformUpdated = false;
		somethingChanged = true;
		//if (showGrid) updateGrid();		
	}
	/*
	if (UIU.getRBSelectedValue("texture-type") != textureType) {
		textureType = UIU.getRBSelectedValue("texture-type");
	}*/
	/*if (drawingOnTheSphere) {
		vectorDrawTo(curMouseLocalPos);
    	if (UIU.getRBSelectedValue("drawing-type") == "vector" || textureType == "shader") {
    		vectorDrawTo(curMouseLocalPos);
    	} else {
    		var uv = localToUV(curMouseLocalPos);
    		drawTo(uv.u*2*textureSize, uv.v*textureSize);
    	}
                      
	}*/
	
	//if (rotationNeedsUpdate) 
		//performRotation();
	
	if (somethingChanged){
	renderer.render(scene, camera);
	somethingChanged = false;
	}
}

var textureType;

var RSTexture;
 
var textureCanvas;
var textureSize = 512;

var currentTransform;
var transformUpdated = true;

var showGrid = true;

function initTexture() {

    //RSTexture = gl.createTexture();
    //textureCanvas = document.getElementById('test-texture-canvas');
	if (textureType == "shader") {
		
	} else {
		textureCanvas = document.createElement('canvas');
		textureCanvas.width = 2*textureSize;
		textureCanvas.height = textureSize;
		console.log("canvas", textureCanvas, textureCanvas.width, textureSize);
		textureContext = textureCanvas.getContext('2d');
    
		drawTexture(textureContext, textureCanvas.width, textureCanvas.height);
}
    //handleLoadedTexture(RSTexture);
    
}

var sphere;
var renderer;
var scene;
var camera;
var marker;
var localMarker;
var canvasStyle;

var SPHERE_RADIUS = 20;

var transformAnchors = [];
var transformAnchorsValues = [];

function init () {

	scene = new THREE.Scene();
	var canvas3d = document.getElementById("canvas3d");
	camera = new THREE.PerspectiveCamera( 45, canvas3d.width / canvas3d.height, 0.1, 1000 );
	setStyleConstants();
	renderer = new THREE.WebGLRenderer({canvas: canvas3d});

	//renderer.domElement = canvas3d;
	renderer.setSize( canvas3d.width, canvas3d.height );


	//var sphGeom = new THREE.SphereGeometry(20, 32 , 32);
	var sphGeom = new THREE.SphereGeometry(SPHERE_RADIUS, 64 , 64);
	var material = new THREE.MeshLambertMaterial({color: 'blue' });//new THREE.MeshBasicMaterial( { color: 0x990000 } );
	/*
	initTexture();

	var sphTexture = new THREE.Texture(textureCanvas);
	sphTexture.needsUpdate = true;

	var bmpMaterial = new THREE.MeshLambertMaterial({
		map : sphTexture
	});
	
	bmpMaterial.needsUpdate = true;*/

	var light = new THREE.AmbientLight( 0x666666 ); // soft white light
	var directionalLight = new THREE.DirectionalLight( 0xffffff, 0.8 );
	directionalLight.position.set( -2, 1, 1 );
	scene.add( directionalLight );
	scene.add( light );
	
	currentTransform = MoebiusTransform.identity;
	transformUpdated = true;
	//var shaderMaterial = initShaderMaterial(sphGeom, signMap);
	//var shaderMaterial = initShaderMaterial(sphGeom, absValueMap);
	//var shaderMaterial = initShaderMaterial(sphGeom, valueMap);
	var shaderMaterial = initShaderMaterial(sphGeom, mandelbrotMap);
	//var shaderMaterial = initShaderMaterial(sphGeom, hvtestMap);
	//initJuliaMap();
	//var shaderMaterial = initShaderMaterial(sphGeom, juliatestMap);
	//var shaderMaterial = initShaderMaterial(sphGeom, hvtestMap);
	//var shaderMaterial = initShaderMaterial(sphGeom, chessBoardMap);
    //parseJuliaData(juliaData);
    //console.log(juliaUniforms);
	//var shaderMaterial = initShaderMaterial(sphGeom, juliaMap);

	sphere = new THREE.Mesh( sphGeom, shaderMaterial );
	sphere.dynamic = true;
	    
	scene.add( sphere );
	sphere.rotation.x = .6;
	sphere.rotation.y = 1;


	camera.position.z = 60;

	marker = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({ color: 0xff0000 }));
	localMarker = new THREE.Mesh(new THREE.SphereGeometry(1), new THREE.MeshLambertMaterial({ color: 0x0000ff }));
	//scene.add(marker);
	//sphere.add(localMarker);
	
	
    canvas3d.onmousedown = handleMouseDown;
    canvas3d.ondblclick = handleDoubleClick;
    canvas3d.oncontextmenu=function () {return false;};
    document.onmouseup = handleMouseUp;
    document.onmousemove = handleMouseMove;
    //textureCanvas.onmousedown = handleDrawCanvasMouseDown;

    /*
    //testing ComplexMatrix
    //------------------------------------
    var cmData = [];
    cmData = [[new Complex(0, 0), new Complex(0, 0), new Complex(1, 0)], 
                  [new Complex(0, 0), new Complex(1, 0), new Complex(0, 0)], 
                  [new Complex(1, 0), new Complex(0, 0), new Complex(0, 0)]];
    var testMatrix = new ComplexMatrix(cmData);
    console.log("det", testMatrix.determinant().toString(true));
    //------------------------------------
	*/
    //testing Complex
    /*
    var z = Complex(1, 1);
    var inf = z.divBy(Complex["0"]);
    var zer = z.divBy(inf);
    var undef = zer.mult(inf);
    var undef1 = inf.mult(zer);
    console.log(z.toString(true), inf.toString(true), zer.toString(true), undef.toString(true), undef1.toString(true));
    //--------------------
    */
    /**/
    /**/
    
    for (var i = 0; i < 3; i++) {
    	var p = new PointMarker();
    	transformAnchors.push(p);
    	p.numInArray = i;
    	p.hide();
    }
    
    createGrid();
    
	render();
	
}



var mouseDown = false;
var lastMouseX = null;
var lastMouseY = null;

var drawingOnTheSphere = false;
var rotating = false;
var movingAnchor = -1;
var startRotWorldMousePos = new THREE.Vector3();
var startRotLocalMousePos = new THREE.Vector3();
var startRotMatrix = new THREE.Matrix4();
var startRotQuaternion = new THREE.Quaternion();
function handleMouseDown(event) {
    mouseDown = true;
    var canvasPos = UIU.getMousePos(canvas3d, event);
    var its = getIntersects(canvasPos);
    if (its.length) {
    	var sphere_index = -1;
    	for (var i = 0; i < its.length; i++) {
     		if (its[i].object == sphere) {
    			sphere_index = i;
    			break;
    		}
    	}
    	if (sphere_index >= 0 && event.ctrlKey) {
    		
	    	curMouseLocalPos = canvasPosToLocal(canvasPos);
	    	drawingOnTheSphere = true;
		    vectorStartDraw(curMouseLocalPos);
    	} else if ((sphere_index >= 0 && !its[0].object.marker)|| 
    			(its[0].object.marker && transformAnchorsValues.length == 1)) {
	        startRotWorldMousePos = canvasPosToWorld(canvasPos);
	        startRotLocalMousePos = curMouseLocalPos.clone();
	        startRotQuaternion.copy(sphere.quaternion);
	        rotating = true;
    	} 
    	if (its[0].object.marker && transformAnchorsValues.length > 1) {
    		movingAnchor = its[0].object.marker.numInArray;
    	}
    		
    }
}

var drawing = false;
var curDrawingPos = {x: 0, y: 0};
var drawingColor = "#ff0000";
var drawingLineWidth = 1;
function handleDrawCanvasMouseDown(event) {
	curDrawingPos = UIU.getMousePos(textureCanvas, event);
	mouseDown = true;
	drawing = true;
	startDraw(curDrawingPos.x, curDrawingPos.y);
}


function handleMouseUp(event) {
    mouseDown = false;
    drawing = false;
    drawingOnTheSphere = false;
    rotating = false;
    movingAnchor = -1;
}

function handleDoubleClick(event) {
	//Preventing text selection, the default double-click behavior in some browsers
	if (window.getSelection)
        window.getSelection().removeAllRanges();
    else if (document.selection)
        document.selection.empty();
	//-----------------------------------------------
	var dblclickPos = UIU.getMousePos(canvas3d, event);
	var its = getIntersects(dblclickPos);
	if (its.length) {
		if (its[0].object.marker) {
			removeAnchor (its[0].object.marker);
			
			
		} else {
			for (var i = 0; i < its.length; i ++) {
				if (its[i].object == sphere) {
			
					addAnchor(dblclickPos);
					break;
				}
			}
		}
	}

}


function applyTexture() {
	handleLoadedTexture(RSTexture);
}




var curMouseLocalPos = new THREE.Vector3();
var curWorldMousePos = new THREE.Vector3();
var vectorChangeBarrier = 0.01;
//var rotationNeedsUpdate = false;
var rotQuaternion = new THREE.Quaternion();
var mouseMoved = false;
function handleMouseMove(event) {
    if (!mouseDown) {
        return;
    } 
    if (drawing) {
    	curDrawingPos = UIU.getMousePos(textureCanvas, event);
    	drawTo(curDrawingPos.x, curDrawingPos.y);
    } else {
    	var canvasPos = UIU.getMousePos(canvas3d, event);
	    var newWorldMousePos = canvasPosToWorld(canvasPos);
    	if (newWorldMousePos && newWorldMousePos.distanceTo(curWorldMousePos) > vectorChangeBarrier) {
    		curWorldMousePos.copy(newWorldMousePos);
    		curMouseLocalPos = sphere.worldToLocal(newWorldMousePos);
    		mouseMoved = true;
    	}
    }
}
var rotAxis = new THREE.Vector3();
var rotAngle;
function performRotation() {
	rotAxis.crossVectors(startRotWorldMousePos, curWorldMousePos);
	rotAxis.normalize();
	rotAngle = curWorldMousePos.angleTo(startRotWorldMousePos);
	rotQuaternion.setFromAxisAngle(rotAxis, rotAngle);
	sphere.quaternion.multiplyQuaternions(rotQuaternion, startRotQuaternion);
	//rotationNeedsUpdate = false;
	
	//sphere.material.attributes.normal.needsUpdate = true;
	//console.log("attr", sphere.material.attributes);
	
}
    

var curLineVertices = [];
var lastDrawingLine = null;
var lastVertex = new THREE.Vector3();
var curDrawingVertexIndex = 0;
var maxDrawingBufferSize = 1000;
var lineOverTheSphere = 1.01;
function vectorStartDraw(pos) {
	
	lastDrawingLine = new THREE.Line(new THREE.Geometry({vertices: [pos.clone().multiplyScalar(lineOverTheSphere)]}), 
			new THREE.LineBasicMaterial({color: drawingColor}));
	drawedLines.push(lastDrawingLine);
	while (lastDrawingLine.geometry.vertices.length < maxDrawingBufferSize)
		lastDrawingLine.geometry.vertices.push(new THREE.Vector3());
	sphere.add(lastDrawingLine);
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
		if (curDrawingVertexIndex >= maxDrawingBufferSize) vectorStartDraw(pos);
		//console.log("vectorDrawTo", pos, lastDrawingLine.geometry.vertices, sphere.children);
	}
}







function checkDrawingType(){
	return UIU.getRBSelectedValue("drawing-type");
}
function clearDrawing() {
	if (sphere.material.map) {
		drawTexture(textureCanvas.getContext("2d"), 2*textureSize, textureSize);
		sphere.material.map.needsUpdate = true;
	}
	console.log("clear", drawedLines);
	for (var j = 0; j < drawedLines.length; j++) {
		sphere.remove(drawedLines[j]);
		
		//drawedLines[j].dispose();
	}
	drawedLines = [];
}

var drawedLines = [];


//---------------------Point convertions------------------

var raycaster = new THREE.Raycaster();
var projector = new THREE.Projector();
var directionVector = new THREE.Vector3();
function canvasPosToWorld(pos) {
    var intersects = getIntersects(pos);
    if (intersects.length) {
    	var i = 0;
    	while (i < intersects.length) {
     		if (intersects[i].object == sphere) {
    			return intersects[i].point;
    		}
    		i++;
    	}
    	return intersects[0].point.normalize().multiplyScalar(SPHERE_RADIUS);
    	
    }
    else return null;
	
}


function getIntersects(pos) {
	var x = ( pos.x / canvas3d.width ) * 2 - 1;
    var y = -( pos.y / canvas3d.height ) * 2 + 1;

    directionVector.set(x, y, 1);
     projector.unprojectVector(directionVector, camera);
    directionVector.sub(camera.position);
    directionVector.normalize();
    raycaster.set(camera.position, directionVector);
    var intersects = raycaster.intersectObjects(scene.children, true);
	return intersects;
}



function localToSpherical(pos) {
	var r = pos.clone().normalize();
	var phi = -Math.atan2(r.z, r.x);
	var theta = -Math.asin(r.y);
	return {phi: phi, theta: theta}
	
}

function localToUV(pos) {	
	return sphericalToUV(localToSpherical(pos));
}
function sphericalToUV(sph) {
	return {u: 0.5*(sph.phi/Math.PI+1), v: sph.theta/Math.PI+.5};
}

function sphericalToLocalNormalized(sph) {
	return new THREE.Vector3(
				Math.cos(sph.theta)*Math.cos(sph.phi),
				-Math.sin(sph.theta),
				-Math.cos(sph.theta)*Math.sin(sph.phi)
			);
}

function canvasPosToLocal(pos) {
	var p = canvasPosToWorld(pos);
	if (p) return sphere.worldToLocal(p);
    else return null;

}


//--------------------------------------------------------

//----------------------Drawing-------------------------
var textureBkgColor = '#EECCFF';
var textureNetColor = '#000066';
var textureNetWidth = 1;
function drawTexture(ctx, w, h) {
	console.log("drawing texture", w, h);
	ctx.clearRect(0, 0, w, h);
	ctx.fillStyle = textureBkgColor;
	ctx.fillRect(0, 0, w, h);
	ctx.beginPath();
	var xLinesNum = 20;
	var yLinesNum = 20;
	var lineDetailes = 500;
	var c = new Complex();
	var xy = new THREE.Vector2();
	for (var i = -xLinesNum; i <= xLinesNum; i++) {
		c = new Complex(i, -yLinesNum);
		xy = c.toTexture();
		moveToImpl(ctx, xy.x, xy.y);
		for (var j = 0; j<=lineDetailes; j++){
			c = new Complex(i, 2*j*yLinesNum/lineDetailes - yLinesNum);
			xy = c.toTexture();
			drawToImpl(ctx,xy.x, xy.y);
		}
	}
	for (var i = -yLinesNum; i <= yLinesNum; i++) {
		c = new Complex(-xLinesNum, i);
		xy = c.toTexture();
		moveToImpl(ctx,xy.x, xy.y);
		for (var j = 0; j<=lineDetailes; j++){
			c = new Complex(2*j*xLinesNum/lineDetailes - xLinesNum, i);
			xy = c.toTexture();
			drawToImpl(ctx, xy.x, xy.y);
		}
	}
	ctx.strokeStyle = textureNetColor;
	ctx.lineWidth = textureNetWidth;
	ctx.stroke();

}

function startDraw(x, y) {
	console.log("draw on canvas started", x, y);
	var ctx = textureCanvas.getContext("2d");
	ctx.strokeStyle = drawingColor;
	ctx.lineWidth = drawingLineWidth;
	ctx.beginPath();
	ctx.moveTo(x, y);
	ctx.curPos = {x: x, y: y};
}

function drawTo(x, y) {
	//console.log("draw to", x, y);
	var ctx = textureCanvas.getContext("2d");
	//ctx.lineTo(x, y);
	drawToImpl(ctx, x, y);
	ctx.stroke();
	sphere.material.map.needsUpdate = true;//= new THREE.Texture(textureCanvas);
	
}


function drawToImpl(ctx, x, y, notAutoCorrect) {
	
	if (notAutoCorrect) {
		ctx.lineTo(x, y);
	} else if (Math.abs(x - ctx.curPos.x) > textureSize) {
		var yc;
		if (ctx.curPos.x < textureSize) {
			yc = ctx.curPos.y + (y - ctx.curPos.y)* ctx.curPos.x/(ctx.curPos.x - x + 2*textureSize);
			ctx.lineTo(0, yc);
			ctx.moveTo(2*textureSize, yc);
			ctx.lineTo(x, y);
		} else {
			yc = ctx.curPos.y + (y - ctx.curPos.y)*(2*textureSize - ctx.curPos.x)/(x - ctx.curPos.x + 2*textureSize);
			ctx.lineTo(2*textureSize, yc);
			ctx.moveTo(0, yc);
			ctx.lineTo(x, y);
		}
	} else {
		ctx.lineTo(x, y);
	}
	ctx.curPos = {x:x, y:y};
}
function moveToImpl (ctx, x, y) {
	ctx.moveTo(x, y);
	ctx.curPos = {x:x, y:y};
}

//---------------------------------------------------------
