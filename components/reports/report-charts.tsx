"use client";

import { Bar, BarChart, CartesianGrid, Cell, Legend, Pie, PieChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts";
import { formatBRL } from "@/lib/utils/currency";

const colors = ["#185C45", "#D3973A", "#8C3D3D", "#4C6B60", "#8A7664", "#6E8190", "#A66A55"];

export function CategoryChart({ data }: { data: { name: string; value: number }[] }) {
  if (!data.length) return <p className="py-12 text-center text-sm text-muted">Sem despesas no mês atual.</p>;
  return <div className="h-80" role="img" aria-label="Gráfico de gastos por categoria"><ResponsiveContainer width="100%" height="100%"><PieChart><Pie data={data} dataKey="value" nameKey="name" innerRadius={65} outerRadius={105} paddingAngle={2}>{data.map((item, index) => <Cell key={item.name} fill={colors[index % colors.length]} />)}</Pie><Tooltip formatter={(value) => formatBRL(Number(value))} /><Legend /></PieChart></ResponsiveContainer></div>;
}

export function EvolutionChart({ data }: { data: { month: string; receitas: number; despesas: number }[] }) {
  return <div className="h-80" role="img" aria-label="Gráfico de receitas e despesas dos últimos seis meses"><ResponsiveContainer width="100%" height="100%"><BarChart data={data} margin={{ left: 4, right: 4 }}><CartesianGrid vertical={false} stroke="#E3E7E2" /><XAxis dataKey="month" axisLine={false} tickLine={false} /><YAxis axisLine={false} tickLine={false} tickFormatter={(value) => `R$${Math.round(value / 1000)}k`} /><Tooltip formatter={(value) => formatBRL(Number(value))} /><Legend /><Bar dataKey="receitas" fill="#2F765D" radius={[3, 3, 0, 0]} /><Bar dataKey="despesas" fill="#A24A4A" radius={[3, 3, 0, 0]} /></BarChart></ResponsiveContainer></div>;
}
