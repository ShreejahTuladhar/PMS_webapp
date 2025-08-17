import { useState } from 'react';
import toast from 'react-hot-toast';

const SupportModal = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState('chat');
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState([
    {
      id: 1,
      sender: 'system',
      message: 'Hello! How can I help you today?',
      time: new Date().toISOString()
    }
  ]);
  const [ticketForm, setTicketForm] = useState({
    subject: '',
    category: '',
    priority: 'medium',
    description: ''
  });

  const supportCategories = [
    { id: 'booking', name: 'Booking Issues', icon: '📅' },
    { id: 'payment', name: 'Payment Problems', icon: '💳' },
    { id: 'technical', name: 'Technical Support', icon: '🔧' },
    { id: 'account', name: 'Account Help', icon: '👤' },
    { id: 'general', name: 'General Inquiry', icon: '❓' }
  ];

  const quickActions = [
    {
      title: 'Report a Problem',
      description: 'Having trouble with parking or payment?',
      action: () => {
        setActiveTab('ticket');
        setTicketForm(prev => ({ ...prev, category: 'technical' }));
      }
    },
    {
      title: 'Billing Question',
      description: 'Questions about charges or refunds?',
      action: () => {
        setActiveTab('ticket');
        setTicketForm(prev => ({ ...prev, category: 'payment' }));
      }
    },
    {
      title: 'How-to Guide',
      description: 'Learn how to use our features',
      action: () => setActiveTab('faq')
    },
    {
      title: 'Contact Phone',
      description: 'Speak with our support team',
      action: () => window.open('tel:+1234567890')
    }
  ];

  const faqData = [
    {
      question: 'How do I book a parking spot?',
      answer: 'You can book a parking spot by clicking on "Find Parking" from your dashboard, selecting your preferred location, and choosing your time slot.'
    },
    {
      question: 'Can I extend my parking time?',
      answer: 'Yes! You can extend your parking time through your digital ticket or by contacting support. Additional charges may apply.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards, debit cards, and digital payment methods including PayPal and mobile wallets.'
    },
    {
      question: 'How do I cancel a booking?',
      answer: 'You can cancel your booking from the "Booking History" section in your dashboard. Cancellation policies vary by location.'
    },
    {
      question: 'What if I lost my digital ticket?',
      answer: 'Don\'t worry! You can access your digital ticket anytime from your dashboard. You can also use your booking confirmation code at the exit.'
    }
  ];

  const handleSendMessage = (e) => {
    e.preventDefault();
    if (!chatMessage.trim()) return;

    const newMessage = {
      id: chatMessages.length + 1,
      sender: 'user',
      message: chatMessage,
      time: new Date().toISOString()
    };

    setChatMessages(prev => [...prev, newMessage]);
    setChatMessage('');

    // Simulate AI response
    setTimeout(() => {
      const responses = [
        "Thank you for your message. I'm looking into this for you.",
        "I understand your concern. Let me help you with that.",
        "That's a great question! Here's what I can tell you...",
        "I've noted your issue. A support agent will respond shortly.",
        "Thanks for contacting us. Is there anything specific I can help with?"
      ];
      
      const aiResponse = {
        id: chatMessages.length + 2,
        sender: 'system',
        message: responses[Math.floor(Math.random() * responses.length)],
        time: new Date().toISOString()
      };
      
      setChatMessages(prev => [...prev, aiResponse]);
    }, 1000);
  };

  const handleSubmitTicket = (e) => {
    e.preventDefault();
    
    if (!ticketForm.subject || !ticketForm.category || !ticketForm.description) {
      toast.error('Please fill in all required fields');
      return;
    }

    // Simulate ticket submission
    toast.success('Support ticket submitted successfully! We\'ll get back to you soon.');
    setTicketForm({
      subject: '',
      category: '',
      priority: 'medium',
      description: ''
    });
    onClose();
  };

  const formatTime = (timestamp) => {
    return new Date(timestamp).toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-500 to-red-500 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Customer Support</h2>
              <p className="text-orange-100 text-sm">We're here to help you 24/7</p>
            </div>
            <button
              onClick={onClose}
              className="text-white hover:text-gray-200 transition-colors"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Tab Navigation */}
          <div className="flex space-x-4 mt-4">
            {[
              { id: 'chat', name: 'Live Chat', icon: '💬' },
              { id: 'ticket', name: 'Submit Ticket', icon: '🎫' },
              { id: 'faq', name: 'FAQ', icon: '❓' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  activeTab === tab.id
                    ? 'bg-white text-orange-600'
                    : 'bg-orange-400 text-white hover:bg-orange-300'
                }`}
              >
                {tab.icon} {tab.name}
              </button>
            ))}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 max-h-96 overflow-y-auto">
          {/* Quick Actions */}
          {activeTab === 'chat' && (
            <div>
              <div className="grid grid-cols-2 gap-3 mb-6">
                {quickActions.map((action, index) => (
                  <button
                    key={index}
                    onClick={action.action}
                    className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    <h4 className="font-medium text-gray-900 text-sm">{action.title}</h4>
                    <p className="text-xs text-gray-600 mt-1">{action.description}</p>
                  </button>
                ))}
              </div>

              {/* Chat Messages */}
              <div className="bg-gray-50 rounded-lg p-4 h-64 overflow-y-auto mb-4">
                <div className="space-y-3">
                  {chatMessages.map((message) => (
                    <div
                      key={message.id}
                      className={`flex ${message.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div
                        className={`max-w-xs px-3 py-2 rounded-lg text-sm ${
                          message.sender === 'user'
                            ? 'bg-blue-600 text-white'
                            : 'bg-white border border-gray-200'
                        }`}
                      >
                        <p>{message.message}</p>
                        <p className={`text-xs mt-1 ${
                          message.sender === 'user' ? 'text-blue-100' : 'text-gray-500'
                        }`}>
                          {formatTime(message.time)}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Chat Input */}
              <form onSubmit={handleSendMessage} className="flex space-x-2">
                <input
                  type="text"
                  value={chatMessage}
                  onChange={(e) => setChatMessage(e.target.value)}
                  placeholder="Type your message..."
                  className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                />
                <button
                  type="submit"
                  className="bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                  Send
                </button>
              </form>
            </div>
          )}

          {/* Submit Ticket */}
          {activeTab === 'ticket' && (
            <form onSubmit={handleSubmitTicket} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Subject *
                </label>
                <input
                  type="text"
                  value={ticketForm.subject}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, subject: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Brief description of your issue"
                  required
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <select
                  value={ticketForm.category}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, category: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  required
                >
                  <option value="">Select a category</option>
                  {supportCategories.map((cat) => (
                    <option key={cat.id} value={cat.id}>
                      {cat.icon} {cat.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={ticketForm.priority}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, priority: e.target.value }))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description *
                </label>
                <textarea
                  value={ticketForm.description}
                  onChange={(e) => setTicketForm(prev => ({ ...prev, description: e.target.value }))}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                  placeholder="Please provide detailed information about your issue..."
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-orange-600 text-white py-2 rounded-lg hover:bg-orange-700 transition font-medium"
              >
                Submit Support Ticket
              </button>
            </form>
          )}

          {/* FAQ */}
          {activeTab === 'faq' && (
            <div className="space-y-4">
              <div className="text-center mb-6">
                <h3 className="text-lg font-semibold text-gray-900">Frequently Asked Questions</h3>
                <p className="text-gray-600 text-sm">Find quick answers to common questions</p>
              </div>

              {faqData.map((faq, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-medium text-gray-900 mb-2">❓ {faq.question}</h4>
                  <p className="text-gray-600 text-sm leading-relaxed">{faq.answer}</p>
                </div>
              ))}

              <div className="text-center pt-4">
                <p className="text-gray-600 text-sm mb-3">Still need help?</p>
                <button
                  onClick={() => setActiveTab('chat')}
                  className="bg-orange-600 text-white px-6 py-2 rounded-lg hover:bg-orange-700 transition"
                >
                  Start Live Chat
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default SupportModal;