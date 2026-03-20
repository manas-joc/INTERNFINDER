import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';

const DebugAuth: React.FC = () => {
  const { user, token } = useAuth();
  const [isVisible, setIsVisible] = useState(false);

  if (!user && !token) return null;

  return (
    <div className="fixed bottom-4 left-4 z-50">
      <button
        onClick={() => setIsVisible(!isVisible)}
        className="bg-gray-800 text-white px-3 py-1 rounded-t-md text-xs font-mono hover:bg-gray-700 transition-colors"
      >
        {isVisible ? 'Hide Auth Debug' : 'Show Auth Debug'}
      </button>
      
      {isVisible && (
        <div className="bg-gray-900 text-green-400 p-4 rounded-r-md rounded-b-md shadow-lg max-w-md overflow-auto text-xs font-mono border border-gray-700">
          <h3 className="text-white font-bold mb-2 border-b border-gray-700 pb-1">Current Login Session</h3>
          
          <div className="mb-3">
            <span className="text-blue-400 font-bold">User:</span>
            <pre className="mt-1 whitespace-pre-wrap break-all text-gray-300">
              {JSON.stringify(user, null, 2)}
            </pre>
          </div>

          <div>
            <span className="text-yellow-400 font-bold">Token (Key: 'token'):</span>
            <div className="mt-1 p-2 bg-black rounded border border-gray-800 break-all text-gray-400 max-h-32 overflow-y-auto">
              {token}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DebugAuth;
