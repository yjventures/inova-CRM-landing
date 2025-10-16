import { useEffect, useState } from 'react';
import { useMutation, useQuery } from '@tanstack/react-query';
import { quotasApi } from '@/lib/api/quotas';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import Loading from '@/components/common/Loading';
import ErrorState from '@/components/common/ErrorState';

export default function QuotaSettings() {
  const currentYear = new Date().getFullYear();
  const [year, setYear] = useState(currentYear);
  const query = useQuery({ queryKey: ['quota', year], queryFn: () => quotasApi.getCurrent(year) });
  const [monthlyTarget, setMonthlyTarget] = useState<number>(0);
  const [currency, setCurrency] = useState('USD');

  useEffect(() => {
    if (query.data?.data) {
      const d = query.data.data as any;
      setMonthlyTarget(d.monthlyTarget ?? 0);
      setCurrency(d.currency ?? 'USD');
    }
  }, [query.data]);

  const saveMutation = useMutation({
    mutationFn: () => quotasApi.save({ year, monthlyTarget, currency }),
    onSuccess: () => query.refetch(),
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Global Quota</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {query.isLoading && <Loading />}
        {query.error && <ErrorState onRetry={() => query.refetch()} />}

        <div className="grid gap-4 md:grid-cols-3">
          <div>
            <label className="text-sm">Year</label>
            <Input type="number" value={year} onChange={(e)=>setYear(Number(e.target.value||currentYear))} />
          </div>
          <div>
            <label className="text-sm">Monthly Target</label>
            <Input type="number" value={monthlyTarget} onChange={(e)=>setMonthlyTarget(Number(e.target.value||0))} />
          </div>
          <div>
            <label className="text-sm">Currency</label>
            <Input value={currency} onChange={(e)=>setCurrency(e.target.value)} />
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={()=>saveMutation.mutate()} disabled={saveMutation.isPending}>Save</Button>
          <Button variant="outline" onClick={()=>query.refetch()}>Reload</Button>
        </div>
      </CardContent>
    </Card>
  );
}


