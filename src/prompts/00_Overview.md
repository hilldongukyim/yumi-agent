# Anita Redesign - Overview

## 1. 리디자인 배경

### 기존 문제점
- 단일 프롬프트로 모든 제품의 라이프스타일 이미지를 생성하려 함
- 프롬프트가 과도하게 길어져 생성 중 중단 오류 빈번
- 제품 특성(설치 방식, 크기, 사용 맥락)을 반영하지 못함
- 국가별 인테리어 스타일 미반영

### 개선 방향
- **제품 카테고리별 개별 프롬프트 마크다운** 분기 시스템
- 각 프롬프트는 해당 제품에 최적화된 장면, 배치, 조명, 맥락 포함
- 국가별 현대적 인테리어 스타일 반영 (전통적 X → 모던 프리미엄)
- LG전자의 따뜻한 브랜드 톤 유지

---

## 2. 리디자인된 사용자 플로우

```
1. 인사 (자동)
    │
2. PDP URL 입력
    │
3. Firecrawl로 PDP 스크래핑
    │
4. Anita가 제품 정보 제시
    ├─ 카테고리 (예: TV > OLED)
    ├─ 디멘션 (W x H x D)
    └─ 국가 (URL에서 감지)
    │
5. 사용자 확인/수정
    ├─ 카테고리 드롭다운으로 수정 가능
    ├─ 디멘션 직접 입력으로 수정 가능
    └─ 국가 드롭다운으로 수정 가능
    │
6. 갤러리 이미지 목록 표시
    │
7. 사용자가 이미지 1장 선택
    │
8. 생성 옵션 설정
    ├─ [ ] Include People (체크박스)
    ├─ 사이즈 선택:
    │   ├─ ● 1920x1080 (기본)
    │   ├─ ○ 1080x1080
    │   ├─ ○ 1080x1920
    │   └─ ○ Custom (최소 512x512, 최대 4096x4096)
    └─ Reference Image 업로드 (옵션)
    │
9. 카테고리 기반 프롬프트 분기
    │   ├─ TV → 01_TV.md 프롬프트 로드
    │   ├─ Lifestyle Screen → 02_Lifestyle_Screen.md 프롬프트 로드
    │   ├─ Soundbar → 03_Soundbar.md 프롬프트 로드
    │   ├─ ... (제품별 프롬프트)
    │   └─ Laptop → 22_Laptop.md 프롬프트 로드
    │
10. AI 라이프스타일 이미지 생성 (Gemini 2.5 Flash Image)
    │
11. 후처리 옵션
    ├─ Edit (프롬프트 기반 수정)
    ├─ Resize (비율 변경)
    ├─ Regenerate (재생성)
    ├─ Download
    ├─ Video 생성 [🚧 작업중]
    └─ Start Over
```

---

## 3. 제거/변경된 기능

| 항목 | 변경 내용 |
|------|----------|
| Upscale | **제거** |
| Video 생성 | UI 유지, **"Coming Soon" 표시** (비활성화) |
| 단일 프롬프트 | **제품별 개별 프롬프트로 분기** |

---

## 4. 제품 카테고리 매핑

UK와 SG 사이트 기반 전체 제품 카테고리:

