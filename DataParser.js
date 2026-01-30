var r=[], g=[], b=[];
function parseJuliaData(data) {
	var res = {};
	var index = -1;
	var line = [];
	var functionParsed = false;
	var cyclesParsed = false;
	var imageParsed = false;
	while ((!functionParsed || !cyclesParsed || !imageParsed) 
			&& (++index) < data.length) {
		line = data[index].split(" ");
		if (line[0] == "FUNCTION") {
			parseFunctions(line, res);
			functionParsed = true;
		}
		if (line[0] == "CYCLES") {
			parseCycles(line, res);
			cyclesParsed = true;
		}
		if (line[0] == "IMAGE") {
			parseImage(line, res);
			imageParsed = true;
		}
	}
	if (!functionParsed) console.warn("No FUNCTION entry");
	if (!cyclesParsed) console.warn("No CYCLES entry");
	if (!imageParsed) console.warn("No IMAGE entry");
	
	console.log("Julia data parsed", res);
	//-----------------
    r[0] = 0; g[0] = 0; b[0] = 0;
    r[1] = 255; g[1] = 255; b[1] = 255;

    r[2] = 192; g[2] = 255; b[2] = 255;
    r[3] = 255; g[3] = 192; b[3] = 255;
    r[4] = 255; g[4] = 255; b[4] = 192;

    r[5] = 192; g[5] = 192; b[5] = 255;
    r[6] = 192; g[6] = 255; b[6] = 192;
    r[7] = 255; g[7] = 192; b[7] = 192;

    r[8] = 192; g[8] = 192; b[8] = 192;

    r[9] = 224; g[9] = 255; b[9] = 255;
    r[10] = 255; g[10] = 224; b[10] = 255;
    r[11] = 255; g[11] = 255; b[11] = 224;

    r[12] = 224; g[12] = 224; b[12] = 255;
    r[13] = 224; g[13] = 255; b[13] = 224;
    r[14] = 255; g[14] = 255; b[14] = 224;

    r[15] = 224; g[15] = 224; b[15] = 224;
    
    for (var i = 0; i < r.length; i++) {
    	r[i] /= 255.;
    	g[i] /= 255.;
    	b[i] /= 255.;
    }
    
    return res;
}

function parseFunctions (line, res) {
	res.degree = (line.length-1)/4-1;
	res.num = [];
	res.den = [];
	res.dnum = [];
	res.dden = [];
	res.mund = [];
	res.nedd = [];

	for (var i = 0; i <= res.degree; i++) {
	    res.num.push(new THREE.Vector2(parseFloat(line[1+2*i]),parseFloat(line[1+2*i+1])));
	    res.den.push(new THREE.Vector2(parseFloat(line[1+2*(res.degree+1)+2*i]),parseFloat(line[1+2*(res.degree+1)+2*i+1])));
	}
	console.log (res.degree, res.num, res.den);
	//?????
	var v0 = new THREE.Vector2();
	res.mund.push(v0);
	res.nedd.push(v0);
	for (var i = 0; i < res.degree; i++) {
	    res.dnum.push(res.num[i+1].clone().multiplyScalar(i+1));
	    res.dden.push(res.den[i+1].clone().multiplyScalar(i+1));
	    res.mund.push(res.num[i].clone().multiplyScalar(i-res.degree));
	    res.nedd.push(res.den[i].clone().multiplyScalar(i-res.degree));
	}
	res.dnum.push(v0);
	res.dden.push(v0);
}
function parseCycles(line, res) {
	res.cyclelen = (line.length-1)/4;
	res.cycle = [];
	res.cyclenext = [];
	res.cycleperiod = [];
	for (var i = 0; i < res.cyclelen; i++) {
	    if (line[1+4*i ] == "Infinity")
//	    	res.cycle.push(Complex["Infinity"]);
    	res.cycle.push(new THREE.Vector2(1.01e10, 1.01e10));
	    else
	    	res.cycle.push(new THREE.Vector2(
	    			parseFloat(line[1+4*i]),
	    			parseFloat(line[1+4*i+1])));
	    res.cyclenext.push(parseInt(line[1+4*i+2]));
	    res.cycleperiod.push(parseInt(line[1+4*i+3]));
	}

}
function parseImage(line, res) {
	res.dz0 = 4./parseFloat(line[1]);
	res.maxiter = parseInt(line[2]);
}
