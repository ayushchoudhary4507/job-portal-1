import React, { useState } from 'react';
import { Upload, FileText, CheckCircle, XCircle, TrendingUp, AlertCircle } from 'lucide-react';

const ResumeAnalyzer = () => {
  const [file, setFile] = useState(null);
  const [jobId, setJobId] = useState('');
  const [analyzing, setAnalyzing] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState('');

  const handleFileChange = (e) => {
    const selectedFile = e.target.files[0];
    if (selectedFile) {
      if (selectedFile.type !== 'application/pdf' && 
          selectedFile.type !== 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
        setError('Please upload a PDF or DOCX file');
        setFile(null);
        return;
      }
      if (selectedFile.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        setFile(null);
        return;
      }
      setFile(selectedFile);
      setError('');
    }
  };

  const handleAnalyze = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please select a file to analyze');
      return;
    }

    setAnalyzing(true);
    setError('');
    setResult(null);

    const formData = new FormData();
    formData.append('resume', file);
    if (jobId) {
      formData.append('jobId', jobId);
    }

    try {
      const token = localStorage.getItem('token');
      const response = await fetch('http://localhost:5000/api/resume-analysis/analyze', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Analysis failed');
      }

      setResult(data.analysis);
    } catch (err) {
      setError(err.message);
    } finally {
      setAnalyzing(false);
    }
  };

  const getScoreColor = (score) => {
    if (score >= 70) return 'bg-green-500';
    if (score >= 50) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  const getScoreLabel = (score) => {
    if (score >= 70) return 'Excellent Match';
    if (score >= 50) return 'Good Match';
    if (score >= 30) return 'Moderate Match';
    return 'Low Match';
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-gray-900 mb-2">AI Resume Analyzer</h1>
          <p className="text-gray-600">Upload your resume and get instant skill analysis</p>
        </div>

        {/* Upload Card */}
        <div className="bg-white rounded-xl shadow-lg p-6 mb-6">
          <form onSubmit={handleAnalyze}>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Upload Resume (PDF or DOCX)
              </label>
              <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-500 transition-colors">
                <div className="space-y-1 text-center">
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <div className="flex text-sm text-gray-600">
                    <label htmlFor="file-upload" className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none">
                      <span>Upload a file</span>
                      <input
                        id="file-upload"
                        name="file-upload"
                        type="file"
                        className="sr-only"
                        accept=".pdf,.docx"
                        onChange={handleFileChange}
                      />
                    </label>
                    <p className="pl-1">or drag and drop</p>
                  </div>
                  <p className="text-xs text-gray-500">PDF or DOCX up to 5MB</p>
                </div>
              </div>
              {file && (
                <div className="mt-2 flex items-center justify-between bg-blue-50 p-3 rounded-lg">
                  <div className="flex items-center">
                    <FileText className="h-5 w-5 text-blue-600 mr-2" />
                    <span className="text-sm text-gray-700">{file.name}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setFile(null)}
                    className="text-red-600 hover:text-red-800"
                  >
                    <XCircle className="h-5 w-5" />
                  </button>
                </div>
              )}
            </div>

            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Job ID (Optional - Compare with specific job)
              </label>
              <input
                type="text"
                value={jobId}
                onChange={(e) => setJobId(e.target.value)}
                placeholder="Enter job ID to compare skills"
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {error && (
              <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-center">
                <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                <span className="text-sm text-red-700">{error}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={!file || analyzing}
              className="w-full bg-blue-600 text-white py-3 px-4 rounded-lg font-medium hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
            >
              {analyzing ? 'Analyzing...' : 'Analyze Resume'}
            </button>
          </form>
        </div>

        {/* Results */}
        {result && (
          <div className="space-y-6">
            {/* Score Card */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-4 flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-blue-600" />
                Resume Score
              </h2>
              <div className="flex items-center justify-between mb-4">
                <div className="flex-1 mr-4">
                  <div className="h-4 bg-gray-200 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${getScoreColor(result.scorePercentage)} transition-all duration-500`}
                      style={{ width: `${result.scorePercentage}%` }}
                    />
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-3xl font-bold text-gray-900">
                    {result.scorePercentage}%
                  </span>
                  <p className="text-sm text-gray-600">{getScoreLabel(result.scorePercentage)}</p>
                </div>
              </div>
            </div>

            {/* Extracted Skills */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Extracted Skills
              </h3>
              <div className="flex flex-wrap gap-2">
                {result.extractedSkills.length > 0 ? (
                  result.extractedSkills.map((skill, index) => (
                    <span
                      key={index}
                      className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm font-medium"
                    >
                      {skill}
                    </span>
                  ))
                ) : (
                  <p className="text-gray-500">No skills detected</p>
                )}
              </div>
            </div>

            {/* Education */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Education
              </h3>
              {result.extractedEducation.length > 0 ? (
                <div className="space-y-3">
                  {result.extractedEducation.map((edu, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{edu.degree}</p>
                      {edu.institution && (
                        <p className="text-sm text-gray-600">{edu.institution}</p>
                      )}
                      {edu.year && (
                        <p className="text-sm text-gray-500">{edu.year}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No education detected</p>
              )}
            </div>

            {/* Experience */}
            <div className="bg-white rounded-xl shadow-lg p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-600" />
                Experience
              </h3>
              {result.extractedExperience.length > 0 ? (
                <div className="space-y-3">
                  {result.extractedExperience.map((exp, index) => (
                    <div key={index} className="p-3 bg-gray-50 rounded-lg">
                      <p className="font-medium text-gray-900">{exp.title}</p>
                      {exp.company && (
                        <p className="text-sm text-gray-600">{exp.company}</p>
                      )}
                      {exp.duration && (
                        <p className="text-sm text-gray-500">{exp.duration}</p>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500">No experience detected</p>
              )}
            </div>

            {/* Job Comparison (if jobId provided) */}
            {result.jobSkills && result.jobSkills.length > 0 && (
              <>
                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <CheckCircle className="h-5 w-5 mr-2 text-green-600" />
                    Matched Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.matchedSkills.length > 0 ? (
                      result.matchedSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No matched skills</p>
                    )}
                  </div>
                </div>

                <div className="bg-white rounded-xl shadow-lg p-6">
                  <h3 className="text-xl font-bold text-gray-900 mb-4 flex items-center">
                    <XCircle className="h-5 w-5 mr-2 text-red-600" />
                    Missing Skills
                  </h3>
                  <div className="flex flex-wrap gap-2">
                    {result.missingSkills.length > 0 ? (
                      result.missingSkills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-3 py-1 bg-red-100 text-red-800 rounded-full text-sm font-medium"
                        >
                          {skill}
                        </span>
                      ))
                    ) : (
                      <p className="text-gray-500">No missing skills</p>
                    )}
                  </div>
                </div>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ResumeAnalyzer;
