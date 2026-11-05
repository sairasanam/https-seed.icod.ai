import { GoogleGenerativeAI } from '@google/generative-ai';

// Interfaces for structured AI suggestions
export interface AISuggestion {
  title: string;
  explanation: string;
  steps: string[];
  category: string;
  estimatedTime: string;
  budget?: string;
}

export interface SuggestionRequest {
  context: string;
  treeType: 'inner' | 'community' | 'outer';
  preferences?: {
    availableTime?: string;
    budget?: string;
    relationshipType?: string;
    constraints?: string;
  };
}

// Lazy initialization - client is created on first use to ensure env vars are loaded
let genAI: GoogleGenerativeAI | null = null;
let model: any = null;

// Read AI configuration from environment variables
// AI_PROVIDER is required by integration rules to determine which provider to use
function getAIConfig() {
  const provider = (process.env.AI_PROVIDER || 'google').toLowerCase();
  const apiKey = process.env.AI_API_KEY || '';
  const model = process.env.AI_MODEL || 'gemini-2.0-flash';

  return { provider, apiKey, model };
}

function initializeAI(): void {
  if (!genAI) {
    const config = getAIConfig();

    // Validate that we have the required credentials
    if (!config.apiKey) {
      throw new Error('AI_API_KEY environment variable is not set');
    }

    // Log which provider we're using (without exposing sensitive data)
    console.log(`[AI] Initializing with provider: ${config.provider}, model: ${config.model}`);

    // For Google Gemini (default or explicit)
    if (config.provider === 'google' || config.provider === 'gemini') {
      genAI = new GoogleGenerativeAI(config.apiKey);
      model = genAI.getGenerativeModel({ model: config.model });
    } else {
      // If a different provider is specified but not supported, fall back to Google
      console.warn(`[AI] Provider "${config.provider}" not directly supported, falling back to Google Gemini`);
      genAI = new GoogleGenerativeAI(config.apiKey);
      model = genAI.getGenerativeModel({ model: config.model });
    }
  }
}

