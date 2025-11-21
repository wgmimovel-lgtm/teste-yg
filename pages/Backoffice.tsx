
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getProperties, getInterests, getMatches, getUsers, addUser, removeUser, removeProperty, updateMatchStatus, togglePropertyFeatured } from '../services/storageService';
import { logout, getCurrentUser } from '../services/authService';
import { Property, BuyerInterest, LeadMatch, User } from '../types';
import { Users, Home, Link as LinkIcon, LogOut, Shield, Plus, Trash2, Eye, CheckCircle, Star } from 'lucide-react';

const Backoffice: React.FC = () => {
  const navigate = useNavigate();
  const currentUser = getCurrentUser();
  const [activeTab, setActiveTab] = useState<'PROPERTIES' | 'INTERESTS' | 'MATCHES' | 'TEAM'>('MATCHES');
  
  const [data, setData] = useState<{
    properties: Property[];
    interests: BuyerInterest[];
    matches: LeadMatch[];
    users: User[];
  }>({ properties: [], interests: [], matches: [], users: [] });

  // Team Management State
  const [newUser, setNewUser] = useState({ name: '', email: '', password: '' });
  const [teamError, setTeamError] = useState('');
  const [teamSuccess, setTeamSuccess] = useState('');

  useEffect(() => {
    const loadData = () => {
      setData({
        properties: getProperties(),
        interests: getInterests(),
        matches: getMatches().sort((a, b) => b.createdAt - a.createdAt),
        users: getUsers(),
      });
    };
    loadData();
    const interval = setInterval(loadData, 5000); // Refresh
    return () => clearInterval(interval);
  }, []);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const handleAddUser = (e: React.FormEvent) => {
    e.preventDefault();
    setTeamError('');
    setTeamSuccess('');
    try {
      addUser({
        id: Date.now().toString(),
        name: newUser.name,
        email: newUser.email,
        password: newUser.password,
        role: 'MANAGER',
        createdAt: Date.now(),
      });
      setTeamSuccess('Gestor cadastrado com sucesso!');
      setNewUser({ name: '', email: '', password: '' });
      // Reload users immediately
      setData(prev => ({ ...prev, users: getUsers() }));
    } catch (err: any) {
      setTeamError(err.message || 'Erro ao cadastrar usuário');
    }
  };

  const handleRemoveUser = (userId: string) => {
    if(window.confirm("Tem certeza que deseja remover este gestor?")) {
      try {
        removeUser(userId);
        setData(prev => ({ ...prev, users: getUsers() }));
      } catch (err: any) {
        alert(err.message);
      }
    }
  };

  const handleRemoveProperty = (propertyId: string) => {
    if (window.confirm("Tem certeza que deseja excluir este imóvel permanentemente?")) {
      removeProperty(propertyId);
      setData(prev => ({ ...prev, properties: getProperties() }));
    }
  };

  const handleToggleFeatured = (propertyId: string) => {
    togglePropertyFeatured(propertyId);
    setData(prev => ({ ...prev, properties: getProperties() }));
  };

  const handleUpdateStatus = (matchId: string, newStatus: 'CONTACTED' | 'CLOSED') => {
    updateMatchStatus(matchId, newStatus);
    // Instant update in local state for better UX
    setData(prev => ({
      ...prev,
      matches: prev.matches.map(m => m.id === matchId ? { ...m, status: newStatus } : m)
    }));
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente';
      case 'CONTACTED': return 'Atendido';
      case 'CLOSED': return 'Fechado';
      default: return status;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-100 text-yellow-800';
      case 'CONTACTED': return 'bg-green-100 text-green-800';
      case 'CLOSED': return 'bg-slate-200 text-slate-800';
      default: return 'bg-slate-100 text-slate-800';
    }
  };

  return (
    <div className="min-h-screen bg-slate-100 p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <div>
            <h1 className="text-2xl font-serif font-bold text-navy-900">Painel de Gestão</h1>
            <div className="mt-1 flex items-center gap-2">
               <span className={`text-xs font-bold px-3 py-1 rounded-full ${currentUser?.role === 'ADMIN' ? 'bg-gold-500 text-navy-900' : 'bg-slate-200 text-slate-600'}`}>
                 {currentUser?.role === 'ADMIN' ? 'ADMINISTRADOR' : 'GESTOR'}
               </span>
               <span className="text-xs text-slate-500">Olá, {currentUser?.name}</span>
            </div>
          </div>
          
          <button 
            onClick={handleLogout}
            className="flex items-center gap-2 text-slate-500 hover:text-red-600 text-sm font-semibold transition-colors px-4 py-2 rounded-sm hover:bg-slate-200"
          >
            <LogOut className="h-4 w-4" />
            Sair
          </button>
        </header>

        <div className="flex flex-wrap space-x-2 md:space-x-4 mb-6 border-b border-slate-200 pb-1 overflow-x-auto">
          <button 
            onClick={() => setActiveTab('MATCHES')}
            className={`pb-2 px-4 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'MATCHES' ? 'border-b-2 border-gold-500 text-navy-900' : 'text-slate-500'}`}
          >
            <LinkIcon className="h-4 w-4" /> Intermediações
          </button>
          <button 
            onClick={() => setActiveTab('PROPERTIES')}
            className={`pb-2 px-4 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'PROPERTIES' ? 'border-b-2 border-gold-500 text-navy-900' : 'text-slate-500'}`}
          >
            <Home className="h-4 w-4" /> Imóveis
          </button>
          <button 
            onClick={() => setActiveTab('INTERESTS')}
            className={`pb-2 px-4 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'INTERESTS' ? 'border-b-2 border-gold-500 text-navy-900' : 'text-slate-500'}`}
          >
            <Users className="h-4 w-4" /> Leads
          </button>
          {currentUser?.role === 'ADMIN' && (
            <button 
              onClick={() => setActiveTab('TEAM')}
              className={`pb-2 px-4 text-sm font-semibold flex items-center gap-2 transition-colors whitespace-nowrap ${activeTab === 'TEAM' ? 'border-b-2 border-gold-500 text-navy-900' : 'text-slate-500'}`}
            >
              <Shield className="h-4 w-4" /> Equipe
            </button>
          )}
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-slate-200 overflow-hidden">
          {/* TAB: MATCHES */}
          {activeTab === 'MATCHES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4">Status</th>
                    <th className="p-4">Interessado</th>
                    <th className="p-4">Contato</th>
                    <th className="p-4">Imóvel (ID)</th>
                    <th className="p-4">Data</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.matches.length === 0 ? (
                    <tr><td colSpan={6} className="p-8 text-center text-slate-400">Nenhuma interação registrada ainda.</td></tr>
                  ) : (
                    data.matches.map(match => (
                      <tr key={match.id} className="hover:bg-slate-50">
                        <td className="p-4">
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(match.status)}`}>
                            {getStatusLabel(match.status)}
                          </span>
                        </td>
                        <td className="p-4 font-medium text-navy-900">{match.buyerName}</td>
                        <td className="p-4">{match.buyerContact}</td>
                        <td className="p-4 font-mono text-xs text-slate-500">{match.propertyId}</td>
                        <td className="p-4 text-slate-400">{new Date(match.createdAt).toLocaleDateString()}</td>
                        <td className="p-4">
                           {match.status === 'PENDING' && (
                              <button 
                                onClick={() => handleUpdateStatus(match.id, 'CONTACTED')}
                                className="flex items-center gap-1 text-green-600 hover:text-green-800 transition-colors"
                                title="Marcar como Atendido"
                              >
                                <CheckCircle className="h-5 w-5" />
                              </button>
                           )}
                           {match.status === 'CONTACTED' && (
                             <span className="text-xs text-green-600 font-semibold flex items-center gap-1">
                               <CheckCircle className="h-4 w-4" /> OK
                             </span>
                           )}
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: PROPERTIES */}
          {activeTab === 'PROPERTIES' && (
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-slate-600">
                <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                  <tr>
                    <th className="p-4">Tipo</th>
                    <th className="p-4">Localização</th>
                    <th className="p-4">Proprietário</th>
                    <th className="p-4">Telefone</th>
                    <th className="p-4">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {data.properties.length === 0 ? (
                    <tr><td colSpan={5} className="p-8 text-center text-slate-400">Nenhum imóvel cadastrado.</td></tr>
                  ) : (
                    data.properties.map(prop => (
                      <tr key={prop.id} className="hover:bg-slate-50">
                        <td className="p-4">{prop.type}</td>
                        <td className="p-4">{prop.region} - {prop.condoName}</td>
                        <td className="p-4 text-navy-900 font-medium">{prop.ownerName}</td>
                        <td className="p-4">{prop.ownerPhone}</td>
                        <td className="p-4 flex items-center gap-3">
                          <button
                            onClick={() => handleToggleFeatured(prop.id)}
                            className="transition-colors focus:outline-none"
                            title={prop.isFeatured ? "Remover Destaque" : "Adicionar aos Destaques"}
                          >
                            <Star className={`h-5 w-5 ${prop.isFeatured ? 'fill-gold-500 text-gold-500' : 'text-slate-300 hover:text-gold-500'}`} />
                          </button>
                          <button
                            onClick={() => navigate('/comprar', { state: { propertyId: prop.id } })}
                            className="text-blue-400 hover:text-blue-600 transition-colors"
                            title="Visualizar Imóvel na Loja"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                          <button 
                            onClick={() => handleRemoveProperty(prop.id)}
                            className="text-red-400 hover:text-red-600 transition-colors"
                            title="Excluir Imóvel"
                          >
                            <Trash2 className="h-5 w-5" />
                          </button>
                        </td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
          )}

          {/* TAB: INTERESTS */}
          {activeTab === 'INTERESTS' && (
             <div className="overflow-x-auto">
             <table className="w-full text-left text-sm text-slate-600">
               <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                 <tr>
                   <th className="p-4">Nome</th>
                   <th className="p-4">Busca</th>
                   <th className="p-4">Contato</th>
                 </tr>
               </thead>
               <tbody className="divide-y divide-slate-100">
                 {data.interests.map(int => (
                   <tr key={int.id} className="hover:bg-slate-50">
                     <td className="p-4 font-medium text-navy-900">{int.buyerName}</td>
                     <td className="p-4">
                        {int.type} em {int.region} <br/>
                        <span className="text-xs text-slate-400">Min {int.minBedrooms} quartos</span>
                        {int.characteristics && (
                          <div className="mt-2 p-2 bg-slate-50 border border-slate-200 rounded text-xs italic text-slate-600 max-w-xs break-words">
                            "{int.characteristics}"
                          </div>
                        )}
                     </td>
                     <td className="p-4">{int.buyerPhone}</td>
                   </tr>
                 ))}
               </tbody>
             </table>
           </div>
          )}

          {/* TAB: TEAM (ADMIN ONLY) */}
          {activeTab === 'TEAM' && currentUser?.role === 'ADMIN' && (
            <div className="p-6">
              <div className="mb-8 bg-slate-50 p-6 rounded-lg border border-slate-200">
                <h3 className="text-lg font-semibold text-navy-900 mb-4 flex items-center gap-2">
                   <Plus className="h-5 w-5 text-gold-500" /> Cadastrar Novo Gestor
                </h3>
                <form onSubmit={handleAddUser} className="grid grid-cols-1 md:grid-cols-4 gap-4 items-end">
                   <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Nome</label>
                     <input 
                       type="text" 
                       required 
                       value={newUser.name}
                       onChange={(e) => setNewUser({...newUser, name: e.target.value})}
                       className="w-full p-2 border border-slate-300 rounded-sm bg-white" 
                       placeholder="Nome completo"
                     />
                   </div>
                   <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">E-mail</label>
                     <input 
                       type="email" 
                       required 
                       value={newUser.email}
                       onChange={(e) => setNewUser({...newUser, email: e.target.value})}
                       className="w-full p-2 border border-slate-300 rounded-sm bg-white" 
                       placeholder="usuario@email.com"
                     />
                   </div>
                   <div className="md:col-span-1">
                     <label className="block text-xs font-bold text-slate-500 uppercase mb-1">Senha</label>
                     <input 
                       type="text" 
                       required 
                       value={newUser.password}
                       onChange={(e) => setNewUser({...newUser, password: e.target.value})}
                       className="w-full p-2 border border-slate-300 rounded-sm bg-white" 
                       placeholder="Senha de acesso"
                     />
                   </div>
                   <div className="md:col-span-1">
                     <button type="submit" className="w-full py-2 bg-navy-900 text-white font-semibold hover:bg-navy-800 rounded-sm transition-colors">
                       Adicionar Gestor
                     </button>
                   </div>
                </form>
                {teamError && <p className="text-red-600 text-sm mt-2">{teamError}</p>}
                {teamSuccess && <p className="text-green-600 text-sm mt-2">{teamSuccess}</p>}
              </div>

              <h3 className="text-lg font-semibold text-navy-900 mb-4">Gestores Cadastrados</h3>
              <div className="overflow-x-auto border border-slate-200 rounded-lg">
                <table className="w-full text-left text-sm text-slate-600">
                   <thead className="bg-slate-50 text-xs uppercase font-semibold text-slate-500 border-b border-slate-200">
                     <tr>
                       <th className="p-4">Nome</th>
                       <th className="p-4">E-mail</th>
                       <th className="p-4">Função</th>
                       <th className="p-4">Ações</th>
                     </tr>
                   </thead>
                   <tbody className="divide-y divide-slate-100">
                     {data.users.map(user => (
                       <tr key={user.id} className="hover:bg-slate-50">
                         <td className="p-4 font-medium text-navy-900">{user.name}</td>
                         <td className="p-4">{user.email}</td>
                         <td className="p-4">
                           <span className={`text-xs font-bold px-2 py-1 rounded ${user.role === 'ADMIN' ? 'bg-gold-100 text-gold-800' : 'bg-slate-100 text-slate-600'}`}>
                             {user.role}
                           </span>
                         </td>
                         <td className="p-4">
                           {user.role !== 'ADMIN' && (
                             <button 
                               onClick={() => handleRemoveUser(user.id)}
                               className="text-red-400 hover:text-red-600 transition-colors"
                               title="Remover usuário"
                             >
                               <Trash2 className="h-5 w-5" />
                             </button>
                           )}
                         </td>
                       </tr>
                     ))}
                   </tbody>
                </table>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Backoffice;