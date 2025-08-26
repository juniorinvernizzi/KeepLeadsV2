import { useEffect } from "react";
import { useLocation } from "wouter";
import Layout from "@/components/Layout";

export default function Dashboard() {
  const [, setLocation] = useLocation();

  useEffect(() => {
    // Redirect to leads marketplace by default
    setLocation("/leads");
  }, [setLocation]);

  return (
    <Layout>
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-slate-600">Redirecionando...</p>
        </div>
      </div>
    </Layout>
  );
}
