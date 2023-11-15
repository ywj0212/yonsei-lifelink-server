import { Controller,Get,Post,Body,Param } from '@nestjs/common';
import { PatientInformService } from './patient-inform.service';
import { CreateHospitalDto } from '../dtos/hosptial.dto';
import { CreateGetHospitalDto } from '../dtos/gethospital.dto';
import { Hospital } from 'src/schemas/hospital.schema';
import { Patient } from 'src/schemas/patient.schema';
import { CreatePatientDto } from 'src/dtos/registerpatient.dto';
import { StopTransferDto } from 'src/dtos/stoptransfer.dto';
import { GETHOSPITALS_RETURN } from 'src/returnclasses/gethospitals.returnclass';
import { GETINFO_RETURN_HOSPITAL, GETINFO_RETURN_PATIENT, GETINFO_RETURN } from 'src/returnclasses/getinfo.returnclass';
import { MYINFO_RETURN } from 'src/returnclasses/myinfo.returnclass';
import { SETDESTINATION_RETURN } from 'src/returnclasses/setdestination.returnclass';

@Controller('app')
export class PatientInformController {
    constructor(private patientService: PatientInformService){}

    @Post() // 그냥 예시코드. 아무 의미 없음
    async CreatePatientData(@Body() PatientData: CreateHospitalDto){
        console.log(PatientData);
        await this.patientService.create(PatientData);
        return PatientData;
    }

