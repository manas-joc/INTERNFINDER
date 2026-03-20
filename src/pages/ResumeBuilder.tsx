import React, { useState } from 'react';
import { jsPDF } from 'jspdf';
import { Download, Loader } from 'lucide-react';

const ResumeBuilder: React.FC = () => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    skills: '',
    education: '',
    experience: '',
    projects: '',
  });
  const [resumeData, setResumeData] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const generateResume = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/ai/generate-resume', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      setResumeData(data);
    } catch (error) {
      console.error('Error generating resume:', error);
    } finally {
      setLoading(false);
    }
  };

  const downloadPDF = () => {
    if (!resumeData) return;
    const doc = new jsPDF();
    
    doc.setFontSize(22);
    doc.text(formData.name, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`${formData.email} | ${formData.phone}`, 20, 30);
    
    let y = 45;
    
    doc.setFontSize(16);
    doc.text('Summary', 20, y);
    y += 10;
    doc.setFontSize(12);
    const summaryLines = doc.splitTextToSize(resumeData.summary || '', 170);
    doc.text(summaryLines, 20, y);
    y += summaryLines.length * 7 + 10;

    doc.setFontSize(16);
    doc.text('Skills', 20, y);
    y += 10;
    doc.setFontSize(12);
    doc.text((resumeData.skills || []).join(', '), 20, y);
    y += 20;

    doc.setFontSize(16);
    doc.text('Experience', 20, y);
    y += 10;
    resumeData.experience?.forEach((exp: any) => {
      doc.setFontSize(14);
      doc.text(`${exp.title} at ${exp.company}`, 20, y);
      y += 7;
      doc.setFontSize(12);
      doc.text(exp.duration || '', 20, y);
      y += 7;
      const descLines = doc.splitTextToSize(exp.description || '', 170);
      doc.text(descLines, 20, y);
      y += descLines.length * 7 + 10;
    });

    doc.save('resume.pdf');
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">AI Resume Builder</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Form */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <h2 className="text-xl font-semibold mb-4 text-gray-900 dark:text-white">Enter Your Details</h2>
            <div className="space-y-4">
              <input name="name" placeholder="Full Name" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <input name="email" placeholder="Email" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <input name="phone" placeholder="Phone" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <textarea name="skills" placeholder="Skills (comma separated)" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <textarea name="education" placeholder="Education Details" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <textarea name="experience" placeholder="Experience Details" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              <textarea name="projects" placeholder="Projects" onChange={handleChange} className="w-full p-2 border rounded dark:bg-gray-700 dark:text-white" />
              
              <button
                onClick={generateResume}
                disabled={loading}
                className="w-full bg-indigo-600 text-white py-2 rounded hover:bg-indigo-700 disabled:opacity-50 flex justify-center items-center"
              >
                {loading ? <Loader className="animate-spin mr-2" /> : 'Generate Resume'}
              </button>
            </div>
          </div>

          {/* Preview */}
          <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white">Resume Preview</h2>
              {resumeData && (
                <button onClick={downloadPDF} className="flex items-center text-indigo-600 hover:text-indigo-800">
                  <Download size={20} className="mr-2" /> Download PDF
                </button>
              )}
            </div>
            
            {resumeData ? (
              <div className="prose dark:prose-invert max-w-none">
                <h3 className="text-2xl font-bold">{formData.name}</h3>
                <p>{formData.email} | {formData.phone}</p>
                
                <hr className="my-4" />
                
                <h4 className="text-lg font-semibold">Summary</h4>
                <p>{resumeData.summary}</p>
                
                <h4 className="text-lg font-semibold mt-4">Skills</h4>
                <p>{(resumeData.skills || []).join(', ')}</p>
                
                <h4 className="text-lg font-semibold mt-4">Experience</h4>
                {resumeData.experience?.map((exp: any, idx: number) => (
                  <div key={idx} className="mb-2">
                    <p className="font-bold">{exp.title} at {exp.company}</p>
                    <p className="text-sm text-gray-500">{exp.duration}</p>
                    <p>{exp.description}</p>
                  </div>
                ))}

                <h4 className="text-lg font-semibold mt-4">Projects</h4>
                {resumeData.projects?.map((proj: any, idx: number) => (
                  <div key={idx} className="mb-2">
                    <p className="font-bold">{proj.title}</p>
                    <p>{proj.description}</p>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center text-gray-500 py-20">
                Fill out the form and click Generate to see your AI-enhanced resume here.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default ResumeBuilder;
