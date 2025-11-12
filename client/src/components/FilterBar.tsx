import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";

interface FilterBarProps {
  filters: {
    insuranceCompany: string;
    ageRange: string;
    city: string;
    planType: string;
    livesCount: string;
    minPrice: string;
    maxPrice: string;
  };
  onFiltersChange: (filters: any) => void;
  companies: Array<{ id: string; name: string }>;
}

export default function FilterBar({
  filters,
  onFiltersChange,
  companies,
}: FilterBarProps) {
  const priceRange = [
    parseInt(filters.minPrice) || 0,
    parseInt(filters.maxPrice) || 200,
  ];

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
    "Manaus",
  ];

  const ageRanges = [
    { value: "18-25", label: "18-25 anos" },
    { value: "26-35", label: "26-35 anos" },
    { value: "36-45", label: "36-45 anos" },
    { value: "46-60", label: "46-60 anos" },
    { value: "60-120", label: "60+ anos" },
  ];

  const planTypes = [
    { value: "individual", label: "Individual" },
    { value: "familiar", label: "Familiar" },
    { value: "empresarial", label: "Empresarial" },
    { value: "coletivo", label: "Coletivo" },
  ];

  const livesOptions = [
    { value: "1", label: "1 vida" },
    { value: "2", label: "2 vidas" },
    { value: "3-5", label: "3-5 vidas" },
    { value: "6-10", label: "6-10 vidas" },
    { value: "11+", label: "11+ vidas" },
  ];

  const handleFilterChange = (key: string, value: string) => {
    const newFilters = { ...filters, [key]: value };
    onFiltersChange(newFilters);
  };

  const handlePriceRangeChange = (values: number[]) => {
    const newFilters = {
      ...filters,
      minPrice: values[0].toString(),
      maxPrice: values[1].toString(),
    };
    onFiltersChange(newFilters);
  };

  const clearFilters = () => {
    const emptyFilters = {
      insuranceCompany: "all",
      ageRange: "all",
      city: "all",
      planType: "all",
      livesCount: "all",
      minPrice: "",
      maxPrice: "",
    };
    onFiltersChange(emptyFilters);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-4">
          <div className="space-y-2">
            <Label htmlFor="company">Operadora</Label>
            <Select
              value={filters.insuranceCompany}
              onValueChange={(value) =>
                handleFilterChange("insuranceCompany", value)
              }
            >
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
            <Select
              value={filters.ageRange}
              onValueChange={(value) => handleFilterChange("ageRange", value)}
            >
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
            <Label htmlFor="city">Localização</Label>
            <Select
              value={filters.city}
              onValueChange={(value) => handleFilterChange("city", value)}
            >
              <SelectTrigger data-testid="select-city">
                <SelectValue placeholder="Todas as cidades" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas localizações</SelectItem>
                {cities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="planType">Tipo de Plano</Label>
            <Select
              value={filters.planType}
              onValueChange={(value) => handleFilterChange("planType", value)}
            >
              <SelectTrigger data-testid="select-plan-type">
                <SelectValue placeholder="Todos os tipos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os tipos</SelectItem>
                {planTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="livesCount">Quantidade de Vidas</Label>
            <Select
              value={filters.livesCount}
              onValueChange={(value) => handleFilterChange("livesCount", value)}
            >
              <SelectTrigger data-testid="select-lives-count">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {livesOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 sm:gap-4 flex-1">
            <span className="text-sm text-slate-600 whitespace-nowrap">
              Preço:
            </span>
            <div className="flex items-center gap-3 sm:gap-4 flex-1 sm:flex-initial">
              <div className="w-full sm:w-48">
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
              <span
                className="text-sm font-medium text-slate-800 whitespace-nowrap"
                data-testid="text-price-range"
              >
                R$ {priceRange[0]} - R$ {priceRange[1]}
              </span>
            </div>
          </div>

          <div className="flex items-center space-x-2">
            <Button
              variant="outline"
              onClick={clearFilters}
              data-testid="button-clear-filters"
              className="w-full sm:w-auto"
            >
              Limpar filtros
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
