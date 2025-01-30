import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence, Reorder } from 'framer-motion';
import { Settings2, GripVertical, ChevronRight, LayoutPanelTop } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { predictionTypes } from '../live/constants';

export interface Widget {
  id: string;
  name: string;
  enabled: boolean;
  isPrediction?: boolean;
  predictionType?: string;
  wasExplicitlyDisabled?: boolean;
}

interface WidgetCustomizerProps {
  onOrderChange: (widgets: Widget[]) => void;
  onVisibilityChange: (widgets: Widget[]) => void;
  selectedSession?: string;
  selectedDriver?: any;
  isRaceSession?: boolean;
}

const defaultWidgets: Widget[] = [
  { id: 'driver-profile', name: 'Driver Profile', enabled: true },
  { id: 'driver-standings', name: 'Driver Standings', enabled: true },
  { id: 'telemetry', name: 'Real-time Telemetry', enabled: true },
  { id: 'circuit-map', name: 'Circuit Map', enabled: true },
  { id: 'sector-analysis', name: 'Sector Analysis', enabled: true },
  { id: 'vital-statistics', name: 'Vital Statistics', enabled: true },
  { id: 'event-display', name: 'Event Display', enabled: true },
  ...predictionTypes.map(type => ({
    id: `prediction-${type}`,
    name: `${type.charAt(0).toUpperCase() + type.slice(1)} Prediction`,
    enabled: true,
    isPrediction: true,
    predictionType: type
  }))
];

const essentialWidgets = ['driver-profile', 'driver-standings'];

