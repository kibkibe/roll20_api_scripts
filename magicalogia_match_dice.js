/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 201112

	[ 소개 ]
    
	마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
	스펠바운드에 플롯된 다이스를 집계한 뒤 공방판정 후 남은 다이스를 채팅창에 표시하는 기능입니다.

	[ 사용법 ]

	준비1. 다이스 덱 만들기
	1. roll20 세션방에서 공격-방어에 사용하는 다이스를 Card 덱으로 생성하고 덱의 이름을 Dice로 지정합니다.
	2. 주사위 눈에 맞게 Card를 생성하고 이름을 눈에 맞는 숫자로 설정합니다. 일반적으로는 1~6번과 집중방어(0번)을 포함하여 0~6이 되며,
	   이 스크립트로 랜덤플롯을 이용하고 싶으시다면 이름을 '?'(물음표)로 갖는 Card를 추가로 1개 만들어주세요.
	3. 완성입니다. 플레이어와 GM은 화면에 다이스를 플롯할 때 이 덱을 사용합니다.
	   또한 스크립트는 덱에 입력한 눈의 숫자를 바탕으로 화면에 놓인 주사위의 눈을 파악할 것입니다.

	준비2. 플롯 영역 설정하기
	1. roll20 세션방의 전투맵 페이지를 엽니다.
	2. 임의의 사각형 모양의 토큰을 생성한 뒤 주사위를 플롯하는 좌표에 맞게 사이즈와 위치를 조절해 배치합니다.
	   (위치는 맵 레이어가 가장 적당합니다. 투명한 png 파일을 사용하시는 것도 추천합니다.)
	3. 1팀 대표(일반적으로 PC 마법전 대표)의 플롯영역을 덮는 토큰의 이름을 A_delegate로 설정합니다.
	4. 2팀 대표(일반적으로 에너미)의 플롯영역을 덮는 토큰의 이름을 B_delegate로 설정합니다.
	5. 1팀 입회인(일반적으로 PC 입회인)의 플롯영역을 덮는 토큰의 이름을 A_observer로 설정합니다.
	6. 2팀 입회인(일반적으로 잘 쓰이지 않으나 에너미 혹은 pvp상대의 입회인) 영역은 B_observer로 설정합니다.
	7. 스펠바운드의 배열상 한 사각형 안에 플롯영역이 모두 담기지 않을 경우
	   같은 이름을 공통으로 쓰는 사각형을 필요한 만큼 여럿 만드시면 됩니다.
	8. 완성입니다. 이제 스크립트에서는 각 주사위들이 어느 사각형 위에 있는가를 보고 진영과 입회여부 등을 파악하게 됩니다.

	준비3. 스크립트 적용하기
	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓고 [Save Script]로 저장합니다. 
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다. 세션방에서 테스트를 진행할 수 있습니다.
	4. 설정한 스펠바운드에 맞게 주사위를 플롯한 뒤 채팅창에 '!match_dice'의 형식으로 입력해 테스트를 해봅니다.
	
	[ 옵션 ]
	- 원하신다면 스크립트 내의 주석을 참고해 명령어를 변경하실 수 있습니다.
	- 채팅창에 명령어를 모두 입력하는 것이 불편하다면 매크로를 이용하시는 것도 추천합니다.
	- '!match_dice flip'과 같이 명령어에 'flip'을 추가하시면 뒷면이 보이도록 놓인 카드도 앞면으로 뒤집은 후에 매칭합니다. 
