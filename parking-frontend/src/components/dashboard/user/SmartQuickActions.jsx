import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import nlpService from '../../../services/nlpService';
import toast from 'react-hot-toast';

const SmartQuickActions = ({ onTabChange, onModalOpen }) => {
  const [isInputMode, setIsInputMode] = useState(false);
  const [userInput, setUserInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [lastAnalysis, setLastAnalysis] = useState(null);
  const inputRef = useRef(null);
  const navigate = useNavigate();

  // Focus input when entering input mode
  useEffect(() => {
    if (isInputMode && inputRef.current) {
      inputRef.current.focus();
    }
  }, [isInputMode]);

  // Handle quick action button clicks
  const handleQuickAction = (actionType, actionData = {}) => {
    try {
      switch (actionType) {
        case 'find_parking':
          if (onModalOpen) {
            onModalOpen('parking_search', actionData);
          } else {
            // Fallback to navigate to parking page
            navigate('/parking', { state: actionData });
          }
          toast.success('Opening parking search...');
          break;
          
        case 'add_payment':
          onTabChange('payments');
          toast.success('Opening payment management...');
          break;
          
        case 'digital_ticket':
          if (onModalOpen) {
            onModalOpen('digital_ticket', actionData);
          } else {
            // Fallback to navigate to customer journey
            navigate('/parking');
          }
          toast.success('Loading your digital ticket...');
          break;
          
        case 'get_support':
          if (onModalOpen) {
            onModalOpen('support', actionData);
          } else {
            // Fallback to external support
            window.open('mailto:support@parkingmanagement.com', '_blank');
          }
          toast.success('Opening customer support...');
          break;
          
        case 'view_bookings':
          onTabChange('bookings');
          toast.success('Loading booking history...');
          break;
          
        case 'manage_vehicles':
          onTabChange('vehicles');
          toast.success('Opening vehicle management...');
          break;
          
        case 'view_transactions':
          onTabChange('transactions');
          toast.success('Loading transaction history...');
          break;
          
        default:
          toast.error('Action not recognized. Please try again.');
      }
    } catch (error) {
      console.error('Error executing quick action:', error);
      toast.error('Something went wrong. Please try again.');
    }
  };

  // Process natural language input
  const processNaturalLanguage = async (input) => {
    setIsProcessing(true);
    
    try {
      const analysis = nlpService.processUserInput(input);
      setLastAnalysis(analysis);
      
      if (analysis.intent && analysis.confidence > 0.3) {
        // High confidence - execute the action
        const action = analysis.action;
        
        if (action.type === 'navigate') {
          navigate(action.target, { state: action.params });
        } else if (action.type === 'tab_switch') {
          onTabChange(action.target);
        } else if (action.type === 'modal') {
          if (onModalOpen) {
            onModalOpen(action.target, action.params);
          }
        } else if (action.type === 'parking_search') {
          if (onModalOpen) {
            onModalOpen('parking_search', action.params);
          } else {
            navigate('/parking', { state: action.params });
          }
        }
        
        toast.success(`Executing: ${analysis.intent.replace('_', ' ')}`);
        setIsInputMode(false);
        setUserInput('');
      } else if (analysis.confidence > 0.1) {
        // Medium confidence - show suggestions
        setSuggestions(analysis.suggestions);
        toast.info('I understand partially. Here are some suggestions:');
      } else {
        // Low confidence - show help
        setSuggestions([
          "Try: 'Find parking near me'",
          "Try: 'Add payment method'",
          "Try: 'Show my ticket'",
          "Try: 'Get help'"
        ]);
        toast.warning("I didn't quite understand. Try one of these phrases:");
      }
    } catch (error) {
      console.error('Error processing natural language:', error);
      toast.error('Sorry, there was an error understanding your request.');
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle input submission
  const handleInputSubmit = (e) => {
    e.preventDefault();
    if (userInput.trim()) {
      processNaturalLanguage(userInput.trim());
    }
  };

  // Handle suggestion click
  const handleSuggestionClick = (suggestion) => {
    setUserInput(suggestion);
    processNaturalLanguage(suggestion);
  };

  // Quick action buttons data
  const quickActionButtons = [
    {
      id: 'find_parking',
      title: 'Find Parking',
      subtitle: 'Search nearby spots',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
      ),
      gradient: 'from-blue-50 to-blue-100 hover:from-blue-100 hover:to-blue-200',
      iconBg: 'bg-blue-500'
    },
    {
      id: 'add_payment',
      title: 'Add Payment',
      subtitle: 'Manage cards',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
        </svg>
      ),
      gradient: 'from-green-50 to-green-100 hover:from-green-100 hover:to-green-200',
      iconBg: 'bg-green-500'
    },
    {
      id: 'digital_ticket',
      title: 'Digital Ticket',
      subtitle: 'Mobile parking pass',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
        </svg>
      ),
      gradient: 'from-purple-50 to-purple-100 hover:from-purple-100 hover:to-purple-200',
      iconBg: 'bg-purple-500'
    },
    {
      id: 'get_support',
      title: 'Get Support',
      subtitle: 'Help & assistance',
      icon: (
        <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      ),
      gradient: 'from-orange-50 to-orange-100 hover:from-orange-100 hover:to-orange-200',
      iconBg: 'bg-orange-500'
    }
  ];

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
      <div className="flex items-center justify-between mb-6">
        <h3 className="text-lg font-semibold text-gray-900">Quick Actions</h3>
        <button
          onClick={() => setIsInputMode(!isInputMode)}
          className={`px-3 py-1 rounded-lg text-sm font-medium transition-all ${
            isInputMode 
              ? 'bg-blue-100 text-blue-700 hover:bg-blue-200' 
              : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
          }`}
        >
          {isInputMode ? '📱 Buttons' : '💬 Voice Command'}
        </button>
      </div>

      {/* Natural Language Input Mode */}
      {isInputMode && (
        <div className="mb-6 space-y-4">
          <form onSubmit={handleInputSubmit} className="relative">
            <div className="relative">
              <input
                ref={inputRef}
                type="text"
                value={userInput}
                onChange={(e) => setUserInput(e.target.value)}
                placeholder="Try saying: 'Find parking near me' or 'Add payment method'..."
                className="w-full pl-12 pr-20 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                disabled={isProcessing}
              />
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <svg className="h-5 w-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
                </svg>
              </div>
              <button
                type="submit"
                disabled={isProcessing || !userInput.trim()}
                className="absolute inset-y-0 right-0 pr-3 flex items-center"
              >
                {isProcessing ? (
                  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-blue-500"></div>
                ) : (
                  <svg className="h-5 w-5 text-blue-500 hover:text-blue-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                  </svg>
                )}
              </button>
            </div>
          </form>

          {/* Suggestions */}
          {suggestions.length > 0 && (
            <div className="bg-blue-50 rounded-lg p-4">
              <p className="text-sm font-medium text-blue-800 mb-2">💡 Suggestions:</p>
              <div className="space-y-1">
                {suggestions.map((suggestion, index) => (
                  <button
                    key={index}
                    onClick={() => handleSuggestionClick(suggestion)}
                    className="block w-full text-left text-sm text-blue-700 hover:text-blue-900 hover:bg-blue-100 px-2 py-1 rounded transition-colors"
                  >
                    "{suggestion}"
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Analysis Display (for debugging/transparency) */}
          {lastAnalysis && lastAnalysis.confidence > 0 && (
            <div className="bg-gray-50 rounded-lg p-3">
              <p className="text-xs text-gray-600">
                🎯 Understood: <span className="font-medium">{lastAnalysis.intent?.replace('_', ' ')}</span> 
                {' '}(confidence: {Math.round(lastAnalysis.confidence * 100)}%)
              </p>
              {lastAnalysis.entities.location && (
                <p className="text-xs text-gray-600">📍 Location: {lastAnalysis.entities.location}</p>
              )}
              {lastAnalysis.entities.time && (
                <p className="text-xs text-gray-600">⏰ Time: {lastAnalysis.entities.time}</p>
              )}
            </div>
          )}
        </div>
      )}

      {/* Quick Action Buttons */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {quickActionButtons.map((action) => (
          <button
            key={action.id}
            onClick={() => handleQuickAction(action.id)}
            className={`group p-6 bg-gradient-to-br ${action.gradient} rounded-xl text-center transition-all duration-200 hover:shadow-md ${
              isInputMode ? 'opacity-75' : ''
            }`}
            disabled={isProcessing}
          >
            <div className={`w-12 h-12 ${action.iconBg} rounded-lg flex items-center justify-center mx-auto mb-3 group-hover:scale-110 transition-transform`}>
              {action.icon}
            </div>
            <p className="text-sm font-semibold text-gray-800">{action.title}</p>
            <p className="text-xs text-gray-600 mt-1">{action.subtitle}</p>
          </button>
        ))}
      </div>

      {/* Help Text */}
      <div className="mt-4 p-3 bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg">
        <p className="text-xs text-gray-600 text-center">
          💡 <strong>Pro tip:</strong> Try voice commands like "Find parking near airport" or "Show my booking history"
        </p>
      </div>
    </div>
  );
};

export default SmartQuickActions;