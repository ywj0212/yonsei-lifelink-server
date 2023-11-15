import { Module } from '@nestjs/common';
import { HospitalInformController, PatientInformController } from './patient-inform/patient-inform.controller';
import { PatientInformService } from './patient-inform/patient-inform.service';
import { MongooseModule } from '@nestjs/mongoose';
import { Hospital, HosptalSchema } from './schemas/hospital.schema';
import { Patient, PatientSchema } from './schemas/patient.schema';
import { ScheduleModule } from '@nestjs/schedule';

@Module({
  imports: [
    // IP 주소 등록이 안되서 안돌아가는 것이 정상
    MongooseModule.forRoot('mongodb+srv://minhyung0421:minmin8809!@life-link.yowbbnc.mongodb.net/?retryWrites=true&w=majority'),
    //MongooseModule.forRoot('mongodb+srv://minhyung0421:minmin8809@cluster0.x4dgjvu.mongodb.net/?retryWrites=true&w=majority'),
    MongooseModule.forFeature([{ name: Hospital.name , schema: HosptalSchema }]),
    MongooseModule.forFeature([{ name: Patient.name , schema: PatientSchema }]),
    ScheduleModule.forRoot()
  ],
  controllers: [PatientInformController, HospitalInformController],
  providers: [PatientInformService],
})
export class AppModule {}