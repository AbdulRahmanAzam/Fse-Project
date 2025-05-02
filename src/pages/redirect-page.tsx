import { Button } from "@/components/ui/button";
import { Mail, AlertCircle } from "lucide-react";
import { useNavigate } from "react-router-dom";

const RedirectPage = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 dark:bg-gray-900">
      <div className="max-w-md w-full space-y-8 p-8 bg-white dark:bg-gray-800 rounded-lg shadow-lg">
        <div className="text-center space-y-4">
          <div className="flex justify-center">
            <Mail className="h-12 w-12 text-primary" />
          </div>
          <h2 className="text-3xl font-bold text-gray-900 dark:text-white">
            Check Your Email
          </h2>
          <p className="text-gray-600 dark:text-gray-300">
            We've sent you a verification link to your email address. Please check your inbox to verify your account.
          </p>
          
          <div className="flex items-start gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/20 rounded-lg">
            <AlertCircle className="h-5 w-5 text-yellow-500 mt-0.5 flex-shrink-0" />
            <p className="text-sm text-yellow-700 dark:text-yellow-300">
              If you don't see the email, please check your spam folder. Sometimes verification emails can end up there.
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <Button
            onClick={() => navigate('/auth')}
            className="w-full"
          >
            Return to Login
          </Button>
        </div>
      </div>
    </div>
  );
};

export default RedirectPage;
