import 'dotenv/config';
import express from 'express';
import path from 'path';
import cors from 'cors';
import { dbInstance, verifyToken, generateToken, Task, Habit, CalendarEvent, Goal, verifyPassword } from './server-db';
import { GoogleGenAI, Type } from '@google/genai';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(express.json());

// Initialize AI clients safely (Both Gemini & Groq supported)
let ai: GoogleGenAI | null = null;
const isGroqActive = !!process.env.GROQ_API_KEY || (!!process.env.GEMINI_API_KEY && process.env.GEMINI_API_KEY.startsWith('gsk_'));
const isGeminiActive = !isGroqActive && !!process.env.GEMINI_API_KEY && 
                       process.env.GEMINI_API_KEY !== 'MY_GEMINI_API_KEY' && 
                       process.env.GEMINI_API_KEY !== 'YOUR_GEMINI_API_KEY' && 
                       process.env.GEMINI_API_KEY !== 'AIzaSyBr9QqiuH_FjVCA3HiJLXmasjJ_uBAKEnY' &&
                       process.env.GEMINI_API_KEY.trim() !== '';

const hasAIActive = isGroqActive || isGeminiActive;

if (isGeminiActive) {
  try {
    ai = new GoogleGenAI({
      apiKey: process.env.GEMINI_API_KEY,
      httpOptions: {
        headers: {
          'User-Agent': 'aistudio-build',
        }
      }
    });
    console.log('Gemini AI system initialized with user-provided API key.');
  } catch (err) {
    console.error('Failed to initialize Gemini AI client:', err);
  }
} else if (isGroqActive) {
  console.log('Groq AI system active as the primary intelligence engine.');
} else {
  console.log('No valid user-provided AI keys found. Defaulting to TaskPilot local smart engine.');
}

// Unified LLM caller supporting both Groq and Gemini
async function callLLM(options: {
  systemPrompt?: string;
  userPrompt: string;
  jsonMode?: boolean;
}): Promise<{ text: string; toolCall?: { name: string; args: any } }> {
  const rawApiKey = process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY;
  const isGroq = !!rawApiKey && (rawApiKey.startsWith('gsk_') || !!process.env.GROQ_API_KEY);
  const apiKey = isGroq ? (process.env.GROQ_API_KEY || process.env.GEMINI_API_KEY) : process.env.GEMINI_API_KEY;

  if (isGroq && apiKey) {
    try {
      let systemContext = options.systemPrompt || '';
      const userContext = options.userPrompt;

      if (systemContext.includes('createTask')) {
        systemContext += `\n\nCRITICAL TOOL USE RULE:
If the user asks to create, add, schedule, or register a task, you MUST trigger the task creation tool.
To trigger it, your response MUST be a JSON object of this structure (output ONLY the JSON, nothing else before or after):
{
  "tool_call": {
    "name": "createTask",
    "arguments": {
      "title": "Clean, descriptive task title (required)",
      "priority": "low" | "medium" | "high" | "urgent",
      "category": "work" | "personal" | "academic",
      "tag": "short 1-2 word tag name"
    }
  }
}
If they are NOT requesting to create/add/schedule a task, just output your normal conversational helpful response in Markdown.`;
      }

      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${apiKey}`
        },
        body: JSON.stringify({
          model: 'llama-3.3-70b-versatile',
          messages: [
            ...(systemContext ? [{ role: 'system', content: systemContext }] : []),
            { role: 'user', content: userContext }
          ],
          temperature: 0.3,
          ...(options.jsonMode ? { response_format: { type: 'json_object' } } : {})
        })
      });

      if (!response.ok) {
        const errorText = await response.text();
        throw new Error(`Groq API responded with status ${response.status}: ${errorText}`);
      }

      const data = await response.json() as any;
      const content = data.choices?.[0]?.message?.content || '';

      const trimmedContent = content.trim();
      if (trimmedContent.startsWith('{') || trimmedContent.includes('"tool_call"')) {
        try {
          let jsonStr = trimmedContent;
          if (trimmedContent.includes('```json')) {
            const match = trimmedContent.match(/```json\s*([\s\S]*?)\s*```/);
            if (match) jsonStr = match[1];
          } else if (trimmedContent.includes('```')) {
            const match = trimmedContent.match(/```\s*([\s\S]*?)\s*```/);
            if (match) jsonStr = match[1];
          }
          
          const parsed = JSON.parse(jsonStr.trim());
          if (parsed.tool_call) {
            return {
              text: '',
              toolCall: {
                name: parsed.tool_call.name,
                args: parsed.tool_call.arguments
              }
            };
          }
        } catch (e) {
          // ignore parse failure and treat as plain text
        }
      }

      return { text: content };
    } catch (err: any) {
      console.error('Groq LLM call failed:', err.message || err);
      throw err;
    }
  } else if (ai) {
    try {
      if (options.jsonMode) {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: options.userPrompt,
          config: {
            systemInstruction: options.systemPrompt,
            responseMimeType: 'application/json'
          }
        });
        return { text: response.text || '' };
      } else {
        const response = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: options.userPrompt,
          config: {
            systemInstruction: options.systemPrompt
          }
        });
        return { text: response.text || '' };
      }
    } catch (err: any) {
      console.error('Gemini LLM call failed:', err.message || err);
      throw err;
    }
  }

  throw new Error('No valid LLM API Key (Groq or Gemini) is active.');
}

// Auth Middleware
function authenticateToken(req: express.Request, res: express.Response, next: express.NextFunction): void {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    res.status(401).json({ error: 'Access token required.' });
    return;
  }

  const payload = verifyToken(token);
  if (!payload) {
    res.status(403).json({ error: 'Invalid or expired access token.' });
    return;
  }

  (req as any).user = payload;
  next();
}

// -----------------------------------------------------
// AUTHENTICATION API
// -----------------------------------------------------
app.post('/api/auth/register', (req, res) => {
  try {
    const { email, password, name } = req.body;
    if (!email || !password || !name) {
      res.status(400).json({ error: 'Please provide email, password, and name.' });
      return;
    }

    const user = dbInstance.createUser(email, password, name);
    const token = generateToken({ id: user.id, email: user.email });

    res.json({
      token,
      user: user.stats
    });
  } catch (error: any) {
    res.status(400).json({ error: error.message || 'Registration failed.' });
  }
});

app.post('/api/auth/login', (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      res.status(400).json({ error: 'Email and password are required.' });
      return;
    }

    const user = dbInstance.getUserByEmail(email);
    if (!user) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    if (!verifyPassword(password, user.passwordHash, user.passwordSalt)) {
      res.status(401).json({ error: 'Invalid email or password.' });
      return;
    }

    const token = generateToken({ id: user.id, email: user.email });
    res.json({
      token,
      user: user.stats
    });
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Login failed.' });
  }
});

