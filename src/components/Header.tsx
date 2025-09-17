import React from 'react';
import { User, Bell } from 'lucide-react';

export const Header: React.FC = () => {
  const renderLogo = () => {
    const logoText = "gov.br";
    const colors = ['#2563EB', '#F2C94C', '#27AE60', 'currentColor', '#2563EB', '#F2C94C'];
    
    return (
      <div className="text-xl font-bold flex items-center">
        {logoText.split('').map((char, index) => (
          <span key={index} style={{ color: colors[index] || 'currentColor' }}>
            {char}
          </span>
        ))}
      </div>
    );
  };

  return (
    <header className="fixed top-0 w-full z-50 bg-white h-16 shadow-sm border-b">
      <div className="container mx-auto px-4 h-full flex items-center justify-between">
        <div className="flex items-center space-x-2">
          {renderLogo()}
        </div>
        
        <div className="flex items-center space-x-4">
          <Bell size={20} className="text-gray-600" />
          <span className="text-sm text-gray-700">Sistema gov.br</span>
          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white text-sm font-semibold">
            <User size={16} />
          </div>
        </div>
      </div>
    </header>
  );
};