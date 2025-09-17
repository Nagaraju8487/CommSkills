import React, { useState, useEffect } from 'react';

import { Mail, AlertCircle, CheckCircle, Lightbulb, RotateCcw } from 'lucide-react';



interface ToneAnalysis {

  overall: 'Too Casual' | 'Too Formal' | 'Perfect' | 'Unclear';

  formality: number; // 1-10 scale

  politeness: number; // 1-10 scale

  clarity: number; // 1-10 scale

  issues: string[];

  suggestions: string[];

}



const formalWords = ['please', 'thank you', 'kindly', 'appreciate', 'sincerely', 'regards', 'would', 'could'];

const casualWords = ['hey', 'hi', 'thanks', 'yeah', 'ok', 'cool', 'awesome', 'btw', 'fyi'];

const fillerPhrases = ['i think', 'i guess', 'maybe', 'sort of', 'kind of', 'probably'];

const weakPhrases = ['sorry to bother', 'just wondering', 'i was thinking', 'if you don\'t mind'];



const emailTemplates = {

  'job-inquiry': {

    title: 'Job Inquiry Email',

    content: 'Hi there,\n\nI saw your job posting for the marketing position and I think I might be a good fit. I have some experience in this area and would love to chat.\n\nLet me know if you\'re interested.\n\nThanks!'

  },

  'meeting-request': {

    title: 'Meeting Request',

    content: 'Hey,\n\nCan we meet sometime this week? I have some ideas I want to run by you about the project.\n\nLet me know when you\'re free.\n\nThanks!'

  },

  'customer-complaint': {

    title: 'Customer Complaint',

    content: 'Hi,\n\nI ordered something last week and it still hasn\'t arrived. This is really frustrating and I want a refund.\n\nPlease fix this ASAP.\n\nThanks.'

  }

};



