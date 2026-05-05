import React, { useState } from 'react';
import { ChevronDown, Building2, Users, Phone, FileText, CheckCircle } from 'lucide-react';

export default function CallCoach360Setup() {
  const [currentStep, setCurrentStep] = useState(1);
  
  // Step 1: Select Business
  const [businessTitle, setBusinessTitle] = useState('');
  const [businessType, setBusinessType] = useState('Small, Medium Business');
  const [teamSize, setTeamSize] = useState('50+ members');

  // Step 2: Add Team
  const [teamManager, setTeamManager] = useState('');
  const [managerID, setManagerID] = useState('');
  const [agents, setAgents] = useState([{ agentName: '', agentID: '' }]);

  // Step 3: Connect Calls
  const [callConnectOption, setCallConnectOption] = useState('upload');

  // Step 4: Add Score Cards
  const [selectedScoreCard, setSelectedScoreCard] = useState('');

  // Step 5: Review
  const formData = {
    business: { title: businessTitle, type: businessType, teamSize },
    team: { manager: teamManager, managerID: managerID, agents: agents },
    calls: { option: callConnectOption },
    scoreCard: { selected: selectedScoreCard }
  };

  const steps = [
    { number: 1, label: 'Select Business', icon: Building2 },
    { number: 2, label: 'Add Team', icon: Users },
    { number: 3, label: 'Connect Calls', icon: Phone },
    { number: 4, label: 'Add score cards', icon: FileText },
    { number: 5, label: 'Launch', icon: CheckCircle }
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
            <input
              type="text"
              value={businessTitle}
              onChange={(e) => setBusinessTitle(e.target.value)}
              placeholder="Business Title"
              className="w-full text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-8 border-none outline-none placeholder-gray-400 focus:placeholder-gray-300 transition-all"
            />
            <div className="mb-10 max-w-3xl">
              <p className="text-gray-700 mb-2 text-base">
                Write the name of your{' '}
                <span className="text-green-600 font-bold">Business/Agency</span>.
              </p>
              <p className="text-gray-600 text-base">
                Just add title and select <span className="text-green-600 font-bold">business type</span> and follow up with some questions.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-8 max-w-3xl">
              <div>
                <label className="block text-gray-700 font-semibold text-sm mb-3">
                  Business Type
                </label>
                <div className="relative">
                  <select
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-lg appearance-none bg-gray-50 hover:bg-white text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all duration-300"
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
                <label className="block text-gray-700 font-semibold text-sm mb-3">
                  Team size
                </label>
                <div className="relative">
                  <select
                    value={teamSize}
                    onChange={(e) => setTeamSize(e.target.value)}
                    className="w-full px-5 py-3 border-2 border-gray-200 rounded-lg appearance-none bg-gray-50 hover:bg-white text-gray-700 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer transition-all duration-300"
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
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Step 2: Add team</h2>
            <p className="text-gray-600 text-sm mb-10">Select and distribute agents and their managers in teams.</p>
            
            <div className="space-y-8 max-w-3xl">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-600 font-medium text-sm mb-3">Team Manager</label>
                  <div className="relative">
                    <select
                      value={teamManager}
                      onChange={(e) => setTeamManager(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none bg-white text-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                    >
                      <option value="">Select Manager</option>
                      <option>John Doe</option>
                      <option>Jane Smith</option>
                      <option>Mike Johnson</option>
                    </select>
                    <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                  </div>
                </div>
                <div>
                  <label className="block text-gray-600 font-medium text-sm mb-3">Manager ID</label>
                  <input
                    type="text"
                    value={managerID}
                    onChange={(e) => setManagerID(e.target.value)}
                    placeholder="Enter Manager ID"
                    className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                  />
                </div>
              </div>

              {agents.map((agent, index) => (
                <div key={index} className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-600 font-medium text-sm mb-3">Team Agent {index + 1}</label>
                    <div className="relative">
                      <select
                        value={agent.agentName}
                        onChange={(e) => {
                          const newAgents = [...agents];
                          newAgents[index].agentName = e.target.value;
                          setAgents(newAgents);
                        }}
                        className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg appearance-none bg-white text-gray-500 text-base focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent cursor-pointer"
                      >
                        <option value="">Select Agent</option>
                        <option>Agent 1</option>
                        <option>Agent 2</option>
                        <option>Agent 3</option>
                      </select>
                      <ChevronDown className="absolute right-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 pointer-events-none" />
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium text-sm mb-3">Agent ID</label>
                    <input
                      type="text"
                      value={agent.agentID}
                      onChange={(e) => {
                        const newAgents = [...agents];
                        newAgents[index].agentID = e.target.value;
                        setAgents(newAgents);
                      }}
                      placeholder="Enter Agent ID"
                      className="w-full px-4 py-3 border-2 border-gray-300 rounded-lg text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
                    />
                  </div>
                </div>
              ))}
            </div>
          </>
        );

      case 3:
        return (
          <>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Step 3: Connect calls</h2>
            <p className="text-gray-600 text-sm mb-10">Choose the fastest way to start auditing</p>
            
            <div className="grid grid-cols-3 gap-8 w-full">
              <button
                onClick={() => setCallConnectOption('upload')}
                className={`p-8 rounded-lg border-2 transition-all duration-300 text-left min-h-48 flex flex-col ${
                  callConnectOption === 'upload'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4 flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Upload recordings</h3>
                  <span className="bg-green-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Recommended</span>
                </div>
                <p className="text-gray-600 text-sm mb-6">Fastest. Upload MP3/WAV files now.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base font-semibold w-full transition-colors">
                  ⬆ Upload
                </button>
              </button>

              <button
                onClick={() => setCallConnectOption('twilio')}
                className={`p-8 rounded-lg border-2 transition-all duration-300 text-left min-h-48 flex flex-col ${
                  callConnectOption === 'twilio'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4 flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Connect Exotel/Twilio</h3>
                  <span className="bg-yellow-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Takes ~10 mins</span>
                </div>
                <p className="text-gray-600 text-sm mb-6">Auto-import recordings from VoIP.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base font-semibold w-full transition-colors">
                  ⇄ Integrate
                </button>
              </button>

              <button
                onClick={() => setCallConnectOption('forward')}
                className={`p-8 rounded-lg border-2 transition-all duration-300 text-left min-h-48 flex flex-col ${
                  callConnectOption === 'forward'
                    ? 'border-blue-600 bg-blue-50 shadow-lg'
                    : 'border-gray-200 bg-white hover:border-gray-300'
                }`}
              >
                <div className="flex items-start justify-between mb-4 flex-1">
                  <h3 className="font-bold text-gray-900 text-lg">Forward recordings</h3>
                  <span className="bg-amber-500 text-white text-xs px-3 py-1 rounded-full font-semibold">Good for agencies</span>
                </div>
                <p className="text-gray-600 text-sm mb-6">Send to unique email/webhook.</p>
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg text-base font-semibold w-full transition-colors">
                  → Select
                </button>
              </button>
            </div>
          </>
        );

      case 4:
        const scoreCardTemplates = [
          { id: 'v3', name: 'Inbound Lead - Book Appointment (v3)', desc: 'Score Card for booking appointment (v3)', color: 'from-pink-400 to-pink-500' },
          { id: 'v2', name: 'Inbound Lead - Book Appointment (v2)', desc: 'Score Card for booking appointment (v2)', color: 'from-blue-400 to-blue-500' },
          { id: 'leads', name: 'Inbound Lead - Leads Collection (v3)', desc: 'Score Card for Leads Collection (v3)', color: 'from-yellow-400 to-yellow-500' }
        ];
        
        return (
          <>
            <h2 className="text-4xl font-bold text-gray-900 mb-2">Step 4: Add score cards</h2>
            <p className="text-gray-600 text-sm mb-8">Choose or create new score cards</p>
            
            <div className="flex items-center justify-end mb-8">
              <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors">
                ➕ Create new score card
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-8 w-full">
              {scoreCardTemplates.map((template) => (
                <button
                  key={template.id}
                  onClick={() => setSelectedScoreCard(template.id)}
                  className={`p-8 rounded-lg border-2 transition-all duration-300 text-left min-h-48 flex flex-col ${
                    selectedScoreCard === template.id
                      ? 'border-blue-600 bg-blue-50 shadow-lg'
                      : 'border-gray-200 bg-white hover:border-gray-300'
                  }`}
                >
                  <div className={`inline-flex items-center justify-center w-14 h-14 rounded-lg bg-gradient-to-br ${template.color} text-white font-bold mb-6 text-base`}>
                    {template.id === 'v3' ? 'B3' : template.id === 'v2' ? 'B3' : 'L3'}
                  </div>
                  <h3 className="font-bold text-gray-900 text-lg mb-3 flex-1">{template.name}</h3>
                  <p className="text-gray-600 text-sm">{template.desc}</p>
                </button>
              ))}
            </div>
          </>
        );

      case 5:
        const callOptions = {
          upload: { name: 'Recordings Uploaded', icon: '⬆' },
          twilio: { name: 'Connect Exotel/Twilio', icon: '⇄' },
          forward: { name: 'Forward recordings', icon: '→' }
        };
        
        const scoreCardDisplay = {
          'v3': 'Inbound Lead - Book Appointment (v3)',
          'v2': 'Inbound Lead - Book Appointment (v2)',
          'leads': 'Inbound Lead - Leads Collection (v3)'
        };
        
        return (
          <>
            <div className="max-w-2xl">
              <h2 className="text-3xl font-bold text-gray-900 mb-8">{businessTitle || 'Business Title'}</h2>
              
              <div className="space-y-6">
                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-600 font-medium text-sm mb-3">Business Type</label>
                    <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700">
                      {businessType}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium text-sm mb-3">Team size</label>
                    <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700">
                      {teamSize}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div>
                    <label className="block text-gray-600 font-medium text-sm mb-3">Calls connect option</label>
                    <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-semibold">
                      {callOptions[callConnectOption].name}
                    </div>
                  </div>
                  <div>
                    <label className="block text-gray-600 font-medium text-sm mb-3">Score card</label>
                    <div className="px-4 py-3 border-2 border-gray-300 rounded-lg bg-white text-gray-700 font-semibold">
                      {selectedScoreCard ? scoreCardDisplay[selectedScoreCard] : 'Not selected'}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </>
        );

      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-slate-50 to-green-50 flex flex-col">
      {/* Top Blue Bar */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 h-1.5 w-full"></div>

      {/* Header */}
      <div className="pt-12 pb-8 px-8 border-b border-gray-200 bg-white/40 backdrop-blur-sm">
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-2 mb-6">
            <span className="text-gray-600 text-sm font-medium">Call Coach</span>
            <span className="text-green-600 font-bold text-sm">360°</span>
          </div>

          <h1 className="text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent mb-3">
            Call Coach 360° - Setup
          </h1>
          <p className="text-gray-600 text-sm max-w-2xl">
            Start creating new score card to audit calls with 
            <span className="text-green-600 font-semibold"> Call Coach 360°</span>
          </p>
        </div>
      </div>

      {/* Progress Steps */}
      <div className="px-8 py-10">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
            <div className="flex items-center justify-between">
              {steps.map((step, index) => {
                const StepIcon = step.icon;
                return (
                  <React.Fragment key={step.number}>
                    <div className="flex flex-col items-center flex-1">
                      <div
                        className={`w-12 h-12 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 mb-2 ${
                          step.number < currentStep
                            ? 'bg-gradient-to-br from-green-500 to-green-600 text-white shadow-lg'
                            : step.number === currentStep
                            ? 'bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg ring-4 ring-blue-200'
                            : 'bg-gray-100 text-gray-400'
                        }`}
                      >
                        {step.number < currentStep ? (
                          <CheckCircle className="w-6 h-6" />
                        ) : (
                          <StepIcon className="w-6 h-6" />
                        )}
                      </div>
                      <span
                        className={`text-xs font-semibold text-center max-w-20 transition-colors duration-300 ${
                          step.number <= currentStep ? 'text-gray-800' : 'text-gray-400'
                        }`}
                      >
                        {step.label}
                      </span>
                    </div>
                    {index < steps.length - 1 && (
                      <div className={`flex-1 h-1 mx-4 transition-all duration-500 rounded-full ${
                        step.number < currentStep
                          ? 'bg-gradient-to-r from-green-500 to-green-400'
                          : 'bg-gray-200'
                      }`}></div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-12 min-h-96">
            {renderStepContent()}
          </div>
        </div>
      </div>

      {/* Navigation Buttons */}
      <div className="px-8 pb-8">
        <div className="max-w-7xl mx-auto">
          <div className="flex justify-between items-center gap-6">
            <button
              onClick={handlePrev}
              disabled={currentStep === 1}
              className="px-8 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-semibold rounded-lg transition-all duration-300 disabled:opacity-40 disabled:cursor-not-allowed border border-gray-300 hover:border-gray-400 shadow-sm"
            >
              ← Previous
            </button>

            <div className="flex items-center gap-2">
              <span className="text-gray-600 font-semibold">
                Step {currentStep}
              </span>
              <span className="text-gray-400">/</span>
              <span className="text-gray-500">{steps.length}</span>
            </div>

            {currentStep === 5 ? (
              <button
                onClick={handleLaunch}
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-500 hover:from-green-700 hover:to-green-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 border border-green-700"
              >
                🚀 Launch
              </button>
            ) : (
              <button
                onClick={handleNext}
                className="px-8 py-3 bg-gradient-to-r from-blue-600 to-blue-500 hover:from-blue-700 hover:to-blue-600 text-white font-semibold rounded-lg transition-all duration-300 shadow-md hover:shadow-lg hover:scale-105 border border-blue-700"
              >
                Next →
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}