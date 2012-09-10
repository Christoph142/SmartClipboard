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
	
	set_custom_style(clipboard); // set style chosen in options
	
	clipboard.innerHTML = "<div id='clipboard_tab' class='clipboard_tab'>History</div><div id='pretext_tab' class='clipboard_tab'>Custom Texts</div><div id='trash_tab' class='clipboard_tab'>Trash</div><div id='info_tab' class='clipboard_tab'>Info</div><div id='close_tab' class='clipboard_tab'>X</div><div id='SmartClipboard' class='clipboard_page'></div><div id='SmartClipboard_trash' class='clipboard_page'></div><div id='SmartClipboard_pretext' class='clipboard_page'><div id='pretext_control'>header</div><div id='pretext_entries'>body</div></div><div id='SmartClipboard_info' class='clipboard_page'><p><img src=\"data:image/png;base64,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\"><br><br><b style='font-size:20px;'>Smart Clipboard</b><br>by <a href=\"http://my.opera.com/christoph142/blog\" target=\"_blank\">Christoph142</a><br><br>If you like this extension please<br><a href='https://addons.opera.com/extensions/details/smart-clipboard#feedback-container' target='_blank' class='button'>rate it</a> & <a href='https://addons.opera.com/extensions/details/smart-clipboard/?reports#feedback-container' target='_blank' class='button'>report bugs</a><br>Thanks :)</p></div>";
	
	try{ document.body.appendChild(clipboard);/* document.body.appendChild(external_data);*/ ready = 1; }
	catch(e){ opera.postError("failed to append clipboard"); }

	if(ready==1){
		document.getElementById("clipboard_tab").addEventListener("click", function(){ showpage("SmartClipboard"); }, false);
		document.getElementById("pretext_tab").addEventListener("click", function(){ showpage("SmartClipboard_pretext"); }, false);
		document.getElementById("trash_tab").addEventListener("click", function(){ showpage("SmartClipboard_trash"); }, false);
		document.getElementById("info_tab").addEventListener("click", function(){ showpage("SmartClipboard_info"); }, false);
		document.getElementById("close_tab").addEventListener("click", hide_clipboard, false);
		
		document.getElementById("SmartClipboard_frame").addEventListener("click",function(){
			window.event.stopPropagation(); // prevent clicks in the menu from having side-effects on websites
		},false);
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
	var key_for_copy_paste = window.navigator.appVersion.indexOf("Mac")!=-1 ? "cmdKey" : "ctrlKey";

	var k1 = widget.preferences.additional_key1 ? widget.preferences.additional_key1 : key_for_copy_paste;
	var k2 = widget.preferences.additional_key2 ? widget.preferences.additional_key2 : "altKey";
	var menu_keycode = widget.preferences.menu_keycode ? widget.preferences.menu_keycode : 65;
	if((k1==""?1:event[k1]) && (k2==""?1:event[k2]) && event.keyCode == menu_keycode){	// Key combination out of options page 
		store_focused_element();
		show_clipboard("full");
	}
	
	if(event[key_for_copy_paste] && ctrl_pressed==0){									// Ctrl / Cmd
		ctrl_pressed = 1;
		store_focused_element();
		/*get_externaldata();*/
		window.addEventListener("keyup", quickmenu, false);
	}
	
	if(event.keyCode == 27) hide_clipboard();											// Esc
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
	else if (msg_from_bg.todo == "layoutchange")set_custom_style("");
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
			try{
				if(text_saver!="##_SC_NoInputElement_##") document.getElementById(element_saver).value = text_saver; // undo paste (1. press of "v")
			} catch(e){ opera.postError("element_saver no object"); }
			for(i=0;i<doc.getElementsByClassName("clipboard_tab").length;i++){
				doc.getElementsByClassName("clipboard_tab")[i].style.display = "none";
			}
		}
		else try{ document.getElementById("c_SC_0").click(); }catch(e){/* no entry */}
		doc.getElementById("SmartClipboard_frame").style.display = "inline";
	}
}

function hide_clipboard(){
	doc.getElementById("SmartClipboard_frame").style.display = "none";
	doc.getElementById("SmartClipboard").style.display = "inline";
	try{ doc.getElementById("c_SC_"+(v_pressed==0?0:v_pressed-1)).parentNode.parentNode.style.backgroundImage = ""; }
	catch(e){ /* no clipboard entries */ }
	v_pressed = 0;

	// restore focus:
	try{ doc.getElementById(element_saver).focus(); }catch(e){}
	if(selectionstart_saver!="-1"){
		doc.getElementById(element_saver).selectionStart = selectionstart_saver-0;
		doc.getElementById(element_saver).selectionEnd = selectionend_saver-0;
	}
	if(element_saver=="element_saver") doc.getElementById(element_saver).removeAttribute("id");
}

function update_gui(which_part,content_from_bg){
	if(window.top != window.self) return;
	
	if(ready==1){
		if(window.navigator.userAgent.substr(window.navigator.userAgent.length-5,4)>=12.5)
			var entry_active = "linear-gradient(270deg, rgba(0,0,0,0) 1%, rgba(180,255,100,0.9) 20%, rgba(180,255,100,0.9) 80%, rgba(0,0,0,0) 99%)";
		else var entry_active = "-o-linear-gradient(left, rgba(0,0,0,0) 1%, rgba(180,255,100,0.9) 20%, rgba(180,255,100,0.9) 80%, rgba(0,0,0,0) 99%)";
		
		if(which_part=="clipboard")
			document.getElementById("SmartClipboard").innerHTML = content_from_bg.length == 0 ?
				"<div style='text-align:center; line-height:380px;'>No elements in clipboard</div>":"";
		else if(which_part=="trash")
			document.getElementById("SmartClipboard_trash").innerHTML = content_from_bg.length == 0 ?
				"<div style='text-align:center; line-height:380px;'>No elements in trash</div>":"";
		else{
			content_from_bg = widget.preferences.customtext ? JSON.parse(widget.preferences.customtext) : [];
			document.getElementById("SmartClipboard_pretext").innerHTML = content_from_bg.length == 0 ?
				"<div style='text-align:center; line-height:380px;'>No custom texts. Add some in extension's preferences</div>":"";
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

function set_custom_style(clipboard){
	if(window.top != window.self) return;
	
	if(clipboard=="") clipboard = document.getElementById("SmartClipboard_frame");
	
	if(widget.preferences["frame.backgroundColor"]) clipboard.style.backgroundColor = widget.preferences["frame.backgroundColor"];
}