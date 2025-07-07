import axios from 'axios';

interface DeepSeekConfig {
  apiKey: string;
  baseUrl: string;
  model: string;
}

interface DeepSeekResponse {
  choices: Array<{
    message: {
      content: string;
    };
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

class DeepSeekClient {
  private config: DeepSeekConfig;

  constructor() {
    this.config = {
      apiKey: process.env.DEEPSEEK_API_KEY || '',
      baseUrl: 'https://api.deepseek.com/v1',
      model: 'deepseek-chat'
    };
  }

  async generateContent(prompt: string, options: {
    maxTokens?: number;
    temperature?: number;
    systemPrompt?: string;
  } = {}): Promise<string> {
    try {
      const response = await axios.post(`${this.config.baseUrl}/chat/completions`, {
        model: this.config.model,
        messages: [
          ...(options.systemPrompt ? [{ role: 'system', content: options.systemPrompt }] : []),
          { role: 'user', content: prompt }
        ],
        max_tokens: options.maxTokens || 2000,
        temperature: options.temperature || 0.7,
        stream: false
      }, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`,
          'Content-Type': 'application/json'
        }
      });

      const data: DeepSeekResponse = response.data;
      return data.choices[0]?.message?.content || '';
    } catch (error) {
      console.error('DeepSeek API error:', error);
      throw new Error('Failed to generate content with DeepSeek');
    }
  }

  async generatePitchDeck(businessIdea: string, industry: string, country: string): Promise<{
    title: string;
    slides: Array<{
      slideNumber: number;
      title: string;
      content: string[];
      imagePrompt: string;
      chartData?: any;
    }>;
    executiveSummary: string;
    downloadOptions: string[];
  }> {
    const systemPrompt = `You are an expert business consultant specializing in ${country} market dynamics and ${industry} industry insights. Create comprehensive pitch deck content that is market-specific and investment-ready.`;

    const prompt = `Create a detailed pitch deck for this business idea: "${businessIdea}"

Industry: ${industry}
Target Market: ${country}

Provide a JSON response with:
1. Compelling title
2. 8-10 slide structure with:
   - Slide number
   - Title
   - Bullet points for content
   - Image prompt for visual generation
   - Chart data where relevant
3. Executive summary
4. Available download formats

Make it specific to ${country} market conditions and ${industry} opportunities.`;

    try {
      const response = await this.generateContent(prompt, {
        systemPrompt,
        maxTokens: 3000,
        temperature: 0.8
      });

      // Parse the JSON response
      const pitchData = JSON.parse(response);
      
      return {
        title: pitchData.title || `${businessIdea} - Business Pitch`,
        slides: pitchData.slides || this.generateFallbackSlides(businessIdea, industry, country),
        executiveSummary: pitchData.executiveSummary || `Executive summary for ${businessIdea} in ${country}`,
        downloadOptions: ['PDF', 'PowerPoint', 'Google Slides', 'Keynote']
      };
    } catch (error) {
      console.error('Failed to parse DeepSeek response:', error);
      return this.generateFallbackPitch(businessIdea, industry, country);
    }
  }

  async generate3DVideoScript(prompt: string, style: string, duration: number): Promise<{
    script: string;
    scenes: Array<{
      sceneNumber: number;
      description: string;
      duration: number;
      cameraMovement: string;
      objects: string[];
    }>;
    voiceover: string;
    musicSuggestion: string;
  }> {
    const systemPrompt = `You are a professional 3D video director. Create detailed video scripts with scene descriptions, camera movements, and timing for ${style} style videos.`;

    const videoPrompt = `Create a ${duration}-second 3D video script for: "${prompt}"

Style: ${style}
Duration: ${duration} seconds

Provide detailed JSON with:
1. Complete script narrative
2. Scene-by-scene breakdown with timing
3. Camera movements and angles
4. 3D objects and animations needed
5. Voiceover script
6. Background music suggestions

Make it professional and engaging for business presentations.`;

    try {
      const response = await this.generateContent(videoPrompt, {
        systemPrompt,
        maxTokens: 2000,
        temperature: 0.7
      });

      const videoData = JSON.parse(response);
      return videoData;
    } catch (error) {
      console.error('Failed to generate video script:', error);
      return this.generateFallback3DScript(prompt, style, duration);
    }
  }

  private generateFallbackSlides(businessIdea: string, industry: string, country: string) {
    return [
      {
        slideNumber: 1,
        title: "Problem Statement",
        content: [`Key challenge in ${country} ${industry} market`, "Market gap analysis", "Customer pain points"],
        imagePrompt: `Professional business problem illustration for ${industry} in ${country}`
      },
      {
        slideNumber: 2,
        title: "Solution Overview",
        content: [`${businessIdea} addresses the problem`, "Unique value proposition", "Core features and benefits"],
        imagePrompt: `Modern solution visualization for ${businessIdea}`
      },
      {
        slideNumber: 3,
        title: "Market Opportunity",
        content: [`${country} market size and growth`, "Target customer segments", "Revenue potential"],
        imagePrompt: `Market opportunity chart for ${country} ${industry} sector`
      }
    ];
  }

  private generateFallbackPitch(businessIdea: string, industry: string, country: string) {
    return {
      title: `${businessIdea} - ${country} Market Opportunity`,
      slides: this.generateFallbackSlides(businessIdea, industry, country),
      executiveSummary: `${businessIdea} represents a significant opportunity in the ${country} ${industry} market, addressing key challenges with innovative solutions.`,
      downloadOptions: ['PDF', 'PowerPoint', 'Google Slides']
    };
  }

  private generateFallback3DScript(prompt: string, style: string, duration: number) {
    return {
      script: `Professional ${style} video showcasing ${prompt}`,
      scenes: [
        {
          sceneNumber: 1,
          description: `Opening scene with ${prompt} introduction`,
          duration: duration / 3,
          cameraMovement: "Smooth zoom in",
          objects: ["Logo", "Text overlay", "Background elements"]
        }
      ],
      voiceover: `Welcome to our ${style} presentation of ${prompt}`,
      musicSuggestion: `Corporate ${style} background music`
    };
  }

  isConfigured(): boolean {
    return !!this.config.apiKey;
  }
}

export const deepSeekClient = new DeepSeekClient();