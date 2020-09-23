# About
Roll20에서 사용하기 위해 개인적으로 만든 API 스크립트를 백업 및 공개하는 곳 입니다.


# List
#### 공통
- [narrator.js](#narratorjs)
- [get_set_img_url.js](#get_set_img_urljs)
- [smallchat.js](#smallchatjs)
- [as_switcher.js](#as_switcherjs)
- [flip_card.js](#flip_cardjs)
- [jukebox_amplifier.js](#jukebox_amplifierjs)

#### 마기카로기아 전용
- [magicalogia_summon.js](#magicalogia_summonjs)
- [magicalogia_match_dice.js](#magicalogia_match_dicejs)
- [magicalogia_install_magic.js](#magicalogia_install_magicjs)
- [magicalogia_resist.js](#magicalogia_resistjs)



# 룰 공통 스크립트

### narrator.js
Roll20에서 ORPG를 진행할 때 긴 나레이션을 한꺼번에 입력한 뒤
시간차를 두고 한줄씩 출력되도록 도와주는 스크립트입니다.


### get_set_img_url.js
이 스크립트에는 Roll20에서 ORPG를 진행하며 사용할 수 있는 2가지 기능이 포함되어 있습니다.
- 화면에 배치된 토큰의 이미지 URL을 가져올 수 있습니다. (명령어: !add)
- 화면에 배치된 토큰의 이미지를 변경할 수 있습니다. (명령어: !replace 이미지주소)


### smallchat.js
Roll20에서 ORPG를 진행하면서 잡담을 하고 싶을 때 문구 앞에 ! (느낌표+공백)만 추가해서 입력하면
게임로그보다 상대적으로 덜 눈에 띄는 서식으로 채팅창에 표시 해주는 기능입니다.
또한 플레이어와 캐릭터의 채팅을 분리하고 싶지만 As를 일일히 변경하기는 번거로운 사용자에게는
As를 캐릭터로 둔 채로 사용해도 플레이어의 프로필로 채팅을 출력시켜 주는 기능도 있습니다.


### as_switcher.js
Roll20에서 채팅의 As를 임시로 손쉽게 오갈 수 있도록 도와주는 스크립트입니다.


### flip_card.js
카드 기능을 이용할 때 우클릭으로 카드를 뒤집기 어려운 상황일 경우 명령어를 이용해 뒤집을 수 있도록 지원합니다.


### jukebox_amplifier.js
Roll20에서 캠페인 안의 jukebox 오디오들의 볼륨을 일괄적으로 최대치로 올리고
반복재생 옵션도 활성화 시켜주는 스크립트입니다.
 
 
 
# 마기카로기아 전용 스크립트
 
### magicalogia_summon.js
마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
채팅창에 명령어를 입력하는 방식으로 원형 토큰을 손쉽게 생성할 수 있도록 도와주는 스크립트입니다.
 
 
### magicalogia_match_dice.js
마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
스펠바운드에 플롯된 다이스를 집계한 뒤 공방판정 후 남은 다이스를 채팅창에 표시하는 기능입니다.


### magicalogia_install_magic.js
마기카로기아 Roll20 캐릭터 시트의 장서 목록에 이름, 타입, 코스트, 효과, 주구 등의 항목을
채팅창 입력 한번으로 손쉽게 입력하는 기능입니다.


### magicalogia_resist.js
마도서대전 RPG 마기카로기아를 Roll20에서 ORPG로 진행할 때
원형토큰을 이용해 주문의 저항판정 목표치를 계산해주는 스크립트입니다.
