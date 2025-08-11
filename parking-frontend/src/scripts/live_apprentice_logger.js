#!/usr/bin/env node

/**
 * Live Apprentice Logger - Real-time Claude Code Learning
 * Logs every Claude action, thought process, and generated code in real-time
 */

import fs from 'fs';
import path from 'path';

class LiveApprenticeLogger {
  constructor() {
    this.logFile = path.join(process.cwd(), 'live_claude_session.md');
    this.sessionId = Date.now();
    this.actionCount = 0;
    
    // Initialize log file
    this.initializeSession();
  }

  initializeSession() {
    const header = `# 🔴 LIVE CLAUDE SESSION #${this.sessionId}
**Session Started**: ${new Date().toISOString()}
**Your AI Mentor**: Claude Sonnet 4  
**Learning Mode**: ACTIVE APPRENTICESHIP

---

## 📝 **REAL-TIME ACTION LOG**
*Watch Claude's thought process and code generation in real-time*

`;
    fs.writeFileSync(this.logFile, header);
    console.log(`🔴 Live logging started: ${this.logFile}`);
  }

  /**
   * Log an action with full context
   */
  logAction(action, details = {}) {
    this.actionCount++;
    const timestamp = new Date().toISOString();
    
    const entry = `
### 🎬 **ACTION #${this.actionCount}** - ${action.toUpperCase()}
**Time**: ${timestamp}
**Context**: ${details.context || 'General operation'}

#### 🧠 Claude's Thought Process:
${details.thought || 'Processing...'}

${details.code ? `#### 💻 Generated Code:
\`\`\`${details.language || 'javascript'}
${details.code}
\`\`\`` : ''}

${details.explanation ? `#### 📚 Teaching Moment:
${details.explanation}` : ''}

${details.pattern ? `#### 🔍 Pattern Used:
**${details.pattern}** - ${details.patternExplanation || 'Claude methodology pattern'}` : ''}

---
`;

    fs.appendFileSync(this.logFile, entry);
    console.log(`📝 Logged action #${this.actionCount}: ${action}`);
  }

  /**
   * Log Claude's internal decision-making process
   */
  logDecision(decision, reasoning, alternatives = []) {
    this.actionCount++;
    const timestamp = new Date().toISOString();
    
    const entry = `
### 🤔 **DECISION #${this.actionCount}** - ${decision}
**Time**: ${timestamp}

#### Claude's Reasoning:
${reasoning}

${alternatives.length > 0 ? `#### Alternatives Considered:
${alternatives.map((alt, i) => `${i+1}. ${alt}`).join('\n')}` : ''}

#### Why This Choice:
This aligns with Claude's core principles of precision, verification, and systematic problem-solving.

---
`;

    fs.appendFileSync(this.logFile, entry);
    console.log(`🤔 Logged decision #${this.actionCount}: ${decision}`);
  }

  /**
   * Log a complete problem-solving sequence
   */
  logProblemSolution(problem, solution) {
    this.actionCount++;
    const timestamp = new Date().toISOString();
    
    const entry = `
### 🎯 **PROBLEM-SOLUTION #${this.actionCount}**
**Time**: ${timestamp}

#### 📋 The Problem:
${problem}

#### 🔧 Claude's Solution Approach:
1. **Context Gathering**: ${solution.context || 'Read existing code and understand structure'}
2. **Problem Analysis**: ${solution.analysis || 'Identify root cause and dependencies'}  
3. **Solution Design**: ${solution.design || 'Plan minimal, precise changes'}
4. **Implementation**: ${solution.implementation || 'Execute with surgical precision'}
5. **Verification**: ${solution.verification || 'Test and confirm success'}

#### 💡 Key Learning:
${solution.learning || 'Observe the systematic approach to problem decomposition'}

---
`;

    fs.appendFileSync(this.logFile, entry);
    console.log(`🎯 Logged problem-solution #${this.actionCount}`);
  }

  /**
   * Get current session stats
   */
  getSessionStats() {
    return {
      sessionId: this.sessionId,
      actionsLogged: this.actionCount,
      logFile: this.logFile,
      startTime: new Date(this.sessionId).toISOString()
    };
  }
}

// Create global instance for use throughout session
const liveLogger = new LiveApprenticeLogger();

// Export for use in other scripts
export default liveLogger;

// Example usage
if (import.meta.url === `file://${process.argv[1]}`) {
  // Demonstrate the logging system
  liveLogger.logAction('DEMONSTRATION', {
    context: 'Teaching apprentice how logging works',
    thought: 'I need to show the apprentice how I log my actions. Let me create a simple example that demonstrates the structure.',
    code: `function demonstrateLogging() {
  console.log("This is how Claude logs code!");
  return "Every action is captured for learning";
}`,
    language: 'javascript',
    explanation: 'This is a demonstration of how the live logging system captures every piece of code I generate, along with my thought process.',
    pattern: 'Demonstration Pattern',
    patternExplanation: 'When teaching, Claude provides clear examples with context and explanation'
  });

  liveLogger.logDecision(
    'Create comprehensive logging system',
    'The apprentice wants to learn my methodology, so I need a system that captures not just code, but my entire thought process and decision-making',
    [
      'Simple code logging only',
      'Verbal explanations only', 
      'Comprehensive real-time logging with context'
    ]
  );

  console.log('📊 Session Stats:', liveLogger.getSessionStats());
}