/*
	* by 양천일염
	* https://github.com/kibkibe/roll20_api_scripts
	* 201003
  
	[ 소개 ]
	마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
	토큰을 움직여 마법전의 진행알림을 자동으로 표시하도록 도와주는 스크립트입니다.
  
	[ 설치법 ]
	준비1. 스크립트 적용하기
	1. roll20 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
	2. New Script에 이 코드들을 복사해 붙여넣고 [Save Script]를 눌러 저장합니다.
	3. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.
  
	준비2. 토큰 생성하기
	1. 'turn_marker' 라는 이름의 토큰을 생성합니다.
	이 토큰을 움직여서 마법전의 진행알림의 표시합니다.
	2. 'turn_marker' 토큰의 설정창을 열고 첫번째 bar의 숫자를 1로 지정합니다.
	이 숫자가 마법전 라운드 수의 카운터가 됩니다.
	(마법전 종료 시 다음 마법전을 위해 1로 되돌려주세요.)
	3. 추천: 이 토큰의 bar 표시는 '편집가능시 보임', '위/아래에 겹침'으로 설정하고
	GM만 조작할 수 있도록 권한을 세팅하는 것을 추천합니다.
	
	준비3. 인식영역 만들기
	1. '라운드개시','선공소환','후공소환','선공공격','후공공격'을 이름으로 하는 토큰을 페이지의 원하는 위치에 배치하세요.
	   이 중 어느 영역토큰이 turn_marker 토큰과 좌표가 겹치는지를 바탕으로 현재 마법전 진행순서를 표시합니다.
	2. 준비를 마쳤습니다. turn_marker 토큰을 움직여서 메시지가 잘 표시되는지를 확인합니다.
	
	[ 옵션 ]
	- 인식영역의 이름과 출력되는 메시지는 바꿀 수 있습니다.
	하단 코드의 주석 중 option 이라고 쓰여진 줄을 참고해서 
	- 글자 대신 이미지를 표시하고 싶다면 HTML 태그를 이용하세요.
	<img src="이미지 주소">
	- turn_marker와 인식영역이 되는 토큰은 눈에 보이는지의 여부와 관계없이 동작합니다.
	  투명한 png파일과 표시권한을 이용해 플레이어에게 보이지 않도록 숨길 수도 있고
	  원하신다면 디자인을 입혀서 스크립트 조작과 진행안내판 역할을 동시에 하는 UI로 구성하셔도 좋겠습니다.
	
*/
on("change:graphic", function(obj, prev) {
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
            var format = "/desc Round.{round} {text}";
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
});
