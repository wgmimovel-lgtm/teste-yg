
import React, { useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { login } from '../services/authService';
import { Lock, ShieldAlert, Mail, Eye, EyeOff } from 'lucide-react';

const Login: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();
  const location = useLocation();

  const from = location.state?.from?.pathname || '/gestao';

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (login(email, password)) {
      navigate(from, { replace: true });
    } else {
      setError('Credenciais inválidas. Verifique e-mail e senha.');
      setPassword('');
    }
  };

  return (
    <div className="min-h-[calc(100vh-160px)] flex items-center justify-center bg-slate-100 px-4">
      <div className="max-w-md w-full bg-white rounded-lg shadow-xl border border-slate-200 overflow-hidden">
        <div className="bg-navy-900 p-6 text-center">
          <div className="mx-auto bg-gold-500 w-12 h-12 rounded-full flex items-center justify-center mb-4">
            <Lock className="h-6 w-6 text-navy-900" />
          </div>
          <h2 className="text-2xl font-serif font-bold text-white">Área Restrita</h2>
          <p className="text-slate-300 text-sm mt-1">Acesso para Gestores e Administradores</p>
        </div>

        <div className="p-8">
          <form onSubmit={handleSubmit}>
            {error && (
              <div className="mb-4 p-3 bg-red-50 border-l-4 border-red-500 flex items-center text-red-700 text-sm">
                <ShieldAlert className="h-4 w-4 mr-2" />
                {error}
              </div>
            )}

            <div className="mb-4">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                E-mail de Acesso
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Mail className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 p-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 focus:border-transparent bg-white transition-all outline-none"
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-sm font-medium text-slate-700 mb-2">
                Senha
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Lock className="h-5 w-5 text-slate-400" />
                </div>
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-10 p-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 focus:border-transparent bg-white transition-all outline-none"
                  placeholder="Digite sua senha"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none"
                >
                  {showPassword ? (
                    <EyeOff className="h-5 w-5" />
                  ) : (
                    <Eye className="h-5 w-5" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-navy-900 hover:bg-navy-800 text-white font-bold rounded-sm shadow-md transition-colors"
            >
              Entrar no Painel
            </button>
          </form>
        </div>
        
        <div className="bg-slate-50 p-4 text-center border-t border-slate-100">
          <p className="text-xs text-slate-400">Barra Business Imóveis &copy; Sistema Interno</p>
        </div>
      </div>
    </div>
  );
};

export default Login;
