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
				message.content.icon = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAACnklEQVQ4y22Rz2ucVRSGn3O/O2YyjUk0NTU2amtEFFy4EBf+BwruRBCkLl0pbhR04aIbEVdF6D9QXIjgUunORZFSaXFRCgEVa40j6SSTSdPMfPeeHy4+Gyx6N+ceOO97npcj/M/7/LNPcfeF1DTvQribf5GadPjBhx/9Z1bee32Dc1//zIWzLz+5spTWPJrYqi/0lx578dXUpHeAMPPz+1tXLq7PXW8Fld2JDd/65Ieb77/xNPLx288y3L4zd+a15758dP3UK8PD4/bH4elG8rH5JCIAHh6hd6eP9zdtdbDX3B7euvjVd5tvHl9ZaHNVODafcm7y6urzZwaNnmAw3kd0h3TnEkSFQIIYLC8us7D0EuPtC48sDFJ2p82z4rQlMDORZo6NU8/wlDu0v9GMr4I3QACBRY/hJFPNpVQXT06eFqdUFzUTc8fUMDeSzkiSIcmRgWqPUg1Tk6KBiZPbYpQaompiZng47k6Ku0jOQIYIAErb0JZAzaSqi2LkWTG0uqhacu/E4U6thTLr0SRIKUgSHMwSaoKqSlEX3MmlOqouZiZmnYG7UWWDGct4bSGUCKU2idQbUauKqhNi5KqOmWPmco/A3UlNn/kHT3Z9BOFO9uBgPMLMRC3ExcmqhnUEuNuRQUTcV1UVNUe1Ytb9HSer3SPoIoTfL3R3ptMpOzs7jPcm7G5+j9hUWk2IWEfg1p3x3xEiotuqymg04uq1a4x//5En5DL97MyKS68RUjWno7AuK93VVI1SlVKV8d4ek1tXWPPLnHzIMXfRf3S5VsPMUVXZH90k8iJay9H2tp2x9dO3rPsl1h6GJIlalbYYkYU8mlTGB9Ze/3VyY/ubcydCegYdRgDhRrJ9+g8It8dCQPPXbr3xy59tu7LY8Dc0hx8lySHDZQAAAC56VFh0Y3JlYXRlLWRhdGUAAHjaMzIwNNQ1NNA1NA4xNLAyNLEyNdU2sLAyMAAAQOIFCXkDl6YAAAAuelRYdG1vZGlmeS1kYXRlAAB42jMyMDTUNbDUNbAMMTSzMrWwMjTSNrCwMjAAAEI1BR3j0SNaAAAAAElFTkSuQmCC";
			else message.content.icon = opera.extension.tabs.getSelected().faviconUrl;
			clipboardcontent.unshift(message.content);	
		}
		else if(message.todo == "movetop"){
			if(message.element[0]=="c") clipboardcontent.unshift(clipboardcontent.splice(message.element.split("_")[2]-0,1)[0]);
			else if(message.element[0]=="t") clipboardcontent.unshift(trash.splice(message.element.split("_")[2]-0,1)[0]);
			else clipboardcontent.unshift(JSON.parse(widget.preferences.customtext)[message.element.split("_")[2]-0]);
		}
		else if(message.todo == "customtext"){
			send_to_gui("customtext","");
			return;
		}
		else if(message.todo == "layoutchange"){
			opera.extension.broadcastMessage(message); // forward layoutchange request to all tabs
			return; // prevent send_to_gui(); and following to be executed
		}
		
		if(clipboardcontent.length>(widget.preferences.max_entries?widget.preferences.max_entries:5)){
			if(widget.preferences.trash_is_active!="0") trash.unshift(clipboardcontent.pop());
			else clipboardcontent.pop();
		}	
		send_to_gui("update",clipboardcontent);
		if(widget.preferences.trash_is_active!="0") send_to_gui("trash",trash);
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