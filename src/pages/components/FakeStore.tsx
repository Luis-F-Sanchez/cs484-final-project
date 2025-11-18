import React, { useState } from "react";

type Item = {
  id: number;
  name: string;
  unitPrice: number;
  unitsRemaining: number;
};

const initialItems: Item[] = [
  { id: 1, name: "Fruit Snacks", unitPrice: 0.5, unitsRemaining: 20 },
  { id: 2, name: "Gum", unitPrice: 0.25, unitsRemaining: 15 },
];

export default function FakeStore() {
  const [items, setItems] = useState<Item[]>(initialItems);
  const [balance, setBalance] = useState<number>(10); // fake starting balance

  function handleBuy(id: number) {
    setItems((prev) =>
      prev.map((item) =>
        item.id === id && item.unitsRemaining > 0
          ? { ...item, unitsRemaining: item.unitsRemaining - 1 }
          : item
      )
    );

    const item = items.find((i) => i.id === id);
    if (item && item.unitsRemaining > 0) {
      setBalance((prev) => Math.max(0, prev - item.unitPrice));
    }
  }

  return (
    <div style={{ marginTop: "1.5rem" }}>
      <p>
        <strong>Fake balance:</strong> ${balance.toFixed(2)}
      </p>

      <table style={{ borderCollapse: "collapse", width: "100%", maxWidth: 600 }}>
        <thead>
          <tr>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "left" }}>Item</th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}>
              Unit Price
            </th>
            <th style={{ borderBottom: "1px solid #ccc", textAlign: "right" }}>
              Units Remaining
            </th>
            <th style={{ borderBottom: "1px solid #ccc" }}></th>
          </tr>
        </thead>
        <tbody>
          {items.map((item) => (
            <tr key={item.id}>
              <td style={{ padding: "0.25rem 0" }}>{item.name}</td>
              <td style={{ padding: "0.25rem 0", textAlign: "right" }}>
                ${item.unitPrice.toFixed(2)}
              </td>
              <td style={{ padding: "0.25rem 0", textAlign: "right" }}>
                {item.unitsRemaining}
              </td>
              <td style={{ padding: "0.25rem 0", textAlign: "center" }}>
                <button
                  type="button"
                  onClick={() => handleBuy(item.id)}
                  disabled={item.unitsRemaining === 0 || balance < item.unitPrice}
                >
                  Buy 1
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      <p style={{ marginTop: "0.5rem", fontSize: "0.9rem", color: "#555" }}>
        This is a fake client-side demo: reloading the page will reset the balance and stock.
      </p>
    </div>
  );
}
