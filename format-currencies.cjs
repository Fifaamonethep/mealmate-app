const fs = require('fs');
const path = require('path');

const files = [
  'src/views/MealsView.vue',
  'src/views/HomeView.vue',
  'src/views/DebtsView.vue',
  'src/views/AddMealView.vue',
  'src/components/layout/SummaryPosterModal.vue'
];

files.forEach(file => {
  let content = fs.readFileSync(path.join('d:/pj/mealmate-app', file), 'utf8');

  // Replace various toLocaleString patterns
  content = content.replace(/\{\{\s*(.*?)\.toLocaleString\(\)\s*\}\}\s*(LAK|฿|\{\{.*?\}\})/g, '{{ $formatCurrency($1, "$2") }}');
  content = content.replace(/\{\{\s*meal\.total_cost\?\.toLocaleString\(\)\s*\|\|\s*0\s*\}\}\s*\{\{\s*meal\.currency\s*\|\|\s*'LAK'\s*\}\}/g, '{{ $formatCurrency(meal.total_cost || 0, meal.currency || "LAK") }}');
  content = content.replace(/\{\{\s*meal\.total_cost\.toLocaleString\(\)\s*\}\}\s*\{\{\s*meal\.currency\s*\}\}/g, '{{ $formatCurrency(meal.total_cost, meal.currency) }}');
  content = content.replace(/\{\{\s*\(\(form\.totalAmount\s*\|\|\s*0\)\s*\/\s*Math\.max\(1,\s*participants\.length\)\)\.toLocaleString\(\)\s*\}\}\s*\{\{\s*form\.currency\s*\}\}/g, '{{ $formatCurrency((form.totalAmount || 0) / Math.max(1, participants.length), form.currency) }}');
  content = content.replace(/Owes\s*\{\{\s*\(\(form\.totalAmount\s*\|\|\s*0\)\s*\/\s*Math\.max\(1,\s*participants\.length\)\)\.toLocaleString\(\)\s*\}\}/g, 'Owes {{ $formatCurrency((form.totalAmount || 0) / Math.max(1, participants.length)) }}');
  content = content.replace(/\{\{\s*\(form\.totalAmount\s*\|\|\s*0\)\.toLocaleString\(\)\s*\}\}\s*\{\{\s*form\.currency\s*\}\}/g, '{{ $formatCurrency(form.totalAmount || 0, form.currency) }}');
  content = content.replace(/Remaining:\s*\{\{\s*remainingCustomAmount\.toLocaleString\(\)\s*\}\}/g, 'Remaining: {{ $formatCurrency(remainingCustomAmount) }}');

  // Specific manual fixes
  content = content.replace(/\{\{ debtsStore\.myNetBalance > 0 \? '\+' : '' \}\}\{\{ debtsStore\.myNetBalance\.toLocaleString\(\) \}\} LAK/, '{{ debtsStore.myNetBalance > 0 ? "+" : "" }}{{ $formatCurrency(debtsStore.myNetBalance, "LAK") }}');
  content = content.replace(/\{\{ debtsStore\.iOweTotal\.toLocaleString\(\) \}\} LAK/, '{{ $formatCurrency(debtsStore.iOweTotal, "LAK") }}');
  content = content.replace(/\{\{ debtsStore\.owedToMeTotal\.toLocaleString\(\) \}\} LAK/, '{{ $formatCurrency(debtsStore.owedToMeTotal, "LAK") }}');

  content = content.replace(/\{\{ tx\.amount\.toLocaleString\(\) \}\} ฿/g, '{{ $formatCurrency(tx.amount, "THB") }}');
  content = content.replace(/\{\{ debtType === 'i_owe' \? '-' : '\+' \}\}\{\{ tx\.amount\.toLocaleString\(\) \}\} ฿/, '{{ debtType === "i_owe" ? "-" : "+" }}{{ $formatCurrency(tx.amount, "THB") }}');

  fs.writeFileSync(path.join('d:/pj/mealmate-app', file), content, 'utf8');
});

console.log("Formatting applied!");
