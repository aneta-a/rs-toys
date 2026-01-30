var juliaData13 = [
"FUNCTION 0. 0. 0. 0. 0. 0. 0. 0. 0.30789240450753436 6.0152917044142162 -20.475816711813557 -25.925324552303728 78.24741584661507 27.909526223768339 -129.58974592903056 20.784538562962315 118.37323665219498 -86.830785207675902 -53.955794245378087 106.59656614547917 0.26300742130383992 -70.622950700033059 13.505019079222286 26.413784845555799 -6.675214517621491 -4.340647022167162 1.0 0.0 1. 0. -6.3247854823785072 4.340647022167162 11.402444867764377 -25.673979420450138 5.7459408702694716 66.554020861951884 -61.788972147334505 -95.801827521643531 123.82079903668222 69.914923303584487 -129.31774095487197 -4.4733621643695773 74.474991285622195 -37.057431164250289 -17.704785071245755 28.212300787424216 -0.30789240450753352 -6.0152917044142153 0. 0. 0. 0. 0. -0. 0. 0.",
"CYCLES 0. 0. 0 1 Infinity any 1 1 1 0 2 1",
"IMAGE 1000 6",
"POINTS 3",
"0 0 1 2.0 0+0i",
"0 0 -1 2.0 infty",
"1 0 0 2.0 1+0i",
"ARCS 0"];
var juliaData13_ = [
"FUNCTION 0. 0. 0. 0. -48.238523396263687 -89.683334081191859 -282.82502815993655 788.08808787695557 2762.7675707508233 -1433.0927619313384 -6759.4134500560585 -1372.2000763056258 6809.7662668555486 7299.0240229205565 -1727.1700096578707 -9615.3483664488758 -2348.6147359544166 6019.348705054188 2339.7994534347426 -1652.8345192378067 -882.02262910962827 -59.656838283206994 133.81347680297776 143.83786504922526 2.1376084900817034 -27.48278461287526 -2.0189609510572804 1.0859508745015549 -2.0189609510571835 1.085950874501586 24.108883873663515 13.365423244354005 -46.252698894775662 -190.93471617537116 -436.40997222604642 768.81024496107636 2668.7987450649603 -1041.1708258578915 -6316.9126161518152 -1358.3685107075376 7070.639477170289 6741.2237638510724 -2336.3751134774893 -9705.1542813854139 -2580.987940879274 6396.178897376727 2718.6014976430879 -1515.2047423718807 -813.44878551887837 -198.42858701634913 48.238523396280442 89.683334081211541 0. 0. 0. 0.",
"CYCLES 0. 0. 0 1 1. 0. 1 1 Infinity any 2 1",
"IMAGE 1000 5"];

var juliaData3 = [
"FUNCTION 1.0 0.0 0.0 0.0 0.0 0.0 2.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 3.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0",
"CYCLES 1.0 0.0 0 1 -0.5 0.866025404 1 1 -0.5 -0.866025404 2 1",
"IMAGE 1000 200"
                 	];
var juliaData4 = [
"FUNCTION 1.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 3.0 0.0 0.0 0.0 0.0 0.0 0.0 0.0 4.0 0.0 0.0 0.0",
"CYCLES 1.0 0.0 0 1 0.0 1.0 1 1 -1.0 0.0 2 1 0.0 -1.0 3 1",
"IMAGE 1000 50"
                 	];
var MandelData1 = [
"FUNCTION -1.0 0.0 0.0 0.0 1.0 0.0 1.0 0.0 0.0 0.0 0.0 0.0",
"CYCLES 1.0 0.0 0 1 ",
"IMAGE 1000 1"
                 	];
var MandelDatai = [
"FUNCTION 0.0 1.0 0.0 0.0 1.0 0.0 1.0 0.0 0.0 0.0 0.0 0.0",
"CYCLES 1.0 0.0 0 1 ",
"IMAGE 1000 1"
                 	];

function vectorToComplex(v) {
	return new Complex(v.x, v.y);
}
function complexToVector(c) {
	return new THREE.Vector2(c.re, c.i);
}
function roundTo(x, par) {
	if (par) return Math.round(x/par)*par;
	return Math.round(x);
}

