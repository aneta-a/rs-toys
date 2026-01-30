
var Grid = function(rsCanvasArg) {
	var rsCanvas = rsCanvasArg;
	var grid = [];
	var gridLinesNum = 1;
	this.createGrid = function() {
		for (var i = -gridLinesNum; i <= gridLinesNum; i++ ) {
			//console.log("creating grid", i, rsCanvas);
			grid.push(new GridLine(i, "re", rsCanvas));//, 0x0000ff));
			grid.push(new GridLine(i, "im", rsCanvas));//, 0xff0000));
			
		}
		//dilCenterMarker = new GridPointMarker(Complex["0"]);
		createDynamicGrid();
		//var d = getSmallGridLineDistance();
		//dilCenterPlusMarker = new GridPointMarker(new Complex(d, d));
		//dilCenterMinusMarker = new GridPointMarker(new Complex(-d, -d));

	}
	this.updateGrid = function() {
		if (rsCanvas.showGrid){
			for (var i = 0; i < grid.length; i++) {
				grid[i].setVisible(true);
				grid[i].update();
			}		
		} else {
			for (var i = 0; i < grid.length; i++) {
				grid[i].setVisible(false);
			}		
			
		}
		//var w0 = currentTransform.findOpposite(Complex["Infinity"]);
		//dilCenterMarker.update(w0);
		updateDynamicGrid();
		//var d = getSmallGridLineDistance();
		//var dw = new Complex(d, d);
		//dilCenterPlusMarker.update(w0.add(dw));
		//dilCenterMinusMarker.update(w0.sub(dw));
		
		var gCenterInfoLine = document.getElementById("grid-center");
		if (gCenterInfoLine) {
			gCenterInfoLine.innerHTML = showGrid ? "Grid center " + 
					new Complex(roundTo(dynamicGridVars.reMid, dynamicGridVars.smallDiv), 
							roundTo(dynamicGridVars.imMid, dynamicGridVars.smallDiv)).toString(true) + " " + 
							
							currentTransform.scale(new Complex(dynamicGridVars.reMid,
									dynamicGridVars.imMid))
							:"";
		}
		var gStepInfoLine = document.getElementById("grid-step");
		if (gStepInfoLine) {
			gStepInfoLine.innerHTML = showGrid ? "Grid step " +dynamicGridVars.smallDiv :"";
		}
	}
	var dynamicGrid = [];
	function createDynamicGrid() {
		for (var i = -dynamicGridSmallLinesNum; i <= dynamicGridSmallLinesNum; i++){
			dynamicGrid.push(new GridLine( i/10, "re", rsCanvas, GridLine.smallDivColor));
			dynamicGrid.push(new GridLine( i/10, "im", rsCanvas, GridLine.smallDivColor));
		}
	}
	var dynamicGridVars = {};
	function updateDynamicGrid() {
		if (rsCanvas.showGrid) {
			dynamicGridVars = getDynamicGridVars();
			//console.log("update grid",dynamicGridVars);
			for (var i = -dynamicGridSmallLinesNum; i <= dynamicGridSmallLinesNum; i++){
				updateDynamicGridLine(2*(dynamicGridSmallLinesNum + i), dynamicGridVars.reMid + i*dynamicGridVars.smallDiv);
				updateDynamicGridLine(2*(dynamicGridSmallLinesNum + i) + 1, dynamicGridVars.imMid + i*dynamicGridVars.smallDiv);
				
			}
		} else {
			for (var i = 0; i < dynamicGrid.length; i++) {
				dynamicGrid[i].setVisible(false);
			}
		}

	}
	function updateDynamicGridLine(index, value) {
		var l = dynamicGrid[index];
		l.setVisible(true);
		l.setPar(value);
		var cv = roundTo(value, dynamicGridVars.bigDiv);
		//console.log(value, cv);
		if (Math.abs(value - cv) < dynamicGridVars.smallDiv*0.001) {
			//console.log("equals");
			l.setColor (GridLine.bigDivColor);
		} else {
			l.setColor(GridLine.smallDivColor);
		}
	}
	var dynamicGridSmallLinesNum = 10;
	function getDynamicGridVars() {
		var t = rsCanvas.currentTransform;
		var w0 = t.findOpposite(Complex["Infinity"]);
		var dRaw = smallRDistance*t.a.mult(t.d).sub(t.b.mult(t.c)).r/(t.c.r*t.c.r+t.d.r*t.d.r);
		var logD = Math.log(dRaw)/Math.LN10;
		var logDfloor = Math.floor(logD);
		var logDFrac = logD - logDfloor;
		var logDFrac3 = Math.floor(logDFrac*3)/3;

		var res = {};
		res.bigDiv = Math.pow(10,logDfloor + 1);
		//res.smallDiv = Math.pow(10,logDfloor);
		res.smallDiv = Math.round(Math.pow(10, logDFrac3))*Math.pow(10, logDfloor);
		var n = dynamicGridSmallLinesNum;
	 	res.reMid = roundTo(w0.re, res.bigDiv);
		res.reMin = res.reMid - n;
		res.reMax = res.reMid + n;
		res.imMid = roundTo(w0.i, res.bigDiv);
		res.imMin = res.imMid - n;
		res.imMax = res.imMid + n;
		
		return res;	
	}
	function roundTo(x, par) {
		if (par) return Math.round(x/par)*par;
		return Math.round(x);
	}
	var dilCenterMarker, dilCenterPlusMarker, dilCenterMinusMarker;// = new GridPointMarker(Complex["0"]);
	var smallRDistance = Math.PI/20;
	
}
Grid.prototype = {
		constructor: Grid
}