// Retry logic with exponential backoff
async function withRetry<T>(
  fn: () => Promise<T>,
  maxRetries: number = 2,
  baseDelay: number = 1000
): Promise<T> {
  let lastError: Error | null = null;

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await fn();
    } catch (err) {
      lastError = err as Error;

      // Don't retry on certain errors
      if (lastError.message.includes('API key')) {
        throw lastError;
      }

      // Check for rate limiting
      if (lastError.message.includes('429') || lastError.message.includes('rate limit')) {
        const delay = baseDelay * Math.pow(2, attempt) + Math.random() * 1000;
        console.log(`[AI] Rate limited, waiting ${Math.round(delay)}ms before retry ${attempt + 1}/${maxRetries}`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }

      if (attempt < maxRetries) {
        const delay = baseDelay * Math.pow(2, attempt);
        console.log(`[AI] Request failed, retrying in ${delay}ms (attempt ${attempt + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }
  }

  throw lastError || new Error('Unknown error during AI request');
}

// Timeout wrapper
function withTimeout<T>(promise: Promise<T>, ms: number): Promise<T> {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      reject(new Error(`AI request timed out after ${ms}ms`));
    }, ms);

    promise
      .then(result => {
        clearTimeout(timeout);
        resolve(result);
      })
      .catch(err => {
        clearTimeout(timeout);
        reject(err);
      });
  });
}

function buildPrompt(request: SuggestionRequest): string {
  const { context, treeType, preferences } = request;

  const treeTypeLabels = {
    inner: 'Inner Circle (close relationships - family, friends)',
    community: 'Community (local service projects and initiatives)',
    outer: 'Outer Circle (broader impact - nonprofits, causes)',
  };

  let prompt = `You are Seeds, a compassionate AI assistant that helps people nurture relationships and serve their communities.

Generate 3-5 thoughtful, actionable suggestions based on the following context:

CONTEXT: ${context}
TREE TYPE: ${treeTypeLabels[treeType]}
`;

  if (preferences) {
    prompt += '\nPREFERENCES:\n';
    if (preferences.availableTime) prompt += `- Available time: ${preferences.availableTime}\n`;
    if (preferences.budget) prompt += `- Budget: ${preferences.budget}\n`;
    if (preferences.relationshipType) prompt += `- Relationship type: ${preferences.relationshipType}\n`;
    if (preferences.constraints) prompt += `- Constraints: ${preferences.constraints}\n`;
  }

  prompt += `
RESPONSE FORMAT: Return ONLY valid JSON array with this structure:
[
  {
    "title": "Short, compelling title (max 50 chars)",
    "explanation": "Why this suggestion matters and how it helps (2-3 sentences)",
    "steps": ["Step 1", "Step 2", "Step 3"],
    "category": "Category name (e.g., Communication, Support, Connection)",
    "estimatedTime": "Time estimate (e.g., 15 min, 1 hour, 2-3 hours)",
    "budget": "Cost estimate or 'free' (optional, omit if free)"
  }
]

REQUIREMENTS:
- Make each suggestion specific, personal, and emotionally supportive
- Avoid generic advice - tailor to the context provided
- Include concrete, actionable steps that can be taken immediately
- Consider the tree type when suggesting actions
- Be warm, encouraging, and practical in tone
- Ensure suggestions are realistic given any stated constraints
- Do NOT include any text outside the JSON array`;

  return prompt;
}

function parseSuggestions(responseText: string): AISuggestion[] {
  // Try to extract JSON from the response
  let jsonStr = responseText.trim();

  // Remove markdown code blocks if present
  const jsonMatch = jsonStr.match(/```(?:json)?\s*([\s\S]*?)```/);
  if (jsonMatch) {
    jsonStr = jsonMatch[1].trim();
  }

  // Find the array in the response
  const arrayMatch = jsonStr.match(/\[[\s\S]*\]/);
  if (!arrayMatch) {
    throw new Error('Could not find JSON array in AI response');
  }

  try {
    const parsed = JSON.parse(arrayMatch[0]);

    if (!Array.isArray(parsed)) {
      throw new Error('AI response is not an array');
    }

    // Validate and sanitize each suggestion
    return parsed.map((item: any, index: number) => ({
      title: String(item.title || `Suggestion ${index + 1}`).slice(0, 100),
      explanation: String(item.explanation || ''),
      steps: Array.isArray(item.steps) ? item.steps.map(String).slice(0, 10) : [],
      category: String(item.category || 'General'),
      estimatedTime: String(item.estimatedTime || 'Varies'),
      budget: item.budget ? String(item.budget) : undefined,
    }));
  } catch (err) {
    console.error('[AI] Failed to parse suggestions:', err);
    throw new Error('Failed to parse AI response');
  }
}

export async function generateSuggestions(request: SuggestionRequest): Promise<AISuggestion[]> {
  initializeAI();

  const prompt = buildPrompt(request);

  try {
    const result = await withRetry(async () => {
      return withTimeout(
        model.generateContent(prompt) as Promise<{ response: { text: () => string } }>,
        30000 // 30 second timeout
      );
    }, 2);

    const response = result.response;
    const text = response.text();

    return parseSuggestions(text);
  } catch (err) {
    const error = err as Error;
    console.error('[AI] Generation failed:', error.message);

    // Return fallback suggestions if AI fails
    console.log('[AI] Returning fallback suggestions');
    return getFallbackSuggestions(request.treeType);
  }
}

// Fallback suggestions when AI is unavailable
function getFallbackSuggestions(treeType: 'inner' | 'community' | 'outer'): AISuggestion[] {
  const fallbacks: Record<string, AISuggestion[]> = {
    inner: [
      {
        title: 'Send a thoughtful message',
        explanation: 'A simple check-in can mean the world to someone going through a difficult time.',
        steps: ['Think of a specific memory you share', 'Write a brief, heartfelt message', 'Send via text, email, or handwritten note'],
        category: 'Communication',
        estimatedTime: '10-15 min',
      },
      {
        title: 'Schedule quality time together',
        explanation: 'Dedicated one-on-one time strengthens bonds and shows you value the relationship.',
        steps: ['Check both your calendars', 'Suggest 2-3 specific times', 'Plan a low-pressure activity like coffee or a walk'],
        category: 'Connection',
        estimatedTime: '1-2 hours',
      },
      {
        title: 'Offer specific help',
        explanation: 'Instead of "let me know if you need anything," offer something concrete.',
        steps: ['Identify a specific way you could help', 'Make a direct offer: "Can I bring dinner Tuesday?"', 'Follow through reliably'],
        category: 'Support',
        estimatedTime: 'Varies',
      },
    ],
    community: [
      {
        title: 'Organize a neighborhood gathering',
        explanation: 'Building local connections creates a stronger, more supportive community for everyone.',
        steps: ['Choose a casual format (potluck, park meetup)', 'Pick a date and location', 'Invite neighbors via flyer or group chat'],
        category: 'Community Building',
        estimatedTime: '2-3 hours planning',
      },
      {
        title: 'Start a skill-share exchange',
        explanation: 'Everyone has something to teach and learn—sharing skills builds mutual respect.',
        steps: ['Survey neighbors about skills they can share', 'Create a simple signup sheet', 'Host the first session at a home or community space'],
        category: 'Education',
        estimatedTime: '1-2 hours per session',
      },
      {
        title: 'Create care packages for those in need',
        explanation: 'Small acts of kindness can brighten someone\'s day and strengthen community bonds.',
        steps: ['Gather essential items (snacks, hygiene products)', 'Assemble packages with care', 'Distribute through local shelters or directly'],
        category: 'Support',
        estimatedTime: '2-3 hours',
        budget: '$20-50',
      },
    ],
    outer: [
      {
        title: 'Research organizations aligned with your values',
        explanation: 'Finding the right cause ensures your support has maximum impact.',
        steps: ['Identify issues you care most about', 'Search for local nonprofits addressing them', 'Read reviews and impact reports'],
        category: 'Discovery',
        estimatedTime: '30-60 min',
      },
      {
        title: 'Set up a recurring donation',
        explanation: 'Monthly giving provides nonprofits with predictable funding for long-term planning.',
        steps: ['Choose an organization you trust', 'Decide on a sustainable monthly amount', 'Set up automatic giving through their website'],
        category: 'Giving',
        estimatedTime: '10 min',
        budget: 'Any amount',
      },
      {
        title: 'Volunteer your professional skills',
        explanation: 'Your expertise is valuable—many nonprofits need pro bono help but cannot afford it.',
        steps: ['Identify skills you can offer (design, accounting, etc.)', 'Contact organizations about pro bono needs', 'Commit to a specific project or timeframe'],
        category: 'Service',
        estimatedTime: 'Varies',
      },
    ],
  };

  return fallbacks[treeType] || fallbacks.inner;
}

export async function saveSuggestion(
  userId: string,
  promptContext: string,
  content: AISuggestion[]
): Promise<void> {
  const Suggestion = (await import('../models/Suggestion')).default;

  await Suggestion.create({
    userId,
    promptContext,
    content,
    saved: true,
  });
}