export function EmailToneImprover() {

  const [emailText, setEmailText] = useState('');

  const [analysis, setAnalysis] = useState<ToneAnalysis | null>(null);

  const [selectedTemplate, setSelectedTemplate] = useState<string>('');



  useEffect(() => {

    if (emailText.trim()) {

      analyzeEmail(emailText);

    } else {

      setAnalysis(null);

    }

  }, [emailText]);



  const analyzeEmail = (text: string) => {

    const lowerText = text.toLowerCase();

    const words = lowerText.split(/\s+/);

    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);

   

    // Calculate formality (1-10)

    const formalCount = formalWords.reduce((count, word) => count + (lowerText.includes(word) ? 1 : 0), 0);

    const casualCount = casualWords.reduce((count, word) => count + (lowerText.includes(word) ? 1 : 0), 0);

    const formality = Math.max(1, Math.min(10, 5 + (formalCount - casualCount)));

   

    // Calculate politeness (1-10)

    const politenessPhrases = ['please', 'thank you', 'would you', 'could you', 'appreciate'];

    const politenessCount = politenessPhrases.reduce((count, phrase) => count + (lowerText.includes(phrase) ? 1 : 0), 0);

    const politeness = Math.max(1, Math.min(10, 3 + politenessCount * 2));

   

    // Calculate clarity (1-10)

    const avgSentenceLength = words.length / sentences.length;

    const clarity = Math.max(1, Math.min(10, 10 - Math.max(0, (avgSentenceLength - 15) / 3)));

   

    // Identify issues

    const issues: string[] = [];

    const suggestions: string[] = [];

   

    if (casualCount > formalCount && formalCount === 0) {

      issues.push('Too casual for professional communication');

      suggestions.push('Consider using "Hello" instead of "Hi" or "Hey"');

      suggestions.push('Add "please" and "thank you" for politeness');

    }

   

    if (formality > 8 && casualCount === 0) {

      issues.push('May be overly formal');

      suggestions.push('Consider a slightly warmer tone');

    }

   

    if (lowerText.includes('asap') || lowerText.includes('urgent')) {

      issues.push('Contains potentially demanding language');

      suggestions.push('Consider "at your earliest convenience" instead of "ASAP"');

    }

   

    // Check for weak language

    const weakCount = weakPhrases.reduce((count, phrase) => count + (lowerText.includes(phrase) ? 1 : 0), 0);

    if (weakCount > 0) {

      issues.push('Contains weak or apologetic language');

      suggestions.push('Be more direct and confident in your communication');

    }

   

    // Check for filler words

    const fillerCount = fillerPhrases.reduce((count, phrase) => count + (lowerText.includes(phrase) ? 1 : 0), 0);

    if (fillerCount > 1) {

      issues.push('Contains unnecessary filler phrases');

      suggestions.push('Remove uncertain language like "I think" or "maybe"');

    }

   

    // Check for missing greeting or closing

    if (!lowerText.includes('hi') && !lowerText.includes('hello') && !lowerText.includes('dear')) {

      issues.push('Missing proper greeting');

      suggestions.push('Add a greeting like "Hello [Name]" or "Dear [Name]"');

    }

   

    if (!lowerText.includes('sincerely') && !lowerText.includes('regards') && !lowerText.includes('thank you') && !lowerText.includes('thanks')) {

      issues.push('Missing polite closing');

      suggestions.push('Add a closing like "Best regards" or "Thank you"');

    }

   

    // Determine overall tone

    let overall: ToneAnalysis['overall'];

    if (formality < 4 && politeness < 5) {

      overall = 'Too Casual';

    } else if (formality > 8 && politeness > 8) {

      overall = 'Too Formal';

    } else if (issues.length === 0) {

      overall = 'Perfect';

    } else {

      overall = 'Unclear';

    }

   

    setAnalysis({

      overall,

      formality,

      politeness,

      clarity,

      issues,

      suggestions

    });

  };



  const loadTemplate = (templateKey: string) => {

    const template = emailTemplates[templateKey as keyof typeof emailTemplates];

    if (template) {

      setEmailText(template.content);

      setSelectedTemplate(templateKey);

    }

  };



  const clearEmail = () => {

    setEmailText('');

    setSelectedTemplate('');

    setAnalysis(null);

  };



  const getScoreColor = (score: number) => {

    if (score >= 7) return 'text-green-600';

    if (score >= 5) return 'text-yellow-600';

    return 'text-red-600';

  };



  const getOverallColor = (overall: string) => {

    switch (overall) {

      case 'Perfect': return 'text-green-600 bg-green-50';

      case 'Too Casual': return 'text-orange-600 bg-orange-50';

      case 'Too Formal': return 'text-blue-600 bg-blue-50';

      case 'Unclear': return 'text-red-600 bg-red-50';

      default: return 'text-gray-600 bg-gray-50';

    }

  };



  return (

    <div className="max-w-4xl mx-auto px-4 py-8">

      <div className="text-center mb-8">

        <h1 className="text-3xl font-bold text-gray-900 mb-4">Email Tone Improver</h1>

        <p className="text-gray-600 text-lg">Get feedback on your email communication style</p>

      </div>



      {/* Template Selector */}

      <div className="bg-white rounded-2xl shadow-xl p-6 mb-8">

        <h2 className="text-lg font-semibold text-gray-900 mb-4">Try Sample Emails</h2>

        <div className="flex flex-wrap gap-3">

          {Object.entries(emailTemplates).map(([key, template]) => (

            <button

              key={key}

              onClick={() => loadTemplate(key)}

              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${

                selectedTemplate === key

                  ? 'bg-blue-500 text-white'

                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'

              }`}

            >

              {template.title}

            </button>

          ))}

          <button

            onClick={clearEmail}

            className="px-4 py-2 rounded-lg text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200 transition-colors"

          >

            Clear

          </button>

        </div>

      </div>



      {/* Email Input */}

      <div className="bg-white rounded-2xl shadow-xl p-8 mb-8">

        <div className="flex items-center space-x-3 mb-6">

          <div className="w-10 h-10 bg-indigo-100 rounded-lg flex items-center justify-center">

            <Mail className="w-5 h-5 text-indigo-600" />

          </div>

          <h2 className="text-xl font-semibold text-gray-900">Your Email</h2>

        </div>



        <textarea

          value={emailText}

          onChange={(e) => setEmailText(e.target.value)}

          placeholder="Paste or type your email here to get tone analysis and suggestions..."

          className="w-full h-48 p-4 border border-gray-300 rounded-xl resize-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"

        />



        {emailText && (

          <div className="mt-4 text-sm text-gray-600">

            {emailText.split(/\s+/).length} words • {emailText.split(/[.!?]+/).filter(s => s.trim().length > 0).length} sentences

          </div>

        )}

      </div>



      {/* Analysis Results */}

      {analysis && (

        <div className="space-y-8">

          {/* Overall Assessment */}

          <div className="bg-white rounded-2xl shadow-xl p-8">

            <h3 className="text-xl font-semibold text-gray-900 mb-6">Tone Analysis</h3>

           

            <div className="text-center mb-8">

              <div className={`inline-flex items-center px-6 py-3 rounded-full text-lg font-semibold ${getOverallColor(analysis.overall)}`}>

                {analysis.overall === 'Perfect' && <CheckCircle className="w-5 h-5 mr-2" />}

                {analysis.overall !== 'Perfect' && <AlertCircle className="w-5 h-5 mr-2" />}

                {analysis.overall}

              </div>

            </div>



            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

              <div className="text-center">

                <div className={`text-3xl font-bold ${getScoreColor(analysis.formality)}`}>

                  {analysis.formality}/10

                </div>

                <div className="text-sm text-gray-600 mt-1">Formality</div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">

                  <div

                    className="bg-blue-500 h-2 rounded-full transition-all"

                    style={{ width: `${analysis.formality * 10}%` }}

                  />

                </div>

              </div>



              <div className="text-center">

                <div className={`text-3xl font-bold ${getScoreColor(analysis.politeness)}`}>

                  {analysis.politeness}/10

                </div>

                <div className="text-sm text-gray-600 mt-1">Politeness</div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">

                  <div

                    className="bg-green-500 h-2 rounded-full transition-all"

                    style={{ width: `${analysis.politeness * 10}%` }}

                  />

                </div>

              </div>



              <div className="text-center">

                <div className={`text-3xl font-bold ${getScoreColor(analysis.clarity)}`}>

                  {Math.round(analysis.clarity)}/10

                </div>

                <div className="text-sm text-gray-600 mt-1">Clarity</div>

                <div className="w-full bg-gray-200 rounded-full h-2 mt-3">

                  <div

                    className="bg-purple-500 h-2 rounded-full transition-all"

                    style={{ width: `${analysis.clarity * 10}%` }}

                  />

                </div>

              </div>

            </div>

          </div>



          {/* Issues and Suggestions */}

          {(analysis.issues.length > 0 || analysis.suggestions.length > 0) && (

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">

              {/* Issues */}

              {analysis.issues.length > 0 && (

                <div className="bg-white rounded-2xl shadow-xl p-8">

                  <div className="flex items-center space-x-2 mb-4">

                    <AlertCircle className="w-5 h-5 text-orange-600" />

                    <h3 className="text-lg font-semibold text-gray-900">Issues Found</h3>

                  </div>

                  <div className="space-y-3">

                    {analysis.issues.map((issue, index) => (

                      <div key={index} className="flex items-start space-x-3 p-3 bg-orange-50 rounded-lg">

                        <div className="w-2 h-2 bg-orange-500 rounded-full mt-2 flex-shrink-0" />

                        <p className="text-sm text-orange-800">{issue}</p>

                      </div>

                    ))}

                  </div>

                </div>

              )}



              {/* Suggestions */}

              {analysis.suggestions.length > 0 && (

                <div className="bg-white rounded-2xl shadow-xl p-8">

                  <div className="flex items-center space-x-2 mb-4">

                    <Lightbulb className="w-5 h-5 text-blue-600" />

                    <h3 className="text-lg font-semibold text-gray-900">Suggestions</h3>

                  </div>

                  <div className="space-y-3">

                    {analysis.suggestions.map((suggestion, index) => (

                      <div key={index} className="flex items-start space-x-3 p-3 bg-blue-50 rounded-lg">

                        <div className="w-2 h-2 bg-blue-500 rounded-full mt-2 flex-shrink-0" />

                        <p className="text-sm text-blue-800">{suggestion}</p>

                      </div>

                    ))}

                  </div>

                </div>

              )}

            </div>

          )}



          {/* Perfect Score */}

          {analysis.overall === 'Perfect' && (

            <div className="bg-white rounded-2xl shadow-xl p-8 text-center">

              <CheckCircle className="w-16 h-16 text-green-600 mx-auto mb-4" />

              <h3 className="text-xl font-semibold text-gray-900 mb-2">Excellent Communication!</h3>

              <p className="text-gray-600">Your email has great tone, politeness, and clarity. Well done!</p>

            </div>

          )}

        </div>

      )}



      {/* Email Best Practices */}

      <div className="mt-8 bg-white rounded-2xl shadow-xl p-8">

        <h3 className="text-xl font-semibold text-gray-900 mb-6">Email Best Practices</h3>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

          <div>

            <h4 className="font-semibold text-green-800 mb-3">✅ Do</h4>

            <ul className="space-y-2 text-sm text-gray-700">

              <li>• Use clear, specific subject lines</li>

              <li>• Start with appropriate greeting</li>

              <li>• Be concise but complete</li>

              <li>• Use please and thank you</li>

              <li>• Proofread before sending</li>

              <li>• End with professional closing</li>

            </ul>

          </div>

          <div>

            <h4 className="font-semibold text-red-800 mb-3">❌ Don't</h4>

            <ul className="space-y-2 text-sm text-gray-700">

              <li>• Use all caps (seems like shouting)</li>

              <li>• Be overly casual in professional settings</li>

              <li>• Use demanding language</li>

              <li>• Write overly long sentences</li>

              <li>• Forget to include context</li>

              <li>• Send without proofreading</li>

            </ul>

          </div>

        </div>

      </div>

    </div>

  );

}