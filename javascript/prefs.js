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
				text_i.icon = "http://www.codog.de/SmartClipboard/customtext.png";
				custom_text.push(text_i);
			}
		}
		widget.preferences.customtext = JSON.stringify(custom_text);
		var message = {};
		message.todo = "customtext";
		opera.extension.postMessage(message);
	}
	
	if(event.target.type=="checkbox") 	widget.preferences[event.target.id] = event.target.checked?1:0;
	else 								widget.preferences[event.target.id] = event.target.value;
},false);

function change(target_element, property, target_value, demanding_element){
	if(property=="backgroundImage"){
		document.getElementsByClassName("chosen")[target_element=="frame"?0:1].className = "choose";
		demanding_element.className = "chosen";
		document.getElementById(target_element+"pic").value = target_value;
	}
	document.getElementById(target_element).style[property] = target_value;
}

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
	// and make the background.js request all tabs to reload so the new keycombo takes effect:
	var message = {};
	message.todo = "reload";
	opera.extension.postMessage(message);
}