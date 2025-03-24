import * as React from 'react';
import { useNavigate } from 'react-router-dom';
import { Button } from '../components/ui/Button';

const NotFoundPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="flex items-center justify-center h-screen bg-gray-100">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-gray-900 mb-4">404</h1>
        <p className="text-xl text-gray-600 mb-8">Oops! The page you're looking for doesn't exist.</p>
        <Button
          variant="default"
          onClick={() => navigate('/')}
        >
          Go to Homepage
        </Button>
      </div>
    </div>
  );
};

export default NotFoundPage;