    @Post('gethospitals') // 위치와 응급한 정도 보내면 병원 리스트 보내줌
    async GetHospLists(@Body() ShortPatientData: CreateGetHospitalDto) : Promise<GETHOSPITALS_RETURN[]>{ // Dto 참고. 하나라도 틀리면 안받음
        var Time = this.patientService.GetPreciseTime();
        var HospitalList : number[][] = [];
        var allhospital: Hospital[] = await this.patientService.findAll();
        for (let i = 0; i < allhospital.length; i++){
            HospitalList[i] = [];
        }
        var returnResult: GETHOSPITALS_RETURN[] = [];
        if (ShortPatientData.preKTAS <= 0){ // 특수응급환자 케이스. 여기는 병원 정보 없으면 만들기 힘듬. 우리수준에서 구현 안됨
            for (let i = 0; i < allhospital.length; i++){
                var arrival: number;
                //console.log(i);
                arrival = this.patientService.CalculateArrival(allhospital[i].latitude, allhospital[i].longitude, ShortPatientData.latitude, ShortPatientData.longitude);
                //console.log(i);
                //console.log(arrival);
                HospitalList[i][0] = allhospital[i].id;
                HospitalList[i][1] = this.patientService.CalculateDelyedTime(allhospital[i].fx, allhospital[i].gx, Math.round((Time + arrival) / 5), allhospital[i].Ce, allhospital[i].Cn, allhospital[i].K) + arrival;
                console.log(arrival, HospitalList[i][1], allhospital[i].K);
                //console.log(HospitalList[i][1]);
            }
            HospitalList = this.patientService.LowerSort(HospitalList);
            //console.log(HospitalList.length);
            for (let i = 0; i < HospitalList.length; i++){
                var findId: number;
                var addedResult: GETHOSPITALS_RETURN;
                for (let j = 0; j < allhospital.length; j++){
                    if (HospitalList[i][0] == allhospital[j].id){
                        findId = j;
                        break;
                    }
                }
                var addedResult = new GETHOSPITALS_RETURN(
                    allhospital[findId].id,
                    allhospital[findId].name,
                    allhospital[findId].type,
                    this.patientService.CalculateDistance(allhospital[findId].latitude, allhospital[findId].longitude, ShortPatientData.latitude, ShortPatientData.longitude) * 0.001,
                    this.patientService.CalculateTransferringPatient(allhospital[findId].current_fx, allhospital[findId].current_gx),
                    this.patientService.CalculateCongestion(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time / 5), allhospital[findId].Ce, allhospital[findId].Cn, allhospital[findId].K),
                    this.patientService.CalculateCongestion(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time + arrival / 5), allhospital[findId].Ce, allhospital[findId].Cn, allhospital[findId].K),
                    this.patientService.CalculateOccupied(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time / 5), allhospital[findId].Ce, allhospital[findId].Cn),
                    allhospital[findId].K,
                    50,
                    34,
                );
                returnResult.push(addedResult);
            }
            return returnResult;
        } else if (ShortPatientData.preKTAS == 1 || ShortPatientData.preKTAS == 2 || ShortPatientData.preKTAS == 3){ // 일반응급환자 케이스. 대기시간 + 이동시간 내림차순. 권역응급, 지역응급기관만 나열
            for (let i = 0; i < allhospital.length; i++){
                var arrival: number;
                //console.log(i);
                arrival = this.patientService.CalculateArrival(allhospital[i].latitude, allhospital[i].longitude, ShortPatientData.latitude, ShortPatientData.longitude);
                //console.log(i);
                //console.log(arrival);
                HospitalList[i][0] = allhospital[i].id;
                HospitalList[i][1] = this.patientService.CalculateDelyedTime(allhospital[i].fx, allhospital[i].gx, Math.round((Time + arrival) / 5), allhospital[i].Ce, allhospital[i].Cn, allhospital[i].K) + arrival;
                console.log(arrival, HospitalList[i][1], allhospital[i].K);
                //console.log(HospitalList[i][1]);
            }
            HospitalList = this.patientService.LowerSort(HospitalList);
            //console.log(HospitalList.length);
            for (let i = 0; i < HospitalList.length; i++){
                var findId: number;
                var addedResult: GETHOSPITALS_RETURN;
                for (let j = 0; j < allhospital.length; j++){
                    if (HospitalList[i][0] == allhospital[j].id){
                        findId = j;
                        break;
                    }
                }
                var addedResult = new GETHOSPITALS_RETURN(
                    allhospital[findId].id,
                    allhospital[findId].name,
                    allhospital[findId].type,
                    this.patientService.CalculateDistance(allhospital[findId].latitude, allhospital[findId].longitude, ShortPatientData.latitude, ShortPatientData.longitude) * 0.001,
                    this.patientService.CalculateTransferringPatient(allhospital[findId].current_fx, allhospital[findId].current_gx),
                    this.patientService.CalculateCongestion(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time / 5), allhospital[findId].Ce, allhospital[findId].Cn, allhospital[findId].K),
                    this.patientService.CalculateCongestion(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time + arrival / 5), allhospital[findId].Ce, allhospital[findId].Cn, allhospital[findId].K),
                    this.patientService.CalculateOccupied(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time / 5), allhospital[findId].Ce, allhospital[findId].Cn),
                    allhospital[findId].K,
                    50,
                    34,
                );
                returnResult.push(addedResult);
            }
            return returnResult;
        } else if (ShortPatientData.preKTAS >= 4){ // 경상환자 케이스. (대기시간 + 이동시간) * impact factor 내림차순. 권역응급 제외
            for (let i = 0; i < allhospital.length; i++){
                var arrival: number;
                var delayedtime: number = this.patientService.CalculateDelyedTime(allhospital[i].fx, allhospital[i].gx, Math.round((Time + arrival) / 5), allhospital[i].Ce, allhospital[i].Cn, allhospital[i].K);
                arrival = this.patientService.CalculateArrival(allhospital[i].latitude, allhospital[i].longitude, ShortPatientData.latitude, ShortPatientData.longitude);
                HospitalList[i][0] = allhospital[i].id;
                HospitalList[i][1] = delayedtime + arrival - ((Time + arrival) % 5);
                HospitalList[i][1] = HospitalList[i][1] * this.patientService.ImpactFactor(allhospital[i].fx, allhospital[i].gx, Math.round((Time + arrival) / 5), delayedtime, allhospital[i].Ce, allhospital[i].Cn, allhospital[i].K);
            }
            HospitalList = this.patientService.LowerSort(HospitalList);
            for (let i = 0; i < HospitalList.length; i++){
                var findId: number;
                
                for (let j = 0; j < allhospital.length; j++){
                    if (HospitalList[i][0] == allhospital[j].id){
                        findId = j;
                        break;
                    }
                }
                var addedResult = new GETHOSPITALS_RETURN(
                    allhospital[findId].id,
                    allhospital[findId].name,
                    allhospital[findId].type,
                    this.patientService.CalculateDistance(allhospital[findId].latitude, allhospital[findId].longitude, ShortPatientData.latitude, ShortPatientData.longitude) * 0.001,
                    this.patientService.CalculateTransferringPatient(allhospital[findId].current_fx, allhospital[findId].current_gx),
                    this.patientService.CalculateCongestion(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time / 5), allhospital[findId].Ce, allhospital[findId].Cn, allhospital[findId].K),
                    this.patientService.CalculateCongestion(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time + arrival / 5), allhospital[findId].Ce, allhospital[findId].Cn, allhospital[findId].K),
                    this.patientService.CalculateOccupied(allhospital[findId].fx, allhospital[findId].gx, Math.round(Time / 5), allhospital[findId].Ce, allhospital[findId].Cn),
                    allhospital[findId].K,
                    50,
                    34,
                );
                returnResult.push(addedResult);
            }
            return returnResult;
        }
    }

    @Post('setdestination')
    async SetDestination(@Body() PatientData: CreatePatientDto) : Promise<SETDESTINATION_RETURN>{
        var TargetHospital: Hospital = await this.patientService.findbyId_hospital(PatientData.hospitalId);
        var arrival: number = this.patientService.CalculateArrival(TargetHospital.latitude, TargetHospital.longitude, PatientData.latitude, PatientData.longitude);
        var Time = this.patientService.GetPreciseTime();
        var TargetPatient = await this.patientService.createPatient(PatientData, arrival + Time, Time);
        var returnResult: SETDESTINATION_RETURN = {
            patientId: TargetPatient.id,
            hospitalId: TargetPatient.HospitalId,
            name: TargetHospital.name,
            estimatedArrival: (((arrival * 5) + Time ) / 60) + ((((arrival * 5) + Time ) % 60) * 0.01)
        };
        console.log(Time, arrival);
        return returnResult;
    }

    @Post('stoptransfer')
    async StopTransfer(@Body() StopData: StopTransferDto){
        return this.patientService.deletePatientData(StopData.patientId, StopData.hospitalId);
    }

    @Post('editpatient')
    async EditPatient(@Body() PatientData){

    }

    @Post('test')
    async test(@Body() dds: any){
        return dds;
    }
}

