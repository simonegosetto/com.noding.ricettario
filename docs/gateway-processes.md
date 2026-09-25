# Process del gateway dati

<!-- File generato da scripts/gateway-processes-doc.ts: non modificarlo a mano. -->

Il frontend chiama `FD_DataServiceGatewayCrypt.php?gest=2` con il body JSON
`{type: 1, process, params, token}`. `process` è un id cifrato che il PHP risolve nella stored
procedure da eseguire; `params` è la lista posizionale dei parametri già formattati come letterali
SQL (stringhe tra apici, parametri OUT come `@nome`), costruita con `sql.*` di
`src/app/core/api/gateway-params.ts`. La risposta è `{recordset, output}` oppure `{error}`.

Process usati: **58** (25 letture, 33 scritture). In sviluppo le scritture
sono bloccate dal `readOnlyInterceptor`.

## Note per il backend NestJS

- Ogni process corrisponde a un endpoint: le letture a `GET`, le scritture a `POST`/`PUT`/`DELETE`.
- Il PHP compone la chiamata concatenando `params`: va sostituito da prepared statement
  (`CALL sp(?, ?, @out)`) sulle stesse stored procedure. Oggi è un vettore di SQL injection.
- Il token viaggia nel body e, per i report, in query string: va spostato in un header
  `Authorization`.
- Le implementazioni da sostituire sono i `Gateway*Repository` in `src/app/data/`.
- Archivio: il caricamento di un file è in due passi (record con `ARCHIVIO_FILE_INSERT`, poi
  upload Dropbox con `out_id` come nome) e il client rimuove il record se l'upload fallisce;
  un endpoint unico (multipart) lo renderebbe atomico. `ARCHIVIO_CARTELLA_DELETE` elimina i
  record ma lascia su Dropbox i file delle cartelle eliminate.

## Home

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `NOTE_GET` | lettura | — | recordset[0].note | `msttQNbH…` |
| `NOTE_UPDATE` | scrittura | 'testo' | — | `7RRAJLms…` |

## Ricette

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `RICETTE_LIST` | lettura | tipo (1 ricette, 2 schede tecniche) | recordset: cod_p, nome_ric, composta | `uZ+/JDG/…` |
| `RICETTE_SEARCH` | lettura | 'testo' (min. 3 caratteri) | recordset: cod_p, nome_ric | `3kLcd3xP…` |
| `SCHEDE_TECNICHE_SEARCH` | lettura | 'testo' (min. 3 caratteri) | recordset: cod_p, nome_ric | `HxyjRLDE…` |
| `RICETTA_GET` | lettura | cod_p (anche lista di cod_p per le stampe) | recordset[0]: testata ricetta | `3K2t3jzx…` |
| `RICETTA_SAVE` | scrittura | cod_p, 'nome_ric', 'procedimento', prezzo_vendita, peso_effettivo, @out_id | output[0].out_id = cod_p | `yQyvP6kw…` |
| `RICETTA_DELETE` | scrittura | cod_p | — | `bLOf0dGT…` |
| `RICETTA_RIGHE` | lettura | cod_p | recordset: id, nome, quantita, perc, ricettaid, escludi_peso | `SK1mkQH9…` |
| `RICETTA_RIGA_INSERT` | scrittura | 'nome', quantita, ricettaid, cod_p, ingredienteid | — | `3FdtgGhT…` |
| `RICETTA_RIGA_UPDATE` | scrittura | id, 'nome', quantita, ricettaid, cod_p, escludi_peso (1/0) | — | `6zQerYGH…` |
| `RICETTA_RIGA_DELETE` | scrittura | id, cod_p | — | `vfJfFKZb…` |
| `RICETTA_RIGA_MOVE` | scrittura | id, nuova posizione (da 1), cod_p | — | `3mCyL/kB…` |
| `RICETTA_SOTTORICETTE` | lettura | cod_p | recordset: ricettaid | `VwCLXZp2…` |
| `RICETTA_FOODCOST_RIGHE` | lettura | cod_p, listinoid | recordset: descrizione, peso, kcal, foodcost | `LFC27QWy…` |
| `RICETTA_FOODCOST_TOTALI` | lettura | cod_p, listinoid | recordset[0]: peso, foodcost, kcal, peso_effettivo, prezzo_lordo_vendita, ratio, prezzo_netto_vendita, margine_netto | `qowr/0gb…` |

## Ingredienti

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `INGREDIENTI_LIST` | lettura | — | recordset: id, descrizione | `92Z51ruE…` |
| `INGREDIENTI_SEARCH` | lettura | 'testo' (min. 3 caratteri) | recordset: id, descrizione | `dXBEtMkB…` |
| `CATEGORIE_INGREDIENTI_LIST` | lettura | — | recordset: id, descrizione | `gKAvUn6c…` |

## Listini

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `LISTINI_LIST` | lettura | — | recordset: id, descrizione, aliquota | `BnnFe0vU…` |
| `LISTINO_SAVE` | scrittura | id (0 = nuovo), 'descrizione', aliquota | — | `+qE5v3SY…` |
| `LISTINO_DELETE` | scrittura | id | — | `O8ucerAG…` |
| `LISTINO_RIGHE` | lettura | listinoid, categoria (0 tutte, 999 senza categoria) | recordset: righe del listino | `j8nnE18D…` |
| `LISTINO_RIGA_UPDATE` | scrittura | id, scarto, grammatura, prezzo, categoriaid, kcal, 'descrizione', 'provenienza' | — | `/nGnbEpk…` |
| `LISTINO_RIGA_DELETE` | scrittura | id | — | `OemnSwfi…` |
| `LISTINO_ADD_INGREDIENTE` | scrittura | listinoid, ingredienteid | — | `E+pKhhlK…` |
| `LISTINO_ADD_SCHEDA_TECNICA` | scrittura | listinoid, cod_p | — | `M+znAuYq…` |
| `LISTINO_ADD_MENU` | scrittura | menuid, listinoid (ordine invertito rispetto agli altri) | — | `QYJrZrRz…` |

