import { Controller,Get,Post,Body,Param } from '@nestjs/common';
import { PatientInformService } from './patient-inform.service';
import { CreateHospitalDto } from '../dtos/hosptial.dto';
import { CreateGetHospitalDto } from '../dtos/gethospital.dto';
import { Hospital } from 'src/schemas/hospital.schema';
import { Patient } from 'src/schemas/patient.schema';
import { CreatePatientDto } from 'src/dtos/registerpatient.dto';
import { StopTransferDto } from 'src/dtos/stoptransfer.dto';

@Controller('app')
export class PatientInformController {
    constructor(private patientService: PatientInformService){}

    /*@Post() // 그냥 예시코드. 아무 의미 없음
    async CreatePatientData(@Body() PatientData: CreateHospitalDto){
        console.log(PatientData);
        await this.patientService.create(PatientData);
        return PatientData;
    }*/

    @Post('gethospitals') // 위치와 응급한 정도 보내면 병원 리스트 보내줌
    async GetHospLists(@Body() ShortPatientData: CreateGetHospitalDto){ // Dto 참고. 하나라도 틀리면 안받음
        var Time = this.patientService.GetPreciseTime();
        var HospitalList : number[][];
        var allhospital: Hospital[] = await this.patientService.findAll();
        if (ShortPatientData.preKTAS <= 0){ // 특수응급환자 케이스. 여기는 병원 정보 없으면 만들기 힘듬. 우리수준에서 구현 안됨

        } else if (ShortPatientData.preKTAS == 1 || ShortPatientData.preKTAS == 2 || ShortPatientData.preKTAS == 3){ // 일반응급환자 케이스. 대기시간 + 이동시간 내림차순. 권역응급, 지역응급기관만 나열
            for (let i = 0; i < allhospital.length; i++){
                var arrival: number;
                arrival = this.patientService.CalculateArrival(allhospital[i].latitude, allhospital[i].longitude, 
                    ShortPatientData.latitude, ShortPatientData.longitude);
                HospitalList[i][0] = allhospital[i].id;
                HospitalList[i][1] = this.patientService.CalculateDelyedTime(allhospital[i].fx, allhospital[i].gx, 
                    Math.round((Time + arrival) / 5), allhospital[i].Ce, allhospital[i].Cn, allhospital[i].K) + arrival - ((Time + arrival) % 5);
            }
            //HospitalList = this.patientService.LowerSort(HospitalList);
            return [
                {
                    id: 0,
                    name: '의료법인나사렛의료재단나사렛국제병원',
                    distance: 0.3,
                    trasferringPatient: 8,
                    currentCongestion: 3,
                    arrivalCongestion: 3,
                    emBedExists: 75,
                    emBedOccupied: 65,
                    icuBedExists: 50,
                    icuBedOccupied: 34
                },
                {
                    id: 1,
                    name: '인천적십자병원',
                    distance: 0.3,
                    trasferringPatient: 8,
                    currentCongestion: 3,
                    arrivalCongestion: 3,
                    emBedExists: 75,
                    emBedOccupied: 65,
                    icuBedExists: 50,
                    icuBedOccupied: 34
                }
            ];
        } else if (ShortPatientData.preKTAS == 2){ // 경상환자 케이스. (대기시간 + 이동시간) * impact factor 내림차순. 권역응급 제외
            return [
                {
                    id: 0,
                    name: '의료법인나사렛의료재단나사렛국제병원',
                    distance: 0.3,
                    trasferringPatient: 8,
                    currentCongestion: 3,
                    arrivalCongestion: 3,
                    emBedExists: 75,
                    emBedOccupied: 65,
                    icuBedExists: 50,
                    icuBedOccupied: 34
                },
                {
                    id: 1,
                    name: '인천적십자병원',
                    distance: 0.3,
                    trasferringPatient: 8,
                    currentCongestion: 3,
                    arrivalCongestion: 3,
                    emBedExists: 75,
                    emBedOccupied: 65,
                    icuBedExists: 50,
                    icuBedOccupied: 34
                }
            ];
        }
    }

    @Post('setdestination')
    async SetDestination(@Body() PatientData: CreatePatientDto){
        return {
            patientId: 32,
            hospitalId: 1,
            name: '의료법인나사렛의료재단나사렛국제병원',
            distance: 0.3
        };
    }

    @Post('stoptransfer')
    async StopTransfer(@Body() StopData: StopTransferDto){
        return 200;
    }

    @Post('editpatient')
    async EditPatient(@Body() PatientData){

    }

}

@Controller('web')
export class HospitalInformController {
    constructor(private patientService: PatientInformService){}

    @Get('myinfo/:id')
    async FakeInform(@Param('id') id: number){
        return {
            opBedRemaining: 12, // 수술실
            opBedCongestion: 2, // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
            
            emBedRemaining: 32, // 응급실 병상
            emBedCongestion: 1, // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
            
            icuBedRemaining: 32, // 중환자실 병상
            icuBedCongestion: 0 // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
          };
    }

