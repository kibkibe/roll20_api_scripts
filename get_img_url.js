/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 200312

	[ 소개 ]
	Roll20에서 ORPG를 진행할 때 토큰이나 배경 등에 적용된 이미지의 URL을 구해 오는 스크립트입니다.
	뭐어... 누군가는 필요할지도 모르죠.

	[ 사용법 ]
	1. roll20 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다. 
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다. 세션방에서 테스트를 진행할 수 있습니다.
    	4. 주소를 알아오고 싶은 토큰이나 객체를 마우스로 클릭하여 선택 후 채팅창에 '!주소'라고 입력합니다.
	5. 이미지 주소가 채팅창에 표시되는지를 확인합니다.
*/
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!주소") === 0) {
	    var tok = getObj("graphic", msg.selected[0]._id);
	    sendChat("system",tok.get('imgsrc'));
	}
}
});
