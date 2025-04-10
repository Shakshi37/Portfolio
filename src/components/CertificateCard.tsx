import React from 'react';
import { Award, Calendar, ExternalLink } from 'lucide-react';

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

interface CertificateCardProps {
  certificate: Certificate;
  isDarkMode?: boolean;
}

const CertificateCard: React.FC<CertificateCardProps> = ({ certificate, isDarkMode = false }) => {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long'
    });
  };

  return (
    <div className={`rounded-lg shadow-lg overflow-hidden transition-transform duration-300 hover:scale-105 ${
      isDarkMode ? 'bg-gray-700' : 'bg-white'
    }`}>
      <div className="relative h-48">
        <img
          src={certificate.imageUrl}
          alt={certificate.title}
          className="w-full h-full object-contain"
        />
      </div>
      <div className="p-6">
        <h3 className={`text-xl font-semibold mb-2 ${isDarkMode ? 'text-white' : 'text-gray-800'}`}>{certificate.title}</h3>
        <div className={`flex items-center mb-2 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Award className="w-4 h-4 mr-2" />
          <span>{certificate.issuer}</span>
        </div>
        <div className={`flex items-center mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>
          <Calendar className="w-4 h-4 mr-2" />
          <span>
            {formatDate(certificate.issueDate)}
            {certificate.expiryDate && ` - ${formatDate(certificate.expiryDate)}`}
          </span>
        </div>
        {certificate.description && (
          <p className={`mb-4 ${isDarkMode ? 'text-gray-300' : 'text-gray-600'}`}>{certificate.description}</p>
        )}
        <div className="flex flex-wrap gap-2 mb-4">
          {certificate.skills.map((skill, index) => (
            <span
              key={index}
              className={`px-3 py-1 rounded-full text-sm ${
                isDarkMode
                  ? 'bg-gray-600 text-gray-200'
                  : 'bg-blue-100 text-blue-800'
              }`}
            >
              {skill}
            </span>
          ))}
        </div>
        {certificate.credentialUrl && (
          <a
            href={certificate.credentialUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center text-blue-600 hover:text-blue-800"
          >
            <ExternalLink className="w-4 h-4 mr-2" />
            View Credential
          </a>
        )}
      </div>
    </div>
  );
};

export default CertificateCard; 