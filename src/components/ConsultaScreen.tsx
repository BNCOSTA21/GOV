import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Check, Shield } from 'lucide-react';
import { Header } from './Header';
import { LoadingSpinner } from './LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

interface ConsultaScreenProps {
  onNext: () => void;
}

export const ConsultaScreen: React.FC<ConsultaScreenProps> = ({ onNext }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);

  const steps = [
    "Verificando dados pessoais",
    "Consultando situação fiscal",
    "Analisando irregularidades",
    "Preparando relatório"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < steps.length) {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
      } else {
        setTimeout(() => {
          onNext();
        }, 2000);
      }
    }, 1500);

    return () => clearInterval(timer);
  }, [currentStep, onNext]);

  const renderStepIcon = (stepIndex: number) => {
    if (completedSteps.includes(stepIndex)) {
      return (
        <motion.div 
          className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center"
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        >
          <Check size={14} className="text-white" />
        </motion.div>
      );
    } else if (stepIndex === currentStep) {
      return (
        <div className="w-6 h-6 bg-blue-500 rounded-full flex items-center justify-center">
          <motion.div
            className="w-3 h-3 bg-white rounded-full"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ repeat: Infinity, duration: 1 }}
          />
        </div>
      );
    } else {
      return (
        <div className="w-6 h-6 bg-gray-300 rounded-full flex items-center justify-center">
          <span className="text-xs text-gray-600">{stepIndex + 1}</span>
        </div>
      );
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-blue-50 to-white">
      <Header />
      
      <motion.div 
        className="min-h-screen flex items-center justify-center pt-20"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Card className="bg-white rounded-xl shadow-lg w-full max-w-lg mx-4 border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <LoadingSpinner size="lg" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              Consultando seus dados
            </CardTitle>
            <p className="text-gray-600 mt-2">Aguarde enquanto verificamos suas informações na Receita Federal</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-4">
              {steps.map((step, index) => (
                <motion.div
                  key={index}
                  className="flex items-center space-x-3"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.2 }}
                >
                  {renderStepIcon(index)}
                  <span className={`text-sm ${
                    completedSteps.includes(index) 
                      ? 'text-green-600 font-medium' 
                      : index === currentStep 
                        ? 'text-blue-600 font-medium' 
                        : 'text-gray-500'
                  }`}>
                    {step}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="bg-blue-50 rounded-lg border border-blue-200 p-4">
              <div className="flex items-center space-x-3">
                <Shield className="text-blue-600 flex-shrink-0" size={20} />
                <p className="text-sm text-blue-800">Seus dados estão protegidos por criptografia de ponta a ponta</p>
              </div>
            </div>

            {currentStep >= steps.length && (
              <motion.div
                className="text-center"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.5 }}
              >
                <p className="text-blue-600 font-medium">Redirecionando automaticamente...</p>
              </motion.div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};