    @Get('getinfo/:id')
    async GetInform(@Param('id') id: string){
        return {
            patients: {
              under5min: {
                normal: [
                  {
                      name: '김민형', // 환자 이름
                      age: 20,
                      sex: 'M', // M, F
                      latitude: 126.680000,
                      longitude: 37.400000,
                      preKTAS: 2,
                    
                      gido: 'open',          // open, patent, effective
                      isBreathing: false,  
                      breathDepth: 'shallow',   // shallow, normal
                      bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                      beat: '빈맥',          // 빈맥, 정상, 서맥
                      isBleeding: false,
                      consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                    
                      hospitalId: 1    // gethospitals에서 받은 데이터 참조
                  } // 환자 하나의 정보
                ],
                special: [
                  {
                      name: '김민형', // 환자 이름
                      age: 20,
                      sex: 'M', // M, F
                      latitude: 126.680000,
                      longitude: 37.400000,
                      preKTAS: -3,
                    
                      gido: 'open',          // open, patent, effective
                      isBreathing: false,  
                      breathDepth: 'shallow',   // shallow, normal
                      bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                      beat: '빈맥',          // 빈맥, 정상, 서맥
                      isBleeding: false,
                      consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                    
                      hospitalId: 1    // gethospitals에서 받은 데이터 참조
                  },
                ]
              },
              under10min: {
                normal: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: 2,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    } // 환자 하나의 정보
                  ],
                  special: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: -3,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    },
                  ]
              },   // 위와 동일
              under15min: {
                normal: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: 2,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    } // 환자 하나의 정보
                  ],
                  special: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: -3,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    },
                  ]
              },   // 위와 동일 
              under20min: {normal: [
                {
                    name: '김민형', // 환자 이름
                    age: 20,
                    sex: 'M', // M, F
                    latitude: 126.680000,
                    longitude: 37.400000,
                    preKTAS: 2,
                  
                    gido: 'open',          // open, patent, effective
                    isBreathing: false,  
                    breathDepth: 'shallow',   // shallow, normal
                    bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                    beat: '빈맥',          // 빈맥, 정상, 서맥
                    isBleeding: false,
                    consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                  
                    hospitalId: 1    // gethospitals에서 받은 데이터 참조
                } // 환자 하나의 정보
              ],
              special: [
                {
                    name: '김민형', // 환자 이름
                    age: 20,
                    sex: 'M', // M, F
                    latitude: 126.680000,
                    longitude: 37.400000,
                    preKTAS: -3,
                  
                    gido: 'open',          // open, patent, effective
                    isBreathing: false,  
                    breathDepth: 'shallow',   // shallow, normal
                    bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                    beat: '빈맥',          // 빈맥, 정상, 서맥
                    isBleeding: false,
                    consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                  
                    hospitalId: 1    // gethospitals에서 받은 데이터 참조
                },
              ]},   // 위와 동일
              under25min: {
                normal: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: 2,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    } // 환자 하나의 정보
                  ],
                  special: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: -3,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    },
                  ]
              },   // 위와 동일
              under30min: {
                normal: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: 2,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    } // 환자 하나의 정보
                  ],
                  special: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: -3,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    },
                  ]
              },   // 위와 동일
              over30min: {
                normal: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: 2,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    } // 환자 하나의 정보
                  ],
                  special: [
                    {
                        name: '김민형', // 환자 이름
                        age: 20,
                        sex: 'M', // M, F
                        latitude: 126.680000,
                        longitude: 37.400000,
                        preKTAS: -3,
                      
                        gido: 'open',          // open, patent, effective
                        isBreathing: false,  
                        breathDepth: 'shallow',   // shallow, normal
                        bloodPressure: '고혈압', // 고혈압, 정상, 저혈압
                        beat: '빈맥',          // 빈맥, 정상, 서맥
                        isBleeding: false,
                        consciousness: 'coma', // coma, semicoma, stupor, drawsy, alert
                      
                        hospitalId: 1    // gethospitals에서 받은 데이터 참조
                    },
                  ]
              }    // 위와 동일
            },
            hospitals: [
                {
                  name: '인천적십자병원',
                  type: '지역응급의료기관',
                  trasferringPatient: 8,
                  currentCongestion: 3,
                  emBedExists: 75,
                  emBedOccupied: 65,
                  icuBedExists: 50,
                  icuBedOccupied: 34
                },
                {
                    name: '인천힘찬종합병원',
                    type: '지역응급의료기관',
                    trasferringPatient: 4,
                    currentCongestion: 2,
                    emBedExists: 75,
                    emBedOccupied: 65,
                    icuBedExists: 50,
                    icuBedOccupied: 34
                },
                {
                    name: '의료법인길의료재단길병원',
                    type: '권역응급의료센터',
                    trasferringPatient: 17,
                    currentCongestion: 3,
                    emBedExists: 75,
                    emBedOccupied: 65,
                    icuBedExists: 50,
                    icuBedOccupied: 34
                }
              ]
          }
    }

    @Get('setfake')
    async SetFakeCurrentfxgx(){

    }

    @Get('getcronupdate')
    async GetCronUpdate(){

    }
}
