import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
  Legend,
} from "recharts";
import {
  TrendingUp,
  Users,
  Package,
  DollarSign,
  ShoppingCart,
  Clock,
  CheckCircle,
  XCircle,
  Calendar,
} from "lucide-react";

type ReportsData = {
  sales: {
    totalSold: number;
    totalRevenue: string;
    averageTicket: string;
    salesByDay: { date: string; count: number; revenue: string }[];
  };
  insertions: {
    totalCreated: number;
    byQuality: { quality: string; count: number }[];
    byPlan: { planType: string; count: number }[];
    insertionsByDay: { date: string; count: number }[];
  };
  system: {
    totalUsers: number;
    activeClients: number;
    availableLeads: number;
    reservedLeads: number;
    expiredLeads: number;
    totalCreditsDeposited: string;
  };
};

const QUALITY_COLORS: Record<string, string> = {
  diamond: "#06b6d4",
  gold: "#eab308",
  silver: "#94a3b8",
  bronze: "#f97316",
};

const QUALITY_LABELS: Record<string, string> = {
  diamond: "Diamante",
  gold: "Ouro",
  silver: "Prata",
  bronze: "Bronze",
};

const PLAN_LABELS: Record<string, string> = {
  pf: "PF",
  pj: "PJ",
  pme: "PME",
};

const PLAN_COLORS = ["#7c3aed", "#10b981", "#f59e0b"];

