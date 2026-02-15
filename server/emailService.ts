import { MailService } from '@sendgrid/mail';

const isProduction = process.env.NODE_ENV === 'production';
const hasSendGridKey = !!process.env.SENDGRID_API_KEY;

if (isProduction && !hasSendGridKey) {
  console.warn('⚠️  SENDGRID_API_KEY not set - emails will be logged to console only');
}

const mailService = hasSendGridKey ? new MailService() : null;
if (mailService && hasSendGridKey) {
  mailService.setApiKey(process.env.SENDGRID_API_KEY!);
} else {
  console.warn('⚠️  SendGrid not configured - emails will be logged to console only');
}

interface EmailParams {
  to: string;
  from: string;
  subject: string;
  text?: string;
  html?: string;
}

export async function sendEmail(params: EmailParams): Promise<boolean> {
  try {
    const emailData: any = {
      to: params.to,
      from: params.from,
      subject: params.subject,
    };
    
    if (params.text) {
      emailData.text = params.text;
    }
    
    if (params.html) {
      emailData.html = params.html;
    }
    
    // If SendGrid is not configured, just log the email
    if (!mailService) {
      console.log('📧 [EMAIL - DEV MODE]');
      console.log('  To:', params.to);
      console.log('  From:', params.from);
      console.log('  Subject:', params.subject);
      if (params.text) console.log('  Text:', params.text.substring(0, 100) + '...');
      return true;
    }
    
    await mailService.send(emailData);
    return true;
  } catch (error) {
    console.error('SendGrid email error:', error);
    return false;
  }
}

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
}

interface User {
  id: string;
  email: string;
  firstName?: string;
  lastName?: string;
  credits: string;
}

