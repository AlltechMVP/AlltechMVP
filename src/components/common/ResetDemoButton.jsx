
/** 
 * @desc Button to reset demo data
 * @author Replit Assistant
 * @since 2025-05-12
 */
export default function ResetDemoButton() {
  const reset = () => {
    localStorage.clear();
    window.location.reload();
  };
  return (
    <button onClick={reset} className="text-sm text-red-500 underline">
      Reset Demo Data
    </button>
  );
}
