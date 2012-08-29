// ==UserScript==
// @include http://*
// @include https://*
// ==/UserScript==

///////////////////////////////// Smart Clipboard by Christoph142 /////////////////////////////////
//                                                                                               //
// You're welcome to use or modify this code (or parts of it) for your personal use as a userjs  //
//              but please refrain from copying its functionality to other extensions            //
//                                                                                               //
///////////////////////////////////////////////////////////////////////////////////////////////////

var ready = 0;					// 1 = clipboard-ui is available / iframe-redirects established
var ctrl_pressed = 0;
var v_pressed = 0;
var element_saver;				// keep last active element before opening the menu
var text_saver;					// its text
var selectionstart_saver = "-1";// and the cursor start-
var selectionend_saver;			// and end-position within it to revert its state, if v is pressed multiple times
var doc = document;				// document (main window), window.top.document (iframe)

window.addEventListener('DOMContentLoaded', function(){
	
	// prevent multiple clipboard-UIs in iframes, advertisements, etc. and redirect UI-commands to parent frame:
	if (window.top != window.self){
		try{ doc = window.top.document; }catch(e){ return; /* might be inaccessible due to security restrictions */ }
		window.addEventListener("focus", function(){ v_pressed = 0;	ctrl_pressed = 0; }, false);
		ready = 1;
		return;
	}
	
	/*var external_data = document.createElement("textarea");
	external_data.id = "SmartClipboard_externaldata";*/
	
	// add UI:
	var clipboard = document.createElement("div");
	clipboard.id = "SmartClipboard_frame";
	clipboard.className = "SmartClipboard";
	clipboard.style.display = "none"; // prevent gui from being visible before css is added to page
	clipboard.innerHTML = "<div id='clipboard_tab' class='clipboard_tab'>History</div><div id='pretext_tab' class='clipboard_tab'>Custom Texts</div><div id='trash_tab' class='clipboard_tab'>Trash</div><div id='info_tab' class='clipboard_tab'>Info</div><div id='close_tab' class='clipboard_tab'>X</div><div id='SmartClipboard' class='clipboard_page'></div><div id='SmartClipboard_trash' class='clipboard_page'></div><div id='SmartClipboard_pretext' class='clipboard_page'><div id='pretext_control'>header</div><div id='pretext_entries'>body</div></div><div id='SmartClipboard_info' class='clipboard_page'><p><img src=\"http://www.codog.de/SmartClipboard/icon128.png\"><br><br><b style='font-size:20px;'>Smart Clipboard</b><br>by <a href=\"http://my.opera.com/christoph142/blog\" target=\"_blank\">Christoph142</a><br><br>If you like this extension please<br><a href='https://addons.opera.com/extensions/details/smart-clipboard#feedback-container' target='_blank' class='button'>rate it</a> & <a href='https://addons.opera.com/extensions/details/smart-clipboard/?reports#feedback-container' target='_blank' class='button'>report bugs</a><br>Thanks :)</p></div>";
	
	try{ document.body.appendChild(clipboard);/* document.body.appendChild(external_data);*/ ready = 1; }
	catch(e){ opera.postError("failed to append clipboard"); }

	if(ready==1){
		document.getElementById("clipboard_tab").addEventListener("click", function(){ showpage("SmartClipboard"); }, false);
		document.getElementById("pretext_tab").addEventListener("click", function(){ showpage("SmartClipboard_pretext"); }, false);
		document.getElementById("trash_tab").addEventListener("click", function(){ showpage("SmartClipboard_trash"); }, false);
		document.getElementById("info_tab").addEventListener("click", function(){ showpage("SmartClipboard_info"); }, false);
		document.getElementById("close_tab").addEventListener("click", hide_clipboard, false);
	}

}, false);

/*function get_externaldata(){
	document.designMode = "on";
	document.getElementById("SmartClipboard_externaldata").focus();
	document.execCommand("paste", false, null);
	document.designMode = "off";
	opera.postError(document.getElementById("SmartClipboard_externaldata").value);
}*/

function showpage(which){
	for(i=0;i<doc.getElementsByClassName('clipboard_page').length;i++){
		doc.getElementsByClassName('clipboard_page')[i].style.display = 'none';
	}
	doc.getElementById(which).style.display = which=='SmartClipboard_info'?'table':'inline';
}

window.addEventListener("cut", on_copy, false);
window.addEventListener("copy", on_copy, false);
function on_copy(){
	var message = {}; // {} = Object()
	if(doc.activeElement.className=="SmartClipboard_copy_inhibitor"){ // copying an element back from clipboard
		v_pressed = 1; // cause element gets moved to top
		message.todo = "movetop";
		message.element = doc.activeElement.id;
	}
	else{
		message.content = {};
		message.todo = "add";
		message.content.txt = String(window.getSelection());
		if(message.content.txt==""){
			var field = doc.activeElement;
			message.content.txt = field.value.substring(field.selectionStart,field.selectionEnd);
			if(message.content.txt=="") return; // don't save empty copies
		}
		message.content.url = document.URL.split("?")[0].split("#")[0];
		message.content.time = new Date().toLocaleString();
	}
	opera.extension.postMessage(message);
	//alert(event.clipboardData.getData("Text"));
}

