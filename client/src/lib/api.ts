export type KPI = {

  key: string;

  label: string;

  value: number;

  formatted: string;

  changePct: number | null;

  direction:
    | "up"
    | "down"
    | "flat";
};


export type Dashboard = {

  generatedAt: string;

  filters: {
    from: string;
    to: string;
  };

  kpis: KPI[];

  trend: {
    label: string;
    revenue: number;
    orders: number;
  }[];

  segments: {
    segment: string;
    revenue: number;
  }[];

};


export async function fetchDashboard(
  from?: string,
  to?: string
): Promise<Dashboard> {

  const params =
    new URLSearchParams();

  if (from)
    params.set("from", from);

  if (to)
    params.set("to", to);

  const response =
    await fetch(
      `/api/dashboard?${params}`
    );

  if (!response.ok) {

    throw new Error(
      (await response.json()).error
      ?? "Request failed"
    );

  }

  return response.json();
}
