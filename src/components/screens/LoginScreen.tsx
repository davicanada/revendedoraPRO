import React, { useState } from 'react';
import { Leaf, Mail, Lock, Eye, EyeOff, Loader2, User } from 'lucide-react';
import { Button, Input } from '../common';
import { useApp } from '../../context/AppContext';

export const LoginScreen: React.FC = () => {
  const [showPassword, setShowPassword] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [loading, setLoading] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [fullName, setFullName] = useState('');
  const [error, setError] = useState('');

  const { signIn, signUp } = useApp();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignUp) {
        // Sign up
        if (!fullName.trim()) {
          setError('Por favor, insira seu nome completo');
          setLoading(false);
          return;
        }

        const { data, error: signUpError } = await signUp(email, password, fullName);

        if (signUpError) {
          console.error('Erro completo do Supabase:', signUpError);

          // Tratamento de erros mais específico
          if (signUpError.message.includes('User already registered')) {
            setError('Este email já está cadastrado');
          } else if (signUpError.message.includes('Password should be at least')) {
            setError('A senha deve ter pelo menos 6 caracteres');
          } else if (signUpError.message.includes('valid email')) {
            setError('Email inválido');
          } else if (signUpError.message.includes('Signup requires a valid password')) {
            setError('Senha muito fraca. Use pelo menos 6 caracteres');
          } else {
            // Mostrar o erro real do Supabase
            setError(`Erro: ${signUpError.message}`);
          }
        } else {
          alert('Conta criada com sucesso! Verifique seu email para confirmar.');
          setIsSignUp(false);
          setEmail('');
          setPassword('');
          setFullName('');
        }
      } else {
        // Sign in
        const { data, error: signInError } = await signIn(email, password);

        if (signInError) {
          setError(signInError.message === 'Invalid login credentials'
            ? 'Email ou senha incorretos'
            : 'Erro ao fazer login. Verifique os dados e tente novamente.');
        }
      }
    } catch (err: any) {
      setError('Erro inesperado. Tente novamente.');
      console.error('Auth error:', err);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsSignUp(!isSignUp);
    setError('');
    setEmail('');
    setPassword('');
    setFullName('');
  };

  return (
    <div className="min-h-screen bg-brand-dark flex flex-col items-center justify-center p-6 relative overflow-hidden">
      <div className="absolute top-[-10%] left-[-10%] w-64 h-64 bg-brand-primary/20 rounded-full blur-[100px]" />

      <div className="w-full max-w-sm z-10 flex flex-col gap-8">
        <div className="flex flex-col items-center gap-4">
          <div className="w-20 h-20 bg-brand-surface rounded-3xl flex items-center justify-center shadow-2xl shadow-brand-primary/20 mb-2">
            <Leaf size={40} className="text-brand-primary" fill="currentColor" fillOpacity={0.3} />
          </div>
          <h2 className="text-xl font-bold text-brand-primary tracking-wide">
            Revendedora<span className="text-white">PRO</span>
          </h2>
          <h1 className="text-3xl font-bold text-white tracking-tight">
            {isSignUp ? 'Criar Conta' : 'Bem-vinda'}
          </h1>
          <p className="text-gray-400 text-center text-sm px-4">
            {isSignUp
              ? 'Crie sua conta e comece a gerenciar suas vendas hoje mesmo.'
              : 'Acesse seu painel de gestão financeira e controle suas vendas Natura & Avon.'}
          </p>
        </div>

        <form className="w-full space-y-4" onSubmit={handleSubmit}>
          {isSignUp && (
            <Input
              type="text"
              placeholder="Seu nome completo"
              label="Nome Completo"
              icon={User}
              value={fullName}
              onChange={(e: React.ChangeEvent<HTMLInputElement>) => setFullName(e.target.value)}
              required
            />
          )}

          <Input
            type="email"
            placeholder="exemplo@email.com"
            label="E-mail"
            icon={Mail}
            value={email}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => setEmail(e.target.value)}
            required
          />

          <div className="mb-4">
            <label className="block text-sm text-brand-muted mb-1.5 ml-1">Senha</label>
            <div className="relative">
              <div className="absolute left-4 top-1/2 -translate-y-1/2 text-brand-muted">
                <Lock size={20} />
              </div>
              <input
                type={showPassword ? "text" : "password"}
                className="w-full bg-brand-surface border border-transparent focus:border-brand-primary/50 text-white rounded-xl py-3.5 pl-11 pr-12 outline-none transition-all placeholder-gray-500"
                placeholder="********"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                minLength={6}
                required
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-brand-muted hover:text-white"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {isSignUp && (
              <p className="text-brand-muted text-xs mt-1 ml-1">Mínimo de 6 caracteres</p>
            )}
          </div>

          {error && (
            <div className="bg-red-500/10 border border-red-500/50 rounded-xl p-3">
              <p className="text-red-500 text-sm text-center">{error}</p>
            </div>
          )}

          {!isSignUp && (
            <div className="flex justify-end">
              <button
                type="button"
                className="text-brand-primary text-sm font-medium hover:underline"
                onClick={() => alert('Funcionalidade em desenvolvimento')}
              >
                Esqueci minha senha
              </button>
            </div>
          )}

          <Button type="submit" disabled={loading}>
            {loading ? (
              <>
                <Loader2 size={20} className="animate-spin" />
                {isSignUp ? 'Criando conta...' : 'Entrando...'}
              </>
            ) : (
              isSignUp ? 'Criar Conta' : 'Entrar'
            )}
          </Button>
        </form>

        <div className="relative py-2">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-brand-surface"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-brand-dark text-gray-500">ou</span>
          </div>
        </div>

        <Button variant="secondary" onClick={toggleMode} disabled={loading}>
          {isSignUp ? 'Já tenho uma conta' : 'Criar nova conta'}
        </Button>
      </div>
    </div>
  );
};
