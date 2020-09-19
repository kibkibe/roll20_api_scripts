/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 200917
	[ 소개 ]
	Roll20에서 채팅의 As를 손쉽게 임시로 오갈 수 있도록 도와주는 스크립트입니다.
	[ 설치법 ]
	1. roll20 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여넣고 [Save Script]를 눌러 저장합니다.
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.
	4. 세션방의 저널 탭에서 채팅에 사용할 npc를 드래그하여 화면에 토큰을 만듭니다.
	
	[ 테스트&사용법 ]
    	1. 채팅에 사용할 토큰을 클릭한 뒤 '!! (채팅내용)'의 형식으로 입력해서 해당 토큰의 캐릭터로 채팅이 잘 표시되는지 확인합니다.
	2. 토큰을 클릭하지 않은 채 '!! (채팅내용)'의 형식으로 입력했을 때 기본설정된 캐릭터로 채팅이 잘 표시되는지 확인합니다.
	
	[ 옵션 ]
	1. npc 토큰이 플레이어에게 보이는 것이 부담스러우시다면
	   투명한 토큰을 생성한 뒤 원하는 캐릭터와 연동하고 GM에게만 토큰의 이름이 보이게 하세요.
	2. 토큰을 선택하지 않고 명령어를 사용했을 때 기본적으로 표시될 캐릭터를 설정할 수 있습니다.
	   기본값은 "GM"이지만 KP, DM 등 룰에 맞게 진행자의 이름을 맞추거나 아예 특정 캐릭터를 지정하기를 원하신다면
	   37번째 줄의 코드를 주석을 참조해서 아래와 같이 변경하세요.
	   
	   var master_name = "원하는 이름";
	   
	   이 때 사용할 캐릭터는 저널에 등록되어 있어야 합니다.
	
*/
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!! ") === 0) {
        if (msg.selected && msg.selected.length > 0) {
	        var tok = getObj("graphic", msg.selected[0]._id);
	        sendChat("character|"+tok.get('represents'),msg.content.substring(3));
        } else {
            var master_name = "GM"; //토큰을 선택하지 않고 명령어를 사용했을 때 기본적으로 표시될 캐릭터의 이름을 기입해주세요.
            sendChat(msg.who,"/as " + master_name + " " + msg.content.substring(3));
            var gm = findObjs({ name: master_name, type: 'character'})[0];
            if (gm) {
	            sendChat("character|"+gm.get("_id"),msg.content.substring(3));
            } else {
	            sendChat("system","/w gm 선택된 토큰이 없고 이름이 '" + master_name + "'인 캐릭터가 저널에 없습니다.");
            }
        }
	}
}
});
