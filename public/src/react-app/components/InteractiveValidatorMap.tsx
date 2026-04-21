import { MapPin } from 'lucide-react';

interface ValidatorNode {
  id: string;
  provider: string;
  location: string;
  country: string;
  type: 'compute' | 'storage' | 'bandwidth' | 'iot';
  status: 'active' | 'idle';
  uptime: number;
  devices: number;
  blocksValidated: number;
  lat: number;
  lng: number;
}

interface Props {
  validators: ValidatorNode[];
  selectedType: string;
}

export default function InteractiveValidatorMap({ validators, selectedType }: Props) {
  const filteredValidators = selectedType === 'all' 
    ? validators 
    : validators.filter(v => v.type === selectedType);

  const getTypeColor = (type: string) => {
    switch (type) {
      case 'compute': return 'bg-blue-500';
      case 'storage': return 'bg-purple-500';
      case 'bandwidth': return 'bg-green-500';
      case 'iot': return 'bg-orange-500';
      default: return 'bg-cyan-500';
    }
  };

  return (
    <div className="relative w-full h-[400px] bg-gradient-to-br from-blue-950/30 to-purple-950/30 rounded-xl overflow-hidden border border-cyan-500/20">
      {/* World Map Placeholder */}
      <div className="absolute inset-0 flex items-center justify-center">
        <div className="relative w-full h-full opacity-20">
          <svg viewBox="0 0 1000 500" className="w-full h-full">
            <path
              d="M0 250 Q250 200 500 250 T1000 250"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
              className="text-cyan-400"
            />
            <path
              d="M0 300 Q250 280 500 300 T1000 300"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
              className="text-cyan-400"
            />
            <path
              d="M0 200 Q250 180 500 200 T1000 200"
              stroke="currentColor"
              fill="none"
              strokeWidth="1"
              className="text-cyan-400"
            />
          </svg>
        </div>
      </div>

      {/* Validator Nodes */}
      <div className="absolute inset-0 p-8">
        {filteredValidators.map((validator) => {
          // Calculate position based on lat/lng
          const x = ((validator.lng + 180) / 360) * 100;
          const y = ((90 - validator.lat) / 180) * 100;

          return (
            <div
              key={validator.id}
              className="absolute group"
              style={{
                left: `${x}%`,
                top: `${y}%`,
                transform: 'translate(-50%, -50%)'
              }}
            >
              {/* Node Marker */}
              <div className={`w-4 h-4 rounded-full ${getTypeColor(validator.type)} ${validator.status === 'active' ? 'animate-pulse' : ''} shadow-lg cursor-pointer transition-transform hover:scale-150`} />
              
              {/* Pulse Effect */}
              {validator.status === 'active' && (
                <div className={`absolute inset-0 w-4 h-4 rounded-full ${getTypeColor(validator.type)} opacity-50 animate-ping`} />
              )}

              {/* Tooltip */}
              <div className="absolute bottom-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-10">
                <div className="bg-black/90 border border-cyan-500/30 rounded-lg p-3 whitespace-nowrap shadow-xl">
                  <div className="text-xs font-bold text-cyan-400 mb-1">{validator.provider}</div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1 mb-1">
                    <MapPin className="w-3 h-3" />
                    {validator.location}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    <span className="text-cyan-400">{validator.uptime}%</span> uptime • 
                    <span className="text-cyan-400"> {validator.devices}</span> devices
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Legend */}
      <div className="absolute bottom-4 right-4 bg-black/80 border border-cyan-500/30 rounded-lg p-3">
        <div className="text-xs font-bold text-cyan-400 mb-2">Node Types</div>
        <div className="space-y-1 text-xs">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-blue-500" />
            <span className="text-muted-foreground">Compute</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-purple-500" />
            <span className="text-muted-foreground">Storage</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500" />
            <span className="text-muted-foreground">Bandwidth</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-orange-500" />
            <span className="text-muted-foreground">IoT Gateway</span>
          </div>
        </div>
      </div>
    </div>
  );
}
