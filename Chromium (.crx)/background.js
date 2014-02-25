var w = null;
// retrieve and store settings (filled with default values) for all pages:
chrome.storage.sync.get( null, function(storage){
	w = {
	"trash_is_active" :			(!storage["trash_is_active"]		? "1" : storage["trash_is_active"]),
	"clear_trash_on_exit" :		(!storage["clear_trash_on_exit"]	? "1" : storage["clear_trash_on_exit"]),
	"clear_history_on_exit" :	(!storage["clear_history_on_exit"]	? "0" : storage["clear_history_on_exit"]),
	"max_entries" :				(!storage["max_entries"]			? "5" : storage["max_entries"]),
	
	"clipboard" :				(!storage["clipboard"] || storage["clear_history_on_exit"] === "1"	? []  : storage["clipboard"]),
	"trash" :					(!storage["trash"]	   || storage["clear_trash_on_exit"]   === "1"	? []  : storage["trash"]),
	"customtext" :				(!storage["customtext"]												? []  : storage["customtext"])
	};

	update_active_tab();
});

chrome.runtime.onMessage.addListener( function(request, sender, sendResponse){
	if		(request.data === "settings" && w) update_active_tab();
	//else if (request.data === "layoutchange")	
	else if (request.data === "add")
	{
		chrome.tabs.query({active: true, currentWindow: true}, function (tabs){
			request.content.icon = (tabs[0].favIconUrl !== "" ? tabs[0].favIconUrl : "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQCAYAAAAf8/9hAAAABmJLR0QA/wD/AP+gvaeTAAAACXBIWXMAAABIAAAASABGyWs+AAAACXZwQWcAAAAQAAAAEABcxq3DAAACnklEQVQ4y22Rz2ucVRSGn3O/O2YyjUk0NTU2amtEFFy4EBf+BwruRBCkLl0pbhR04aIbEVdF6D9QXIjgUunORZFSaXFRCgEVa40j6SSTSdPMfPeeHy4+Gyx6N+ceOO97npcj/M/7/LNPcfeF1DTvQribf5GadPjBhx/9Z1bee32Dc1//zIWzLz+5spTWPJrYqi/0lx578dXUpHeAMPPz+1tXLq7PXW8Fld2JDd/65Ieb77/xNPLx288y3L4zd+a15758dP3UK8PD4/bH4elG8rH5JCIAHh6hd6eP9zdtdbDX3B7euvjVd5tvHl9ZaHNVODafcm7y6urzZwaNnmAw3kd0h3TnEkSFQIIYLC8us7D0EuPtC48sDFJ2p82z4rQlMDORZo6NU8/wlDu0v9GMr4I3QACBRY/hJFPNpVQXT06eFqdUFzUTc8fUMDeSzkiSIcmRgWqPUg1Tk6KBiZPbYpQaompiZng47k6Ku0jOQIYIAErb0JZAzaSqi2LkWTG0uqhacu/E4U6thTLr0SRIKUgSHMwSaoKqSlEX3MmlOqouZiZmnYG7UWWDGct4bSGUCKU2idQbUauKqhNi5KqOmWPmco/A3UlNn/kHT3Z9BOFO9uBgPMLMRC3ExcmqhnUEuNuRQUTcV1UVNUe1Ytb9HSer3SPoIoTfL3R3ptMpOzs7jPcm7G5+j9hUWk2IWEfg1p3x3xEiotuqymg04uq1a4x//5En5DL97MyKS68RUjWno7AuK93VVI1SlVKV8d4ek1tXWPPLnHzIMXfRf3S5VsPMUVXZH90k8iJay9H2tp2x9dO3rPsl1h6GJIlalbYYkYU8mlTGB9Ze/3VyY/ubcydCegYdRgDhRrJ9+g8It8dCQPPXbr3xy59tu7LY8Dc0hx8lySHDZQAAAC56VFh0Y3JlYXRlLWRhdGUAAHjaMzIwNNQ1NNA1NA4xNLAyNLEyNdU2sLAyMAAAQOIFCXkDl6YAAAAuelRYdG1vZGlmeS1kYXRlAAB42jMyMDTUNbDUNbAMMTSzMrWwMjTSNrCwMjAAAEI1BR3j0SNaAAAAAElFTkSuQmCC");
			w.clipboard.unshift(request.content);
			update_sc();
		});
	}
	else if (request.data === "movetop")
	{
		if		(request.element[0] === "c") 	w.clipboard.unshift(w.clipboard.splice(request.element.split("_")[2]-0,1)[0]);
		else if	(request.element[0] === "t") 	w.clipboard.unshift(w.trash.splice(request.element.split("_")[2]-0,1)[0]);
		else 									w.clipboard.unshift(w.customtext[request.element.split("_")[2]-0]);
		
		update_sc(sendResponse);
	}
});

function update_sc(sendResponse)
{
	if(w.clipboard.length > w.max_entries)
	{
		if (w.trash_is_active !== "0") 	trash.unshift(w.clipboard.pop());
		else 							w.clipboard.pop();
	}
	
	if(sendResponse) sendResponse(w);
	else 			 update_active_tab();
}

function update_active_tab()
{
	chrome.tabs.query({active: true, currentWindow: true}, function(tabs){
		chrome.tabs.sendMessage(tabs[0].id, { "data" : "update", "w" : w });
	});
}