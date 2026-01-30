//----------------------hv test ----------------------------------
var MandelbrotJuliaIterationsNumber = 400;
var MandelbrotJuliaUniforms = {
		Iterations: {type: "i", value: MandelbrotJuliaIterationsNumber, constant: true},
		//seed: {type: "v2", value: new THREE.Vector2(0.28693186889504513, 0.014286693904085048)}
		seed: {type: "v2", value: new THREE.Vector2(-0.75, -0.1)}
		
};

var MandelbrotJuliaMethods = [	
"// Color parameters",
"float R = 0.0;",
"float G = 0.43;",
"float B = 1.;",
"",
"vec2 complexMul(vec2 a, vec2 b) {",
"	return vec2( a.x*b.x -  a.y*b.y,a.x*b.y + a.y * b.x);",
"}",
"vec3 color(vec2 c, bool Julia, vec2 JuliaC, float falloff, float scale) {",
"	vec2 z = Julia ?  c : vec2(0.0,0.0);",
"	vec2 add =  (Julia ? JuliaC : c);",
"	int j = Iterations;",
"	for (int i = 0; i <= Iterations; i++) {",
"		if (dot(z,z)> 1000.0) { break; }",
"		z = complexMul(z,z) + add;",
"		j = i; ",
"	}",
"	",
"	if (j < Iterations) {",
"		// The color scheme here is based on one",
"		// from the Mandelbrot in Inigo Quilez's Shader Toy:",
"		float co = float( j) + 1.0 - log2(.5*log2(dot(z,z)));",
"		co = sqrt(max(0.,co)/256.0);",
"		return falloff*vec3( .5+.5*cos(6.2831*co+R),.5+.5*cos(6.2831*co + G),.5+.5*cos(6.2831*co +B) );",
"	}  else {",
"		// Inside ",
"		return vec3(0.05,0.01,0.02);",
"	}",
"}"
].join("\n");

var MandelbrotJuliaCode = [
	"vec3 v = vec3(0.0);",
	"v = color(c, true, seed, 1.0, scale);",
	//"v = color(c, true, vec2(0.28693186889504513, 0.014286693904085048), 1.0, scale);",
	"r = pow(v.x, 1./2.2);",
	"g = pow(v.y, 1./2.2);",
	"b = pow(v.z, 1./2.2);"
].join("\n");
//var MandelbrotJuliaMap = new ComplexShaderMap(MandelbrotJuliaCode, false, MandelbrotJuliaUniforms, MandelbrotJuliaMethods);
