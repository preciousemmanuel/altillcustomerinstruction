import { useNavigate } from "react-router-dom"; // assuming react-router

const FullPageError = ({ message }: { message: string }) => {
  const navigate = useNavigate();

  return (
    <div className="fixed inset-0 flex flex-col items-center justify-center bg-red-50 text-red-700 z-50 p-6">
      <h2 className="text-lg font-semibold mb-2">Error</h2>
      <p className="mb-4">{message}</p>
      <button
        onClick={() => navigate(-1)}
        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
      >
        Go Back
      </button>
    </div>
  );
};

export default FullPageError;