import { Controller,Get,Post,Body } from '@nestjs/common';
import { PatientInformService } from './patient-inform.service';
import { CreateHospitalDto } from '../dtos/hosptial.dto';
import { CreateGetHospitalDto } from '../dtos/gethospital.dto';
import { Hospital } from 'src/schemas/hospital.schema';

@Controller('patient-inform')
export class PatientInformController {
    constructor(private patientService: PatientInformService){}

    @Post() // 그냥 예시코드. 아무 의미 없음
    async CreatePatientData(@Body() PatientData: CreateHospitalDto){
        console.log(PatientData);
        this.patientService.create(PatientData);
        return PatientData;
    }

    @Post('gethospitals') // 위치와 응급한 정도 보내면 병원 리스트 보내줌
    async GetHospLists(@Body() ShortPatientData: CreateGetHospitalDto){ // Dto 참고. 하나라도 틀리면 안받음
        var Time = this.patientService.GetTime();
        var TimeDelta = this.patientService.GetPreciseTime() - Time;
        var HospitalList : [number[], number[]];
        if (ShortPatientData.urgent == 0){ // 특수응급환자 케이스. 여기는 병원 정보 없으면 만들기 힘듬. 우리수준에서 구현 안됨

        } else if (ShortPatientData.urgent == 1){ // 일반응급환자 케이스. 대기시간 + 이동시간 내림차순. 권역응급, 지역응급기관만 나열
            var allhospital: Hospital[] = await this.patientService.findAll();
            var arrival: number;
            for (let i = 0; i < 10; i++){
                arrival = this.patientService.CalculateArrival(allhospital[i].latitude, allhospital[i].longitude, 
                    ShortPatientData.latitude, ShortPatientData.longitude);
                HospitalList[0][i] = allhospital[i].Id;
                HospitalList[0][i] = this.patientService.CalculateDelyedTime(allhospital[i].fx, allhospital[i].gx, 
                    Math.floor((Time + TimeDelta + arrival) / 5), allhospital[i].Ce, allhospital[i].Cn) + arrival - TimeDelta;
            }
        } else if (ShortPatientData.urgent == 2){ // 경상환자 케이스. (대기시간 + 이동시간) * impact factor 내림차순. 권역응급 제외

        }
    }

}