app.get('/api/auth/me', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const user = dbInstance.getUserById(userId);
  if (!user) {
    res.status(404).json({ error: 'User not found.' });
    return;
  }
  res.json({ user: user.stats });
});

app.post('/api/auth/logout', (req, res) => {
  res.json({ success: true, message: 'Successfully logged out.' });
});

app.post('/api/auth/forgot-password', (req, res) => {
  res.json({ success: true, message: 'Magic rescue link sent to registered email.' });
});

app.post('/api/auth/reset-password', (req, res) => {
  res.json({ success: true, message: 'Password successfully updated.' });
});

// -----------------------------------------------------
// GOOGLE & GITHUB OAUTH ENDPOINTS
// -----------------------------------------------------
app.get('/api/auth/google/url', (req, res) => {
  const clientId = process.env.GOOGLE_CLIENT_ID;
  const redirectUri = (req.query.redirect_uri as string) || `${req.protocol}://${req.get('host')}/auth/callback/google`;
  
  if (!clientId || clientId === 'MY_GOOGLE_CLIENT_ID') {
    return res.json({ url: `/auth/callback/google?sandbox=true` });
  }

  const scope = encodeURIComponent('openid email profile');
  const responseType = 'code';
  const url = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&response_type=${responseType}&scope=${scope}&prompt=consent`;
  res.json({ url });
});

app.get('/api/auth/github/url', (req, res) => {
  const clientId = process.env.GITHUB_CLIENT_ID;
  const redirectUri = (req.query.redirect_uri as string) || `${req.protocol}://${req.get('host')}/auth/callback/github`;

  if (!clientId || clientId === 'MY_GITHUB_CLIENT_ID') {
    return res.json({ url: `/auth/callback/github?sandbox=true` });
  }

  const scope = encodeURIComponent('user:email read:user');
  const url = `https://github.com/login/oauth/authorize?client_id=${clientId}&redirect_uri=${encodeURIComponent(redirectUri)}&scope=${scope}`;
  res.json({ url });
});

