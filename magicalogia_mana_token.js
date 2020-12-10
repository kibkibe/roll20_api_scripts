/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 
    
	[ 소개 ]
  	저널에서 캐릭터의 장서 설정을 읽어와 자동으로 마소차지용 토큰을 생성해주는 스크립트입니다.
    토큰의 아이콘이나 게이지를 통해 마소의 충전상태를 확인할 수 있으며, 토큰에서 바로 충전값을 변경할 수도 있습니다. 
    TokenMod와 함께 사용할 수 있습니다.

	[ 사용법 ]
  
  	준비1. 스크립트 적용
  	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
  	2. New Script에 아래의 코드들을 복사해 붙여놓습니다.
  	3. 코드 내의 주석을 참조해서 옵션을 설정합니다.
  	4. [Save Script]로 저장합니다. 
  	5. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.

  	준비2. Rollable Table에 마소 아이템 생성
  	0. 이 단계는 기존에 마소 차지-소비 세팅을 사용하셨다면 생략할 수 있습니다.
  	단, Rollable Table와 테이블 안의 아이템들의 이름만 아래 조건에 맞춰서 설정해주세요.
      
    옵션1. 각 영역별로 마소가 차지된 개수마다 이미지를 따로 사용할 경우
    1-1. 각 영역의 이름별로 Rollable Table을 생성합니다.
         별,짐승,힘,노래,꿈,어둠,전체의 기본 7종이 필요하며 원하시면 그 외의 속성을 추가하실 수 있습니다.
         (이름은 '별'이라고 단어 하나만 사용해주세요. '1.별','(마소토큰)별'과 같은 형식이면 인식하지 못합니다.)
    1-2. 생성한 Rollable Table에 마소 차지 개수를 보여주는 아이콘을 등록합니다.
    1-3. 각 아이콘의 이름을 표시 마소 개수에 맞춰 설정해주세요. 마소 2개가 충전된 상태를 표시하는 아이콘이라면 '2'라고 입력합니다.
         이 때 0부터 낮은 숫자 순으로 위부터 표시되도록 생성합니다.
      
    옵션2. 영역별로 마소속성을 보여주는 이미지 1개씩만 사용할 경우
    2-1. '마소'라는 이름의 Rollable Table을 생성합니다.
    2-2. 마소 Rollable Table에 각 영역의 이름별로 아이템을 생성합니다.
         별,짐승,힘,노래,꿈,어둠,전체의 기본 7종이 필요하며 원하시면 그 외의 속성을 추가하실 수 있습니다.
         (이름은 '별'이라고 단어 하나만 사용해주세요. '1.별','(마소토큰)별'과 같은 형식이면 인식하지 못합니다.)

  	준비3. 테스트
  	1. 아래의 형식으로 채팅창에 입력해서 정상적으로 토큰이 생성되는지 확인합니다.
	     !장서토큰 --캐릭터명
	2. 생성된 토큰을 클릭하고 마소차지-소비 매크로를 사용해 정상적으로 동작하는지 확인합니다.
*/
// (magicalogia_mana_token.js) *** 201210 *** 코드 시작 ***
let charge_check = [
    {attr: "Magic_*id*_Charge", is_static_attr: false},
    {attr: "repeating_acitems_-*id*_Magic_Charge", is_static_attr: false}];
on('ready', function() {
    on("add:attribute", function(obj) {
        check_charge(obj, null);
    });
});
    
on("change:attribute", function(obj, prev) {
    check_charge(obj, prev);
});

function check_charge(obj,prev) {
    try {
        for (var i=0;i<charge_check.length;i++) {
            var check = false;
            var item = charge_check[i];
            let item_id = null;
            if (prev == null || obj.get('current') != prev.current) {
                if (item.attr == obj.get('name')) {
                    check = true;
                } else if (!item.is_static_attr) {
                    let split_attr = item.attr.split('*id*');
                    if (split_attr.length == 2 && obj.get('name').startsWith(split_attr[0]) && obj.get('name').endsWith(split_attr[1])) {
                        check = true;
                        item_id = obj.get('name').replace(split_attr[0],'').replace(split_attr[1],'');
                    }
                }
            }
            if (check) {
                var tokens = findObjs({_type: 'graphic', _subtype: 'token', layer: 'objects', _pageid: Campaign().get("playerpageid"),
                represents: prev._characterid, bar1_link: prev._id});
                if (tokens.length == 0) {
                    sendChat("error","/w gm ",null,{noarchive:true});
                    return;
                }
                for (var j=0;j<tokens.length;j++) {
                    let token = tokens[j];
                    if (token.get('gmnotes') != 'static' && token.get('bar1_link') == prev._id) {
                        if (parseInt(obj.get('current')) >= token.get('sides').split('|').length) {
                            sendChat("error","/w gm " + obj.get('current') + "개의 마소를 표시할 수 있는 아이콘이 없습니다.",null,{noarchive:true});
                            return;
                        } else {
                            token.set({imgsrc: unescape(token.get('sides').split('|')[parseInt(obj.get('current'))].replace('max','thumb').replace('med','thumb'))});
                        }
                        break;
                    }
                }
                break;
            }
        }
    } catch (err) {
        sendChat("error","/w gm " + err,null,{noarchive:true});
    }
}

