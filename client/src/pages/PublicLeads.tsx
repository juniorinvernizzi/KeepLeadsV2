import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import { MapPin, Calendar, CreditCard, User, Star, Eye, EyeOff, Phone } from "lucide-react";
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
  const [isExpanded, setIsExpanded] = useState(false);
  
  const company = companies.find(c => c.id === lead.insuranceCompanyId) || {
    id: lead.insuranceCompanyId,
    name: lead.insuranceCompanyId,
    color: "#7C3AED"
  };

  const maskSensitiveInfo = (text: string, type: 'email' | 'phone' | 'name'): string => {
    switch (type) {
      case 'email':
        const [name, domain] = text.split('@');
        return `${name.slice(0, 2)}***@${domain}`;
      case 'phone':
        return text.slice(0, 5) + '****-****';
      case 'name':
        const names = text.split(' ');
        return `${names[0]} ${'*'.repeat(names.slice(1).join(' ').length)}`;
      default:
        return text;
    }
  };

  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  const getQualityColor = (quality: string) => {
    switch (quality.toUpperCase()) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };
  
  return (
    <>
      <Card 
        className="w-full max-w-sm bg-white rounded-2xl shadow-lg hover:shadow-xl transition-all duration-300 overflow-hidden border-0 cursor-pointer" 
        data-testid={`card-lead-${lead.id}`}
        onClick={() => setIsExpanded(!isExpanded)}
      >
        <div className="flex h-44">
          {/* Left side - Company Logo/Branding */}
          <div 
            className="w-40 flex flex-col items-center justify-center relative"
            style={{ backgroundColor: company?.color || '#dc2626' }}
          >
            {/* Time indicator */}
            <div className="absolute top-3 left-3 bg-white/20 rounded-full px-2 py-1">
              <span className="text-white text-xs font-medium">
                {daysSinceCreated === 0 ? 'Hoje' : `${daysSinceCreated}d`}
              </span>
            </div>

            {/* Company Logo */}
            <div className="w-20 h-20 bg-white/20 rounded-2xl flex items-center justify-center backdrop-blur-sm mb-2">
              {company?.logo ? (
                <img 
                  src={company.logo} 
                  alt={company.name}
                  className="w-12 h-12 object-contain filter brightness-0 invert"
                />
              ) : (
                <span className="text-white font-bold text-2xl">
                  {company?.name?.charAt(0) || 'L'}
                </span>
              )}
            </div>

            {/* Quality Badge */}
            <div className="bg-white/20 rounded-full px-3 py-1">
              <span className="text-white text-xs font-semibold">
                Qualidade {lead.quality}
              </span>
            </div>
          </div>

          {/* Right side - Lead Information */}
          <div className="flex-1 p-4 flex flex-col justify-between relative">
            {/* Header */}
            <div>
              <h3 className="text-lg font-bold text-gray-900 mb-1">
                {company?.name || 'Operadora'}
              </h3>
              <p className="text-sm text-gray-500 mb-3">Plano de Saúde</p>
            </div>

            {/* Price and Action */}
            <div>
              <div className="text-right mb-3">
                <div className="text-2xl font-bold text-gray-900" data-testid={`text-price-${lead.id}`}>
                  R$ {parseFloat(lead.price).toFixed(2)}
                </div>
              </div>
              
              <Button
                onClick={(e) => {
                  e.stopPropagation();
                  window.location.href = "/api/login";
                }}
                className="w-full bg-purple-600 hover:bg-purple-700 text-white font-bold py-3 rounded-xl text-sm tracking-wide transition-all duration-200"
                data-testid={`button-login-to-buy-${lead.id}`}
              >
                FAZER LOGIN PARA COMPRAR
              </Button>
            </div>

            {/* Bottom right indicator */}
            <div className="absolute bottom-3 right-3">
              <div className="flex items-center space-x-1 text-gray-400">
                <User className="w-3 h-3" />
                <span className="text-xs">Individual</span>
              </div>
            </div>
          </div>
        </div>

        {/* Expandable details - Same as authenticated cards */}
        {isExpanded && (
          <div className="border-t border-gray-100 p-4 bg-gray-50">
            <div className="space-y-3">
              {/* Basic Lead Information */}
              <div className="grid grid-cols-2 gap-3 text-sm">
                <div className="flex items-center space-x-2">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Localização</p>
                    <p className="font-medium" data-testid={`text-location-${lead.id}`}>
                      {lead.city}, {lead.state}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Calendar className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Idade</p>
                    <p className="font-medium">{lead.age} anos</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <CreditCard className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Tipo de Plano</p>
                    <p className="font-medium capitalize">{lead.planType}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <Star className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Orçamento</p>
                    <p className="font-medium">
                      R$ {parseFloat(lead.budgetMin).toFixed(0)} - R$ {parseFloat(lead.budgetMax).toFixed(0)}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-2">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-xs text-gray-500">Vidas Disponíveis</p>
                    <p className="font-medium">{lead.availableLives} vida{lead.availableLives > 1 ? 's' : ''}</p>
                  </div>
                </div>
              </div>

              {/* Login Notice */}
              <div className="border-t border-gray-200 pt-3">
                <div className="bg-purple-50 border border-purple-200 rounded-lg p-3">
                  <p className="text-sm text-purple-700 text-center flex items-center justify-center">
                    <span className="mr-2">🔐</span>
                    Faça login para ver informações de contato e comprar este lead
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Action buttons at bottom */}
        <div className="border-t border-gray-100 p-2 flex space-x-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              setIsExpanded(!isExpanded);
            }}
            className="flex-1 flex items-center justify-center py-2 text-gray-500 hover:text-gray-700 transition-colors"
          >
            {isExpanded ? (
              <>
                <EyeOff className="w-4 h-4 mr-2" />
                <span className="text-sm">Ocultar</span>
              </>
            ) : (
              <>
                <Eye className="w-4 h-4 mr-2" />
                <span className="text-sm">Expandir</span>
              </>
            )}
          </button>
          
          <button
            onClick={(e) => {
              e.stopPropagation();
              setShowInfoModal(true);
            }}
            className="flex-1 flex items-center justify-center py-2 text-purple-600 hover:text-purple-700 transition-colors"
          >
            <Star className="w-4 h-4 mr-2" />
            <span className="text-sm">Popup</span>
          </button>
        </div>
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