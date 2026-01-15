import React from 'react';

interface PasswordRequirementsProps {
    password: string;
}

export default function PasswordRequirements({ password }: PasswordRequirementsProps) {
    const requirements = [
        { label: 'Au moins 8 caractères', isValid: password.length >= 8 },
        { label: 'Au moins une majuscule (A-Z)', isValid: /[A-Z]/.test(password) },
        { label: 'Au moins une minuscule (a-z)', isValid: /[a-z]/.test(password) },
        { label: 'Au moins un chiffre (0-9)', isValid: /[0-9]/.test(password) },
    ];

    return (
        <div className="mt-2 space-y-2 rounded-md bg-gray-50 p-4 text-sm">
            <p className="font-medium text-gray-700">Le mot de passe doit contenir :</p>
            <ul className="space-y-1">
                {requirements.map((req, index) => (
                    <li key={index} className="flex items-center space-x-2">
                        {req.isValid ? (
                            <svg className="h-5 w-5 text-green-500" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                            </svg>
                        ) : (
                            <svg className="h-5 w-5 text-gray-400" viewBox="0 0 20 20" fill="currentColor">
                                <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                            </svg>
                        )}
                        <span className={req.isValid ? 'text-green-700' : 'text-gray-500'}>
                            {req.label}
                        </span>
                    </li>
                ))}
            </ul>
        </div>
    );
}
