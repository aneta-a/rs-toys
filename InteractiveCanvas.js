
var InteractiveCanvas = function (domElement, surfaceData) {
	
	var that = this;

	this.changeShowGrid = function (event) {
		that.rsCanvas.showGridChanged = true;
		that.rsCanvas.showGrid = showGrid.checked;
	};
	this.saveDrawing = function (event) {
		console.log("saveDrawing", "todo");
		};
	this.clearDrawing = function (event) {
		that.rsCanvas.clearDrawing();
	};
	this.resetTransform = function (event) {
		that.rsCanvas.resetTransform();
	};
	this.removeAnchors = function (event) {
		that.rsCanvas.hideAnchors();
	};
	
	var autoId = 0;
	
	
	
	var tbl = document.createElement("table");
	domElement.appendChild(tbl);

	var canvasCell = document.createElement("td");
	tbl.appendChild(document.createElement("tr").appendChild(canvasCell));
	canvasCell.setAttribute("width", "512");
	canvasCell.setAttribute("colspan", "3");

	var mainCanvas = document.createElement("canvas");
	mainCanvas.setAttribute("width", "500");
	mainCanvas.setAttribute("height", "500");
	canvasCell.appendChild(mainCanvas);

	
	var controlsRow = document.createElement("tr");
	tbl.appendChild(controlsRow);
	var td1 = document.createElement("td");
	td1.setAttribute("width", "150");
	var showGrid = addInput(td1, "checkbox", "Show grid", "change", this.changeShowGrid);
	if (InteractiveCanvas.showGridOnStart)
		showGrid.setAttribute("checked", "checked");
	var td2 = document.createElement("td");
	addButton(td2, "Save drawing", this.saveDrawing);
	addButton(td2, "Clear drawing", this.clearDrawing);
	var td3 = document.createElement("td");
	addButton(td3, "Reset transformation", this.resetTransform);
	addButton(td3, "Clear reference points", this.removeAnchors);
	controlsRow.appendChild(td1);
	controlsRow.appendChild(td2);
	controlsRow.appendChild(td3);
	
	this.rsCanvas = new RSCanvas(mainCanvas, surfaceData);
	this.rsCanvas.showGrid = showGrid.checked;
	this.rsCanvas.showGridChanged = true;
	
	
	function addInput(domElement, type, text, event, handler, idarg) {
		var res = document.createElement("input");
		res.setAttribute("type", type);
		var id = idarg || type + (autoId++);
		res.setAttribute("id", id);
		domElement.appendChild(res);
		if (type.toLowerCase() == "button") {
			res.setAttribute("value", text);
		} else {
			var lbl = document.createElement("label");
			lbl.appendChild(document.createTextNode(text));
			lbl.setAttribute("for", id);
			domElement.appendChild(lbl);
			
		}
		res.addEventListener(event, handler, true);
		return res;	
	}
	
	function addButton(domElement, text, clickHandler, id) {
		var btn = addInput(domElement, "button", text, "click", clickHandler);
		//btn.onclick = clickHandler;
		//console.log("addButton", btn, clickHandler);
		return btn;
	}
	
	this.render = function() {
		requestAnimationFrame(that.render);
		that.rsCanvas.render();
	};
	
	this.render();
	
	
	
}
console.log("InteractiveCanvas", InteractiveCanvas);

InteractiveCanvas.showGridOnStart = true;
InteractiveCanvas.prototype = {
		constructor: InteractiveCanvas,
		rsCanvas: {}
}