export async function sendLeadPurchaseNotification(
  user: User,
  lead: Lead,
  company: Company
): Promise<boolean> {
  const fromEmail = 'noreply@keepleads.com'; // You should use a verified sender email
  
  const leadContactHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #7C3AED; margin-bottom: 20px;">✅ Lead Comprado com Sucesso!</h2>
      
      <p>Olá <strong>${user.firstName || user.email.split('@')[0]}</strong>,</p>
      
      <p>Você acabou de comprar um novo lead! Aqui estão as informações de contato:</p>
      
      <div style="background: #f8f9fa; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #333; margin-top: 0;">📋 Informações do Lead</h3>
        <p><strong>Nome:</strong> ${lead.name}</p>
        <p><strong>Email:</strong> ${lead.email}</p>
        <p><strong>Telefone:</strong> ${lead.phone}</p>
        <p><strong>Idade:</strong> ${lead.age} anos</p>
        <p><strong>Localização:</strong> ${lead.city}, ${lead.state}</p>
        <p><strong>Operadora:</strong> ${company.name}</p>
        <p><strong>Tipo de Plano:</strong> ${lead.planType}</p>
        <p><strong>Orçamento:</strong> R$ ${parseFloat(lead.budgetMin).toFixed(0)} - R$ ${parseFloat(lead.budgetMax).toFixed(0)}</p>
        <p><strong>Vidas Disponíveis:</strong> ${lead.availableLives}</p>
        <p><strong>Qualidade:</strong> ${lead.quality === 'high' ? 'Alta' : lead.quality === 'medium' ? 'Média' : 'Baixa'}</p>
      </div>
      
      <div style="background: #e7f3ff; padding: 15px; border-radius: 8px; margin: 20px 0;">
        <h4 style="color: #1976d2; margin-top: 0;">💡 Dicas para o Primeiro Contato:</h4>
        <ul>
          <li>Entre em contato nas primeiras 24 horas para maior taxa de conversão</li>
          <li>Mencione que você tem opções de planos de saúde personalizados</li>
          <li>Seja educativo sobre os benefícios dos planos disponíveis</li>
          <li>Escute as necessidades específicas do cliente</li>
        </ul>
      </div>
      
      <p style="margin-top: 30px;">
        <strong>Valor Pago:</strong> R$ ${parseFloat(lead.price).toFixed(2)}<br>
        <strong>Saldo Restante:</strong> R$ ${(parseFloat(user.credits) - parseFloat(lead.price)).toFixed(2)}
      </p>
      
      <p style="margin-top: 30px;">
        Boa sorte com a venda!<br>
        <strong>Equipe KeepLeads</strong>
      </p>
      
      <hr style="margin: 30px 0; border: none; border-top: 1px solid #eee;">
      <p style="font-size: 12px; color: #666;">
        Este email foi enviado automaticamente pelo sistema KeepLeads. 
        Mantenha essas informações confidenciais e use-as apenas para fins comerciais legítimos.
      </p>
    </div>
  `;

  const leadContactText = `
    Lead Comprado com Sucesso!
    
    Olá ${user.firstName || user.email.split('@')[0]},
    
    Você acabou de comprar um novo lead! Aqui estão as informações de contato:
    
    INFORMAÇÕES DO LEAD:
    Nome: ${lead.name}
    Email: ${lead.email}
    Telefone: ${lead.phone}
    Idade: ${lead.age} anos
    Localização: ${lead.city}, ${lead.state}
    Operadora: ${company.name}
    Tipo de Plano: ${lead.planType}
    Orçamento: R$ ${parseFloat(lead.budgetMin).toFixed(0)} - R$ ${parseFloat(lead.budgetMax).toFixed(0)}
    Vidas Disponíveis: ${lead.availableLives}
    Qualidade: ${lead.quality === 'high' ? 'Alta' : lead.quality === 'medium' ? 'Média' : 'Baixa'}
    
    DICAS PARA O PRIMEIRO CONTATO:
    - Entre em contato nas primeiras 24 horas para maior taxa de conversão
    - Mencione que você tem opções de planos de saúde personalizados
    - Seja educativo sobre os benefícios dos planos disponíveis
    - Escute as necessidades específicas do cliente
    
    Valor Pago: R$ ${parseFloat(lead.price).toFixed(2)}
    Saldo Restante: R$ ${(parseFloat(user.credits) - parseFloat(lead.price)).toFixed(2)}
    
    Boa sorte com a venda!
    Equipe KeepLeads
  `;

  return await sendEmail({
    to: user.email,
    from: fromEmail,
    subject: `🎯 Novo Lead Comprado - ${lead.name} (${lead.city}, ${lead.state})`,
    text: leadContactText,
    html: leadContactHtml,
  });
}

export async function sendAdminPurchaseNotification(
  user: User,
  lead: Lead,
  company: Company
): Promise<boolean> {
  const fromEmail = 'noreply@keepleads.com';
  const adminEmail = 'juniorinvernizzi@gmail.com'; // Admin email
  
  const adminHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
      <h2 style="color: #059669; margin-bottom: 20px;">💰 Nova Venda Realizada!</h2>
      
      <p>Uma nova compra de lead foi realizada na plataforma:</p>
      
      <div style="background: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #0ea5e9;">
        <h3 style="color: #0369a1; margin-top: 0;">👤 Comprador</h3>
        <p><strong>Nome:</strong> ${user.firstName || 'N/A'} ${user.lastName || ''}</p>
        <p><strong>Email:</strong> ${user.email}</p>
        <p><strong>ID:</strong> ${user.id}</p>
      </div>
      
      <div style="background: #fefce8; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #eab308;">
        <h3 style="color: #a16207; margin-top: 0;">📋 Lead Vendido</h3>
        <p><strong>Nome:</strong> ${lead.name}</p>
        <p><strong>Localização:</strong> ${lead.city}, ${lead.state}</p>
        <p><strong>Operadora:</strong> ${company.name}</p>
        <p><strong>Valor:</strong> R$ ${parseFloat(lead.price).toFixed(2)}</p>
        <p><strong>Qualidade:</strong> ${lead.quality === 'high' ? 'Alta' : lead.quality === 'medium' ? 'Média' : 'Baixa'}</p>
        <p><strong>ID do Lead:</strong> ${lead.id}</p>
      </div>
      
      <div style="background: #f0fdf4; padding: 20px; border-radius: 8px; margin: 20px 0; border-left: 4px solid #22c55e;">
        <h3 style="color: #15803d; margin-top: 0;">💸 Detalhes Financeiros</h3>
        <p><strong>Valor da Venda:</strong> R$ ${parseFloat(lead.price).toFixed(2)}</p>
        <p><strong>Saldo Anterior do Cliente:</strong> R$ ${parseFloat(user.credits).toFixed(2)}</p>
        <p><strong>Novo Saldo do Cliente:</strong> R$ ${(parseFloat(user.credits) - parseFloat(lead.price)).toFixed(2)}</p>
      </div>
      
      <p style="margin-top: 30px;">
        <strong>Equipe KeepLeads</strong><br>
        Sistema de Notificações Automáticas
      </p>
    </div>
  `;

  return await sendEmail({
    to: adminEmail,
    from: fromEmail,
    subject: `💰 Nova Venda - R$ ${parseFloat(lead.price).toFixed(2)} - ${user.email}`,
    html: adminHtml,
  });
}