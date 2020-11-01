/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 201101
    
	[ 소개 ]
  	저널에서 캐릭터의 장서 설정을 읽어와 자동으로 마소차지용 토큰을 생성해주는 스크립트입니다.
  	TokenMod를 이용해 마소의 차지-소비를 기록하는 플레이 세팅을 간단하게 구성할 수 있도록 도와줍니다.

	[ 사용법 ]
  
  	준비1. 스크립트 적용
  	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
  	2. New Script에 아래의 코드들을 복사해 붙여놓습니다.
  	3. 코드 내의 주석을 참조해서 옵션을 설정합니다.
  	4. [Save Script]로 저장합니다.
  	5. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.

  	준비2. 테스트
      1. 아래의 형식으로 채팅창에 입력해서 임시메시지가 출력되는지 확인합니다.
      
         !? 할말
         
  	2. 채팅로그를 확인해서 임시메시지가 남지 않고 삭제되었는지 확인합니다.
  	    (임시메시지라도 가장 최신 채팅이라면 채팅로그에서 보입니다. 다른 채팅이 올라오면 임시메시지는 사라집니다.)

*/
// (temporary_chat.js) *** 코드 시작 ***
on("chat:message", function(msg){
    if (msg.type == "api"){
        if (msg.content.indexOf("!? ") === 0) {
            //show_player_name을 true로 설정하시면 플레이어 As로, false로 설정하시면 선택되어 있는 As를 유지한 채 임시채팅을 합니다.
            let show_player_name = true;
            //임시메시지에 적용할 스타일을 지정합니다.
            let style = "font-size:0.9em;";
            try {
                sendChat((show_player_name? "player|"+msg.playerid : msg.who),"<span style='" + style + "'>"+msg.content.substring(3, msg.content.length)+"</span>",null,{noarchive:true});
            } catch (error) {
                sendChat('error','/w GM '+err,null,{noarchive:true});
            }
        }
    }
});
// (temporary_chat.js) *** 코드 종료 ***