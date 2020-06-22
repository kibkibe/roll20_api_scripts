on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!! ") === 0) {
	    var tok = getObj("graphic", msg.selected[0]._id);
	    sendChat("character|"+tok.get('represents'),msg.content.substring(3));
	}
}
});
