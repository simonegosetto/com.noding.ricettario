# Checklist funzionale

Azioni utente della versione legacy (branch `master`, Ionic 4 + Angular 8), una riga per azione.
Serve come lista di controllo per verificare che il porting ad Angular 21 + Ionic 9 non perda funzionalità.

Legenda della colonna **Tipo**: `L` = sola lettura, `S` = scrittura su DB/Dropbox, `R` = report PHP (nuova finestra).

Sotto ogni sezione: cosa cambia nella nuova versione e quali test e2e (`e2e/*.spec.ts`, con backend
simulato) coprono le azioni. Le azioni `L` e `R` si possono verificare in produzione con `npm start`
(sola lettura); le `S` solo su record di prova con `readOnly: false`.

## Accesso e navigazione

| # | Azione | Tipo |
|---|---|---|
| A1 | Login con username e password; in caso di errore compare un toast | L |
| A2 | All'avvio senza token si viene portati su `/login`; con token si entra in `/home` | L |
| A3 | Menu laterale: Home, Ricette, Schede Produzione, Archivio, Listini Prezzi, Menù, Dizionario Ingredienti | L |
| A4 | Nel menu compaiono nome e cognome dell'utente | L |
| A5 | Logout dal menu (torna al login e cancella la sessione) | L |
| A6 | Sessione scaduta (errore "token" dal gateway): logout automatico | L |

**Nuova versione** — sessione scaduta: si torna al login con un avviso, senza ricaricare la pagina;
senza connessione compare un avviso fisso in alto. **Test**: `login.spec.ts`.

## Home

| # | Azione | Tipo |
|---|---|---|
| H1 | Pulsanti rapidi: Nuova Ricetta, Menù, Schede tecniche, Listini | L |
| H2 | Il blocco note condiviso si ricarica ogni volta che si entra nella pagina | L |
| H3 | Salva note (max 3000 caratteri) | S |

**Nuova versione** — la scorciatoia "Schede tecniche" porta a `/ricette?tipo=2` (nella legacy il link era
rotto); le note si salvano anche con gli apostrofi. **Test**: `home.spec.ts`.

## Ricette

| # | Azione | Tipo |
|---|---|---|
| R1 | Elenco ricette con filtro testuale sul nome | L |
| R2 | Selettore tipo: Ricette / Schede tecniche (ricarica dal server) | L |
| R3 | Pull-to-refresh dell'elenco | L |
| R4 | Nuova ricetta (apre `/ricetta/0`) | L |
| R5 | Apertura di una ricetta | L |
| R6 | Stampa ricetta (XML per le semplici, HTML per le composte) | R |
| R7 | Eliminazione ricetta con conferma | S |

**Nuova versione** — il tipo sta nell'URL (`?tipo=2`), quindi indietro/avanti del browser lo conservano.
**Test**: `elenchi.spec.ts`.

## Dettaglio ricetta (`/ricetta/:id`)

