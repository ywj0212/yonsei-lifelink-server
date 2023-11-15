export class MYINFO_RETURN{
    opBedRemaining: number // 수술실
    opBedCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
    emBedRemaining: number // 응급실 병상
    emBedCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
    icuBedRemaining: number // 중환자실 병상
    icuBedCongestion: number // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
}