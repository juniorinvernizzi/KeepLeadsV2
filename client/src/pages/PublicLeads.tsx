import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import FilterBar from "@/components/FilterBar";
import LeadCard from "@/components/LeadCard";

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

export default function PublicLeads() {
  const [filters, setFilters] = useState({
    city: "all",
    planType: "all",
    livesCount: "all",
    quality: "all",
    minPrice: "0",
    maxPrice: "200",
  });

  const { data: leads = [], isLoading } = useQuery<Lead[]>({
    queryKey: ["/api/leads", JSON.stringify(filters)],
    queryFn: async () => {
      const searchParams = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value && value !== "all") {
          searchParams.append(key, value);
        }
      });
      const url = `/api/leads${searchParams.toString() ? `?${searchParams.toString()}` : ''}`;
      const response = await fetch(url);
      if (!response.ok) throw new Error(`${response.status}: ${response.statusText}`);
      return response.json();
    },
  });

  const { data: companies = [] } = useQuery<Array<{id: string; name: string; color: string}>>({
    queryKey: ["/api/insurance-companies"],
  });

  const cities = [
    "São Paulo", "Rio de Janeiro", "Brasília", "Belo Horizonte", "Curitiba",
    "Porto Alegre", "Salvador", "Fortaleza", "Recife", "Manaus", "Goiânia",
    "Campinas", "Florianópolis"
  ];

  const handleFiltersChange = (newFilters: typeof filters) => {
    setFilters(newFilters);
  };

  const clearFilters = () => {
    setFilters({
      city: "all",
      planType: "all",
      livesCount: "all",
      quality: "all",
      minPrice: "0",
      maxPrice: "200",
    });
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="w-4/5 mx-auto py-4">
          <div className="flex justify-between items-center mb-6">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800">KeepLeads</span>
            </div>
            
            <div className="flex items-center space-x-3">
              <Button 
                variant="outline"
                onClick={() => window.location.href = "/login"}
                data-testid="button-register"
              >
                Cadastrar
              </Button>
              <Button 
                onClick={() => window.location.href = "/login"}
                data-testid="button-login"
              >
                Fazer Login
              </Button>
            </div>
          </div>
        </div>
      </header>

      <div className="w-4/5 mx-auto py-8">
        {/* Hero Section */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-slate-800 mb-4">
            Leads Qualificados de Planos de Saúde
          </h1>
          <p className="text-xl text-slate-600 max-w-3xl mx-auto">
            Encontre leads verificados e prontos para conversão. 
            Faça login para acessar informações completas e efetuar compras.
          </p>
        </div>

        {/* Filters */}
        <FilterBar 
          filters={filters}
          onFiltersChange={handleFiltersChange}
          cities={cities}
        />

        {/* Results */}
        <div className="flex items-center justify-between mb-6">
          <span className="text-slate-600">
            Mostrando <span className="font-medium text-slate-800">{leads.length} leads</span> disponíveis
          </span>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            Atualizados há 2 min
          </Badge>
        </div>

        {/* Leads Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="bg-white rounded-xl h-80 animate-pulse"></div>
            ))}
          </div>
        ) : leads.length === 0 ? (
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">
              Nenhum lead encontrado
            </h3>
            <p className="text-slate-500 mb-4">
              Tente ajustar seus filtros para encontrar leads disponíveis.
            </p>
            <Button variant="outline" onClick={clearFilters}>
              Limpar filtros
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {leads.map((lead) => (
              <LeadCard 
                key={lead.id} 
                lead={lead} 
                companies={companies}
                isPublic={true}
              />
            ))}
          </div>
        )}

        {/* CTA Section */}
        <div className="bg-primary rounded-2xl p-8 mt-16 text-center text-white">
          <h2 className="text-3xl font-bold mb-4">
            Pronto para começar?
          </h2>
          <p className="text-xl mb-6 opacity-90">
            Faça login para acessar informações detalhadas dos leads e começar suas compras.
          </p>
          <Button 
            size="lg" 
            variant="secondary"
            onClick={() => window.location.href = "/login"}
            className="bg-white text-primary hover:bg-slate-50"
            data-testid="button-login-cta"
          >
            Fazer Login / Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
}