| # | Azione | Tipo |
|---|---|---|
| D1 | Modifica del nome (Invio salva) | S |
| D2 | Carica/aggiorna immagine (png/jpeg su Dropbox) | S |
| D3 | Visualizza ed elimina l'immagine | L / S |
| D4 | Aggiungi riga da ricerca ricette (sotto-ricetta, quantità 1) | S |
| D5 | Aggiungi riga da ricerca ingredienti (quantità 1) | S |
| D6 | Aggiungi riga libera (nome + quantità, Invio) | S |
| D7 | Modifica quantità di una riga (Invio) | S |
| D8 | Flag "escludi peso" su una riga | S |
| D9 | Elimina riga con conferma | S |
| D10 | Riordino delle righe con drag & drop | S |
| D11 | Modifica procedimento e "Salva Ricetta" | S |
| D12 | Card delle sotto-ricette (nome, immagine, ingredienti, percentuali), clic per aprirle | L |
| D13 | Pannello food cost: scelta listino (default: l'ultimo), righe con peso/kcal/costo, totali | L |
| D14 | Peso reale e prezzo di vendita IVA inclusa modificabili (Invio salva) | S |
| D15 | Ratio, prezzo netto IVA e margine | L |
| D16 | Stampa ricetta e stampa con food cost per il listino scelto | R |

**Nuova versione**
- Nuova ricetta: al primo salvataggio si passa a `/ricetta/<id>` (`/ricetta/0` non resta nella cronologia);
  righe, foto e food cost compaiono dopo il salvataggio.
- Prezzo di vendita e peso effettivo salvati dal food cost non vengono più sovrascritti dal salvataggio
  successivo di nome/procedimento (nella legacy tornavano ai valori letti all'apertura).
- Riordino corretto anche dopo il primo spostamento (nella legacy gli indici restavano quelli vecchi).
- Una ricetta non può diventare sotto-ricetta di se stessa.
- Dopo l'aggiunta di una riga il cursore va sulla sua quantità (già selezionata).
- Uscendo con nome o procedimento modificati e non salvati viene chiesta conferma.
- Foto ridotta a 1600 px prima dell'upload; stampa con food cost solo per le ricette composte
  (per le altre il report era identico a quello senza).
- Etichette in italiano: Ingredienti, Procedimento, Peso effettivo, Prezzo di vendita IVA incl.,
  Incidenza food cost, Prezzo IVA esclusa, Margine lordo (in rosso se negativo).

**Test**: `ricetta.spec.ts`.

## Schede di produzione

| # | Azione | Tipo |
|---|---|---|
| S1 | Elenco schede con filtro testuale e pull-to-refresh | L |
| S2 | Nuova scheda / modifica nome (modale descrizione) | S |
| S3 | Eliminazione scheda con conferma | S |
| S4 | Dettaglio: scelta listino (default: l'ultimo) | L |
| S5 | Dettaglio: aggiungi ricetta alla scheda (ricerca ricette) | S |
| S6 | Dettaglio: card per ricetta con ingredienti, percentuali e procedimento | L |
| S7 | Dettaglio: rimuovi ricetta dalla scheda con conferma | S |
| S8 | Stampa scheda tecnica, con e senza food cost | R |

**Nuova versione** — titolo della scheda letto dal backend (non più da `sessionStorage`); card ricetta
unica per schede e sotto-ricette, con testata e righe caricate in parallelo. **Test**: `scheda.spec.ts`,
`elenchi.spec.ts` (S2).

## Archivio documenti

| # | Azione | Tipo |
|---|---|---|
| F1 | Elenco di file e cartelle della cartella corrente, filtro testuale, pull-to-refresh | L |
| F2 | Navigazione nelle cartelle e pulsante "Indietro" verso la cartella padre | L |
| F3 | Titolo = nome della cartella corrente | L |
| F4 | Nuova cartella | S |
| F5 | Rinomina cartella | S |
| F6 | Elimina cartella e tutto il contenuto, con conferma | S |
| F7 | Carica file nella cartella corrente (record DB + upload Dropbox) | S |
| F8 | Scarica file (link temporaneo Dropbox) | L |
| F9 | Sposta file in un'altra cartella (modale con ricerca cartelle) | S |
| F10 | Elimina file (DB + Dropbox) con conferma | S |

**Nuova versione**
- La cartella aperta sta nell'URL (`?cartella=`): il tasto indietro del browser risale di livello.
- Caricamento di più file insieme, massimo 25 MB ciascuno; se l'upload su Dropbox fallisce il record
  appena creato viene rimosso (nella legacy restava un file "fantasma").
- Il file si apre toccando la riga (la finestra si apre subito, il browser non la blocca).
- Nei nomi dei file si vede l'estensione (PDF, JPG…); la conferma di eliminazione di una cartella
  dice quanti file e cartelle contiene.

**Test**: `archivio.spec.ts`.

## Listini prezzi

| # | Azione | Tipo |
|---|---|---|
| L1 | Elenco listini con filtro testuale e pull-to-refresh | L |
| L2 | Nuovo listino / modifica (nome + aliquota IVA %) | S |
| L3 | Eliminazione listino con conferma | S |
| L4 | Dettaglio: righe con scarto %, grammatura, prezzo, kcal | L |
| L5 | Dettaglio: filtro categoria (tutte, senza categoria, categorie) e filtro testuale | L |
| L6 | Dettaglio: info riga (categoria, provenienza, ricette che la usano) | L |
| L7 | Dettaglio: modifica riga (nome, scarto, peso, prezzo, kcal, categoria, provenienza) | S |
| L8 | Dettaglio: eliminazione riga con conferma | S |
| L9 | Dettaglio: aggiungi righe da ingrediente, da scheda tecnica, da menù (solo desktop) | S |
| L10 | Stampa listino per la categoria scelta | R |

**Nuova versione** — aggiunte al listino disponibili anche da telefono (action sheet "Aggiungi al listino").
**Test**: `listino.spec.ts`, `elenchi.spec.ts` (L2).

## Menù

| # | Azione | Tipo |
|---|---|---|
| M1 | Elenco menù con tipo (Alla Carta / Eventi), filtro testuale e pull-to-refresh | L |
| M2 | Nuovo menù / modifica (nome + tipo) | S |
| M3 | Eliminazione menù con conferma | S |
| M4 | Dettaglio: scelta listino (default: l'ultimo) | L |
| M5 | Alla carta: aggiungi piatto (ricerca ricetta + categoria obbligatoria) | S |
| M6 | Alla carta: elenco raggruppato per categoria con food cost e prezzo lordo | L |
| M7 | Alla carta: elimina piatto con conferma; clic sul piatto apre la ricetta | S / L |
| M8 | Evento: aggiungi piatto (ricerca ricetta) | S |
| M9 | Evento: riordino dei piatti con drag & drop | S |
| M10 | Evento: inserisci separatore sotto un piatto / elimina separatore | S |
| M11 | Evento: elimina piatto con conferma; clic sul piatto apre la ricetta | S / L |
| M12 | Evento: modifica pax e "% scheda tecnica" (Invio salva) | S |
| M13 | Evento: totali per coperto e per menù (costo, netto, IVA, lordo) | L |
| M14 | Stampe: alla carta; evento lista spesa, con food cost, BOM | R |

**Nuova versione**
- Alla carta: la categoria scelta resta selezionata per aggiungere più piatti di seguito.
- Evento: riordino corretto anche dopo il primo spostamento; coperti e percentuale validati.
- Righe e totali si ricaricano al cambio di listino senza sovrapporsi.
- Stampe dell'evento da un unico pulsante: lista della spesa, con food cost, distinta base (BOM).

**Test**: `menu.spec.ts`, `elenchi.spec.ts` (M2).

## Dizionario ingredienti (`/foodcost`)

| # | Azione | Tipo |
|---|---|---|
| Z1 | Elenco alimenti con valori nutrizionali (kcal, edibile, proteine, glucidi, amidi, lipidi) | L |
| Z2 | Filtro testuale sulla descrizione | L |

**Nuova versione** — elenco caricato una volta e scorrimento infinito sul filtro locale. **Test**: `elenchi.spec.ts`.

## Rimosso nel porting

- Pagine **Ingredienti** e **Ingrediente** (`/ingredienti`, `/ingrediente/:id`): nascoste dal menu e già non funzionanti nella versione legacy (il modulo lazy importava `AppModule`). La ricerca degli ingredienti dentro la ricetta resta.
