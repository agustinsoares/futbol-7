import React from 'react';

interface MatchCardProps {
    id: number;
    homeTeam: string;
    awayTeam: string;
    date: string;
    homeScore?: number;
    awayScore?: number;
    isEditable?: boolean; // For refs/admins
}

export default function MatchCard({ id, homeTeam, awayTeam, date, homeScore, awayScore, isEditable }: MatchCardProps) {
    return (
        <div className="bg-white rounded-lg shadow-md p-4 mb-4">
            <h3 className="text-lg font-nova text-green-600">{homeTeam} vs {awayTeam}</h3>
            <p className="text-sm text-gray-600">{new Date(date).toLocaleString()}</p>
            {homeScore !== undefined && awayScore !== undefined ? (
                <p className="text-xl font-bold">{homeScore} - {awayScore}</p>
            ) : (
                <p className="text-gray-500">TBD</p>
            )}
            {isEditable && (
                <button className="mt-2 bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700">
                    Report Score
                </button>
            )}
        </div>
    );
}