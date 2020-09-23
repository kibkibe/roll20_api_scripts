/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 200923
	[ 소개 ]
	마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
	
	[ 사용법 ]
	준비1. 원형 덱 만들기 & 이름 설정
	1. 세션방에서 소환에 사용할 원형들을 Card 덱으로 만듭니다.
	2. 카드들의 이름을 '정령','마검'등 원형의 이름으로 설정하고 덱의 이름은 'archetype'으로 지정합니다.
	   이제 스크립트는 archetype 덱을 원형 타입의 저장소로 인식하고 여기에서 아이콘을 불러옵니다.
	3. 원형이 소환될 페이지의 이름을 'spellbound'로 지정합니다.
	   이제 스크립트는 spellbound 페이지를 마법전을 진행하는 페이지로 인식하고 원형을 생성합니다.
	   
	준비2. 스크립트 적용하기
	1. roll20 세션방에서 원형을 사용할 페이지에서 GM레이어를 선택합니다.
	2. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	3. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다.
	4. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다. 세션방에서 테스트를 진행할 수 있습니다.
	5. 채팅창에 '!소환 <특기명>의 <원형타입> <블록숫자>'의 형식으로 입력해 테스트를 해봅니다. (예: !소환 정적의 정령 2 )
	
	[ 옵션 ]
	- 원하신다면 스크립트 내의 주석을 참고해 토큰의 위치나 크기, 이름 표시여부를 변경하실 수 있습니다.
	- 채팅창에 명령어를 모두 입력하는 것이 불편하다면 매크로를 이용하시는 것도 좋습니다.
	  아래의 코드로 매크로를 생성한 뒤 실행하면 원형이름과 블록숫자를 입력하는 팝업이 표시됩니다.
	  !소환 ?{원형이름} ?{블록}
	  매크로를 사용할 것인지 채팅창에 바로 입력할 것인지는 사용자가 편의에 따라 선택하면 됩니다.
*/
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!저항") === 0) { //명령어는 변경하셔도 됩니다. 시작은 무조건 느낌표.
        var table = [
            ['황금','대지','숲','길','바다','정적','비','폭풍','태양','천공','이계'],
            ['살','벌레','꽃','피','비늘','혼돈','이빨','외침','분노','날개','에로스'],
            ['중력','바람','흐름','물','파문','자유','충격','우레','불','빛','원환'],
            ['이야기','선율','눈물','이별','미소','마음','승리','사랑','정열','치유','시간'],
            ['추억','수수께끼','거짓','불안','잠','우연','환각','광기','기도','희망','미래'],
            ['심연','부패','배신','방황','나태','왜곡','불행','바보','악의','절망','죽음']
        ];
        var split = msg.content.split(' --');
        if (split.length < 3) { log('noname'); return false; }
        var name = split[1].split(' ')[0].substring(0, split[1].split(' ')[0].length-1);
        var target = split[2];
        var target_x=-1;
        var target_y=-1;
        var arche_x=-1;
        var arche_y=-1;
        for (var i=0;i<table.length;i++) {
            for (var j=0;j<table[i].length;j++) {
                if (table[i][j] === target) {
                    target_x = i;
                    target_y = j;
                }
                if (table[i][j] === name) {
                    arche_x = i;
                    arche_y = j;
                }
            }
        }
        if (target_x == -1 || target_y == -1 || arche_x == -1 || arche_y == -1) { log('no item'); return false; }
        var res_target = 5 + Math.abs(target_x-arche_x)*2 + Math.abs(target_y-arche_y);
        if (target_x != arche_x) { res_target -= 1; }
        if (res_target > 12) { res_target = 12; }
        sendChat("","*<" + split[1] + ">*, **" + target + "**의 저항목표치: **[ " + res_target + " ]**");
    }
}
});
