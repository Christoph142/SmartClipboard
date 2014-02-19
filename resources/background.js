/**
* Listen for the copy and paste request for the system clipboard
* and send back the data to be copied or pasted to the xopus clipboad.
*/
chrome.extension.onRequest.addListener(
  function (request, sender, sendResponse)
  {
    if (request === "Xopus_Chrome_Extension_Paste_Operation")
    {
      var content = pasteContent("paste ");
      sendResponse({ data: content });
    }
    else
    {
      var copyDiv = document.createElement('div');
      copyDiv.contentEditable = true;
      document.body.appendChild(copyDiv);
      copyDiv.innerHTML = request;
      copyDiv.unselectable = "off";
      copyDiv.focus();
      document.execCommand('SelectAll');
      document.execCommand("Copy", false, null);
      document.body.removeChild(copyDiv);
      
      var content = pasteContent("copy ");
      sendResponse({ data: content });
    } 
  });
/**
* paste the contents into an editable div element
* returns the contents of the div.
* @param (type) type of the command (copy or paste)
*/
  function pasteContent(type)
  {
    var pasteDiv = document.createElement('div');
    pasteDiv.contentEditable = true;
    document.body.appendChild(pasteDiv);
    pasteDiv.focus();
    document.execCommand("Paste");

    var content = type + pasteDiv.innerHTML;
    document.body.removeChild(pasteDiv);
    return content;
  }