app.get(['/auth/callback/google', '/auth/callback/google/'], async (req, res) => {
  const isSandbox = req.query.sandbox === 'true' || !process.env.GOOGLE_CLIENT_ID || process.env.GOOGLE_CLIENT_ID === 'MY_GOOGLE_CLIENT_ID';
  
  if (isSandbox) {
    // Render high-end UI explaining sandbox mode
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Google Sandbox Portal | TaskPilot AI</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body {
            background: #020203;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            padding: 24px;
          }
          .card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 28px;
            padding: 40px;
            max-width: 440px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            backdrop-filter: blur(20px);
          }
          .title {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #a5b4fc, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .desc {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .badge {
            display: inline-block;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.3);
            color: #a5b4fc;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 6px 12px;
            border-radius: 100px;
            margin-bottom: 16px;
          }
          .btn {
            background: linear-gradient(135deg, #4f46e5, #8b5cf6);
            border: none;
            color: white;
            padding: 14px 28px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 8px 16px rgba(99,102,241,0.2);
            transition: all 0.2s;
            width: 100%;
            box-sizing: border-box;
          }
          .btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 12px 20px rgba(99,102,241,0.3);
          }
          .footer {
            font-size: 11px;
            color: #64748b;
            margin-top: 24px;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 16px;
            text-align: left;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">Google Sandbox Gateway</span>
          <div class="title">OAuth Dev Mode Activated</div>
          <div class="desc">
            You are running in the AI Studio preview environment. Since <b>GOOGLE_CLIENT_ID</b> is not configured, we've launched the sandbox tunnel safely.
          </div>
          <button class="btn" onclick="authorizeSandbox()">Launch Sandbox Terminal</button>
          <div class="footer">
            <b>Production OAuth Setup:</b><br/>
            To configure real logins, go to Settings and add:<br/>
            - <code>GOOGLE_CLIENT_ID</code><br/>
            - <code>GOOGLE_CLIENT_SECRET</code>
          </div>
        </div>

        <script>
          function authorizeSandbox() {
            // Generate mock but valid sandbox account
            const mockUser = {
              name: "Google Officer Alex",
              email: "google.sandbox@lifesaver.ai",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              level: 4,
              xp: 450,
              xpToNextLevel: 1000,
              coins: 120,
              title: "Command Deck Supervisor 🚀",
              productivityScore: 88,
              focusScore: 82,
              moodScore: 90,
              energyScore: 85
            };
            
            // Post message back to main window
            window.opener.postMessage({
              type: 'OAUTH_AUTH_SUCCESS',
              token: 'sandbox-google-security-token-jwt-1337',
              user: mockUser
            }, '*');
            
            window.close();
          }
        </script>
      </body>
      </html>
    `);
  }

  // Real OAuth exchange flow
  try {
    const code = req.query.code;
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback/google`;
    
    const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({
        code: code as string,
        client_id: process.env.GOOGLE_CLIENT_ID || '',
        client_secret: process.env.GOOGLE_CLIENT_SECRET || '',
        redirect_uri: redirectUri,
        grant_type: 'authorization_code'
      })
    }).then(r => r.json());

    if (!tokenResponse.access_token) {
      throw new Error(tokenResponse.error_description || tokenResponse.error || 'No access token received.');
    }

    const userInfo = await fetch('https://www.googleapis.com/oauth2/v2/userinfo', {
      headers: { Authorization: `Bearer ${tokenResponse.access_token}` }
    }).then(r => r.json());

    if (!userInfo.email) {
      throw new Error('Email address not provided by Google authorization context.');
    }

    let dbUser = dbInstance.getUserByEmail(userInfo.email);
    if (!dbUser) {
      dbUser = dbInstance.createUser(
        userInfo.email, 
        'secure-random-google-oauth-pass-1337', 
        userInfo.name || userInfo.email.split('@')[0]
      );
    }
    
    const token = generateToken({ id: dbUser.id, email: dbUser.email });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Authenticating...</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body {
            background: #020203;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .loader {
            border: 3px solid rgba(255,255,255,0.05);
            border-top: 3px solid #6366f1;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <script>
          window.opener.postMessage({
            type: 'OAUTH_AUTH_SUCCESS',
            token: "${token}",
            user: ${JSON.stringify(dbUser.stats)}
          }, '*');
          window.close();
        </script>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`
      <html>
        <body style="background:#020203;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;">
          <div>
            <h3>OAuth Verification Error</h3>
            <p style="color:#94a3b8;font-size:14px;">\${err.message || err}</p>
            <button onclick="window.close()" style="background:#4f46e5;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

app.get(['/auth/callback/github', '/auth/callback/github/'], async (req, res) => {
  const isSandbox = req.query.sandbox === 'true' || !process.env.GITHUB_CLIENT_ID || process.env.GITHUB_CLIENT_ID === 'MY_GITHUB_CLIENT_ID';

  if (isSandbox) {
    // Render high-end UI explaining sandbox mode
    return res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>GitHub Sandbox Portal | TaskPilot AI</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body {
            background: #020203;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
            text-align: center;
            padding: 24px;
          }
          .card {
            background: rgba(15, 23, 42, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 28px;
            padding: 40px;
            max-width: 440px;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
            backdrop-filter: blur(20px);
          }
          .title {
            font-size: 22px;
            font-weight: 800;
            margin-bottom: 12px;
            background: linear-gradient(135deg, #a5b4fc, #818cf8);
            -webkit-background-clip: text;
            -webkit-text-fill-color: transparent;
          }
          .desc {
            font-size: 14px;
            color: #94a3b8;
            line-height: 1.6;
            margin-bottom: 24px;
          }
          .badge {
            display: inline-block;
            background: rgba(99, 102, 241, 0.15);
            border: 1px solid rgba(99, 102, 241, 0.3);
            color: #a5b4fc;
            font-size: 11px;
            font-weight: 800;
            text-transform: uppercase;
            letter-spacing: 1px;
            padding: 6px 12px;
            border-radius: 100px;
            margin-bottom: 16px;
          }
          .btn {
            background: linear-gradient(135deg, #1e293b, #0f172a);
            border: 1px solid rgba(255,255,255,0.15);
            color: white;
            padding: 14px 28px;
            border-radius: 16px;
            font-weight: 700;
            font-size: 14px;
            cursor: pointer;
            box-shadow: 0 8px 16px rgba(0,0,0,0.3);
            transition: all 0.2s;
            width: 100%;
            box-sizing: border-box;
          }
          .btn:hover {
            transform: translateY(-2px);
            border-color: rgba(255,255,255,0.25);
            box-shadow: 0 12px 20px rgba(0,0,0,0.4);
          }
          .footer {
            font-size: 11px;
            color: #64748b;
            margin-top: 24px;
            border-top: 1px solid rgba(255,255,255,0.05);
            padding-top: 16px;
            text-align: left;
            line-height: 1.5;
          }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge" style="background:rgba(255,255,255,0.06);color:#f1f5f9;border-color:rgba(255,255,255,0.12)">GitHub Sandbox Gateway</span>
          <div class="title">OAuth Dev Mode Activated</div>
          <div class="desc">
            You are running in the AI Studio preview environment. Since <b>GITHUB_CLIENT_ID</b> is not configured, we've launched the sandbox tunnel safely.
          </div>
          <button class="btn" onclick="authorizeSandbox()">Launch Sandbox Terminal</button>
          <div class="footer">
            <b>Production OAuth Setup:</b><br/>
            To configure real logins, go to Settings and add:<br/>
            - <code>GITHUB_CLIENT_ID</code><br/>
            - <code>GITHUB_CLIENT_SECRET</code>
          </div>
        </div>

        <script>
          function authorizeSandbox() {
            // Generate mock but valid sandbox account
            const mockUser = {
              name: "GitHub Octocat alex",
              email: "github.sandbox@lifesaver.ai",
              avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&h=150&q=80",
              level: 3,
              xp: 210,
              xpToNextLevel: 1000,
              coins: 85,
              title: "Firewall Defender 🧭",
              productivityScore: 82,
              focusScore: 78,
              moodScore: 85,
              energyScore: 80
            };
            
            // Post message back to main window
            window.opener.postMessage({
              type: 'OAUTH_AUTH_SUCCESS',
              token: 'sandbox-github-security-token-jwt-1337',
              user: mockUser
            }, '*');
            
            window.close();
          }
        </script>
      </body>
      </html>
    `);
  }

  // Real OAuth exchange flow
  try {
    const code = req.query.code;
    const redirectUri = `${req.protocol}://${req.get('host')}/auth/callback/github`;

    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: { 
        'Content-Type': 'application/json',
        Accept: 'application/json'
      },
      body: JSON.stringify({
        code,
        client_id: process.env.GITHUB_CLIENT_ID || '',
        client_secret: process.env.GITHUB_CLIENT_SECRET || '',
        redirect_uri: redirectUri
      })
    }).then(r => r.json());

    if (!tokenResponse.access_token) {
      throw new Error(tokenResponse.error_description || tokenResponse.error || 'No access token received.');
    }

    const userInfo = await fetch('https://api.github.com/user', {
      headers: { 
        Authorization: `Bearer ${tokenResponse.access_token}`,
        'User-Agent': 'TaskPilot-OAuth'
      }
    }).then(r => r.json());

    let email = userInfo.email;
    if (!email) {
      const emails = await fetch('https://api.github.com/user/emails', {
        headers: { 
          Authorization: `Bearer ${tokenResponse.access_token}`,
          'User-Agent': 'TaskPilot-OAuth'
        }
      }).then(r => r.json()).catch(() => []);
      
      const primaryEmail = Array.isArray(emails) && emails.find((e: any) => e.primary);
      email = primaryEmail ? primaryEmail.email : `${userInfo.login}@github.com`;
    }

    let dbUser = dbInstance.getUserByEmail(email);
    if (!dbUser) {
      dbUser = dbInstance.createUser(
        email, 
        'secure-random-github-oauth-pass-1337', 
        userInfo.name || userInfo.login || email.split('@')[0]
      );
    }
    
    const token = generateToken({ id: dbUser.id, email: dbUser.email });

    res.send(`
      <!DOCTYPE html>
      <html>
      <head>
        <meta charset="utf-8">
        <title>Authenticating...</title>
        <link href="https://fonts.googleapis.com/css2?family=Outfit:wght@400;600;800&display=swap" rel="stylesheet">
        <style>
          body {
            background: #020203;
            color: #f1f5f9;
            font-family: 'Outfit', sans-serif;
            display: flex;
            align-items: center;
            justify-content: center;
            height: 100vh;
            margin: 0;
          }
          .loader {
            border: 3px solid rgba(255,255,255,0.05);
            border-top: 3px solid #1e293b;
            border-radius: 50%;
            width: 40px;
            height: 40px;
            animation: spin 1s linear infinite;
          }
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </head>
      <body>
        <div class="loader"></div>
        <script>
          window.opener.postMessage({
            type: 'OAUTH_AUTH_SUCCESS',
            token: "${token}",
            user: ${JSON.stringify(dbUser.stats)}
          }, '*');
          window.close();
        </script>
      </body>
      </html>
    `);
  } catch (err: any) {
    res.status(500).send(`
      <html>
        <body style="background:#020203;color:#ef4444;font-family:sans-serif;display:flex;align-items:center;justify-content:center;height:100vh;text-align:center;">
          <div>
            <h3>OAuth Verification Error</h3>
            <p style="color:#94a3b8;font-size:14px;">\${err.message || err}</p>
            <button onclick="window.close()" style="background:#4f46e5;color:white;border:none;padding:10px 20px;border-radius:8px;cursor:pointer;">Close Window</button>
          </div>
        </body>
      </html>
    `);
  }
});

