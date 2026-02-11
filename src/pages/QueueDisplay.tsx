import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Users, Clock, Volume2, VolumeX, Maximize, RefreshCw } from 'lucide-react';
import { api } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

const QueueDisplay = () => {
  const [selectedDepartment, setSelectedDepartment] = useState<string>('all');
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);

  // Fetch queue data
  const { data: queueEntries = [], refetch } = useQuery({
    queryKey: ['queue', 'display', selectedDepartment],
    queryFn: () => api.getQueue(selectedDepartment !== 'all' ? { department: selectedDepartment } : {}),
    refetchInterval: 5000
  });

  // Fetch now serving
  const { data: nowServing = [] } = useQuery({
    queryKey: ['queue', 'now-serving', selectedDepartment],
    queryFn: () => api.getNowServing(selectedDepartment !== 'all' ? selectedDepartment : undefined),
    refetchInterval: 3000
  });

  // Fetch queue stats
  const { data: queueStats } = useQuery({
    queryKey: ['queue', 'stats'],
    queryFn: () => api.getQueueStats(),
    refetchInterval: 10000
  });

  // Get unique departments from queue
  const departments = [...new Set(queueEntries.map((q: any) => q.department))].filter(Boolean);

  // Filter waiting patients
  const waitingPatients = queueEntries
    .filter((q: any) => q.status === 'waiting')
    .sort((a: any, b: any) => a.priority - b.priority || a.queue_number - b.queue_number);

  // Toggle fullscreen
  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  };

  const getPriorityColor = (priority: number) => {
    if (priority <= 2) return 'bg-red-500 text-white';
    if (priority === 3) return 'bg-yellow-500 text-white';
    return 'bg-blue-500 text-white';
  };

  const formatTime = (dateString: string) => {
    return new Date(dateString).toLocaleTimeString('en-US', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-900 via-blue-800 to-indigo-900 p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-4">
          <div className="bg-white/10 backdrop-blur-sm rounded-xl p-4">
            <h1 className="text-4xl font-bold text-white">Queue Display</h1>
            <p className="text-blue-200">Real-time patient queue status</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <Select value={selectedDepartment} onValueChange={setSelectedDepartment}>
            <SelectTrigger className="w-48 bg-white/10 border-white/20 text-white">
              <SelectValue placeholder="All Departments" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Departments</SelectItem>
              {departments.map((dept: string) => (
                <SelectItem key={dept} value={dept}>{dept}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => setSoundEnabled(!soundEnabled)}
          >
            {soundEnabled ? <Volume2 className="h-5 w-5" /> : <VolumeX className="h-5 w-5" />}
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={() => refetch()}
          >
            <RefreshCw className="h-5 w-5" />
          </Button>
          
          <Button 
            variant="outline" 
            size="icon"
            className="bg-white/10 border-white/20 text-white hover:bg-white/20"
            onClick={toggleFullscreen}
          >
            <Maximize className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {/* Stats Bar */}
      <div className="grid grid-cols-4 gap-4 mb-8">
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-blue-200 text-sm">Waiting</p>
            <p className="text-4xl font-bold text-white">{queueStats?.waiting || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-blue-200 text-sm">Being Served</p>
            <p className="text-4xl font-bold text-green-400">{queueStats?.in_progress || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-blue-200 text-sm">Completed</p>
            <p className="text-4xl font-bold text-blue-300">{queueStats?.completed || 0}</p>
          </CardContent>
        </Card>
        <Card className="bg-white/10 backdrop-blur-sm border-white/20">
          <CardContent className="p-4 text-center">
            <p className="text-blue-200 text-sm">Avg Wait</p>
            <p className="text-4xl font-bold text-yellow-400">
              {queueStats?.avg_wait_minutes ? `${Math.round(queueStats.avg_wait_minutes)}m` : '--'}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Now Serving - Large Display */}
        <div className="lg:col-span-1">
          <Card className="bg-green-600/90 backdrop-blur-sm border-green-400/50 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <div className="w-3 h-3 bg-white rounded-full animate-pulse" />
                NOW SERVING
              </CardTitle>
            </CardHeader>
            <CardContent>
              {nowServing.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-green-200 mx-auto mb-4" />
                  <p className="text-green-100 text-xl">No patients being served</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {nowServing.map((patient: any) => (
                    <div 
                      key={patient.id} 
                      className="bg-white/20 rounded-xl p-6 animate-pulse-slow"
                    >
                      <div className="text-6xl font-bold text-white text-center mb-2">
                        #{patient.queue_number}
                      </div>
                      <div className="text-2xl text-white text-center font-semibold">
                        {patient.first_name} {patient.last_name?.charAt(0)}.
                      </div>
                      <div className="text-green-100 text-center mt-2">
                        {patient.room_number ? `Room ${patient.room_number}` : patient.department}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Waiting List */}
        <div className="lg:col-span-2">
          <Card className="bg-white/10 backdrop-blur-sm border-white/20 h-full">
            <CardHeader className="pb-2">
              <CardTitle className="text-2xl text-white flex items-center gap-2">
                <Clock className="h-6 w-6" />
                WAITING ({waitingPatients.length})
              </CardTitle>
            </CardHeader>
            <CardContent>
              {waitingPatients.length === 0 ? (
                <div className="text-center py-12">
                  <Users className="h-16 w-16 text-blue-300 mx-auto mb-4" />
                  <p className="text-blue-200 text-xl">No patients waiting</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 max-h-[60vh] overflow-y-auto">
                  {waitingPatients.map((patient: any, index: number) => (
                    <div 
                      key={patient.id} 
                      className={`rounded-xl p-4 text-center transition-all ${
                        index < 3 ? 'bg-yellow-500/30 border-2 border-yellow-400/50' : 'bg-white/10'
                      }`}
                    >
                      <Badge className={`${getPriorityColor(patient.priority)} mb-2`}>
                        P{patient.priority}
                      </Badge>
                      <div className="text-3xl font-bold text-white mb-1">
                        #{patient.queue_number}
                      </div>
                      <div className="text-sm text-blue-200 truncate">
                        {patient.first_name} {patient.last_name?.charAt(0)}.
                      </div>
                      <div className="text-xs text-blue-300 mt-1">
                        {patient.department}
                      </div>
                      <div className="text-xs text-blue-400 mt-1">
                        Since {formatTime(patient.check_in_time)}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Footer with time */}
      <div className="mt-8 text-center">
        <p className="text-6xl font-bold text-white/80">
          {new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })}
        </p>
        <p className="text-blue-200 mt-2">
          {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Auto-refresh indicator */}
      <div className="fixed bottom-4 right-4 bg-white/10 backdrop-blur-sm rounded-full px-4 py-2 text-blue-200 text-sm">
        Auto-refreshing every 5 seconds
      </div>
    </div>
  );
};

export default QueueDisplay;
