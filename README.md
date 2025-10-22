# \[Dot 팀\] Life-Link 응급 구조대원 핫라인 서비스 - API 백엔드<br/>(연세대학교 넥슨√i 창의플랫폼 2023)

시연 목적으로만 제작한 프로젝트입니다.

API: https://lifelink-api.mirix.kr/app (현재는 접속 불가)

**POST https://lifelink-api.mirix.kr/app/gethospitals**
* body content
```typescript
{
  latitude: number
  longitude: number
  preKTAS: number       // default: 2
}
```
* returns
```typescript
[
  {
    id: number         // 병원 아이디
    name: string       // 병원 이름
    distance: number   // 병원까지의 거리 (km)
    trasferringPatient: number // 이송 중인 환자 수
    currentCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
    arrivalCongestion: number // "
    emBedExists: number // 응급실 병상
    emBedOccupied: number
    icuBedExists: number // 중환자실 병상
    icuBedOccupied: number
  },
]
```

**POST https://lifelink-api.mirix.kr/app/setdestination**
* body content
```typescript
{
  name: string // 환자 이름
  age: number
  sex: string // M, F
  latitude: number
  longitude: number
  preKTAS: number

  gido: string          // open, patent, effective
  isBreathing: boolean  
  breathDepth: string   // shallow, normal
  bloodPressure: string // 고혈압, 정상, 저혈압
  beat: string          // 빈맥, 정상, 서맥
  isBleeding: boolean
  consciousness: string // coma, semicoma, stupor, drawsy, alert

  hospitalId: number    // gethospitals에서 받은 데이터 참조
}
```
* returns
```typescript
{
  patientId: number  // 이송 일련번호
  
  hospitalId: number
  name: string
  distance: number   // 병원까지의 거리 (km)
}
```

**POST https://lifelink-api.mirix.kr/app/stoptransfer/**
* body content
```typescript
{
  patientId: number // 이송 일련번호
  hospitalId: number // 병원 일련번호
}
```
* returns nothing

---

**GET https://lifelink-api.mirix.kr/web/myinfo/:id/**
* `:id`는 병원 아이디
* returns
```typescript
{
  opBedRemaining: number // 수술실
  opBedCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
  
  emBedRemaining: number // 응급실 병상
  emBedCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
  
  icuBedRemaining: number // 중환자실 병상
  icuBedCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
}
```

**GET https://lifelink-api.mirix.kr/web/getinfo/:id/**
* `:id`는 병원 아이디
* returns
```typescript
{
  patients: {
    under5min: {
      normal: [
        {
            name: string // 환자 이름
            age: number
            sex: string // M, F
            latitude: number
            longitude: number
            preKTAS: number
          
            gido: string          // open, patent, effective
            isBreathing: boolean  
            breathDepth: string   // shallow, normal
            bloodPressure: string // 고혈압, 정상, 저혈압
            beat: string          // 빈맥, 정상, 서맥
            isBleeding: boolean
            consciousness: string // coma, semicoma, stupor, drawsy, alert
          
            hospitalId: string    // gethospitals에서 받은 데이터 참조
        }, // 환자 하나의 정보
      ]
      special: [
        {
          // 위와 동일, 그러나 preKTAS 변수만 용도 변경
          preKTAS: number   // -4 중증외상, -3 심정지, -2 뇌졸중, -1 심근경색, 0 임산부
        },
      ]
    }
    under10min: {}   // 위와 동일
    under15min: {}   // 위와 동일 
    under20min: {}   // 위와 동일
    under25min: {}   // 위와 동일
    under30min: {}   // 위와 동일
    over30min: {}    // 위와 동일
  },
  hospitals: [
    {
      name: string   // 병원 이름
      type: string   // 병원 종류 (권역응급의료센터, 개인 병원 등)
      trasferringPatient: number // 이송 중인 환자 수
      currentCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
      emBedExists: number // 응급실 병상
      emBedOccupied: number
      icuBedExists: number // 중환자실 병상
      icuBedOccupied: number
    },
  ]
}
```

@here 우리가 병원용 웹에서 사용할 병원의 id는 0
