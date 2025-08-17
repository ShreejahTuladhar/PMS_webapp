class NLPService {
  constructor() {
    // Intent patterns with keywords and synonyms
    this.intentPatterns = {
      'find_parking': {
        keywords: ['find', 'search', 'look', 'locate', 'park', 'parking', 'spot', 'space', 'nearby', 'available'],
        phrases: [
          'find parking', 'search parking', 'look for parking', 'find a spot',
          'locate parking', 'nearby parking', 'available spots', 'park car',
          'where to park', 'parking spaces', 'find spot', 'search spot'
        ],
        synonyms: {
          'find': ['search', 'look', 'locate', 'discover'],
          'parking': ['spot', 'space', 'place', 'area'],
          'nearby': ['close', 'near', 'around', 'local']
        }
      },
      'add_payment': {
        keywords: ['add', 'payment', 'card', 'pay', 'method', 'billing', 'wallet', 'money', 'finance'],
        phrases: [
          'add payment', 'add card', 'payment method', 'add billing',
          'manage payment', 'payment settings', 'wallet', 'add money',
          'credit card', 'debit card', 'bank account'
        ],
        synonyms: {
          'add': ['create', 'set up', 'register', 'include'],
          'payment': ['card', 'billing', 'money', 'finance', 'wallet'],
          'method': ['way', 'option', 'means']
        }
      },
      'digital_ticket': {
        keywords: ['ticket', 'digital', 'pass', 'receipt', 'booking', 'reservation', 'qr', 'code'],
        phrases: [
          'digital ticket', 'parking ticket', 'my ticket', 'show ticket',
          'booking receipt', 'parking pass', 'qr code', 'reservation',
          'ticket details', 'mobile ticket', 'parking voucher'
        ],
        synonyms: {
          'ticket': ['pass', 'receipt', 'voucher', 'token'],
          'digital': ['mobile', 'electronic', 'virtual'],
          'show': ['display', 'view', 'see']
        }
      },
      'get_support': {
        keywords: ['help', 'support', 'assistance', 'contact', 'problem', 'issue', 'trouble', 'customer', 'service'],
        phrases: [
          'get help', 'need help', 'customer support', 'contact support',
          'assistance', 'help me', 'have problem', 'technical support',
          'customer service', 'need assistance', 'trouble', 'issue'
        ],
        synonyms: {
          'help': ['support', 'assistance', 'aid', 'service'],
          'problem': ['issue', 'trouble', 'difficulty', 'error'],
          'contact': ['reach', 'call', 'message', 'speak']
        }
      },
      'view_bookings': {
        keywords: ['booking', 'history', 'past', 'previous', 'reservations', 'appointments'],
        phrases: [
          'view bookings', 'booking history', 'my bookings', 'past bookings',
          'previous reservations', 'booking list', 'see bookings'
        ],
        synonyms: {
          'view': ['see', 'show', 'display', 'look at'],
          'booking': ['reservation', 'appointment', 'slot'],
          'history': ['past', 'previous', 'old', 'earlier']
        }
      },
      'manage_vehicles': {
        keywords: ['vehicle', 'car', 'bike', 'motorcycle', 'truck', 'manage', 'add', 'remove'],
        phrases: [
          'manage vehicles', 'add vehicle', 'my vehicles', 'car details',
          'vehicle information', 'register vehicle', 'vehicle list'
        ],
        synonyms: {
          'vehicle': ['car', 'bike', 'motorcycle', 'truck', 'auto'],
          'manage': ['handle', 'control', 'organize'],
          'add': ['register', 'include', 'create']
        }
      },
      'view_transactions': {
        keywords: ['transaction', 'payment', 'money', 'bill', 'receipt', 'financial', 'spent'],
        phrases: [
          'view transactions', 'payment history', 'transaction history',
          'spending', 'bills', 'receipts', 'financial history'
        ],
        synonyms: {
          'transaction': ['payment', 'bill', 'receipt', 'charge'],
          'view': ['see', 'show', 'display', 'check'],
          'history': ['past', 'previous', 'record']
        }
      }
    };

    // Location-based intents
    this.locationIntents = {
      keywords: ['near', 'nearby', 'close', 'around', 'at', 'in'],
      patterns: [
        /near (.+)/i,
        /around (.+)/i,
        /at (.+)/i,
        /in (.+)/i,
        /close to (.+)/i
      ]
    };

    // Time-based intents
    this.timeIntents = {
      keywords: ['now', 'today', 'tomorrow', 'tonight', 'morning', 'afternoon', 'evening', 'later'],
      patterns: [
        /for (\d+) hour/i,
        /(today|tomorrow|tonight)/i,
        /(morning|afternoon|evening)/i,
        /at (\d{1,2}):?(\d{2})?\s*(am|pm)?/i
      ]
    };
  }

  // Main method to analyze user input and determine intent
  analyzeIntent(userInput) {
    const input = userInput.toLowerCase().trim();
    const results = {
      intent: null,
      confidence: 0,
      entities: {
        location: null,
        time: null,
        vehicle: null,
        amount: null
      },
      suggestions: [],
      action: null
    };

    // Check for each intent
    let maxConfidence = 0;
    let bestIntent = null;

    for (const [intentName, intentData] of Object.entries(this.intentPatterns)) {
      const confidence = this.calculateIntentConfidence(input, intentData);
      
      if (confidence > maxConfidence) {
        maxConfidence = confidence;
        bestIntent = intentName;
      }
    }

    // Extract entities first
    results.entities = this.extractEntities(input);

    // Set the best matching intent if confidence is above threshold
    if (maxConfidence > 0.3) {
      results.intent = bestIntent;
      results.confidence = maxConfidence;
      results.action = this.getActionForIntent(bestIntent, results.entities);
    }

    // Generate suggestions based on partial matches
    results.suggestions = this.generateSuggestions(input, bestIntent);

    return results;
  }

  // Calculate confidence score for an intent
  calculateIntentConfidence(input, intentData) {
    let score = 0;
    const words = input.split(/\s+/);
    const totalWords = words.length;

    // Check exact phrase matches (highest weight)
    for (const phrase of intentData.phrases) {
      if (input.includes(phrase.toLowerCase())) {
        score += 0.8;
      }
    }

    // Check keyword matches
    let keywordMatches = 0;
    for (const keyword of intentData.keywords) {
      if (input.includes(keyword)) {
        keywordMatches++;
        score += 0.3;
      }
    }

    // Check synonym matches
    for (const [word, synonyms] of Object.entries(intentData.synonyms || {})) {
      for (const synonym of synonyms) {
        if (input.includes(synonym)) {
          score += 0.2;
        }
      }
    }

    // Normalize score based on input length
    const normalizedScore = Math.min(score / Math.max(totalWords * 0.1, 1), 1);
    
    return normalizedScore;
  }

  // Extract entities from user input
  extractEntities(input) {
    const entities = {
      location: null,
      time: null,
      vehicle: null,
      amount: null
    };

    // Extract location
    for (const pattern of this.locationIntents.patterns) {
      const match = input.match(pattern);
      if (match) {
        entities.location = match[1].trim();
        break;
      }
    }

    // Extract time
    for (const pattern of this.timeIntents.patterns) {
      const match = input.match(pattern);
      if (match) {
        entities.time = match[0].trim();
        break;
      }
    }

    // Extract vehicle type
    const vehicleTypes = ['car', 'bike', 'motorcycle', 'truck', 'suv', 'sedan'];
    for (const vehicle of vehicleTypes) {
      if (input.includes(vehicle)) {
        entities.vehicle = vehicle;
        break;
      }
    }

    // Extract amount/price
    const amountMatch = input.match(/(\$|\brs\.?\s*)?(\d+(?:\.\d{2})?)/i);
    if (amountMatch) {
      entities.amount = amountMatch[2];
    }

    return entities;
  }

  // Get appropriate action for an intent
  getActionForIntent(intent, entities = {}) {
    const actions = {
      'find_parking': {
        type: 'parking_search',
        target: 'parking_search',
        params: {
          query: entities.location || ''
        }
      },
      'add_payment': {
        type: 'tab_switch',
        target: 'payments',
        params: {}
      },
      'digital_ticket': {
        type: 'modal',
        target: 'digital_ticket',
        params: {}
      },
      'get_support': {
        type: 'modal',
        target: 'support',
        params: {}
      },
      'view_bookings': {
        type: 'tab_switch',
        target: 'bookings',
        params: {}
      },
      'manage_vehicles': {
        type: 'tab_switch',
        target: 'vehicles',
        params: {}
      },
      'view_transactions': {
        type: 'tab_switch',
        target: 'transactions',
        params: {}
      }
    };

    return actions[intent] || null;
  }

  // Generate helpful suggestions
  generateSuggestions(input, bestIntent) {
    const suggestions = [];
    
    if (!bestIntent || bestIntent === null) {
      suggestions.push(
        "Try saying: 'Find parking near me'",
        "Try saying: 'Add payment method'",
        "Try saying: 'Show my ticket'",
        "Try saying: 'Get help'"
      );
    } else {
      // Intent-specific suggestions
      const intentSuggestions = {
        'find_parking': [
          "Find parking near [location]",
          "Search available spots",
          "Book parking for [time]"
        ],
        'add_payment': [
          "Add credit card",
          "Manage payment methods",
          "Update billing info"
        ],
        'digital_ticket': [
          "Show current ticket",
          "View parking pass",
          "Display QR code"
        ],
        'get_support': [
          "Contact customer service",
          "Report an issue",
          "Get technical help"
        ]
      };

      suggestions.push(...(intentSuggestions[bestIntent] || []));
    }

    return suggestions;
  }

  // Process common abbreviations and shortcuts
  expandAbbreviations(input) {
    const abbreviations = {
      'pmt': 'payment',
      'tkt': 'ticket',
      'sup': 'support',
      'bkg': 'booking',
      'veh': 'vehicle',
      'txn': 'transaction',
      'hist': 'history',
      'mgmt': 'management'
    };

    let expanded = input;
    for (const [abbrev, full] of Object.entries(abbreviations)) {
      expanded = expanded.replace(new RegExp(`\\b${abbrev}\\b`, 'gi'), full);
    }

    return expanded;
  }

  // Main processing method
  processUserInput(input) {
    // Expand abbreviations
    const expandedInput = this.expandAbbreviations(input);
    
    // Analyze intent
    const analysis = this.analyzeIntent(expandedInput);
    
    // Add some contextual intelligence
    if (analysis.entities.location && analysis.intent === 'find_parking') {
      analysis.action.params.location = analysis.entities.location;
    }
    
    if (analysis.entities.time) {
      analysis.action.params.time = analysis.entities.time;
    }

    return analysis;
  }
}

export default new NLPService();