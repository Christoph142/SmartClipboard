// save preferences:
window.addEventListener("change",function(event){
	if(event.target.className=="custom_text"){
		var custom_text = [];
		for(i = 1; i <= document.getElementsByClassName("custom_text").length/2; i++){
			if(document.getElementById("custom_text_"+i).value!=""){
				var text_i = {};
				text_i.txt = document.getElementById("custom_text_"+i).value;
				text_i.url = document.getElementById("custom_text_"+i+"_title").value;
				text_i.time = new Date().toLocaleString();
				text_i.icon = "data:image/png;base64,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";
				custom_text.push(text_i);
			}
		}
		widget.preferences.customtext = JSON.stringify(custom_text);
		var message = {};
		message.todo = "customtext";
		opera.extension.postMessage(message);
	}
	
	else if(event.target.type=="checkbox") 	widget.preferences[event.target.id] = event.target.checked?1:0;
	else 									widget.preferences[event.target.id] = event.target.value;
	
	// save colors as rgba in widget.preferences[XXX.backgroundColor] (hex is saved automatically in w.p.XXX.backgroundColor_hex):
	if(event.target.type=="color"){
		widget.preferences[event.target.id.substring(0,event.target.id.length-4)] = "rgba("+parseInt(event.target.value.substring(1,3),16)+","+parseInt(event.target.value.substring(3,5),16)+","+parseInt(event.target.value.substring(5,7),16)+",0.5)";
		
		document.getElementById(event.target.id.split(".")[0]).style.backgroundColor = widget.preferences[event.target.id.substring(0,event.target.id.length-4)];
		
		var message = {};
		message.todo = "layoutchange";
		opera.extension.postMessage(message);
	}
},false);

// restore preferences:
function getprefs(){
	var inputs = document.getElementsByTagName("input");
	var selects = document.getElementsByTagName("select");
	var textareas = document.getElementsByTagName("textarea");
	
	for(i=0; i<inputs.length; i++){
		if(widget.preferences[inputs[i].id]!=undefined){
			if(inputs[i].type=="checkbox")
				document.getElementsByTagName("input")[i].checked = widget.preferences[inputs[i].id]=="0"?0:1;
			else document.getElementsByTagName("input")[i].value = widget.preferences[inputs[i].id];
		}
	}
	for(i=0; i<selects.length; i++){
		if(widget.preferences[selects[i].id]!=undefined) document.getElementsByTagName("select")[i].value = widget.preferences[selects[i].id];
	}
	for(i=0; i<textareas.length; i++){
		if(widget.preferences[textareas[i].id]!=undefined)
			document.getElementsByTagName("textarea")[i].value = widget.preferences[textareas[i].id];
	}
	
	if(widget.preferences["frame.backgroundColor"])
		document.getElementById("frame").style.backgroundColor = widget.preferences["frame.backgroundColor"];
	/*document.getElementsByName("choose_framepic")[widget.preferences.framepic_nr=="undefined"?0:widget.preferences.framepic_nr].className = "chosen";
	document.getElementsByName("choose_contentpic")[widget.preferences.contentpic_nr=="undefined"?0:widget.preferences.contentpic_nr].className = "chosen";*/
	
	if(document.getElementById("additional_key1").value!="")document.getElementById("key2_container").style.display = "inline";
	if(document.getElementById("trash_is_active").checked)	document.getElementById("trash_checkbox_container").style.height = "20px";
}

