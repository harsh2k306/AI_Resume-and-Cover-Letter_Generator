# Resume & Cover Letter Generator - Free AI Backend

This backend uses multiple **free** AI services to generate professional resumes and cover letters.

## Free AI Services Used

### 1. Hugging Face (Completely Free)
- Uses multiple free models: DialoGPT-medium, GPT-2, and Flan-T5
- No cost, just requires a free Hugging Face account
- Set your token as environment variable: `HF_API_TOKEN`

### 2. OpenAI Free Tier (Optional)
- Uses GPT-3.5-turbo with free tier limits
- Set your OpenAI API key as environment variable: `OPENAI_API_KEY`
- Limited but high quality

### 3. Template Fallback (Always Available)
- Simple template-based generation when AI services fail
- Ensures the app always works

## Setup Instructions

1. **Get Hugging Face Token (Free)**:
   - Go to https://huggingface.co/
   - Create a free account
   - Go to Settings → Access Tokens
   - Create a new token
   - Set as environment variable: `HF_API_TOKEN=your_token_here`

2. **Get OpenAI API Key (Optional)**:
   - Go to https://platform.openai.com/
   - Create a free account
   - Get your API key
   - Set as environment variable: `OPENAI_API_KEY=your_key_here`

3. **Install Dependencies**:
   ```bash
   pip install -r requirements.txt
   ```

4. **Run the Server**:
   ```bash
   python app.py
   ```

## Cost Breakdown

- **Hugging Face**: $0 (completely free)
- **OpenAI Free Tier**: $0 (limited usage)
- **Template Fallback**: $0 (local processing)

**Total Cost: $0** 🎉

## API Endpoints

- `POST /generate` - Generate resume and cover letter
- `GET /health` - Check available AI services

## Environment Variables

```bash
HF_API_TOKEN=your_huggingface_token
OPENAI_API_KEY=your_openai_key  # Optional
```

## Features

✅ **Multiple AI Services** - Redundancy and better results  
✅ **Completely Free** - No costs involved  
✅ **Fallback System** - Always works even if AI fails  
✅ **Better Prompts** - Improved AI generation quality  
✅ **Health Monitoring** - Check service availability 
