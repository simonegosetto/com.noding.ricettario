alter view view_ingredienti_foodcost
as
select lr.listinoid,
	   lr.ingredienteid,
	   i.descrizione,
	   ri.cod_p as ricettaid,
	   ifnull(ri.quantita,0) as peso,
	   case when ifnull(lr.scarto,0) = 0 then ifnull(cast(ri.quantita * lr.prezzo / lr.grammatura as decimal(10,2)),0)
	        else ifnull(cast(ri.quantita * (lr.prezzo - (lr.prezzo/100*lr.scarto)) / lr.grammatura as decimal(10,2)),0)
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
       ifnull(cast(ri.quantita * sum(vi.foodcost) / sum(vi.peso) as decimal(10,2)),0) as foodcost,
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
       ifnull(r.prezzo_vendita,0) as prezzo_lordo_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(sum(f.foodcost) / (ifnull(r.prezzo_vendita,0)/1.1) * 100 as decimal(10,2)) end as ratio,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/1.1 as decimal(10,2)) end as prezzo_netto_vendita,
       case when ifnull(r.prezzo_vendita,0) = 0 then 0 else cast(ifnull(r.prezzo_vendita,0)/1.1 as decimal(10,2)) - sum(f.foodcost) end as margine_netto
from view_ingredienti_foodcost_full f
inner join ricette r on f.ricettaid = r.cod_p
group by f.listinoid,
         f.ricettaid
