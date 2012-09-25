function translate(){
	var text = document.body.innerHTML;
	for (var key in strings){ text = text.replace(new RegExp("##"+key+"##","gm"), strings[key]); }
	document.body.innerHTML = text;
}