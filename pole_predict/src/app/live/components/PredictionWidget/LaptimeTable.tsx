// components/PredictionWidget/LaptimeTable.tsx
import React from 'react';
import { TIME_FORMAT } from '../../constants';
import { PredictionData } from '../../types';

interface LaptimeTableProps {
    data: PredictionData | undefined;
}

export const LaptimeTable: React.FC<LaptimeTableProps> = ({ data }) => {
    if (!data?.lap_predictions) return null;

    return (
        <div className="h-[calc(127%-1rem)] relative -mt-8">
            {/* Conteneur avec dégradé en haut et en bas pour un "fade" élégant */}
            <div className="absolute inset-x-0 h-8 top-0 bg-gradient-to-b from-[#282a2c] to-transparent z-10" />
            <div className="absolute inset-x-0 h-8 bottom-0 bg-gradient-to-t from-[#282a2c] to-transparent z-10" />

            {/* Conteneur du tableau avec scrollbar personnalisé */}
            <div className="h-full overflow-y-auto pr-2 custom-scrollbar">
                <table className="w-full">
                    <thead className="sticky top-0 bg-[#282a2c] z-20">
                        <tr>
                            <th className="px-4 py-2 text-left">
                                <span className="text-lg bg-gradient-to-r from-[#5382ec] to-[#5382ec] bg-clip-text text-transparent font-medium">
                                    Lap
                                </span>
                            </th>
                            <th className="px-4 py-2 text-right">
                                <span className="text-lg bg-gradient-to-r from-[#2dd4bf] to-[#2dd4bf] bg-clip-text text-transparent font-medium">
                                    Predicted
                                </span>
                            </th>
                        </tr>
                    </thead>
                    <tbody>
                        {data.lap_predictions.map((pred, index) => (
                            <tr
                                key={pred.lap_number}
                                className={`
                    border-b border-gray-700/30 hover:bg-gray-700/10 transition-colors duration-150
                    ${index === 0 ? 'bg-gradient-to-r from-[#5382ec]/10 to-[#2dd4bf]/10' : ''}
                  `}
                            >
                                <td className="px-4 py-3 text-left">
                                    <span className={`text-xl font-medium
                      ${index === 0 ? 'bg-gradient-to-r from-[#5382ec] to-[#5382ec] bg-clip-text text-transparent' : 'text-gray-300'}
                    `}>
                                        {pred.lap_number}
                                    </span>
                                </td>
                                <td className="px-4 py-3 text-right">
                                    <span className={`text-xl font-mono font-medium
                      ${index === 0 ? 'bg-gradient-to-r from-[#2dd4bf] to-[#2dd4bf] bg-clip-text text-transparent' : 'text-gray-300'}
                    `}>
                                        {TIME_FORMAT.format(pred.predicted_time)}
                                    </span>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
};