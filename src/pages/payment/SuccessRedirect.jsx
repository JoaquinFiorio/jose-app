import { useEffect } from "react";
import { useNavigate } from "react-router-dom";

export default function SuccessRedirect() {
  const navigate = useNavigate();

  useEffect(() => {
    if (window.top !== window.self) {
      window.top.location = window.location.href;
    } else {
      navigate("/payment/success");
    }
  }, [navigate]);

  return (
    <div className="flex items-center justify-center min-h-screen">
      <p>Redirigiendo...</p>
    </div>
  );
} 