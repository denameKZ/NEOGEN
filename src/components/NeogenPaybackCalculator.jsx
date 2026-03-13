
import React, { useMemo, useState } from 'react';

const formatKzt = (value) => {
  const num = Number(value || 0);
  return new Intl.NumberFormat('ru-RU', {
    style: 'currency',
    currency: 'KZT',
    maximumFractionDigits: 0,
  }).format(num);
};

const formatNum = (value, digits = 2) =>
  new Intl.NumberFormat('ru-RU', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value || 0));

const initialProcedures = [
  { id:1,name:'Плазменное омоложение лица',price:120000,impulses:300,materials:2000,countPerMonth:8},
  { id:2,name:'Плазменное омоложение шеи',price:98000,impulses:300,materials:2000,countPerMonth:8},
  { id:3,name:'Лифтинг области век',price:98000,impulses:200,materials:2000,countPerMonth:8},
  { id:4,name:'Лечение акне',price:39000,impulses:100,materials:2000,countPerMonth:8},
  { id:5,name:'Лечение розацеа',price:39000,impulses:100,materials:2000,countPerMonth:8},
];

export default function NeogenPaybackCalculator(){

  const [equipmentCost,setEquipmentCost]=useState(29200000)
  const [salaryPercent,setSalaryPercent]=useState(30)
  const [procedures,setProcedures]=useState(initialProcedures)

  const metrics=useMemo(()=>{

    const enriched=procedures.map(p=>{
      const totalExpenses=p.materials
      const profitPerProcedure=p.price-totalExpenses
      const monthlyProfit=profitPerProcedure*p.countPerMonth
      const monthlyRevenue=p.price*p.countPerMonth

      return {...p,totalExpenses,profitPerProcedure,monthlyProfit,monthlyRevenue}
    })

    const totalMonthlyRevenue=enriched.reduce((s,p)=>s+p.monthlyRevenue,0)
    const totalMonthlyProfitBeforeSalary=enriched.reduce((s,p)=>s+p.monthlyProfit,0)
    const salaryCost=totalMonthlyRevenue*(salaryPercent/100)
    const netMonthlyProfit=totalMonthlyProfitBeforeSalary-salaryCost
    const paybackMonths=netMonthlyProfit>0?equipmentCost/netMonthlyProfit:0

    return {enriched,totalMonthlyRevenue,netMonthlyProfit,paybackMonths}

  },[equipmentCost,salaryPercent,procedures])

  const updateProcedure=(id,field,value)=>{
    setProcedures(prev=>prev.map(p=>p.id===id?{...p,[field]:Number(value)||0}:p))
  }

  return (
    <div style={{fontFamily:'Arial',padding:40,maxWidth:1200,margin:'auto'}}>

      <h1 style={{fontSize:32,marginBottom:20}}>NEOGEN Калькулятор окупаемости</h1>

      <div style={{marginBottom:30}}>
        <label>Стоимость аппарата: </label>
        <input type="number" value={equipmentCost} onChange={e=>setEquipmentCost(Number(e.target.value))}/>
      </div>

      <table border="1" cellPadding="10" style={{width:'100%',marginBottom:30}}>
        <thead>
          <tr>
            <th>Процедура</th>
            <th>Цена</th>
            <th>Материалы</th>
            <th>В месяц</th>
            <th>Прибыль/мес</th>
          </tr>
        </thead>
        <tbody>
          {metrics.enriched.map(p=>(
            <tr key={p.id}>
              <td>{p.name}</td>
              <td><input type="number" value={p.price} onChange={e=>updateProcedure(p.id,'price',e.target.value)}/></td>
              <td><input type="number" value={p.materials} onChange={e=>updateProcedure(p.id,'materials',e.target.value)}/></td>
              <td><input type="number" value={p.countPerMonth} onChange={e=>updateProcedure(p.id,'countPerMonth',e.target.value)}/></td>
              <td>{formatKzt(Math.round(p.monthlyProfit))}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>Общая выручка: {formatKzt(metrics.totalMonthlyRevenue)}</h2>
      <h2>Чистая прибыль: {formatKzt(metrics.netMonthlyProfit)}</h2>
      <h2>Окупаемость: {formatNum(metrics.paybackMonths,1)} мес.</h2>

    </div>
  )
}
