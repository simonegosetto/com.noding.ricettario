alter view view_ingredienti_foodcost
as
select lr.listinoid,
	   lr.ingredienteid,
	   i.descrizione,
	   ri.cod_p as ricettaid,
	   sum(ifnull(ri.quantita,0)) as peso,
	   sum(case when ri.escludi_peso = 1 then 0 else ifnull(ri.quantita,0) end) as peso_conteggio,
	   sum(case when ifnull(lr.scarto,0) = 0 then ifnull(cast(ri.quantita * lr.prezzo / lr.grammatura as decimal(10,2)),0)
	        else ifnull(cast(ri.quantita * lr.prezzo / (lr.grammatura - (lr.grammatura/100*lr.scarto)) as decimal(10,2)),0)
	   end) as foodcost,
	   sum(case when ri.escludi_peso = 1 then 0 else ifnull(cast(ri.quantita * lr.kcal / 100 as decimal(10,2)),0) end) as kcal,
	   min(ri.ordinamento) as ordinamento
from listini_righe lr
inner join ricette_ingredienti ri on lr.ingredienteid = ri.ingredienteid
inner join ingredienti i on lr.ingredienteid = i.id
where ifnull(ri.ricettaid,0) = 0
group by lr.listinoid,
	   lr.ingredienteid,
	   i.descrizione,
	   ri.cod_p



alter view view_ricette_foodcost_lvl1
as
select f.listinoid,
       f.ricettaid,
       sum(f.peso_conteggio) as peso,
       sum(f.foodcost) as foodcost,
       sum(f.kcal) as kcal,
       ifnull(nullif(r.peso_effettivo,0),sum(f.peso)) as peso_effettivo,
       ifnull(r.prezzo_vendita,0) as prezzo_lordo_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(sum(f.foodcost) / (ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100))) * 100 as decimal(10,2)) end as ratio,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) end as prezzo_netto_vendita,
       cast(case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) - sum(f.foodcost) end as decimal(10,2)) as margine_netto
from ricette r
inner join view_ingredienti_foodcost f on r.cod_p = f.ricettaid
inner join listini l on f.listinoid = l.id
where r.livello = 1
group by f.listinoid,
         f.ricettaid



alter view view_ricette_foodcost_lvl2
as
select ifnull(i.listinoid,l1.listinoid) as listinoid,
       r.cod_p as ricettaid,
       sum(ri.quantita) as peso,
       cast(sum(ifnull(i.foodcost,l1.foodcost * ri.quantita / l1.peso)) as decimal(10,2)) as foodcost,
       cast(sum(ifnull(i.kcal, l1.kcal * ri.quantita / l1.peso)) as decimal(10,2)) as kcal,
       cast(ifnull(nullif(r.peso_effettivo,0),sum(ri.quantita)) as decimal(10,2)) as peso_effettivo,
       ifnull(r.prezzo_vendita,0) as prezzo_lordo_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(
	   sum(ifnull(i.foodcost,l1.foodcost * ri.quantita / l1.peso))
	   / (ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100))) * 100 as decimal(10,2)) end as ratio,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) end as prezzo_netto_vendita,
       cast(case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) -
	   sum(ifnull(i.foodcost,l1.foodcost * ri.quantita / l1.peso))
	   end as decimal(10,2)) as margine_netto
from ricette r
inner join view_ricette_ingredienti_distinct ri on r.cod_p = ri.cod_p
left join view_ingredienti_foodcost i on r.cod_p = i.ricettaid and ri.ingredienteid = i.ingredienteid
left join view_ricette_foodcost_lvl1 l1 on ri.ricettaid = l1.ricettaid
inner join listini l on ifnull(i.listinoid,l1.listinoid) = l.id
where r.livello = 2
group by ifnull(i.listinoid,l1.listinoid),
         r.cod_p ,
		 ifnull(r.prezzo_vendita,0) ,
		 ifnull(l.aliquota,0)



alter view view_ricette_foodcost_lvl3
as
select coalesce(i.listinoid,l1.listinoid,l2.listinoid) as listinoid,
       r.cod_p as ricettaid,
       sum(ri.quantita) as peso,
       cast(sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso)) as decimal(10,2)) as foodcost,
       cast(sum(coalesce(i.kcal,l1.kcal * ri.quantita / l1.peso,l2.kcal * ri.quantita / l2.peso)) as decimal(10,2)) as kcal,
       cast(ifnull(nullif(r.peso_effettivo,0),sum(ri.quantita)) as decimal(10,2)) as peso_effettivo,
       ifnull(r.prezzo_vendita,0) as prezzo_lordo_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(
	   sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso))
	   / (ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100))) * 100 as decimal(10,2)) end as ratio,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) end as prezzo_netto_vendita,
       cast(case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) -
	   sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso))
	   end as decimal(10,2)) as margine_netto