window.addEventListener("keydown", function(event){ // handle key-combos:	
	var k1 = widget.preferences.additional_key1?widget.preferences.additional_key1:"shiftKey";
	var k2 = widget.preferences.additional_key2?widget.preferences.additional_key2:"altKey";
	var menu_keycode = widget.preferences.menu_keycode?widget.preferences.menu_keycode:65;
	if((k1==""?1:event[k1]) && (k2==""?1:event[k2]) && event.keyCode == menu_keycode){			// Key combination out of options page 
		store_focused_element();
		show_clipboard("full");
	}
	
	if(window.navigator.appVersion.indexOf("Mac")!=-1) var key_for_copy_paste = "cmdKey";		// "Mac"
	else var key_for_copy_paste = "ctrlKey";													// "Win", "X11", "Linux"
	if(event[key_for_copy_paste] && ctrl_pressed==0){											// Ctrl / Cmd
		ctrl_pressed = 1;
		store_focused_element();
		/*get_externaldata();*/
		window.addEventListener("keyup", quickmenu, false);
	}
	
	if(event.keyCode == 27) hide_clipboard();													// Esc
}, false);

function store_focused_element(){
	// save element in focus (and its content, if it's an input/textarea) to reverse focus & insertion if v is pressed 2x or more:
	if(document.activeElement.id == ""){
		document.activeElement.id = "element_saver";
		element_saver = "element_saver";
	}
	else element_saver = document.activeElement.id;
	
	if(document.activeElement.selectionStart!=undefined && document.activeElement.type!="password"){
		text_saver = document.activeElement.value;
		selectionstart_saver = document.activeElement.selectionStart;
		selectionend_saver = document.activeElement.selectionEnd;
	}
	else selectionstart_saver = "-1"; // there's no content which has to be copied back later
}

opera.extension.onmessage = function(event){ // Communication with background-script:
	var msg_from_bg = event.data;
	if		(msg_from_bg.todo == "update") 		update_gui("clipboard",msg_from_bg.content);
	else if (msg_from_bg.todo == "trash") 		update_gui("trash",msg_from_bg.content);
	else if (msg_from_bg.todo == "customtext")	update_gui("customtext",msg_from_bg.content);
	else if (msg_from_bg.todo == "reload") 		window.location.reload();
	else if (msg_from_bg.todo == "css")			add_css_to_page(msg_from_bg.content);
};

// if v is pressed multiple times while ctrl-key is kept down:
function quickmenu(){
	if(window.event.keyCode == 86){
		v_pressed++;
		if(v_pressed==1 && doc.getElementById("SmartClipboard_frame").style.display=="inline" && doc.getElementById("clipboard_tab").style.display=="none"){ // when menu got opened in slim mode within an iframe:
			v_pressed = 3;
		}
		if(v_pressed==2) show_clipboard("slim");
		if(v_pressed>=2){
			try{
				doc.getElementById("c_SC_"+(v_pressed-1)).parentNode.click();
				doc.getElementById("c_SC_"+(v_pressed-2)).parentNode.parentNode.style.backgroundImage = "";
			}catch(e){ /* last entry -> go back to first one */
				try{
					doc.getElementById("c_SC_0").parentNode.click();
					doc.getElementById("c_SC_"+(v_pressed-2)).parentNode.parentNode.style.backgroundImage = "";
					v_pressed = 1;
				}catch(e){ /* no history available */ }
			}
		}
	}
	
	if((typeof document.body.oncopy) == "undefined"){							// Opera < 12.50 without copy-eventlistener:
		if(window.event.keyCode == 67 || window.event.keyCode == 88) on_copy();	// ctrl + c / x
	}
	
	if(window.navigator.appVersion.indexOf("Mac")!=-1) var key_for_copy_paste = "cmdKey";
	else var key_for_copy_paste = "ctrlKey";
	if(!window.event[key_for_copy_paste]){ // Ctrl/Cmd released
		if(doc.getElementById("SmartClipboard_frame").style.display=="none"){ // if menu wasn't open:
			if(element_saver=="element_saver") doc.getElementById(element_saver).removeAttribute("id");
		}
		else if(doc.getElementById("clipboard_tab").style.display=="none"){ // if in slim mode
			hide_clipboard();
			for(i=0;i<doc.getElementsByClassName("clipboard_tab").length;i++){
				doc.getElementsByClassName("clipboard_tab")[i].style.display = "inline";
			}
		}
		v_pressed = 0;
		ctrl_pressed = 0;
		window.removeEventListener("keyup", quickmenu, false);
	}
}

