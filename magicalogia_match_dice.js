/* 설치법: https://github.com/kibkibe/roll20_api_scripts/wiki/%5B%EC%84%A4%EC%B9%98%EB%B2%95%5D-magicalogia_match_dice.js */
/* (magicalogia_match_dice.js) 201211 코드 시작 */
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
            } else { sendChat("matchDice", "/w gm A_delegate 영역이 없습니다."); return false; }
            if (findObjs({ name: 'A_observer'}).length > 0) {
                areas.push(findObjs({ name: 'A_observer'}));
            } else { sendChat("matchDice", "/w gm A_observer 영역이 없습니다."); return false; }
            if (findObjs({ name: 'B_delegate'}).length > 0) {
                areas.push(findObjs({ name: 'B_delegate'}));
            } else { sendChat("matchDice", "/w gm B_delegate 영역이 없습니다."); return false; }
            if (findObjs({ name: 'B_observer'}).length > 0) {
                areas.push(findObjs({ name: 'B_observer'}));
            } else { sendChat("matchDice", "/w gm B_observer 영역이 없습니다."); return false; }
            var concentrateIdx = -1;
            var dice = [[],[],[],[]];
            var flip = msg.content.includes('flip');

            for (var i=0;i<objects.length;i++) {
                var obj = objects[i];
                var model = findObjs({ _type: "card", _deckid: deck.get('_id'), _id:obj.get('_cardid')})[0];
                
                if (model) {
                    var dname = model.get('name');
                    if (flip && obj.get('currentSide')===1) {
                        var img = obj.get('sides').split('|')[0].replace('%3A',':').replace('%3F','?').replace('max','thumb').replace('med','thumb');
                        obj.set({currentSide:0,imgsrc:img});
                    }
                    if (dname === "?" && obj.get('name') == "" && obj.get('currentSide')===0) {
                        dname = "" + Math.floor( Math.random() * 6 + 1 );
                        var new_model = findObjs({ _type: "card", _deckid: deck.get('_id'), name: dname})[0];
                        obj.set("imgsrc",new_model.get('avatar').replace('max','thumb').replace('med','thumb'));
                    } 
                    if (obj.get('currentSide')===0) {
                        if (dname != "?") {
                            obj.set('name', dname);
                        }
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
        }

        if (dice[0].length < 1 && dice[3].length < 1) {
            sendChat('error','/w GM 대표 플롯 영역 내에 공개된 다이스가 없습니다.',null,{noarchive:true});
            return;
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
/* (magicalogia_match_dice.js) 201211 코드 종료 */