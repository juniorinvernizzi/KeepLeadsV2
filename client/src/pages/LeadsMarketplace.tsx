import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import Layout from "@/components/Layout";
import LeadCard from "@/components/LeadCard";
import FilterBar from "@/components/FilterBar";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";

interface Lead {
  id: string;
  name: string;
  email: string;
  phone: string;
  age: number;
  city: string;
  state: string;
  insuranceCompanyId: string;
  planType: string;
  budgetMin: string;
  budgetMax: string;
  availableLives: number;
  source: string;
  campaign: string;
  quality: string;
  status: string;
  price: string;
  notes: string;
  createdAt: string;
  updatedAt: string;
}

export default function LeadsMarketplace() {
  const [filters, setFilters] = useState({
    search: "",
    insuranceCompany: "all",
    ageRange: "all",
    city: "all",
    minPrice: "",
    maxPrice: "",
  });

  const { data: leads = [], isLoading, refetch } = useQuery<Lead[]>({
    queryKey: ["/api/leads", JSON.stringify(filters)],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          searchParams.append(key, value);
        }
      });
      const url = `/api/leads${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url, { credentials: "include" });
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
    enabled: true,
  });

  const { data: companies = [] } = useQuery<Array<{id: string; name: string; color: string}>>({
    queryKey: ["/api/insurance-companies"],
  });

  const handleFilterChange = (newFilters: any) => {
    setFilters(newFilters);
    refetch();
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="w-9/10 mx-auto py-8">
          <div className="animate-pulse">
            <div className="h-8 bg-slate-200 rounded w-1/3 mb-4"></div>
            <div className="h-4 bg-slate-200 rounded w-1/2 mb-8"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="bg-slate-200 rounded-xl h-80"></div>
              ))}
            </div>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-9/10 mx-auto py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Marketplace de Leads
          </h1>
          <p className="text-slate-600">Encontre leads qualificados de planos de saúde</p>
        </div>

        {/* Filter Bar */}
        <FilterBar 
          filters={filters} 
          onFiltersChange={handleFilterChange}
          companies={companies}
        />

        {/* Results Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-4">
            <span className="text-slate-600" data-testid="text-results-count">
              Mostrando <span className="font-medium text-slate-800">{leads.length} leads</span> disponíveis
            </span>
            <Badge variant="secondary" className="bg-green-100 text-green-800">
              Atualizados há 2 min
            </Badge>
          </div>
          
          <div className="flex items-center space-x-2">
            <span className="text-sm text-slate-600">Ordenar por:</span>
            <Select defaultValue="recent">
              <SelectTrigger className="w-40" data-testid="select-sort">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="recent">Mais recentes</SelectItem>
                <SelectItem value="price-low">Menor preço</SelectItem>
                <SelectItem value="price-high">Maior preço</SelectItem>
                <SelectItem value="company">Operadora</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Leads Grid */}
        {leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2" data-testid="text-no-results">
              Nenhum lead encontrado
            </h3>
            <p className="text-slate-500 mb-4">
              Tente ajustar seus filtros para encontrar leads disponíveis.
            </p>
            <Button 
              variant="outline" 
              onClick={() => handleFilterChange({
                search: "",
                insuranceCompany: "all",
                ageRange: "all", 
                city: "all",
                minPrice: "",
                maxPrice: "",
              })}
              data-testid="button-clear-filters"
            >
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 justify-items-center">
            {leads.map((lead) => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                companies={companies}
                onPurchase={() => refetch()}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {leads.length > 0 && (
          <div className="flex items-center justify-between bg-white rounded-xl shadow-sm border border-slate-200 px-6 py-4">
            <div className="text-sm text-slate-600">
              Mostrando <span className="font-medium">1-{leads.length}</span> de{" "}
              <span className="font-medium">{leads.length}</span> leads
            </div>
            
            <div className="flex items-center space-x-2">
              <Button variant="outline" size="sm" disabled data-testid="button-prev-page">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M12.707 5.293a1 1 0 010 1.414L9.414 10l3.293 3.293a1 1 0 01-1.414 1.414l-4-4a1 1 0 010-1.414l4-4a1 1 0 011.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
              <Button size="sm" className="bg-primary text-white">1</Button>
              <Button variant="outline" size="sm" disabled data-testid="button-next-page">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M7.293 14.707a1 1 0 010-1.414L10.586 10 7.293 6.707a1 1 0 011.414-1.414l4 4a1 1 0 010 1.414l-4 4a1 1 0 01-1.414 0z" clipRule="evenodd" />
                </svg>
              </Button>
            </div>
          </div>
        )}
      </div>
    </Layout>
  );
}
