
window.onload = () => {
    const teamActivity = [
        { rep: "Taylor Adams", jobs: 6, clients: 3 },
        { rep: "Chris Yang", jobs: 3, clients: 2 },
        { rep: "Morgan Blake", jobs: 5, clients: 4 }
    ];

    const pipeline = [
        { rep: "Taylor Adams", hot: 2, warm: 1, cold: 0 },
        { rep: "Chris Yang", hot: 0, warm: 2, cold: 1 },
        { rep: "Morgan Blake", hot: 1, warm: 2, cold: 2 }
    ];

    const topReps = [
        { name: "Taylor Adams", revenue: "$1,200" },
        { name: "Morgan Blake", revenue: "$950" }
    ];

    const activityList = document.getElementById("activityList");
    teamActivity.forEach(a => {
        const li = document.createElement("li");
        li.innerHTML = `${a.rep}: ${a.jobs} jobs submitted, ${a.clients} clients`;
        activityList.appendChild(li);
    });

    const pipelineList = document.getElementById("pipelineList");
    pipeline.forEach(p => {
        const li = document.createElement("li");
        li.innerHTML = `${p.rep} – Hot: ${p.hot}, Warm: ${p.warm}, Cold: ${p.cold}`;
        pipelineList.appendChild(li);
    });

    const topList = document.getElementById("topReps");
    topReps.forEach(r => {
        const li = document.createElement("li");
        li.innerHTML = `${r.name}: ${r.revenue}`;
        topList.appendChild(li);
    });
};