function show_clipboard(how){
	if(ready==1){
		if(how=="slim"){
			if(text_saver!="##_SC_NoInputElement_##") document.getElementById(element_saver).value = text_saver; // undo paste (1. press of "v")
			for(i=0;i<doc.getElementsByClassName("clipboard_tab").length;i++){
				doc.getElementsByClassName("clipboard_tab")[i].style.display = "none";
			}
		}
		doc.getElementById("SmartClipboard_frame").style.display = "inline";
	}
}
function hide_clipboard(){
	doc.getElementById("SmartClipboard_frame").style.display = "none";
	doc.getElementById("SmartClipboard").style.display = "inline";
	doc.getElementById("c_SC_"+(v_pressed==0?0:v_pressed-1)).parentNode.parentNode.style.backgroundImage = "";
	v_pressed = 0;

	// restore focus:
	doc.getElementById(element_saver).focus();
	if(selectionstart_saver!="-1"){
		doc.getElementById(element_saver).selectionStart = selectionstart_saver-0;
		doc.getElementById(element_saver).selectionEnd = selectionend_saver-0;
	}
	if(element_saver=="element_saver") doc.getElementById(element_saver).removeAttribute("id");
}

function update_gui(which_part,content_from_bg){
	if(window.top != window.self) return;
	
	if(ready==1){
		//if(window.navigator.userAgent.substr(window.navigator.userAgent.length-5,4)>=12.5)
			var entry_active="-o-linear-gradient(left, rgba(0,0,0,0) 1%, rgba(180,255,100,0.9) 20%, rgba(180,255,100,0.9) 80%, rgba(0,0,0,0) 99%)";
		//else var entry_active="-o-linear-gradient(left, rgba(0,0,0,0) 1%, rgba(180,255,100,0.9) 20%, rgba(180,255,100,0.9) 80%, rgba(0,0,0,0) 99%)";
		if(which_part=="clipboard") document.getElementById("SmartClipboard").innerHTML = "";
		else if(which_part=="trash")document.getElementById("SmartClipboard_trash").innerHTML = "";
		else{						document.getElementById("SmartClipboard_pretext").innerHTML = "";
									if(widget.preferences.customtext) content_from_bg = JSON.parse(widget.preferences.customtext);
									else content_from_bg = [];
		}
		
		for(i=0; i<content_from_bg.length; i++){
			if(which_part=="clipboard") var entry_id = "c_SC_"+i;
			else if(which_part=="trash")var entry_id = "t_SC_"+i;
			else						var entry_id = "p_SC_"+i;
			
			var entry = document.createElement("div");
			entry.className = "clipboard_entry";
			entry.onmouseover = function(){ this.style.backgroundImage = entry_active; };
			entry.onmouseout = function(){ this.style.backgroundImage = ""; };
			entry.onclick = function(){
				this.style.backgroundImage = entry_active;
				this.childNodes[1].childNodes[0].select();
				//document.execCommand('copy',false,null);
			};
			entry.innerHTML = "<div style='color:#777; white-space:nowrap; overflow:hidden;'><img src='"+content_from_bg[i].icon+"' style='border:none; width:16px; height:16px; margin:5px; vertical-align:middle;' /><span style='vertical-align:middle;'>"+content_from_bg[i].url+"</span></div><div><textarea id='"+entry_id+"' class='SmartClipboard_copy_inhibitor' readonly='readonly'></textarea></div>";
			
			if(which_part=="clipboard")	document.getElementById("SmartClipboard").appendChild(entry);
			else if(which_part=="trash")document.getElementById("SmartClipboard_trash").appendChild(entry);
			else						document.getElementById("SmartClipboard_pretext").appendChild(entry);
			
			var entry_textarea = document.getElementById(entry_id);	
			entry_textarea.value = content_from_bg[i].txt;
			entry_textarea.style = "width:100%; height:auto; color:#000; background-color:rgba(0,0,0,0); cursor:pointer; border:0px; overflow:hidden;";
			entry_textarea.rows = 2;
		}
		
		if(which_part=="clipboard")	document.getElementById("c_SC_0").click();
	}
	else window.setTimeout(function(){ update_gui(which_part,content_from_bg); }, 500);
}

function add_css_to_page(css){
	if(window.top != window.self) return;

	if(document.readyState == "complete"){
		var style = document.createElement("style");
		style.setAttribute("type", "text/css");            
		style.innerHTML = css;
		
		try{ document.getElementsByTagName("head")[0].appendChild(style); }
		catch(e){
			try{
				var head = document.createElement("head");
				head.appendChild(style);
				document.body.appendChild(head);
			}catch(e){ /* SVGs don't have body/head-section */ }
		}
	}
	else window.setTimeout(function(){add_css_to_page(css);},200);
}