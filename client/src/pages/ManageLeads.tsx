import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Plus, Edit, Trash2, Users } from "lucide-react";

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

interface InsuranceCompany {
  id: string;
  name: string;
  color: string;
  logo?: string;
}

const leadFormSchema = z.object({
  name: z.string().min(1, "Nome é obrigatório"),
  email: z.string().email("E-mail inválido"),
  phone: z.string().min(1, "Telefone é obrigatório"),
  city: z.string().optional(),
  state: z.string().min(1, "Estado é obrigatório"),
  planType: z.string().min(1, "Tipo de plano é obrigatório"),
  availableLives: z.number().min(1, "Mínimo 1 vida disponível"),
  source: z.string().min(1, "Origem é obrigatória"),
  campaign: z.string().min(1, "Campanha é obrigatória"),
  quality: z.enum(["gold", "silver", "bronze"], { required_error: "Qualidade é obrigatória" }),
  status: z.enum(["available", "sold", "reserved", "expired"], { required_error: "Status é obrigatório" }),
  price: z.string().min(1, "Preço é obrigatório"),
  notes: z.string().optional(),
});

type LeadFormData = z.infer<typeof leadFormSchema>;

const BRAZILIAN_STATES = [
  { code: "AC", name: "Acre" },
  { code: "AL", name: "Alagoas" },
  { code: "AP", name: "Amapá" },
  { code: "AM", name: "Amazonas" },
  { code: "BA", name: "Bahia" },
  { code: "CE", name: "Ceará" },
  { code: "DF", name: "Distrito Federal" },
  { code: "ES", name: "Espírito Santo" },
  { code: "GO", name: "Goiás" },
  { code: "MA", name: "Maranhão" },
  { code: "MT", name: "Mato Grosso" },
  { code: "MS", name: "Mato Grosso do Sul" },
  { code: "MG", name: "Minas Gerais" },
  { code: "PA", name: "Pará" },
  { code: "PB", name: "Paraíba" },
  { code: "PR", name: "Paraná" },
  { code: "PE", name: "Pernambuco" },
  { code: "PI", name: "Piauí" },
  { code: "RJ", name: "Rio de Janeiro" },
  { code: "RN", name: "Rio Grande do Norte" },
  { code: "RS", name: "Rio Grande do Sul" },
  { code: "RO", name: "Rondônia" },
  { code: "RR", name: "Roraima" },
  { code: "SC", name: "Santa Catarina" },
  { code: "SP", name: "São Paulo" },
  { code: "SE", name: "Sergipe" },
  { code: "TO", name: "Tocantins" },
];

