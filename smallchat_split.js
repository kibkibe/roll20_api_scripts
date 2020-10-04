/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 200622
    
	[ 소개 ]
    
	Roll20에서 ORPG를 진행하면서 잡담을 하고 싶을 때 문구 앞에 ! (느낌표+공백)만 추가해서 입력하면
	게임로그보다 상대적으로 덜 눈에 띄는 서식으로 채팅창에 표시 해주는 기능입니다.
	또한 플레이어와 캐릭터의 채팅을 분리하고 싶지만 As를 일일히 변경하기는 번거로운 사용자에게는
	옵션에 따라 As를 캐릭터로 둔 채로 사용해도 플레이어의 프로필로 채팅을 출력시켜 주는 기능도 있습니다.
	[ 사용법 ]
	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여놓습니다.
	3. [옵션] 26번째 줄의 if (true) 부분을 수정하여 잡담을 플레이어로 할지 캐릭터로 할지를 변경할 수 있습니다.
	4. [Save Script]로 저장합니다. 
	5. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다. 세션방에서 테스트를 진행할 수 있습니다.
	6. 채팅창에 '! 하고싶은말'의 형식으로 입력해 테스트를 해봅니다.
*/
on('ready', function() {
    if (!state.smallchatlog) state.smallchatlog = [];
});
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("! ") === 0) {
        
        // *** Option ***
        // 채팅창의 글씨크기를 지정합니다.
        var font_size = 14;
        // 채팅창의 글씨색을 지정합니다.
        var color = "rgb(255, 255, 255)";
        // 채팅창의 상하좌우 여백을 설정합니다.
        var margin = 5;
        // 잡담 내역을 저장할 핸드아웃의 이름을 지정합니다.
        var logname = '(잡담로그)';
        // (고급설정) 각 열과 자간이 글씨크기 대비 얼마만큼의 픽셀을 차지하는지의 비율을 지정합니다.
        // 채팅창의 크기와 문장의 길이가 잘 안 맞을 경우 적절하게 조절하세요.
        var lineheight = 1.7;
        var letterspacing = 0.95;
   
        var box = findObjs({ _type: 'text', layer:'map'});
        var bg = findObjs({ _type: 'graphic', name:'chat_bg', layer:'map'});
        var ho = findObjs({ _type: 'handout', name:logname});
        var split;
        if (bg.length > 0) {
            bg = bg[0];
        } else {
            sendChat("smallchat","/w gm map 레이어에 잡담창의 배경이 될 토큰이 없습니다.");
            return;
        }
        if (ho.length > 0) {
            ho = ho[0];
        } else {
            ho = createObj('handout', {
                notes: ' ',
                inplayerjournals: 'all',
                name: logname
            });
        }
        var width = bg.get('width') - margin * 2;
        if (box.length > 0) {
            box = box[0];
            split = box.get('text').split('\n');
        } else {
            split = [''];
            while (bg.get('width')>split[0].length*font_size) { split[0] += "ㅤ"; }
            while (split.length * font_size * lineheight < bg.get('height') + margin*2) {
                split.push(' ');
            }
            box = createObj('text', {
                _pageid: bg.get('_pageid'),
                left: bg.get('left'),
                top: bg.get('top'),
                width: width,
                height: bg.get('height'),
                layer: 'map',
                font_family: 'Arial',
                text: '',
                font_size: font_size,
                color: "rgb(255, 255, 255)"
            });
        }
        var str = getObj('player',msg.playerid).get('_displayname') + ": " + msg.content.substring(2);
        var amount = Math.ceil(width/font_size/letterspacing*2);
        var idx = 0;
        var length = 0;
        var halfchar = [' ',',','.','\'','"','[',']','(',')','*','^','!','-','~',':',';','<','>','+','l','i','1'];
        for (var i=0;i<str.length;i++){
            var c = str[i];
            for (var j=0;j<halfchar.length;j++) {
                if (c==halfchar[j]) {
                    length -= 1;
                    break;
                }
            }
            length += 2;
            if (length > amount) {
                split.push(str.substring(idx,i));
                idx = i;
                length = 0;
            }
        }
        if (idx < str.length) {
            split.push(str.substring(idx,str.length));
        }
        while ((split.length -1) * font_size * lineheight > bg.get('height') + margin*2) {
            split.splice(1,1);
        }
        box.set({text:split.join('\n'),left:bg.get('left'),top:bg.get('top')-font_size});
        ho.get('notes',function(text) {
            var d = new Date();
            state.smallchatlog.push(
                (text.length > 0 && text != 'null' ? text : "")
                + "<br><span style='color:#aaaaaa;font-size:7pt;'>"
                + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
                + "</span>" + "<br>" + str);
            if (state.smallchatlog.length > 0) {
                ho.set({notes: state.smallchatlog[0]});
                state.smallchatlog.splice(0,1);
            }
        });
    }
}
});
