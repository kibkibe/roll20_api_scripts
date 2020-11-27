/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 201127

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
    
		!... 첫째줄
		!... 둘째줄
		!... 셋째줄

	5. 아래는 추가적인 명령어입니다. 살행중인 나레이션을 제어할 수 있습니다.
	
		!,		일시정지/재시작
		!/		취소 (나레이션을 취소하고 대기열의 대사들을 모두 삭제합니다.)
		
   	[ 옵션 ]
	- 원하신다면 스크립트 내의 주석을 참고해 명령어를 변경하실 수 있습니다. 시작은 반드시 느낌표여야 합니다.
	- 원하신다면 스크립트 내의 주석을 참고해 표시 속도를 조절하실 수 있습니다.    
*/
// (narrator.js) *** 코드 시작 ***
on('ready', function() {
    if (!state.narration) {
        state.narration = [];
    }
    if (!state.is_narrating) {
        state.is_narrating = 1; //0: 초기화 이전 1: 정지상태 2: 낭독중 3: 일시정지
    }
});

function narrate() {
	
	// (옵션) 대화를 표시하는 시간 간격을 조절합니다. 밀리초 단위로서 1000 = 1초입니다.
	let interval = 3000;

	try {
    	if (state.is_narrating == 2 && state.narration.length > 0) {
    		sendChat(state.narration[0].as,state.narration[0].msg);
    		state.narration.splice(0,1);
    		if (state.narration.length > 0) {
    			setTimeout(narrate, interval);
    		} else {
    			state.is_narrating = 1;
    		}
    	} else {
    		state.is_narrating = 1;
    	}
	} catch (err) {
		sendChat('error','/w GM '+err,null,{noarchive:true});
	}
}
on("chat:message", function(msg)
{
if (msg.type == "api"){
	if (msg.content == "!,") { //일시정지/재시작
		if (state.is_narrating == 2) {
			state.is_narrating = 1;
		} else {
			state.is_narrating = 2;
			narrate();
		}
	} else if (msg.content == "!/") { //취소
	
		try {
    	    state.narration = [];
    	    state.is_narrating = 1;
		} catch (err) {
			sendChat('error','/w GM '+err,null,{noarchive:true});
		}
	    
	} else if (msg.content.indexOf("!... ") === 0) { //명령어를 변경하실 수 있습니다.
		try {
			var str = msg.content.replace("!... ","");
			var as_who;

			if (str.indexOf("/desc") === 0) {
				as_who = '';
			} else if (str.indexOf("/as") === 0 || str.indexOf("/emas") === 0) {
				var arr = str.split('"');
				var cha = findObjs({_type: "character", name: arr[1]})[0];
				if (cha) {
					as_who = "character|" + cha.get('_id');
				} else {
					as_who = arr[1];
				}
				if (str.indexOf("/emas") === 0) {
					str = "/em " + str.substring('/emas '.length + arr[1].length + 3);
				} else {
					str = str.substring('/as '.length + arr[1].length + 3);
				}
			} else {
			    as_who = findObjs({_type: "character", name: msg.who.replace(' (GM)','')});
			    if (as_who.length > 0) {
			        as_who = "character|" + as_who[0].get('_id');
			    } else {
			        as_who = findObjs({_type: "player", _displayname: msg.who.replace(' (GM)','')});
    			    if (as_who.length > 0) {
    			        as_who = "player|" + as_who[0].get('_id');
    			    } else {
    			        as_who = msg.who;
    			    }
			    }
			}

			state.narration.push({as: as_who, msg: str});
			
			if (state.is_narrating == 1) {
			    state.is_narrating = 2;
			    setTimeout(narrate, 500);
			}

		} catch (err) {
			sendChat('error','/w GM '+err,null,{noarchive:true});
		}
    }
}});
// (narrator.js) *** 코드 종료 ***