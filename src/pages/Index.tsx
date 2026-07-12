import { useNavigate } from "react-router-dom";
import { useEffect } from "react";
import logo from "@/assets/flinker-logo.png";

const Index = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const timer = setTimeout(() => navigate("/onboarding"), 2000);
    return () => clearTimeout(timer);
  }, [navigate]);

  return (
    <div className="flex min-h-screen items-center justify-center bg-background">
      <div className="flex flex-col items-center gap-4 animate-fade-in">
        <img src={logo} alt="Flinker" className="h-32 w-32 rounded-2xl" />
      </div>
    </div>
  );
};

export default Index;
