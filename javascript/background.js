clipboardcontent = []; // [] = Array, {} = Object
trash = [];
customtext = [];

// restore history / trash from previous run:
if(widget.preferences.clear_history_on_exit!="1") try{ clipboardcontent = JSON.parse(widget.preferences.clipboardcontent); }catch(e){}
if(widget.preferences.clear_trash_on_exit == "0") try{ trash = JSON.parse(widget.preferences.trash); }catch(e){}
try{ customtext = JSON.parse(widget.preferences.customtext); }catch(e){}

window.addEventListener("load", function(){
		
	opera.extension.onconnect = function(event){
		
		// get CSS for clipboard:
		var req = new XMLHttpRequest();
		req.open("GET", "../includes/style.css", false);
		req.send();
		
		var msg = {};
		msg.todo = "css";
		msg.content = req.responseText;
		event.source.postMessage(msg);
		
		send_to_gui("update",clipboardcontent);
		send_to_gui("trash",trash);
		send_to_gui("customtext",customtext);
	}
	
	opera.extension.onmessage = function(event){
		var message = event.data;
		
		if(message.todo == "add"){
			if(opera.extension.tabs.getSelected().faviconUrl=="")
				message.content.icon = "http://www.codog.de/SmartClipboard/icon16.png";
			else message.content.icon = opera.extension.tabs.getSelected().faviconUrl;
			clipboardcontent.unshift(message.content);	
		}
		else if(message.todo == "movetop"){
			if(message.element[0]=="c") clipboardcontent.unshift(clipboardcontent.splice(message.element.split("_")[2]-0,1)[0]);
			else if(message.element[0]=="t") clipboardcontent.unshift(trash.splice(message.element.split("_")[2]-0,1)[0]);
			else clipboardcontent.unshift(JSON.parse(widget.preferences.customtext)[message.element.split("_")[2]-0]);
		}
		else if(message.todo == "reload"){
			opera.extension.broadcastMessage(message); // forward reload request to all tabs
			return; // prevent send_to_gui(); and following to be executed
		}
		else if(message.todo == "customtext"){
			send_to_gui("customtext","");
			return;
		}
		
		if(clipboardcontent.length>(widget.preferences.max_entries?widget.preferences.max_entries:5)){
			if(widget.preferences.trash_is_active=="1") trash.unshift(clipboardcontent.pop());
			else clipboardcontent.pop();
		}	
		send_to_gui("update",clipboardcontent);
		if(widget.preferences.trash_is_active=="1") send_to_gui("trash",trash);
		make_it_persistent();
	}
}, false);

window.opera.addEventListener("unload", make_it_persistent, false);

function make_it_persistent(){
	// save clipboard and trash: (!=1 != ==0 <-> undefined / default value)
	if(widget.preferences.clear_history_on_exit!="1") widget.preferences.clipboardcontent = JSON.stringify(clipboardcontent);
	else  widget.preferences.clipboardcontent = null;
	if(widget.preferences.clear_trash_on_exit=="0") widget.preferences.trash = JSON.stringify(trash);
	else  widget.preferences.trash = null;
}

function send_to_gui(todo, content){
	var updated = {};
	updated.todo = todo;
	updated.content = content;
	opera.extension.broadcastMessage(updated);
}