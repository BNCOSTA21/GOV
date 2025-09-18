import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Shield, Lock, CheckCircle, Check } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Header } from '@/components/Header';
import { LoadingSpinner } from '@/components/LoadingSpinner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';

const PagamentoScreen: React.FC = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(0);
  const [completedSteps, setCompletedSteps] = useState<number[]>([]);
  const [progress, setProgress] = useState(0);

  const etapas = [
    "Validando dados do cidadão",
    "Conferindo informações do Cadastro Único", 
    "Atualizando situação cadastral",
    "Preparando liberação do benefício"
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      if (currentStep < etapas.length) {
        setCompletedSteps(prev => [...prev, currentStep]);
        setCurrentStep(prev => prev + 1);
        setProgress((currentStep + 1) * 25);
      } else {
        setTimeout(() => {
          navigate('/pix');
        }, 2000);
      }
    }, 1800);

    return () => clearInterval(timer);
  }, [currentStep, navigate]);

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
      return <LoadingSpinner size="sm" />;
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
        <Card className="bg-white rounded-xl shadow-lg w-full max-w-2xl mx-4 border-0">
          <CardHeader className="text-center pb-6">
            <div className="flex justify-center mb-4">
              <LoadingSpinner size="lg" />
            </div>
            <CardTitle className="text-2xl font-bold text-gray-900">
              🔄 Efetuando Cadastro
            </CardTitle>
            <p className="text-gray-600 mt-2">Preparando sua solicitação para ativar o Bolsa Família.</p>
          </CardHeader>
          
          <CardContent className="space-y-6">
            <div className="space-y-2">
              <div className="flex justify-between text-sm text-gray-600">
                <span>Progresso</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="h-2" />
            </div>

            <div className="space-y-4">
              {etapas.map((etapa, index) => (
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
                    {etapa}
                  </span>
                </motion.div>
              ))}
            </div>

            <div className="grid grid-cols-3 gap-4 pt-4">
              <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
                <Lock className="text-green-600 mx-auto mb-2" size={20} />
                <p className="text-xs text-green-700 font-medium">Seguro</p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
                <Shield className="text-green-600 mx-auto mb-2" size={20} />
                <p className="text-xs text-green-700 font-medium">Criptografado</p>
              </div>
              <div className="bg-green-50 rounded-lg border border-green-200 p-3 text-center">
                <CheckCircle className="text-green-600 mx-auto mb-2" size={20} />
                <p className="text-xs text-green-700 font-medium">Verificado</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </motion.div>
    </div>
  );
};

export default PagamentoScreen;