class Sort {
  constructor(impact, revenue) {
    this.impact = [...impact];
    this.revenue = [...revenue];
  }

  sortImpact() {
    return [...this.impact].sort((a, b) => a - b);
  }

  sortRevenue() {
    return [...this.revenue].sort((a, b) => a - b);
  }
}
