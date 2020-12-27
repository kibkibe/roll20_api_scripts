/* (visual_dialogue.js) 미공개버전 코드 시작 */
// 이 코드는 아직 제작단계이며 정상적으로 동작하지 않습니다.
// 개발 도중 형상관리를 위하여 github에 등록한 것이니 사용하지 말아주세요.
on('ready', function() {
    if (!state.vd_characters) state.vd_characters = [];
    state.vd_settings = {
        name_font_size: 18,
        name_font_color: "rgb(255, 255, 255)",
        dialogue_font_size: 16,
        dialogue_font_color: "rgb(255, 255, 255)",
        margin: 5,
        line_height: 1.7,
        letter_spacing: 0.85,
        max_number_of_character: 4
    };
    
    const max = state.vd_settings['max_number_of_character'];
    state.vd_positions = [];
    state.vd_positions.push(Math.ceil(max/4) -1 + "");
    if (max > 1) {
        state.vd_positions.push(max - parseInt(state.vd_positions[0]) -1 + "");
    }
    if (max > 2) {
        while(state.vd_positions.length<max){
            let rand = 2;
            while(state.vd_positions.indexOf(rand+"") != -1){
                rand = Math.floor(Math.random() * max);
            }
            state.vd_positions.push(rand+"");
        }
    }
});
on("chat:message", function(msg)
{
if (msg.type == "general"
    && !msg.content.includes("<span style='color:#aaaaaa'>")
    && !msg.rolltemplate){

    var text_name;
    var text_dialogue;
    var bg_name = findObjs({ _type: 'graphic', name:'vd_name'});
    var bg_dialogue = findObjs({ _type: 'graphic', name:'vd_dialogue'});
    var split = [];

    // 필수 객체가 있는지 체크
    /* 대사 생성*/
    // 대사 길이 분석
    // 대사창이 있는지 확인하고 없으면 생성
    // 대사창에 표시할 대사 길이파악 및 실제 표시할 string값 생성
    /* 스탠딩 편집 */
    // 현재 표시중인 스탠딩 객체 
    
    if (bg_name.length > 0) {
        bg_name = bg_name[0];
    } else {
        sendChat("smallchat","/w gm vd_name 토큰이 없습니다.");
        return;
    }
    if (bg_dialogue.length > 0) {
        bg_dialogue = bg_dialogue[0];
    } else {
        sendChat("smallchat","/w gm vd_dialogue 토큰이 없습니다.");
        return;
    }
    const width = bg_dialogue.get('width');
    const name_width = bg_name.get('width');
    var blank_name = '';
    var blank_dialogue = '';
    while (name_width > blank_name.length*state.vd_settings['name_font_size']*state.vd_settings['letter_spacing']) { blank_name += "ㅤ"; }
    while (width>blank_dialogue.length*state.vd_settings['dialogue_font_size']*state.vd_settings['letter_spacing']) { blank_dialogue += "ㅤ"; }
    
    //create text object
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
            _pageid: bg_name.get('_pageid'),
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
    //generate dialogue & calculate text size
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
    while ((split.length+1) * state.vd_settings['dialogue_font_size'] * state.vd_settings['line_height'] <
    bg_dialogue.get('height') + state.vd_settings['margin']*2) {
        split.push(' ');
    }
    split.push(blank_dialogue);
    text_name.set({text:name,left:bg_name.get('left'),
    top:bg_name.get('top')+state.vd_settings['name_font_size']*state.vd_settings['line_height']/2});
    text_dialogue.set({text:split.join('\n'),left:bg_dialogue.get('left'),top:bg_dialogue.get('top')});
    //토큰 목록 가져오기


    var tokens = findObjs({ _type: 'graphic', name: 'vd_cha', _pageid: Campaign().get("playerpageid")});
    var current_token;
    var is_showing = function(token_id) {
        for (var i=0;i<state.vd_characters.length;i++) {
            if (token_id == state.vd_characters[i]) {
                return true;
            }
        }
        return false;
    }
    for (var i=0;i<tokens.length;i++) {
        var token = tokens[i];
        var cha = getObj('character', token.get('represents'));
        log(cha);
        var new_token = null;
        if (!cha) { //no character in journal
        } else if (msg.who == cha.get('name')) { //chatted character
            toFront(token);
            token.set('tint_color','transparent');
            if (!is_showing(token.id)) {
                state.vd_characters.push(token.id);
                new_token = token;
            }
        } else { //other character
            token.set('tint_color','#000000');
        }
    }
    if (state.vd_characters.length > state.vd_settings['max_number_of_character']) {
        var token = getObj('graphic', state.vd_characters.splice(0,1));
        log('잉잉이');
        //set side to hidden
        if (token) {
            token.set('imgsrc',"https://s3.amazonaws.com/files.d20.io/images/87039724/nmtA39AXSvwTizT9eO1elg/thumb.png?1563707993");
        }
    }
    if (new_token) {
        
        const grid = Math.floor(width/state.vd_settings['max_number_of_character']);
        let marker = Math.ceil(state.vd_settings['max_number_of_character']/4) -1;
        for (var i=0;i<state.vd_positions.length;i++) {
            let try_l_point = parseInt(state.vd_positions[i]) * grid + marker;
            let passed = true;
            for (var j=0;j<tokens.length;j++) {
                if (Math.abs(tokens[j].get('left') - try_l_point) < grid/2) {
                    passed = false;
                    break;
                }
            }
            if (passed) {
                new_token.set('left',try_l_point);
                break;
            }
        }
    }
} else if (msg.type == "api" && msg.content.indexOf("!reset") === 0) {
    var tokens = findObjs({ _type: 'graphic', name: 'vd_cha', _pageid: Campaign().get("playerpageid")});
    for (var i=0;i<tokens.length;i++) {
        var token = tokens[i];
        token.set({tint_color:'',left: 100});
    }
}
});