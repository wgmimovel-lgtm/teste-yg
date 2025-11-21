import React, { useState } from 'react';
import { PropertyType } from '../types';
import { addProperty } from '../services/storageService';
import { generatePropertyDescription } from '../services/geminiService';
import { Sparkles, Upload, CheckCircle, Minus, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

// Helper to format phone number as (XX) XXXXX-XXXX
const formatPhoneNumber = (value: string) => {
  const numbers = value.replace(/\D/g, '').slice(0, 11);
  
  if (!numbers) return '';
  
  if (numbers.length <= 2) return `(${numbers}`;
  if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
  return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
};

const RegisterProperty: React.FC = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [generatingAI, setGeneratingAI] = useState(false);
  const [success, setSuccess] = useState(false);
  
  const [formData, setFormData] = useState({
    type: PropertyType.APARTMENT,
    region: '',
    // condoName removed from UI, but we keep it in state if needed or just hardcode empty on submit
    price: '',
    bedrooms: 1,
    area: 0,
    description: '',
    ownerName: '',
    ownerPhone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    if (name === 'ownerPhone') {
      const formatted = formatPhoneNumber(value);
      setFormData(prev => ({ ...prev, [name]: formatted }));
      return;
    }
    
    if (name === 'price') {
       // Simple handling, could add mask here
       setFormData(prev => ({ ...prev, [name]: value }));
       return;
    }

    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleIncrement = (field: 'bedrooms' | 'area') => {
    setFormData(prev => ({
       ...prev,
       [field]: Number(prev[field]) + (field === 'area' ? 5 : 1)
    }));
  };

  const handleDecrement = (field: 'bedrooms' | 'area') => {
    setFormData(prev => ({
       ...prev,
       [field]: Math.max(0, Number(prev[field]) - (field === 'area' ? 5 : 1))
    }));
  };

  const handleGenerateDescription = async () => {
    if (!formData.type || !formData.region || !formData.area) {
      alert("Preencha os dados básicos do imóvel (Tipo, Localização, Área) para gerar a descrição.");
      return;
    }
    setGeneratingAI(true);
    try {
      const description = await generatePropertyDescription({
        type: formData.type as PropertyType,
        region: formData.region,
        condoName: '', // Removed from form
        bedrooms: Number(formData.bedrooms),
        area: Number(formData.area),
      });
      // Truncate if necessary to fit limit
      const truncated = description.slice(0, 280);
      setFormData(prev => ({ ...prev, description: truncated }));
    } finally {
      setGeneratingAI(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    // Basic price parsing
    // Handles "1.000,00", "1000.00", "1000"
    const cleanPriceString = formData.price.replace(/[^0-9,.]/g, ''); // remove currency symbols
    // Naive parsing assuming PT-BR if comma exists, or simple float
    let finalPrice = 0;
    if (cleanPriceString) {
        // Replace dots (thousand separators) with nothing, replace comma with dot
        const normalized = cleanPriceString.replace(/\./g, '').replace(',', '.');
        finalPrice = parseFloat(normalized);
        if (isNaN(finalPrice)) finalPrice = 0;
    }

    // Simulate API call and image upload
    setTimeout(() => {
      addProperty({
        id: Date.now().toString(),
        ...formData,
        condoName: '', // Explicitly passing empty string as it was removed from UI
        price: finalPrice,
        bedrooms: Number(formData.bedrooms),
        area: Number(formData.area),
        images: [
            `https://picsum.photos/800/600?random=${Math.random()}`,
            `https://picsum.photos/800/600?random=${Math.random() + 1}`,
        ],
        createdAt: Date.now(),
      });
      setLoading(false);
      setSuccess(true);
      setTimeout(() => navigate('/'), 3000);
    }, 1000);
  };

  if (success) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center p-6 bg-slate-50">
        <div className="bg-white p-8 rounded-lg shadow-xl text-center max-w-md">
          <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-serif font-bold text-navy-900 mb-2">Imóvel Cadastrado!</h2>
          <p className="text-slate-600 mb-6">
            Seus dados foram recebidos com sucesso. Nossos gestores entrarão em contato em breve para validar as informações.
          </p>
          <p className="text-sm text-slate-400">Redirecionando...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-12">
      <div className="mb-10 text-center">
        <h2 className="text-3xl font-serif font-bold text-navy-900">Cadastrar Imóvel</h2>
        <p className="text-slate-500 mt-2">Preencha os dados abaixo para disponibilizar seu imóvel para nossa base exclusiva.</p>
      </div>

      <form onSubmit={handleSubmit} className="bg-white rounded-lg shadow-lg p-8 border border-slate-100">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          {/* Basic Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-800 border-b pb-2">Detalhes do Imóvel</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Tipo de Imóvel</label>
              <select 
                name="type" 
                value={formData.type} 
                onChange={handleInputChange}
                className="w-full p-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 focus:border-transparent bg-white"
              >
                {Object.values(PropertyType).map(type => (
                  <option key={type} value={type}>{type}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Região / Localização</label>
              <input 
                type="text" 
                name="region" 
                placeholder="Ex: Jardim Oceânico"
                value={formData.region}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Valor do Imóvel (Opcional)</label>
              <input 
                type="text" 
                name="price" 
                value={formData.price}
                onChange={handleInputChange}
                placeholder="R$ 0,00"
                className="w-full p-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 bg-white"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Quartos</label>
                <div className="flex items-center border border-slate-300 rounded-sm bg-white focus-within:ring-2 focus-within:ring-navy-900 shadow-sm">
                   <button type="button" onClick={() => handleDecrement('bedrooms')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-r border-slate-200 transition-colors">
                      <Minus className="h-4 w-4" />
                   </button>
                   <input 
                      type="number" 
                      name="bedrooms" 
                      min="0"
                      value={formData.bedrooms}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 text-center border-none focus:ring-0 bg-transparent appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                   />
                   <button type="button" onClick={() => handleIncrement('bedrooms')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-l border-slate-200 transition-colors">
                      <Plus className="h-4 w-4" />
                   </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Área (m²)</label>
                <div className="flex items-center border border-slate-300 rounded-sm bg-white focus-within:ring-2 focus-within:ring-navy-900 shadow-sm">
                   <button type="button" onClick={() => handleDecrement('area')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-r border-slate-200 transition-colors">
                      <Minus className="h-4 w-4" />
                   </button>
                   <input 
                      type="number" 
                      name="area" 
                      min="0"
                      value={formData.area}
                      onChange={handleInputChange}
                      required
                      className="w-full p-2 text-center border-none focus:ring-0 bg-transparent appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                   />
                   <button type="button" onClick={() => handleIncrement('area')} className="p-2.5 hover:bg-slate-50 text-navy-900 border-l border-slate-200 transition-colors">
                      <Plus className="h-4 w-4" />
                   </button>
                </div>
              </div>
            </div>
          </div>

          {/* Personal Info */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-navy-800 border-b pb-2">Dados do Proprietário</h3>
            
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
              <input 
                type="text" 
                name="ownerName" 
                value={formData.ownerName}
                onChange={handleInputChange}
                required
                className="w-full p-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">Telefone / WhatsApp</label>
              <input 
                type="tel" 
                name="ownerPhone" 
                placeholder="(21) 99999-9999"
                value={formData.ownerPhone}
                onChange={handleInputChange}
                required
                maxLength={15}
                className="w-full p-2 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 bg-white"
              />
            </div>

            <div className="pt-4">
               <div className="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer bg-white">
                  <Upload className="h-8 w-8 text-slate-400 mx-auto mb-2" />
                  <p className="text-sm text-slate-600 font-medium">Clique para fazer upload das fotos</p>
                  <p className="text-xs text-slate-400 mt-1">Máximo 5 imagens (Simulado)</p>
               </div>
            </div>
          </div>
        </div>

        {/* AI Description Section */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-2">
             <label className="block text-sm font-medium text-slate-700">Descrição do Imóvel</label>
             <button 
                type="button" 
                onClick={handleGenerateDescription}
                disabled={generatingAI}
                className="flex items-center space-x-2 text-xs font-bold text-gold-600 hover:text-gold-500 uppercase tracking-wide disabled:opacity-50"
             >
                <Sparkles className="h-4 w-4" />
                <span>{generatingAI ? 'Gerando com IA...' : 'Gerar Descrição com IA'}</span>
             </button>
          </div>
          <textarea 
            name="description"
            rows={5}
            maxLength={280}
            value={formData.description}
            onChange={handleInputChange}
            placeholder="Descreva os detalhes do imóvel ou use nossa IA para criar um texto atrativo..."
            className="w-full p-3 border border-slate-300 rounded-sm focus:ring-2 focus:ring-navy-900 bg-white resize-none"
          ></textarea>
          <div className="text-right text-xs text-slate-400 mt-1">
             {formData.description.length}/280
          </div>
        </div>

        <div className="bg-amber-50 border-l-4 border-gold-500 p-4 mb-8">
          <p className="text-sm text-amber-900">
            <strong>Aviso:</strong> A Barra Business Imóveis atua com intermediação exclusiva. Ao cadastrar, você concorda em ser contatado por um de nossos gestores.
          </p>
        </div>

        <div className="text-right">
          <button 
            type="submit" 
            disabled={loading}
            className="px-8 py-3 bg-navy-900 hover:bg-navy-800 text-white font-semibold rounded-sm shadow-lg transition-colors disabled:opacity-50"
          >
            {loading ? 'Enviando...' : 'Finalizar Cadastro'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default RegisterProperty;