// Key-Codes:
function menu_key(){
	var printable_char = 0;
	switch (event.keyCode) {
		case 6:	document.getElementById("menu_key").value = "Backspace"; break; //  backspace on Mac
		case 8:	document.getElementById("menu_key").value = "Backspace"; break;
		case 9:	document.getElementById("menu_key").value = "Tab"; break;
		case 13: document.getElementById("menu_key").value = "Enter"; break;
		case 16: document.getElementById("menu_key").value = "Shift"; break;
		case 17: document.getElementById("menu_key").value = "Ctrl"; break;
		case 18: document.getElementById("menu_key").value = "Alt"; break;
		case 19: document.getElementById("menu_key").value = "Pause/Break"; break;
		case 20: document.getElementById("menu_key").value = "Caps Lock"; break;
		case 27: document.getElementById("menu_key").value = "Esc"; break;
		case 32: document.getElementById("menu_key").value = "Blank"; break;
		case 33: document.getElementById("menu_key").value = "Page up"; break;
		case 34: document.getElementById("menu_key").value = "Page down"; break;
		case 35: document.getElementById("menu_key").value = "End"; break;
		case 36: document.getElementById("menu_key").value = "Home"; break;
		case 37: document.getElementById("menu_key").value = "Arrow Left"; break;
		case 38: document.getElementById("menu_key").value = "Arrow Up"; break;
		case 39: document.getElementById("menu_key").value = "Arrow Right"; break;
		case 40: document.getElementById("menu_key").value = "Arrow Down"; break;
		case 43: document.getElementById("menu_key").value = "Plus"; break; 
		case 45: document.getElementById("menu_key").value = "Insert"; break;
		case 46: document.getElementById("menu_key").value = "Delete"; break;
		case 91: document.getElementById("menu_key").value = "Left Window"; break;
		case 92: document.getElementById("menu_key").value = "Right Window"; break;
		case 93: document.getElementById("menu_key").value = "Select"; break;
		case 96: document.getElementById("menu_key").value = "Numpad 0"; break;
		case 97: document.getElementById("menu_key").value = "Numpad 1"; break;
		case 98: document.getElementById("menu_key").value = "Numpad 2"; break;
		case 99: document.getElementById("menu_key").value = "Numpad 3"; break;
		case 100: document.getElementById("menu_key").value = "Numpad 4"; break;
		case 101: document.getElementById("menu_key").value = "Numpad 5"; break;
		case 102: document.getElementById("menu_key").value = "Numpad 6"; break;
		case 103: document.getElementById("menu_key").value = "Numpad 7"; break;
		case 104: document.getElementById("menu_key").value = "Numpad 8"; break;
		case 105: document.getElementById("menu_key").value = "Numpad 9"; break;
		case 106: document.getElementById("menu_key").value = "Multiply"; break;
		case 107: document.getElementById("menu_key").value = "Add"; break;
		case 109: document.getElementById("menu_key").value = "Subtract"; break;
		case 110: document.getElementById("menu_key").value = "Decimal point"; break;
		case 111: document.getElementById("menu_key").value = "Divide"; break;
		case 112: document.getElementById("menu_key").value = "F1"; break;
		case 113: document.getElementById("menu_key").value = "F2"; break;
		case 114: document.getElementById("menu_key").value = "F3"; break;
		case 115: document.getElementById("menu_key").value = "F4"; break;
		case 116: document.getElementById("menu_key").value = "F5"; break;
		case 117: document.getElementById("menu_key").value = "F6"; break;
		case 118: document.getElementById("menu_key").value = "F7"; break;
		case 119: document.getElementById("menu_key").value = "F8"; break;
		case 120: document.getElementById("menu_key").value = "F9"; break;
		case 121: document.getElementById("menu_key").value = "F10"; break;
		case 122: document.getElementById("menu_key").value = "F11"; break;
		case 123: document.getElementById("menu_key").value = "F12"; break;
		case 144: document.getElementById("menu_key").value = "Num Lock"; break;
		case 145: document.getElementById("menu_key").value = "Scroll Lock"; break;
		default: printable_char = 1;
	}
	// cancel standard event of key if it's not a printable character, e.g. refresh when pressing F5
	if(printable_char==0) window.event.returnValue = false;
	else document.getElementById("menu_key").value = ""; //clear input before char is inserted
	
	// save the keycode: ( <-> content of menu_key-input-field is automatically stored by eventlistener )
	widget.preferences.menu_keycode = event.keyCode;	
}