from ricette r
inner join view_ricette_ingredienti_distinct ri on r.cod_p = ri.cod_p
left join view_ingredienti_foodcost i on r.cod_p = i.ricettaid and ri.ingredienteid = i.ingredienteid
left join view_ricette_foodcost_lvl1 l1 on ri.ricettaid = l1.ricettaid
left join view_ricette_foodcost_lvl2 l2 on ri.ricettaid = l2.ricettaid
inner join listini l on coalesce(i.listinoid,l1.listinoid,l2.listinoid) = l.id
where r.livello = 3
group by coalesce(i.listinoid,l1.listinoid,l2.listinoid),
         r.cod_p ,
		 ifnull(r.prezzo_vendita,0) ,
		 ifnull(l.aliquota,0)



alter view view_ricette_foodcost_lvl4
as
select coalesce(i.listinoid,l1.listinoid,l2.listinoid,l3.listinoid) as listinoid,
       r.cod_p as ricettaid,
       sum(ri.quantita) as peso,
       cast(sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso,l3.foodcost * ri.quantita / l3.peso)) as decimal(10,2)) as foodcost,
       cast(sum(coalesce(i.kcal,l1.kcal * ri.quantita / l1.peso,l2.kcal * ri.quantita / l2.peso,l3.kcal * ri.quantita / l3.peso)) as decimal(10,2)) as kcal,
       cast(ifnull(nullif(r.peso_effettivo,0),sum(ri.quantita)) as decimal(10,2)) as peso_effettivo,
       ifnull(r.prezzo_vendita,0) as prezzo_lordo_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(
	   sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso,l3.foodcost * ri.quantita / l3.peso))
	   / (ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100))) * 100 as decimal(10,2)) end as ratio,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) end as prezzo_netto_vendita,
       cast(case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) -
	   sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso,l3.foodcost * ri.quantita / l3.peso))
	   end as decimal(10,2)) as margine_netto
from ricette r
inner join view_ricette_ingredienti_distinct ri on r.cod_p = ri.cod_p
left join view_ingredienti_foodcost i on r.cod_p = i.ricettaid and ri.ingredienteid = i.ingredienteid
left join view_ricette_foodcost_lvl1 l1 on ri.ricettaid = l1.ricettaid
left join view_ricette_foodcost_lvl2 l2 on ri.ricettaid = l2.ricettaid
left join view_ricette_foodcost_lvl3 l3 on ri.ricettaid = l3.ricettaid
inner join listini l on coalesce(i.listinoid,l1.listinoid,l2.listinoid,l3.listinoid) = l.id
where r.livello = 4
group by coalesce(i.listinoid,l1.listinoid,l2.listinoid,l3.listinoid),
         r.cod_p ,
		 ifnull(r.prezzo_vendita,0) ,
		 ifnull(l.aliquota,0)



alter view view_ricette_foodcost_lvl5
as
select coalesce(i.listinoid,l1.listinoid,l2.listinoid,l3.listinoid,l4.listinoid) as listinoid,
       r.cod_p as ricettaid,
       sum(ri.quantita) as peso,
       cast(sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso,l3.foodcost * ri.quantita / l3.peso,l4.foodcost * ri.quantita / l4.peso)) as decimal(10,2)) as foodcost,
       cast(sum(coalesce(i.kcal,l1.kcal * ri.quantita / l1.peso,l2.kcal * ri.quantita / l2.peso,l3.kcal * ri.quantita / l3.peso,l4.kcal * ri.quantita / l4.peso)) as decimal(10,2)) as kcal,
       cast(ifnull(nullif(r.peso_effettivo,0),sum(ri.quantita)) as decimal(10,2)) as peso_effettivo,
       ifnull(r.prezzo_vendita,0) as prezzo_lordo_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(
	   sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso,l3.foodcost * ri.quantita / l3.peso,l4.foodcost * ri.quantita / l4.peso))
	   / (ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100))) * 100 as decimal(10,2)) end as ratio,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) end as prezzo_netto_vendita,
       cast(case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/(1 + (ifnull(l.aliquota,0) / 100)) as decimal(10,2)) -
	   sum(coalesce(i.foodcost,l1.foodcost * ri.quantita / l1.peso,l2.foodcost * ri.quantita / l2.peso,l3.foodcost * ri.quantita / l3.peso,l4.foodcost * ri.quantita / l4.peso))
	   end as decimal(10,2)) as margine_netto