| # | 카테고리 ID | 카테고리명 | 프롬프트 파일 | 매칭 키워드 |
|---|-----------|----------|-------------|-----------|
| 1 | `tv` | TV | [[01_TV]] | oled, miniled, qned, nanocell, uhd, 4k, smart tv, true wireless |
| 2 | `lifestyle_screen` | Lifestyle Screen | [[02_Lifestyle_Screen]] | standby me, standbyme, objet easel, objet pose, flex |
| 3 | `soundbar` | Soundbar | [[03_Soundbar]] | soundbar, sound bar, home cinema, sound suite |
| 4 | `bluetooth_speaker` | Bluetooth Speaker | [[04_Bluetooth_Speaker]] | xboom, bluetooth speaker, party speaker, portable speaker |
| 5 | `wireless_earbuds` | Wireless Earbuds | [[05_Wireless_Earbuds]] | tone free, earbuds, xboom buds |
| 6 | `hifi` | Hi-Fi System | [[06_HiFi_System]] | hi-fi, hifi, audio system |
| 7 | `projector` | Projector | [[07_Projector]] | projector, cinebeam |
| 8 | `refrigerator` | Refrigerator | [[08_Refrigerator]] | fridge, refrigerator, freezer, american style, multi-door, side-by-side |
| 9 | `washing_machine` | Washing Machine & Dryer | [[09_Washing_Machine_Dryer]] | washing machine, washer, dryer, tumble dryer, front load, top load |
| 10 | `washtower` | WashTower | [[10_WashTower]] | washtower, wash tower |
| 11 | `styler` | Styler | [[11_Styler]] | styler, clothing care, steam closet |
| 12 | `dishwasher` | Dishwasher | [[12_Dishwasher]] | dishwasher |
| 13 | `microwave` | Microwave | [[13_Microwave]] | microwave, neochef |
| 14 | `vacuum` | Vacuum Cleaner | [[14_Vacuum_Cleaner]] | vacuum, cordzero, handstick, a9 kompressor |
| 15 | `water_purifier` | Water Purifier | [[15_Water_Purifier]] | water purifier, puricare water, tankless |
| 16 | `air_conditioner` | Air Conditioner | [[16_Air_Conditioner]] | air conditioner, aircon, ac, single split, multi split |
| 17 | `air_purifier` | Air Purifier | [[17_Air_Purifier]] | air purifier, puricare |
| 18 | `aerotower` | AeroTower & Aero Furniture | [[18_AeroTower]] | aerotower, aero tower, aero furniture |
| 19 | `dehumidifier` | Dehumidifier | [[19_Dehumidifier]] | dehumidifier |
| 20 | `heat_pump` | Heat Pump | [[20_Heat_Pump]] | heat pump, therma v, therma-v |
| 21 | `monitor` | Monitor | [[21_Monitor]] | monitor, ultragear, ultrawide, ergo monitor, smart monitor |
| 22 | `laptop` | Laptop | [[22_Laptop]] | gram, gram pro, ultrapc, laptop, notebook |

---

## 5. 국가별 스타일 가이드

모든 국가 스타일은 **현대적(Modern)이고 프리미엄(Premium)**해야 하며, 전통적/토속적 느낌은 지양.

| 국가코드 | 국가 | 인테리어 스타일 키워드 |
|---------|------|-------------------|
| uk | United Kingdom | Contemporary British, warm neutrals, natural oak, understated elegance, soft textiles, muted earth tones |
| sg | Singapore | Modern tropical, clean lines, bright and airy, natural light, warm wood with white, indoor greenery accents |
| kr | South Korea | Korean modern minimalism, warm wood tones, clean white walls, subtle hanok-inspired curves, ondol-warm flooring |
| us | United States | Open concept, spacious contemporary, warm grays, statement lighting, mixed materials |
| de | Germany | Bauhaus-inspired modern, functional elegance, precise lines, quality materials, warm industrial accents |
| fr | France | Modern Parisian, herringbone floors, high ceilings, neutral palette with bold accent, refined simplicity |
| it | Italy | Contemporary Italian, marble accents, warm terracotta tones, sculptural furniture, artisan touches |
| jp | Japan | Japanese modern, zen simplicity, natural materials, tatami-inspired textures, warm minimalism |
| au | Australia | Coastal modern, natural light, organic textures, earthy palette, indoor-outdoor flow |
| in | India | Modern Indian, warm jewel-tone accents, contemporary furniture, clean lines with artisanal textile touches |
| ae | UAE | Modern luxury, clean desert palette, gold accents, premium materials, expansive spaces |
| br | Brazil | Contemporary tropical, vibrant accent colors, natural wood, bright spaces, organic forms |
| mx | Mexico | Modern Mexican, warm terracotta, contemporary craft touches, earthy tones, abundant light |
| ca | Canada | Contemporary Canadian, warm woods, cozy modern, layered textures, nature-inspired palette |
| nl | Netherlands | Dutch modern, functional design, brick accents, warm minimalism, canal-house proportions |
| es | Spain | Mediterranean modern, warm whites, terracotta accents, natural stone, abundant light |
| se | Sweden | Scandinavian modern, light wood, warm whites, hygge comfort, functional beauty |
| th | Thailand | Modern Thai, tropical contemporary, warm teak, clean white, subtle silk accents |
| id | Indonesia | Modern Indonesian, warm tropical, natural rattan accents, clean contemporary, lush green touches |
| ph | Philippines | Modern Filipino, tropical contemporary, warm wood, bright airy spaces, woven accents |
| tw | Taiwan | Modern Taiwanese, warm minimalism, light wood, clean lines, subtle cultural accents |
| hk | Hong Kong | Urban modern, compact luxury, clever space use, premium materials, city views |
| sa | Saudi Arabia | Modern Arabian, clean luxury, warm desert palette, geometric accents, premium finishes |
| _default_ | Global | Modern international, warm neutral palette, clean contemporary lines, premium materials, natural light |

