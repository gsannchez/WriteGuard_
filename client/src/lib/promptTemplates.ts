/**
 * Templates de prompts optimizados para diferentes tipos de análisis de texto
 */

// Prompt para análisis general del texto (correcciones ortográficas/gramáticales y sugerencias)
export const TEXT_ANALYSIS_PROMPT = `
Eres un asistente de escritura profesional. Analiza el siguiente texto en busca de:
1. Errores ortográficos y tipográficos
2. Problemas gramaticales o de estilo
3. Posibles autocompletados si el texto parece estar incompleto

Responde con JSON en este formato:
{
  "spelling": [
    {
      "incorrect": "palabra_incorrecta",
      "correct": "sugerencia_corregida",
      "context": "texto circundante para mostrar contexto"
    }
  ],
  "grammar": [
    {
      "incorrect": "frase_incorrecta",
      "correct": "versión_corregida",
      "context": "texto circundante para mostrar contexto"
    }
  ],
  "autocomplete": [
    "sugerencia_1 (completa la frase actual)",
    "sugerencia_2 (alternativa)",
    "sugerencia_3 (alternativa)"
  ]
}

Si no hay errores o sugerencias para alguna categoría, devuelve un array vacío.
`;

// Prompt para autocompletado específico
export const AUTOCOMPLETE_PROMPT = `
Eres un asistente de escritura que ayuda a completar frases. En base al siguiente texto, proporciona 3-5 continuaciones naturales y contextualmente apropiadas que completen la idea actual.

El texto debe ser continuado de forma que:
1. Mantenga el tono, estilo y registro del texto original
2. Complete la idea de manera coherente
3. Siga el contexto de las 2-3 frases previas

Responde solo con un array JSON de strings con las opciones de autocompletado.
`;

// Prompt para reescritura de texto
export const REWRITE_PROMPT = `
Eres un editor profesional. Reescribe la siguiente frase para mejorar su claridad, concisión y corrección gramatical, manteniendo el significado original:

Frase original: "{text}"

Proporciona tres versiones mejoradas, ordenadas de menor a mayor cambio respecto al original.
Responde solo con un array JSON de strings con las opciones de reescritura.
`;

// Prompt para análisis de estilo formal/informal
export const STYLE_ANALYSIS_PROMPT = `
Analiza el siguiente texto y determina su nivel de formalidad en una escala del 1 al 5, donde:
1 = Muy informal
2 = Informal
3 = Neutral
4 = Formal
5 = Muy formal

Además, sugiere cómo el texto podría modificarse para ajustarse mejor al nivel de formalidad deseado (especificado como "{targetFormality}").

Responde con JSON en este formato:
{
  "currentFormality": número,
  "analysis": "breve explicación de por qué tiene ese nivel",
  "suggestion": "sugerencia para ajustar al nivel deseado"
}
`;

// Configura los parámetros del modelo según el tipo de análisis
export interface ModelConfig {
  temperature: number;
  maxTokens: number;
  model: string;
}

// Configuraciones predefinidas para diferentes tareas
export const MODEL_CONFIGS: Record<string, ModelConfig> = {
  spelling: {
    temperature: 0.3,
    maxTokens: 1000,
    model: "gpt-4o" // por defecto usar el mejor modelo para precisión
  },
  autocomplete: {
    temperature: 0.7, // más creativo para autocompletado
    maxTokens: 300,
    model: "gpt-3.5-turbo" // más rápido para autocompletado
  },
  rewrite: {
    temperature: 0.5,
    maxTokens: 500,
    model: "gpt-4o"
  },
  style: {
    temperature: 0.4,
    maxTokens: 400,
    model: "gpt-3.5-turbo"
  }
};

// Selecciona la configuración basada en sensibilidad y tipo
export const getModelConfig = (type: string, sensitivity: 'high' | 'medium' | 'low'): ModelConfig => {
  const baseConfig = MODEL_CONFIGS[type] || MODEL_CONFIGS.spelling;
  
  // Ajustar parámetros según sensibilidad
  switch (sensitivity) {
    case 'high':
      return {
        ...baseConfig,
        temperature: Math.max(0.1, baseConfig.temperature - 0.2),
        model: "gpt-4o" // siempre usar el mejor modelo para alta sensibilidad
      };
    case 'low':
      return {
        ...baseConfig,
        temperature: Math.min(0.9, baseConfig.temperature + 0.2),
        model: "gpt-3.5-turbo" // usar modelo más rápido para baja sensibilidad
      };
    default:
      return baseConfig;
  }
};