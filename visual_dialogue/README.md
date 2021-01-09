## 소개
비주얼노벨 스타일의 채팅 화면을 구현해주는 스크립트입니다.

## 설치법
#### 준비1. 스크립트 적용하기
1. roll20 세션방의 대문에 해당하는 페이지에서 [설정]->[API 스크립트]를 선택해 스크립트 수정 페이지로 들어갑니다. (PRO 계정에서만 이 메뉴가 보입니다.)
2. New Script에 코드들을 복사해 붙여넣습니다.
3. [옵션](#옵션) 파트를 참조하여 세션방에 적용할 옵션을 설정합니다.
4. [Save Script]를 눌러 저장합니다. 페이지 아래쪽의 API Output Console에 에러 메시지가 표시되지 않는다면 정상적으로 적용된 것입니다.

#### 준비2. 요소 배치 -필수 토큰 생성하기
![](https://github.com/kibkibe/roll20_api_scripts/blob/master/wiki_image/vd/layout_1.jpg)
##### 그림1) 토큰의 이름 설정
이 스크립트에서는 `vd_area`, `vd_panel`, `vd_name`, `vd_dialogue`를 각각 이름으로 하는 총 4개의 토큰을 필요로 합니다.
각 토큰의 용도와 배치해야 할 레이어는 아래와 같습니다.

![](https://github.com/kibkibe/roll20_api_scripts/blob/master/wiki_image/vd/layout_2.jpg)
##### 그림2) 레이아웃 구성 예시

![](https://github.com/kibkibe/roll20_api_scripts/blob/master/wiki_image/vd/layout_3.jpg)
##### 그림3) 실제 레이어별 토큰 배치

#### Object Layer
- 배치하는 토큰
  - `vd_panel`: 대사 텍스트의 밑에 깔릴 배경이 됩니다.
- 생성되는 요소
  - 캐릭터 이름 텍스트
  - 대사 텍스트

#### Map Layer
- 배치하는 토큰
  - (없음)
- 생성되는 요소
  - 캐릭터의 스탠딩 이미지

#### GM Layer
- 배치하는 토큰
  - `vd_area`: 스탠딩 이미지들이 표시될 영역을 지정합니다.
  - `vd_name`: 대사를 한 캐릭터의 이름이 표시될 영역을 지정합니다.
  - `vd_dialogue`: 대사가 표시될 영역을 지정합니다.
- 생성되는 토큰
  - (없음)

### 배치할 때의 유의사항
![](https://github.com/kibkibe/roll20_api_scripts/blob/master/wiki_image/vd/layout_4.jpg)
##### 그림4) vd_name과 vd_dialogue를 배치했을 때의 기술적 한계(좌측)와 보완 방법(우측)
스크립트는 `vd_name`과 `vd_dialogue` 토큰의 좌표를 살펴보고 가급적 그 안쪽을 채우도록 텍스트를 생성합니다. 그러나 Roll20의 시스템 특성상 딱 맞는 크기의 텍스트 박스를 만들거나 정확한 위치에 좌측정렬 시키는 것은 불가능합니다. 때문에 `vd_name`과 `vd_dialogue`는 시각적으로 보이지 않게 만들어서 적당한 위치에 배치한 후 (배경색에 묻히거나 투명한 이미지를 사용) 테스트 메시지를 입력해가며 `vd_name`, `vd_dialogue`의 정확한 좌표를 조절하는 것이 용이합니다.

#### 준비3. 스탠딩 & 감정표현 이미지 -Rollable Table 생성하기
1. 캐릭터별 스탠딩
2. 엑스트라용 스탠딩

## 명령어
!@감정표현

!@퇴장

## 옵션