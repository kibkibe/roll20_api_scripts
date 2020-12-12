/* 설치법: https://github.com/kibkibe/roll20_api_scripts/wiki/%5B%EC%84%A4%EC%B9%98%EB%B2%95%5D-magicalogia_battle_turn.js */
/* (magicalogia_battle_turn.js) 201101 코드 시작 */
on("change:graphic", function(obj, prev) {
    try {
        if (obj.get('top') === prev.top && obj.get('left') === prev.left) return;
        if (obj.get('name') == 'turn_marker') {
            var areas = [];
            // option1.
            // 영역을 지정하기 위해 배치한 토큰들의 이름을 입력합니다. 
            var names = ['라운드개시','선공소환','후공소환','선공공격','후공공격'];
            
            for (var i=0;i<names.length;i++) {
                if (findObjs({ name: names[i]}).length > 0) {
                    areas.push(findObjs({ name: names[i]})[0]);
                } else { sendChat("turnover", "/w gm "+ names[i] + " 영역이 없습니다."); return; }
            }
            
            var turn = -1;
            var left = obj.get('left');
            var top = obj.get('top');
            var width = obj.get('width');
            var height = obj.get('height');
            
            for (var z=0;z<areas.length;z++) {
                var area = areas[z];
                if (area.get('left')-area.get('width')/2<=left-width/2 &&
                    area.get('top')-area.get('height')/2<=top-height/2 &&
                    area.get('top')+area.get('height')/2 >= top+height/2 &&
                    area.get('left')+area.get('width')/2 >= left+width/2) {
                        turn = z;
                        break;
                }
            }
            
            if (turn != -1) {
                
                var round = obj.get('bar1_value');
                var text;
                // option2.
                // 메시지의 출력 형식을 기입합니다.
                // 실제 채팅창에서 {round}는 현재 라운드 숫자로, {text}는 마커의 위치에 따른 텍스트(option3에서 설정)로 변환됩니다.
                var format = "/desc Round{round}. {text}";
                switch (turn) {
                    // option3.
                    // 선후/턴에 따라 표시될 메시지를 지정합니다.
                    case 0: text = "라운드 개시"; break;
                    case 1: text = "선공 소환"; break;
                    case 2: text = "후공 소환"; break;
                    case 3: text = "선공 공격"; break;
                    case 4: text = "후공 공격"; obj.set('bar1_value', Number(obj.get('bar1_value')) + 1); break;
                    default: sendChat("turnover", "/w gm " + z + "번째 영역이 없습니다. 배치 혹은 토큰이름 설정을 확인하세요."); return;
                }
                sendChat("", format.replace('{round}',round).replace('{text}',text));
            }
        }
    } catch(err){
        sendchat("error","/w gm "+err,null,{noarchive:true});
    }
});
/* (magicalogia_battle_turn.js) 201101 코드 종료 */