function evalPoly(func, arg) {
	var power = func.length - 1;
	var res = vectorToComplex(func[power]);
	console.log("evalPoly", func, arg.toString(true));
	for (var k = power -1; k >=0; k--) {
		res = res.mult(arg).add(vectorToComplex(func[k]));
	}
	return res;
}
function testEval(funcObj, arg, iterations) {
	var maxIter = iterations || 1;
	var res = {};
	res.dz = 1;
	var newArg = arg;
	for (var i = 0; i < maxIter; i++) {
		res.n = evalPoly(funcObj.num, newArg);
		res.d = evalPoly(funcObj.den, newArg);
		res.dn = evalPoly(funcObj.dnum, newArg);
		res.dd = evalPoly(funcObj.dden, newArg);
		res.dz *= res.dn.mult(res.d).sub(res.dd.mult(res.n)).r/(res.dn.r*res.dn.r+res.dd.r*res.dd.r);
		
		newArg = res.n.divBy(res.d);
		console.log("testEval", res);
	}
	res.res = newArg;
	return res;
}

function getOutputDomElement(dataObject, node) {
	var res;
	res = node || document.createElement("div");
	res.innerHTML = "f(z) = (";
	getPolyString("z", dataObject.num, res);
	res.innerHTML += ") / (";
	getPolyString("z", dataObject.den, res);
	res.innerHTML += ")";
	return res;
}
function getZPowerHTML(argName, power, node) {
	var resHTML = power == 0 ? "" : (argName + (power == 1 ? "" : ("<sup>") + power + "</sup>"));
	node.innerHTML += resHTML;
	console.log("geZPowerHTML", power, argName, node,resHTML);
}
function getPolyString(argName, coefs, node) {
	var power = coefs.length - 1;
	var firstFound = false;
	for (var i = power; i >= 0; i--) {
		var a = vectorToComplex(coefs[i]);
		if (a.r > Complex.epsilon) {
			node.innerHTML += (firstFound ? " + " : "") + "(" + a.toString(true) + ")";
			getZPowerHTML(argName, i, node);
			firstFound = true;
		}
	}	
}


function makeNewtonDataStructure(roots) {
	var funcs = [];
	var newCoefs = [];
	var N = roots.length;
	funcs[0]= Complex["1"];
	console.log(roots);
	for (var l = 0; l < N; l++) {
		for (var k = 0; k <= l; k++) {
			newCoefs[k] = Complex.neg(roots[l]).mult(funcs[k]).add(k == 0 ? Complex["0"]:funcs[k-1]); 
		}
		newCoefs[l+1] = Complex["1"];
		console.log(l, newCoefs, funcs[0]);
		for (var j = 0; j <= l+1; j++) {
			funcs[j] = newCoefs[j];
		}
	}
	console.log(funcs);
	var den = [];
	var num = [];
	for (var i = 0; i < N; i++) {
		num[i] = funcs[i].multiplyScalar(i-1);
		den[i] = funcs[i+1].multiplyScalar(i+1);
	}
	den[N] = Complex["0"];
	num[N] = funcs[N].multiplyScalar(N-1);
	var res = [];
	res[0] = "FUNCTION";
	for (var m = 0; m <= N; m++) {
		res[0] += " " + roundTo(num[m].re, 1e-14).toString();
		res[0] += " " + roundTo(num[m].i, 1e-14).toString();
	}
	for (var o = 0; o <= N; o++) {
		res[0] += " " + roundTo(den[o].re, 1e-14).toString();
		res[0] += " " + roundTo(den[o].i, 1e-14).toString();
	}
	res[1] = "CYCLES";
	for (var p = 0; p < N; p++) {
		res[1] += " " + roots[p].re.toString() + " " + roots[p].i.toString();
		res[1] += " " + p + " 1";
	}
	res[2] = "IMAGE 1024 200";
	return res;
	
}

function getSymmetricRoots(n) {
	var roots = [];
	for (var i = 0; i < n; i++) {
		roots.push(Complex.Polar(1., 2.*Math.PI*i/n));
	}
	return roots;
}

function makeSymmetricNewtonDataStructure(n) {
	return makeNewtonDataStructure(getSymmetricRoots(n));
}

