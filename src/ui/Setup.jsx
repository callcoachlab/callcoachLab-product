import React, { useState } from 'react';
import { ChevronDown } from 'lucide-react';

export default function CallCoach360Setup() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Select Business
  const [businessTitle, setBusinessTitle] = useState('');
  const [businessType, setBusinessType] = useState('Small, Medium Business');
  const [teamSize, setTeamSize] = useState('50+ members');

  // Step 2: Add Team
  const [teamName, setTeamName] = useState('');
  const [teamMembers, setTeamMembers] = useState('');

  // Step 3: Connect Calls
  const [callProvider, setCallProvider] = useState('');
  const [apiKey, setApiKey] = useState('');

  // Step 4: Add Score Cards
  const [scoreCardName, setScoreCardName] = useState('');
  const [scoreCardTemplate, setScoreCardTemplate] = useState('');

  // Step 5: Review
  const formData = {
    business: { title: businessTitle, type: businessType, teamSize },
    team: { name: teamName, members: teamMembers },
    calls: { provider: callProvider },
    scoreCard: { name: scoreCardName, template: scoreCardTemplate }
  };

  const steps = [
    { number: 1, label: 'Select Business' },
    { number: 2, label: 'Add Team' },
    { number: 3, label: 'Connect Calls' },
    { number: 4, label: 'Add score cards' },
    { number: 5, label: 'Launch' }
  ];

  const handleNext = () => {
    if (currentStep < 5) setCurrentStep(currentStep + 1);
  };

  const handlePrev = () => {
    if (currentStep > 1) setCurrentStep(currentStep - 1);
  };

  const handleLaunch = () => {
    alert(`Setup complete! Business: ${businessTitle}`);
    // Add your launch logic here
  };

  const renderStepContent = () => {
    switch (currentStep) {
      case 1:
        return (
          <>
            <h2 className="text-4xl font-light text-gray-700 mb-8">
              {businessTitle || 'Business Title'}
            </h2>
            <div className="mb-8">
              <p className="text-gray-800 mb-1">
                Write the name of your{' '}
                <span className="text-green-600 font-medium">Business/Agency</span>.
              </p>
              <p className="text-gray-800">
                Just add title and select{' '}
                <span className="text-green-600 font-medium">business type</span> and
                follow up some questions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-4xl">
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Business Title
                </label>
                <input
                  type="text"
                  value={businessTitle}
                  onChange={(e) => setBusinessTitle(e.target.value)}
                  placeholder="Enter business name"
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Business Type
                </label>
                <div className="relative">
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-md appearance-none bg-white text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>Small, Medium Business</option>
                    <option>Enterprise</option>
                    <option>Startup</option>
                    <option>Agency</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Team size
                </label>
                <div className="relative">
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-md appearance-none bg-white text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option>50+ members</option>
                    <option>1-10 members</option>
                    <option>11-25 members</option>
                    <option>26-50 members</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </>
        );

      case 2:
        return (
          <>
            <h2 className="text-4xl font-light text-gray-300 mb-8">
              Add Team
            </h2>
            <div className="mb-8">
              <p className="text-gray-800 mb-1">
                Create your team and add members to collaborate on{' '}
                <span className="text-green-600 font-medium">Call Coach 360°</span>.
              </p>
              <p className="text-gray-800">
                Invite team members to join your workspace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-4xl">
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Team Name
                </label>
                <input
                  type="text"
                  value={teamName}
                  onChange={(e) => setTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Team Members (Email)
                </label>
                <input
                  type="text"
                  value={teamMembers}
                  onChange={(e) => setTeamMembers(e.target.value)}
                  placeholder="email@example.com, user@example.com"
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-4xl font-light text-gray-300 mb-8">
              Connect Calls
            </h2>
            <div className="mb-8">
              <p className="text-gray-800 mb-1">
                Connect your call provider to start auditing calls with{' '}
                <span className="text-green-600 font-medium">Call Coach 360°</span>.
              </p>
              <p className="text-gray-800">
                Supported providers: Zoom, Teams, Twilio, and more.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-4xl">
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Call Provider
                </label>
                <div className="relative">
                  <select
                    value={callProvider}
                    onChange={(e) => setCallProvider(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-md appearance-none bg-white text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select Provider</option>
                    <option>Zoom</option>
                    <option>Microsoft Teams</option>
                    <option>Google Meet</option>
                    <option>Twilio</option>
                    <option>Other</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  API Key
                </label>
                <input
                  type="password"
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                  placeholder="Enter API Key"
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </>
        );

      case 4:
        return (
          <>
            <h2 className="text-4xl font-light text-gray-300 mb-8">
              Add Score Cards
            </h2>
            <div className="mb-8">
              <p className="text-gray-800 mb-1">
                Create score cards to define metrics and evaluation criteria for{' '}
                <span className="text-green-600 font-medium">call audits</span>.
              </p>
              <p className="text-gray-800">
                Use templates or create custom score cards.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-4xl">
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Score Card Name
                </label>
                <input
                  type="text"
                  value={scoreCardName}
                  onChange={(e) => setScoreCardName(e.target.value)}
                  placeholder="e.g., Customer Service Quality"
                  className="w-full px-4 py-4 border border-gray-300 rounded-md text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-gray-500 text-xs mb-3">
                  Template
                </label>
                <div className="relative">
                  <select
                    value={scoreCardTemplate}
                    onChange={(e) => setScoreCardTemplate(e.target.value)}
                    className="w-full px-4 py-4 border border-gray-300 rounded-md appearance-none bg-white text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent cursor-pointer"
                  >
                    <option value="">Select Template</option>
                    <option>Sales Call Quality</option>
                    <option>Customer Support</option>
                    <option>Lead Generation</option>
                    <option>Custom</option>
                  </select>
                  <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                </div>
              </div>
            </div>
          </>
        );

      case 5:
        return (
          <>
            <h2 className="text-4xl font-light text-gray-300 mb-8">
              Review & Launch
            </h2>
            <div className="mb-8">
              <p className="text-gray-800 mb-2">
                Review your setup before launching{' '}
                <span className="text-green-600 font-medium">Call Coach 360°</span>.
              </p>
            </div>
            <div className="space-y-6 max-w-4xl">
              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Business Information</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Title:</span> {businessTitle || 'Not provided'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Type:</span> {businessType}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Team Size:</span> {teamSize}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Team</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Team Name:</span> {teamName || 'Not provided'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Members:</span> {teamMembers || 'Not provided'}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Call Provider</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Provider:</span> {callProvider || 'Not provided'}
                </p>
              </div>

              <div className="bg-gray-50 p-6 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Score Card</h3>
                <p className="text-gray-700">
                  <span className="font-medium">Name:</span> {scoreCardName || 'Not provided'}
                </p>
                <p className="text-gray-700">
                  <span className="font-medium">Template:</span> {scoreCardTemplate || 'Not provided'}
                </p>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f5f0] flex flex-col">
      {/* Top Blue Bar */}
      <div className="bg-blue-600 h-1 w-full"></div>

      {/* Header */}
      <div className="pt-8 pb-4 px-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-8">
            <span className="text-gray-600 text-sm">Call Coach</span>
            <span className="text-green-600 font-semibold text-sm">360°</span>
          </div>

          <h1 className="text-5xl font-bold text-gray-900 mb-3">
            Call Coach 360° - Setup
          </h1>
          <p className="text-gray-600 text-sm">
            Start creating new score card to audit call
          </p>
          <p className="text-gray-600 text-sm">
            with <span className="text-green-600 font-medium">Call Coach 360°</span>
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border-2 border-dotted border-gray-300 rounded p-4">
            <div className="flex items-center">
              {steps.map((step, index) => (
                <React.Fragment key={step.number}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-semibold ${
                        step.number < currentStep
                          ? 'bg-green-500 text-white'
                          : step.number === currentStep
                          ? 'bg-green-500 text-white'
                          : 'bg-transparent text-gray-400'
                      }`}
                    >
                      {step.number < currentStep ? '✓' : step.number}
                    </div>
                    <span
                      className={`text-sm whitespace-nowrap ${
                        step.number <= currentStep ? 'text-gray-700' : 'text-gray-400'
                      }`}
                    >
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className="flex-1 flex items-center px-4">
                      <div className="flex-1 h-px bg-gray-300"></div>
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white border-2 border-dotted border-gray-300 rounded p-12">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-6 py-3 bg-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-400 disabled:opacity-50 disabled:cursor-not-allowed transition"
            >
              Previous
            </button>

            <span className="text-gray-600 font-medium">
              Step {currentStep} of 5
            </span>

            {currentStep === 5 ? (
              <button
                onClick={handleLaunch}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Launch
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-6 py-3 bg-green-600 text-white rounded-lg font-medium hover:bg-green-700 transition"
              >
                Next
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}