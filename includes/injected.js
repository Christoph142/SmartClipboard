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

var ready = 0;			// 1 = clipboard-gui is available
var ctrl_pressed = 0;
var v_pressed = 0;
var element_saver;		// keep last active element
var text_saver = "";	// and its text to revert its state, if v is pressed multiple times

window.addEventListener('DOMContentLoaded', function(){
	
	// don't add a clipboard in IFrames, advertisements, etc.:
	if (window.top != window.self) return;
	
	// add HTML:
	var clipboard = document.createElement("div");
	clipboard.id = "SmartClipboard_frame";
	clipboard.className = "SmartClipboard";
	clipboard.style.display = "none"; // prevent gui from being visible before css is added to page
	clipboard.innerHTML = "<div id='clipboard_tab' class='clipboard_tab' onclick='SmartClipboard_showpage(\"SmartClipboard\");'>History</div><div id='pretext_tab' class='clipboard_tab' onclick='SmartClipboard_showpage(\"SmartClipboard_pretext\");'>Custom Texts</div><div id='trash_tab' class='clipboard_tab' onclick='SmartClipboard_showpage(\"SmartClipboard_trash\");'>Trash</div><div id='info_tab' class='clipboard_tab' onclick='SmartClipboard_showpage(\"SmartClipboard_info\");'>Info</div><div id='close_tab' class='clipboard_tab' onclick='document.getElementById(\"SmartClipboard_frame\").style.display = \"none\"; document.getElementById(\"SmartClipboard\").style.display = \"inline\";'>X</div><div id='SmartClipboard' class='clipboard_page'></div><div id='SmartClipboard_trash' class='clipboard_page'></div><div id='SmartClipboard_pretext' class='clipboard_page'><div id='pretext_control'>header</div><div id='pretext_entries'>body</div></div><div id='SmartClipboard_info' class='clipboard_page'><img src=\"http://www.codog.de/SmartClipboard/icon128.png\"><br>Smart Clipboard<br>by <a href=\"http://my.opera.com/christoph142/blog\" target=\"_blank\">Christoph142</a><br><br>If you like this extension please rate it in the extension catalog. Thanks :)</div>";
	
	try{ document.body.appendChild(clipboard); ready = 1; }catch(e){opera.postError("failed to append clipboard");}
	
	// add JS:
	var js = document.createElement("script");
	js.type = "text/javascript";
	js.innerHTML = "function SmartClipboard_showpage(which){ for(i=0;i<document.getElementsByClassName('clipboard_page').length;i++){ document.getElementsByClassName('clipboard_page')[i].style.display = 'none'; } document.getElementById(which).style.display = 'inline'; };"
	
	try{ document.getElementsByTagName("head")[0].appendChild(js); }
	catch(e){
		var head = document.createElement("head");
		head.appendChild(js);
		document.body.appendChild(head);
	}
}, false);

window.addEventListener("copy", on_copy, false);
function on_copy(){
	if(document.activeElement.className=="SmartClipboard_copy_inhibitor") return;
	var message = {}; // {} = Object()
	message.content = {};
	message.todo = "add";
	message.content.txt = String(window.getSelection());
	if(message.content.txt==""){
		var field = document.activeElement;
		message.content.txt = field.value.substring(field.selectionStart,field.selectionEnd);
	}
	message.content.url = document.URL.split("?")[0].split("#")[0];
	message.content.time = new Date().toLocaleString();
	opera.extension.postMessage(JSON.stringify(message));
	//alert(event.clipboardData.getData("Text"));
}

window.addEventListener("keydown", function(event){ // handle key-combos:
	
	var k1 = widget.preferences.additional_key1?widget.preferences.additional_key1:"altKey";
	var k2 = widget.preferences.additional_key2?widget.preferences.additional_key2:"";
	var menu_keycode = widget.preferences.menu_keycode?widget.preferences.menu_keycode:65;
	if((k1==""?1:event[k1]) && (k2==""?1:event[k2]) && event.keyCode == menu_keycode)// Key combination out of options page 
		show_clipboard("full");
	
	if(event.keyCode == 27) hide_clipboard();															// Esc
	
	if(window.navigator.appVersion.indexOf("Mac")!=-1) var key_for_copy_paste = "cmdKey";				// "Mac"
	else var key_for_copy_paste = "ctrlKey";															// "Win", "X11", "Linux"
	if(event[key_for_copy_paste] && ctrl_pressed==0){													// Ctrl / Cmd
		ctrl_pressed = 1;
		// save content of current form to reverse insertion if v is pressed 2x or more:
		if(document.activeElement.type=="text"||document.activeElement.type=="textarea"){
			if(document.activeElement.id == ""){
				document.activeElement.id = "element_saver";
				element_saver = "element_saver";
			}
			else element_saver = document.activeElement.id;
			text_saver = document.activeElement.value;
		}
		else element_saver = ""; // if it's empty, there's no content which has to be copied back later
		window.addEventListener("keyup", quickmenu, false);
	}
}, false);

