/* (visual_dialogue.js) 미공개버전 코드 시작 */
// 이 코드는 아직 제작단계이며 정상적으로 동작하지 않습니다.
// 개발 도중 형상관리를 위하여 github에 등록한 것이니 사용하지 말아주세요.
on('ready', function() {
    if (!state.vd_characters) state.vd_characters = [];
    state.vd_settings = {
        name_font_size: 18,
        name_font_color: "rgb(255, 255, 255)",
        width: 210,
        height: 210,
        dialogue_font_size: 16,
        dialogue_font_color: "rgb(255, 255, 255)",
        margin: 5,
        line_height: 1.7,
        letter_spacing: 0.85,
        max_number: 5,
        show_extra_standing: true,
        extra_name: 'extra'
    };
});
on("chat:message", function(msg)
{
if (msg.type == "general"
    && !msg.content.includes("<span style='color:#aaaaaa'>")
    && !msg.rolltemplate){

    var text_name;
    var text_dialogue;
    var bg_area = findObjs({ _type: 'graphic', name:'vd_area'});
    var bg_name = findObjs({ _type: 'graphic', name:'vd_name'});
    var bg_dialogue = findObjs({ _type: 'graphic', name:'vd_dialogue'});
    var split = [];
    
    // 필수 객체가 있는지 체크
    if (bg_area.length > 0) {
        bg_area = bg_area[0];
    } else {
        sendChat("error1","/w gm vd_area 토큰이 없습니다.",null,{noarchive:true});
        return;
    }
    if (bg_name.length > 0) {
        bg_name = bg_name[0];
    } else {
        sendChat("error2","/w gm vd_name 토큰이 없습니다.",null,{noarchive:true});
        return;
    }
    if (bg_dialogue.length > 0) {
        bg_dialogue = bg_dialogue[0];
    } else {
        sendChat("error3","/w gm vd_dialogue 토큰이 없습니다.",null,{noarchive:true});
        return;
    }
    const width = bg_dialogue.get('width');
    const name_width = bg_name.get('width');
    var blank_name = '';
    var blank_dialogue = '';
    while (name_width > blank_name.length*state.vd_settings['name_font_size']*state.vd_settings['letter_spacing']) { blank_name += "ㅤ"; }
    while (width>blank_dialogue.length*state.vd_settings['dialogue_font_size']*state.vd_settings['letter_spacing']) { blank_dialogue += "ㅤ"; }
    
    /* 대사 생성*/
    // 대사창이 있는지 확인하고 없으면 생성
    var texts = findObjs({ _type: 'text', layer:'map'});
    if (texts.length > 1) {
        if (texts[1].get('text').includes('ㅤㅤㅤㅤㅤ')) {
            text_name = texts[0];
            text_dialogue = texts[1];
        } else {
            text_name = texts[1];
            text_dialogue = texts[0];
        }
    } else {
        
        text_name = createObj('text', {
            _pageid: bg_area.get('_pageid'),
            left: bg_name.get('left'),
            top: bg_name.get('top'),
            width: bg_name.get('width'),
            height: bg_name.get('height'),
            layer: 'map',
            font_family: 'Arial',
            text: '',
            font_size: state.vd_settings['name_font_size'],
            color: state.vd_settings['name_font_color']
        });
        
        text_dialogue = createObj('text', {
            _pageid: bg_dialogue.get('_pageid'),
            left: bg_dialogue.get('left'),
            top: bg_dialogue.get('top'),
            width: width,
            height: bg_dialogue.get('height'),
            layer: 'map',
            font_family: 'Arial',
            text: '',
            font_size: state.vd_settings['dialogue_font_size'],
            color: state.vd_settings['dialogue_font_color']
        });
    }
    // 대사 길이 분석
    let name = msg.who + '\n' + blank_name;
    var str = msg.content;
    var amount = Math.ceil(width/state.vd_settings['dialogue_font_size']/state.vd_settings['letter_spacing']*3) -3;
    var idx = 0;
    var length = 0;
    const thirdchar = ['\'',' ',',','.','!',':',';','"'];
    const halfchar = ['[',']','(',')','*','^','-','~','<','>','+','l','i','1'];
    const arr = thirdchar.concat(halfchar);
    for (var i=0;i<str.length;i++){
        var c = str[i];
        for (var j=0;j<arr.length;j++) {
            if (c==arr[j]) {
                length -= (j<thirdchar.length ? 2 : 1);
                break;
            }
        }
        length += 3;
        if (length >= amount) {
            split.push(str.substring(idx,i+1));
            idx = i+1;
            length = 0;
        }
    }
    if (idx < str.length) {
        split.push(str.substring(idx,str.length));
    }

    // 대사창에 표시할 대사 길이파악 및 실제 표시할 string값 생성
    while ((split.length+1) * state.vd_settings['dialogue_font_size'] * state.vd_settings['line_height'] <
    bg_dialogue.get('height') + state.vd_settings['margin']*2) {
        split.push(' ');
    }
    split.push(blank_dialogue);
    text_name.set({text:name,left:bg_name.get('left'),
    top:bg_name.get('top')+state.vd_settings['name_font_size']*state.vd_settings['line_height']/2});
    text_dialogue.set({text:split.join('\n'),left:bg_dialogue.get('left'),top:bg_dialogue.get('top')});

    /* 스탠딩 편집 */
    // 대사를 한 캐릭터 판별
    let chat_cha = findObjs({ _type: 'character', name: msg.who});
    // 시트가 있는 캐릭터인지 임시 AS인지 체크
    if (chat_cha.length > 0) {
        // 시트가 있는 캐릭터일 경우 해당 캐릭터의 스탠딩을 표시
        chat_cha = chat_cha[0];
    } else {
        // 임시 AS 캐릭터인 경우 옵션에 따라 모브 스탠딩 표시 or 스탠딩 표시 생략
        chat_cha = null;
    }
    // 스탠딩을 표시하는 대상일 경우 해당 캐릭터의 스탠딩이 현재 표시중인지 확인
    let current_token = null;
    if (chat_cha || state.vd_characters.show_extra_standing) {
        let arr = findObjs({ _type: 'graphic', name: 'vd_cha', represents: chat_cha? chat_cha.get('_id') : '', _pageid: Campaign().get("playerpageid")});
        if (arr.length > 0) {
            current_token = arr[0];
        }
    }
    // 현재 표시중인 스탠딩 객체 수집
    let tokens = findObjs({ _type: 'graphic', name: 'vd_cha', _pageid: Campaign().get("playerpageid")});
    let oldest_token = tokens[0];
    // 현재 표시중인 모든 캐릭터 스탠딩을 dim 상태로 표시
    for (var i=0;i<tokens.length;i++) {
        var token = tokens[i];
        token.set('tint_color','#000000');
        if (parseInt(token.get('gmnotes')) < parseInt(oldest_token.get('gmnotes'))) {
            oldest_token = token;
        }
    }

    if (current_token == null && (chat_cha || state.vd_characters.show_extra_standing)) {
        // 현재 표시중이 아닐 경우 rollabletable을 통해 객체 생성
        let rt = findObjs({ _type: 'rollabletable', name: (chat_cha?msg.who.replace(/ /g,'-'):state.vd_settings.extra_name)});
        if (rt.length == 0) {
            sendChat("error4","/w gm 이름이 **" + (chat_cha?msg.who.replace(/ /g,'-'):state.vd_settings.extra_name) + "**인 rollable table이 없습니다.",null,{noarchive:true});
            return;
        } else {
            let rt_items = findObjs({ _type: 'tableitem', _rollabletableid: rt[0].get('_id')});
            if (rt_items.length == 0) {
                sendChat("error5","/w gm **" + rt[0].get('name') + "** rollable table에 사용할 수 있는 스탠딩이 없습니다.",null,{noarchive:true});
                return;
            }
            let opt = {
                name: 'vd_cha',
                _pageid: bg_area.get('_pageid'),
                width: state.vd_settings.width,
                height: state.vd_settings.height,
                layer: 'map',
                imgsrc: rt_items[0].get('avatar').replace('med','thumb').replace('max','thumb'),
                represents: chat_cha? chat_cha.get('_id'): ''
            };
    
            // 새로 생성된 객체를 포함한 스탠딩이 최대 표시개수를 초과했는지 체크
            if (tokens.length >= state.vd_settings.max_number) {
                // 초과했을 경우 최근 대사가 가장 오래된 캐릭터의 스탠딩을 삭제하고 그 위치에 생성
                opt.left = oldest_token.get('left');
                opt.top = oldest_token.get('top');
                oldest_token.remove();
            } else {
                // 초과하지 않았을 경우 알고리즘상으로 다음 순위의 위치에 생성
                let margin = 0;
                let grid = Math.floor(bg_area.get('width') / (state.vd_settings.max_number + 1 + margin * 2));
                let number = 0;
                if (tokens.length % 2 == 0) { //홀수번째
                    number = Math.ceil((tokens.length+1)/2) + margin;
                } else { //짝수번째
                    number = state.vd_settings.max_number - Math.floor(tokens.length/2) - margin;
                }
                log(margin + "/" + number + "/" + grid);
                opt.left = bg_area.get('left') - Math.floor(bg_area.get('width')/2) + grid * number;
                opt.top = bg_area.get('top') - Math.floor((state.vd_settings.height + bg_area.get('height'))/2);
            }
            current_token = createObj('graphic', opt);
        }
    }
    if (current_token) {
        // 대사를 한 캐릭터의 스탠딩의 dim 상태 해제
        current_token.set({tint_color:'transparent',gmnotes:Date.now()});
        toFront(current_token);
    }
} else if (msg.type == "api" && msg.content.indexOf("!@") === 0) {

    /* type이 API이고 감정표현 관련일 경우 */
    // 현재 표시중인 스탠딩 중 지금 감정표현을 입력한 캐릭터가 있는지 체크
    let chat_cha = findObjs({ _type: 'character', name: msg.who});
    // 시트가 있는 캐릭터인지 임시 AS인지 체크
    if (chat_cha.length > 0) {
        // 시트가 있는 캐릭터일 경우 해당 캐릭터의 스탠딩을 표시
        chat_cha = chat_cha[0];
    } else {
        // 임시 AS 캐릭터인 경우 옵션에 따라 모브 스탠딩 표시 or 스탠딩 표시 생략
        chat_cha = null;
    }
    // 스탠딩을 표시하는 대상일 경우 해당 캐릭터의 스탠딩이 현재 표시중인지 확인
    let current_token = null;
    if (chat_cha || state.vd_characters.show_extra_standing) {
        let arr = findObjs({ _type: 'graphic', name: 'vd_cha', represents: chat_cha? chat_cha.get('_id') : '', _pageid: Campaign().get("playerpageid")});
        if (arr.length > 0) {
            current_token = arr[0];
        }
    }
    if (current_token) {
        // 현재 표시중일 경우 명령어 내의 감정이름 추출
        let emot = msg.content.replace('!@','');

        // 감정이름에 해당되는 rollable item 확인
        let rt = findObjs({ _type: 'rollabletable', name: (chat_cha?msg.who.replace(/ /g,'-'):state.vd_settings.extra_name)});
        if (rt.length == 0) {
            sendChat("error4","/w gm 이름이 **" + (chat_cha?msg.who.replace(/ /g,'-'):state.vd_settings.extra_name) + "**인 rollable table이 없습니다.",null,{noarchive:true});
            return;
        } else {
            let opt = { _type: 'tableitem', _rollabletableid: rt[0].get('_id')};
            if (emot.length > 0) {
                opt.name = emot;
            }
            let rt_items = findObjs(opt);
            log(rt_items);
            if (rt_items.length > 0) {
                current_token.set('imgsrc',rt_items[0].get('avatar').replace('med','thumb').replace('max','thumb'));
            } else {
                sendChat("error4","/w gm 이름이 **" + rt[0].get('name') + "** rollable table에 이름이 **" + emot + "**인 item이 없습니다.",null,{noarchive:true});
                return;
            }
        }
        // 해당 rollable item의 avatar에 맞게 스탠딩 토큰의 imgsrc 변경
    }    
}
});