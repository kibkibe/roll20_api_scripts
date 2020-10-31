/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 201031
    
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

  	준비2. Rollable Table에 마소 아이템 생성
  	0. 이 단계는 기존에 마소 차지-소비 세팅을 사용하셨다면 생략할 수 있습니다.
  	단, Rollable Table의 이름만 아래 조건에 맞춰서 설정해주세요.
  	1. 각 영역의 이름별로 Rollable Table을 생성합니다.
  	별,짐승,힘,노래,꿈,어둠,전체의 기본 7종이 필요하며 원하시면 그 외의 속성을 추가하실 수 있습니다.
  	2. 생성한 Rollable Table에 마소 차지 개수를 보여주는 아이콘을 등록합니다.

  	준비3. 테스트
  	1. 아래의 형식으로 채팅창에 입력해서 정상적으로 토큰이 생성되는지 확인합니다.
	     !장서토큰 --캐릭터명
	2. 생성된 토큰을 클릭하고 마소차지-소비 매크로를 사용해 정상적으로 동작하는지 확인합니다.

  	[ 명령어 옵션 ]
  	- 명령어에 옵션을 설정해서 생성되는 토큰의 설정을 변경할 수 있습니다.
      		--이름 : 장서의 이름을 표시합니다.
      		--바 : 장서의 차지 상태를 Bar 형태로 표시합니다.

  	ex: 토큰에 장서 이름이 표시되도록 생성 
      		!장서토큰 --캐릭터 --이름
  	ex: 토큰에 장서 이름이 보이고 차지상태도 토큰 상단의 Bar에 숫자로 보이도록 생성
      		!장서토큰 --캐릭터 --이름 --바
*/
// 여기부터 복사해서 붙여넣으세요.
on("chat:message", function(msg){
    if (msg.type == "api"){
    if (msg.content.indexOf("!장서토큰") === 0) {
        
        //기본 아이콘으로 사용할 롤러블 테이블 이름을 지정합니다. (코스트가 없는 경우 등)
        let default_area = '전체';
        //페이지 격자의 가로 or 세로 크기입니다.
        let size = 70;
        //토큰을 생성할 페이지의 이름을 지정합니다. (공백으로 둘 경우 Players 마크가 꽂혀있는 페이지에 자동으로 생성합니다.)
        let page_name = "";
        
        try {
            
            var split = msg.content.split(' --');
            if (split.length < 2) {
                sendChat('ERROR','/w GM magicalogia_token_generator.js / 장서토큰을 생성할 캐릭터 이름이 지정되지 않았습니다.');
                return;
            }
            var cha = findObjs({name:split[1], type:'character'});
            if (cha.length < 1) {
                sendChat('ERROR','/w GM 이름이 ' + split[1] + '인 캐릭터가 저널에 없습니다.');
                return;
            } else {
                cha = cha[0];
            }
            var page = findObjs({name:page_name, type:'page'});
            if (page.length < 1) {
                page = Campaign().get("playerpageid");
            } else {
                page = page[0];
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
                        id_list[id].cost = attrs[i].get('current').replace(/[0-9]/g, '').replace('x','').replace('n','');
                    } else if (item.includes('_Charge')) {
                        id_list[id].charge_id = attrs[i].id;
                    }
                }
            }
            
            var keys = Object.keys(id_list);
            split.splice(0,2);
            let option = split.join('--');
            
            for (var i=0;i<keys.length;i++) {
                
                var obj = id_list[keys[i]];
                
                if (obj.name) {
                
                    if (!obj.charge_id) {
                        var charge_attr = createObj('attribute', {name:obj.orig_name.replace('_Name','_Charge'),current:0, characterid: cha.id});
                        obj.charge_id = charge_attr.id;
                    }
                    
                    var rt = findObjs({name:obj.cost, type:'rollabletable'});
                    if (rt.length < 1) {
                        rt = findObjs({name:default_area, type:'rollabletable'});
                    }
                    var rt_item = findObjs({type:'tableitem', _rollabletableid: rt[0].id});
                    var sides = "";
                    for (var j=0;j<rt_item.length;j++) {
                        sides += escape(rt_item[j].get('avatar'));
                        if (j<rt_item.length-1) {
                            sides += "|";
                        }
                    }
                    
                    var setting = {
                        _pageid: page.id,
                        left: Math.floor(page.get('width')/2)*size,
                        top: Math.floor(page.get('height')/2)*size,
                        represents: cha.id,
                        width: size,
                        height: size,
                        imgsrc: rt_item[0].get('avatar').replace('max','thumb').replace('med','thumb'),
                        layer: 'objects',
                        sides:sides,
                        currentSide:0,
                        name: obj.name,
                        bar1_link: obj.charge_id,
                        playersedit_name: false,
                        showname: false,
                        bar1_value: 0,
                        showplayers_name: false,
                        showplayers_bar1: false,
                        showplayers_bar2: false,
                        showplayers_bar3: false,
                        playersedit_bar1: false,
                        playersedit_bar2: false,
                        playersedit_bar3: false,
                        playersedit_aura1: false,
                        playersedit_aura2: false,
                    };
                    if (option.includes('이름')) {
                        Object.assign(setting, {showname: true, showplayers_name: true});
                    }
                    if (option.includes('바')) {
                        Object.assign(setting, {bar1_max:getAttrByName(cha.id, "bas")});
                    }
                    
                    var token = createObj('graphic', setting);
                }
            }
            
        } catch (err) {
            sendChat('ERROR','/w GM '+err);
        }
    }
}
});
// 여기까지 복사해서 붙여넣으세요.