opera.extension.onmessage = function(event){ // Communication with background-script:
	var msg_from_bg = JSON.parse(event.data);
	if		(msg_from_bg.todo == "update") 		update_gui("clipboard",msg_from_bg.content);
	else if (msg_from_bg.todo == "trash") 		update_gui("trash",msg_from_bg.content);
	else if (msg_from_bg.todo == "customtext")	update_gui("customtext",msg_from_bg.content);
	else if (msg_from_bg.todo == "reload") 		window.location.reload();
	else if (msg_from_bg.todo == "css")			add_css_to_page(msg_from_bg.content);
};

// if v is pressed multiple times while ctrl-key is kept down:
function quickmenu(){
	if(window.event.keyCode == 86) v_pressed++;
	if(v_pressed==2){
		show_clipboard("slim");
		// restore previous state of fields:
		if(element_saver!="") document.getElementById(element_saver).value = text_saver;
	}
	if(v_pressed>=2){
		try{
			document.getElementById(v_pressed-1).parentNode.click();
			document.getElementById(v_pressed-2).parentNode.parentNode.style.backgroundImage = "";
		}catch(e){/* last entry -> go back to first one */
			try{
				document.getElementById("0").parentNode.click();
				document.getElementById(v_pressed-2).parentNode.parentNode.style.backgroundImage = "";
				v_pressed = 1;
			}catch(e){/* no history available */}
		}
	}
	
	if((typeof document.body.oncopy) == "undefined"){	// Opera < 12.50 without copy-eventlistener:
		if(window.event.keyCode == 67) on_copy();		// ctrl + c
	}
	
	if(window.navigator.appVersion.indexOf("Mac")!=-1) var key_for_copy_paste = "cmdKey";
	else var key_for_copy_paste = "ctrlKey";
	if(!window.event[key_for_copy_paste]){ 		// Ctrl / Cmd released
		hide_clipboard();
		for(i=0;i<document.getElementsByClassName("clipboard_tab").length;i++){
			document.getElementsByClassName("clipboard_tab")[i].style.display = "inline";
		}
		if(element_saver!="") document.getElementById(element_saver).focus();
		if(element_saver=="element_saver") document.getElementById(element_saver).id = "";
		ctrl_pressed = 0;
		v_pressed = 0;
		window.removeEventListener("keyup", quickmenu, false);
	}
}

function show_clipboard(how){
	if(how=="slim"){
		for(i=0;i<document.getElementsByClassName("clipboard_tab").length;i++){
			document.getElementsByClassName("clipboard_tab")[i].style.display = "none";
		}
	}
	document.getElementById("SmartClipboard_frame").style.display = "inline";
}
function hide_clipboard(){
	document.getElementById("SmartClipboard_frame").style.display = "none";
	document.getElementById("SmartClipboard").style.display = "inline";
}

function update_gui(which_part,content_from_bg){
	if(ready==1){
		var entry_active="-o-linear-gradient(left, rgba(0,0,0,0) 1%, rgba(180,255,100,0.9) 20%, rgba(180,255,100,0.9) 80%, rgba(0,0,0,0) 99%)";
		if(which_part=="clipboard") document.getElementById("SmartClipboard").innerHTML = "";
		else if(which_part=="trash")document.getElementById("SmartClipboard_trash").innerHTML = "";
		else{						document.getElementById("SmartClipboard_pretext").innerHTML = "";
									if(widget.preferences.customtext) content_from_bg = JSON.parse(widget.preferences.customtext);
									else content_from_bg = [];
		}
		
		for(i=0; i<content_from_bg.length; i++){
			if(which_part=="clipboard") var entry_id = i;
			else if(which_part=="trash")var entry_id = "t"+i;
			else						var entry_id = "p"+i;
			
			var entry = document.createElement("div");
			entry.className = "clipboard_entry";
			entry.onmouseover = "this.style.backgroundImage='"+entry_active+"';";
			entry.onmouseout = "this.style.backgroundImage='';";
			entry.onclick = "this.style.backgroundImage='"+entry_active+"'; document.getElementById('"+entry_id+"').select(); document.execCommand('copy',true,null);";
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
	else window.setTimeout(function(){update_gui(which_part,content_from_bg);},200);
}

function add_css_to_page(css){
	if(document.readyState=="complete"){
		var style = document.createElement("style");
		style.setAttribute("type", "text/css");            
		style.innerHTML = css;
		
		try{ document.getElementsByTagName("head")[0].appendChild(style); }
		catch(e){
			var head = document.createElement("head");
			head.appendChild(style);
			document.body.appendChild(head);
		}
	}
	else window.setTimeout(function(){add_css_to_page(css);},200);
}