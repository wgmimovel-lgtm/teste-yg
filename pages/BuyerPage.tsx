
import React, { useState, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PropertyType, Property } from '../types';
import { getProperties, addInterest, addMatch } from '../services/storageService';
import { Search, BedDouble, Ruler, MapPin, Heart, X, Phone, User as UserIcon, CheckCircle, Minus, Plus } from 'lucide-react';

// Helper to format phone number as (XX) XXXXX-XXXX
const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  
  if (!numbers) return '';
  
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const BuyerPage: React.FC = () => {
  const location = useLocation();
  const targetPropertyId = location.state?.propertyId;
  const [isBrowsingAll, setIsBrowsingAll] = useState(!!location.state?.showAll);
  const [step, setStep] = useState<'FORM' | 'LIST'>(
    location.state?.showAll || targetPropertyId ? 'LIST' : 'FORM'
  );
  
  const [properties, setProperties] = useState<Property[]>([]);
  const [loading, setLoading] = useState(false);
  
  // Filter Form State
  const [buyerInfo, setBuyerInfo] = useState({
    type: PropertyType.APARTMENT,
    region: '',
    minBedrooms: 2,
    minArea: 0,
    characteristics: '',
    buyerName: '',
    buyerPhone: '',
  });

  // Modal / Lead Capture State
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [contactForm, setContactForm] = useState({ name: '', phone: '' });
  const [matchSuccess, setMatchSuccess] = useState<string | null>(null);

  useEffect(() => {
    if (step === 'LIST') {
      const allProperties = getProperties();
      
      if (targetPropertyId) {
        // If navigating with a specific property ID (e.g., from Backoffice), show only that property
        const specific = allProperties.filter(p => p.id === targetPropertyId);
        setProperties(specific);
      } else if (isBrowsingAll) {
        setProperties(allProperties);
      } else {
        const filtered = allProperties.filter(p => {
          const typeMatch = p.type === buyerInfo.type;
          const bedMatch = p.bedrooms >= buyerInfo.minBedrooms;
          return typeMatch && bedMatch;
        });
        setProperties(filtered);
      }
    }
  }, [step, buyerInfo, isBrowsingAll, targetPropertyId]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;

    if (name === 'buyerPhone') {
      const formatted = formatPhoneNumber(value);
      setBuyerInfo(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setBuyerInfo(prev => ({ ...prev, [name]: value }));
  };

  const handleIncrement = (field: 'minBedrooms' | 'minArea') => {
    setBuyerInfo(prev => ({
       ...prev,
       [field]: Number(prev[field]) + (field === 'minArea' ? 5 : 1)
    }));
  };

  const handleDecrement = (field: 'minBedrooms' | 'minArea') => {
    setBuyerInfo(prev => ({
       ...prev,
       [field]: Math.max(0, Number(prev[field]) - (field === 'minArea' ? 5 : 1))
    }));
  };

  const handleContactChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;

    if (name === 'phone') {
      const formatted = formatPhoneNumber(value);
      setContactForm(prev => ({ ...prev, [name]: formatted }));
      return;
    }

    setContactForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmitInterest = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setTimeout(() => {
      addInterest({
        id: Date.now().toString(),
        ...buyerInfo,
        minBedrooms: Number(buyerInfo.minBedrooms),
        minArea: Number(buyerInfo.minArea),
        createdAt: Date.now(),
      });
      
      // Pre-fill the contact form for the list view if they used the filter
      setContactForm({
          name: buyerInfo.buyerName,
          phone: buyerInfo.buyerPhone
      });

      setLoading(false);
      setIsBrowsingAll(false); 
      setStep('LIST');
    }, 800);
  };

  const openInterestModal = (property: Property) => {
    setSelectedProperty(property);
    setIsModalOpen(true);
  };

  const closeInterestModal = () => {
    setIsModalOpen(false);
    setSelectedProperty(null);
  };

  const confirmInterest = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedProperty) return;

    addMatch({
      id: `match-${Date.now()}`,
      propertyId: selectedProperty.id,
      buyerId: `buyer-${Date.now()}`, 
      buyerName: contactForm.name || 'Visitante Web',
      buyerContact: contactForm.phone || 'Não informado',
      status: 'PENDING',
      createdAt: Date.now(),
    });

    // Trigger a storage event to update notification badges
    window.dispatchEvent(new Event('new-lead-generated'));
    localStorage.setItem('HAS_NEW_LEADS', 'true');

    setMatchSuccess(selectedProperty.id);
    closeInterestModal();
    setTimeout(() => setMatchSuccess(null), 3000);
  };

  if (step === 'FORM') {
    return (
      <div className="max-w-3xl mx-auto px-4 py-12">
        <div className="text-center mb-10">
           <h2 className="text-3xl font-serif font-bold text-navy-900">Perfil do Imóvel</h2>
           <p className="text-lg font-medium text-navy-800 mt-4 max-w-2xl mx-auto">
             Diga-nos o que procura para conectarmos você as melhores oportunidades.
           </p>
        </div>

        <form onSubmit={handleSubmitInterest} className="bg-white p-8 rounded-lg shadow-lg border border-slate-100">
           <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Imóvel</label>
               <select name="type" value={buyerInfo.type} onChange={handleInputChange} className="w-full p-2 border border-slate-300 rounded-sm bg-white focus:ring-2 focus:ring-navy-900 focus:border-transparent">
                 {Object.values(PropertyType).map(t => <option key={t} value={t}>{t}</option>)}
               </select>
             </div>
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Região Preferencial</label>
               <input type="text" name="region" placeholder="Ex: Orla, Península..." value={buyerInfo.region} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 rounded-sm bg-white focus:ring-2 focus:ring-navy-900 focus:border-transparent" />
             </div>
             
             {/* Min Bedrooms with Buttons */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Mínimo de Quartos</label>
               <div className="flex items-center border border-slate-300 rounded-sm bg-white focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-gold-500 shadow-sm">
                  <button type="button" onClick={() => handleDecrement('minBedrooms')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-r border-slate-200 transition-colors">
                     <Minus className="h-4 w-4" />
                  </button>
                  <input 
                      type="number" 
                      name="minBedrooms" 
                      min="0" 
                      value={buyerInfo.minBedrooms} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full p-2 text-center border-none focus:ring-0 bg-transparent caret-gold-600 appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <button type="button" onClick={() => handleIncrement('minBedrooms')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-l border-slate-200 transition-colors">
                     <Plus className="h-4 w-4" />
                  </button>
               </div>
             </div>

             {/* Min Area with Buttons */}
             <div>
               <label className="block text-sm font-medium text-slate-700 mb-1">Área Mínima (m²)</label>
               <div className="flex items-center border border-slate-300 rounded-sm bg-white focus-within:ring-2 focus-within:ring-gold-500 focus-within:border-gold-500 shadow-sm">
                  <button type="button" onClick={() => handleDecrement('minArea')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-r border-slate-200 transition-colors">
                     <Minus className="h-4 w-4" />
                  </button>
                  <input 
                      type="number" 
                      name="minArea" 
                      min="0" 
                      value={buyerInfo.minArea} 
                      onChange={handleInputChange} 
                      required 
                      className="w-full p-2 text-center border-none focus:ring-0 bg-transparent caret-gold-600 appearance-none [&::-webkit-inner-spin-button]:appearance-none" 
                  />
                  <button type="button" onClick={() => handleIncrement('minArea')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-l border-slate-200 transition-colors">
                     <Plus className="h-4 w-4" />
                  </button>
               </div>
             </div>
             
             {/* Characteristics Field */}
             <div className="col-span-1 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 mb-1">Características do Imóvel <span className="text-slate-400 font-normal">(Opcional)</span></label>
                <textarea 
                  name="characteristics" 
                  maxLength={280}
                  rows={2}
                  placeholder="Ex: Sol da manhã, andar alto, vista livre..."
                  value={buyerInfo.characteristics} 
                  onChange={handleInputChange} 
                  className="w-full p-2 border border-slate-300 rounded-sm bg-white resize-none focus:ring-2 focus:ring-navy-900"
                />
                <div className="text-right text-xs text-slate-400 mt-1">
                  {buyerInfo.characteristics.length}/280
                </div>
             </div>

             <div className="col-span-1 md:col-span-2 pt-4 border-t border-slate-100">
                <h3 className="text-md font-semibold text-navy-800 mb-4">Seus Contatos</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <input type="text" name="buyerName" placeholder="Seu Nome" value={buyerInfo.buyerName} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 rounded-sm bg-white focus:ring-2 focus:ring-navy-900 focus:border-transparent" />
                  <input type="tel" name="buyerPhone" maxLength={15} placeholder="(21) 99999-9999" value={buyerInfo.buyerPhone} onChange={handleInputChange} required className="w-full p-2 border border-slate-300 rounded-sm bg-white focus:ring-2 focus:ring-navy-900 focus:border-transparent" />
                </div>
             </div>
           </div>

           <div className="mt-8 text-center">
             <button type="submit" disabled={loading} className="bg-navy-900 text-white px-8 py-3 rounded-sm font-semibold hover:bg-navy-800 transition-colors disabled:opacity-50">
               {loading ? 'Processando...' : 'Acessar Imóveis Disponíveis'}
             </button>
           </div>
        </form>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 py-12 relative">
      <div className="flex justify-between items-center mb-8">
        <h2 className="text-3xl font-serif font-bold text-navy-900">
          {isBrowsingAll || targetPropertyId ? 'Todos os Imóveis' : 'Imóveis Disponíveis'}
        </h2>
        <button onClick={() => setStep('FORM')} className="text-sm text-slate-500 underline hover:text-navy-900">Alterar Filtros</button>
      </div>

      {properties.length === 0 ? (
        <div className="text-center py-20 bg-white rounded-lg border border-slate-200">
          <Search className="h-12 w-12 text-slate-300 mx-auto mb-4" />
          <p className="text-lg text-slate-500">Nenhum imóvel encontrado com esses critérios exatos no momento.</p>
          <p className="text-sm text-slate-400 mt-2">Nossos gestores buscarão opções off-market para você.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {properties.map(prop => (
            <div key={prop.id} className="bg-white rounded-lg shadow-md overflow-hidden border border-slate-100 hover:shadow-xl transition-shadow flex flex-col">
              <div className="h-56 w-full bg-slate-200 relative">
                <img src={prop.images[0]} alt="Imóvel" className="w-full h-full object-cover" />
                <div className="absolute top-4 right-4 bg-white/90 px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide text-navy-900 shadow-sm">
                  {prop.type}
                </div>
              </div>
              <div className="p-6 flex-grow flex flex-col">
                 <div className="mb-4">
                    <h3 className="text-xl font-serif font-semibold text-navy-900 mb-1">{prop.condoName || 'Condomínio Exclusivo'}</h3>
                    <div className="flex items-center text-slate-500 text-sm">
                      <MapPin className="h-4 w-4 mr-1" />
                      {prop.region}
                    </div>
                 </div>
                 
                 <div className="flex items-center justify-between mb-6 text-sm text-slate-600 border-y border-slate-100 py-3">
                    <div className="flex items-center">
                      <BedDouble className="h-4 w-4 mr-2 text-gold-500" />
                      <span>{prop.bedrooms} Quartos</span>
                    </div>
                    <div className="flex items-center">
                      <Ruler className="h-4 w-4 mr-2 text-gold-500" />
                      <span>{prop.area} m²</span>
                    </div>
                 </div>

                 <p className="text-slate-500 text-sm line-clamp-3 mb-6 italic">
                   "{prop.description || 'Descrição sob consulta.'}"
                 </p>

                 <div className="mt-auto">
                   {matchSuccess === prop.id ? (
                     <div className="w-full py-3 bg-green-50 text-green-700 text-center text-sm font-medium rounded-sm border border-green-200 flex items-center justify-center gap-2">
                       <CheckCircle className="h-4 w-4" />
                       Interesse Enviado!
                     </div>
                   ) : (
                     <button 
                       onClick={() => openInterestModal(prop)}
                       className="w-full py-3 bg-navy-900 text-white hover:bg-gold-500 hover:text-navy-900 transition-colors font-semibold rounded-sm flex items-center justify-center gap-2"
                     >
                       <Heart className="h-4 w-4" />
                       Tenho Interesse
                     </button>
                   )}
                 </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Lead Capture Modal */}
      {isModalOpen && selectedProperty && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-navy-900/80 backdrop-blur-sm">
          <div className="bg-white rounded-lg shadow-2xl w-full max-w-md overflow-hidden animate-in fade-in zoom-in duration-200">
            <div className="bg-navy-900 p-4 flex justify-between items-center">
              <h3 className="text-white font-serif font-bold text-lg">Confirmar Interesse</h3>
              <button onClick={closeInterestModal} className="text-slate-300 hover:text-white">
                <X className="h-5 w-5" />
              </button>
            </div>
            
            <div className="p-6">
              <div className="mb-6 p-3 bg-slate-50 rounded border border-slate-100 text-sm text-slate-600">
                <span className="font-bold block text-navy-900 mb-1">{selectedProperty.condoName || 'Imóvel Exclusivo'}</span>
                <span className="block">{selectedProperty.region} • {selectedProperty.bedrooms} Quartos • {selectedProperty.area}m²</span>
              </div>

              <form onSubmit={confirmInterest} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Seu Nome Completo</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <UserIcon className="h-4 w-4 text-slate-400" />
                    </div>
                    <input 
                      type="text" 
                      name="name"
                      required
                      value={contactForm.name}
                      onChange={handleContactChange}
                      placeholder="Digite seu nome"
                      className="w-full pl-9 p-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 bg-white"
                    />
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Phone className="h-4 w-4 text-slate-400" />
                    </div>
                    <input 
                      type="tel" 
                      name="phone"
                      required
                      maxLength={15}
                      value={contactForm.phone}
                      onChange={handleContactChange}
                      placeholder="(21) 99999-9999"
                      className="w-full pl-9 p-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 bg-white"
                    />
                  </div>
                </div>

                <p className="text-xs text-slate-400 mt-2">
                  Ao confirmar, um de nossos gestores receberá seus dados imediatamente para iniciar o atendimento.
                </p>

                <button 
                  type="submit" 
                  className="w-full mt-4 py-3 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-sm shadow-md transition-colors flex items-center justify-center gap-2"
                >
                   Enviar Interesse
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BuyerPage;