on("chat:message", function(msg){
    if (msg.type == "api"){
    if (msg.content.indexOf("!장서토큰") === 0) {
        
        //사용할 마소 속성 리스트를 지정합니다.
        let area_list = ['별','짐승','힘','노래','꿈','어둠','전체'];
        //영역별로 속성을 나타내는 아이콘 하나만 사용하는지(true) 마소 개수에 따라 여러개 사용하는지(false)를 지정합니다.
        let use_single_icon = false;
        //장서의 아이콘이 한 아이콘으로 고정되는지(true) 마소 충전 상태에 따라 바뀌는지 (false)를 지정합니다.
        //(이 값은 use_single_icon이 false일 때만 유효합니다.)
        let use_static_icon = false;
        //마소 아이콘을 속성당 하나만 사용할 경우, 모든 속성의 아이콘을 모아놓은 Rollable table의 이름을 지정합니다.
        //(이 값은 user_single_icon이 true일 때만 유효합니다.)
        let collection_name = '마소';
        //생성된 장서 토큰에 이름을 표시할지를 지정합니다. (true:표시/false:숨김)
        let show_name = true;
        //생성된 장서 토큰에 충전상태를 나타내는 Bar를 표시할지를 지정합니다. (true:표시/false:숨김)
        let show_bar = false;
        //기본 아이콘으로 사용할 롤러블 테이블 이름을 지정합니다. (코스트가 없는 경우 등)
        let default_area = '전체';
        //페이지 격자의 가로 or 세로 크기입니다.
        let size = 70;
        //토큰을 생성할 페이지의 이름을 지정합니다. (공백으로 둘 경우 Players 마크가 꽂혀있는 페이지에 자동으로 생성합니다.)
        let page_name = "";
        
        try {
            
            var split = msg.content.split(' --');
            if (split.length < 2) {
                sendChat('ERROR','/w GM magicalogia_token_generator.js / 장서토큰을 생성할 캐릭터 이름이 지정되지 않았습니다.',null,{noarchive:true});
                return;
            }
            var cha = findObjs({name:split[1], type:'character'});
            if (cha.length < 1) {
                sendChat('ERROR','/w GM 이름이 ' + split[1] + '인 캐릭터가 저널에 없습니다.',null,{noarchive:true});
                return;
            } else {
                cha = cha[0];
            }
            var page;
            if (page_name.length == 0) {
                page = getObj('page', Campaign().get("playerpageid"));
            } else {
                page = findObjs({name:page_name, type:'page'}, {caseInsensitive: true});
                if (page.length > 0) {
                    page = page[0];
                } else {
                    sendChat('ERROR','/w GM magicalogia_token_generator.js / 이름이 \'' + page_name + '\' 인 페이지가 없습니다.',null,{noarchive:true});
                    return;
                }
            }
                
            var id_list = {};
            var attrs = findObjs({_type: "attribute", _characterid: cha.id});
            
            for (var i=0;i<attrs.length;i++) {
                var item = attrs[i].get('name');
                var id;
                
                if (item.indexOf('Magic_') === 0) {
                    id = item.split('_')[1];
                } else if (item.includes('repeating_') && item.includes('_Magic')) {
                    id = item.split('_')[2];
                }
                if (id) {
                    if (!id_list[id]) {
                        id_list[id] = {};
                    }
                    if (item.includes('_Name')) {
                        id_list[id].name = attrs[i].get('current');
                        id_list[id].orig_name = item;
                    } else if (item.includes('_Cost')) {
                        for (var j=0;j<area_list.length;j++) {
                            var cost_value = attrs[i].get('current');
                            if (cost_value.includes(area_list[j])) {
                                id_list[id].cost = area_list[j];
                                id_list[id].orig_cost = cost_value;
                            }
                        }
                        if (!id_list[id].cost) {
                            id_list[id].cost = default_area;
                        }
                    } else if (item.includes('_Charge')) {
                        id_list[id].charge_id = attrs[i].id;
                    }
                }
            }
            
            var keys = Object.keys(id_list);
            split.splice(0,2);
            
            for (var i=0;i<keys.length;i++) {
                
                var obj = id_list[keys[i]];
                var init_idx = -1;
                
                if (obj.name) {
                
                    if (!obj.charge_id) {
                        var charge_attr = createObj('attribute', {name:obj.orig_name.replace('_Name','_Charge'),current:0, characterid: cha.id});
                        obj.charge_id = charge_attr.id;
                    }

                    let current_charge = getObj('attribute',obj.charge_id);

                    var rt_item = null;
                    var sides = "";

                    if (use_single_icon) {
                        init_idx = 0;
                        var rt = findObjs({name:collection_name, type:'rollabletable'});
                        if (rt.length < 1) {
                            sendChat('ERROR','/w GM magicalogia_token_generator.js / 이름이 \'' + collection_name + '\' 인 Rollable Table이 없습니다.',null,{noarchive:true});
                            return;
                        }
                        rt_item = findObjs({type:'tableitem', _rollabletableid: rt[0].id, name: obj.cost});
                        if (rt_item.length < 1) {
                            rt_item = findObjs({type:'tableitem', _rollabletableid: rt[0].id, name: default_area});
                            if (rt_item.length < 1) {
                                if (obj.cost) {
                                    sendChat('ERROR','/w GM magicalogia_token_generator.js / 이름이 \'' + obj.cost + '\'이거나 \'' + default_area + '\' 인 item이 '+ collection_name +' Rollable table 안에 없습니다.',null,{noarchive:true});
                                } else {
                                    sendChat('ERROR','/w GM magicalogia_token_generator.js / 기본으로 사용할 \'' + default_area + '\' 속성의 item이 \''+ collection_name +'\' Rollable table 안에 없습니다.',null,{noarchive:true});
                                }
                                return;
                            }
                        }

                    } else {
                    
                        var rt = findObjs({name:obj.cost, type:'rollabletable'});
                        if (rt.length < 1) {
                            rt = findObjs({name:default_area, type:'rollabletable'});
                            if (rt.length < 1) {
                                if (obj.cost) {
                                    sendChat('ERROR','/w GM magicalogia_token_generator.js / 이름이 \'' + obj.cost + '\'이거나 \'' + default_area + '\'인 Rollable table이 없습니다.',null,{noarchive:true});
                                } else {
                                    sendChat('ERROR','/w GM magicalogia_token_generator.js / 기본으로 사용할 \'' + default_area + '\' 속성의 Rollable table이 없습니다.',null,{noarchive:true});
                                }
                                return;
                            }
                        }
                        rt_item = findObjs({type:'tableitem', _rollabletableid: rt[0].id});
                        if (rt_item.length == 0) {
                            sendChat('ERROR','/w GM magicalogia_token_generator.js / \'' + rt[0].get('name') + '\' 영역에 사용할 수 있는 아이콘이 없습니다.',null,{noarchive:true});
                            return;
                        }
                        for (var j=0;j<rt_item.length;j++) {
                            sides += escape(rt_item[j].get('avatar'));
                            if (j<rt_item.length-1) {
                                sides += "|";
                            }
                            if (use_static_icon && init_idx == -1 && obj.orig_cost && obj.orig_cost.toLowerCase().includes(rt_item[j].get('name').toLowerCase())) {
                                init_idx = j;
                            } else if (!use_static_icon && init_idx == -1 && (current_charge.get('current') + "") == rt_item[j].get('name')) {
                                init_idx = j;
                            }
                        }

                        if (init_idx == -1) {
                            sendChat('ERROR','/w GM magicalogia_token_generator.js / \'' + rt[0].get('name') + '\' 영역 중 ' + current_charge.get('current') + '에 대응되는 아이콘이 없습니다. 0번째 아이콘으로 대체합니다.',null,{noarchive:true});
                            init_idx = 0;
                        }
                    }
                    
                    var setting = {
                        _pageid: page.id,
                        left: Math.floor(page.get('width')/2)*size,
                        top: Math.floor(page.get('height')/2)*size,
                        represents: cha.id,
                        width: size,
                        height: size,
                        imgsrc: rt_item[init_idx].get('avatar').replace('max','thumb').replace('med','thumb'),
                        layer: 'objects',
                        sides:sides,
                        currentSide:0,
                        name: obj.name,
                        bar1_link: obj.charge_id,
                        playersedit_name: false,
                        showname: false,
                        bar1_value: current_charge.get('current'),
                        showplayers_name: false,
                        showplayers_bar2: false,
                        showplayers_bar3: false,
                        playersedit_bar1: false,
                        playersedit_bar2: false,
                        playersedit_bar3: false,
                        playersedit_aura1: false,
                        playersedit_aura2: false,
                        gmnotes: use_static_icon ? "static" : ""
                    };
                    if (show_name) {
                        Object.assign(setting, {showname: true, showplayers_name: true});
                    }
                    
                    var token = createObj('graphic', setting);
                    
                    if (show_bar) {
                        current_charge.set('max',getAttrByName(cha.id, "bas"));
                        token.set({bar1_max:getAttrByName(cha.id, "bas"), showplayers_bar1: true});
                    } else {
                        setTimeout(function(){
                            current_charge.set('max',"");
                            token.set({bar1_max:"", showplayers_bar1: false});
                        },100);
                    }
                }
            }
            
        } catch (err) {
            sendChat('error','/w GM '+err,null,{noarchive:true});
        }
    }
}
});
// (magicalogia_mana_token.js) *** 201210 *** 코드 종료 ***