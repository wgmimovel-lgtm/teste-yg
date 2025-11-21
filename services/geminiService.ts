import { GoogleGenAI } from "@google/genai";
import { PropertyType } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

interface PropertyDetails {
  type: PropertyType;
  region: string;
  condoName: string;
  bedrooms: number;
  area: number;
}

export const generatePropertyDescription = async (details: PropertyDetails): Promise<string> => {
  try {
    const prompt = `
      Atue como um corretor de imóveis de luxo especializado na Barra da Tijuca, Rio de Janeiro.
      Escreva uma descrição vendedora, elegante e sofisticada para um imóvel com as seguintes características:
      
      Tipo: ${details.type}
      Condomínio: ${details.condoName}
      Localização: ${details.region}, Barra da Tijuca
      Quartos: ${details.bedrooms}
      Área: ${details.area}m²

      A descrição deve ter no máximo 3 parágrafos. Enfatize exclusividade, conforto e a localização privilegiada.
      Não use hashtags. Use tom formal e convidativo.
    `;

    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });

    return response.text || "Descrição não disponível no momento.";
  } catch (error) {
    console.error("Erro ao gerar descrição com Gemini:", error);
    return "Não foi possível gerar a descrição automática. Por favor, preencha manualmente.";
  }
};
