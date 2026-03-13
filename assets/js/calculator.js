(function () {
  const { toNumber, safeDivide, formatKzt, formatNum } = window.NEOGEN_UTILS;

  const state = JSON.parse(JSON.stringify(window.NEOGEN_DEFAULTS));

  const dom = {};

  function bindElements() {
    [
      'equipmentCost',
      'salaryPercent',
      'tipCost',
      'tipResource',
      'nitrogenCost',
      'nitrogenMonths',
      'nitrogenImpulsesPerMonth',
      'handleCost',
      'handleResource',
      'proceduresTableBody',
      'equipmentCostCard',
      'paybackCard',
      'tipImpulseCost',
      'nitrogenImpulseCost',
      'handleImpulseCost',
      'impulseCost',
      'impulseFormula',
      'totalMonthlyRevenue',
      'totalMonthlyProfitBeforeSalary',
      'salaryCost',
      'netMonthlyProfit',
      'paybackMonths',
    ].forEach((id) => {
      dom[id] = document.getElementById(id);
    });
  }

  function attachTopLevelInputs() {
    const mapping = [
      'equipmentCost',
      'salaryPercent',
      'tipCost',
      'tipResource',
      'nitrogenCost',
      'nitrogenMonths',
      'nitrogenImpulsesPerMonth',
      'handleCost',
      'handleResource',
    ];

    mapping.forEach((key) => {
      dom[key].value = state[key];
      dom[key].addEventListener('input', (event) => {
        state[key] = toNumber(event.target.value);
        render();
      });
    });
  }

  function computeMetrics() {
    const tipImpulseCost = safeDivide(state.tipCost, state.tipResource);
    const nitrogenImpulseCost = safeDivide(
      state.nitrogenCost,
      state.nitrogenMonths * state.nitrogenImpulsesPerMonth
    );
    const handleImpulseCost = safeDivide(state.handleCost, state.handleResource);
    const impulseCost = tipImpulseCost + nitrogenImpulseCost + handleImpulseCost;

    const enrichedProcedures = state.procedures.map((procedure) => {
      const impulseExpenses = toNumber(procedure.impulses) * impulseCost;
      const totalExpenses = impulseExpenses + toNumber(procedure.materials);
      const profitPerProcedure = toNumber(procedure.price) - totalExpenses;
      const monthlyProfit = profitPerProcedure * toNumber(procedure.countPerMonth);
      const monthlyRevenue = toNumber(procedure.price) * toNumber(procedure.countPerMonth);

      return {
        ...procedure,
        impulseExpenses,
        totalExpenses,
        profitPerProcedure,
        monthlyProfit,
        monthlyRevenue,
      };
    });

    const totalMonthlyRevenue = enrichedProcedures.reduce((sum, item) => sum + item.monthlyRevenue, 0);
    const totalMonthlyProfitBeforeSalary = enrichedProcedures.reduce((sum, item) => sum + item.monthlyProfit, 0);
    const salaryCost = totalMonthlyRevenue * (toNumber(state.salaryPercent) / 100);
    const netMonthlyProfit = totalMonthlyProfitBeforeSalary - salaryCost;
    const paybackMonths = netMonthlyProfit > 0 ? state.equipmentCost / netMonthlyProfit : 0;

    return {
      tipImpulseCost,
      nitrogenImpulseCost,
      handleImpulseCost,
      impulseCost,
      enrichedProcedures,
      totalMonthlyRevenue,
      totalMonthlyProfitBeforeSalary,
      salaryCost,
      netMonthlyProfit,
      paybackMonths,
    };
  }

  function renderProceduresTable(metrics) {
    dom.proceduresTableBody.innerHTML = '';

    metrics.enrichedProcedures.forEach((procedure) => {
      const row = document.createElement('tr');
      row.innerHTML = `
        <td><input class="table-input" type="text" data-id="${procedure.id}" data-field="name" value="${escapeHtml(procedure.name)}"></td>
        <td><input class="table-input" type="number" data-id="${procedure.id}" data-field="price" value="${procedure.price}"></td>
        <td><input class="table-input" type="number" data-id="${procedure.id}" data-field="impulses" value="${procedure.impulses}"></td>
        <td><input class="table-input" type="number" data-id="${procedure.id}" data-field="materials" value="${procedure.materials}"></td>
        <td><input class="table-input" type="number" data-id="${procedure.id}" data-field="countPerMonth" value="${procedure.countPerMonth}"></td>
        <td>${formatKzt(Math.round(procedure.totalExpenses))}</td>
        <td>${formatKzt(Math.round(procedure.profitPerProcedure))}</td>
        <td>${formatKzt(Math.round(procedure.monthlyProfit))}</td>
      `;
      dom.proceduresTableBody.appendChild(row);
    });

    dom.proceduresTableBody.querySelectorAll('.table-input').forEach((input) => {
      input.addEventListener('input', handleProcedureChange);
    });
  }

  function handleProcedureChange(event) {
    const id = toNumber(event.target.dataset.id);
    const field = event.target.dataset.field;
    const procedure = state.procedures.find((item) => item.id === id);
    if (!procedure) return;

    procedure[field] = field === 'name' ? event.target.value : toNumber(event.target.value);
    render();
  }

  function renderStats(metrics) {
    dom.equipmentCostCard.textContent = formatKzt(state.equipmentCost);
    dom.paybackCard.textContent = `${formatNum(metrics.paybackMonths, 1)} мес.`;

    dom.tipImpulseCost.textContent = formatKzt(metrics.tipImpulseCost, 2);
    dom.nitrogenImpulseCost.textContent = formatKzt(metrics.nitrogenImpulseCost, 2);
    dom.handleImpulseCost.textContent = formatKzt(metrics.handleImpulseCost, 2);

    dom.impulseCost.textContent = formatKzt(metrics.impulseCost, 2);
    dom.impulseFormula.textContent = `${formatKzt(metrics.tipImpulseCost, 2)} + ${formatKzt(metrics.nitrogenImpulseCost, 2)} + ${formatKzt(metrics.handleImpulseCost, 2)}`;

    dom.totalMonthlyRevenue.textContent = formatKzt(metrics.totalMonthlyRevenue);
    dom.totalMonthlyProfitBeforeSalary.textContent = formatKzt(metrics.totalMonthlyProfitBeforeSalary);
    dom.salaryCost.textContent = formatKzt(metrics.salaryCost);
    dom.netMonthlyProfit.textContent = formatKzt(metrics.netMonthlyProfit);
    dom.paybackMonths.textContent = `${formatNum(metrics.paybackMonths, 1)} мес.`;
  }

  function render() {
    const metrics = computeMetrics();
    renderProceduresTable(metrics);
    renderStats(metrics);
  }

  function escapeHtml(value) {
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  }

  document.addEventListener('DOMContentLoaded', () => {
    bindElements();
    attachTopLevelInputs();
    render();
  });
})();
