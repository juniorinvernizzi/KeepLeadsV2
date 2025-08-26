import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";

export default function Landing() {
  const [isRegister, setIsRegister] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-white flex items-center justify-center p-4">
      <div className="max-w-md w-full">
        {/* Logo and Title */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center space-x-2 mb-4">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center">
              <svg className="w-6 h-6 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M3 3a1 1 0 000 2v8a2 2 0 002 2h2.586l-1.293 1.293a1 1 0 101.414 1.414L10 15.414l2.293 2.293a1 1 0 001.414-1.414L12.414 15H15a2 2 0 002-2V5a1 1 0 100-2H3zm11.707 4.707a1 1 0 00-1.414-1.414L10 9.586 8.707 8.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
              </svg>
            </div>
            <span className="text-2xl font-bold text-slate-800">KeepLeads</span>
          </div>
          <p className="text-slate-600">
            {isRegister 
              ? "Crie sua conta para começar a comprar leads"
              : "Gestão e Venda de Leads de Planos de Saúde"
            }
          </p>
          
          {/* Link to public leads */}
          <div className="mt-4">
            <a 
              href="/leads-publicos" 
              className="text-primary hover:text-primary-dark font-medium text-sm underline"
            >
              Ver leads disponíveis (sem necessidade de login)
            </a>
          </div>
        </div>

        {/* Auth Form */}
        <Card className="shadow-lg">
          <CardHeader>
            <CardTitle className="text-2xl">
              {isRegister ? "Criar Conta" : "Fazer Login"}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            {isRegister && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="firstName">Nome</Label>
                  <Input 
                    id="firstName" 
                    data-testid="input-firstName"
                    placeholder="João" 
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="lastName">Sobrenome</Label>
                  <Input 
                    id="lastName" 
                    data-testid="input-lastName"
                    placeholder="Silva" 
                  />
                </div>
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input 
                id="email" 
                type="email" 
                data-testid="input-email"
                placeholder="seu@email.com" 
              />
            </div>
            
            {isRegister && (
              <div className="space-y-2">
                <Label htmlFor="phone">Telefone</Label>
                <Input 
                  id="phone" 
                  type="tel" 
                  data-testid="input-phone"
                  placeholder="(11) 99999-9999" 
                />
              </div>
            )}
            
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input 
                id="password" 
                type="password" 
                data-testid="input-password"
                placeholder="••••••••" 
              />
            </div>
            
            {!isRegister && (
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Checkbox id="remember" data-testid="checkbox-remember" />
                  <Label htmlFor="remember" className="text-sm text-slate-600">
                    Lembrar-me
                  </Label>
                </div>
                <a href="#" className="text-sm text-primary hover:text-primary-dark">
                  Esqueci minha senha
                </a>
              </div>
            )}
            
            <Button 
              className="w-full" 
              onClick={() => window.location.href = "/api/login"}
              data-testid="button-auth"
            >
              {isRegister ? "Criar Conta" : "Entrar"}
            </Button>
            
            <div className="text-center">
              <p className="text-slate-600">
                {isRegister ? "Já tem uma conta? " : "Não tem uma conta? "}
                <button 
                  onClick={() => setIsRegister(!isRegister)}
                  className="text-primary hover:text-primary-dark font-medium"
                  data-testid="button-toggle-auth"
                >
                  {isRegister ? "Fazer login" : "Cadastre-se"}
                </button>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
