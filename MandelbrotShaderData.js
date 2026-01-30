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
function colorToVector (c) {
	return new THREE.Vector3(c.r, c.g, c.b);
}

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

var mandelbrotIterationsNumber = 300;
var mandelbrotBound = 100.0;
var mandelbrotColorMap = getHomoColorMap(starColorMapData, mandelbrotIterationsNumber);
var mandelbrotUniforms = {
		bound: {type: "f", value: mandelbrotBound},
		colorMap: {type: "v3v", value: mandelbrotColorMap}
		
};
var mandelbrotCode = [
                      "vec3 cvec=colorMap[colorMapLength-1];",
                      "float rho2=c.x*c.x + c.y*c.y;",
                      "if (rho2 < bound) {",
                      	"int iter = colorMapLength;",
                      	"vec2 cIter = c;",
                      	"cvec = colorMap[0];",
                      	"bool runaway = false;",
                      	"for (int i = 0; i < colorMapLength; i++) {",
                      	"if (!runaway) {",
                      		"cIter = vec2(cIter.x*cIter.x - cIter.y*cIter.y + c.x, 2.0*cIter.x*cIter.y + c.y);",
                      		"if (cIter.x*cIter.x + cIter.y*cIter.y > bound) {",
                      			"iter = i;",
                      			"cvec = colorMap[colorMapLength - i -1];",
                      			"runaway = true;",
                      		"};",
                      	"};",
                      	"};",
                      	
                      "};",
                      
                      "b = cvec.z;",
                      "g = cvec.y;",
                      "r = cvec.x;"

                      ].join("\n");