@Controller('web')
export class HospitalInformController {
    constructor(private patientService: PatientInformService){}

    @Get('myinfo/:id')
    async FakeInform(@Param('id') id: number) : Promise<MYINFO_RETURN>{
        var TargetHospital: Hospital = await this.patientService.findbyId_hospital(id);
        var Time = this.patientService.GetTime();
        var BedRemaining: number = TargetHospital.K - this.patientService.CalculateOccupied(TargetHospital.fx, TargetHospital.gx, Time, TargetHospital.Ce, TargetHospital.Cn);
        if (BedRemaining < 0){
            BedRemaining = 0;
        }
        return {
            opBedRemaining: 12 + Math.floor(Math.random() * 3), // 수술실
            opBedCongestion: 1 + Math.floor(Math.random() * 2), // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
            
            emBedRemaining: BedRemaining, // 응급실 병상
            emBedCongestion: this.patientService.CalculateCongestion(TargetHospital.fx, TargetHospital.gx, Time, TargetHospital.Ce, TargetHospital.Cn, TargetHospital.K), // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
            
            icuBedRemaining: 32 + Math.floor(Math.random() * 3), // 중환자실 병상
            icuBedCongestion: 0 + Math.floor(Math.random() * 2) // 0: 여유, 1: 보통, 2: 주의, 3: 혼잡
        };
    }