from ricette r
inner join view_ricette_ingredienti_distinct ri on r.cod_p = ri.cod_p
left join view_ingredienti_foodcost i on r.cod_p = i.ricettaid and ri.ingredienteid = i.ingredienteid
left join view_ricette_foodcost_lvl1 l1 on ri.ricettaid = l1.ricettaid
left join view_ricette_foodcost_lvl2 l2 on ri.ricettaid = l2.ricettaid
left join view_ricette_foodcost_lvl3 l3 on ri.ricettaid = l3.ricettaid
left join view_ricette_foodcost_lvl4 l4 on ri.ricettaid = l4.ricettaid
inner join listini l on coalesce(i.listinoid,l1.listinoid,l2.listinoid,l3.listinoid,l4.listinoid) = l.id
where r.livello = 5
group by coalesce(i.listinoid,l1.listinoid,l2.listinoid,l3.listinoid,l4.listinoid),
         r.cod_p ,
		 ifnull(r.prezzo_vendita,0) ,
		 ifnull(l.aliquota,0)



alter view view_ricette_foodcost
as
select * from view_ricette_foodcost_lvl1
union all
select * from view_ricette_foodcost_lvl2
union all
select * from view_ricette_foodcost_lvl3
union all
select * from view_ricette_foodcost_lvl4
union all
select * from view_ricette_foodcost_lvl5
/*
select f.listinoid,
       f.ricettaid,
       sum(f.peso_conteggio) as peso,
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
*/



alter VIEW view_ricette
AS
select r.cod_p,
       r.nome_ric,
       r.procedimento,
       r.data_ins,
       r.image,
       r.chef,
       r.peso,
       r.ingredienti,
       r.prezzo_vendita,
       r.peso_effettivo,
       (select count(0) from ricette_ingredienti where cod_p = r.cod_p) as numero_righe,
       (select count(0) from ricette_ingredienti where cod_p = r.cod_p and ifnull(ricettaid,0) = 0) as numero_ingredienti
from ricette r


alter view view_ricette_ingredienti_distinct
as
SELECT cod_p,
	   ingredienteid,
       ricettaid,
       max(escludi_peso) as escludi_peso,
       sum(quantita) as quantita,
       min(ordinamento) as ordinamento
FROM ricette_ingredienti
group by cod_p,
	   ingredienteid,
       ricettaid



alter VIEW `view_ingrediente_ricette`
AS
select `ri`.`ingredienteid` AS `ingredienteid`,
        group_concat(distinct `r`.`nome_ric` order by `r`.`nome_ric` ASC separator '<p></p>') AS `ricette`
from (`ricette_ingredienti` `ri` join `ricette` `r` on((`ri`.`cod_p` = `r`.`cod_p`))) where (`ri`.`ingredienteid` is not null)
group by `ri`.`ingredienteid`



alter view view_ricette_ingredienti
as
select ri.ingredienteid,
       ri.cod_p as ricettaid,
       ri.quantita
from ricette_ingredienti ri
where ifnull(ri.ricettaid,0) = 0
union all
select ri2.ingredienteid,
       ri.cod_p as ricettaid,
       ri.quantita
from ricette_ingredienti ri
inner join ricette_ingredienti ri2 on ri.ricettaid = ri2.cod_p
where ifnull(ri.ricettaid,0) > 0
union ALL
select ri3.ingredienteid,
       ri.cod_p as ricettaid,
       ri.quantita
from ricette_ingredienti ri
inner join ricette_ingredienti ri2 on ri.ricettaid = ri2.cod_p
inner join ricette_ingredienti ri3 on ri2.ricettaid = ri3.cod_p
where ifnull(ri.ricettaid,0) > 0
union ALL
select ri4.ingredienteid,
       ri.cod_p as ricettaid,
       ri.quantita
from ricette_ingredienti ri
inner join ricette_ingredienti ri2 on ri.ricettaid = ri2.cod_p
inner join ricette_ingredienti ri3 on ri2.ricettaid = ri3.cod_p
inner join ricette_ingredienti ri4 on ri3.ricettaid = ri4.cod_p
where ifnull(ri.ricettaid,0) > 0
union ALL
select ri5.ingredienteid,
       ri.cod_p as ricettaid,
       ri.quantita
from ricette_ingredienti ri
inner join ricette_ingredienti ri2 on ri.ricettaid = ri2.cod_p
inner join ricette_ingredienti ri3 on ri2.ricettaid = ri3.cod_p
inner join ricette_ingredienti ri4 on ri3.ricettaid = ri4.cod_p
inner join ricette_ingredienti ri5 on ri4.ricettaid = ri5.cod_p
where ifnull(ri.ricettaid,0) > 0
;