---

## 6. 사이즈 옵션

| 프리셋 | 해상도 | 비율 |
|-------|-------|------|
| **기본** | 1920 x 1080 | 16:9 |
| Square | 1080 x 1080 | 1:1 |
| Portrait | 1080 x 1920 | 9:16 |
| Custom | 사용자 입력 | 자유 |

### Custom 사이즈 제한
- **최소**: 512 x 512 px
- **최대**: 4096 x 4096 px

---

## 7. 사람 포함 옵션

- 생성 전 체크박스: **"Include People in Scene"**
- 기본값: **Unchecked** (사람 미포함)
- Checked 시: 프롬프트에 자연스러운 인물 배치 지시 추가
- Unchecked 시: 프롬프트에 인물 제외 지시 명시

---

## 8. 프롬프트 분기 로직 (Edge Function 수정 사항)

### anita-generate-lifestyle 수정

```
Input 추가:
- categoryId: string (제품 카테고리 ID)
- includePeople: boolean
- country: string (국가 코드)

로직:
1. categoryId로 해당 제품 프롬프트 템플릿 로드
2. country로 국가별 스타일 가이드 적용
3. includePeople로 인물 포함/제외 지시 삽입
4. productDimensions로 제품 크기 반영
5. 선택된 이미지의 앵글/상태 분석 지시 포함
6. 최종 프롬프트 조합 → Gemini API 호출
```

---

## 9. 프롬프트 파일 구조

각 제품별 프롬프트 마크다운은 다음 구조를 따름:

```markdown
# [Product Category] - Lifestyle Prompt

## Category Info
- ID: {category_id}
- Keywords: [matching keywords]
- Typical Placement: {where the product goes}

## Base Prompt
[제품 특화 프롬프트 - 변수 포함]

## Country Style Injection
[국가별 스타일이 삽입되는 위치와 방식]

## People Injection
[사람 포함/제외 시 추가되는 텍스트]

## Product Angle Awareness
[선택 이미지의 앵글을 반영하는 지시]
```

---

## 10. Edge Function 아키텍쳐 변경

```
기존:
anita-generate-lifestyle → 단일 하드코딩 프롬프트

변경:
anita-generate-lifestyle
  ├─ promptLoader(categoryId) → 제품별 프롬프트 로드
  ├─ styleInjector(country) → 국가별 스타일 주입
  ├─ peopleToggle(includePeople) → 인물 포함/제외
  ├─ angleAnalyzer(selectedImage) → 앵글 분석 지시
  └─ sizeConfig(width, height) → 해상도 설정
```

---

## 11. 참고 사이트

- **영국**: https://www.lg.com/uk/
- **싱가포르**: https://www.lg.com/sg/

---

## 12. 프롬프트 파일 목록

| 파일명 | 설명 |
|-------|------|
| [[01_TV]] | TV (OLED, MiniLED, QNED, NanoCell, UHD) |
| [[02_Lifestyle_Screen]] | StanbyME, Objet Easel, Objet Pose, Flex |
| [[03_Soundbar]] | 사운드바 전체 |
| [[04_Bluetooth_Speaker]] | XBOOM, 포터블 스피커 |
| [[05_Wireless_Earbuds]] | TONE Free, XBOOM Buds |
| [[06_HiFi_System]] | 하이파이 시스템 |
| [[07_Projector]] | CineBeam, 포터블/라이프스타일 프로젝터 |
| [[08_Refrigerator]] | 냉장고 전체 (양문형, 멀티도어 등) |
| [[09_Washing_Machine_Dryer]] | 세탁기, 건조기 |
| [[10_WashTower]] | 워시타워 |
| [[11_Styler]] | 스타일러 |
| [[12_Dishwasher]] | 식기세척기 |
| [[13_Microwave]] | 전자레인지 (NeoChef) |
| [[14_Vacuum_Cleaner]] | 무선청소기 (CordZero) |
| [[15_Water_Purifier]] | 정수기 |
| [[16_Air_Conditioner]] | 에어컨 (싱글스플릿, 멀티스플릿) |
| [[17_Air_Purifier]] | 공기청정기 (PuriCare) |
| [[18_AeroTower]] | 에어로타워, 에어로퍼니처 |
| [[19_Dehumidifier]] | 제습기 |
| [[20_Heat_Pump]] | 히트펌프 (THERMA V) |
| [[21_Monitor]] | 모니터 (UltraGear, UltraWide, Ergo 등) |
| [[22_Laptop]] | 노트북 (gram, gram Pro, UltraPC) |
