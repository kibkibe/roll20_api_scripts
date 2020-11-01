/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 201101

	[ 소개 ]
	Roll20에서 ORPG를 진행할 때 긴 나레이션을 한꺼번에 입력한 뒤
	시간차를 두고 한줄씩 출력되도록 도와주는 스크립트입니다.
	현재까지 내부에서 /desc, /as, /em, /emas, 이탤릭(*), 볼드(**), 볼드이탤릭(***), 코드(```) 기능이
	정상 작동됨을 확인하였습니다.

	[ 사용법 ]
	1. roll20 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다. 
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다. 세션방에서 테스트를 진행할 수 있습니다.
	4. 채팅창에 아래와 같은 형식으로 입력해 테스트를 해봅니다.
    
    	!낭독 {{
    	첫째줄
    	둘째줄
    	...
    	}}

   	[ 옵션 ]
	- 원하신다면 스크립트 내의 주석을 참고해 명령어를 변경하실 수 있습니다. 시작은 반드시 느낌표여야 합니다.
	- 원하신다면 스크립트 내의 주석을 참고해 표시 속도를 조절하실 수 있습니다.    
*/
// (narrator.js) *** 코드 시작 ***
on("chat:message", function(msg)
{
if (msg.type == "api"){
	if (msg.content.indexOf("!낭독") === 0) { //명령어를 변경하실 수 있습니다.
		try {
			var section = msg.content.replace("!낭독 ").replace("{{").replace("}}").replace('\"','"').split("<br/>\n");
			for (var i=1;i<section.length-1;i++) {
				if (section[i] && section[i].length > 0) {
					setTimeout(function(str) {
						var as = msg.who;
						if (str.indexOf("/desc") === 0) {
							as = "";
						} else if (str.indexOf("/as") === 0 || str.indexOf("/emas") === 0) {
							var arr = str.split('"');
							var cha = findObjs({_type: "character", name: arr[1]})[0];
							if (cha) {
								as = "character|" + cha.get('_id');
								log("as1: " + as);
							} else {
								as = arr[1];
							}
							if (str.indexOf("/emas") === 0) {
								str = "/em " + str.substring('/emas '.length + arr[1].length + 3);
							} else {
								str = str.substring('/as '.length + arr[1].length + 3);
							}
						}
						sendChat(as,""+str);
					}, (i-1)*3000,section[i]); //3000=3초, 시간은 원하시는 대로 수정하시면 됩니다.
				}
			}
		} catch (err) {
			sendChat('error','/w GM '+err,null,{noarchive:true});
		}
    }
}});
// (narrator.js) *** 코드 종료 ***