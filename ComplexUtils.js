//Needs Three.js and Complex.js

var PROJECTION_SPHERE_RADIUS = 0.5;

var CU = {
		projectToSphere: function (c, transform) {
			if (transform) c = transform.invert().apply(c);
			if (c == Complex["infinity"])
				return {phi: 0, theta: Math.PI/2};
			return {phi: c.t, 
				theta: 2*Math.atan(0.5*c.r/PROJECTION_SPHERE_RADIUS)-Math.PI/2};
		},
		complexToLocalNormalized: function (c, transform) {
			return RSCanvas.PointConverter.sphericalToLocalNormalized(CU.projectToSphere(c, transform));
		},
		localToComplex: function (pos, transform) {
			
			return CU.sphercicalToComplex(RSCanvas.PointConverter.localToSpherical(pos), transform); 
		},
		sphercicalToComplex: function (sph, transform) {
			
			var c = Complex.Polar(
					2*PROJECTION_SPHERE_RADIUS*Math.tan(0.5*(sph.theta + Math.PI*.5)), 
					sph.phi);
			if (transform) c = transform.apply(c);
			return c;
		},
		complexToTexture: function (c, transform) {
			var uv = sphericalToUV(CU.projectToSphere(c, transform));
			return new THREE.Vector2(
					2*textureSize*uv.u, 
					textureSize*uv.v);
		}

};

Complex.prototype.projectToSphere = function() {return CU.projectToSphere(this);};
Complex.prototype.toLocalNormalized = function () {return CU.complexToLocalNormalized(this);};
Complex.prototype.toTexture = function () {return CU.complexToTexture(this);};
Complex.prototype.equals = function (z) {
	return (Math.abs(this.re - z.re) < Complex.epsilon && Math.abs(this.i - z.i) < Complex.epsilon);
}

Complex.epsilon = 1e-13;


var ComplexShaderMap = function (code, polar, uniforms, methods) {
	this.code = code;
	this.polar = polar ? true : false;
	this.uniforms = uniforms ? uniforms : {};
	this.uniformsDeclaration = uniforms ? getUniformsDeclaration(uniforms) : "";
	this.methods = methods ? methods : "";
	//makes a GLSL string declaring variables given in argument
	
	function getUniformsDeclaration(uniforms) {
		var res = "";
		for (var name in uniforms) {
			res += (uniforms[name].constant ? "const " : "uniform ") + ComplexShaderMap.uniformsTypesMap[uniforms[name].type].glsl + " " +
					name + (uniforms[name].constant ? ("= " + uniforms[name].value) : "") +
					(ComplexShaderMap.uniformsTypesMap[uniforms[name].type].array ? 
							(" [" + (ComplexShaderMap.uniformsTypesMap[uniforms[name].type].piece > 1 ? 
									(uniforms[name].value.length/ComplexShaderMap.uniformsTypesMap[uniforms[name].type].piece):
										(uniforms[name].value.length)) + "]"): "") + ";\n"; 
			if (ComplexShaderMap.uniformsTypesMap[uniforms[name].type].array) {
				res += "const int " + name + "Length = " + (ComplexShaderMap.uniformsTypesMap[uniforms[name].type].piece > 1 ? 
						(uniforms[name].value.length/ComplexShaderMap.uniformsTypesMap[uniforms[name].type].piece):
							(uniforms[name].value.length)) + ";\n";
			}
		}
		return res;
		
	};
	this.updateUniformsDeclaration = function() {
		this.uniformsDeclaration = getUniformsDeclaration(this.uniforms);
	};

};

//Correspondence between three.js shader material uniforms types and GLSL types
ComplexShaderMap.uniformsTypesMap = {
		i: {glsl: "int"},
		f: {glsl: "float"},
		v2: {glsl: "vec2"},
		v3: {glsl: "vec3"},
		v4: {glsl: "vec4"},
		m4: {glsl: "mat4"},
		c: {glsl: "vec3"},
		iv1: {glsl: "int", array: true},
		iv: {glsl: "ivec3", array: true, piece: 3},
		fv1: {glsl: "float", array: true},
		fv: {glsl: "vec3", array: true, piece: 3},
		v2v: {glsl: "vec2", array: true},
		v3v: {glsl: "vec3", array: true},
		v4v: {glsl: "vec4", array: true},
		m4v: {glsl: "mat4", array: true}
};

ComplexMatrix = function (data) {
	this.data = data;
	this.dimHeight = data.length;
	if (this.dimHeight > 0) {this.dimWidth = data[0].length;}
	else {this.dimWidth = 0;}
};