export default function ManageLeads() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [showLeadModal, setShowLeadModal] = useState(false);
  const [editingLead, setEditingLead] = useState<Lead | null>(null);
  
  const form = useForm<LeadFormData>({
    resolver: zodResolver(leadFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      city: "",
      state: "",
      planType: "individual",
      availableLives: 1,
      source: "",
      campaign: "",
      quality: "silver",
      status: "available",
      price: "",
      notes: "",
    },
  });

  // Redirect non-admin users
  useEffect(() => {
    if (user && user.role !== "admin") {
      toast({
        title: "Acesso negado",
        description: "Você precisa ser administrador para acessar esta página.",
        variant: "destructive",
      });
      window.location.href = "/";
    }
  }, [user, toast]);

  const { data: allLeads = [], refetch: refetchLeads } = useQuery<Lead[]>({
    queryKey: ["/api/admin/leads"],
    enabled: user?.role === "admin",
  });


  // Mutation for creating/updating leads
  const leadMutation = useMutation({
    mutationFn: async (data: LeadFormData) => {
      const leadData = {
        ...data,
        age: 30, // Default value for hidden field
        budgetMin: "0.00", // Default value for hidden field
        budgetMax: "0.00", // Default value for hidden field
        insuranceCompanyId: null, // No company filtering
      };

      if (editingLead) {
        return apiRequest("PUT", `/api/admin/leads/${editingLead.id}`, leadData);
      } else {
        return apiRequest("POST", "/api/admin/leads", leadData);
      }
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      setShowLeadModal(false);
      setEditingLead(null);
      form.reset();
      toast({
        title: "Sucesso",
        description: editingLead ? "Lead atualizado com sucesso!" : "Lead criado com sucesso!",
      });
    },
    onError: (error: Error) => {
      console.error("Error managing lead:", error);
      toast({
        title: "Erro",
        description: editingLead ? "Erro ao atualizar lead" : "Erro ao criar lead",
        variant: "destructive",
      });
    },
  });

  // Mutation for deleting leads
  const deleteMutation = useMutation({
    mutationFn: async (leadId: string) => {
      return apiRequest("DELETE", `/api/admin/leads/${leadId}`);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["/api/admin/leads"] });
      queryClient.invalidateQueries({ queryKey: ["/api/admin/stats"] });
      toast({
        title: "Sucesso",
        description: "Lead excluído com sucesso!",
      });
    },
    onError: (error: Error) => {
      console.error("Error deleting lead:", error);
      toast({
        title: "Erro",
        description: "Erro ao excluir lead",
        variant: "destructive",
      });
    },
  });

  const handleEditLead = (lead: Lead) => {
    setEditingLead(lead);
    form.reset({
      name: lead.name,
      email: lead.email,
      phone: lead.phone,
      city: lead.city || "",
      state: lead.state,
      planType: lead.planType,
      availableLives: lead.availableLives,
      source: lead.source,
      campaign: lead.campaign,
      quality: lead.quality as "gold" | "silver" | "bronze",
      status: lead.status as "available" | "sold" | "reserved" | "expired",
      price: lead.price,
      notes: lead.notes,
    });
    setShowLeadModal(true);
  };

  const handleDeleteLead = (leadId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este lead?")) {
      deleteMutation.mutate(leadId);
    }
  };

  const onSubmit = (data: LeadFormData) => {
    leadMutation.mutate(data);
  };

  // Don't render for non-admin users
  if (!user || user.role !== "admin") {
    return (
      <Layout>
        <div className="w-full">
          <div className="text-center py-12">
            <div className="w-16 h-16 mx-auto mb-4 bg-red-100 rounded-full flex items-center justify-center">
              <svg className="w-8 h-8 text-red-600" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M13.477 14.89A6 6 0 015.11 6.524l8.367 8.368zm1.414-1.414L6.524 5.11a6 6 0 018.367 8.367zM18 10a8 8 0 11-16 0 8 8 0 0116 0z" clipRule="evenodd" />
              </svg>
            </div>
            <h3 className="text-lg font-medium text-slate-900 mb-2">Acesso Restrito</h3>
            <p className="text-slate-500">Esta área é restrita para administradores.</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-9/10 mx-auto py-8">
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-slate-800 mb-2" data-testid="text-page-title">
            Gerenciar Leads
          </h1>
          <p className="text-slate-600">Adicione, edite e exclua leads criados manualmente</p>
        </div>

        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Leads Cadastrados</CardTitle>
              <Button 
                onClick={() => {
                  setEditingLead(null);
                  form.reset();
                  setShowLeadModal(true);
                }}
                data-testid="button-add-lead"
              >
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Lead
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            {allLeads.length === 0 ? (
              <div className="text-center py-8">
                <div className="w-12 h-12 mx-auto mb-4 bg-slate-100 rounded-full flex items-center justify-center">
                  <Users className="w-6 h-6 text-slate-400" />
                </div>
                <p className="text-slate-600" data-testid="text-no-leads">Nenhum lead encontrado</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-slate-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Lead
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Localização
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Qualidade
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Preço
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">
                        Ações
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-slate-200">
                    {allLeads.map((lead) => {
                      const locationText = lead.city && lead.state ? `${lead.city}, ${lead.state}` : lead.state;
                      return (
                        <tr key={lead.id} className="hover:bg-slate-50" data-testid={`row-lead-${lead.id}`}>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div>
                              <div className="text-sm font-medium text-slate-900" data-testid={`text-lead-name-${lead.id}`}>
                                {lead.name}
                              </div>
                              <div className="text-sm text-slate-500">{lead.email}</div>
                            </div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <div className="text-sm text-slate-900">{locationText}</div>
                            <div className="text-sm text-slate-500">{lead.planType}</div>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              className={
                                lead.quality === "gold" ? "bg-yellow-100 text-yellow-800" :
                                lead.quality === "silver" ? "bg-gray-200 text-gray-800" :
                                "bg-orange-100 text-orange-800"
                              }
                              data-testid={`text-lead-quality-${lead.id}`}
                            >
                              {lead.quality === "gold" ? "Ouro" : lead.quality === "silver" ? "Prata" : "Bronze"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-slate-900" data-testid={`text-lead-price-${lead.id}`}>
                            R$ {parseFloat(lead.price).toFixed(2)}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <Badge 
                              className={
                                lead.status === "available" ? "bg-green-100 text-green-800" :
                                lead.status === "sold" ? "bg-blue-100 text-blue-800" :
                                lead.status === "reserved" ? "bg-yellow-100 text-yellow-800" :
                                "bg-gray-100 text-gray-800"
                              }
                              data-testid={`text-lead-status-${lead.id}`}
                            >
                              {lead.status === "available" ? "Disponível" : 
                               lead.status === "sold" ? "Vendido" :
                               lead.status === "reserved" ? "Reservado" : "Expirado"}
                            </Badge>
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-sm">
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleEditLead(lead)}
                              className="text-primary hover:text-primary-dark mr-2" 
                              data-testid={`button-edit-lead-${lead.id}`}
                            >
                              <Edit className="w-4 h-4" />
                            </Button>
                            <Button 
                              variant="ghost" 
                              size="sm" 
                              onClick={() => handleDeleteLead(lead.id)}
                              className="text-red-600 hover:text-red-800" 
                              data-testid={`button-delete-lead-${lead.id}`}
                            >
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Lead Modal */}
        <Dialog open={showLeadModal} onOpenChange={setShowLeadModal}>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{editingLead ? "Editar Lead" : "Adicionar Lead"}</DialogTitle>
            </DialogHeader>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="name"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome completo" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="email"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>E-mail</FormLabel>
                        <FormControl>
                          <Input placeholder="email@exemplo.com" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="phone"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Telefone</FormLabel>
                        <FormControl>
                          <Input placeholder="(11) 99999-9999" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="city"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Localização (Cidade)</FormLabel>
                        <FormControl>
                          <Input placeholder="São Paulo (opcional)" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="state"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Estado</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o estado" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="max-h-60">
                            {BRAZILIAN_STATES.map((state) => (
                              <SelectItem key={state.code} value={state.code}>
                                {state.code} - {state.name}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="planType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Tipo de Plano</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o tipo" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="individual">Individual</SelectItem>
                            <SelectItem value="familiar">Familiar</SelectItem>
                            <SelectItem value="empresarial">Empresarial</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="availableLives"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Vidas Disponíveis</FormLabel>
                        <FormControl>
                          <Input 
                            type="number" 
                            {...field} 
                            onChange={e => field.onChange(parseInt(e.target.value))}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="source"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Origem</FormLabel>
                        <FormControl>
                          <Input placeholder="Site, indicação, etc." {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="campaign"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Campanha</FormLabel>
                        <FormControl>
                          <Input placeholder="Nome da campanha" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="quality"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Qualidade</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a qualidade" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="gold">Ouro</SelectItem>
                            <SelectItem value="silver">Prata</SelectItem>
                            <SelectItem value="bronze">Bronze</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="status"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Status</FormLabel>
                        <Select onValueChange={field.onChange} value={field.value}>
                          <FormControl>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent>
                            <SelectItem value="available">Disponível</SelectItem>
                            <SelectItem value="sold">Vendido</SelectItem>
                            <SelectItem value="reserved">Reservado</SelectItem>
                            <SelectItem value="expired">Expirado</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={form.control}
                    name="price"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Preço (R$)</FormLabel>
                        <FormControl>
                          <Input placeholder="0.00" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea placeholder="Observações adicionais..." {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="button" variant="outline" onClick={() => setShowLeadModal(false)}>
                    Cancelar
                  </Button>
                  <Button type="submit" disabled={leadMutation.isPending}>
                    {leadMutation.isPending ? "Salvando..." : editingLead ? "Atualizar" : "Criar"}
                  </Button>
                </div>
              </form>
            </Form>
          </DialogContent>
        </Dialog>
      </div>
    </Layout>
  );
}