export default function AdminReports() {
  const [period, setPeriod] = useState("month");

  const { data: reports, isLoading } = useQuery<ReportsData>({
    queryKey: ["/api/admin/reports", period],
    queryFn: async () => {
      const res = await fetch(`/api/admin/reports?period=${period}`, {
        credentials: "include",
      });
      if (!res.ok) throw new Error("Failed to fetch reports");
      return res.json();
    },
  });

  const formatCurrency = (value: string | number) => {
    const num = typeof value === "string" ? parseFloat(value) : value;
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(num);
  };

  const formatDate = (dateStr: string) => {
    const date = new Date(dateStr);
    return date.toLocaleDateString("pt-BR", { day: "2-digit", month: "2-digit" });
  };

  const getPeriodLabel = () => {
    switch (period) {
      case "today":
        return "Hoje";
      case "week":
        return "Últimos 7 dias";
      case "month":
        return "Este mês";
      case "year":
        return "Este ano";
      case "all":
        return "Todo o período";
      default:
        return "Este mês";
    }
  };

  const qualityChartData = reports?.insertions.byQuality.map((item) => ({
    name: QUALITY_LABELS[item.quality] || item.quality,
    value: item.count,
    fill: QUALITY_COLORS[item.quality] || "#94a3b8",
  })) || [];

  const planChartData = reports?.insertions.byPlan.map((item) => ({
    name: PLAN_LABELS[item.planType] || item.planType.toUpperCase(),
    value: item.count,
  })) || [];

  const combinedChartData = reports ? (() => {
    const dates = new Set([
      ...reports.sales.salesByDay.map((s) => s.date),
      ...reports.insertions.insertionsByDay.map((i) => i.date),
    ]);
    return Array.from(dates)
      .sort()
      .map((date) => {
        const sale = reports.sales.salesByDay.find((s) => s.date === date);
        const insertion = reports.insertions.insertionsByDay.find((i) => i.date === date);
        return {
          date: formatDate(date),
          vendas: sale?.count || 0,
          receita: sale ? parseFloat(sale.revenue) : 0,
          leads: insertion?.count || 0,
        };
      });
  })() : [];

  return (
    <Layout>
      <div className="p-4 sm:p-6 lg:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-gray-900 dark:text-white">
              Relatórios
            </h1>
            <p className="text-gray-500 dark:text-gray-400 mt-1">
              Análise completa de vendas, leads e métricas do sistema
            </p>
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="w-4 h-4 text-gray-500" />
            <Select value={period} onValueChange={setPeriod}>
              <SelectTrigger className="w-[180px]" data-testid="select-period">
                <SelectValue placeholder="Período" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="today">Hoje</SelectItem>
                <SelectItem value="week">Últimos 7 dias</SelectItem>
                <SelectItem value="month">Este mês</SelectItem>
                <SelectItem value="year">Este ano</SelectItem>
                <SelectItem value="all">Todo o período</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <Badge variant="outline" className="text-sm">
          Exibindo dados de: {getPeriodLabel()}
        </Badge>

        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[...Array(8)].map((_, i) => (
              <Skeleton key={i} className="h-32" />
            ))}
          </div>
        ) : reports ? (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="card-total-vendas">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Leads Vendidos
                  </CardTitle>
                  <ShoppingCart className="h-4 w-4 text-primary" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.sales.totalSold}</div>
                  <p className="text-xs text-gray-500 mt-1">no período selecionado</p>
                </CardContent>
              </Card>

              <Card data-testid="card-receita-total">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Receita Total
                  </CardTitle>
                  <DollarSign className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {formatCurrency(reports.sales.totalRevenue)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">de vendas de leads</p>
                </CardContent>
              </Card>

              <Card data-testid="card-ticket-medio">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Ticket Médio
                  </CardTitle>
                  <TrendingUp className="h-4 w-4 text-blue-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-blue-600">
                    {formatCurrency(reports.sales.averageTicket)}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">por lead vendido</p>
                </CardContent>
              </Card>

              <Card data-testid="card-leads-criados">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Leads Criados
                  </CardTitle>
                  <Package className="h-4 w-4 text-purple-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {reports.insertions.totalCreated}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">novos leads inseridos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <Card data-testid="card-usuarios-total">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Total Usuários
                  </CardTitle>
                  <Users className="h-4 w-4 text-gray-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{reports.system.totalUsers}</div>
                  <p className="text-xs text-gray-500 mt-1">
                    {reports.system.activeClients} clientes ativos
                  </p>
                </CardContent>
              </Card>

              <Card data-testid="card-leads-disponiveis">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Leads Disponíveis
                  </CardTitle>
                  <CheckCircle className="h-4 w-4 text-green-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-600">
                    {reports.system.availableLeads}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">prontos para venda</p>
                </CardContent>
              </Card>

              <Card data-testid="card-leads-reservados">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Leads Reservados
                  </CardTitle>
                  <Clock className="h-4 w-4 text-yellow-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-yellow-600">
                    {reports.system.reservedLeads}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">aguardando confirmação</p>
                </CardContent>
              </Card>

              <Card data-testid="card-leads-expirados">
                <CardHeader className="flex flex-row items-center justify-between pb-2">
                  <CardTitle className="text-sm font-medium text-gray-500">
                    Leads Expirados
                  </CardTitle>
                  <XCircle className="h-4 w-4 text-red-600" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-600">
                    {reports.system.expiredLeads}
                  </div>
                  <p className="text-xs text-gray-500 mt-1">não foram vendidos</p>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="chart-vendas-leads">
                <CardHeader>
                  <CardTitle className="text-lg">Vendas e Leads por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  {combinedChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <AreaChart data={combinedChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis tick={{ fontSize: 12 }} />
                        <Tooltip
                          formatter={(value: number, name: string) => {
                            if (name === "receita") return formatCurrency(value);
                            return value;
                          }}
                          labelFormatter={(label) => `Data: ${label}`}
                        />
                        <Legend />
                        <Area
                          type="monotone"
                          dataKey="leads"
                          name="Leads Criados"
                          stackId="1"
                          stroke="#7c3aed"
                          fill="#7c3aed"
                          fillOpacity={0.3}
                        />
                        <Area
                          type="monotone"
                          dataKey="vendas"
                          name="Vendas"
                          stackId="2"
                          stroke="#10b981"
                          fill="#10b981"
                          fillOpacity={0.3}
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="chart-receita">
                <CardHeader>
                  <CardTitle className="text-lg">Receita por Dia</CardTitle>
                </CardHeader>
                <CardContent>
                  {combinedChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <BarChart data={combinedChartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" tick={{ fontSize: 12 }} />
                        <YAxis
                          tick={{ fontSize: 12 }}
                          tickFormatter={(value) =>
                            `R$ ${value.toLocaleString("pt-BR")}`
                          }
                        />
                        <Tooltip
                          formatter={(value: number) => formatCurrency(value)}
                          labelFormatter={(label) => `Data: ${label}`}
                        />
                        <Bar dataKey="receita" name="Receita" fill="#10b981" radius={4} />
                      </BarChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <Card data-testid="chart-qualidade">
                <CardHeader>
                  <CardTitle className="text-lg">Leads por Qualidade</CardTitle>
                </CardHeader>
                <CardContent>
                  {qualityChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={qualityChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {qualityChartData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.fill} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value} leads`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card data-testid="chart-plano">
                <CardHeader>
                  <CardTitle className="text-lg">Leads por Tipo de Plano</CardTitle>
                </CardHeader>
                <CardContent>
                  {planChartData.length > 0 ? (
                    <ResponsiveContainer width="100%" height={300}>
                      <PieChart>
                        <Pie
                          data={planChartData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={100}
                          paddingAngle={2}
                          dataKey="value"
                          label={({ name, percent }) =>
                            `${name} (${(percent * 100).toFixed(0)}%)`
                          }
                        >
                          {planChartData.map((_, index) => (
                            <Cell key={`cell-${index}`} fill={PLAN_COLORS[index % PLAN_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: number) => `${value} leads`} />
                      </PieChart>
                    </ResponsiveContainer>
                  ) : (
                    <div className="h-[300px] flex items-center justify-center text-gray-500">
                      Nenhum dado disponível para o período selecionado
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            <Card data-testid="card-creditos">
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="w-5 h-5" />
                  Créditos Depositados no Período
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">
                  {formatCurrency(reports.system.totalCreditsDeposited)}
                </div>
                <p className="text-gray-500 mt-2">
                  Total de créditos adquiridos pelos clientes no período selecionado
                </p>
              </CardContent>
            </Card>
          </>
        ) : (
          <div className="text-center py-12 text-gray-500">
            Erro ao carregar relatórios. Tente novamente.
          </div>
        )}
      </div>
    </Layout>
  );
}