ComplexMatrix.prototype = {
		constructor: ComplexMatrix,
		
		subMatrix: function (col, row) {
			var _dimWidth = this.dimWidth;
			var _dimHeight = this.dimHeight;
			var _data = this.data;
			if (!row) row = 0;
			if (col >= _dimWidth || row >= _dimHeight) {
				console.warn("Invalid complex subMatrix dimentions " + row + ", " + col + " (" + _dimWidth + "x" + _dimHeight + ")");
			}
			var subData = [];
			for (var i = 0; i < _dimHeight; i++) {
				if (i != row) {
					var curRow = [];
					for (var j = 0; j < _dimWidth; j++)
						if (j != col) curRow.push(_data[i][j]);
					subData.push(curRow);
				}
			}
			return new ComplexMatrix(subData);
		},

		determinant: function() {
			var _dimWidth = this.dimWidth;
			var _dimHeight = this.dimHeight;
			var _data = this.data;
			if (_dimWidth != _dimHeight || _dimWidth < 1 || _dimHeight < 1) {
				console.warn("Invalid complex matrix dimentions " + _dimWidth + "x" + _dimHeight);
				return null;
			}
			if (_dimWidth == 1 && _dimHeight == 1) {
				return _data[0][0];
			}
			var res = new Complex(0, 0, 0, 0);
			var ind = -1;
			for (var i = 0; i < _dimWidth; i++) {
				ind = -ind;
				var c = ind > 0 ? this.subMatrix(i).determinant() : Complex.neg(this.subMatrix(i).determinant());
				res = res.add(c.mult(_data[0][i], true), true);
			}
			return res;

		},
		
		toString: function() {
			var s = "ComplexMatrix [";
			for (var i = 0; i < this.dimHeight; i++){
				s += "[";
				for (var j = 0; j < this.dimWidth; j++) {
					s += this.data[i][j].toString(true) + (j == this.dimWidth - 1 ? "]":", ");
				}
			}
			s += "]";
			return s;
		}

		
};

MoebiusTransform = function (a, b, c, d){
	this.a = a;
	this.b = b;
	this.c = c;
	this.d = d;
};


/**
 * A Moebius transformation in the form w = (a*z+b)/(c*z+d), given by four ComplexNumber parameters a, b, c, d.
 */
MoebiusTransform.prototype = {
		constructor: MoebiusTransform,
		apply: function(z) {
			if (z == Complex["Infinity"]) return this.infinityImage();
			return this.a.mult(z).add(this.b).divBy(this.c.mult(z).add(this.d));
		},
		infinityImage : function() {
			return this.a.divBy(this.c);
		},
		/**
		 * Returns inverted transformation. Does not change initial transformation. 
		 */
		invert: function() {
			if (!this.invertObj) 
				this.invertObj = new MoebiusTransform(
						this.d, 
						Complex.neg(this.b), 
						Complex.neg(this.c), 
						this.a);
			return this.invertObj;
		},
		/**
		 * Returns superposition of initial and given transformations. Doesn't change initial transformation.
		 */
		superpos: function(t) {
			return new MoebiusTransform (
					this.a.mult(t.a).add(this.c.mult(t.b)), 
					this.b.mult(t.a).add(this.d.mult(t.b)), 
					this.a.mult(t.c).add(this.c.mult(t.d)), 
					this.b.mult(t.c).add(this.d.mult(t.d)));
					//ComplexNumber.product(_a,tm.a).add(ComplexNumber.product(_c,tm.b)), 
					//ComplexNumber.product(_b,tm.a).add(ComplexNumber.product(_d,tm.b))
					//ComplexNumber.product(_a,tm.c).add(ComplexNumber.product(_c,tm.d)), 
					//ComplexNumber.product(_b,tm.c).add(ComplexNumber.product(_d,tm.d)));
		},
		
		scale: function (w){
			var num = this.d.mult(w).sub(this.b);
			var den = this.c.mult(w).sub(this.a);
			
			return this.determinantAbs()/(num.r*num.r + den.r*den.r);
		},
		determinant: function() {
			if (!this._determinant) {this._determinant = this.a.mult(this.d).sub(this.b.mult(this.c));}
			return this._determinant;
		},
		determinantAbs: function() {
			if (!this._determinantAbs) {
				this._determinantAbs = this.determinant().r;
			}
			return this._determinantAbs;
		},
		
		findOpposite: function(z) {
			var w = this.invert().apply(z);
			var thetaphi = CU.projectToSphere(w);
			var phi_ = thetaphi.phi < Math.PI ? thetaphi.phi + Math.PI : thetaphi.phi - Math.PI; 
			var thetaphi_ = {theta: -thetaphi.theta, phi: phi_};
			var w_ = CU.sphercicalToComplex(thetaphi_); 
			return this.apply(w_);
		},
		
		copy: function() {
			return new MoebiusTransform(this.a, this.b, this.c, this.d);
		},

		toString : function() {
			return "Moebius transformation: " +
					"a=" + this.a.toString(true) + " " +
					"b=" + this.b.toString(true) + " " +
					"c=" + this.c.toString(true) + " " +
					"d=" + this.d.toString(true);
			
			
		}
};
/**
 * Returns a Moebius transformation, projecting three points given in the first argument
 * to the corresponding points in the second.
 * z - an array of three Complex (initial points)
 * w - an array of three Complex (projections)
 */
