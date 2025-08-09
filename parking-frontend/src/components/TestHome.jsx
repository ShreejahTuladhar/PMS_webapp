import { useState } from 'react';

function TestHome() {
  console.log('TestHome rendering...');
  const [test, setTest] = useState('Hello World');
  
  return (
    <div className="p-8">
      <h1 className="text-4xl font-bold text-blue-600 mb-4">ParkSathi Test Page</h1>
      <p className="text-lg text-gray-700 mb-4">{test}</p>
      <button 
        onClick={() => setTest('Button clicked!')}
        className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700"
      >
        Click me
      </button>
      <div className="mt-6 p-4 bg-green-100 rounded">
        <p>If you can see this, React is working!</p>
      </div>
    </div>
  );
}

export default TestHome;