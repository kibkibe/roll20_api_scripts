on("chat:message", function(msg)
{
if (msg.type == "api"){
if (msg.content.indexOf("!install_magic ") === 0) {
	    if (msg.selected) {
	        var tok = getObj("graphic", msg.selected[0]._id);
	        log(msg.content);
    	    if (tok) {
    	        var proc_msg = msg.content.replace("!install_magic ").replace("{{").replace("}}");
    	        var cha_id = getObj("character", tok.get('represents')).get('_id');
    	        var list = proc_msg.split("<br/>\n");
    	        var attr_list = [
    	            "Magic_*num*_Name",
    	            "Magic_*num*_Types",
    	            "Magic_*num*_Assigned_Skill",
    	            "Magic_*num*_Cost",
    	            "Magic_*num*_Effect",
    	            "Magic_*num*_Recite",
    	            "ima_show_cust_*num*"];
    	        var idx = 1;
    	        
    	        var repeat_id_list = [];
    	        var attrs = findObjs({_type: "attribute", _characterid: cha_id});
    	        for (var i=0;i<attrs.length;i++) {
    	            var item = attrs[i].get('name');
    	            if (item.includes('repeating_') && item.includes('_Magic_Name')) {
    	                repeat_id_list.push(item.replace('_Magic_Name',''));
    	            }
    	        }
    	        
    	        for (var i=0;i<list.length;i++) {
        	        var items = list[i].split(" --");
        	        if (items.length > 1) {
        	            idx++;
        	            for (var j=0;j<items.length;j++) {
        	                var name, attr, item;
        	                if (idx < 7) {
        	                    name = attr_list[j].replace("_*num*", ("_0"+idx).slice(-3));
        	                    attr = findObjs({_type: "attribute", _characterid: cha_id, name:name})[0];
        	                } else {
        	                    name = repeat_id_list[idx-7] + "_" + attr_list[j].replace("_*num*", "");
    	                        log(name);
        	                    attr = findObjs({_type: "attribute", _characterid: cha_id, name:name})[0];
    	        
        	                }
        	                item = items[j];
        	                if (j==1||j==2) {
        	                    item = "@{" + item + "}";
        	                }
        	                
        	                if (!attr) {
        	                    attr = createObj('attribute', {
                                characterid: cha_id,
                                name: name,
                                current: item});
        	                } else {
        	                    attr.set({current:item});
        	                }
        	            }
        	        }
    	        }
    	    }
	    }
	}
});
