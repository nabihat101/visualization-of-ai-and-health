class Data {
  constructor(tableJobsImpact, tableGlobalImpact) {
    this.tableJobsImpact = tableJobsImpact;
    this.tableGlobalImpact = tableGlobalImpact;
    this.avgImpact = {};
    this.avgRevenue = {};
    this.organizedValI = [];
    this.sortedSectorNames = [];
    this.sectorNameToOriginalIndex = {};
    this.valR = [];
  }

  processImpact() {
    let uniqueJobsImpact = [];
    for (let i = 0; i < this.tableJobsImpact.getRowCount(); i++) {
      const domain = this.tableJobsImpact.getString(i, "Domain");
      if (!uniqueJobsImpact.includes(domain)) uniqueJobsImpact.push(domain);
    }

    for (let i = 0; i < this.tableJobsImpact.getRowCount(); i++) {
      const domain = uniqueJobsImpact[i];
      const c = this.tableJobsImpact.getNum(i, "AI Impact");
      if (!(domain in this.avgImpact)) this.avgImpact[domain] = [];
      this.avgImpact[domain].push(c);
    }

    for (let domain in this.avgImpact) {
      let sum = this.avgImpact[domain].reduce((a, b) => a + b, 0);
      this.avgImpact[domain] = sum / this.avgImpact[domain].length;
    }

    let valI = Object.values(this.avgImpact);
    valI.length = valI.length - 1;

    this.organizedValI = [
      valI[0], valI[6], valI[5], valI[1], valI[9],
      valI[3], valI[4], valI[8], valI[7], valI[2]
    ];

    return this.organizedValI;
  }

  processRevenue() {
    let uniqueGlobalImpact = [];
    for (let i = 0; i < this.tableGlobalImpact.getRowCount(); i++) {
      const domain = this.tableGlobalImpact.getString(i, "Industry");
      if (!uniqueGlobalImpact.includes(domain)) uniqueGlobalImpact.push(domain);
    }

    for (let i = 0; i < this.tableGlobalImpact.getRowCount(); i++) {
      const domain = uniqueGlobalImpact[i];
      const c = this.tableGlobalImpact.getNum(i, "Revenue Increase Due to AI (%)");
      if (!(domain in this.avgRevenue)) this.avgRevenue[domain] = [];
      this.avgRevenue[domain].push(c);
    }

    for (let domain in this.avgRevenue) {
      let sum = this.avgRevenue[domain].reduce((a, b) => a + b, 0);
      this.avgRevenue[domain] = sum / this.avgRevenue[domain].length;
    }

    this.valR = Object.values(this.avgRevenue);
    sectorNames = Object.keys(this.avgRevenue);
    this.valR.length = this.valR.length - 1;

    let sortedSectors = [...sectorNames].map((name, i) => ({ name, originalIndex: i }));
    sortedSectors.sort((a, b) => a.name.localeCompare(b.name));

    this.sortedSectorNames = sortedSectors.map(item => item.name);

    sortedSectors.forEach(item => {
      this.sectorNameToOriginalIndex[item.name.toLowerCase()] = item.originalIndex;
    });

    return this.sortedSectorNames;
  }

  getSortedSectors() {
    return this.sectorNameToOriginalIndex;
  }

  getRevenue() {
    return this.valR;
  }
}
