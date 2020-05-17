/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
    * 200517
    
    [ 소개 ]
    
	마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
    스펠바운드에 플롯된 다이스를 집계한 뒤 공방판정 후 남은 다이스를 채팅창에 표시하는 기능입니다.

    [ 사용법 ]

    준비1. 샘플 다이스 만들기
	1. roll20 세션방의 전투맵 페이지에서 GM레이어를 선택합니다.
	2. 세션에서 사용할 다이스를 GM레이어 위에 플롯합니다. 일반적으로는 1~6번과 집중방어(0번)을 포함하여 총 7개가 됩니다.
    3. 각각의 다이스의 이름을 주사위 눈에 맞는 숫자로 설정합니다. (0~6)
    4. 완성입니다. 이제 스크립트에서는 여기에 생성된 샘플 다이스를 바탕으로 주사위 눈을 파악하게 됩니다.
        실제 게임에서는 이 샘플들을 조작하지 않으므로 적당히 보이지 않는 곳에 몰아두면 됩니다.

    준비2. 플롯 영역 설정하기
    1. roll20 세션방의 전투맵 페이지에서 맵 레이어를 선택합니다.
    2. 임의의 사각형 모양의 토큰을 생성한 뒤 주사위를 플롯하는 좌표에 맞게 사이즈와 위치를 조절해 배치합니다.
        (투명한 png 파일을 사용하시는 것도 추천합니다.)
    3. 1팀 대표(일반적으로 PC 마법전 대표)의 플롯영역을 덮는 토큰의 이름을 A_delegate로 설정합니다.
    4. 2팀 대표(일반적으로 에너미)의 플롯영역을 덮는 토큰의 이름을 B_delegate로 설정합니다.
    5. 1팀 입회인(일반적으로 PC 입회인)의 플롯영역을 덮는 토큰의 이름을 A_observer로 설정합니다.
    6. 2팀 입회인(일반적으로 잘 쓰이지 않으나 에너미 혹은 pvp상대의 입회인) 영역은 B_observer로 설정합니다.
    7. 스펠바운드의 배열상 한 사각형 안에 입회인 플롯영역이 모두 담기지 않을 경우
        A_observer(혹은 B_observer)라는 이름을 공통으로 쓰는 사각형을 필요한 만큼 여럿 만드시면 됩니다.
    8. 완성입니다. 이제 스크립트에서는 각 주사위들이 어느 사각형 위에 있는가를 보고 진영과 입회여부 등을 파악하게 됩니다.

    준비3. 스크립트 적용하기
	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다. 
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다. 세션방에서 테스트를 진행할 수 있습니다.
    4. 설정한 스펠바운드에 맞게 주사위를 플롯한 뒤 채팅창에 '!march_dice'의 형식으로 입력해 테스트를 해봅니다.
    
	[ 옵션 ]
    - 원하신다면 스크립트 내의 주석을 참고해 명령어를 변경하실 수 있습니다.
	- 채팅창에 명령어를 모두 입력하는 것이 불편하다면 매크로를 이용하시는 것도 추천합니다.
