import LoginForm from "@/components/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <span className="text-5xl">🇳🇱</span>
          <h1 className="text-3xl font-bold text-dutch-blue mt-3">DutchClass</h1>
          <p className="text-gray-500 mt-1 text-sm">Sign in to continue</p>
        </div>
        <LoginForm />
      </div>
    </div>
  );
}