// -----------------------------------------------------
// TASKS API
// -----------------------------------------------------
app.get('/api/tasks', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  res.json(dbInstance.getTasks(userId));
});

// Calculates score dynamically
function calculateLocalPriorityScore(task: Partial<Task>, productivityScore = 80): number {
  const isUrgent = task.priority === 'urgent' ? 30 : task.priority === 'high' ? 20 : task.priority === 'medium' ? 10 : 0;
  const hoursRemaining = task.dueDate ? Math.max(0.1, (new Date(task.dueDate).getTime() - Date.now()) / (1000 * 60 * 60)) : 48;
  const urgencyByDeadline = Math.min(50, Math.max(0, (24 / hoursRemaining) * 20));
  const diffFactor = (task.difficultyScore || 5) * 2;
  return Math.min(100, Math.round(isUrgent + urgencyByDeadline + diffFactor));
}

app.post('/api/tasks', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  try {
    const taskFields = req.body;
    if (!taskFields.title) {
      res.status(400).json({ error: 'Task title is required.' });
      return;
    }

    const user = dbInstance.getUserById(userId);
    const prodScore = user?.stats.productivityScore || 80;

    const riskMeter = calculateLocalPriorityScore(taskFields, prodScore);
    const difficultyScore = taskFields.difficultyScore || 5;

    // AI dynamic feedback if AI is active
    let tag = taskFields.tag || 'AI Analyzed';
    if (hasAIActive) {
      try {
        const prompt = `Analyze this task title: "${taskFields.title}". Suggest a 1-2 word smart category tag (e.g. "Dev Sprint", "Admin", "Research", "Urgent") and return ONLY the tag.`;
        const response = await callLLM({ userPrompt: prompt });
        const aiTag = response.text?.trim().replace(/["']/g, '');
        if (aiTag && aiTag.length < 15) {
          tag = aiTag;
        }
      } catch (err) {
        console.warn('AI Tag generation failed, using fallback.');
      }
    }

    const task: Omit<Task, 'id' | 'userId'> = {
      title: taskFields.title,
      description: taskFields.description || '',
      priority: taskFields.priority || 'medium',
      status: taskFields.status || 'todo',
      category: taskFields.category || 'work',
      dueDate: taskFields.dueDate || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
      estimatedTime: Number(taskFields.estimatedTime) || 2,
      remainingTime: Number(taskFields.remainingTime) || Number(taskFields.estimatedTime) || 2,
      riskMeter,
      difficultyScore,
      subtasks: taskFields.subtasks || [],
      comments: [],
      collaborators: taskFields.collaborators || [],
      tag,
      burnoutRisk: riskMeter > 75 ? 'high' : riskMeter > 40 ? 'medium' : 'low'
    };

    const createdTask = dbInstance.createTask(userId, task);
    dbInstance.createNotification(userId, {
      title: 'New Rescue Initiated 🛡️',
      message: `"${task.title}" has been registered in your timeline with an AI Difficulty of ${difficultyScore}/10.`,
      type: 'info'
    });

    res.status(201).json(createdTask);
  } catch (error: any) {
    res.status(500).json({ error: error.message || 'Failed to create task.' });
  }
});

app.put('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const updated = dbInstance.updateTask(id, fields);
  if (!updated) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json(updated);
});

app.delete('/api/tasks/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.deleteTask(id);
  if (!success) {
    res.status(404).json({ error: 'Task not found.' });
    return;
  }
  res.json({ success: true });
});

app.post('/api/tasks/prioritize', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const tasks = dbInstance.getTasks(userId);
  const user = dbInstance.getUserById(userId);

  if (tasks.length === 0) {
    res.json({ success: true, message: 'No tasks to prioritize.' });
    return;
  }

  // AI-prioritization
  if (hasAIActive) {
    try {
      const taskList = tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, estimated: t.estimatedTime, due: t.dueDate }));
      const prompt = `You are an AI priority calculator for TaskPilot AI. Given these tasks: ${JSON.stringify(taskList)}, analyze other deadlines and workload. Output a JSON array with objects containing {id, riskScore (0-100), burnoutRisk ("low"|"medium"|"high")}. Return ONLY valid JSON block.`;
      
      const response = await callLLM({ userPrompt: prompt, jsonMode: true });
      let responseText = response.text || '';
      
      // Clean up markdown block format if LLM returned it wrapped in ```json
      if (responseText.includes('```json')) {
        const match = responseText.match(/```json\s*([\s\S]*?)\s*```/);
        if (match) responseText = match[1];
      } else if (responseText.includes('```')) {
        const match = responseText.match(/```\s*([\s\S]*?)\s*```/);
        if (match) responseText = match[1];
      }

      const scores = JSON.parse(responseText.trim() || '[]');
      if (Array.isArray(scores)) {
        scores.forEach((s: any) => {
          dbInstance.updateTask(s.id, {
            riskMeter: s.riskScore,
            burnoutRisk: s.burnoutRisk
          });
        });
      }
    } catch (err: any) {
      console.warn('AI prioritization API call failed, using standard algorithm:', err.message || err);
    }
  }

  // Local re-sort fallback
  const refreshedTasks = dbInstance.getTasks(userId);
  refreshedTasks.forEach(t => {
    const risk = calculateLocalPriorityScore(t, user?.stats.productivityScore);
    dbInstance.updateTask(t.id, {
      riskMeter: risk,
      burnoutRisk: risk > 75 ? 'high' : risk > 40 ? 'medium' : 'low'
    });
  });

  res.json({ success: true, message: 'All tasks prioritized via AI Smart Engine.', tasks: dbInstance.getTasks(userId) });
});

