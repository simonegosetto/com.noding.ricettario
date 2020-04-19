alter view view_ingredienti_foodcost
as
select lr.listinoid,
	   lr.ingredienteid,
	   i.descrizione,
	   ri.cod_p as ricettaid,
	   ifnull(ri.quantita,0) as peso,
	   case when ifnull(lr.scarto,0) = 0 then ifnull(cast(ri.quantita * lr.prezzo / lr.grammatura as decimal(10,2)),0)
	        else ifnull(cast(ri.quantita * lr.prezzo / (lr.grammatura - (lr.grammatura/100*lr.scarto)) as decimal(10,2)),0)
	   end as foodcost,
	   ifnull(cast(ri.quantita * lr.kcal / 100 as decimal(10,2)),0) as kcal,
	   ri.ordinamento
from listini_righe lr
inner join ricette_ingredienti ri on lr.ingredienteid = ri.ingredienteid
inner join ingredienti i on lr.ingredienteid = i.id
where ifnull(ri.ricettaid,0) = 0

alter view view_ingredienti_ricette_foodcost
as
select vi.listinoid,
       vi.ricettaid as ingredienteid,
       r.nome_ric as descrizione,
       ri.cod_p as ricettaid,
       ri.quantita as peso,
       ifnull(cast(ri.quantita * sum(vi.foodcost) / ifnull(nullif(r.peso_effettivo,0),sum(vi.peso)) as decimal(10,2)),0) as foodcost,
       ifnull(cast(ri.quantita * sum(vi.kcal) / sum(vi.peso) as decimal(10,2)),0) as kcal,
       ifnull(ri.ordinamento,0) as ordinamento
from view_ingredienti_foodcost vi
inner join ricette r on vi.ricettaid = r.cod_p
inner join ricette_ingredienti ri on vi.ricettaid = ri.ricettaid
group by vi.listinoid,
         vi.ricettaid,
         r.nome_ric,
         ri.quantita,
         ri.cod_p,
         ifnull(ri.ordinamento,0)



alter view view_ingredienti_foodcost_full
as
select listinoid,ricettaid,peso,foodcost,kcal from view_ingredienti_foodcost
union all
select listinoid,ricettaid,peso,foodcost,kcal from view_ingredienti_ricette_foodcost



alter view view_ricette_foodcost
as
select f.listinoid,
       f.ricettaid,
       sum(f.peso) as peso,
       sum(f.foodcost) as foodcost,
       sum(f.kcal) as kcal,
       ifnull(nullif(r.peso_effettivo,0),sum(f.peso)) as peso_effettivo,
       ifnull(r.prezzo_vendita,0) as prezzo_lordo_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(sum(f.foodcost) / (ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100))) * 100 as decimal(10,2)) end as ratio,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) end as prezzo_netto_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) - sum(f.foodcost) end as margine_netto
from view_ingredienti_foodcost_full f
inner join ricette r on f.ricettaid = r.cod_p
inner join listini l on f.listinoid = l.id
group by f.listinoid,
         f.ricettaid


alter VIEW `view_ricette` AS
select `r`.`cod_p` AS `cod_p`,`r`.`nome_ric` AS `nome_ric`,`r`.`procedimento` AS `procedimento`,`r`.`data_ins` AS `data_ins`,`r`.`image` AS `image`,`r`.`chef` AS `chef`,`r`.`peso` AS `peso`,`r`.`ingredienti` AS `ingredienti`,
        r.prezzo_vendita,
        r.peso_effettivo
from `ricette` `r`


alter VIEW `view_ingrediente_ricette`
AS
select `ri`.`ingredienteid` AS `ingredienteid`,
        group_concat(distinct `r`.`nome_ric` order by `r`.`nome_ric` ASC separator '<p></p>') AS `ricette`
from (`ricette_ingredienti` `ri` join `ricette` `r` on((`ri`.`cod_p` = `r`.`cod_p`))) where (`ri`.`ingredienteid` is not null)
group by `ri`.`ingredienteid`
