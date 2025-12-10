import { Card, CardContent } from "@/components/ui/card";
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
    city: string;
    planType: string;
    livesCount: string;
    minPrice: string;
    maxPrice: string;
    quality: string;
  };
  onFiltersChange: (filters: any) => void;
  cities?: string[];
}

export default function FilterBar({
  filters,
  onFiltersChange,
  cities = [],
}: FilterBarProps) {
  const priceRange = [
    parseInt(filters.minPrice) || 0,
    parseInt(filters.maxPrice) || 200,
  ];

  const defaultCities = [
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

  const availableCities = cities.length > 0 ? cities : defaultCities;

  const planTypes = [
    { value: "pf", label: "PF" },
    { value: "pj", label: "PJ" },
    { value: "pme", label: "PME" },
  ];

  const livesOptions = [
    { value: "1", label: "1 vida" },
    { value: "2", label: "2 vidas" },
    { value: "3-5", label: "3-5 vidas" },
    { value: "6-10", label: "6-10 vidas" },
    { value: "11+", label: "11+ vidas" },
  ];

  const qualityOptions = [
    { value: "diamond", label: "Diamante" },
    { value: "gold", label: "Ouro" },
    { value: "silver", label: "Prata" },
    { value: "bronze", label: "Bronze" },
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
      city: "all",
      planType: "all",
      livesCount: "all",
      minPrice: "0",
      maxPrice: "200",
      quality: "all",
    };
    onFiltersChange(emptyFilters);
  };

  return (
    <Card className="mb-8">
      <CardContent className="p-6">
        <div className="flex flex-wrap lg:flex-nowrap items-end gap-4">
          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Tipo de Plano</Label>
            <Select
              value={filters.planType}
              onValueChange={(value) => handleFilterChange("planType", value)}
            >
              <SelectTrigger data-testid="select-plan-type">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {planTypes.map((type) => (
                  <SelectItem key={type.value} value={type.value}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Vidas</Label>
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

          <div className="flex-1 min-w-[140px] space-y-2">
            <Label>Cidade</Label>
            <Select
              value={filters.city}
              onValueChange={(value) => handleFilterChange("city", value)}
            >
              <SelectTrigger data-testid="select-city">
                <SelectValue placeholder="Todas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todas</SelectItem>
                {availableCities.map((city) => (
                  <SelectItem key={city} value={city}>
                    {city}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[120px] space-y-2">
            <Label>Qualidade</Label>
            <Select
              value={filters.quality}
              onValueChange={(value) => handleFilterChange("quality", value)}
            >
              <SelectTrigger data-testid="select-quality">
                <SelectValue placeholder="Todos" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos</SelectItem>
                {qualityOptions.map((option) => (
                  <SelectItem key={option.value} value={option.value}>
                    {option.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="flex-1 min-w-[150px] space-y-2">
            <Label>Preço: R$ {priceRange[0]} - R$ {priceRange[1]}</Label>
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

          <Button
            variant="outline"
            onClick={clearFilters}
            data-testid="button-clear-filters"
            className="whitespace-nowrap"
          >
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