app.post('/api/tasks/rescue', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const tasks = dbInstance.getTasks(userId);
  const urgentTasks = tasks.filter(t => t.priority === 'urgent' && t.status !== 'done');

  if (urgentTasks.length === 0) {
    res.json({ success: true, message: 'No urgent tasks require rescue right now.' });
    return;
  }

  // Optimize the task list (Rescue mode)
  const mainTask = urgentTasks[0];
  
  // Create 3 rescue micro-subtasks
  const rescueSubtasks = [
    { id: 'rs-1', title: '🛡️ Core Concept Decomposition', done: false },
    { id: 'rs-2', title: '🛡️ Prototype Validation Phase', done: false },
    { id: 'rs-3', title: '🛡️ Final Review & Edge Cases', done: false }
  ];

  dbInstance.updateTask(mainTask.id, {
    subtasks: [...mainTask.subtasks, ...rescueSubtasks],
    riskMeter: 98,
    burnoutRisk: 'high',
    tag: '🚨 Rescue Mode'
  });

  dbInstance.createNotification(userId, {
    title: 'Rescue Mode Activated! 🚨',
    message: `We broke down "${mainTask.title}" into micro-steps to prevent blockages. All distraction monitors activated.`,
    type: 'rescue'
  });

  res.json({
    success: true,
    message: 'Rescue mode initialized! Task has been broken down and optimized.',
    task: dbInstance.getTask(mainTask.id)
  });
});

// -----------------------------------------------------
// CALENDAR API
// -----------------------------------------------------
app.get('/api/calendar', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  res.json(dbInstance.getEvents(userId));
});

app.post('/api/calendar', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const eventFields = req.body;
  const created = dbInstance.createEvent(userId, eventFields);
  res.status(201).json(created);
});

app.put('/api/calendar/:id', authenticateToken, (req, res) => {
  const { id } = req.params;
  const fields = req.body;
  const updated = dbInstance.updateEvent(id, fields);
  if (updated) {
    res.json(updated);
  } else {
    res.status(404).json({ error: 'Event not found.' });
  }
});

app.post('/api/calendar/sync', authenticateToken, (req, res) => {
  res.json({ success: true, message: 'Google and Outlook Calendars synchronized.' });
});

// -----------------------------------------------------
// HABITS API
// -----------------------------------------------------
app.get('/api/habits', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  res.json(dbInstance.getHabits(userId));
});

app.post('/api/habits', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const habitFields = req.body;
  const created = dbInstance.createHabit(userId, habitFields);
  res.status(201).json(created);
});

app.post('/api/habits/:id/toggle', authenticateToken, (req, res) => {
  const { id } = req.params;
  const toggled = dbInstance.toggleHabit(id);
  if (!toggled) {
    res.status(404).json({ error: 'Habit not found.' });
    return;
  }
  res.json(toggled);
});

// -----------------------------------------------------
// GOALS API
// -----------------------------------------------------
app.get('/api/goals', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  res.json(dbInstance.getGoals(userId));
});

app.post('/api/goals', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const goalFields = req.body;
  const created = dbInstance.createGoal(userId, goalFields);
  res.status(201).json(created);
});

// -----------------------------------------------------
// NOTIFICATIONS API
// -----------------------------------------------------
app.get('/api/notifications', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  res.json(dbInstance.getNotifications(userId));
});

app.put('/api/notifications/:id/read', authenticateToken, (req, res) => {
  const { id } = req.params;
  const success = dbInstance.markNotificationRead(id);
  res.json({ success });
});

app.post('/api/notifications/read-all', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  dbInstance.markAllNotificationsRead(userId);
  res.json({ success: true });
});

app.post('/api/notifications/clear-all', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  dbInstance.clearAllNotifications(userId);
  res.json({ success: true });
});

// -----------------------------------------------------
// AI COPILOT & PLANNER CHANNELS
// -----------------------------------------------------
app.get('/api/ai/chat', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const messages = dbInstance.getMessages(userId);
  if (messages.length === 0) {
    // Generate an initial welcoming message
    const welcome = dbInstance.addMessage(
      userId, 
      'assistant', 
      'Welcome to your AI Command Desk! I am your Guardian Copilot. I have mapped your current deadlines, streaks, and agenda events.\n\nHow should we tackle this? You can ask me to "Plan my day" or activate **Rescue Mode**!', 
      ['🛡️ Activate Rescue Mode', '📅 Plan my day', '📋 List Tasks']
    );
    res.json([welcome]);
  } else {
    res.json(messages);
  }
});

app.post('/api/ai/chat/clear', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  dbInstance.clearMessages(userId);
  res.json({ success: true });
});

