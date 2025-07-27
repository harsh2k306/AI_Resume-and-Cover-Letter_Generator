import os
from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import openai

app = Flask(__name__)
CORS(app)

# Multiple free AI service configurations
# 1. Hugging Face - Better free models
HF_MODELS = [
    "https://api-inference.huggingface.co/models/microsoft/DialoGPT-medium",
    "https://api-inference.huggingface.co/models/gpt2",
    "https://api-inference.huggingface.co/models/google/flan-t5-base"
]
HF_TOKEN = os.getenv('HF_API_TOKEN', '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')
HF_HEADERS = {"Authorization": f"Bearer {HF_TOKEN}"}

# 2. OpenAI free tier (limited but available)
OPENAI_API_KEY = os.getenv('OPENAI_API_KEY', '')  # Set your free API key
if OPENAI_API_KEY:
    openai.api_key = OPENAI_API_KEY

# 3. Alternative free AI services
FREE_AI_SERVICES = {
    "huggingface": True,
    "openai": bool(OPENAI_API_KEY),
    "local_fallback": True  # Simple template-based fallback
}

def query_huggingface(prompt, model_index=0):
    """Query Hugging Face with fallback to different models"""
    for i in range(len(HF_MODELS)):
        try:
            model_url = HF_MODELS[i]
            payload = {"inputs": prompt}
            response = requests.post(model_url, headers=HF_HEADERS, json=payload, timeout=30)
            response.raise_for_status()
            result = response.json()
            
            # Handle different response formats
            if isinstance(result, list) and len(result) > 0:
                if 'generated_text' in result[0]:
                    return result[0]['generated_text']
                elif 'summary_text' in result[0]:
                    return result[0]['summary_text']
            elif isinstance(result, dict):
                if 'generated_text' in result:
                    return result['generated_text']
                elif 'summary_text' in result:
                    return result['summary_text']
            
            return str(result)
        except Exception as e:
            print(f"HF Model {i} failed: {e}")
            continue
    return None

def query_openai(prompt):
    """Query OpenAI's free tier"""
    if not OPENAI_API_KEY:
        return None
    
    try:
        response = openai.ChatCompletion.create(
            model="gpt-3.5-turbo",  # Free tier model
            messages=[
                {"role": "system", "content": "You are a professional resume and cover letter writer."},
                {"role": "user", "content": prompt}
            ],
            max_tokens=500,
            temperature=0.7
        )
        return response.choices[0].message.content
    except Exception as e:
        print(f"OpenAI failed: {e}")
        return None

def generate_fallback_template(data, document_type):
    """Simple template-based fallback when AI services fail"""
    if document_type == "resume":
        return f"""
{data.get('name', 'Your Name')}
{data.get('email', 'your.email@example.com')}

SKILLS
{data.get('skills', 'Your skills here')}

EXPERIENCE
{data.get('experience', 'Your experience here')}

CAREER GOALS
{data.get('goals', 'Your career goals here')}
        """.strip()
    else:  # cover letter
        return f"""
Dear Hiring Manager,

I am writing to express my interest in the {data.get('job_role', 'position')} role. With my background in {data.get('skills', 'relevant skills')} and experience in {data.get('experience', 'relevant experience')}, I believe I would be a valuable addition to your team.

{data.get('goals', 'Your career goals and motivation here')}

Thank you for considering my application.

Sincerely,
{data.get('name', 'Your Name')}
        """.strip()

def generate_with_ai(prompt, data, document_type):
    """Try multiple AI services with fallback"""
    # Try Hugging Face first (completely free)
    result = query_huggingface(prompt)
    if result:
        return result
    
    # Try OpenAI if available
    if FREE_AI_SERVICES["openai"]:
        result = query_openai(prompt)
        if result:
            return result
    
    # Fallback to template
    return generate_fallback_template(data, document_type)

# Improved prompts for better results
RESUME_PROMPT = """
Create a professional resume for:
Name: {name}
Email: {email}
Target Job: {job_role}
Skills: {skills}
Experience: {experience}
Career Goals: {goals}

Format as a clean, professional resume with sections for Contact Information, Skills, Experience, and Career Goals. Make it concise and impactful.
"""

COVER_LETTER_PROMPT = """
Write a professional cover letter for:
Name: {name}
Email: {email}
Target Job: {job_role}
Skills: {skills}
Experience: {experience}
Career Goals: {goals}

Address to "Hiring Manager" and make it engaging, specific to the job role, and professional.
"""

@app.route('/generate', methods=['POST'])
def generate():
    data = request.json
    try:
        resume_prompt = RESUME_PROMPT.format(**data)
        cover_letter_prompt = COVER_LETTER_PROMPT.format(**data)

        resume = generate_with_ai(resume_prompt, data, "resume")
        cover_letter = generate_with_ai(cover_letter_prompt, data, "cover_letter")
        
        return jsonify({
            'resume': resume,
            'cover_letter': cover_letter,
            'services_used': {
                'huggingface': FREE_AI_SERVICES["huggingface"],
                'openai': FREE_AI_SERVICES["openai"],
                'fallback': True
            }
        })
    except Exception as e:
        print("ERROR:", e)
        import traceback; traceback.print_exc()
        return jsonify({'error': str(e)}), 500

@app.route('/health', methods=['GET'])
def health_check():
    """Check which AI services are available"""
    return jsonify({
        'status': 'healthy',
        'available_services': FREE_AI_SERVICES,
        'huggingface_token': bool(HF_TOKEN),
        'openai_key': bool(OPENAI_API_KEY)
    })

if __name__ == '__main__':
    app.run(debug=True) 