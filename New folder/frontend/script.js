document.getElementById('inputForm').addEventListener('submit', async function(e) {
    e.preventDefault();
    const form = e.target;
    const data = {
        name: form.name.value,
        email: form.email.value,
        job_role: form.job_role.value,
        skills: form.skills.value,
        experience: form.experience.value,
        goals: form.goals.value
    };
    document.getElementById('resume').textContent = 'Generating...';
    document.getElementById('coverLetter').textContent = 'Generating...';
    try {
        const res = await fetch('http://localhost:5000/generate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(data)
        });
        const result = await res.json();
        // For template rendering, use the form data and generated resume text
        data.resumeText = result.resume;
        renderResume(data);
        showTemplates();
        document.getElementById('downloadResume').style.display = 'inline-block';
        document.getElementById('coverLetter').textContent = result.cover_letter;
        document.getElementById('downloadCover').style.display = 'inline-block';
    } catch (err) {
        document.getElementById('resume').textContent = 'Error generating resume.';
        document.getElementById('coverLetter').textContent = 'Error generating cover letter.';
    }
});

document.getElementById('downloadResume').addEventListener('click', function() {
    downloadPDF('Resume');
});

document.getElementById('downloadCover').addEventListener('click', function() {
    const text = document.getElementById('coverLetter').textContent;
    downloadPDF('Cover_Letter', text);
});

// Enhanced PDF export using jsPDF and html2canvas
// Add html2canvas from CDN if not present
if (!window.html2canvas) {
    const script = document.createElement('script');
    script.src = 'https://cdnjs.cloudflare.com/ajax/libs/html2canvas/1.4.1/html2canvas.min.js';
    document.head.appendChild(script);
}

function downloadPDF(title) {
    const resumeNode = document.getElementById('resumePreviewContainer');
    if (!window.jspdf || !window.html2canvas) {
        alert('PDF export libraries not loaded yet. Please try again in a moment.');
        return;
    }
    window.html2canvas(resumeNode, { scale: 2, backgroundColor: null }).then(canvas => {
        const imgData = canvas.toDataURL('image/png');
        const pdf = new window.jspdf.jsPDF({ orientation: 'portrait', unit: 'pt', format: 'a4' });
        // Calculate width/height to fit A4
        const pageWidth = pdf.internal.pageSize.getWidth();
        const imgWidth = pageWidth - 40;
        const imgHeight = canvas.height * imgWidth / canvas.width;
        pdf.addImage(imgData, 'PNG', 20, 20, imgWidth, imgHeight);
        pdf.save(title + '.pdf');
    });
}

// Theme toggle logic
const themeToggle = document.getElementById('themeToggle');
const body = document.body;

function setTheme(isDark) {
    if (isDark) {
        body.classList.add('dark');
        themeToggle.textContent = '☀️';
        localStorage.setItem('theme', 'dark');
    } else {
        body.classList.remove('dark');
        themeToggle.textContent = '🌙';
        localStorage.setItem('theme', 'light');
    }
}

// Load theme from localStorage
const savedTheme = localStorage.getItem('theme');
setTheme(savedTheme === 'dark');

themeToggle.addEventListener('click', () => {
    setTheme(!body.classList.contains('dark'));
});

// Profile picture handling
let profileImageDataUrl = '';
const profilePictureInput = document.getElementById('profilePictureInput');
profilePictureInput.addEventListener('change', function(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(evt) {
            profileImageDataUrl = evt.target.result;
        };
        reader.readAsDataURL(file);
    } else {
        profileImageDataUrl = '';
    }
});

// Template definitions
const templates = [
    {
        id: 'classic',
        name: 'Classic',
        render: (data) => `
            <div class="resume-template classic">
                ${data.profileImage ? `<img class="profile-pic" src="${data.profileImage}" alt="Profile Picture">` : ''}
                <h2>${data.name}</h2>
                <p><strong>Email:</strong> ${data.email}</p>
                <p><strong>Job Role:</strong> ${data.job_role}</p>
                <h3>Skills</h3>
                <p>${data.skills}</p>
                <h3>Experience</h3>
                <p>${data.experience}</p>
                <h3>Career Goals</h3>
                <p>${data.goals}</p>
            </div>
        `
    },
    {
        id: 'modern',
        name: 'Modern',
        render: (data) => `
            <div class="resume-template modern">
                <div class="header">
                    ${data.profileImage ? `<img class="profile-pic" src="${data.profileImage}" alt="Profile Picture">` : ''}
                    <div>
                        <h2>${data.name}</h2>
                        <span>${data.job_role}</span>
                    </div>
                </div>
                <div class="section"><strong>Email:</strong> ${data.email}</div>
                <div class="section"><strong>Skills:</strong> ${data.skills}</div>
                <div class="section"><strong>Experience:</strong> ${data.experience}</div>
                <div class="section"><strong>Career Goals:</strong> ${data.goals}</div>
            </div>
        `
    },
    {
        id: 'minimal',
        name: 'Minimal',
        render: (data) => `
            <div class="resume-template minimal">
                <div style="display:flex;align-items:center;gap:16px;">
                    ${data.profileImage ? `<img class="profile-pic" src="${data.profileImage}" alt="Profile Picture">` : ''}
                    <div>
                        <h2 style="margin:0;">${data.name}</h2>
                        <div style="font-size:1rem;">${data.job_role}</div>
                    </div>
                </div>
                <div style="margin-top:10px;"><strong>Email:</strong> ${data.email}</div>
                <div style="margin-top:10px;"><strong>Skills:</strong> ${data.skills}</div>
                <div style="margin-top:10px;"><strong>Experience:</strong> ${data.experience}</div>
                <div style="margin-top:10px;"><strong>Career Goals:</strong> ${data.goals}</div>
            </div>
        `
    }
];
let selectedTemplate = templates[0].id;

function showTemplates() {
    const templateSelector = document.getElementById('templateSelector');
    const templatesDiv = document.getElementById('templates');
    templatesDiv.innerHTML = '';
    templates.forEach(t => {
        const btn = document.createElement('button');
        btn.className = 'template-thumb' + (t.id === selectedTemplate ? ' selected' : '');
        btn.innerHTML = `<span>${t.name}</span>`;
        btn.onclick = () => {
            selectedTemplate = t.id;
            renderResume(currentResumeData);
            showTemplates();
        };
        templatesDiv.appendChild(btn);
    });
    templateSelector.style.display = 'block';
}

let currentResumeData = null;

function renderResume(data) {
    if (!data) return;
    currentResumeData = data;
    data.profileImage = profileImageDataUrl;
    const template = templates.find(t => t.id === selectedTemplate);
    document.getElementById('resumePreviewContainer').innerHTML = template.render(data);
} 