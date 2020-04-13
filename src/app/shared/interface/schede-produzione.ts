export interface SchedeProduzione {
    id: number;
    descrizione: string;
}

export type SchedeProduzioneRead = Readonly<SchedeProduzione>;

export interface SchedeProduzioneRighe {
    id: number;
    schedaproduzioneid: number;
    ricettaid: number;

}
