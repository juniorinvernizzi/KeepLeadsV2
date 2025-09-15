import Layout from "@/components/Layout";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { CookieStatusCard } from "@/components/cookies/CookieSettings";
import { Shield, Mail, Phone, Clock, FileText, Users, Database, Eye } from "lucide-react";

export default function PrivacyPolicy() {
  const lastUpdated = "12 de setembro de 2025";
  const effectiveDate = "12 de setembro de 2025";

  return (
    <Layout>
      <div className="max-w-4xl mx-auto py-8 px-4">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-8 h-8 text-primary" />
            <h1 className="text-3xl font-bold text-slate-900" data-testid="text-privacy-title">
              Política de Privacidade
            </h1>
          </div>
          <div className="flex items-center justify-center gap-4 text-sm text-slate-600">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>Atualizada em: {lastUpdated}</span>
            </div>
            <div className="flex items-center gap-1">
              <FileText className="w-4 h-4" />
              <span>Vigente desde: {effectiveDate}</span>
            </div>
          </div>
          <Badge className="mt-2" variant="outline">
            Conforme LGPD (Lei 13.709/2018)
          </Badge>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Conteúdo principal */}
          <div className="lg:col-span-3 space-y-8">
            
            {/* 1. Introdução */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  1. Quem Somos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  A <strong>KeepLeads</strong> é uma plataforma digital especializada em marketplace de leads 
                  qualificados para o setor de seguros de saúde no Brasil. Nosso CNPJ é <strong>[A SER PREENCHIDO]</strong> 
                  e estamos localizados em <strong>[ENDEREÇO A SER PREENCHIDO]</strong>.
                </p>
                <p className="text-slate-700">
                  Levamos a sério a proteção de seus dados pessoais e nos comprometemos a processar suas 
                  informações de forma transparente, segura e em conformidade com a Lei Geral de Proteção 
                  de Dados (LGPD - Lei 13.709/2018).
                </p>
              </CardContent>
            </Card>

            {/* 2. Dados que coletamos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-primary" />
                  2. Quais Dados Coletamos
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">📋 Dados de Cadastro (Obrigatórios)</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                      <li>Nome completo</li>
                      <li>E-mail corporativo</li>
                      <li>Empresa/Organização</li>
                      <li>Cargo/Função</li>
                      <li>Telefone comercial</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">💳 Dados de Transação</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                      <li>Histórico de compras de leads</li>
                      <li>Métodos de pagamento utilizados (via Mercado Pago)</li>
                      <li>Valor das transações</li>
                      <li>Data e hora das operações</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">🖥️ Dados Técnicos (Automáticos)</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 ml-4">
                      <li>Endereço IP</li>
                      <li>Tipo de navegador e dispositivo</li>
                      <li>Páginas visitadas e tempo de navegação</li>
                      <li>Cookies e tecnologias similares</li>
                      <li>Sistema operacional</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 3. Como usamos seus dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Eye className="w-5 h-5 text-primary" />
                  3. Como Usamos Seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-4">
                  <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                    <h4 className="font-semibold text-green-900 mb-2">✅ Base Legal: Execução de Contrato</h4>
                    <ul className="list-disc list-inside text-green-700 space-y-1 ml-4">
                      <li>Processar e entregar leads adquiridos</li>
                      <li>Gerenciar sua conta e histórico de compras</li>
                      <li>Processar pagamentos e emitir recibos</li>
                      <li>Fornecer suporte ao cliente</li>
                    </ul>
                  </div>

                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-semibold text-blue-900 mb-2">🎯 Base Legal: Interesse Legítimo</h4>
                    <ul className="list-disc list-inside text-blue-700 space-y-1 ml-4">
                      <li>Melhorar nossos serviços e experiência do usuário</li>
                      <li>Prevenir fraudes e garantir segurança</li>
                      <li>Realizar análises de mercado (dados anonimizados)</li>
                      <li>Desenvolver novos produtos e funcionalidades</li>
                    </ul>
                  </div>

                  <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                    <h4 className="font-semibold text-purple-900 mb-2">📨 Base Legal: Consentimento</h4>
                    <ul className="list-disc list-inside text-purple-700 space-y-1 ml-4">
                      <li>Enviar comunicações de marketing (newsletters)</li>
                      <li>Recomendar leads baseados no seu perfil</li>
                      <li>Realizar pesquisas de satisfação</li>
                      <li>Usar cookies não essenciais (analytics, marketing)</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 4. Compartilhamento de dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="w-5 h-5 text-primary" />
                  4. Compartilhamento de Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-lg p-4">
                  <h4 className="font-semibold text-amber-900 mb-2">⚠️ Importante</h4>
                  <p className="text-amber-700">
                    <strong>Nunca vendemos seus dados pessoais.</strong> Compartilhamos apenas quando necessário 
                    para fornecer nossos serviços ou quando exigido por lei.
                  </p>
                </div>

                <div className="space-y-3">
                  <div>
                    <h4 className="font-medium text-slate-900">🏦 Processadores de Pagamento</h4>
                    <p className="text-slate-700 text-sm">
                      Mercado Pago para processar transações financeiras (conforme suas próprias políticas).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900">📧 Provedores de Serviços</h4>
                    <p className="text-slate-700 text-sm">
                      Serviços de e-mail, hospedagem e análises (Google Analytics, quando consentido).
                    </p>
                  </div>

                  <div>
                    <h4 className="font-medium text-slate-900">⚖️ Exigências Legais</h4>
                    <p className="text-slate-700 text-sm">
                      Autoridades competentes quando exigido por lei, ordem judicial ou regulamentação.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 5. Seus direitos */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  5. Seus Direitos (LGPD)
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700 mb-4">
                  Conforme a LGPD, você tem os seguintes direitos sobre seus dados pessoais:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">📋 Acesso</h4>
                    <p className="text-slate-700 text-sm">
                      Solicitar cópia de todos os seus dados que processamos.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">✏️ Correção</h4>
                    <p className="text-slate-700 text-sm">
                      Corrigir dados incompletos, inexatos ou desatualizados.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">🗑️ Exclusão</h4>
                    <p className="text-slate-700 text-sm">
                      Solicitar a exclusão de dados desnecessários ou quando o tratamento for ilícito.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">📦 Portabilidade</h4>
                    <p className="text-slate-700 text-sm">
                      Receber seus dados em formato estruturado e legível por máquina.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">❌ Revogação</h4>
                    <p className="text-slate-700 text-sm">
                      Revogar o consentimento a qualquer momento.
                    </p>
                  </div>

                  <div className="bg-slate-50 rounded-lg p-4">
                    <h4 className="font-semibold text-slate-900 mb-2">🛡️ Oposição</h4>
                    <p className="text-slate-700 text-sm">
                      Opor-se ao tratamento realizado com base no interesse legítimo.
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 6. Retenção de dados */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="w-5 h-5 text-primary" />
                  6. Por Quanto Tempo Guardamos Seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">Dados de conta ativa</span>
                    <Badge variant="outline">Enquanto mantiver conta</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">Dados de transações</span>
                    <Badge variant="outline">5 anos (obrigação fiscal)</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">Dados de marketing</span>
                    <Badge variant="outline">Até revogação do consentimento</Badge>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 bg-slate-50 rounded-lg">
                    <span className="font-medium text-slate-900">Cookies técnicos</span>
                    <Badge variant="outline">Sessão do navegador</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 7. Segurança */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Shield className="w-5 h-5 text-primary" />
                  7. Como Protegemos Seus Dados
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">🔒 Medidas Técnicas</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm ml-4">
                      <li>Criptografia SSL/TLS</li>
                      <li>Senhas com hash bcrypt</li>
                      <li>Banco de dados protegido</li>
                      <li>Backups seguros</li>
                    </ul>
                  </div>

                  <div>
                    <h4 className="font-semibold text-slate-900 mb-2">👥 Medidas Organizacionais</h4>
                    <ul className="list-disc list-inside text-slate-700 space-y-1 text-sm ml-4">
                      <li>Acesso por necessidade</li>
                      <li>Treinamento da equipe</li>
                      <li>Política de privacidade interna</li>
                      <li>Monitoramento de acessos</li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* 8. Contato */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Mail className="w-5 h-5 text-primary" />
                  8. Como Entrar em Contato
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-slate-700">
                  Para exercer seus direitos ou esclarecer dúvidas sobre esta política:
                </p>

                <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                  <div className="space-y-3">
                    <div className="flex items-center gap-3">
                      <Mail className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-slate-900">E-mail do DPO (Encarregado)</p>
                        <p className="text-slate-700 text-sm">dpo@keepleads.com</p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <Phone className="w-5 h-5 text-primary" />
                      <div>
                        <p className="font-medium text-slate-900">Telefone</p>
                        <p className="text-slate-700 text-sm">[TELEFONE A SER PREENCHIDO]</p>
                      </div>
                    </div>
                  </div>
                </div>

                <div className="text-sm text-slate-600">
                  <p><strong>Prazo de resposta:</strong> Até 15 dias úteis conforme LGPD.</p>
                  <p><strong>Autoridade competente:</strong> ANPD (Autoridade Nacional de Proteção de Dados)</p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1 space-y-6">
            {/* Configurações de cookies */}
            <CookieStatusCard />

            {/* Ações rápidas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Ações Rápidas</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Mail className="w-4 h-4 mr-2" />
                  Solicitar Meus Dados
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <FileText className="w-4 h-4 mr-2" />
                  Baixar Política (PDF)
                </Button>
                
                <Button variant="outline" size="sm" className="w-full justify-start">
                  <Shield className="w-4 h-4 mr-2" />
                  Reportar Problema
                </Button>
              </CardContent>
            </Card>

            {/* Resumo de dados */}
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Resumo</CardTitle>
              </CardHeader>
              <CardContent className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-slate-600">Última atualização:</span>
                  <span className="font-medium">{lastUpdated}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Versão:</span>
                  <span className="font-medium">1.0</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-600">Conformidade:</span>
                  <Badge variant="secondary" className="text-xs">LGPD</Badge>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </Layout>
  );
}