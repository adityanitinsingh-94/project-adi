const balanceEl = document.getElementById("balance");
const incomeAmountEl = document.getElementById("income-amount");
const expenseAmountEl = document.getElementById("expense-amount");
const transactionListEl = document.getElementById("transaction-list");
const transactionFormEl = document.getElementById("transaction-form");
const descriptionEl = document.getElementById("description");
const amountEl = document.getElementById("amount");



let transactions = JSON.parse(localStorage.getItem("transactions")) || [];

transactionFormEl.addEventListener("submit", addTransaction);

function addTransaction(e) {
  e.preventDefault();

  // get form values
  const description = descriptionEl.value.trim();
  const amount = parseFloat(amountEl.value);

  transactions.push({
    id: Date.now(),
    description,
    amount,
  });

  localStorage.setItem("transactions", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();

  transactionFormEl.reset();
}

function updateTransactionList() {
  transactionListEl.innerHTML = "";

  const sortedTransactions = [...transactions].reverse();

  sortedTransactions.forEach((transaction) => {
    const transactionEl = createTransactionElement(transaction);
    transactionListEl.appendChild(transactionEl);
  });
}

function createTransactionElement(transaction) {
  const li = document.createElement("li");
  li.classList.add("transaction");
  li.classList.add(transaction.amount > 0 ? "income" : "expense");

  li.innerHTML = `
    <span>${transaction.description}</span>
    <span>
  
    ${formatCurrency(transaction.amount)}
      <button class="delete-btn" onclick="removeTransaction(${transaction.id})">x</button>
    </span>
  `;

  return li;
}

function updateSummary() {
  // 100, -50, 200, -200 => 50
  const balance = transactions.reduce((acc, transaction) => acc + transaction.amount, 0);

  const income = transactions
    .filter((transaction) => transaction.amount > 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  const expenses = transactions
    .filter((transaction) => transaction.amount < 0)
    .reduce((acc, transaction) => acc + transaction.amount, 0);

  // update ui => todo: fix the formatting
  balanceEl.textContent = formatCurrency(balance);
  incomeAmountEl.textContent = formatCurrency(income);
  expenseAmountEl.textContent = formatCurrency(expenses);
}

function formatCurrency(number) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "INR",
  }).format(number);
}

function removeTransaction(id) {
  // filter out the one we wanted to delete
  transactions = transactions.filter((transaction) => transaction.id !== id);

  localStorage.setItem("transcations", JSON.stringify(transactions));

  updateTransactionList();
  updateSummary();
}

// initial render
updateTransactionList();
updateSummary();
  
// === Daily Limit Function ===

// Input fields
const limitInput = document.getElementById("limit");
const setLimitBtn = document.querySelector("button[SetTransactionLimit]") || null; // Optional
const amountInput = document.getElementById("amount");
const transactionForm = document.getElementById("transaction-form");

// Local storage keys
let transactionLimit = parseFloat(localStorage.getItem("transactionLimit")) || 0;
let totalExpenses = parseFloat(localStorage.getItem("totalExpenses")) || 0;

// 🟢 जब यूजर लिमिट सेट करे
document.getElementById("limit").addEventListener("change", () => {
  const limit = parseFloat(limitInput.value);
  if (isNaN(limit) || limit <= 0) {
    alert("⚠️ कृपया एक मान्य लिमिट डालें (₹ में)");
    return;
  }
  transactionLimit = limit;
  localStorage.setItem("transactionLimit", limit);
  alert(`✅ Transaction Limit ₹${limit} सेट कर दी गई है!`);
});

// 🟢 जब नया transaction add हो
transactionForm.addEventListener("submit", (e) => {
  e.preventDefault();
  const amount = parseFloat(amountInput.value);

  // Negative amounts are expenses
  if (amount < 0) {
    totalExpenses += Math.abs(amount);
    localStorage.setItem("totalExpenses", totalExpenses);

    // Check against limit
    if (transactionLimit > 0 && totalExpenses > transactionLimit) {
      alert(`🚨 Warning: आपने अपनी लिमिट ₹${transactionLimit} से ज़्यादा खर्च कर दिया है!`);
    } else if (transactionLimit > 0 && totalExpenses >= transactionLimit * 0.9) {
      alert(`⚠️ आप अपनी लिमिट ₹${transactionLimit} के करीब पहुंच गए हैं (90%)`);
    }
  }

  // Reset form fields
  amountInput.value = "";
});

// 🟢 हर बार पेज reload होने पर डेटा restore करें
window.addEventListener("load", () => {
  if (transactionLimit > 0) {
    alert(`💰 आपकी Transaction Limit ₹${transactionLimit} है।`);
  }
});
function downloadPDF() {
    const { jsPDF } = window.jspdf;
    const doc = new jsPDF();

    doc.setFontSize(18);
    doc.text("Transaction Report", 14, 20);

    doc.setFontSize(12);
    doc.text("Date: " + new Date().toLocaleString(), 14, 30);

    // Summary
    const balance = transactions.reduce((a, b) => a + b.amount, 0);
    const income = transactions.filter(t => t.amount > 0).reduce((a, b) => a + b.amount, 0);
    const expenses = transactions.filter(t => t.amount < 0).reduce((a, b) => a + b.amount, 0);

    doc.setFontSize(14);
    doc.text("Summary", 14, 50);
    doc.setFontSize(12);
    doc.text(`Balance: ₹${balance}`, 14, 60);
    doc.text(`Income: ₹${income}`, 14, 70);
    doc.text(`Expenses: ₹${expenses}`, 14, 80);

    // Transactions list
    doc.setFontSize(14);
    doc.text("Transactions:", 14, 100);

    let y = 110;
    transactions.forEach((t, i) => {
        if (y > 280) {
            doc.addPage();
            y = 20;
        }

        doc.setFontSize(11);
        doc.text(`${i + 1}. ${t.description} — ₹${t.amount}`, 14, y);
        y += 8;
    });

    doc.save("Transaction_Report.pdf");
}