const WidgetCustomizer: React.FC<WidgetCustomizerProps> = ({
  onOrderChange,
  onVisibilityChange,
  selectedSession,
  selectedDriver,
  isRaceSession
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [widgets, setWidgets] = useState<Widget[]>(defaultWidgets);

  useEffect(() => {
    const canEnablePrediction = selectedSession && selectedDriver && isRaceSession;
    const updatedWidgets = widgets.map(widget => {
      if (widget.isPrediction) {
        if (!canEnablePrediction) {
          // Désactive si les conditions ne sont pas remplies
          return {
            ...widget,
            enabled: false
          };
        } else {
          // Active automatiquement si les conditions sont réunies
          // et que le widget n'a pas été explicitement désactivé avant
          const wasExplicitlyDisabled = widget.hasOwnProperty('wasExplicitlyDisabled') && widget.wasExplicitlyDisabled;
          return {
            ...widget,
            enabled: wasExplicitlyDisabled ? false : true
          };
        }
      }
      return widget;
    });
    
    setWidgets(updatedWidgets);
    onVisibilityChange?.(updatedWidgets);
  }, [selectedSession, selectedDriver, isRaceSession]);

  const handleToggle = (id: string) => {
    const newWidgets = widgets.map(widget => {
      if (widget.id === id) {
        if (widget.isPrediction) {
          const canEnablePrediction = selectedSession && selectedDriver && isRaceSession;
          if (!canEnablePrediction) return widget;
          
          return {
            ...widget,
            enabled: !widget.enabled,
            wasExplicitlyDisabled: widget.enabled // Si on désactive, on marque comme explicitement désactivé
          };
        }
        return { ...widget, enabled: !widget.enabled };
      }
      return widget;
    });
    
    setWidgets(newWidgets);
    onVisibilityChange?.(newWidgets);
  };

  const handleReorder = (newOrder: Widget[]) => {
    setWidgets(newOrder);
    onOrderChange?.(newOrder);
  };

  const isEssentialWidget = (id: string) => essentialWidgets.includes(id);

  const canToggleWidget = (widget: Widget) => {
    if (isEssentialWidget(widget.id)) return false;
    if (widget.isPrediction) {
      return selectedSession && selectedDriver && isRaceSession;
    }
    return true;
  };

  return (
    <div className="fixed right-8 top-32 z-50">
      <motion.div
        initial={false}
        animate={{ 
          width: isOpen ? '320px' : isHovered ? '180px' : '48px',
          height: isOpen ? 'auto' : '48px',
        }}
        transition={{
          width: { type: "spring", stiffness: 500, damping: 30 },
          height: { duration: 0.3 }
        }}
        className="overflow-hidden"
      >
        <Card className="bg-[#37415b] border-none shadow-xl">
          <CardContent className="p-0">
            <motion.div
              className="relative h-12"
              onHoverStart={() => !isOpen && setIsHovered(true)}
              onHoverEnd={() => !isOpen && setIsHovered(false)}
            >
              <AnimatePresence>
                {!isOpen && isHovered && (
                  <motion.span
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    exit={{ opacity: 0, x: 20 }}
                    className="absolute right-14 top-3.5 -translate-y-1/2 text-sm text-white font-medium whitespace-nowrap bg-gradient-to-r from-[#5382ec] to-[#2dd4bf] bg-clip-text text-transparent"
                    transition={{ duration: 0.2 }}
                  >
                    Customize Layout
                  </motion.span>
                )}
              </AnimatePresence>

              <div className="absolute right-0 top-0">
                <Button
                  variant="ghost"
                  size="icon"
                  className={`w-12 h-12 rounded-lg flex items-center justify-center shrink-0
                    ${isOpen ? 'bg-transparent' : 'bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]'}
                    ${isOpen ? 'text-[#5382ec]' : 'text-white'}
                    hover:text-white hover:bg-[#5382ec]
                    transition-all duration-200`}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {isOpen ? <ChevronRight className="w-5 h-5" /> : <LayoutPanelTop className="w-5 h-5" />}
                </Button>
              </div>
            </motion.div>

            <AnimatePresence>
              {isOpen && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="p-4"
                >
                  <div className="flex items-center justify-between mb-4 pb-2 border-b border-gray-700">
                    <div className="flex items-center gap-2">
                      <Settings2 className="w-5 h-5 text-[#5382ec]" />
                      <span className="text-gray-300 font-medium">Layout Customization</span>
                    </div>
                  </div>

                  <div className="max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                    <Reorder.Group
                      axis="y"
                      values={widgets}
                      onReorder={handleReorder}
                      className="space-y-2"
                    >
                      {widgets.map((widget) => (
                        <Reorder.Item
                          key={widget.id}
                          value={widget}
                          className="bg-[#1d1f20] rounded-lg p-3 flex items-center justify-between cursor-move hover:bg-[#2a2d30] transition-colors duration-200"
                        >
                          <div className="flex items-center gap-3">
                            <GripVertical className="w-4 h-4 text-gray-500" />
                            <span className="text-gray-300 text-sm">{widget.name}</span>
                          </div>
                          <label className={`relative inline-flex items-center ${!canToggleWidget(widget) ? 'cursor-not-allowed opacity-50' : 'cursor-pointer'}`}>
                            <input
                              type="checkbox"
                              className="sr-only peer"
                              checked={widget.enabled}
                              onChange={() => canToggleWidget(widget) && handleToggle(widget.id)}
                              disabled={!canToggleWidget(widget)}
                            />
                            <div className="w-9 h-5 bg-gray-700 peer-focus:outline-none rounded-full peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-gradient-to-r from-[#5382ec] to-[#2dd4bf]"></div>
                          </label>
                        </Reorder.Item>
                      ))}
                    </Reorder.Group>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </CardContent>
        </Card>
      </motion.div>

      <style jsx global>{`
        .custom-scrollbar {
          scrollbar-width: thin;
          scrollbar-color: #5382ec #1d1f20;
        }
        
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-track {
          background: #1d1f20;
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: linear-gradient(to bottom, #5382ec, #2dd4bf);
          border-radius: 3px;
        }
        
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #5382ec;
        }
      `}</style>
    </div>
  );
};

export default WidgetCustomizer;