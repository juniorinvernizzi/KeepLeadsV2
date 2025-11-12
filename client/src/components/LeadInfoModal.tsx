import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Calendar, CreditCard, MapPin, Phone, User, Star, Building, Tag, Users } from "lucide-react";

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

interface Company {
  id: string;
  name: string;
  color: string;
  logo?: string;
}

interface LeadInfoModalProps {
  isOpen: boolean;
  onClose: () => void;
  lead: Lead;
  companies: Company[];
}

export default function LeadInfoModal({ isOpen, onClose, lead, companies }: LeadInfoModalProps) {
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

  const getQualityColor = (quality: string) => {
    switch (quality.toUpperCase()) {
      case 'A': return 'bg-green-100 text-green-800 border-green-200';
      case 'B': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'C': return 'bg-red-100 text-red-800 border-red-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const daysSinceCreated = Math.floor(
    (Date.now() - new Date(lead.createdAt).getTime()) / (1000 * 60 * 60 * 24)
  );

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto mx-4 sm:mx-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-3">
            <div 
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: company?.color || '#7C3AED' }}
            >
              {company?.logo ? (
                <img 
                  src={company.logo.startsWith('@assets/') ? 
                    new URL(`../../../${company.logo.replace('@assets/', 'attached_assets/')}`, import.meta.url).href : 
                    company.logo
                  } 
                  alt={company.name}
                  className="w-8 h-8 object-contain filter brightness-0 invert"
                />
              ) : (
                <span className="text-white font-bold text-lg">
                  {company?.name?.charAt(0) || 'L'}
                </span>
              )}
            </div>
            <div>
              <h2 className="text-xl font-bold">{company?.name || 'Operadora'}</h2>
              <p className="text-sm text-gray-500">Informações detalhadas do lead</p>
            </div>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Stats */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                R$ {parseFloat(lead.price).toFixed(2)}
              </div>
              <p className="text-sm text-gray-500">Preço do Lead</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">{lead.availableLives}</div>
              <p className="text-sm text-gray-500">Vida{lead.availableLives > 1 ? 's' : ''} Disponível{lead.availableLives > 1 ? 'is' : ''}</p>
            </div>
            
            <div className="text-center p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-900">
                {daysSinceCreated === 0 ? 'Hoje' : `${daysSinceCreated}d`}
              </div>
              <p className="text-sm text-gray-500">Criado há</p>
            </div>
          </div>

          {/* Quality and Status */}
          <div className="flex items-center justify-between">
            <Badge className={`${getQualityColor(lead.quality)} border font-medium`}>
              <Star className="w-3 h-3 mr-1" />
              Qualidade {lead.quality}
            </Badge>
            
            <Badge variant="outline" className="font-medium">
              {lead.status === 'available' ? 'Disponível' : 
               lead.status === 'sold' ? 'Vendido' : 
               lead.status === 'reserved' ? 'Reservado' : 'Expirado'}
            </Badge>
          </div>

          {/* Lead Information */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Informações Básicas</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <MapPin className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Localização</p>
                    <p className="font-medium">{lead.city}, {lead.state}</p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Building className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Tipo de Plano</p>
                    <p className="font-medium capitalize">{lead.planType}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Informações de Contato</h3>
              
              <div className="space-y-3">
                <div className="flex items-center space-x-3">
                  <User className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Nome</p>
                    <p className="font-medium text-gray-400">
                      {maskSensitiveInfo(lead.name, 'name')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <span className="w-4 h-4 text-gray-400">@</span>
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="font-medium text-gray-400">
                      {maskSensitiveInfo(lead.email, 'email')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center space-x-3">
                  <Phone className="w-4 h-4 text-gray-400" />
                  <div>
                    <p className="text-sm text-gray-500">Telefone</p>
                    <p className="font-medium text-gray-400">
                      {maskSensitiveInfo(lead.phone, 'phone')}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Marketing Information */}
          <div className="space-y-4">
            <h3 className="font-semibold text-gray-900 border-b pb-2">Informações de Marketing</h3>
            
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="flex items-center space-x-3">
                <Tag className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Origem</p>
                  <p className="font-medium">Meta Facebook</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Users className="w-4 h-4 text-gray-400" />
                <div>
                  <p className="text-sm text-gray-500">Campanha</p>
                  <p className="font-medium">Plano de Saúde</p>
                </div>
              </div>
            </div>
          </div>

          {/* Notes */}
          {lead.notes && (
            <div className="space-y-2">
              <h3 className="font-semibold text-gray-900 border-b pb-2">Observações</h3>
              <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded-lg">
                {lead.notes}
              </p>
            </div>
          )}

          {/* Privacy Notice */}
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
            <p className="text-sm text-amber-700 text-center flex items-center justify-center">
              <span className="mr-2">🔒</span>
              Informações completas de contato disponíveis após a compra
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end space-x-3 pt-4 border-t">
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}