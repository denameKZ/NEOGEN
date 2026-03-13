(function () {
  function toNumber(value) {
    const n = Number(value);
    return Number.isFinite(n) ? n : 0;
  }

  function safeDivide(a, b) {
    const dividend = toNumber(a);
    const divisor = toNumber(b);
    return divisor === 0 ? 0 : dividend / divisor;
  }

  function formatKzt(value, digits = 0) {
    return new Intl.NumberFormat('ru-RU', {
      style: 'currency',
      currency: 'KZT',
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(toNumber(value));
  }

  function formatNum(value, digits = 2) {
    return new Intl.NumberFormat('ru-RU', {
      minimumFractionDigits: digits,
      maximumFractionDigits: digits,
    }).format(toNumber(value));
  }

  window.NEOGEN_UTILS = {
    toNumber,
    safeDivide,
    formatKzt,
    formatNum,
  };
})();
