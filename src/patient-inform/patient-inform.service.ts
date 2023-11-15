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

  async createPatient(createPatientDto: CreatePatientDto, arrival: number, UpdateTime: number): Promise<Patient>{
    var TargetHospital: Hospital = await this.findbyId_hospital(createPatientDto.hospitalId);
    var result: Patient = {
      id: ++TargetHospital.patientscountforid + (createPatientDto.hospitalId * 0.1),
      name: createPatientDto.name,
      expectedArrival: arrival, // time + arrival 
      sex: createPatientDto.sex,
      age: createPatientDto.age,
      preKTAS: createPatientDto.preKTAS,
      latitude: createPatientDto.latitude,
      longitude: createPatientDto.longitude,
      updateTime: UpdateTime,
      gido: createPatientDto.gido,
      isBreathing: createPatientDto.isBreathing,
      breathDepth: createPatientDto.breathDepth,
      bloodPressure: createPatientDto.bloodPressure,
      beat: createPatientDto.beat,
      isBleeding: createPatientDto.isBleeding,
      consciousness: createPatientDto.consciousness,
      HospitalId: createPatientDto.hospitalId
    };
    if (createPatientDto.preKTAS < 4){
      TargetHospital.current_fx[(288 + Math.floor(arrival / 5)) % 288].push(result);
    } else {
      TargetHospital.current_gx[(288 + Math.floor(arrival / 5)) % 288].push(result);
    }
    await this.hospitalModel.updateOne(
      {"id" : createPatientDto.hospitalId},
      {$set: {
        "current_fx" : TargetHospital.current_fx, "current_gx" : TargetHospital.current_gx,
        "patientscountforid": TargetHospital.patientscountforid
      }}
    );
    const a = new this.patientModel(result);
    return a.save();
  }

  async deletePatientData(patientId: number, hospitalId: number){
    var TargetHospital: Hospital = await this.findbyId_hospital(hospitalId);
    var TargetPatient: Patient = await this.findbyId_patient(patientId);
    var changedcurrentfxorgx: Patient[] = [];
    if (TargetPatient.preKTAS < 4){
      for (let i = 0; i < TargetHospital.current_fx[(288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288].length; i++){
        var countstart: number = 0;
        if (TargetHospital.current_fx[(288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288][i].id == patientId){
          countstart = -1;
        } else {
          changedcurrentfxorgx[i + countstart] = TargetHospital.current_fx[(288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288][i];
        }
      }
      await this.hospitalModel.updateOne(
        {"id" : hospitalId},
        {$set: {
          ["current_fx." + (288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288] : changedcurrentfxorgx
        }}
      );
    } else {
      for (let i = 0; i < TargetHospital.current_gx[(288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288].length; i++){
        var countstart: number = 0;
        if (TargetHospital.current_gx[(288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288][i].id == patientId){
          countstart = -1;
        } else {
          changedcurrentfxorgx[i + countstart] = TargetHospital.current_gx[(288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288][i];
        }
      }
      await this.hospitalModel.updateOne(
        {"id" : hospitalId},
        {$set: {
          ["current_gx." + (288 + Math.floor(TargetPatient.expectedArrival / 5)) % 288] : changedcurrentfxorgx
        }}
      )
    }
    return 200;
  }

  /*async changePatientData(changedPatient: Patient) : Promise<Patient>{
    await this.patientModel.updateOne(
      {"id" : changedPatient.id},
      {$set: {
        ""
      }}
    );
  }*/

  async createHospital(): Promise<Hospital[]>{
    var NewHopsitals: Hospital[] = [];
    var HospitalNames: string[] = [
      "의료법인나사렛의료재단나사렛국제병원",
      "인천적십자병원",
      "인천힘찬종합병원",
      "의료법인길의료재단길병원",
      "인천사랑병원",
      "의료법인남촌의료재단시화병원",
      "현대유비스병원",
      "인하대학교의과대학부속병원",
      "의료법인석경의료재단센트럴병원",
      "인천기독병원"
    ];
    var HospitalLatitude: number[] = [
      126.670502,
      126.689650,
      126.714830,
      126.709232,
      126.680579,
      126.737033,
      126.642995,
      126.634154,
      126.728189,
      126.632106
    ];
    var HospitalLongitude: number[] = [
      37.407981,
      37.418004,
      37.400971,
      37.451573,
      37.426126,
      37.349798,
      37.461382,
      37.458741,
      37.336544,
      37.471223
    ];
    var HospitalType: string[] = [
      "지역응급의료센터",
      "지역응급의료기관",
      "지역응급의료기관",
      "권역응급의료센터",
      "지역응급의료센터",
      "지역응급의료센터",
      "지역응급의료기관",
      "권역응급의료센터",
      "지역응급의료기관",
      "지역응급의료기관"
    ];
    var doublearray: Patient[][] = [];
    for (let i = 0; i < 288; i++){
      doublearray[i] = [];
    }
    for (let i = 0; i < 10; i++){
      var efx: number[] = [];
      var egx: number[] = [];
      for (let j = 0; j < 144; j++){
        efx[(j * 2)] = 0; efx[(j * 2) + 1] = 0;
        efx[(j * 2) + Math.floor(Math.random() * 2)] += 1;
      }
      for (let j = 0; j < 72; j++){
        egx[(j * 4)] = 0; egx[(j * 4) + 1] = 0; egx[(j * 4) + 2] = 0; egx[(j * 4) + 3] = 0;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
        egx[(j * 4) + Math.floor(Math.random() * 4)] += 1;
      }
      NewHopsitals[i] = {
        id: i,
        name: HospitalNames[i],
        type: HospitalType[i],
        latitude: HospitalLatitude[i],
        longitude: HospitalLongitude[i],
        fx: [],
        gx: [],
        prev_fx: doublearray,
        prev_gx: doublearray,
        current_fx: doublearray,
        current_gx: doublearray,
        E_fx: efx,
        E_gx: egx,
        K: 120,
        Cn: 36,
        Ce: 72,
        OuterMost_fx: 30,
        OuterMost_gx: 30,
        patientscountforid: 0,
        AutoGenerate_current_fx: [[], [], [], [], []],
        AutoGenerate_current_gx: [[], [], [], [], []]
      };
      const a = new this.hospitalModel(NewHopsitals[i]);
      await a.save();
    }
    return NewHopsitals;
  }

  @Cron('0 */5 * * * *') // 매 5분 0초마다 fx, gx 업데이트하는 함수
  async updateAllfxgx(){
    var time: number = this.GetTime();
    time = (288 + time - 1) % 288 // 여기 time 은 한단위 전 시간을 의미
    var allhospital = await this.findAll();
    for (let i = 0; i < allhospital.length; i++){
      // fx, gx 값 변경
      allhospital[i].fx[time] = allhospital[i].current_fx[time].length; 
      allhospital[i].gx[time] = allhospital[i].current_gx[time].length;
      for (let j = 0; j < Math.floor(allhospital[i].OuterMost_fx / 5); j++){
        let a = (j + 1)**2 / (Math.floor(allhospital[i].OuterMost_fx / 5))**2;
        let p = 0;
        for (let k = 0; k < allhospital[i].E_fx[(time + 1 + j)%288]; k++){
          if (Math.random() / a < 1){
            p += 1;
          }
        }
        allhospital[i].fx[(time + 1 + j)%288] = allhospital[i].current_fx[(time + 1 + j)%288].length + p;
      }
      for (let j = 0; j < Math.floor(allhospital[i].OuterMost_gx / 5); j++){
        let a = (j + 1)**2 / (Math.floor(allhospital[i].OuterMost_gx / 5))**2;
        let p = 0;
        for (let k = 0; k < allhospital[i].E_gx[(time + 1 + j)%288]; k++){
          if (Math.random() / a < 1){
            p += 1;
          }
        }
        allhospital[i].gx[(time + 1 + j)%288] = allhospital[i].current_gx[(time + 1 + j)%288].length + p;
      }
      allhospital[i].fx[(time + 144) % 288] = allhospital[i].E_fx[(time + 144) % 288];
      allhospital[i].gx[(time + 144) % 288] = allhospital[i].E_gx[(time + 144) % 288];
      // 환자 자동생성 양상 뽑기
      var RandomUpdate_fx: number[][] = [[], [], [], [], []];
      var RandomUpdate_gx: number[][] = [[], [], [], [], []];
      for (let j = 0; j < Math.floor(allhospital[i].OuterMost_fx / 5) + 1; j++){
        let a = (j + 1)**2 / (Math.floor(allhospital[i].OuterMost_fx / 5))**2;
        let b = (j)**2 / (Math.floor(allhospital[i].OuterMost_fx / 5))**2;
        let p = 0;
        for (let k = 0; k < allhospital[i].E_fx[(time + i + j)%288]; k++){
          if (Math.random() / (a - b) < 1){
            p += 1;
          }
        }
        for (let k = 0; k < p; k++){
          RandomUpdate_fx[Math.floor(Math.random() * 5)].push(j);
        }
      }
      for (let j = 0; j < Math.floor(allhospital[i].OuterMost_gx / 5) + 1; j++){
        let a = (j + 1)**2 / (Math.floor(allhospital[i].OuterMost_gx / 5))**2;
        let b = (j)**2 / (Math.floor(allhospital[i].OuterMost_gx / 5))**2;
        let p = 0;
        for (let k = 0; k < allhospital[i].E_gx[(time + i + j)%288]; k++){
          if (Math.random() / (a - b) < 1){
            p += 1;
          }
        }
        for (let k = 0; k < p; k++){
          RandomUpdate_gx[Math.floor(Math.random() * 5)].push(j);
        }
      }
      // fx, gx, prev_fx, Prev_gx, current_fx, current_gx 업데이트
      await this.hospitalModel.updateOne(
        {"id" : allhospital[i].id},
        {$set: {
          [`prev_fx.${time}`] : allhospital[i].current_fx[time], [`prev_gx.${time}`]: allhospital[i].current_gx[time], 
          [`current_fx.${time}`] : [], [`current_gx.${time}`] : [], "fx": allhospital[i].fx, "gx": allhospital[i].gx,
          "AutoGenerate_current_fx": RandomUpdate_fx, "AutoGenerate_current_gx": RandomUpdate_gx}}
      );
    }
  }

  @Cron('5 */1 * * * *')
  async updateFakefxgx(){
    var dtime = Math.floor(this.GetPreciseTime() % 5);
    var time = this.GetTime();
    var TargetHospitals: Hospital[] = await this.findAll();
    //console.log("Before update - TargetHospitals.length:", TargetHospitals.length);
    //console.log(TargetHospitals.length);
    for (let i = 0; i < TargetHospitals.length; i++){
      var addedPatient: Patient[] = [];
      for (let k = 0; k < TargetHospitals[i].AutoGenerate_current_fx[dtime].length; k++){
        addedPatient.push(await this.generateFakePatient(++TargetHospitals[i].patientscountforid, TargetHospitals[i].id, TargetHospitals[i].AutoGenerate_current_fx[dtime][k] + time, 0));
        TargetHospitals[i].current_fx[(288 + TargetHospitals[i].AutoGenerate_current_fx[dtime][k] + time) % 288].push(addedPatient[k]);
      }
      
      for (let k = 0; k < TargetHospitals[i].AutoGenerate_current_gx[dtime].length; k++){
        addedPatient.push(await this.generateFakePatient(++TargetHospitals[i].patientscountforid, TargetHospitals[i].id, TargetHospitals[i].AutoGenerate_current_gx[dtime][k] + time, 1));
        TargetHospitals[i].current_gx[(288 + TargetHospitals[i].AutoGenerate_current_gx[dtime][k] + time) % 288].push(addedPatient[k]);
      }
      //console.log(addedPatient);
      //console.log(`Before update - current_fx[${time}] length:`, TargetHospitals[i].current_fx[time].length);
      //console.log(`Before update - current_gx[${time}] length:`, TargetHospitals[i].current_gx[time].length);
      await this.patientModel.insertMany(addedPatient);
      await this.hospitalModel.updateOne(
        {"id" : TargetHospitals[i].id},
        {$set: {
          [`current_fx.${time}`] : TargetHospitals[i].current_fx[time], [`current_gx.${time}`] : TargetHospitals[i].current_gx[time],
          "patientscountforid" : TargetHospitals[i].patientscountforid
        }}
      );
      //console.log(`After update - current_fx[${time}] length:`, TargetHospitals[i].current_fx[time].length);
      //console.log(`After update - current_gx[${time}] length:`, TargetHospitals[i].current_gx[time].length);
    }
    //console.log("After update - TargetHospitals.length:", TargetHospitals.length);
    //console.log("\n");
  }

  async generateFakePatient(idcount: number, hospitalId: number, arrival: number, urgent: number, randarrival: number = Math.floor(Math.random() * 5)): Promise<Patient>{
    var FakePatientName: string[][] = [["임서준", "이예준", "최주원", "박서준", "김시우", "조예준", "윤하준", "이하준", "김도윤", "장예준", "박지호", "강예준", "임서준", "장서준", "정도윤", "임민준", "정하준", "이지후", "이준우", "조도윤", "장서준", "김서준", "이준우", "박시우", "강예준", "조지후", "최도윤", "최민준", "박준서", "윤하준", "강지호", "장민준", "박시우", "최준우", "김준서", "최하준", "김예준", "장도윤", "임지후", "강지후", "이민준", "강민준", "최지후", "강하준", "김하준", "강지후", "장하준", "임시우", "강민준", "김민준", "박시우", "박민준", "이민준", "조하준", "강지호", "조도윤", "임지후", "조서준", "장시우", "강시우", "정도윤", "임서준", "이예준", "강준서", "윤서준", "김시우", "강지후", "임시우", "강준서", "강지후", "장준우", "조도윤", "박지호", "강서준", "윤준서", "조준우", "윤주원", "정도윤", "조지호", "정지후", "이하준", "이주원", "조준서", "최준우", "임하준", "장주원", "윤서준", "김준우", "윤시우", "윤도윤", "정도윤", "장주원", "김시우", "강민준", "정주원", "조지호", "박지후", "정지후", "윤민준", "윤준우"], ["장하은", "임지유", "임서연", "강지민", "임하은", "강하윤", "정서현", "장수아", "정지유", "윤서윤", "장하은", "윤민서", "최민서", "이서현", "윤서윤", "임지우", "정지우", "이하윤", "정서연", "강지유", "최민서", "박하은", "최지우", "최서윤", "강수아", "윤서윤", "이채원", "김서현", "조서연", "김수아", "정지유", "최민서", "정지유", "윤민서", "강채원", "김채원", "박서연", "최채원", "장지민", "박채원", "임채원", "정하은", "강지민", "강서연", "박하은", "박민서", "강지민", "강민서", "장서현", "박서현", "정지민", "이민서", "정지유", "박채원", "이민서", "임서연", "강지유", "윤지민", "윤민서", "임서연", "최채원", "김서현", "임지유", "윤수아", "김하은", "조하은", "조민서", "장지민", "강서연", "강하은", "강채원", "강채원", "정서연", "조서현", "조하은", "박채원", "윤채원", "최하은", "이지우", "조수아", "최서현", "정하윤", "이서연", "윤수아", "박수아", "김하윤", "김서윤", "조지민", "임수아", "강지우", "김하윤", "박민서", "윤민서", "김민서", "이서윤", "김하윤", "조서연", "이민서", "임수아", "최채원"]];
    var FakePatientSex: string[] = ['M', 'W'];
    var FakePatientGido: string[] = ['open', 'patent', 'effective'];
    var FakePatientIsBreathing: boolean[] = [true, false];
    var FakePatientBreathDepth: string[] = ['shallow', 'normal'];
    var FakePatientBloodPressure: string[] = ['고혈압', '정상', '저혈압'];
    var FakePatientBeat: string[] = ['빈맥', '정상', '서맥'];
    var FakePatientConsciousness: string[] = ['coma', 'semicoma', 'stupor', 'drowsy', 'alert'];
    var Patientsex: number = Math.floor(Math.random() * 2);
    if (urgent == 0){
      var result: Patient = {
        id: idcount + (hospitalId * 0.1),
        name: FakePatientName[Patientsex][Math.floor(Math.random() * 100)],
        expectedArrival: ((arrival * 5) + randarrival),
        sex: FakePatientSex[Patientsex],
        age: 10 + Math.floor(Math.random() * 30),
        preKTAS: Math.floor(Math.random() * 8) - 4,
        latitude: 126.680000,
        longitude: 37.400000,
        updateTime: 1,
        gido: FakePatientGido[Math.floor(Math.random() * 3)],
        isBreathing: FakePatientIsBreathing[Math.floor(Math.random() * 2)],
        breathDepth: FakePatientBreathDepth[Math.floor(Math.random() * 2)],
        bloodPressure: FakePatientBloodPressure[Math.floor(Math.random() * 3)],
        beat: FakePatientBeat[Math.floor(Math.random() * 3)],
        isBleeding: FakePatientIsBreathing[Math.floor(Math.random() * 2)],
        consciousness: FakePatientConsciousness[Math.floor(Math.random() * 5)],
        HospitalId: hospitalId
      };
      return result;
      
    } else if (urgent == 1){
      var result: Patient = {
        id: idcount + (hospitalId * 0.1),
        name: FakePatientName[Patientsex][Math.floor(Math.random() * 100)],
        expectedArrival: ((arrival * 5) + Math.floor(Math.random() * 5)),
        sex: FakePatientSex[Patientsex],
        age: 10 + Math.floor(Math.random() * 30),
        preKTAS: Math.floor(Math.random() * 2) + 4,
        latitude: 126.680000,
        longitude: 37.400000,
        updateTime: 1,
        gido: FakePatientGido[Math.floor(Math.random() * 3)],
        isBreathing: FakePatientIsBreathing[Math.floor(Math.random() * 2)],
        breathDepth: FakePatientBreathDepth[Math.floor(Math.random() * 2)],
        bloodPressure: FakePatientBloodPressure[Math.floor(Math.random() * 3)],
        beat: FakePatientBeat[Math.floor(Math.random() * 3)],
        isBleeding: FakePatientIsBreathing[Math.floor(Math.random() * 2)],
        consciousness: FakePatientConsciousness[Math.floor(Math.random() * 5)],
        HospitalId: hospitalId
      };
      return result;
    }
  }

  async Addfakefxgx(): Promise<Hospital[]>{
    var TargetHospitals: Hospital[] = await this.findAll();
    var time: number = this.GetTime();
    //console.log(TargetHospitals.length);
    for (let i = 0; i < TargetHospitals.length; i++){

      // prev_fx, prev_gx 생성
      for (let j = 0; j < 288; j++){
        var FakePatient: Patient[] = [];
        var FakePatient2: Patient[] = [];
        for (let k = 0; k < TargetHospitals[i].E_fx[j]; k++){
          FakePatient[k] = await this.generateFakePatient(++TargetHospitals[i].patientscountforid, TargetHospitals[i].id, j, 0);
        }
        for (let k = 0; k < TargetHospitals[i].E_gx[j]; k++){
          FakePatient2[k] = await this.generateFakePatient(++TargetHospitals[i].patientscountforid, TargetHospitals[i].id, j, 1);
        }
        TargetHospitals[i].prev_fx[j] = FakePatient;
        TargetHospitals[i].prev_gx[j] = FakePatient2;
      }
      //console.log(TargetHospitals[i].prev_gx);

      //console.log(FakePatient);
      //console.log(FakePatient2);
      // current_fx, current_gx 생성
      for (let j = 0; j < Math.floor(TargetHospitals[i].OuterMost_fx / 5); j++){
        var FakePatient3: Patient[] = [];
        var FakePatient4: Patient[] = [];
        var RB: number = (1 - ((j + 1)**2 / (Math.floor(TargetHospitals[i].OuterMost_fx / 5))**2));
        let p = 0;
        for (let k = 0; k < TargetHospitals[i].E_fx[(time + j) % 288]; k++){
          if (Math.random() / (RB) < 1){
            p += 1;
          }
        }
        for (let k = 0; k < p; k++){
          FakePatient3[k] = await this.generateFakePatient(++TargetHospitals[i].patientscountforid, TargetHospitals[i].id, (time + j) % 288, 0);
        }
        p = 0;
        for (let k = 0; k < TargetHospitals[i].E_gx[(time + j) % 288]; k++){
          if (Math.random() / (RB) < 1){
            p += 1;
          }
        }
        for (let k = 0; k < p; k++){
          FakePatient4[k] = await this.generateFakePatient(++TargetHospitals[i].patientscountforid, TargetHospitals[i].id, (time + j) % 288, 1);
        }
        TargetHospitals[i].current_fx[time + j] = FakePatient3;
        TargetHospitals[i].current_gx[time + j] = FakePatient4;
      }
      //console.log(FakePatient3);
      //console.log(FakePatient4);

      // fx, gx 생성
      for (let j = 0; j < 144; j++){
        TargetHospitals[i].fx[(time + j) % 288] = TargetHospitals[i].E_fx[(time + j) % 288];
        TargetHospitals[i].gx[(time + j) % 288] = TargetHospitals[i].E_gx[(time + j) % 288];
      }
      for (let j = 144; j < 288; j++){
        TargetHospitals[i].fx[(time + j) % 288] = TargetHospitals[i].prev_fx[(time + j) % 288].length;
        TargetHospitals[i].gx[(time + j) % 288] = TargetHospitals[i].prev_gx[(time + j) % 288].length;
      }

      // db 업데이트
      await this.patientModel.insertMany(FakePatient);
      await this.patientModel.insertMany(FakePatient2);
      await this.patientModel.insertMany(FakePatient3);
      await this.patientModel.insertMany(FakePatient4);
      await this.hospitalModel.updateOne(
        {"id" : TargetHospitals[i].id},
        {$set: {
          "prev_fx" : TargetHospitals[i].prev_fx, "prev_gx" : TargetHospitals[i].prev_gx, 
          "current_fx" : TargetHospitals[i].current_fx, "current_gx" : TargetHospitals[i].current_gx, 
          "fx": TargetHospitals[i].fx, "gx": TargetHospitals[i].gx,
          "patientscountforid": TargetHospitals[i].patientscountforid}}
      );
    }
    return TargetHospitals;
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

  ImpactFactor(fx: number[], gx: number[], arrival: number, delayed: number, Ce: number, Cn: number, k: number){ // Impactfactor 계산기
    var IM: number = 0;
    for (let i = arrival; i < arrival + delayed; i++){
      IM = IM + Math.max(1.4 * this.Integration(fx, (288 + arrival - Ce) % 288, arrival) + this.Integration(gx, (288 + arrival - Cn) % 288, arrival) - k, 0);
    }
    return this.Ex(IM);
  }

  async findAll(): Promise<Hospital[]> { // 모든 병원 찾아서 반환
    return this.hospitalModel.find({});
  }

  async findbyId_hospital(TargetId:number): Promise<Hospital> { // 아이디로 병원찾기
    return this.hospitalModel.findOne({id:TargetId});
  }

  async findbyId_patient(TargetId: number): Promise<Patient> { // 아이디로 환자찾기
    return this.patientModel.findOne({id:TargetId});
  }

  Integration(TargetList: number[], Start: number, End: number) : number{ // 적분. 마지막 포함
    var result: number = 0;
    for (let i = Start; i < End; i++){
        result = result + TargetList[(288 + i)%288];
    }
    return result;
  }

  CalculateDelyedTime(fx : number[], gx : number[], arrival : number, Ce : number, Cn : number, k: number): number{ // 대기시간 계산 함수. 여기 arrival은 5분단위
    var result: number = 0;
    //console.log(arrival, Ce);
    var target: number = this.Integration(fx, arrival - Ce, arrival) + this.Integration(gx, arrival - Cn, arrival);
    //console.log(target);
    target = target - k;
    if (target < 0){
      target = 0;
    }
    //console.log(target);
    var Var1: number = 0;
    while (Var1 < target){
        Var1 = Var1 + fx[(288 + arrival - Ce + result) % 288] + gx[(288 + arrival - Cn + result) % 288];
        result++;
    }
    return result;
  }

  /*CalculateDelyedTime(fx: number[], gx: number[], arrival: number, Ce: number, Cn: number, k: number): number {
    console.log(arrival )
    var result: number = 0;
    var resultFx: number = 0;
    var resultGx: number = 0;
    var target: number = this.Integration(fx, arrival - Ce, arrival) + this.Integration(gx, arrival - Cn, arrival) - k;
    
    while (resultFx + resultGx < target) {
        resultFx = this.Integration(fx, (288 + arrival - Ce) % 288, (288 + arrival - Ce + result) % 288);
        resultGx = this.Integration(gx, (288 + arrival - Cn) % 288, (288 + arrival - Cn + result) % 288);
        
        console.log(`resultFx: ${resultFx}, resultGx: ${resultGx}, target: ${target}`);
        
        result++;
    }

    return result;
}*/

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
    return Math.round((((((HA-PA)*1111900)**2 + ((HO-PO)*654322)**2)**(1/2)/10/823)/5));
  }

  CalculateDistance(HA: number, HO: number, PA: number, PO: number): number{
    return Math.round((((HA-PA)*1111900)**2 + ((HO-PO)*654322)**2)**(1/2)/10);
    //return Math.round(((HA-PA)**2 + (HO-PO)**2)**(1/2)*1111900);
  }

  CalculateTransferringPatient(current_fx: Patient[][], current_gx: Patient[][]): number{
    var result: number = 0;
    for (let i = 0; i < 288; i++){
      result += (current_fx[i].length + current_gx[i].length)
    }
    return result;
  }

  CalculateCongestion(fx : number[], gx : number[], arrival : number, Ce : number, Cn : number, k: number): number{ // 대기시간 계산 함수. 여기 arrival은 5분단위
    var target: number = this.Integration(fx, (288 + arrival - Ce) % 288, arrival) + this.Integration(gx, (288 + arrival - Cn) % 288, arrival) / k;
    target =  Math.floor(target * 4);
    if (target > 3){
      target = 3;
    }
    return target;
  }

  CalculateOccupied(fx : number[], gx : number[], arrival : number, Ce : number, Cn : number): number{ // 대기시간 계산 함수. 여기 arrival은 5분단위
    var target: number = this.Integration(fx, (288 + arrival - Ce) % 288, arrival) + this.Integration(gx, (288 + arrival - Cn) % 288, arrival);
    return target;
  }

  async Deleteall() : Promise<number>{
    await this.patientModel.deleteMany({});
    await this.hospitalModel.deleteMany({});
    return 200;
  }
}