## Menù

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `MENU_LIST` | lettura | — | recordset: id, descrizione, tipo, pax, perc_ricetta | `okb5t42M…` |
| `MENU_GET` | lettura | id | recordset[0]: menù | `K3JkUG7H…` |
| `MENU_INSERT` | scrittura | 0, 'descrizione', tipo, 0, 0 | — | `nQ6vGlNT…` |
| `MENU_UPDATE` | scrittura | id, 'descrizione', tipo | — | `WddXaeNo…` |
| `MENU_DELETE` | scrittura | id | — | `b20k0izy…` |
| `MENU_CATEGORIE_LIST` | lettura | — | recordset: id, descrizione | `FNopVUZX…` |
| `MENU_ALLA_CARTA_RIGHE` | lettura | menuid, listinoid | recordset: tipo 1 = categoria, tipo 2 = piatto | `psv6VQSA…` |
| `MENU_EVENTO_RIGHE` | lettura | menuid, listinoid | recordset: tipo 1 = piatto, tipo 2 = separatore | `gmWVJZP+…` |
| `MENU_RIGA_INSERT` | scrittura | menuid, cod_p, menucategoriaid (0 per gli eventi) | — | `4EKFMSLc…` |
| `MENU_RIGA_DELETE` | scrittura | id | — | `ucPKP4vg…` |
| `MENU_RIGA_MOVE` | scrittura | id, nuova posizione (da 1), menuid | — | `wQgcfZjo…` |
| `MENU_SEPARATORE_INSERT` | scrittura | id riga sopra il separatore, menuid | — | `nvNvQc1G…` |
| `MENU_SEPARATORE_DELETE` | scrittura | id | — | `TSjQ4Ux8…` |
| `MENU_COPERTI_UPDATE` | scrittura | menuid, pax, perc_ricetta | — | `fqSIBghv…` |
| `MENU_TOTALI` | lettura | menuid, listinoid | recordset[0]: totali per coperto e per menù | `AhzhmjtF…` |

## Dizionario ingredienti

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `DIZIONARIO_ALIMENTI` | lettura | — | recordset: Ali_desc, Ali_kcal, Ali_edi, Ali_prot, Ali_anim, Ali_veg, Ali_glu, Ali_amid, Ali_lup | `PZ1+HZdX…` |

## Schede di produzione

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `SCHEDE_LIST` | lettura | — | recordset: id, descrizione | `JF8yXz5T…` |
| `SCHEDA_SAVE` | scrittura | id (0 = nuova), 'descrizione' | — | `xHdQPwuF…` |
| `SCHEDA_DELETE` | scrittura | id | — | `b6MZgUoZ…` |
| `SCHEDA_RIGHE` | lettura | id scheda | recordset: id, ricettaid | `ZGrBRm2w…` |
| `SCHEDA_RIGA_INSERT` | scrittura | id scheda, cod_p | — | `IlbwuISw…` |
| `SCHEDA_RIGA_DELETE` | scrittura | id | — | `S+jzb0AD…` |

## Archivio documenti

| Process | Tipo | Parametri | Risultato | Id |
|---|---|---|---|---|
| `ARCHIVIO_LIST` | lettura | folderid, @foldername, @parentid, @parentname | recordset: file e cartelle; output[0]: foldername, parentid, parentname | `0i2+RmIn…` |
| `ARCHIVIO_CARTELLE_TREE` | lettura | — | recordset: id, descrizione (percorso) | `Ayl+LWaN…` |
| `ARCHIVIO_CARTELLA_INSERT` | scrittura | 'descrizione', folderid padre | — | `dNJI9LXE…` |
| `ARCHIVIO_CARTELLA_RENAME` | scrittura | folderid, 'descrizione' | — | `EO8JC8YQ…` |
| `ARCHIVIO_CARTELLA_DELETE` | scrittura | folderid (elimina anche il contenuto) | — | `2ymowsy6…` |
| `ARCHIVIO_FILE_INSERT` | scrittura | 'nome', 'nome', folderid, size, 'type', @out_id | output[0].out_id = arc_codi | `aQWu1Smm…` |
| `ARCHIVIO_FILE_MOVE` | scrittura | arc_codi, folderid destinazione | — | `wVp8CePj…` |
| `ARCHIVIO_FILE_DELETE` | scrittura | arc_codi | — | `2H6fgL8R…` |

## Altri endpoint

| Endpoint | Uso |
|---|---|
| `FD_Login.php?gest=2` | Login: `{type: 1, username, password, token}` con il token applicativo statico; risponde `{user: [...], token: {token}}` |
| `FD_DropboxGateway.php?gest=2` | Proxy Dropbox: `{action: {mode, path, ...}, token}`; mode 1 upload (data URL base64), 3 cancellazione, 4 link temporaneo |
| `ReportService/*.php`, `FD_DataServiceGatewayCrypt.php?gest=3` | Stampe aperte in una nuova finestra, parametri e token in query string (vedi `src/app/data/report.service.ts`) |

## Process non più usati

Servivano solo alle pagine Ingredienti/Ingrediente, eliminate nel porting.

| Process | Id |
|---|---|
| `INGREDIENTI_ANAGRAFICA_LIST` | `bbtabTid…` |
| `INGREDIENTE_GET` | `Xi6OhhAR…` |
| `INGREDIENTE_SAVE` | `ITzKByQO…` |
| `INGREDIENTE_DELETE` | `p2d+TtQ/…` |
