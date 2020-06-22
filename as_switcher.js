/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 200622

	[ 소개 ]
	Roll20에서 채팅의 As를 손쉽게 임시로 오갈 수 있도록 도와주는 스크립트입니다.

	[ 설치법 ]
	1. roll20 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다. 
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.
	4. 세션방의 저널 탭에서 채팅에 사용할 npc를 드래그하여 화면에 토큰을 만듭니다.
	
	[ 테스트&사용법 ]
    	1. 채팅에 사용할 토큰을 클릭한 뒤 '!! (채팅내용)'의 형식으로 입력해서
	   해당 토큰의 캐릭터로 채팅이 잘 표시되는지 확인합니다.
	
	[ 옵션 ]
	1. npc 토큰이 플레이어에게 보이는 것이 부담스러우시다면 GM에게만 토큰의 이름을 보이게 한 뒤
	   이 페이지에서 배포하는 get_set_img_url.js를 사용해서 투명한 png로 바꾸시는 것을 추천합니다.
	
*/
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!! ") === 0) {
	    var tok = getObj("graphic", msg.selected[0]._id);
	    sendChat("character|"+tok.get('represents'),msg.content.substring(3));
	}
}
});