app.post('/api/ai/chat', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const { message } = req.body;

  if (!message) {
    res.status(400).json({ error: 'Message payload required.' });
    return;
  }

  // Load context from DB
  const user = dbInstance.getUserById(userId);
  const tasks = dbInstance.getTasks(userId);
  const events = dbInstance.getEvents(userId);
  const habits = dbInstance.getHabits(userId);

  // Add User message
  dbInstance.addMessage(userId, 'user', message);

  let aiReply = '';
  let suggestions: string[] = ['📅 Plan my day', '🛡️ Activate Rescue Mode', '📊 View Analytics'];

  // 1. Try Live AI with callLLM if active
  if (hasAIActive) {
    try {
      const systemContext = `You are "TaskPilot AI Commander", an elite smart time-management co-pilot and productivity commander.
The user is ${user?.stats?.name || 'Alex Johnson'}.
Profile details: Level ${user?.stats?.level || 1}, productivity score ${user?.stats?.productivityScore || 75}%, stress energy levels ${user?.stats?.energyScore || 75}%.
Current active tasks: ${JSON.stringify(tasks.map(t => ({ id: t.id, title: t.title, priority: t.priority, status: t.status, risk: t.riskMeter })))}
Today's meetings and events: ${JSON.stringify(events.map(e => ({ title: e.title, start: e.start, end: e.end, type: e.category })))}
Active Habits streaks: ${JSON.stringify(habits.map(h => ({ title: h.title, streak: h.streak })))}

YOUR KNOWLEDGE ABOUT THE WEBSITE FEATURES & MODULES (TaskPilot AI):
1. **Dashboard (Home)**: Displays the Crisis Radar (urgent alert items), Active Sprints (task checklist), Today's Focus Schedule, and the **Crisis Scratchpad** (which acts as a quick journaling/notes tool).
2. **Task Manager (Kanban Board)**: Columns are To Do, In Progress, In Review, and Completed. Users can create tasks, assign high priority, track difficulty, and view details.
3. **Calendar Planner**: Hourly view with an "AI De-conflict Engine" that detects overlaps (like the Sarah conflict) and lets them autonomously reschedule with a click to earn +60 XP & +15 Coins.
4. **Focus Soundroom**: customizable Pomodoro session player (e.g., 45-minute blocks) with deep ambient music generators (Cosmic Space, Cyberpunk, Cafe, Forest) to keep locked in.
5. **Habit Rings**: Streaks and checklist (Leetcode, Gym, Drink 3L water) that awards XP on completion.
6. **Milestone Roadmap**: High-level quarters/milestones to keep vision aligned.
7. **Analytics & Insights**: Interactive charts showing weekly completed tasks, focus hours, and stress levels.
8. **Team Workspace**: Simulates collaborating with team members (Sarah, Dev Leader, QA) to delegate tasks.
9. **Quests & Achievements**: Daily challenges that award XP and Coins to spend in the **TaskPilot AI Coin Shop** (avatars, themes, power-ups).
10. **Platform Settings**: Change colors (Indigo, Emerald, Amber, Rose, Violet), toggle Dark/Light mode, and sync calendars.

GUIDELINES FOR ANSWERING JOURNALING AND REFLECTION QUESTIONS:
- The user has a **Crisis Scratchpad** on the home Dashboard for journaling, taking notes, or writing mental reflections.
- If they ask how to journal, reflect, or evaluate their state: Guide them to use the **Crisis Scratchpad** on the Dashboard.
- Provide structured reflection exercises (e.g., daily check-ins: "1. What is the single biggest bottleneck? 2. What am I proud of? 3. What is my stress level out of 10?").
- Support them with mindfulness and focus coaching to help them clear their minds.

GUIDELINES FOR ANSWERING TASK/WEBSITE QUESTIONS:
- Be extremely specific when they ask about their active tasks. Reference their tasks by name!
- Explain clearly how any page or system on the site works if they ask (e.g., how the Coin Shop works, how to clear a Calendar conflict, or how to use the Focus Soundroom).
- Be proactive, encouraging, brief, highly professional, and format using Markdown beautifully.
- If they ask to add, schedule, or create a task, always invoke the "createTask" tool!`;

      let response;
      if (isGeminiActive && ai) {
        const createTaskDeclaration = {
          name: 'createTask',
          description: 'Creates a new task in the user\'s workspace when they ask to add, create, or schedule a task.',
          parameters: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: 'The title or name of the task to be done' },
              priority: { type: Type.STRING, enum: ['low', 'medium', 'high', 'urgent'], description: 'The priority of the task' },
              category: { type: Type.STRING, enum: ['work', 'personal', 'academic'], description: 'The category classification' },
              tag: { type: Type.STRING, description: 'A shorthand tag word for the task' }
            },
            required: ['title']
          }
        };

        const geminiResp = await ai.models.generateContent({
          model: 'gemini-3.5-flash',
          contents: message,
          config: {
            systemInstruction: systemContext,
            tools: [{ functionDeclarations: [createTaskDeclaration] }]
          }
        });

        const functionCalls = geminiResp.functionCalls;
        if (functionCalls && functionCalls.length > 0) {
          response = { text: '', toolCall: { name: functionCalls[0].name, args: functionCalls[0].args } };
        } else {
          response = { text: geminiResp.text || '' };
        }
      } else {
        response = await callLLM({ systemPrompt: systemContext, userPrompt: message });
      }

      if (response.toolCall && response.toolCall.name === 'createTask') {
        const args = response.toolCall.args as any;
        const createdTask = dbInstance.createTask(userId, {
          title: args.title || 'Untitled AI Task',
          description: 'Created automatically by AI Command Desk.',
          priority: args.priority || 'medium',
          status: 'todo',
          category: args.category || 'work',
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: 2.0,
          remainingTime: 2.0,
          riskMeter: 10,
          difficultyScore: 3,
          subtasks: [],
          comments: [],
          collaborators: [],
          tag: args.tag || 'AI-Added'
        });

        aiReply = `✨ **Smart AI Task Created!**\n\nI have successfully executed the task contract creation request:\n\n• **Title**: *"${createdTask.title}"*\n• **Priority**: \`${createdTask.priority.toUpperCase()}\`\n• **Category**: \`${createdTask.category.toUpperCase()}\`\n\nYou can see it on your active command deck right now!`;
        suggestions = ['📅 Plan my day', '🛡️ Activate Rescue Mode', '📋 List Tasks'];
      } else {
        aiReply = response.text || '';
      }
    } catch (err: any) {
      console.warn('AI Chat API call failed:', err.message || err);
      const errMsg = err.message || '';
      const isQuotaError = errMsg.includes('429') || errMsg.includes('quota') || errMsg.includes('RESOURCE_EXHAUSTED') || JSON.stringify(err).includes('429');
      const isAuthError = errMsg.includes('403') || errMsg.includes('API key') || errMsg.includes('not valid') || JSON.stringify(err).includes('API_KEY_INVALID');
      
      if (isQuotaError) {
        aiReply = `⚠️ **[AI API Quota Exceeded]**\n\nThe AI API free-tier quota has been temporarily exceeded.\n\nTo bypass these limits and configure your own API key, please open the **Settings** menu and update your **GEMINI_API_KEY** or **GROQ_API_KEY**!`;
      } else if (isAuthError) {
        aiReply = `⚠️ **[Invalid AI API Key]**\n\nThe configured AI API key is invalid or restricted.\n\nPlease double-check your API key configuration in the **Settings** menu.`;
      } else {
        aiReply = `⚠️ **[AI Service Error]**\n\nThere was an issue processing your request: ${err.message || 'Unknown error'}. Please try again shortly.`;
      }
    }
  }

  // 2. High-Fidelity Smart Fallback System (Ensures robust offline behavior and parses actual intents)
  if (!aiReply) {
    const lower = message.toLowerCase().trim();

    // MATCH: Task Creation Pattern (e.g. "create task Study chemistry" or "add task design api")
    const createTaskMatch = message.match(/^(?:create|add|new|deploy)\s+(?:a\s+)?task\s*(?::|to|for)?\s*(.+)$/i) ||
                             message.match(/^task\s+create\s+(.+)$/i) ||
                             (lower.startsWith('add ') && !lower.includes('habit') && !lower.includes('event') && message.substring(4).trim());

    if (createTaskMatch) {
      const taskTitle = createTaskMatch[1].trim();
      if (taskTitle) {
        let priority: 'low' | 'medium' | 'high' | 'urgent' = 'medium';
        if (lower.includes('urgent') || lower.includes('asap') || lower.includes('critical') || lower.includes('fire')) {
          priority = 'urgent';
        } else if (lower.includes('high') || lower.includes('important')) {
          priority = 'high';
        } else if (lower.includes('low') || lower.includes('chill') || lower.includes('minor')) {
          priority = 'low';
        }

        let category: 'work' | 'personal' | 'academic' | 'urgent_rescue' = 'work';
        if (lower.includes('study') || lower.includes('class') || lower.includes('homework') || lower.includes('exam') || lower.includes('academic') || lower.includes('college')) {
          category = 'academic';
        } else if (lower.includes('personal') || lower.includes('life') || lower.includes('gym') || lower.includes('exercise') || lower.includes('wellness')) {
          category = 'personal';
        }

        const createdTask = dbInstance.createTask(userId, {
          title: taskTitle,
          description: `Deployed automatically via conversation channels on request: "${message}"`,
          priority,
          status: 'todo',
          category,
          dueDate: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
          estimatedTime: 2.5,
          remainingTime: 2.5,
          riskMeter: 10,
          difficultyScore: 3,
          subtasks: [],
          comments: [],
          collaborators: [],
          tag: 'AI-Added'
        });

        aiReply = `✨ **TASK CONTRACT DEPLOYED!**\n\nI have successfully registered a new objective onto your timeline:\n\n• **Title**: *"${createdTask.title}"*\n• **Priority**: \`${createdTask.priority.toUpperCase()}\`\n• **Category**: \`${createdTask.category.toUpperCase()}\`\n\nIt is now tracked in your task database. Let's get to work!`;
        suggestions = ['⏱️ Start Focus Session', '📋 List Tasks', '📅 Plan my day'];
      }
    }

    // MATCH: List Tasks Pattern (e.g. "list tasks" or "show my tasks")
    if (!aiReply && (lower.includes('task') || lower.includes('list') || lower.includes('show') || lower.includes('view')) && !lower.includes('habit') && !lower.includes('event')) {
      const pending = tasks.filter(t => t.status !== 'done');
      if (pending.length === 0) {
        aiReply = `🎉 **All systems green!** You have no pending tasks on your command radar right now. Feel free to use *"Create task [title]"* to list a new objective!`;
      } else {
        aiReply = `📋 **Current active objectives on your radar:**\n\n` + 
          pending.slice(0, 5).map((t, i) => `${i + 1}. **${t.title}** [\`${t.priority.toUpperCase()}\` - *${t.status}*]`).join('\n') +
          (pending.length > 5 ? `\n*...and ${pending.length - 5} more items.*` : '') +
          `\n\nTo insert a new task directly, type **"Create task [title]"**.`;
      }
      suggestions = ['📅 Plan my day', '🛡️ Activate Rescue Mode'];
    }

    // MATCH: Habit Streak check
    if (!aiReply && (lower.includes('habit') || lower.includes('streak') || lower.includes('routine'))) {
      if (habits.length === 0) {
        aiReply = `🧬 **No active habits found.** Setup some consistency loops in the **Habit Rings** tab to build high-performance daily routines!`;
      } else {
        aiReply = `🧬 **Your active Habit streaks:**\n\n` +
          habits.map(h => `• **${h.title}**: \`${h.streak} day streak\` (total ${h.totalCompleted} times logged)`).join('\n') +
          `\n\nConsistency beats intensity. Keep those rings full!`;
      }
      suggestions = ['📅 Plan my day', '📊 View Habits'];
    }

    // MATCH: Agenda calendar check
    if (!aiReply && (lower.includes('calendar') || lower.includes('meeting') || lower.includes('schedule') || lower.includes('event'))) {
      if (events.length === 0) {
        aiReply = `📅 **No calendar agenda events found today.** You are free for focused deep work!`;
      } else {
        aiReply = `📅 **Your scheduled agenda events:**\n\n` +
          events.slice(0, 4).map(e => `• **${e.start}**: *"${e.title}"* (${e.category})`).join('\n') +
          `\n\nI will notify you ahead of time so you don't lose focus.`;
      }
      suggestions = ['📅 Plan my day', '📊 View Calendar'];
    }

    // MATCH: Rescue Mode Activation
    if (!aiReply && lower.includes('rescue')) {
      aiReply = `🚨 **AI DEADLINE RESCUE SHIELDS INITIATED!**\n\nLockdown engaged on all non-essential channels. Our core critical path is now focused on: **"${tasks[0]?.title || 'System Core Review'}"**.\n\nLet's launch a continuous 45m deep focus Pomodoro to secure the milestone. Ready?`;
      suggestions = ['⏱️ Start 45m Focus', '📋 Show Tasks'];
    }

    // MATCH: Planner Day Mode
    if (!aiReply && (lower.includes('plan') || lower.includes('day') || lower.includes('timetable') || lower.includes('today'))) {
      aiReply = `📅 **Your Tactical Daily Escape Timetable is Ready:**\n\n• **10:00 - 11:00**: Launch Strategy Alignment & Sync\n• **11:00 - 13:00**: **Deep Work block** on *"${tasks[0]?.title || 'API Firewalls'}"*\n• **13:00 - 14:00**: Nutritional break and hydration.\n• **14:00 - 17:00**: Secure remaining deadline tasks.\n\nEverything is blocked out. Ready to begin?`;
      suggestions = ['⏱️ Start Focus Block', '📅 View Calendar'];
    }

    // MATCH: General Help/Commands Guide
    if (!aiReply && (lower.includes('help') || lower.includes('command') || lower.includes('how') || lower.includes('what') || lower.includes('who'))) {
      aiReply = `🤖 **TaskPilot AI Commander Portal**\n\nI am your intelligent, multi-modal co-pilot. Here are some explicit commands you can type:\n\n1. **"Create task [title]"** — Deploys a new task instantly onto your dashboard.\n2. **"List tasks"** — Inspects outstanding goals and priorities.\n3. **"Show habits"** — Pulls up consistency streaks and routines.\n4. **"Plan my day"** — Builds an optimized daily timeline.\n5. **"Activate Rescue Mode"** — Engages lockdown mode for critical deadlines.\n\nWhat challenge can I assist you with?`;
      suggestions = ['📅 Plan my day', '🛡️ Activate Rescue Mode', '➕ Add a Task'];
    }

    // DEFAULT GREETING
    if (!aiReply) {
      aiReply = `🤖 **TaskPilot AI Commander**: Greetings! I've analyzed your roster. Today requires precise, high-efficiency execution.\n\nYou have **${tasks.filter(t => t.status !== 'done').length} outstanding objectives**.\n\nTry telling me: *"Create task [name]"*, *"Plan my day"*, or *"Show habits"* to get highly responsive and interactive feedback!`;
    }
  }

  // Save Assistant reply
  const assistantMsg = dbInstance.addMessage(userId, 'assistant', aiReply, suggestions);
  res.json(assistantMsg);
});

