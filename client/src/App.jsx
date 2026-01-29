import { useMemo, useState } from "react";

const defaultCategories = [
  "Alimentação",
  "Assinaturas",
  "Casa",
  "Carro",
  "Educação",
  "Lazer",
  "Profissional",
];

const mockTransactions = [
  {
    id: 1,
    type: "gasto",
    amount: 128.4,
    category: "Alimentação",
    date: "2024-01-18",
    description: "Mercado",
  },
  {
    id: 2,
    type: "receita",
    amount: 3500,
    category: "Profissional",
    date: "2024-01-15",
    description: "Salário",
  },
  {
    id: 3,
    type: "gasto",
    amount: 89.9,
    category: "Assinaturas",
    date: "2024-01-12",
    description: "Streaming",
  },
];

const formatCurrency = (value) =>
  new Intl.NumberFormat("pt-BR", {
    style: "currency",
    currency: "BRL",
  }).format(value);

const formatDate = (value) =>
  new Date(value).toLocaleDateString("pt-BR", {
    day: "2-digit",
    month: "short",
  });

export default function App() {
  const [transactions] = useState(mockTransactions);
  const [customCategory, setCustomCategory] = useState("");
  const [selectedType, setSelectedType] = useState("gasto");
  const [selectedCategory, setSelectedCategory] = useState(defaultCategories[0]);

  const totals = useMemo(() => {
    return transactions.reduce(
      (acc, item) => {
        if (item.type === "receita") {
          acc.income += item.amount;
        } else {
          acc.expense += item.amount;
        }
        return acc;
      },
      { income: 0, expense: 0 },
    );
  }, [transactions]);

  const balance = totals.income - totals.expense;

  return (
    <div className="app">
      <header className="app__header">
        <div>
          <p className="eyebrow">Olá, bem-vindo</p>
          <h1>Gesturial</h1>
          <p className="subtitle">Resumo do mês atual</p>
        </div>
        <button className="icon-button" type="button" aria-label="Notificações">
          ☰
        </button>
      </header>

      <section className="cards">
        <article className="card balance">
          <span className="card__label">Saldo atual</span>
          <strong>{formatCurrency(balance)}</strong>
          <span className="card__hint">Atualizado hoje</span>
        </article>
        <article className="card">
          <span className="card__label">Receitas</span>
          <strong>{formatCurrency(totals.income)}</strong>
        </article>
        <article className="card">
          <span className="card__label">Gastos</span>
          <strong>{formatCurrency(totals.expense)}</strong>
        </article>
      </section>

      <section className="actions">
        <button className="primary-button" type="button">
          + Adicionar receita ou gasto
        </button>
        <div className="pill-row">
          <button className="pill active" type="button">
            Mais altos
          </button>
          <button className="pill" type="button">
            Mais baixos
          </button>
          <button className="pill" type="button">
            Por categoria
          </button>
        </div>
      </section>

      <section className="form">
        <h2>Nova movimentação</h2>
        <div className="form__row">
          <label>
            Tipo
            <select
              value={selectedType}
              onChange={(event) => setSelectedType(event.target.value)}
            >
              <option value="gasto">Gasto</option>
              <option value="receita">Receita</option>
            </select>
          </label>
          <label>
            Valor (R$)
            <input type="number" placeholder="0,00" min="0" step="0.01" />
          </label>
        </div>
        <div className="form__row">
          <label>
            Data
            <input type="date" defaultValue={new Date().toISOString().slice(0, 10)} />
          </label>
          <label>
            Categoria
            <select
              value={selectedCategory}
              onChange={(event) => setSelectedCategory(event.target.value)}
            >
              {defaultCategories.map((category) => (
                <option key={category} value={category}>
                  {category}
                </option>
              ))}
            </select>
          </label>
        </div>
        <label>
          Descrição (opcional)
          <input type="text" placeholder="Ex.: Conta de luz" />
        </label>
        <label>
          Criar nova categoria
          <input
            type="text"
            placeholder="Ex.: Crianças"
            value={customCategory}
            onChange={(event) => setCustomCategory(event.target.value)}
          />
        </label>
        <button className="secondary-button" type="button">
          Salvar movimentação
        </button>
        {customCategory && (
          <p className="hint">
            Nova categoria pronta para ser adicionada: <strong>{customCategory}</strong>
          </p>
        )}
      </section>

      <section className="transactions">
        <div className="transactions__header">
          <h2>Movimentações</h2>
          <button className="link-button" type="button">
            Ver tudo
          </button>
        </div>
        <ul>
          {transactions.map((transaction) => (
            <li key={transaction.id} className="transaction">
              <div className="transaction__info">
                <span className={`badge ${transaction.type}`}>
                  {transaction.type === "receita" ? "Receita" : "Gasto"}
                </span>
                <h3>{transaction.description}</h3>
                <p>{transaction.category}</p>
              </div>
              <div className="transaction__meta">
                <strong>{formatCurrency(transaction.amount)}</strong>
                <span>{formatDate(transaction.date)}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}
