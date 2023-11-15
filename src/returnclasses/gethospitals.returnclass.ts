export class GETHOSPITALS_RETURN{
    
    id: number
    name: string
    type: string
    distance: number
    trasferringPatient: number
    currentCongestion: number
    arrivalCongestion: number
    emBedExists: number
    emBedOccupied: number
    icuBedExists: number
    icuBedOccupied: number

    constructor(id: number,
        name: string,
        type: string,
        distance: number,
        trasferringPatient: number,
        currentCongestion: number,
        arrivalCongestion: number,
        emBedExists: number,
        emBedOccupied: number,
        icuBedExists: number,
        icuBedOccupied: number) {
            this.id = id;
            this.name = name;
            this.type = type;
            this.distance = distance;
            this.trasferringPatient = trasferringPatient;
            this.currentCongestion = currentCongestion;
            this.arrivalCongestion = arrivalCongestion;
            this.emBedExists = emBedExists;
            this.emBedOccupied = emBedOccupied;
            this.icuBedExists = icuBedExists;
            this.icuBedOccupied = icuBedOccupied;
        }
}