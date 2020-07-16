/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 200716
	
	[ 소개 ]
    
	마기카로기아 Roll20 캐릭터 시트의 장서 목록에 이름, 타입, 코스트, 효과, 주구 등의 항목을 채팅창 입력 한번으로 손쉽게 입력하는 기능입니다.
	
	[ 사용법 ]
	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다. 
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다. 세션방에서 테스트를 진행할 수 있습니다.
	4. 채팅창에 아래의 형식으로 입력해 테스트를 해봅니다.
	
	!장서 {{
	--이름1 --타입 --지정특기 --효과 --주구 --이미지주소
	--이름2 --타입 --지정특기 --효과 --주구 --이미지주소
	--이름3 --타입 --지정특기 --효과 --주구 --이미지주소
	}}
	
	[ 주의사항 ]
	'{{'과 '}}' 사이의 내용에 대괄호({})가 포함되면 에러가 발생합니다.
	본문 내에는 다른 형식의 괄호를 사용해주세요.
	
	[ 옵션 ]
	- 원하신다면 스크립트 내의 주석을 참고해 명령어를 변경하실 수 있습니다.
	- 채팅창에 명령어를 모두 입력하는 것이 불편하다면 매크로를 이용하시는 것도 추천합니다.
*/
on("chat:message", function(msg)
{
if (msg.type == "api"){
if (msg.content.indexOf("!장서 ") === 0) {
	    if (msg.selected) {
	        var tok = getObj("graphic", msg.selected[0]._id);
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
    }
});
