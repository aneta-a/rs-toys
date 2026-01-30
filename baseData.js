var starColorMapData = [
                        {part: 0, value: 0x222222},
                        {part: 0.1, value: 0x332222},
                        {part: 0.15, value: 0x992222},
                        {part: 0.2, value: 0xcc3322},
                        {part: 0.25, value: 0xee9922},
                        {part: 0.3, value: 0xeecc33},
                        {part: 0.4, value: 0xeeee99},
                        {part: 0.5, value: 0xeeeeee},
                        {part: 0.6, value: 0x99eeee},
                        {part: 0.8, value: 0x6699ee},
                        {part: 1.0, value: 0x3366ee}
                        ];
function colorToVector (c) {
	return new THREE.Vector3(c.r, c.g, c.b);
}

function getHomoColorMap (data, length) {
	var res = [];
	var max = data[data.length - 1].part;
	var min = data[0].part;
	var colors = [];
	for (var c = 0; c < data.length; c++)
		colors.push(colorToVector(new THREE.Color(data[c].value)));
	console.log("colors", colors);
	for (var i = 0; i < length; i++ ){
		var part = min + (i / (length - 1))*(max - min);
		for (var j = 0; j < data.length - 1; j++) {
			if (data[j].part <= part && data[j+1].part > part){
				res.push(colors[j].clone().lerp(colors[j+1], (part - data[j].part)/(data[j+1].part - data[j].part)));
				break;
			}
		}
	}
	while (res.length < length) res.push(colors[colors.length - 1]);
	return res;
}

var signCode = [   		"r = c.x > 0.0 ? 0.8 : 0.2;",
                       		"g = c.y > 0.0 ? 0.8 : 0.2;",
                       		"b = 0.2;"
].join("\n");
//var signMap = new ComplexShaderMap(signCode);
var curColorMap = getHomoColorMap(starColorMapData, 20);//colorStepsNum);
//console.log("colorMap", curColorMap);
var absValueUniforms = {
		maxValue: {type: "f", value: 5.0}, 
		colorMap: {type: "v3v", value: curColorMap}//,
		//colorMapLength: {type: "i", value: colorStepsNum}
}
var absValueCode = [
                    //"float valuePart = c.x > maxValue ? 1.0 : c.x/maxValue;",
                    "float valuePart = scale > maxValue ? 1.0 : scale/maxValue;",
                    "float l=float(colorMapLength); ",
                    "float f=floor(l*valuePart);",
                    "int n = int(f);",
                    "vec3 cvec = colorMap[colorMapLength - 1];",
                    "for (int ij = 0; ij < colorMapLength; ij++){",
                    "if (ij == n){", 
                    "cvec = mix(colorMap[ij], colorMap[ij+1], l*valuePart - f);",
                    "};",
                    "};",
                    "b = cvec.z;",
                    "g = cvec.y;",
                    "r = cvec.x;"
                    ].join("\n");
var absValueMap = new ComplexShaderMap (absValueCode, true, absValueUniforms);
var chessBoardUniforms = { colors: {type: "v3v", value: 
	[colorToVector(new THREE.Color(0xcccc00)), colorToVector(new THREE.Color(0x3399cc))]},
		evenColor: {type: "c", value: new THREE.Color(0xcccc00)},
		oddColor: {type: "c", value: new THREE.Color(0x3399cc)}
};
var chessBoardCode = [
                      "float sum = floor(c.x) + floor(c.y);",
                      "float md = mod(sum, 2.0);",
                      "r = md == 0.0 ? colors[0].x : colors[1].x;",
                      "g = md == 0.0 ? colors[0].y : colors[1].y;",
                      "b = md == 0.0 ? colors[0].z : colors[1].z;"
                      ].join("\n");
var chessBoardMap = new ComplexShaderMap(chessBoardCode, false, chessBoardUniforms);

var valueMethods = [	
	"vec3 complex2rgb(vec2 z){",
	"	float l = length(z);",
	"	float phi = atan(z.y, z.x);",
	"   vec3 c = vec3(phi < 0. ? phi/6.283185307 + 1. : phi/6.283185307,clamp(l, 0.0, 1.0), clamp(1./l, 0.0, 1.0));",
	 "   vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);",
	  "  vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);",
	   " return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);",
	"}",
].join("\n");
var valueCode = ["vec2 z = c;",
                 "vec3 rgb = complex2rgb(z);",
                 "r = rgb.x;",
                 "g = rgb.y;",
                 "b = rgb.z;"].join("\n");
var valueMap = new ComplexShaderMap(valueCode, false, {}, valueMethods);
