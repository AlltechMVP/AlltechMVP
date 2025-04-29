
import { timecards } from "../data/timecards";

function PayrollView() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Payroll Summary</h1>
      <table className="w-full text-left border">
        <thead>
          <tr className="bg-gray-100">
            <th className="p-2 border">Week</th>
            <th className="p-2 border">Hours</th>
            <th className="p-2 border">Pay Rate</th>
            <th className="p-2 border">Total</th>
            <th className="p-2 border">Status</th>
          </tr>
        </thead>
        <tbody>
          {timecards.map((card) => (
            <tr key={card.id}>
              <td className="p-2 border">{card.week}</td>
              <td className="p-2 border">{card.hours}</td>
              <td className="p-2 border">${card.payRate.toFixed(2)}</td>
              <td className="p-2 border">${(card.hours * card.payRate).toFixed(2)}</td>
              <td className="p-2 border">{card.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default PayrollView;
