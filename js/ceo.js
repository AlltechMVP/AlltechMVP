
import { supabase } from './supabase.js';

async function loadDashboardData() {
    try {
        // Load candidates count
        const { count: candidatesCount } = await supabase
            .from('candidates')
            .select('*', { count: 'exact' });
        document.getElementById('totalCandidates').textContent = candidatesCount || 0;

        // Load financial metrics
        const { data: placements } = await supabase
            .from('placements')
            .select('bill_rate, pay_rate');
        
        if (placements && placements.length > 0) {
            const avgBillRate = placements.reduce((sum, p) => sum + p.bill_rate, 0) / placements.length;
            const avgPayRate = placements.reduce((sum, p) => sum + p.pay_rate, 0) / placements.length;
            const grossMargin = ((avgBillRate - avgPayRate) / avgBillRate * 100).toFixed(1);
            const weeklyRevenue = (avgBillRate * 40 * placements.length).toFixed(2);

            document.getElementById('totalPlacements').textContent = placements.length;
            document.getElementById('avgBillRate').textContent = avgBillRate.toFixed(2);
            document.getElementById('avgPayRate').textContent = avgPayRate.toFixed(2);
            document.getElementById('grossMargin').textContent = grossMargin;
            document.getElementById('weeklyRevenue').textContent = weeklyRevenue;
        }

        // Load top recruiters
        const { data: recruiters } = await supabase
            .from('placements')
            .select('recruiter_id, recruiters(name)')
            .order('recruiter_id', { ascending: false });

        if (recruiters) {
            const recruiterStats = {};
            recruiters.forEach(placement => {
                recruiterStats[placement.recruiter_id] = (recruiterStats[placement.recruiter_id] || 0) + 1;
            });

            const recruiterList = document.getElementById('recruiterList');
            recruiterList.innerHTML = Object.entries(recruiterStats)
                .sort((a, b) => b[1] - a[1])
                .slice(0, 5)
                .map(([id, count]) => `<li>${recruiters.find(r => r.recruiter_id === id)?.recruiters?.name || 'Unknown'}: ${count} placements</li>`)
                .join('');
        }

        // Load client snapshot
        const { data: clients } = await supabase
            .from('clients')
            .select('name, active_jobs, total_placements')
            .order('total_placements', { ascending: false })
            .limit(5);

        if (clients) {
            const clientList = document.getElementById('clientList');
            clientList.innerHTML = clients.map(client => 
                `<li>${client.name}: ${client.active_jobs} active jobs, ${client.total_placements} placements</li>`
            ).join('');
        }

    } catch (error) {
        console.error('Error loading dashboard data:', error);
    }
}

document.addEventListener('DOMContentLoaded', loadDashboardData);