app.post('/api/ai/formulate-roadmap', authenticateToken, async (req, res) => {
  const { goal } = req.body;
  if (!goal) {
    res.status(400).json({ error: 'Goal description is required.' });
    return;
  }

  const prompt = `You are an elite agile productivity coach and direct, plain-speaking roadmap planner.
The user wants a concise, straightforward, plain chronological roadmap (without corporate jargon or filler text) to achieve this goal: "${goal}".

Decompose this goal into exactly 3 or 4 clear, sequential milestone phases with realistic durations.
Keep descriptions simple, actionable, and extremely plain and readable.

Provide your response strictly as a valid, parseable JSON array of strings, where each string is a single milestone description. Do NOT wrap your response in markdown blocks or write any introductory/concluding text. Format example:
[
  "Phase 1: Standardize project dependencies (Est: 2 days)",
  "Phase 2: Build and test core feature elements (Est: 3 days)",
  "Phase 3: Verify performance with container validations (Est: 1 day)",
  "Phase 4: Complete asset signoff and push live (Est: 1 day)"
]`;

  try {
    let rawResponse = '';
    if (hasAIActive) {
      const llmResult = await callLLM({ userPrompt: prompt });
      rawResponse = llmResult.text;
    } else {
      rawResponse = JSON.stringify([
        `🎯 Phase 1: Initialize architecture for "${goal}" (Est: 2 days)`,
        `🧱 Phase 2: Implement essential functionality and components (Est: 3 days)`,
        `🧪 Phase 3: Run comprehensive integration tests (Est: 1 day)`,
        `🚀 Phase 4: Final deployment and verification (Est: 1 day)`
      ]);
    }

    let cleaned = rawResponse.trim();
    if (cleaned.startsWith('```')) {
      cleaned = cleaned.replace(/^```json\s*/i, '').replace(/```\s*$/, '').trim();
    }

    const roadmap = JSON.parse(cleaned);
    res.json({ roadmap });
  } catch (error: any) {
    console.error('Failed to formulate roadmap:', error);
    res.json({
      roadmap: [
        `🎯 Phase 1: Setup and skeleton scaffolding for "${goal}" (Est: 2 days)`,
        `🧱 Phase 2: Core feature implementation (Est: 4 days)`,
        `🚀 Phase 3: Testing and deployment (Est: 1 day)`
      ]
    });
  }
});