/** /function getEvalPolyLoopNums(varName, resName, coefs) {
var l = coefs.length - 1;
var res = resName + " = vec2(float(" + coefs[l].x + "), float(" + coefs[l].y + "));\n";
for (var i = l - 1; i >=0; i--) {
	res += resName + " = complexMul(" + varName + "," + resName + ") +" +
			" vec2(float(" + coefs[i].x + ") ,float(" + coefs[i].y + "));\n";
}
return res;
}/**/
/** /function getEvalPolyLoopNums(varName, resName, coefs) {
	var l = coefs.length - 1;
	var res = resName + " = vec2(" + getFloatString(coefs[l].x) + ", " + getFloatString(coefs[l].y) + ");\n";
	for (var i = l - 1; i >=0; i--) {
		res += resName + " = complexMul(" + varName + "," + resName + ") +" +
				" vec2(" + getFloatString(coefs[i].x) + " ," + getFloatString(coefs[i].y) + ");\n";
	}
	return res;
	}/**/

/**/function getEvalPolyLoopNums(varName, resName, coefs) {
	var l = coefs.length - 1;
	var res = resName + " = ";//vec2(" + getFloatString(coefs[l].x) + ", " + getFloatString(coefs[l].y) + ");\n";
	for (var i = 0; i <l; i++) {
		res +=  "vec2(" + getFloatString(coefs[i].x) + ", " + getFloatString(coefs[i].y) + ") + complexMul(";
				
	}
	res += " vec2(" + getFloatString(coefs[l].x) + " ," + getFloatString(coefs[l].y) + ")";
	for (var j = 0; j < l; j++)
		res += "," + varName + ")";
	res += ";\n";
	return res;
	}/**/

/**/function getEvalPolyLoopInverseNums(varName, resName, coefs) {
	var l = coefs.length - 1;
	var res = resName + " = ";//vec2(" + getFloatString(coefs[l].x) + ", " + getFloatString(coefs[l].y) + ");\n";
	for (var i = l; i >0; i--) {
		res +=  "vec2(" + getFloatString(coefs[i].x) + ", " + getFloatString(coefs[i].y) + ") + complexMul(";
				
	}
	res += " vec2(" + getFloatString(coefs[0].x) + " ," + getFloatString(coefs[0].y) + ")";
	for (var j = 0; j < l; j++)
		res += "," + varName + ")";
	res += ";\n";
	return res;
	}/**/

/** /function getEvalPolyLoopInverseNums(varName, resName, coefs) {
	var res = resName + " = vec2(" + getFloatString(coefs[0].x) + "," + getFloatString(coefs[0].y) + ");\n";
	for (var i = 1; i < coefs.length; i++) {
		res += resName + " = complexMul(" + varName + "," + resName + ") + vec2(" + getFloatString(coefs[i].x) + "," + getFloatString(coefs[i].y) + ");\n";
	}
	return res;
}/**/

function getCheckCycleLoopStringNums(varName, cycle) {
	var res = "";
	for (var i = 0; i < cycle.length; i++) {
		//if (cycle[i].x > 1e35||cycle[i].y > 1e35)
		//res += "else if (spheredist(" + varName + ",vec2(float(" + cycle[i].x + "),float("+ cycle[i].y + "))) < .001) {\n" +
		res += "else if (distance(" + varName + ",vec2(" + getFloatString(cycle[i].x) + ","+ getFloatString(cycle[i].y) + ")) < .001) {\n" +
				"j = " + (i + 1)*50 +"\n;" +
						"break;\n}\n";
	}
	return res;
}
function getFloatString(n) {
	var s = n.toString();
	if (s.indexOf(".") == -1 && s.indexOf("e") == -1)
		s += ".0";
	return s;
}

