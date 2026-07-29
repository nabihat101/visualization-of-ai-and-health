let uniqueJobsImpact = [];
let uniqueGlobalImpact = [];
let avgImpact = {};
let avgRevenue = {};
let valR = [];
let organizedValI = [];
let sectorNames = [];
let sortedImpact;
let sortProcessor;
let sortedRevenue;
let searchIndex = -1;
let sortedSectorNames = [];
let sectorNameToOriginalIndex = {};
let dataProcessor;

// CSV tables
let tableJobsImpact, tableGlobalImpact;

function preload() {
  tableJobsImpact = loadTable("jobsImpact.csv", "csv", "header");
  tableGlobalImpact = loadTable("globalImpact.csv", "csv", "header");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  background(100);

  // Process CSV data
  dataProcessor = new Data(tableJobsImpact, tableGlobalImpact);
  organizedValI = dataProcessor.processImpact();
  sortedSectorNames = dataProcessor.processRevenue();
  sectorNameToOriginalIndex = dataProcessor.getSortedSectors();
  valR = dataProcessor.getRevenue();

  // Sort results for visualization
  sortProcessor = new Sort(organizedValI, valR);
  sortedImpact = sortProcessor.sortImpact();
  revenueImpact = sortProcessor.sortRevenue();

  // Input box for search
  inputBox = createInput();
  inputBox.position(70, 30);
  inputBox.size(100);
  inputBox.input(handleSearch);

  fill("white");
}

function draw() {
  background(20);
  push();
  textSize(15);
  fill("white");
  textWrap(WORD);
  textAlign(LEFT);
  textFont("nunito");
  text("Input which sector you would like to find!", 20, 20);
  text(
    "This visualization displays two aspects of conscious AI: Societal Impact of Job Loss and Economic Impact of Profits/Revenue Increasing Across Sectors ",
    20,
    200,
    300
  );
  text(
    "User Input: Input an industry you wish to find, and a red dot will appear at the industry you want to find. Another user input is when you hover over the center of an ellipse, the program will display what that ellipse represents and numerical values associated with that ellipse. ",
    20,
    350,
    300
  );
  text(
    "Orange ellipses represent the percentage of revenue that has increased across a sector globally because of the integration of AI. ",
    width / 2 + 400,
    200,
    300
  );
  text(
    "Pink represents the percentage of impact that AI has on the job loss across a sector globally. ",
    width / 2 + 400,
    350,
    300
  );
  pop();

  translate(width / 2, height / 2);
  impactPosition = [];
  revenuePosition = [];
  let sectorNamePositions = [];

  let baseRadius = 120;
  let maxLineLength = 150;
  let angleOffset = radians(2);
  let total = organizedValI.length;

  for (let i = 0; i < total; i++) {
    let baseAngle = map(i, 0, total, 0, TWO_PI);

    let impactVal = map(organizedValI[i], 0, 100, 0, maxLineLength);
    let revenueVal = map(valR[i], 0, 100, 0, maxLineLength);

    // Impact ellipse
    let impactAngle = baseAngle - angleOffset;
    let impactX = cos(impactAngle) * (baseRadius + impactVal / 2);
    let impactY = sin(impactAngle) * (baseRadius + impactVal / 2);
    drawRadialEllipse(impactAngle, baseRadius, impactVal, color(255, 100, 0));
    impactPosition.push({ x: impactX + width / 2, y: impactY + height / 2 });

    // Revenue ellipse
    let revenueAngle = baseAngle + angleOffset;
    let revenueX = cos(revenueAngle) * (baseRadius + revenueVal / 2);
    let revenueY = sin(revenueAngle) * (baseRadius + revenueVal / 2);
    drawRadialEllipse(revenueAngle, baseRadius, revenueVal, color(255, 0, 150));
    revenuePosition.push({ x: revenueX + width / 2, y: revenueY + height / 2 });

    // Labels
    let labelAngle = baseAngle;
    let labelRadius = baseRadius + maxLineLength + 40;
    let x = cos(labelAngle) * labelRadius;
    let y = sin(labelAngle) * labelRadius;
    noStroke();
    fill(255);
    textAlign(CENTER, CENTER);
    textSize(15);
    textFont("nunito");
    text(sectorNames[i], x, y);
    sectorNamePositions.push({ Name: sectorNames[i], x: x, y: y });
    drawCircles(x, y, 0);
  }

  // Hover check
  hoverCheck();

  // Highlight searched sector
  if (searchIndex !== -1) {
    let c = sectorNamePositions[searchIndex];
    noStroke();
    fill("rgb(247,10,10)");
    circle(c.x, c.y - 15, 15);
  }
}

function drawCircles(x, y, index) {
  if (index >= 10) return;
  fill("white");
  noStroke();
  circle(x, y - 15, 10);
  drawCircles(x, y, 2 * index + 1);
  drawCircles(x, y, 2 * index + 2);
}

function drawRadialEllipse(angle, baseRadius, ellipseWidth, col) {
  let cx = cos(angle) * (baseRadius + ellipseWidth / 2);
  let cy = sin(angle) * (baseRadius + ellipseWidth / 2);

  push();
  translate(cx, cy);
  rotate(angle);
  noStroke();
  fill(col);
  ellipse(0, 0, ellipseWidth, 10);
  pop();
}

function hoverCheck() {
  for (let i = 0; i < impactPosition.length; i++) {
    let impact = impactPosition[i];
    let revenue = revenuePosition[i];

    let dImpact = dist(mouseX, mouseY, impact.x, impact.y);
    let dRevenue = dist(mouseX, mouseY, revenue.x, revenue.y);

    if (dImpact < 10) {
      showTooltip(0, 0, sectorNames[i], "Impact", organizedValI[i].toFixed(1) + "%");
    } else if (dRevenue < 10) {
      showTooltip(0, 0, sectorNames[i], "Revenue Inc.", valR[i].toFixed(1) + "%");
    }
  }
}

function showTooltip(x, y, sector, type, value) {
  push();
  fill(50, 200);
  stroke(255);
  strokeWeight(1);
  rectMode(CENTER);
  rect(x, y, 210, 40, 10);

  fill(255);
  noStroke();
  textFont("nunito");
  textAlign(CENTER, CENTER);
  textSize(12);
  text(sector + " - " + type + ": " + value, x, y);
  pop();
}

function handleSearch() {
  let value = this.value().toLowerCase().trim();
  searchIndex = -1;

  let idx = binarySearch(sortedSectorNames, value);
  if (idx !== -1) {
    let original = sectorNameToOriginalIndex[sortedSectorNames[idx].toLowerCase()];
    searchIndex = original;
  }
}

function binarySearch(arr, target) {
  let low = 0;
  let high = arr.length - 1;

  while (low <= high) {
    let mid = Math.floor((low + high) / 2);
    let midVal = arr[mid].toLowerCase();

    if (midVal === target) return mid;
    else if (midVal < target) low = mid + 1;
    else high = mid - 1;
  }
  return -1;
}
