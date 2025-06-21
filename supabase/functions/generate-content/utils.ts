
export const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

export const fetchWithTimeout = async (url: string, options: RequestInit, timeoutMs = 30000) => {
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), timeoutMs);
  
  try {
    const response = await fetch(url, {
      ...options,
      signal: controller.signal
    });
    clearTimeout(timeoutId);
    return response;
  } catch (error) {
    clearTimeout(timeoutId);
    throw error;
  }
};

export const validateApiKey = (apiKey: string | undefined): void => {
  if (!apiKey) {
    console.error('ERROR: DEEPSEEK_API_KEY no está configurada en las variables de entorno');
    throw new Error('DEEPSEEK_API_KEY no configurada');
  }

  if (apiKey.length < 10) {
    console.error('ERROR: DEEPSEEK_API_KEY parece ser inválida (muy corta):', apiKey.substring(0, 5) + '...');
    throw new Error('DEEPSEEK_API_KEY parece ser inválida');
  }
};

export const parseAndValidateJson = (content: string): any[] => {
  let parsedContent;
  try {
    parsedContent = JSON.parse(content);
    console.log('Contenido parseado exitosamente como JSON');
    console.log('Tipo de contenido:', Array.isArray(parsedContent) ? 'Array' : typeof parsedContent);
  } catch (error) {
    console.error('Error parseando JSON del contenido generado:', error);
    console.error('Contenido que falló al parsear:', content);
    throw new Error('Respuesta de DeepSeek no es JSON válido');
  }

  // Asegurar que sea un array
  if (!Array.isArray(parsedContent)) {
    console.log('Convirtiendo contenido a array');
    parsedContent = [parsedContent];
  }

  return parsedContent;
};