    @Get('getinfo/:id')
    async GetInform(@Param('id') id: number){
        var TargetHospitals: Hospital[] = await this.patientService.findAll();
        var MyHospital: Hospital = await this.patientService.findbyId_hospital(id);
        var HospitalList: number[][] = [];
        
        var patients: [GETINFO_RETURN_PATIENT[], GETINFO_RETURN_PATIENT[]][] = [];
        var preciseTime: number = this.patientService.GetPreciseTime();
        var Time: number = this.patientService.GetTime();
        for (let i = 0; i < TargetHospitals.length; i++){
            if (TargetHospitals[i].id == id){
                continue;
            }
            HospitalList.push([TargetHospitals[i].id, this.patientService.CalculateArrival(TargetHospitals[i].latitude, TargetHospitals[i].longitude, MyHospital.latitude, MyHospital.longitude)]);
        }
        HospitalList = this.patientService.LowerSort(HospitalList);

        for (let i = 0; i < 6; i++){
            patients[i] = [[], []];
            for (let j = 0; j < MyHospital.current_fx[Time + i].length; j++){
                if (MyHospital.current_fx[Time + i][j].expectedArrival <= preciseTime){
                    continue;
                } else {
                    var returnpatient: GETINFO_RETURN_PATIENT = {
                        name: MyHospital.current_fx[Time + i][j].name,
                        age: MyHospital.current_fx[Time + i][j].age,
                        sex: MyHospital.current_fx[Time + i][j].sex,
                        latitude: MyHospital.current_fx[Time + i][j].latitude,
                        longitude: MyHospital.current_fx[Time + i][j].longitude,
                        preKTAS: MyHospital.current_fx[Time + i][j].preKTAS,
                    
                        gido: MyHospital.current_fx[Time + i][j].gido,
                        isBreathing: MyHospital.current_fx[Time + i][j].isBreathing,  
                        breathDepth: MyHospital.current_fx[Time + i][j].breathDepth,
                        bloodPressure: MyHospital.current_fx[Time + i][j].bloodPressure,
                        beat: MyHospital.current_fx[Time + i][j].beat,
                        isBleeding: MyHospital.current_fx[Time + i][j].isBleeding,
                        consciousness: MyHospital.current_fx[Time + i][j].consciousness,
                    
                        hospitalId: MyHospital.current_fx[Time + i][j].HospitalId 
                    };
                    if(MyHospital.current_fx[Time + i][j].preKTAS < 1){
                        patients[i][1].push(returnpatient);
                    } else {
                        patients[i][0].push(returnpatient);
                    }
                }
            }
        }
        patients[6] = [[], []];
        for (let i = 6; i < 20; i++){
            for (let j = 0; j < MyHospital.current_fx[Time + i].length; j++){
                if (MyHospital.current_fx[Time + i][j].expectedArrival <= preciseTime){
                    continue;
                } else {
                    var returnpatient: GETINFO_RETURN_PATIENT = {
                        name: MyHospital.current_fx[Time + i][j].name,
                        age: MyHospital.current_fx[Time + i][j].age,
                        sex: MyHospital.current_fx[Time + i][j].sex,
                        latitude: MyHospital.current_fx[Time + i][j].latitude,
                        longitude: MyHospital.current_fx[Time + i][j].longitude,
                        preKTAS: MyHospital.current_fx[Time + i][j].preKTAS,
                    
                        gido: MyHospital.current_fx[Time + i][j].gido,
                        isBreathing: MyHospital.current_fx[Time + i][j].isBreathing,  
                        breathDepth: MyHospital.current_fx[Time + i][j].breathDepth,
                        bloodPressure: MyHospital.current_fx[Time + i][j].bloodPressure,
                        beat: MyHospital.current_fx[Time + i][j].beat,
                        isBleeding: MyHospital.current_fx[Time + i][j].isBleeding,
                        consciousness: MyHospital.current_fx[Time + i][j].consciousness,
                    
                        hospitalId: MyHospital.current_fx[Time + i][j].HospitalId 
                    };
                    if(MyHospital.current_fx[Time + i][j].preKTAS < 1){
                        patients[6][1].push(returnpatient);
                    } else {
                        patients[6][0].push(returnpatient);
                    }
                }
            }
        }
        var rtrnhospitalList: GETINFO_RETURN_HOSPITAL[] = [];
        for (let i = 0; i < HospitalList.length; i++){
            var findId: number;
            for (let j = 0; j < TargetHospitals.length; j++){
                if (HospitalList[i][0] == TargetHospitals[j].id){
                    findId = j;
                    break;
                }
            }
            var returnhospital: GETINFO_RETURN_HOSPITAL = {
                name: TargetHospitals[findId].name,
                type: TargetHospitals[findId].type,
                trasferringPatient: this.patientService.CalculateTransferringPatient(TargetHospitals[findId].current_fx, TargetHospitals[findId].current_gx),
                currentCongestion: this.patientService.CalculateCongestion(TargetHospitals[findId].fx, TargetHospitals[findId].gx, Time, TargetHospitals[findId].Ce, TargetHospitals[findId].Cn, TargetHospitals[findId].K),
                emBedExists: TargetHospitals[findId].K,
                emBedOccupied: this.patientService.CalculateOccupied(TargetHospitals[findId].fx, TargetHospitals[findId].gx, Time, TargetHospitals[findId].Ce, TargetHospitals[findId].Cn),
                icuBedExists: 50,
                icuBedOccupied: 34
            };
            rtrnhospitalList.push(returnhospital);
        }
        var returnResult: GETINFO_RETURN = {
            patients: {
                under5min: {
                    normal: patients[0][0],
                    special: patients[0][1]
                },
                under10min: {
                    normal: patients[1][0],
                    special: patients[1][1]
                },
                under15min: {
                    normal: patients[2][0],
                    special: patients[2][1]
                },
                under20min: {
                    normal: patients[3][0],
                    special: patients[3][1]
                },
                under25min: {
                    normal: patients[4][0],
                    special: patients[4][1]
                },
                under30min: {
                    normal: patients[5][0],
                    special: patients[5][1]
                },
                over30min: {
                    normal: patients[6][0],
                    special: patients[6][1]
                }
            },
            hospitals: rtrnhospitalList
        };
        return returnResult;
    }

    @Get('getcronupdate')
    async GetCronUpdate(){

    }
    
    @Get('reset')
    async addfake(){
        var a = await this.patientService.Deleteall();
        await this.patientService.createHospital();
        await this.patientService.Addfakefxgx();
        return {
            Deleteall: a,
            //createHospital: b,
            //Addfakefxgx: c
        };
    }

    /*@Get('asd')
    async test(){
        await this.patientService.Addfakefxgx();
        return 200;
    }*/
}
