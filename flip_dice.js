on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!flip_dice") === 0 && msg.selected) {
        for (var i=0;i<msg.selected.length;i++) {
            var obj = getObj("graphic", msg.selected[i]._id);
            var img = obj.get('sides').split('|')[0].replace('%3A',':').replace('%3F','?').replace('max','thumb');
            obj.set({currentSide:0,imgsrc:img});
        }
    }
}});
