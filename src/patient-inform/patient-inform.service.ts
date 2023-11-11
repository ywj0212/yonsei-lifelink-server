import { Model } from 'mongoose';
import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Hospital } from '../schemas/hospital.schema'; 
import { CreateHospitalDto } from '../dtos/hosptial.dto';
import { Patient } from '../schemas/patient.schema';
import { Cron } from '@nestjs/schedule'
import { CreatePatientDto } from 'src/dtos/registerpatient.dto';

@Injectable()
export class PatientInformService {
  constructor(
    @InjectModel(Hospital.name) private hospitalModel: Model<Hospital>,
    @InjectModel(Patient.name) private patientModel: Model<Patient>) {}

  async create(createHospitalDto: CreateHospitalDto): Promise<Hospital> { // 예시코드. 아무의미없음. 삭제예정
    const createdHospital = new this.hospitalModel(createHospitalDto);
    console.log(createdHospital);
    return createdHospital.save();
  }

  async createPatient(createPatientDto: CreatePatientDto) {
    var addedData: Patient;
    
  }

  @Cron('1 */5 * * * *') // 매 5분 1초마다 fx, gx 업데이트하는 함수
  async updateAllfxgx(){
    var time: number = this.GetTime();
    time = (288 + time - 1) % 288 // 여기 time 은 한단위 전 시간을 의미
    var allhospital = await this.findAll();
    for (let i = 0; i < allhospital.length; i++){
      // fx, gx 값 변경
      allhospital[i].fx[time] = allhospital[i].current_fx[time].length; allhospital[i].gx[time] = allhospital[i].current_gx[time].length;
      allhospital[i].fx[time] = allhospital[i].E_fx[time]; allhospital[i].gx[time] = allhospital[i].E_gx[time];
      for (let j = 0; j < Math.floor(allhospital[i].OuterMost / 5); j++){
        let a = (j + 1)**2 / (Math.floor(allhospital[i].OuterMost / 5))**2;
        allhospital[i].fx[(time + 1 + j)%288] = allhospital[i].current_fx[(time + 1 + j)%288].length + Math.floor(allhospital[i].E_fx[(time + 1 + j)%288] * a);
        allhospital[i].gx[(time + 1 + j)%288] = allhospital[i].current_gx[(time + 1 + j)%288].length + Math.floor(allhospital[i].E_gx[(time + 1 + j)%288] * a);
      }
      // fx, gx, prev_fx, Prev_gx, current_fx, current_gx 업데이트
      await this.hospitalModel.updateOne(
        {"id" : allhospital[i].id},
        {$set: {
          "prev_fx.${time}" : allhospital[i].current_fx[time], "prev_gx.${time}": allhospital[i].current_gx[time], 
          "current_fx.${time}": [], "current_gx.${time}": [], "fx": allhospital[i].fx, "gx": allhospital[i].gx}}
      );
    }
  }

  @Cron('20 */5 * * * *')
  async addFakefxgx(){

  }

  LowerSort(TargetList: [...number[][]]): number[][] { // 내림차순 정렬
    var min: number, tmp: number[] = [];
    for (let i = 0; i < TargetList.length; i++){
      min = i;
      for (let j = i; j < TargetList.length; j++){
        if (TargetList[min][1] > TargetList[j][1]){
          min = j;
        }
      }
      tmp = TargetList[i];
      TargetList[i] = TargetList[min];
      TargetList[min] = tmp;
    }
    return TargetList;
  }

  Ex(x: number): number{
    var tangent: number = 1.4;
    return tangent * x + 1;
  }

  ImpactFactor(fx: number[], gx: number[], arrival: number, delayed: number,Ce: number, Cn: number, k: number){ // Impactfactor 계산기
    var IM: number = 0;
    for (let i = arrival; i < arrival + delayed; i++){
      IM = IM + Math.max(1.4 * this.Integration(fx, (288 + arrival - Ce) % 288, arrival) + this.Integration(gx, (288 + arrival - Cn) % 288, arrival) - k, 0);
    }
    return this.Ex(IM);
  }

  async findAll(): Promise<Hospital[]> { // 모든 병원 찾아서 반환
    return this.hospitalModel.find().exec();
  }

  async findbyId_hospital(TargetId:number): Promise<Hospital> { // 아이디로 병원찾기
    return this.hospitalModel.findOne({id:TargetId});
  }

  async findbyId_patient(TargetId:string): Promise<Patient> { // 아이디로 환자찾기
    return this.patientModel.findOne({id:TargetId});
  }

  Integration(TargetList: number[], Start: number, End: number) : number{ // 적분. 마지막 포함
    var result: number = 0;
    for (let i = Start; i < End; i++){
        result = result + TargetList[i];
    }
    return result;
  }

  CalculateDelyedTime(fx : number[], gx : number[], arrival : number, Ce : number, Cn : number, k: number): number{ // 대기시간 계산 함수. 여기 arrival은 5분단위
    var result: number = 0;
    var target: number = this.Integration(fx, (288 + arrival - Ce) % 288, arrival) + this.Integration(gx, (288 + arrival - Cn) % 288, arrival) - k;
    var Var1: number = 0;
    while (Var1 < target){
        Var1 = Var1 + fx[(288 + arrival - Ce + result) % 288] + gx[(288 + arrival - Cn + result) % 288];
        result++;
    }
    return result;
  }

  GetTime(): number { // 현재 시간 5분단위로 나누어 반환. 내림
    var time: number;
    var today = new Date();
    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    time = (+hours)*60 + (+minutes);
    return Math.floor(time / 5);
  }

  GetPreciseTime(): number { // 현재 시간 1분단위로 나우어 반환. 내림
    var time: number;
    var today = new Date();
    var hours = ('0' + today.getHours()).slice(-2); 
    var minutes = ('0' + today.getMinutes()).slice(-2);
    return (+hours)*60 + (+minutes);
  }

  CalculateArrival(HA: number, HO: number, PA: number, PO: number): number{ // 도착시간 계산함수. api활용? 여기 arrival은 1분단위
    return Math.round((((((HA-PA)*1111900)**2 + ((HO-PO)*654322)**2)/823)/5));
  }
}
