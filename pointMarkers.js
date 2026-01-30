
var PointMarker = function(arg, rsCanvas, colorInfo, wfColorArg) {
	this.canvas = rsCanvas;
	var geometry = new THREE.OctahedronGeometry(PointMarker.SIZE, 0);
	var	mainColor = PointMarker.COLOR;
	var	wfColor = PointMarker.WF_COLOR;
	if (colorInfo) {
	//console.log(this, arg.toString(), colorInfo, (colorInfo.constructor == String));
		if (colorInfo.constructor == String ){
			if (colorInfo.substring(0,3).toLowerCase() == "sel") {
				mainColor = PointMarker.SELECTED_POINT_COLOR;
				wfColor = PointMarker.SELECTED_POINT_WF_COLOR;
				
			} else {
				mainColor = colorInfo;
				if (wfColorArg) wfColor = wfColorArg
				else wfColor = mainColor;
			}
		}
	}
	var material = new THREE.MeshLambertMaterial({color: mainColor});
	this.object = new THREE.Mesh(geometry, material);
	this.object.marker = this;
	var wf = new THREE.Mesh(new THREE.OctahedronGeometry(PointMarker.SIZE*1.05, 0),
			new THREE.MeshLambertMaterial({color: wfColor, wireframe: true}));
	this.object.add(wf);
	wf.marker = this;

	if (arg instanceof THREE.Vector3) {
		this.position = arg;
		this.spherePosition = this.position.clone().multiplyScalar(RSCanvas.SPHERE_RADIUS);
		this.value = CU.localToComplex(arg, this.canvas.currentTransform);

		this.updateBaseValue();
	} else if (arg instanceof Complex) {
		this.setValue(arg);
	} else {
		this.position = new THREE.Vector3();
		this.value = this.baseValue = new Complex(0, 0, 0, 0);
	}
	
	this.updateObjectPosition();
	rsCanvas.sphere.add(this.object);
}

PointMarker.SIZE = 1;
PointMarker.COLOR = 0x339933;
PointMarker.WF_COLOR = 0x003300;

PointMarker.SELECTED_POINT_COLOR = 0xbb3333;
PointMarker.SELECTED_POINT_WF_COLOR = 0x330000;

PointMarker.prototype = {
		constructor: PointMarker,
		position: new THREE.Vector3(),
		spherePosition: new THREE.Vector3(),
		
		value: new Complex(),
		updatePosition: function () {
			this.moveTo(CU.complexToLocalNormalized(this.value, this.canvas.currentTransform));
		},
		/**
		 * Set new position, updating a value according to currentTransform
		 * @param pos
		 */
		setPosition: function(pos) {
			var c = CU.localToComplex(pos, this.canvas.currentTransform);
			this.setValue(c);
		},
		/**
		 * Set new position without changing value
		 * @param pos
		 */
		moveTo: function (pos) {
			this.position.copy(pos);
			this.position.normalize();
			this.spherePosition.copy(this.position).multiplyScalar(RSCanvas.SPHERE_RADIUS); 
			if (!this.hidden) this.updateObjectPosition();

			this.updateBaseValue();
		},
		updateBaseValue: function () {
			this.baseValue = CU.localToComplex(this.position);
			var oppos = this.position.clone().negate();
			this.oppositeBaseValue = CU.localToComplex(oppos);
			this.oppositeValue = this.canvas.currentTransform.apply(this.oppositeBaseValue);
		},
		/**
		 * set new value updating position and base value according to currentTransform
		 * @param val
		 */
		setValue: function (val) {
			this.value = val;
			this.updatePosition();
		},
		hide: function() {
			this.object.position = new THREE.Vector3(0,0,0);
			this.hidden = true;
		},
		show: function() {
			this.hidden = false;
			
		},
		updateObjectPosition: function () {
			//console.log(this.numInArray, "updateObjectPosition", this.position);
			var v = this.position.clone().normalize();
			var phi = Math.acos(v.y);
			var a = new THREE.Vector3(v.z, 0, -v.x);
			a.normalize();
			this.object.quaternion.setFromAxisAngle(a, phi);
			this.object.position = v.multiplyScalar(RSCanvas.SPHERE_RADIUS + PointMarker.SIZE);
			
		}
};
