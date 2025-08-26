import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";

interface Lead {
  id: string;
  age: number;
  city: string;
  state: string;
  insuranceCompanyId: string;
  planType: string;
  budgetMin: string;
  budgetMax: string;
  quality: string;
  price: string;
  createdAt: string;
}

interface PublicLeadCardProps {
  lead: Lead;
  companies: Array<{id: string; name: string; color: string}>;
}

function PublicLeadCard({ lead, companies }: PublicLeadCardProps) {
  const company = companies.find(c => c.id === lead.insuranceCompanyId);
  
  return (
    <Card className="h-full hover:shadow-lg transition-shadow">
      <CardContent className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex items-center space-x-2">
            <div 
              className="w-3 h-3 rounded-full" 
              style={{ backgroundColor: company?.color || '#6366f1' }}
            ></div>
            <span className="text-sm font-medium text-slate-600">
              {company?.name || 'Operadora'}
            </span>
          </div>
          <Badge variant={lead.quality === 'A' ? 'default' : 'secondary'}>
            Qualidade {lead.quality}
          </Badge>
        </div>

        <div className="space-y-3 mb-4">
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Localização:</span>
            <span className="text-sm font-medium">{lead.city}, {lead.state}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Idade:</span>
            <span className="text-sm font-medium">{lead.age} anos</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Tipo:</span>
            <span className="text-sm font-medium capitalize">{lead.planType}</span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm text-slate-500">Orçamento:</span>
            <span className="text-sm font-medium">
              R$ {parseFloat(lead.budgetMin).toFixed(0)} - R$ {parseFloat(lead.budgetMax).toFixed(0)}
            </span>
          </div>
        </div>

        <div className="border-t pt-4">
          <div className="flex justify-between items-center mb-3">
            <span className="text-lg font-bold text-primary">
              R$ {parseFloat(lead.price).toFixed(2)}
            </span>
            <span className="text-xs text-slate-500">
              há {Math.floor((Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24))} dias
            </span>
          </div>
          
          <Button 
            className="w-full"
            onClick={() => window.location.href = "/api/login"}
            data-testid={`button-login-to-buy-${lead.id}`}
          >
            Fazer Login para Comprar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function PublicLeads() {
  const [filters, setFilters] = useState({
    search: "",
    insuranceCompany: "all",
    ageRange: "all",
    city: "all",
    minPrice: "",
    maxPrice: "",
  });
  const [priceRange, setPriceRange] = useState([0, 200]);

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

  const ageRanges = [
    { value: "18-25", label: "18-25 anos" },
    { value: "26-35", label: "26-35 anos" },
    { value: "36-45", label: "36-45 anos" },
    { value: "46-60", label: "46-60 anos" },
    { value: "60-120", label: "60+ anos" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    setFilters(prev => ({ ...prev, [key]: value }));
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    setFilters(prev => ({ 
      ...prev, 
      minPrice: values[0].toString(),
      maxPrice: values[1].toString()
    }));
  };

  const clearFilters = () => {
    const emptyFilters = {
      search: "",
      insuranceCompany: "all",
      ageRange: "all",
      city: "all",
      minPrice: "",
      maxPrice: "",
    };
    setFilters(emptyFilters);
    setPriceRange([0, 200]);
  };

  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header */}
      <header className="bg-white border-b border-slate-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex justify-between items-center">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
              </div>
              <span className="text-xl font-bold text-slate-800">KeepLeads</span>
            </div>
            
            <Button onClick={() => window.location.href = "/api/login"}>
              Fazer Login
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
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
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Operadora</Label>
                <Select value={filters.insuranceCompany} onValueChange={(value) => handleFilterChange("insuranceCompany", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as operadoras" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as operadoras</SelectItem>
                    {companies.map((company) => (
                      <SelectItem key={company.id} value={company.id}>
                        {company.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Faixa Etária</Label>
                <Select value={filters.ageRange} onValueChange={(value) => handleFilterChange("ageRange", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as idades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as idades</SelectItem>
                    {ageRanges.map((range) => (
                      <SelectItem key={range.value} value={range.value}>
                        {range.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as cidades" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas as cidades</SelectItem>
                    {cities.map((city) => (
                      <SelectItem key={city} value={city}>
                        {city}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Faixa de Preço</Label>
                <div className="space-y-2">
                  <Slider
                    value={priceRange}
                    onValueChange={handlePriceRangeChange}
                    max={200}
                    min={0}
                    step={5}
                    className="w-full"
                  />
                  <span className="text-sm text-slate-600">
                    R$ {priceRange[0]} - R$ {priceRange[1]}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center space-x-2">
              <Button onClick={clearFilters} variant="outline">
                Limpar Filtros
              </Button>
            </div>
          </CardContent>
        </Card>

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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leads.map((lead) => (
              <PublicLeadCard 
                key={lead.id} 
                lead={lead} 
                companies={companies}
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
            onClick={() => window.location.href = "/api/login"}
            className="bg-white text-primary hover:bg-slate-50"
          >
            Fazer Login / Cadastrar
          </Button>
        </div>
      </div>
    </div>
  );
}