*/
// (magicalogia_match_dice.js) *** 코드 시작 ***
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("!match_dice") === 0) {
        try {
            var deck = findObjs({ _type: 'deck', name: 'Dice'})[0];
            if (!deck) {
                sendChat("matchDice", "/w gm Dice 덱이 Card에 없습니다.");
                return false;
            }
            var objects = findObjs({ _subtype: 'card', layer: 'objects' });
            var areas = [];
            if (findObjs({ name: 'A_delegate'}).length > 0) {
                areas.push(findObjs({ name: 'A_delegate'}));
            } else { sendChat("matchDice", "/w gm A_delegate 영역이  없습니다."); return false; }
            if (findObjs({ name: 'A_observer'}).length > 0) {
                areas.push(findObjs({ name: 'A_observer'}));
            } else { sendChat("matchDice", "/w gm A_observer 영역이  없습니다."); return false; }
            if (findObjs({ name: 'B_delegate'}).length > 0) {
                areas.push(findObjs({ name: 'B_delegate'}));
            } else { sendChat("matchDice", "/w gm B_delegate 영역이  없습니다."); return false; }
            if (findObjs({ name: 'B_observer'}).length > 0) {
                areas.push(findObjs({ name: 'B_observer'}));
            } else { sendChat("matchDice", "/w gm B_observer 영역이  없습니다."); return false; }
            var concentrateIdx = -1;
            var dice = [[],[],[],[]];
            var flip = msg.content.includes('flip');

            for (var i=0;i<objects.length;i++) {
                var obj = objects[i];
                var model = findObjs({ _type: "card", _deckid: deck.get('_id'), _id:obj.get('_cardid')})[0];
                
                if (model) {
                    var dname = model.get('name');
                    log(obj);
                    if (dname === "?") {
                        dname = "" + Math.floor( Math.random() * 6 + 1 );
                        var new_model = findObjs({ _type: "card", _deckid: deck.get('_id'), name: dname})[0];
                        log(new_model);
                        obj.set('imgsrc',new_model.get('avatar').replace('max','thumb').replace('med','thumb'));
                    } else if (flip && obj.get('currentSide')===1) {
                        var img = obj.get('sides').split('|')[0].replace('%3A',':').replace('%3F','?').replace('max','thumb').replace('med','thumb');
                        obj.set({currentSide:0,imgsrc:img});
                    }
                    obj.set('name', dname);
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
                                if (obj.get('name') === '0') {
                                    concentrateIdx = z;
                                }
                                dice[z].push(obj);
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
            
        for (var s=0;s<dice.length;s++) {
            
            dice[s].sort(function (a, b) { 
                return a.get('name') < b.get('name') ? -1 : a.get('name') > b.get('name') ? 1 : 0;
            });
        }
        
        var match_dice = function(dice1,dice2,concentrateIdx) {
            
            for (var i=0;i<dice1.length;i++) {
                for (var j=0;j<dice2.length;j++) {
                    if (dice1[i].get('name') === '0') {
                        dice1[i].set('name',dice1[i].get('name')+'!');
                        break;
                    } else if (dice2[j].get('name') === '0') {
                        dice2[j].set('name',dice2[j].get('name')+'!');
                    } else if (dice1[i].get('name')===dice2[j].get('name') && !dice1[i].get('name').includes('!') && !dice2[j].get('name').includes('!')) {
                        if (concentrateIdx != 0) {
                        dice1[i].set('name',dice1[i].get('name')+'!');
                        }
                        if (concentrateIdx != 2) {
                        dice2[j].set('name',dice2[j].get('name')+'!');
                        }
                    }
                }
            }
        }
            
        match_dice(dice[0],dice[2],concentrateIdx); //d1 vs d2
        match_dice(dice[0],dice[3],concentrateIdx!=0?-1:0) //d1 vs o2
        match_dice(dice[2],dice[1],concentrateIdx!=2?-1:0) //d2 vs o1
        match_dice(dice[1],dice[3],-1) //o1 vs o2
        
        var style_delegate = "width:40px;height:40px;";
        var style_observer = "width:30px;height:30px;";
        var style_broken = "opacity:0.3;";
        
        var result = "";
        
        for (var i=0;i<4;i++) {
            if (dice[i].length > 0) {
                result += "<div>";
                result += (i%2==0 ? "" : "+");
                dice[i].forEach(die => {
                    result += "<img src='" + die.get('imgsrc') + "' style='";
                    result += (i%2==0 ? style_delegate :  style_observer);
                    result += (die.get('name').includes('!') ? style_broken : "") +"'>";
                });
                result += "</div>";
            }
            result += (i==1? "<div style='margin:10px 0px 10px 0px;'>vs</div>":"");
        }
        
        sendChat("",result);

    } catch (err) {
        sendChat('error','/w GM '+err,null,{noarchive:true});
    }
}}});
// (magicalogia_match_dice.js) *** 코드 종료 ***