var GridPointMarker = function (z, color, rsCanvas) {
	this.color = color || GridPointMarker.defaultColor;
	this.reLine = new GridLine (z.re, "re", rsCanvas, this.color);
	this.imLine = new GridLine(z.i, "im", rsCanvas, this.color);
};
GridPointMarker.defaultColor = 0xff0000;
GridPointMarker.prototype = {
		constructor: GridPointMarker,
		update: function(z) {
			if (z) {
				this.reLine.setPar(z.re);
				this.imLine.setPar(z.i);
			} else {
				this.reLine.update();
				this.imLine.update();
			}
		}
};

/*function createGrid () {
	for (var i = 1; i <= gridLinesNum; i++ ) {
		grid.push(new GridLine(2*Math.PI*i/gridLinesNum, "phase"));//, 0x0000ff));
		grid.push(new GridLine(i, "rho"));//, 0xff0000));
	}
}*/

var GridLine = function(par, type, rsCanvas, color ) {
	
	//this.par = par;
	//console.log("new GridLine",type, par, rsCanvas);
	this.rsCanvas = rsCanvas;
	this.type = type || "Re";
	this.color = color || GridLine.color;
	this.setPar(par, true);
	
};
GridLine.color = 0x009900;
GridLine.smallDivColor = 0x226622;
GridLine.bigDivColor = 0x339933;
GridLine.extraDivColor = 0x006600;

GridLine.radiusFactor = 1.005;
GridLine.prototype = {
		constructor: GridLine,
		setPar: function (arg, firstCall) {
			this.par = arg;
			this.points = [];

			if (this.type.toLowerCase() == "re" || 
					this.type.toLowerCase() == "im" ||
					this.type.toLowerCase() == "phase") {
				this.points.push(Complex["Infinity"]);
			}
			if (this.type.toLowerCase() == "re") {
				this.points.push(new Complex(this.par, 0));
				this.points.push(new Complex(this.par, 1));
			}
			if (this.type.toLowerCase() == "im") {
				this.points.push(new Complex(0, this.par));
				this.points.push(new Complex(1, this.par));
			}
			if (this.type.toLowerCase() == "phase") {
				this.points.push(Complex["0"]);
				this.points.push(new Complex(Math.cos(this.par), Math.sin(this.par)));
			}
			if (this.type.toLowerCase() == "rho") {
				this.points.push(new Complex(this.par, 0));
				this.points.push(new Complex(0, this.par));
				this.points.push(new Complex(-this.par, 0));
			}
			//console.log("grid line", this.type, this.par, this.points);
			if (firstCall) {
				this.setCenterRadius();
				this.setObject();
			} else {
				this.update();
			}
		},
		setCenterRadius: function() {
			var vectors = [];
			for (var i = 0; i < 3; i++){
				vectors.push(CU.complexToLocalNormalized(this.points[i], 
						this.rsCanvas.currentTransform));
			}
			//projection of the circle center to the sphere surface
			this.center = new THREE.Vector3(); 
			this.circleCenter = new THREE.Vector3();
			this.center.crossVectors(
					vectors[1].sub(vectors[0]),
					vectors[2].sub(vectors[0]));
			this.center.normalize();
			var cs = this.center.dot(vectors[0]);
			if (cs < 0) {
				cs = -cs;
				this.center.negate();
			}
			this.radius = Math.sqrt(1 - cs*cs);
			this.circleCenter.copy(this.center).setLength(cs);
		},
		setObject: function() {
			this.geometry = new THREE.CircleGeometry(this.radius*(RSCanvas.SPHERE_RADIUS*GridLine.radiusFactor), 60);
			this.material = new THREE.LineBasicMaterial({color: this.color, wireframe: true});
			//this.material = new THREE.MeshLambertMaterial({color: this.color, wireframe: true});
			this.object = new THREE.Line(this.geometry, this.material);
			this.rsCanvas.sphere.add(this.object);
			this.setObjectPosition();
			
		},
		setObjectPosition: function() {
			this.object.position.copy(this.circleCenter);
			this.object.position.multiplyScalar(RSCanvas.SPHERE_RADIUS);
			var rotAxis = new THREE.Vector3(-this.center.y, this.center.x, 0);
			var rotAngle = Math.acos(this.center.z);
			this.object.quaternion.setFromAxisAngle(rotAxis.normalize(), rotAngle);
			
		},
		updateObject: function (){
			for (var i = 0; i < this.object.geometry.vertices.length; i++) {
				this.object.geometry.vertices[i].setLength(this.radius*(RSCanvas.SPHERE_RADIUS*GridLine.radiusFactor));
			}
			this.setObjectPosition();
			this.object.geometry.verticesNeedUpdate = true;
			this.object.updateMatrix();
		},
		setColor: function (c) {
			if (this.color != c){
				
				this.color = c;
				this.object.material.color.set(this.color);
				this.object.material.needsUpdate = true;
			}
			
		},
		setVisible: function (val) {
			this.object.visible = val;
		},
		update: function() {
			this.setCenterRadius();
			this.updateObject();
		}
		
		
}
