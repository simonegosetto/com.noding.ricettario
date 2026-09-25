export interface Ricetta {
    cod_p: number;
    nome_ric: string;
    procedimento: string;
    data_ins: Date;
    image: string;
    chef: string;
    peso: number;
    ingredienti: string;
    peso_effettivo?: number;
    prezzo_vendita?: number;
}
