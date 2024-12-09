'use client'

import React, { useState } from 'react';
import yaml from 'js-yaml'

const RESERVED_KEYWORDS = [
  'stages',
  'default',
  'include',
  'variables',
  'before_script',
  'after_script',
  'image',
  'services',
  'cache',
  'workflow',
  'rules',
  'pages'
]

export default function GitLabCIAnalyzer() {
  const [yamlContent, setYamlContent] = useState('')
  const [analysis, setAnalysis] = useState(null)
  const [error, setError] = useState(null)

  const handleContentChange = (event) => {
    setYamlContent(event.target.value)
  }

  const analyzeYaml = () => {
    try {
      const parsedYaml = yaml.load(yamlContent)
      const topKeys = Object.keys(parsedYaml)
      const reservedKeys = topKeys.filter(key => RESERVED_KEYWORDS.includes(key))
      const jobs = topKeys.filter(key => !RESERVED_KEYWORDS.includes(key))

      // Extract stages and jobs by stage
      const definedStages = parsedYaml.stages || []
      const jobsByStage = {}
      const stagesWithOnly = {}
      const uniqueOnlyConditions = {}
      let vaultPresent = false
      let jarSigningPresent = false
      let garaSigningPresent = false

      const checkForKeywords = (obj) => {
        if (typeof obj !== 'object' || obj === null) return;
        
        Object.entries(obj).forEach(([key, value]) => {
          if (key.toLowerCase().includes('vault')) vaultPresent = true;
          if (key.toLowerCase().includes('signing')) jarSigningPresent = true;
          if (key.toLowerCase().includes('gara') || key.toLowerCase().includes('garasign')) garaSigningPresent = true;
          
          if (typeof value === 'object') checkForKeywords(value);
        });
      }

      jobs.forEach(job => {
        const jobConfig = parsedYaml[job]
        checkForKeywords(jobConfig)
        
        const stage = jobConfig.stage || 'test' // 'test' is the default stage in GitLab CI
        if (!jobsByStage[stage]) {
          jobsByStage[stage] = []
        }
        jobsByStage[stage].push(job)

        // Check for 'only' condition
        if (jobConfig.only) {
          if (!stagesWithOnly[stage]) {
            stagesWithOnly[stage] = []
          }
          const onlyConditions = Array.isArray(jobConfig.only) ? jobConfig.only : [jobConfig.only]
          stagesWithOnly[stage].push({
            name: job,
            only: onlyConditions
          })

          // Count unique 'only' conditions
          onlyConditions.forEach(condition => {
            if (!uniqueOnlyConditions[condition]) {
              uniqueOnlyConditions[condition] = 0
            }
            uniqueOnlyConditions[condition]++
          })
        }
      })

      setAnalysis({
        jobCount: jobs.length,
        reservedKeywordCount: reservedKeys.length,
        jobs: jobs,
        reservedKeywords: reservedKeys,
        stages: definedStages,
        jobsByStage: jobsByStage,
        stagesWithOnly: stagesWithOnly,
        uniqueOnlyConditions: uniqueOnlyConditions,
        vaultPresent,
        jarSigningPresent,
        garaSigningPresent
      })
      setError(null)
    } catch (error) {
      setError('Error parsing the YAML content: ' + error.message)
      setAnalysis(null)
    }
  }

  return (
    <div className="min-h-screen bg-gray-100 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold text-center text-gray-900 mb-8">GitLab CI/CD YAML Analyzer</h1>
        <div className="bg-white shadow-md rounded-lg p-6 mb-8">
          <textarea
            value={yamlContent}
            onChange={handleContentChange}
            placeholder="Paste your GitLab CI/CD YAML content here..."
            className="w-full h-64 p-2 border border-gray-300 rounded-md mb-4 focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          <button
            onClick={analyzeYaml}
            className="w-full bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition duration-150 ease-in-out"
          >
            Analyze YAML
          </button>
        </div>
        {error && (
          <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 mb-8" role="alert">
            <p className="font-bold">Error</p>
            <p>{error}</p>
          </div>
        )}
        {analysis && (
          <div className="bg-white shadow-md rounded-lg overflow-hidden">
            <div className="bg-blue-500 text-white px-6 py-4">
              <h2 className="text-2xl font-semibold">Analysis Results</h2>
            </div>
            <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="bg-blue-50 rounded-lg p-4 shadow">
                <p className="text-lg font-semibold text-blue-700 mb-2">Jobs</p>
                <p className="text-3xl font-bold text-blue-900">{analysis.jobCount}</p>
              </div>
              <div className="bg-green-50 rounded-lg p-4 shadow">
                <p className="text-lg font-semibold text-green-700 mb-2">Reserved Keywords</p>
                <p className="text-3xl font-bold text-green-900">{analysis.reservedKeywordCount}</p>
              </div>
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 shadow">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Stages and their sub-stages (jobs):</p>
                  <ul className="list-disc pl-5">
                    {analysis.stages.map((stage) => (
                      <li key={stage} className="text-gray-800">
                        {stage}: {analysis.jobsByStage[stage]?.length || 0} job(s)
                        {analysis.stagesWithOnly[stage] && (
                          <ul className="list-circle pl-5 mt-2">
                            {analysis.stagesWithOnly[stage].map((job, index) => (
                              <li key={index} className="text-gray-600 text-sm">
                                {job.name} (only: {job.only.join(', ')})
                              </li>
                            ))}
                          </ul>
                        )}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 shadow">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Unique 'only' conditions and their count:</p>
                  <ul className="list-disc pl-5">
                    {Object.entries(analysis.uniqueOnlyConditions).map(([condition, count]) => (
                      <li key={condition} className="text-gray-800">
                        {condition}: {count} occurrence(s)
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 shadow">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Additional Checks:</p>
                  <ul className="list-disc pl-5">
                    <li className="text-gray-800">
                      Vault: {analysis.vaultPresent ? 'Present' : 'Not Present'}
                    </li>
                    <li className="text-gray-800">
                      JAR Signing: {analysis.jarSigningPresent ? 'Present' : 'Not Present'}
                    </li>
                    <li className="text-gray-800">
                      Gara Signing: {analysis.garaSigningPresent ? 'Present' : 'Not Present'}
                    </li>
                  </ul>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 shadow">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Job Names</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.jobs.map((job, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {job}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="md:col-span-2">
                <div className="bg-gray-50 rounded-lg p-4 shadow">
                  <p className="text-lg font-semibold text-gray-700 mb-2">Used Reserved Keywords</p>
                  <div className="flex flex-wrap gap-2">
                    {analysis.reservedKeywords.map((keyword, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-sm font-medium px-2.5 py-0.5 rounded">
                        {keyword}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

