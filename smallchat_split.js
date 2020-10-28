/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 201005
    
	[ 소개 ]
    
	Roll20에서 게임진행 로그와 잡담을 분리해 플레이하고 싶을 때 활용할 수 있는 기능입니다.
	'! 하고싶은말'의 형식으로 입력하면 화면내의 특정 영역이나 별도의 핸드아웃에
	잡담채팅을 표시합니다.
	잡담한 내역은 자동으로 생성되는 저장용 핸드아웃에 누적되어 저장됩니다.
	
	[ 사용법 ]
	
	준비1. 스크립트 적용
	1. 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 아래의 코드들을 복사해 붙여놓습니다.
	3. 코드 내의 주석을 참조해서 옵션을 설정합니다. 글자 크기, 색상, 여백, 시간대 등을 세팅할 수 있습니다.
	4. [Save Script]로 저장합니다. 
	5. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.
	
	준비2. (옵션) 잡담창 배경 및 영역 설정
	1. 잡담창을 표시할 세션방의 채팅창 배경으로 사용할 이미지를 삽입하고 이름을 'chat_bg'로 설정합니다.
	2. 'chat_bg' 토큰을 맵 레이어에 배치합니다.
	3. 'chat_bg' 토큰을 배치하지 않으면 실시간 채팅을 표시하는 핸드아웃이 별도로 생성됩니다.
	
	준비3. 
	1. '! 하고싶은말'의 형식으로 채팅창에 입력해봅니다.
	2-1. 'chat_bg' 토큰을 설정했을 경우 배경 위에 채팅창이 표시되는지 확인합니다.
	2-2. 'chat_bg' 토큰을 설정하지 않았을 경우 실시간 채팅용 핸드아웃이 자동으로 생성되었는지 확인합니다.
	3. 저널에 잡담로그를 저장하는 핸드아웃이 자동으로 생성되었는지 확인합니다.
*/
on('ready', function() {
    if (!state.smallchatlog) state.smallchatlog = [];
    if (!state.smallchatonair) state.smallchatonair = [];
});
on("chat:message", function(msg)
{
if (msg.type == "api"){
    if (msg.content.indexOf("! ") === 0) {
        
        // option
        // 채팅창의 글씨크기를 지정합니다.
        var font_size = 14;
        // 채팅창의 글씨색을 지정합니다.
        var color = "rgb(255, 255, 255)";
        // 채팅창의 상하좌우 여백을 설정합니다.
        var margin = 5;
        // 채팅로그에 플레이어/PC 중 어느쪽 이름을 표시할지 지정합니다. (true:플레이어/false:PC)
        var show_player_name = false;
        // 잡담 내역을 저장할 핸드아웃의 이름을 지정합니다.
        var logname = '(잡담로그)';
        // 세션화면 안에 채팅창을 만들지 않고자 할 경우 실시간 채팅을 표시할 별도의 핸드아웃의 이름을 지정합니다.
        var onair_name = '(실시간 잡담채팅)';
        // 실시간 채팅용 핸드아웃에서 최신순으로 몇개까지 채팅을 표시할지를 지정합니다.
        var onair_lines = 15;
        // 핸드아웃에 저장되는 채팅로그에 플레이어의 고유색상을 적용할지의 여부를 설정합니다
        // 0: 사용안함 / 1: 이름만 컬러 / 2: 채팅까지 컬러
        var use_personal_color = 1;
        // 핸드아웃에 표시하는 채팅시각의 표준시간대를 지정합니다. 기본값은 KST(UTC+9)입니다.
        var timezone = 9;
        // (고급설정) 각 열과 자간이 글씨크기 대비 얼마만큼의 픽셀을 차지하는지의 비율을 지정합니다.
        // 채팅창의 크기와 문장의 길이가 잘 안 맞을 경우 적절하게 조절하세요.
        var lineheight = 1.7;
        var letterspacing = 0.95;
   
        var box = findObjs({ _type: 'text', layer:'map'});
        var bg = findObjs({ _type: 'graphic', name:'chat_bg', layer:'map'});
        var ho = findObjs({ _type: 'handout', name:logname});
        var player = getObj('player',msg.playerid);
        
        var split;
        if (bg.length > 0) {
            bg = bg[0];
        } else {
            bg = null;
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
        if (bg) {
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
                    color: color
                });
            }
            var str = player.get('_displayname') + ": " + msg.content.substring(2);
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
        }
        var d = new Date();
        var tz = d.getTime() + (d.getTimezoneOffset() * 60000) + (timezone * 3600000);
        d.setTime(tz);
        var final_str = "<span style='color:#aaaaaa;font-size:7pt;'>"
                + d.getHours() + ":" + d.getMinutes() + ":" + d.getSeconds()
                + "</span>" + "<br>"
                + (use_personal_color!=0?("<span style='color:"+player.get('color')+";'>"):"") + "<b>"
                + (show_player_name ? player.get('_displayname') : msg.who) + "</b>" + (use_personal_color===1?"</span>":"") + ": "
                + msg.content.substring(2) + (use_personal_color===2?"</span>":"");
        if (!bg) {
            var oa = findObjs({ _type: 'handout', name:onair_name});
            if (oa.length > 0) {
                oa = oa[0];
            } else {
                oa = createObj('handout', {
                    notes: ' ',
                    inplayerjournals: 'all',
                    name: onair_name
                });
            }
            oa.get('notes',function(text) {
                var final_split = (text.length > 0 && text != 'null' ? text.split("<br><i></i>") : []);
                final_split.push(final_str);
                if (final_split.length > onair_lines) {
                    final_split.splice(0,1);
                }
                state.smallchatonair.push(final_split.join("<br><i></i>"));
                if (state.smallchatonair.length > 0) {
                    oa.set({notes: state.smallchatonair[0]});
                    state.smallchatonair.splice(0,1);
                }
            });
        }
        ho.get('notes',function(text) {
            state.smallchatlog.push((text.length > 0 && text != 'null' ? text : "") + "<br><i></i>" + final_str);
            if (state.smallchatlog.length > 0) {
                ho.set({notes: state.smallchatlog[0]});
                state.smallchatlog.splice(0,1);
            }
        });
    }
}
});
