/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
    * 201101
    
	[ 소개 ]
	마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
	원형토큰을 이용해 주문의 저항판정 목표치를 계산해주는 스크립트입니다.
	
	[ 사용법 ]
	준비1. 스크립트 적용하기
	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다.
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.
	
	준비2. 매크로 적용하기
	1. 세션방에 들어가 새 매크로를 생성하고 아래의 명령어를 붙여넣기합니다.
	
		!저항 --@{target|token_name} --?{판정할 특기}
	
	2. 준비를 마쳤습니다. 원형을 토큰을 생성한 뒤 저항 매크로를 실행해서 목표치가 채팅창에 정상적으로 표시 되는지를 확인합니다.
	
	[주의사항]
	- 이 스크립트는 토큰의 이름을 통해 원형의 특기를 파악합니다.
	  'ㅁㅁ의 ㅁㅁ'과 같은 형식으로 이름 붙여지지 않은 토큰으로는 정확한 결과가 표시되지 않을 수 있습니다.
	- 같은 저장소에서 배포중인 magicalogia_summon.js과 함께 이용하시면 호환이 잘 됩니다.
	- 이 스크립트는 특기를 여럿 보유한 종령에는 대응하지 않습니다.
	
	[옵션]
	- 원하신다면 저항 매크로 바로 다음 줄에 2d6 명령어를 집어넣어 목표치 계산과 함께 바로 판정하도록 하셔도 좋습니다.
	  예) !저항 --@{target|token_name} --?{판정할 특기}
	      [[2d6]]
	
*/
// (magicalogia_resist.js) *** 코드 시작 ***
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!저항") === 0) { //명령어는 변경하셔도 됩니다. 시작은 무조건 느낌표.
        try {
            var table = [
                ['황금','대지','숲','길','바다','정적','비','폭풍','태양','천공','이계'],
                ['살','벌레','꽃','피','비늘','혼돈','이빨','외침','분노','날개','에로스'],
                ['중력','바람','흐름','물','파문','자유','충격','우레','불','빛','원환'],
                ['이야기','선율','눈물','이별','미소','마음','승리','사랑','정열','치유','시간'],
                ['추억','수수께끼','거짓','불안','잠','우연','환각','광기','기도','희망','미래'],
                ['심연','부패','배신','방황','나태','왜곡','불행','바보','악의','절망','죽음']
            ];
            var split = msg.content.split(' --');
            if (split.length < 3) { sendChat('error','/w GM 명령 형식이 올바르지 않습니다.',null,{noarchive:true}); return false; }
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
            if (target_x == -1 || target_y == -1 || arche_x == -1 || arche_y == -1) { sendChat('error','/w GM 원형 혹은 판정할 특기의 이름이 잘못되었습니다.',null,{noarchive:true}); return;}
            var res_target = 5 + Math.abs(target_x-arche_x)*2 + Math.abs(target_y-arche_y);
            if (target_x != arche_x) { res_target -= 1; }
            if (res_target > 12) { res_target = 12; }
            sendChat("","*<" + split[1] + ">*, **" + target + "**의 저항목표치: **[ " + res_target + " ]**");
            
        } catch (err) {
            sendChat('error','/w GM '+err,null,{noarchive:true});
        }
    }
}
});
// (magicalogia_resist.js) *** 코드 종료 ***