import React, { useEffect, useState } from 'react';
import axios from 'axios';
import CertificateCard from './CertificateCard';
import { Award } from 'lucide-react';

interface Certificate {
  _id: string;
  title: string;
  issuer: string;
  issueDate: string;
  expiryDate?: string;
  credentialId?: string;
  credentialUrl?: string;
  imageUrl: string;
  skills: string[];
  description?: string;
}

interface CertificatesProps {
  isDarkMode?: boolean;
}

const Certificates: React.FC<CertificatesProps> = ({ isDarkMode = false }) => {
  const [certificates, setCertificates] = useState<Certificate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchCertificates = async () => {
      try {
        const response = await axios.get('http://localhost:5000/api/certificates');
        setCertificates(response.data);
        setLoading(false);
      } catch (err) {
        setError('Failed to fetch certificates');
        setLoading(false);
      }
    };

    fetchCertificates();
  }, []);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center text-red-500 py-8">
        {error}
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto">
      <div className="text-center mb-12">
        <h2 className={`text-3xl font-bold mb-4 flex items-center justify-center ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>
          <Award className="w-8 h-8 mr-2 text-blue-600" />
          Certificates & Achievements
        </h2>
        <p className={`max-w-2xl mx-auto ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          A collection of my professional certifications and achievements that demonstrate my expertise and continuous learning journey.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {certificates.map((certificate) => (
          <CertificateCard key={certificate._id} certificate={certificate} isDarkMode={isDarkMode} />
        ))}
      </div>

      {certificates.length === 0 && (
        <div className={`text-center py-8 ${isDarkMode ? 'text-gray-400' : 'text-gray-500'}`}>
          No certificates available at the moment.
        </div>
      )}
    </div>
  );
};

export default Certificates; 