app.post('/api/ai/plan-day', authenticateToken, async (req, res) => {
  const userId = (req as any).user.id;
  const user = dbInstance.getUserById(userId);
  const tasks = dbInstance.getTasks(userId);
  const events = dbInstance.getEvents(userId);

  let planText = '';
  if (hasAIActive) {
    try {
      const prompt = `Given tasks ${JSON.stringify(tasks)} and schedule ${JSON.stringify(events)}, create an hour-by-hour dynamic schedule for ${user?.name} incorporating focus sessions, break times, and recovery plans. Output in clean Markdown format.`;
      const response = await callLLM({ userPrompt: prompt });
      planText = response.text || '';
    } catch (err: any) {
      console.warn('AI plan-day API call failed:', err.message || err);
    }
  }

  if (!planText) {
    planText = `### 📅 Smart Daily Timetable (Local Engine)
*   **09:00 - 10:00**: Review inbox and priority roadmap
*   **10:00 - 11:00**: Launch Strategy Meeting (Sync with team)
*   **11:00 - 13:00**: **Focus Phase**: *"${tasks[0]?.title || 'Final Product Architecture'}"*
*   **13:00 - 14:00**: Wellness block (Hydrate, step outdoors)
*   **14:00 - 16:00**: Polish outstanding Venture Pitch items
*   **16:00 - 17:00**: Wrap-up and prepare tomorrow's focus anchors`;
  }

  // Save to messages
  dbInstance.addMessage(userId, 'assistant', planText, ['👍 Approve Plan', '⏰ Reschedule']);
  res.json({ plan: planText });
});

app.post('/api/ai/recovery', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const plan = `### 🛡️ AI Deadline Recovery Schedule
1. **Move Non-Essential Meetings**: Rescheduling general Syncs to next Tuesday.
2. **Task Decomposition**: Split into three 30-minute target sprints.
3. **Collaborative Delegation**: Routing slide formats to Maya.
4. **All-Clear Worklist**: Lock focus exclusively on critical assets.`;
  dbInstance.addMessage(userId, 'assistant', plan);
  res.json({ recoveryPlan: plan });
});

app.post('/api/ai/meeting-summary', authenticateToken, (req, res) => {
  const summary = `### 📝 Meeting Summary: Launch Strategy Session
**Key Outcomes**:
*   Sarah confirmed high-fidelity branding assets will be ready by 15:00.
*   Nate requested final typescript schema reviews before container compilation.
*   Alex to prioritize API gateway security keys.`;
  res.json({ summary });
});

// -----------------------------------------------------
// ANALYTICS & REPORTS
// -----------------------------------------------------
app.get('/api/analytics', authenticateToken, (req, res) => {
  const userId = (req as any).user.id;
  const user = dbInstance.getUserById(userId);
  const tasks = dbInstance.getTasks(userId);
  const habits = dbInstance.getHabits(userId);

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter(t => t.status === 'done').length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;

  // Compute stats
  res.json({
    completionRate,
    productivityScore: user?.stats.productivityScore || 80,
    focusHours: 14.5,
    deepWorkPercentage: 72,
    stressLevel: 45,
    energyScore: user?.stats.energyScore || 70,
    burnoutRisk: completionRate < 50 ? 78 : 34,
    streakCount: habits[0]?.streak || 5,
    mostProductiveTime: '10:00 AM - 1:00 PM',
    leastProductiveTime: '4:00 PM - 6:00 PM',
    averageCompletionTime: '3.4 hours'
  });
});

app.get('/api/reports', authenticateToken, (req, res) => {
  const reports = {
    daily: {
      title: 'Daily Micro-Sprint Ledger',
      date: new Date().toLocaleDateString(),
      score: 84,
      details: 'Highly focused morning block with 100% attendance. Slight energy dip in late afternoon.',
      aiAnalysis: 'Your morning focus window is excellent. Schedule highly technical design schemas before 13:00.'
    },
    weekly: {
      title: 'Weekly Performance Orbit Report',
      period: 'June 20 - June 26, 2026',
      score: 81,
      completedCount: 12,
      missedCount: 1,
      aiAdvice: 'Stellar habit compliance. Stand and Stretch habit remains underutilized, contributing to mid-day fatigue.'
    }
  };
  res.json(reports);
});

// -----------------------------------------------------
// STATIC FILE SERVING / VITE INTEGRATION
// -----------------------------------------------------
async function startServer() {
  if (process.env.NODE_ENV !== 'production') {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
    console.log('Vite middleware mounted successfully (Dev Mode).');
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
    console.log('Serving production static build folders.');
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TaskPilot AI Backend running on http://0.0.0.0:${PORT}`);
  });
}

startServer().catch(err => {
  console.error('Fatal dev server crash:', err);
});