*/
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!match_dice") === 0) { //명령어를 변경하실 수 있습니다.
        var objects = findObjs({ _subtype: 'card', layer: 'objects' });
        var models = findObjs({ _subtype: 'card', layer: 'gmlayer' });
        var areas = [];
        areas.push(findObjs({ name: 'A_delegate', layer: 'map'}));
        areas.push(findObjs({ name: 'B_delegate', layer: 'map'}));
        areas.push(findObjs({ name: 'A_observer', layer: 'map'}));
        areas.push(findObjs({ name: 'B_observer', layer: 'map'}));
        for (var k=models.length==0?0:models.length-1;k>=0;k--) {
            if (models[k].get('name').length > 1) {
                models.splice(k, 1);
            }
        }
        var dice = [[],[],[],[]];
	    for (var i=objects.length==0?0:objects.length-1;i>=0;i--) {
	        var obj = objects[i];
	        for (var j=0;j<models.length;j++) {
	            if (obj.get('_cardid')==models[j].get('_cardid')) {
	                obj.set('name',models[j].get('name'));
	                break;
	            }
	        }
	        if (obj.get('name').length === 1) {
	            var left = obj.get('left')+0;
	            var top = obj.get('top')+0;
	            var width = obj.get('width')+0;
	            var height = obj.get('height')+0;
	            var stop = false;
	            for (var z=0;z<areas.length;z++) {
	                for(var x=0;x<areas[z].length;x++) {
	                    var area = areas[z][x];
	                    if (area.get('left')-area.get('width')/2<=left-width/2 &&
	                    area.get('top')-area.get('height')/2<=top-height/2 &&
	                    area.get('top')+area.get('height')/2 >= top+height/2 &&
	                    area.get('left')+area.get('width')/2 >= left+width/2) {
	                        dice[z].push(obj.get('name'));
	                        stop = true;
	                        break;
	                    }
	                }
	                if (stop) {
	                    break;
	                }
	            }
            }
	    }
	    var concentrateIdx = -1;
        
        for (var s=0;s<dice.length;s++) {
            dice[s].sort();
            if (dice[s].join('').includes('0')) {
                concentrateIdx = s;
            }
        }
	    
	    match_dice(dice[0],dice[1],concentrateIdx); //d1 vs d2
	    match_dice(dice[0],dice[3],concentrateIdx!=0?-1:0) //d1 vs o2
	    match_dice(dice[1],dice[2],concentrateIdx!=1?-1:0) //d2 vs o1
	    
	    var style_common = "display:inline-table;border-radius:4px;margin:1px;";
	    var style_delegate = "width:25px;height:25px;font-size:1.2em;font-weight:bold;";
        var style_observer = "width:20px;height:20px;font-size:0.8em;";
        var style_unbroken = "background:#ffffff;color:#222222;border:1px solid #888888;";
        var style_broken = "background:#f9f9f9;color:#dddddd;border:1px solid #dddddd;";
        var style_middle = "<div style='display:table-cell;vertical-align:middle;text-align:center;'>";
        
	    var result = "<div style='left:0px;right:0px;padding:0px;'>";
        if (dice[0].length > 0) {
            dice[0].forEach(die => {
                result += "<div style='" + style_common + style_delegate + (die.includes('!') ? style_broken : style_unbroken) + "'>"
                + style_middle + die.substring(0,1) +"</div></div>";
            });
        }
        if (dice[2].length > 0) {
            result += "<div style='margin-top:10px;'><div style='" + style_common + style_observer + "'>" + style_middle + "+</div></div>";
            dice[2].forEach(die => {
                result += "<div style='" + style_common + style_observer + (die.includes('!') ? style_broken : style_unbroken) + "'>"
                + style_middle + die.substring(0,1) +"</div></div>";
            });
            result += "</div>";
        }
        result += "<div style='margin:10px 0px 10px 0px;'>vs</div>";

        if (dice[1].length > 0) {
            dice[1].forEach(die => {
                result += "<div style='" + style_common + style_delegate + (die.includes('!') ? style_broken : style_unbroken) + "'>"
                + style_middle + die.substring(0,1) +"</div></div>";
            });
        }
        
        if (dice[3].length > 0) {
            result += "<div style='margin-top:10px;'><div style='" + style_common + style_observer + "'>" + style_middle + "+</div></div>";
            dice[3].forEach(die => {
                result += "<div style='" + style_common + style_observer + (die.includes('!') ? style_broken : style_unbroken) + "'>"
                + style_middle + die.substring(0,1) +"</div></div>";
            });
            result += "</div>";
        }
        result += "</div>";
	    
	    sendChat("",result);
	}
}
});
function match_dice(dice1,dice2,concentrateIdx) {
            
    for (var i=dice1.length==0?0:dice1.length-1;i>=0;i--) {
        for (var j=dice2.length==0?0:dice2.length-1;j>=0;j--) {
            if (dice1[i] === '0') {
                dice1[i] += "!";
                break;
            } else if (dice2[j] === '0') {
                dice2[j] += "!";
            } else if (dice1[i]===dice2[j] && !dice1[i].includes('!') && !dice2[j].includes('!')) {
                if (concentrateIdx != 0) {
                    dice1[i] += "!";
                }
                if (concentrateIdx != 1) {
                    dice2[j] += "!";
                }
            }
        }
    }
}