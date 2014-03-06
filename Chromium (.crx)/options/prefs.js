var storage = null;
chrome.runtime.getBackgroundPage( function (bg)
{
	storage = bg.w;
	restoreprefs();
});

window.addEventListener("DOMContentLoaded", DocumentReady, false);

function DocumentReady()
{
	restoreprefs();
	localize();
}

window.addEventListener("change", function(e) // save preferences:
{
	if(e.target.type === "checkbox") save_new_value(e.target.id, e.target.checked?"1":"0");
	else 							 save_new_value(e.target.id, e.target.value);
}, false);

function save_new_value(key, value)
{
	var saveobject = {};
	saveobject[key] = value;
	chrome.storage.sync.set(saveobject);				// save it in Chrome's synced storage
	storage[key] = value;								// update local copy of settings object
	chrome.runtime.getBackgroundPage( function (bg){	// update settings in background.js
		bg.w[key] = value;
	});
}

function restoreprefs()
{
	if(storage === null || (document.readyState !== "complete" && document.readyState !== "interactive")) return;

	var selects = document.getElementsByTagName("select");
	for(var i = 0; i < selects.length; i++){
		if(!storage[selects[i].id]) continue;
		document.getElementsByTagName("select")[i].value = storage[selects[i].id];
	}

	var inputs = document.getElementsByTagName("input");	
	for(var i = 0; i < inputs.length; i++){
		console.log(inputs[i], storage[inputs[i].id]);
		if(!storage[inputs[i].id]) continue;
		if(inputs[i].type==="checkbox")	document.getElementsByTagName("input")[i].checked = (storage[inputs[i].id] === "0" ? false : true);
		else							document.getElementsByTagName("input")[i].value = storage[inputs[i].id];
	}
}

function localize()
{
	if(chrome.i18n.getMessage("lang") === "ar" || chrome.i18n.getMessage("lang") === "ur_PK") document.body.dir = "rtl";
	
	var strings = document.getElementsByClassName("i18n");
	for(var i = 0; i < strings.length; i++)
	{
		if(strings[i].tagName === "IMG")	strings[i].title = chrome.i18n.getMessage(strings[i].title); // tooltips
		else								strings[i].innerHTML += chrome.i18n.getMessage(strings[i].dataset.i18n);
	}
	
	//help:
	document.getElementById("close_help").addEventListener("click", function(e){
		e.preventDefault(); e.stopPropagation();
		document.getElementById("help").style.display = "none";
	}, false);
}