function initJuliaMap(dataStructure, checkTriggers, branchInverseArg, checkCyclesArg) {
	var checkJulia = typeof(checkTriggers) == Boolean ? checkTriggers : (checkTriggers.checkJulia === undefined ? false : checkTriggers.checkJulia);
	var branchInverse = (branchInverseArg === undefined ? (checkTriggers.branchInverse === undefined ? false : checkTriggers.branchInverse): branchInverseArg);
	var checkCycles = (checkCyclesArg === undefined ? (checkTriggers.checkCycles === undefined ? false : checkTriggers.checkCycles): checkCyclesArg);
	var jData = parseJuliaData(dataStructure);
	var juliatestUniforms = {
			Iterations: {type: "i", value: jData.maxiter, constant: true},
			actualInfinity: {type: "f", value: jData.actualInfinity || 1e38, constant: true}
			
	};
	
	var juliatestMethods = [	
	"// Color parameters",
	"vec3 complex2rgb(vec2 z){",
	"	float l = length(z);",
	"	float phi = atan(z.y, z.x);",
	"   vec3 c = vec3(phi < 0. ? phi/6.283185307 + 1. : phi/6.283185307,clamp(l, 0.0, 1.0), clamp(1./l, 0.0, 1.0));",
	 "   vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
	  "  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
	   " return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
	"}",
	"bool isInf(vec2 v) {",
	"	return v.x > actualInfinity || v.x < -actualInfinity || v.y > actualInfinity || v.y < -actualInfinity;",
	"}",
	"vec2 complexMul(vec2 a, vec2 b) {",
	"	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);",
	"}",
	"vec2 complexDiv(vec2 a, vec2 b) {",
	"	return vec2( a.x*b.x +  a.y*b.y,-a.x*b.y + a.y * b.x)/dot(b,b);",
	"}",
	"float spheredist(vec2 w1, vec2 w2) {",
	//"	if (isInf(w1) && isInf(w2)) {return 0.0;}",/**/
	//"	/*else */if (isInf(w1)) {return 2.0/sqrt(1.+dot(w2,w2));}",
	//"	else if (isInf(w2)){return 2.0/sqrt(1.+dot(w1, w1));}",
	//"	else {return 2.*distance(w1, w2)/sqrt((1.+dot(w1,w1))*(1.+dot(w2, w2)));}",/**/
	/**/"	return 2.*distance(w1, w2)/sqrt((1.+dot(w1,w1))*(1.+dot(w2, w2)));",/**/
	"}",
	"vec3 color(vec2 c, float scale) {",
	"	vec2 z = c;",
	"    vec2 z2 = complexMul(z, z);",
	"    vec2 n, d, dn, dd;",
	" float absz2;",
	"     float dz=0.002/scale;",
	"	int j = 1;",
	"	for (int i = 0; i <= Iterations; i++) {",
	"absz2 = dot(z,z);",
	//"if (absz2 > actualInfinity) {return vec3(0.0);}",
	branchInverse ? "if (absz2 < 1.) {":"",
	getEvalPolyLoopNums("z", "n", jData.num),
	getEvalPolyLoopNums("z", "d", jData.den),
	checkJulia ?  
	(getEvalPolyLoopNums("z", "dn", jData.dnum) +
	getEvalPolyLoopNums("z", "dd", jData.dden) +
	"         dz*=(1.+absz2)*distance(complexMul(dn,d),complexMul(dd,n));" ) : "",
	branchInverse ? ["}",
	"else {",
	"vec2 iz = vec2(z.x, -z.y)/absz2;",
	getEvalPolyLoopInverseNums("iz", "n", jData.num),
	getEvalPolyLoopInverseNums("iz", "d", jData.den),
	checkJulia ? (getEvalPolyLoopInverseNums("iz", "dn", jData.mund) +
	getEvalPolyLoopInverseNums("iz", "dd", jData.nedd) +
	"         dz*=(1.+1./absz2)*distance(complexMul(dn,d),complexMul(dd,n));" ) : "",
	"}"].join("\n"):"",
	checkJulia ? "		dz /= (dot(d,d)+dot(n,n));" : "",
	"		z = complexDiv(n, d);",
	"		j = i; ",
	checkJulia ? ("		if (dz> spheredist(z,c)) { \n" +
	"j= 0;\n" +
	"return vec3 (.8); \n }" ) : "",
	//"break; }",
	checkCycles ? getCheckCycleLoopStringNums("z", jData.cycle) : "",
	"	}",
	"       return complex2rgb(z);",

	"	",
	//"	if (j < Iterations) {",
	//"       return complex2rgb(z);",
	//"	}  else {",
	//"		// Inside ",
	//"		return vec3(0.4);",
	//"		//return vec3(1.0,0.01,0.02);",
	//"	}",
	"}"
	].join("\n");
	
	var juliatestCode = [
	 	              	"vec3 v = vec3(0.0,0.0,0.0);",
	 	              	"v = color(c, scale);",
	 	              	"r = v.x;",
	 	              	"g = v.y;",
	 	              	"b = v.z;"
	 	              ].join("\n");
	 
	return new ComplexShaderMap(juliatestCode, false, juliatestUniforms, juliatestMethods);

}
