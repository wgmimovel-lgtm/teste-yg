
import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Key, Search, Building, MapPin, BedDouble, Ruler } from 'lucide-react';
import { getProperties } from '../services/storageService';
import { Property } from '../types';

const Home: React.FC = () => {
  const [featuredProperties, setFeaturedProperties] = useState<Property[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch properties marked as featured, limit to 6
    const allProps = getProperties();
    const featured = allProps.filter(p => p.isFeatured).slice(0, 6);
    setFeaturedProperties(featured);
  }, []);

  return (
    <div className="min-h-full bg-transparent">
      {/* Hero Section */}
      <div className="relative w-full min-h-[calc(100vh-80px)] flex items-center justify-center overflow-hidden">
        
        {/* Background Image: Barra da Tijuca (Grayscale) */}
        <div 
          className="absolute inset-0 z-0"
          style={{ 
            backgroundImage: 'url("https://images.unsplash.com/photo-1565626424178-b599f7545432?q=80&w=2000&auto=format&fit=crop")', 
            backgroundSize: 'cover',
            backgroundPosition: 'center',
            filter: 'grayscale(100%)',
          }}
        >
           {/* Overlay Layer for text readability */}
           <div className="absolute inset-0 bg-black/60"></div>
        </div>

        {/* Content */}
        <div className="relative z-10 text-center px-4 max-w-4xl mx-auto py-20">
          <h1 className="text-4xl md:text-6xl font-serif font-bold text-white mb-6 leading-tight drop-shadow-lg">
            Ponto de encontro para <br/>
            <span className="text-gold-500 italic">negócios imobiliários</span> na Barra da Tijuca.
          </h1>
          <p className="text-lg md:text-xl text-slate-100 mb-12 max-w-2xl mx-auto font-light tracking-wide drop-shadow-md">
            Conectamos proprietários e compradores com exclusividade, discrição e a sofisticação que você merece.
          </p>

          <div className="flex flex-col md:flex-row items-center justify-center gap-6 mb-16">
            <Link 
              to="/vender" 
              className="group w-full md:w-auto px-8 py-4 bg-gold-500 hover:bg-gold-400 text-navy-900 font-bold rounded-sm shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3"
            >
              <Key className="h-5 w-5" />
              <span>QUERO VENDER</span>
            </Link>

            <Link 
              to="/comprar" 
              state={{ showAll: true }}
              className="group w-full md:w-auto px-8 py-4 bg-white hover:bg-slate-100 text-navy-900 font-bold rounded-sm shadow-xl hover:shadow-2xl transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3"
            >
              <Building className="h-5 w-5" />
              <span>Ver Imóveis Disponíveis</span>
            </Link>
            
            <Link 
              to="/comprar" 
              className="group w-full md:w-auto px-8 py-4 bg-navy-900/80 border-2 border-navy-900/80 text-white hover:bg-navy-900 hover:text-gold-500 font-bold rounded-sm shadow-xl hover:shadow-white/10 transition-all transform hover:-translate-y-1 flex items-center justify-center space-x-3 backdrop-blur-sm"
            >
              <Search className="h-5 w-5" />
              <span>Buscar Oportunidades</span>
            </Link>
          </div>

          {/* Featured Section */}
          {featuredProperties.length > 0 && (
            <div className="animate-in slide-in-from-bottom-8 duration-700">
               <div className="flex items-center justify-center gap-4 mb-8">
                  <div className="h-[1px] w-12 bg-gold-500 shadow-sm"></div>
                  <h2 className="text-2xl md:text-3xl font-serif font-bold text-white tracking-wide drop-shadow-md">Destaques Exclusivos</h2>
                  <div className="h-[1px] w-12 bg-gold-500 shadow-sm"></div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 text-left">
                  {featuredProperties.map(prop => (
                     <div 
                        key={prop.id} 
                        onClick={() => navigate('/comprar', { state: { propertyId: prop.id } })}
                        className="bg-white/95 backdrop-blur-sm rounded-lg overflow-hidden cursor-pointer hover:scale-105 transition-transform shadow-xl group"
                     >
                        <div className="h-48 relative overflow-hidden">
                           <img src={prop.images[0]} alt={prop.condoName} className="w-full h-full object-cover" />
                           <div className="absolute top-3 right-3 bg-navy-900 text-gold-500 px-2 py-1 text-[10px] font-bold uppercase tracking-widest rounded-sm">
                              Destaque
                           </div>
                        </div>
                        <div className="p-4">
                           <h3 className="font-serif font-bold text-navy-900 truncate">{prop.condoName || 'Oportunidade Exclusiva'}</h3>
                           <div className="flex items-center text-slate-500 text-xs mb-3 mt-1">
                              <MapPin className="h-3 w-3 mr-1" />
                              {prop.region}
                           </div>
                           <div className="flex justify-between border-t border-slate-200 pt-3 text-xs font-medium text-slate-700">
                              <span className="flex items-center gap-1"><BedDouble className="h-3 w-3 text-gold-500"/> {prop.bedrooms} Quartos</span>
                              <span className="flex items-center gap-1"><Ruler className="h-3 w-3 text-gold-500"/> {prop.area} m²</span>
                           </div>
                        </div>
                     </div>
                  ))}
               </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Home;
