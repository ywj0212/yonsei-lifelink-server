export class GETINFO_RETURN_PATIENT{
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

export class GETINFO_RETURN_HOSPITAL{
    name: string
    type: string
    trasferringPatient: number
    currentCongestion: number
    emBedExists: number
    emBedOccupied: number
    icuBedExists: number
    icuBedOccupied: number
}

export class GETINFO_RETURN{
    patients: {
        under5min: {
            normal: GETINFO_RETURN_PATIENT[]
            special: GETINFO_RETURN_PATIENT[]
        }
        under10min: {
            normal: GETINFO_RETURN_PATIENT[]
            special: GETINFO_RETURN_PATIENT[]
        }
        under15min: {
            normal: GETINFO_RETURN_PATIENT[]
            special: GETINFO_RETURN_PATIENT[]
        }
        under20min: {
            normal: GETINFO_RETURN_PATIENT[]
            special: GETINFO_RETURN_PATIENT[]
        }
        under25min: {
            normal: GETINFO_RETURN_PATIENT[]
            special: GETINFO_RETURN_PATIENT[]
        }
        under30min: {
            normal: GETINFO_RETURN_PATIENT[]
            special: GETINFO_RETURN_PATIENT[]
        }
        over30min: {
            normal: GETINFO_RETURN_PATIENT[]
            special: GETINFO_RETURN_PATIENT[]
        }
    }
    hospitals: GETINFO_RETURN_HOSPITAL[]
}