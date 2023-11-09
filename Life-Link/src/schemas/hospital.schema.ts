import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { HydratedDocument } from 'mongoose';
import { Patient } from './patient.schema';

@Schema()
export class Hospital{
    @Prop() // 아이디
    Id: number

    @Prop() // 병원이름
    name: string

    @Prop() // 위도
    latitude: number[]

    @Prop() // 경도
    longitude: number[]

    @Prop() // 예측 + 실제 응급환자 유입 함수
    fx: number[]

    @Prop() // 예측 + 실제 경상환자 유입 함수
    gx: number[]

    @Prop() // 현재시간 기준 병원에 도착한 응급환자
    prev_fx: Patient[][]

    @Prop() // 현재시간 기준 병원에 도착한 경상환자
    prev_gx: Patient[][]

    @Prop() // 현재시간 기준 병원으로 향하고 있는 응급환자
    current_fx: Patient[][]

    @Prop() // 현재시간 기준 병원으로 향하고 있는 경상환자
    current_gx: Patient[][]

    @Prop() // 기존 예측자료. 응급환자
    E_fx: number[]

    @Prop() // 기존 예측자료. 경상환자
    E_gx: number[]

    @Prop() // 응급실 병상 수
    K: number

    @Prop() // 경상환자 순환 시간
    Cn: number

    @Prop() // 응급환자 순환 시간
    Ce: number

    @Prop() // 최외각환자 평균 이동시간
    OuterMost: number
}

export const HosptalSchema = SchemaFactory.createForClass(Hospital);