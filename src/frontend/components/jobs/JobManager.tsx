import { useState, useEffect } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Download } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { useSession } from "@supabase/auth-helpers-react";

interface Job {
  id: string;
  solver_id: string;
  dataset_id: string;
  status: 'PENDING' | 'RUNNING' | 'COMPLETED' | 'FAILED';
  parameters: Record<string, any>;
  results: any;
  logs: string[];
  error_message?: string;
}

export const JobManager = () => {
  const [jobs, setJobs] = useState<Job[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const session = useSession();

  useEffect(() => {
    if (session?.user) {
      fetchJobs();
      const channel = subscribeToJobUpdates();
      return () => {
        channel.unsubscribe();
      };
    }
  }, [session]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('optimization_jobs')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
      toast.error('Failed to fetch jobs');
    } finally {
      setIsLoading(false);
    }
  };

  const subscribeToJobUpdates = () => {
    const channel = supabase
      .channel('job-updates')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'optimization_jobs',
        },
        (payload) => {
          console.log('Job update received:', payload);
          if (payload.eventType === 'UPDATE') {
            setJobs(prevJobs => 
              prevJobs.map(job => 
                job.id === payload.new.id ? { ...job, ...payload.new } : job
              )
            );
          } else if (payload.eventType === 'INSERT') {
            setJobs(prevJobs => [payload.new, ...prevJobs]);
          }
        }
      )
      .subscribe();

    return channel;
  };

  const handleDownloadResults = (job: Job) => {
    if (!job.results) {
      toast.error('No results available for this job');
      return;
    }

    const resultsText = `
Optimization Results for Job ${job.id}
=====================================

Parameters:
${JSON.stringify(job.parameters, null, 2)}

Results:
${JSON.stringify(job.results, null, 2)}

Logs:
${job.logs?.join('\n') || 'No logs available'}
    `.trim();

    const blob = new Blob([resultsText], { type: 'text/plain' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `optimization_results_${job.id}.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  };

  const getStatusColor = (status: Job['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 'bg-green-500';
      case 'FAILED':
        return 'bg-red-500';
      case 'RUNNING':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getProgressValue = (status: Job['status']) => {
    switch (status) {
      case 'COMPLETED':
        return 100;
      case 'FAILED':
        return 100;
      case 'RUNNING':
        return 50;
      default:
        return 0;
    }
  };

  if (isLoading) {
    return <div>Loading jobs...</div>;
  }

  return (
    <div className="space-y-4">
      <h2 className="text-2xl font-bold">Optimization Jobs</h2>
      {jobs.length === 0 ? (
        <Card>
          <CardContent className="p-6">
            <p className="text-center text-gray-500">No jobs found</p>
          </CardContent>
        </Card>
      ) : (
        jobs.map((job) => (
          <Card key={job.id}>
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                <span>Job {job.id.slice(0, 8)}</span>
                <div className="flex items-center gap-2">
                  {job.status === 'COMPLETED' && job.results && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleDownloadResults(job)}
                      className="flex items-center gap-2"
                    >
                      <Download className="h-4 w-4" />
                      Download Results
                    </Button>
                  )}
                  <span className={`px-2 py-1 rounded text-white text-sm ${getStatusColor(job.status)}`}>
                    {job.status}
                  </span>
                </div>
              </CardTitle>
              <CardDescription>
                Created at: {new Date(job.created_at).toLocaleString()}
              </CardDescription>
            </CardHeader>
            <CardContent>
              {job.error_message && (
                <div className="text-red-500 mb-4">
                  Error: {job.error_message}
                </div>
              )}
              {job.status === 'RUNNING' && (
                <Progress value={getProgressValue(job.status)} className="mb-4" />
              )}
              {job.logs && job.logs.length > 0 && (
                <div className="space-y-2 mt-4">
                  <h3 className="font-semibold">Logs:</h3>
                  <div className="bg-gray-100 p-4 rounded max-h-40 overflow-y-auto">
                    {job.logs.map((log, index) => (
                      <div key={index} className="font-mono text-sm">
                        {log}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        ))
      )}
    </div>
  );
};