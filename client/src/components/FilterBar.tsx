import { useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FilterBarProps {
  filters: {
    search: string;
    insuranceCompany: string;
    ageRange: string;
    city: string;
    minPrice: string;
    maxPrice: string;
  };
  onFiltersChange: (filters: any) => void;
  companies: Array<{id: string; name: string}>;
}

export default function FilterBar({ filters, onFiltersChange, companies }: FilterBarProps) {
  const [localFilters, setLocalFilters] = useState(filters);
  const [priceRange, setPriceRange] = useState([0, 200]);

  const cities = [
    "São Paulo",
    "Rio de Janeiro", 
    "Brasília",
    "Belo Horizonte",
    "Curitiba",
    "Porto Alegre",
    "Salvador",
    "Fortaleza",
    "Recife",
    "Manaus"
  ];

  const ageRanges = [
    { value: "18-25", label: "18-25 anos" },
    { value: "26-35", label: "26-35 anos" },
    { value: "36-45", label: "36-45 anos" },
    { value: "46-60", label: "46-60 anos" },
    { value: "60-120", label: "60+ anos" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...localFilters, [key]: value };
    setLocalFilters(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    setPriceRange(values);
    const newFilters = { 
      ...localFilters, 
      minPrice: values[0].toString(),
      maxPrice: values[1].toString()
    };
    setLocalFilters(newFilters);
  };

  const applyFilters = () => {
    onFiltersChange(localFilters);
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
    setLocalFilters(emptyFilters);
    setPriceRange([0, 200]);
    onFiltersChange(emptyFilters);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="search">Buscar</Label>
            <div className="relative">
              <Input
                id="search"
                type="text"
                placeholder="Nome, telefone, email..."
                value={localFilters.search}
                onChange={(e) => handleFilterChange("search", e.target.value)}
                className="pl-10"
                data-testid="input-search"
              />
              <svg className="absolute left-3 top-3 w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
              </svg>
            </div>
          </div>
          
          <div className="space-y-2">
            <Label htmlFor="company">Operadora</Label>
            <Select value={localFilters.insuranceCompany} onValueChange={(value) => handleFilterChange("insuranceCompany", value)}>
              <SelectTrigger data-testid="select-company">
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
            <Label htmlFor="ageRange">Faixa Etária</Label>
            <Select value={localFilters.ageRange} onValueChange={(value) => handleFilterChange("ageRange", value)}>
              <SelectTrigger data-testid="select-age-range">
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
            <Label htmlFor="city">Cidade</Label>
            <Select value={localFilters.city} onValueChange={(value) => handleFilterChange("city", value)}>
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
        </div>
        
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <span className="text-sm text-slate-600">Preço:</span>
            <div className="flex items-center space-x-4">
              <div className="w-32">
                <Slider
                  value={priceRange}
                  onValueChange={handlePriceRangeChange}
                  max={200}
                  min={0}
                  step={5}
                  className="w-full"
                  data-testid="slider-price-range"
                />
              </div>
              <span className="text-sm font-medium text-slate-800" data-testid="text-price-range">
                R$ {priceRange[0]} - R$ {priceRange[1]}
              </span>
            </div>
          </div>
          
          <div className="flex items-center space-x-2">
            <Button onClick={applyFilters} data-testid="button-apply-filters">
              <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 011-1h12a1 1 0 011 1v3a1 1 0 01-.293.707L12 11.414V15a1 1 0 01-.293.707l-2 2A1 1 0 018 17v-5.586L3.293 6.707A1 1 0 013 6V3z" clipRule="evenodd" />
              </svg>
              Filtrar
            </Button>
            <Button variant="outline" onClick={clearFilters} data-testid="button-clear-filters">
              Limpar
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
