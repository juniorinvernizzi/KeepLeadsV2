import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Calendar, CreditCard, User, Star } from "lucide-react";
import LeadInfoModal from "@/components/LeadInfoModal";

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

interface PublicLeadCardProps {
  lead: Lead;
  companies: Array<{id: string; name: string; color: string; logo?: string}>;
}

function PublicLeadCard({ lead, companies }: PublicLeadCardProps) {
  const [showInfoModal, setShowInfoModal] = useState(false);
  
  const company = companies.find(c => c.id === lead.insuranceCompanyId) || {
    id: lead.insuranceCompanyId,
    name: lead.insuranceCompanyId,
    color: "#7C3AED"
  };

  const getQualityBadge = () => {
    switch (lead.quality) {
      case "diamond":
        return {
          label: "Diamante",
          color: "bg-gradient-to-r from-cyan-500 to-cyan-600 text-white",
          icon: <Star className="w-3 h-3" />,
        };
      case "gold":
        return {
          label: "Ouro",
          color: "bg-gradient-to-r from-yellow-500 to-yellow-600 text-white",
          icon: <Star className="w-3 h-3" />,
        };
      case "silver":
        return {
          label: "Prata",
          color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
          icon: <User className="w-3 h-3" />,
        };
      case "bronze":
        return {
          label: "Bronze",
          color: "bg-gradient-to-r from-orange-500 to-orange-600 text-white",
          icon: <Calendar className="w-3 h-3" />,
        };
      default:
        return {
          label: "Padrão",
          color: "bg-gradient-to-r from-gray-500 to-gray-600 text-white",
          icon: <User className="w-3 h-3" />,
        };
    }
  };

  const qualityBadge = getQualityBadge();
  
  return (
    <>
      <Card 
        className="group relative w-full max-w-sm bg-white rounded-2xl shadow-sm hover:shadow-xl transition-all duration-500 border-0 overflow-hidden cursor-pointer transform hover:-translate-y-1" 
        data-testid={`card-lead-${lead.id}`}
        onClick={() => setShowInfoModal(true)}
      >
        {/* Header com gradiente */}
        <div className="relative bg-gradient-to-br from-gray-600 via-gray-600 to-gray-700 p-4">
          <div className="flex items-center justify-between mb-3">
            <div>
              <h3 className="font-semibold text-white text-sm">
                Plano de Saúde
              </h3>
              <p className="text-xs text-purple-100">Lead Qualificado</p>
            </div>
            <div
              className={`px-3 py-1 rounded-full text-xs font-medium flex items-center space-x-1 ${qualityBadge.color}`}
            >
              {qualityBadge.icon}
              <span>{qualityBadge.label}</span>
            </div>
          </div>

          <div className="flex items-center space-x-2 text-purple-100">
            <MapPin className="w-4 h-4" />
            <span
              className="text-sm font-medium"
              data-testid={`text-location-${lead.id}`}
            >
              {lead.city ? `${lead.city}, ${lead.state}` : lead.state}
            </span>
          </div>
        </div>

        <CardContent className="p-4 sm:p-6">
          {/* Informações principais em grid moderno */}
          <div className="grid grid-cols-2 gap-2 sm:gap-3 mb-4 sm:mb-6">
            <div className="bg-gradient-to-r from-emerald-50 to-green-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-emerald-100">
              <div className="flex items-center space-x-1 mb-1">
                <User className="w-3 h-3 text-emerald-600" />
                <span className="text-[10px] sm:text-xs font-medium text-emerald-600">
                  Vidas
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900">
                {lead.availableLives}
              </p>
            </div>

            <div className="bg-gradient-to-r from-orange-50 to-amber-50 rounded-lg sm:rounded-xl p-2 sm:p-3 border border-orange-100">
              <div className="flex items-center space-x-1 mb-1">
                <CreditCard className="w-3 h-3 text-orange-600" />
                <span className="text-[10px] sm:text-xs font-medium text-orange-600">
                  Plano
                </span>
              </div>
              <p className="text-xs sm:text-sm font-bold text-gray-900 capitalize truncate">
                {lead.planType}
              </p>
            </div>
          </div>

          {/* Preço com destaque especial */}
          <div className="relative bg-gradient-to-br from-gray-100 to-gray-200 rounded-xl p-4 sm:p-5 mb-4 sm:mb-6 overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-gray-200/50 to-transparent rounded-full -translate-y-16 translate-x-16"></div>
            <div className="relative text-center">
              <p className="text-[10px] sm:text-xs text-gray-800 mb-1">
                Valor do lead
              </p>
              <div
                className="text-2xl sm:text-3xl font-bold text-gray-800"
                data-testid={`text-price-${lead.id}`}
              >
                R$ {parseFloat(lead.price).toFixed(2)}
              </div>
            </div>
          </div>

          {/* Botão de ação moderno */}
          <Button
            onClick={(e) => {
              e.stopPropagation();
              window.location.href = "/login";
            }}
            className="w-full h-12 bg-gradient-to-r from-primary-600 to-primary-light-600 hover:from-primary-light-700 hover:to-primary-light-700 text-white font-semibold rounded-xl transition-all duration-300 shadow-lg hover:shadow-xl flex items-center justify-center space-x-2 group"
            data-testid={`button-login-to-buy-${lead.id}`}
          >
            <span>Fazer login para comprar</span>
          </Button>
        </CardContent>
      </Card>

      <LeadInfoModal
        isOpen={showInfoModal}
        onClose={() => setShowInfoModal(false)}
        lead={lead}
        companies={companies}
      />
    </>
  );
}

export default function PublicLeads() {
  const [filters, setFilters] = useState({
    search: "",
    city: "all",
    planType: "all",
    livesCount: "all",
    quality: "all",
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
      city: "all",
      planType: "all",
      livesCount: "all",
      quality: "all",
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
        <Card className="mb-8">
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="space-y-2">
                <Label>Tipo de Plano</Label>
                <Select value={filters.planType} onValueChange={(value) => handleFilterChange("planType", value)}>
                  <SelectTrigger data-testid="select-plan-type">
                    <SelectValue placeholder="Todos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="pf">PF</SelectItem>
                    <SelectItem value="pj">PJ</SelectItem>
                    <SelectItem value="pme">PME</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Quantidade de Vidas</Label>
                <Select value={filters.livesCount} onValueChange={(value) => handleFilterChange("livesCount", value)}>
                  <SelectTrigger data-testid="select-lives-count">
                    <SelectValue placeholder="Todas" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="1">1 vida</SelectItem>
                    <SelectItem value="2">2 vidas</SelectItem>
                    <SelectItem value="3-5">3-5 vidas</SelectItem>
                    <SelectItem value="6-10">6-10 vidas</SelectItem>
                    <SelectItem value="11+">11+ vidas</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              
              <div className="space-y-2">
                <Label>Cidade</Label>
                <Select value={filters.city} onValueChange={(value) => handleFilterChange("city", value)}>
                  <SelectTrigger data-testid="select-city">
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
                <Label>Qualidade do Plano</Label>
                <Select value={filters.quality} onValueChange={(value) => handleFilterChange("quality", value)}>
                  <SelectTrigger data-testid="select-quality">
                    <SelectValue placeholder="Todos os planos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos os planos</SelectItem>
                    <SelectItem value="diamond">Diamante</SelectItem>
                    <SelectItem value="gold">Ouro</SelectItem>
                    <SelectItem value="silver">Prata</SelectItem>
                    <SelectItem value="bronze">Bronze</SelectItem>
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
              <Button onClick={clearFilters} variant="outline" data-testid="button-clear-filters">
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