MoebiusTransform.byInitEndVectors = function (z, w) {
	if (!z || !w || z.length < 3 || w.length < 3) {
		console.warn("Invalid moebius transform arguments " + z + " " + w);
		return null;
	}
	var identVector = [];
	for (var i = 0; i <= 3; i++) identVector.push(Complex["1"]);
	var wholeMatrixData = [];
	wholeMatrixData.push(identVector);
	for (var j = 0; j < 3; j++) {
		var row = [];
		row.push(z[j].mult( w[j]));
		row.push( z[j]); 
		row.push(w[j]);
		row.push(Complex["1"]);
		wholeMatrixData.push(row);
	}
	var M = new ComplexMatrix(wholeMatrixData);
	return new MoebiusTransform(M.subMatrix(1).determinant(),
		M.subMatrix(3).determinant(),
		M.subMatrix(0).determinant(),
		M.subMatrix(2).determinant());                 
}

Complex["Infinity"] = Complex["1"].divBy(Complex["0"]);
Complex.prototype.multiplyScalar = function (factor) {
	if (factor == 0) return Complex["0"];
	if (factor < 0)
		return Complex.Polar(-this.r*factor, this.t + Math.PI);
	
	return Complex.Polar(this.r*factor, this.t);
}

MoebiusTransform.identity = 
	new MoebiusTransform (Complex["1"], Complex["0"], Complex["0"], Complex["1"]);
MoebiusTransform.identity.apply = function(z) {	return z;};
MoebiusTransform.identity.invert = function() {return MoebiusTransform.identity;};
MoebiusTransform.identity.superpos = function (t) {return t;};
MoebiusTransform.identity.infinityImage = function() { return Complex["Infinity"];}

LinearTransform = function(a, b) {
	MoebiusTransform.call(this, a, b, Complex["0"], Complex["1"]);
};
LinearTransform.prototype = Object.create(MoebiusTransform.prototype);
var LTp = LinearTransform.prototype;
LTp.constructor = LinearTransform;
LTp.apply = function (z) {return z.mult(this.a).add(this.b);};
LTp.infinityImage = function() {return Complex["infinity"]};
LTp.invert = function() {
	return new LinearTransform(Complex["1"].divBy(this.a), Complex.neg(this.b.divBy(this.a)));
};

//----------------------Test functions--------------------------------------
function getComplexValueByName (name) {
	var inputControlName = "test-transform-" + name;
	var re = Number(document.getElementById(inputControlName+"-re").value);
	var im = Number(document.getElementById(inputControlName+"-im").value);
	return new Complex(re, im);
};

function testTransform() {
	var t = new MoebiusTransform(getComplexValueByName("a"),
			getComplexValueByName("b"),
			getComplexValueByName("c"),
			getComplexValueByName("d"));
	currentTransform = t;
	transformUpdated = true;
	updateTextUI("abcd");

};

function setValueByName(name, z) {
	var inputControlName = "test-transform-" + name;
	document.getElementById(inputControlName+"-re").value = Math.round(z.re / Complex.epsilon)*Complex.epsilon;
	document.getElementById(inputControlName+"-im").value = Math.round(z.i/ Complex.epsilon)*Complex.epsilon;
}

function makeTransform() {
	var t = MoebiusTransform.byInitEndVectors([getComplexValueByName("z1"),
	                                           getComplexValueByName("z2"),
	                                           getComplexValueByName("z3")],
			[getComplexValueByName("w1"),
			 getComplexValueByName("w2"),
			 getComplexValueByName("w3")]);
	
	currentTransform = t;
	transformUpdated = true;
	updateTextUI("3p");

}

function updateTextUI() {
	var t = currentTransform;
	setValueByName("a", t.a);
	setValueByName("b", t.b);
	setValueByName("c", t.c);
	setValueByName("d", t.d);
	setValueByName("w1", t.apply(getComplexValueByName("z1")));
	setValueByName("w2", t.apply(getComplexValueByName("z2")));
	setValueByName("w3", t.apply(getComplexValueByName("z3")));
	var z = getComplexValueByName("z");
	var w = t.apply(z);
	document.getElementById("test-transform-w").innerHTML = w.toString(true);


	
}



