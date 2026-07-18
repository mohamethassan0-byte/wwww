import { useState, useEffect, useMemo } from "react";
import {
  Globe2,
  ClipboardList,
  Plus,
  Minus,
  Trash2,
  AlertTriangle,
  X,
  Check,
  Pencil,
  Lock,
  Unlock,
  RotateCcw,
  Loader2,
} from "lucide-react";

const TOKENS = {
  pine: "#1F3A34",
  pineDark: "#152722",
  parchment: "#F2E9D8",
  paper: "#FFFDF8",
  brick: "#C1443D",
  gold: "#E0A62E",
  ink: "#2B2620",
  inkSoft: "#6B6255",
  line: "#D8CBAE",
};

const OWNER_USER = "Moha";
const OWNER_PASS = "mo9090";
const CATALOG_KEY = "mohazan-catalog-v1";

const DEFAULT_PRODUCTS = [
  { id: "p1", name: "Wireless Earbuds Pro", unit: "1 pair", category: "Electronics", price: 39.9, stock: 42, maxStock: 60, emoji: "🎧" },
  { id: "p2", name: "Portable Power Bank 10000mAh", unit: "1 unit", category: "Electronics", price: 22.5, stock: 9, maxStock: 50, emoji: "🔋" },
  { id: "p3", name: "Running Sneakers", unit: "1 pair", category: "Fashion", price: 45.0, stock: 30, maxStock: 40, emoji: "👟" },
  { id: "p4", name: "UV400 Sunglasses", unit: "1 unit", category: "Fashion", price: 14.5, stock: 4, maxStock: 25, emoji: "🕶️" },
  { id: "p5", name: "Stainless Steel Water Bottle", unit: "750ml", category: "Home & Living", price: 12.1, stock: 18, maxStock: 30, emoji: "🍶" },
  { id: "p6", name: "Cotton Bedsheet Set", unit: "queen size", category: "Home & Living", price: 28.8, stock: 26, maxStock: 45, emoji: "🛏️" },
  { id: "p7", name: "Ceramic Non-stick Pan", unit: "28cm", category: "Home & Living", price: 32.0, stock: 3, maxStock: 20, emoji: "🍳" },
  { id: "p8", name: "Vitamin C Serum", unit: "30ml", category: "Beauty", price: 15.9, stock: 22, maxStock: 35, emoji: "🧴" },
  { id: "p9", name: "Basmati Rice", unit: "5kg bag", category: "Groceries", price: 11.0, stock: 15, maxStock: 30, emoji: "🍚" },
  { id: "p10", name: "Instant Coffee Sachets", unit: "box of 20", category: "Groceries", price: 8.3, stock: 7, maxStock: 20, emoji: "☕" },
  { id: "p11", name: "Yoga Mat", unit: "6mm", category: "Fitness", price: 17.4, stock: 20, maxStock: 25, emoji: "🧘" },
  { id: "p12", name: "Smart Watch Band", unit: "1 unit", category: "Electronics", price: 9.9, stock: 33, maxStock: 40, emoji: "⌚" },
];

function stockStatus(stock, maxStock) {
  const pct = maxStock > 0 ? stock / maxStock : 0;
  if (stock === 0) return { label: "Out of Stock", color: TOKENS.brick, pct };
  if (pct < 0.15) return { label: "Almost Out", color: TOKENS.brick, pct };
  if (pct < 0.4) return { label: "Low Stock", color: TOKENS.gold, pct };
  return { label: "In Stock", color: TOKENS.pine, pct };
}

function StockBar({ stock, maxStock }) {
  const { color, pct } = stockStatus(stock, maxStock);
  const segments = 12;
  const filled = Math.round(pct * segments);
  return (
    <div style={{ display: "flex", gap: 2 }}>
      {Array.from({ length: segments }).map((_, i) => (
        <div key={i} style={{ width: 6, height: 14, borderRadius: 1, background: i < filled ? color : TOKENS.line }} />
      ))}
    </div>
  );
}

function Badge({ status }) {
  const isGood = status.label === "In Stock";
  return (
    <span style={{
      fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, fontWeight: 600, letterSpacing: 0.3,
      color: isGood ? TOKENS.pine : "#fff", background: isGood ? "transparent" : status.color,
      border: isGood ? `1px solid ${status.color}` : "none", padding: "3px 8px", borderRadius: 20, whiteSpace: "nowrap",
    }}>
      {status.label.toUpperCase()}
    </span>
  );
}

const inputStyle = {
  width: "100%", boxSizing: "border-box", padding: "6px 8px", borderRadius: 6,
  border: `1px solid ${TOKENS.line}`, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, background: TOKENS.paper, color: TOKENS.ink,
};
const labelStyle = { fontSize: 10, color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 2, display: "block" };

function ProductForm({ draft, setDraft, onSave, onCancel, saving }) {
  const field = (key, label, type = "text") => (
    <div>
      <label style={labelStyle}>{label}</label>
      <input
        style={inputStyle}
        type={type}
        value={draft[key]}
        onChange={(e) => setDraft({ ...draft, [key]: type === "number" ? e.target.value : e.target.value })}
      />
    </div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {field("emoji", "Icon (emoji)")}
        {field("category", "Category")}
      </div>
      {field("name", "Product name")}
      {field("unit", "Unit / variant")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>
        {field("price", "Price ($)", "number")}
        {field("stock", "Stock", "number")}
        {field("maxStock", "Max stock", "number")}
      </div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={onSave} disabled={saving} style={{ flex: 1, background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 7, padding: "7px 0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          {saving ? "Saving…" : "Save"}
        </button>
        <button onClick={onCancel} style={{ flex: 1, background: "none", color: TOKENS.inkSoft, border: `1px solid ${TOKENS.line}`, borderRadius: 7, padding: "7px 0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
          Cancel
        </button>
      </div>
    </div>
  );
}

export default function Mohazan() {
  const [products, setProducts] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);
  const [cart, setCart] = useState({});
  const [view, setView] = useState("shop");
  const [orderConfirm, setOrderConfirm] = useState(null);

  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [loginError, setLoginError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState({ emoji: "🛍️", category: "", name: "", unit: "", price: "0", stock: "0", maxStock: "10" });

  // Load catalog from shared persistent storage on mount
  useEffect(() => {
    (async () => {
      try {
        const result = await window.storage.get(CATALOG_KEY, true);
        const value = result ? JSON.parse(result.value) : null;
        if (value && Array.isArray(value) && value.length > 0) {
          setProducts(value);
        } else {
          setProducts(DEFAULT_PRODUCTS);
          await window.storage.set(CATALOG_KEY, JSON.stringify(DEFAULT_PRODUCTS), true);
        }
      } catch (e) {
        setProducts(DEFAULT_PRODUCTS);
        try { await window.storage.set(CATALOG_KEY, JSON.stringify(DEFAULT_PRODUCTS), true); } catch (_) {}
      } finally {
        setLoaded(true);
      }
    })();
  }, []);

  const persist = async (next) => {
    setSaving(true);
    setProducts(next);
    try {
      await window.storage.set(CATALOG_KEY, JSON.stringify(next), true);
    } catch (e) {
      // keep local state even if save fails; user can retry an edit
    } finally {
      setSaving(false);
    }
  };

  const addToCart = (id, delta) => {
    setCart((prev) => {
      const product = products.find((p) => p.id === id);
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(product.stock, current + delta));
      const copy = { ...prev, [id]: next };
      if (next === 0) delete copy[id];
      return copy;
    });
  };

  const cartLines = useMemo(
    () => Object.entries(cart).map(([id, qty]) => {
      const product = products.find((p) => p.id === id);
      return { product, qty, lineTotal: product.price * qty };
    }),
    [cart, products]
  );

  const totalItems = cartLines.reduce((sum, l) => sum + l.qty, 0);
  const subtotal = cartLines.reduce((sum, l) => sum + l.lineTotal, 0);
  const discountPct = Math.min(totalItems * 0.1, 20);
  const discountAmount = subtotal * (discountPct / 100);
  const grandTotal = subtotal - discountAmount;

  const placeOrder = async () => {
    const next = products.map((p) => (cart[p.id] ? { ...p, stock: Math.max(0, p.stock - cart[p.id]) } : p));
    await persist(next);
    setOrderConfirm({ id: Math.floor(1000 + Math.random() * 9000), items: totalItems, total: grandTotal });
    setCart({});
  };

  const restock = async (id, amount) => {
    const next = products.map((p) => (p.id === id ? { ...p, stock: Math.min(p.maxStock, p.stock + amount) } : p));
    await persist(next);
  };

  const startEdit = (p) => {
    setEditingId(p.id);
    setEditDraft({ ...p, price: String(p.price), stock: String(p.stock), maxStock: String(p.maxStock) });
  };
  const saveEdit = async () => {
    const next = products.map((p) => p.id === editingId ? {
      ...p, ...editDraft,
      price: parseFloat(editDraft.price) || 0,
      stock: Math.max(0, parseInt(editDraft.stock) || 0),
      maxStock: Math.max(1, parseInt(editDraft.maxStock) || 1),
    } : p);
    await persist(next);
    setEditingId(null);
    setEditDraft(null);
  };
  const deleteProduct = async (id) => {
    const next = products.filter((p) => p.id !== id);
    await persist(next);
  };
  const saveNew = async () => {
    const item = {
      id: "p" + Date.now(),
      name: newDraft.name || "Untitled product",
      unit: newDraft.unit || "1 unit",
      category: newDraft.category || "General",
      emoji: newDraft.emoji || "🛍️",
      price: parseFloat(newDraft.price) || 0,
      stock: Math.max(0, parseInt(newDraft.stock) || 0),
      maxStock: Math.max(1, parseInt(newDraft.maxStock) || 1),
    };
    await persist([...products, item]);
    setAddingNew(false);
    setNewDraft({ emoji: "🛍️", category: "", name: "", unit: "", price: "0", stock: "0", maxStock: "10" });
  };

  const handleLogin = () => {
    if (loginForm.user === OWNER_USER && loginForm.pass === OWNER_PASS) {
      setIsOwner(true);
      setShowLogin(false);
      setLoginError("");
      setLoginForm({ user: "", pass: "" });
    } else {
      setLoginError("Incorrect username or password.");
    }
  };

  const lowStockCount = products.filter((p) => stockStatus(p.stock, p.maxStock).pct < 0.4).length;

  if (!loaded) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, background: TOKENS.parchment, borderRadius: 14, fontFamily: "'Space Grotesk', sans-serif", color: TOKENS.inkSoft, gap: 8 }}>
        <Loader2 className="pk-spin" size={18} /> Loading storefront…
        <style>{`.pk-spin { animation: pkspin 1s linear infinite; } @keyframes pkspin { to { transform: rotate(360deg); } }`}</style>
      </div>
    );
  }

  return (
    <div style={{
      fontFamily: "'Space Grotesk', sans-serif", background: TOKENS.parchment, color: TOKENS.ink,
      minHeight: 560, borderRadius: 14, overflow: "hidden", border: `1px solid ${TOKENS.line}`, position: "relative",
    }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .pk-scroll::-webkit-scrollbar { width: 6px; }
        .pk-scroll::-webkit-scrollbar-thumb { background: ${TOKENS.line}; border-radius: 4px; }
        .pk-card { transition: transform 0.15s ease, box-shadow 0.15s ease; }
        .pk-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(31,58,52,0.12); }
        .pk-perforate { background-image: radial-gradient(circle, ${TOKENS.parchment} 3px, transparent 3.5px); background-size: 14px 8px; background-position: top; height: 8px; }
      `}</style>

      {/* Login modal */}
      {showLogin && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(21,39,34,0.55)", zIndex: 20, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: TOKENS.paper, borderRadius: 12, padding: 22, width: 280, boxShadow: "0 12px 30px rgba(0,0,0,0.25)" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17 }}>Owner Login</div>
              <button onClick={() => { setShowLogin(false); setLoginError(""); }} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.inkSoft }}><X size={18} /></button>
            </div>
            <label style={labelStyle}>Username</label>
            <input style={{ ...inputStyle, marginBottom: 10 }} value={loginForm.user} onChange={(e) => setLoginForm({ ...loginForm, user: e.target.value })} />
            <label style={labelStyle}>Password</label>
            <input style={{ ...inputStyle, marginBottom: 10 }} type="password" value={loginForm.pass} onChange={(e) => setLoginForm({ ...loginForm, pass: e.target.value })} onKeyDown={(e) => e.key === "Enter" && handleLogin()} />
            {loginError && <div style={{ color: TOKENS.brick, fontSize: 12, marginBottom: 8 }}>{loginError}</div>}
            <button onClick={handleLogin} style={{ width: "100%", background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 600, cursor: "pointer" }}>Log in</button>
          </div>
        </div>
      )}

      {/* Header */}
      <div style={{ background: TOKENS.pine, padding: "18px 24px", display: "flex", alignItems: "center", justifyContent: "space-between", flexWrap: "wrap", gap: 12 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Globe2 color={TOKENS.gold} size={26} />
          <div>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 22, color: TOKENS.paper, lineHeight: 1 }}>MOHAZAN</div>
            <div style={{ fontSize: 11, color: TOKENS.gold, letterSpacing: 0.5, fontFamily: "'IBM Plex Mono', monospace" }}>global marketplace • delivered fast</div>
          </div>
        </div>
        <div style={{ display: "flex", gap: 10, alignItems: "center" }}>
          <div style={{ display: "flex", gap: 6, background: TOKENS.pineDark, padding: 4, borderRadius: 10 }}>
            <button onClick={() => setView("shop")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, background: view === "shop" ? TOKENS.gold : "transparent", color: view === "shop" ? TOKENS.pineDark : TOKENS.parchment }}>
              <Globe2 size={15} /> Shop
            </button>
            <button onClick={() => setView("stock")} style={{ display: "flex", alignItems: "center", gap: 6, padding: "8px 14px", borderRadius: 8, border: "none", cursor: "pointer", fontFamily: "'Space Grotesk', sans-serif", fontWeight: 600, fontSize: 13, background: view === "stock" ? TOKENS.gold : "transparent", color: view === "stock" ? TOKENS.pineDark : TOKENS.parchment, position: "relative" }}>
              <ClipboardList size={15} /> Inventory
              {lowStockCount > 0 && <span style={{ position: "absolute", top: -4, right: -4, background: TOKENS.brick, color: "#fff", fontSize: 10, fontFamily: "'IBM Plex Mono', monospace", borderRadius: 10, padding: "1px 5px" }}>{lowStockCount}</span>}
            </button>
          </div>
          {isOwner ? (
            <button onClick={() => setIsOwner(false)} style={{ display: "flex", alignItems: "center", gap: 6, background: TOKENS.gold, color: TOKENS.pineDark, border: "none", borderRadius: 8, padding: "8px 12px", fontWeight: 700, fontSize: 12.5, cursor: "pointer" }}>
              <Unlock size={14} /> Owner Mode
            </button>
          ) : (
            <button onClick={() => setShowLogin(true)} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", color: TOKENS.parchment, border: `1px solid ${TOKENS.gold}`, borderRadius: 8, padding: "8px 12px", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>
              <Lock size={13} /> Owner Login
            </button>
          )}
        </div>
      </div>

      {view === "shop" ? (
        <div style={{ display: "flex", flexWrap: "wrap" }}>
          <div className="pk-scroll" style={{ flex: "1 1 480px", padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(190px, 1fr))", gap: 14, maxHeight: 640, overflowY: "auto", alignContent: "start" }}>
            {isOwner && (
              addingNew ? (
                <div className="pk-card" style={{ background: TOKENS.paper, borderRadius: 12, border: `1px dashed ${TOKENS.pine}`, padding: 14 }}>
                  <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 13, marginBottom: 8 }}>New product</div>
                  <ProductForm draft={newDraft} setDraft={setNewDraft} onSave={saveNew} onCancel={() => setAddingNew(false)} saving={saving} />
                </div>
              ) : (
                <button onClick={() => setAddingNew(true)} className="pk-card" style={{ background: "none", border: `1.5px dashed ${TOKENS.pine}`, borderRadius: 12, minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: TOKENS.pine, fontWeight: 600, fontSize: 13 }}>
                  <Plus size={22} /> Add product
                </button>
              )
            )}

            {products.map((p) => {
              const status = stockStatus(p.stock, p.maxStock);
              const qtyInCart = cart[p.id] || 0;
              const soldOut = p.stock === 0;

              if (isOwner && editingId === p.id) {
                return (
                  <div key={p.id} className="pk-card" style={{ background: TOKENS.paper, borderRadius: 12, border: `1px solid ${TOKENS.gold}`, padding: 14 }}>
                    <ProductForm draft={editDraft} setDraft={setEditDraft} onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving} />
                  </div>
                );
              }

              return (
                <div key={p.id} className="pk-card" style={{ background: TOKENS.paper, borderRadius: 12, border: `1px solid ${TOKENS.line}`, padding: 14, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
                  {isOwner && (
                    <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
                      <button onClick={() => startEdit(p)} style={{ border: "none", background: TOKENS.parchment, borderRadius: 6, padding: 5, cursor: "pointer", color: TOKENS.pine }}><Pencil size={12} /></button>
                      <button onClick={() => deleteProduct(p.id)} style={{ border: "none", background: TOKENS.parchment, borderRadius: 6, padding: 5, cursor: "pointer", color: TOKENS.brick }}><Trash2 size={12} /></button>
                    </div>
                  )}
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <div style={{ fontSize: 30 }}>{p.emoji}</div>
                    {!isOwner && <Badge status={status} />}
                  </div>
                  <div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15 }}>{p.name}</div>
                    <div style={{ fontSize: 11, color: TOKENS.inkSoft }}>{p.category} · {p.unit}</div>
                  </div>
                  {isOwner && <Badge status={status} />}
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15, color: TOKENS.pine }}>${p.price.toFixed(2)}</div>
                  {soldOut ? (
                    <div style={{ fontSize: 12, color: TOKENS.brick, fontWeight: 600, textAlign: "center", padding: "7px 0" }}>Out of stock</div>
                  ) : qtyInCart === 0 ? (
                    <button onClick={() => addToCart(p.id, 1)} style={{ background: TOKENS.pine, color: TOKENS.paper, border: "none", borderRadius: 8, padding: "8px 0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>+ Add to cart</button>
                  ) : (
                    <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: TOKENS.parchment, borderRadius: 8, padding: "4px 8px" }}>
                      <button onClick={() => addToCart(p.id, -1)} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.pine }}><Minus size={15} /></button>
                      <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{qtyInCart}</span>
                      <button onClick={() => addToCart(p.id, 1)} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.pine }}><Plus size={15} /></button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <div style={{ flex: "1 1 280px", maxWidth: 320, padding: "20px 20px 20px 0" }}>
            <div style={{ background: TOKENS.paper, borderRadius: 4, border: `1px solid ${TOKENS.line}`, boxShadow: "0 6px 18px rgba(31,58,52,0.08)" }}>
              <div className="pk-perforate" />
              <div style={{ padding: "6px 18px 18px" }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1, color: TOKENS.inkSoft, textAlign: "center", marginBottom: 10 }}>— ORDER RECEIPT —</div>

                {orderConfirm && (
                  <div style={{ background: "#EAF3EC", border: `1px solid ${TOKENS.pine}`, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, display: "flex", gap: 8, alignItems: "flex-start" }}>
                    <Check size={16} color={TOKENS.pine} style={{ flexShrink: 0, marginTop: 1 }} />
                    <div>Order #{orderConfirm.id} placed! {orderConfirm.items} item(s), ${orderConfirm.total.toFixed(2)}.</div>
                  </div>
                )}

                {cartLines.length === 0 ? (
                  <div style={{ textAlign: "center", color: TOKENS.inkSoft, fontSize: 13, padding: "20px 0" }}>Cart is empty.<br />Pick something on the left.</div>
                ) : (
                  <>
                    <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                      {cartLines.map(({ product, qty, lineTotal }) => (
                        <div key={product.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                          <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                            <span>{product.emoji}</span>
                            <div>
                              <div style={{ fontWeight: 600 }}>{product.name}</div>
                              <div style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{qty} × ${product.price.toFixed(2)}</div>
                            </div>
                          </div>
                          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>${lineTotal.toFixed(2)}</span>
                            <button onClick={() => setCart((prev) => { const c = { ...prev }; delete c[product.id]; return c; })} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.brick }}><Trash2 size={13} /></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <div style={{ borderTop: `1px dashed ${TOKENS.line}`, paddingTop: 10, fontFamily: "'IBM Plex Mono', monospace", fontSize: 12.5, display: "flex", flexDirection: "column", gap: 5 }}>
                      <div style={{ display: "flex", justifyContent: "space-between", color: TOKENS.inkSoft }}><span>Subtotal ({totalItems} items)</span><span>${subtotal.toFixed(2)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", color: TOKENS.gold }}><span>Bulk discount (0.1% × {totalItems})</span><span>−${discountAmount.toFixed(2)}</span></div>
                      <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, color: TOKENS.pine, borderTop: `1px dashed ${TOKENS.line}`, paddingTop: 6, marginTop: 2 }}><span>TOTAL</span><span>${grandTotal.toFixed(2)}</span></div>
                    </div>
                    <button onClick={placeOrder} style={{ width: "100%", marginTop: 14, background: TOKENS.brick, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 13.5, cursor: "pointer", letterSpacing: 0.3 }}>PLACE ORDER & PAY</button>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ padding: 20 }}>
          <div style={{ display: "flex", gap: 14, marginBottom: 16, flexWrap: "wrap" }}>
            <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: "12px 18px", flex: "1 1 140px" }}>
              <div style={{ fontSize: 11, color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>TOTAL PRODUCTS</div>
              <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: TOKENS.pine }}>{products.length}</div>
            </div>
            <div style={{ background: "#FBEEEC", border: `1px solid ${TOKENS.brick}`, borderRadius: 10, padding: "12px 18px", flex: "1 1 140px", display: "flex", gap: 10, alignItems: "center" }}>
              <AlertTriangle color={TOKENS.brick} size={22} />
              <div>
                <div style={{ fontSize: 11, color: TOKENS.brick, fontFamily: "'IBM Plex Mono', monospace" }}>LOW / ALMOST OUT</div>
                <div style={{ fontFamily: "'Fraunces', serif", fontSize: 24, fontWeight: 700, color: TOKENS.brick }}>{lowStockCount}</div>
              </div>
            </div>
            {!isOwner && (
              <div style={{ flex: "2 1 240px", display: "flex", alignItems: "center", gap: 8, color: TOKENS.inkSoft, fontSize: 12.5, fontStyle: "italic" }}>
                Log in as owner to edit stock, prices, and products directly.
              </div>
            )}
          </div>

          <div className="pk-scroll" style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 12, overflow: "hidden" }}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.4fr 0.9fr 1fr", gap: 8, padding: "10px 18px", background: TOKENS.pine, color: TOKENS.parchment, fontSize: 11, fontFamily: "'IBM Plex Mono', monospace", letterSpacing: 0.4 }}>
              <div>PRODUCT</div><div>PRICE</div><div>STOCK</div><div>STATUS</div><div style={{ textAlign: "right" }}>ACTION</div>
            </div>
            {[...products].sort((a, b) => stockStatus(a.stock, a.maxStock).pct - stockStatus(b.stock, b.maxStock).pct).map((p) => {
              const status = stockStatus(p.stock, p.maxStock);
              if (isOwner && editingId === p.id) {
                return (
                  <div key={p.id} style={{ padding: "14px 18px", borderTop: `1px solid ${TOKENS.line}` }}>
                    <ProductForm draft={editDraft} setDraft={setEditDraft} onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving} />
                  </div>
                );
              }
              return (
                <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.4fr 0.9fr 1fr", gap: 8, padding: "10px 18px", alignItems: "center", borderTop: `1px solid ${TOKENS.line}`, fontSize: 13 }}>
                  <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                    <span>{p.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{p.name}</div>
                      <div style={{ fontSize: 11, color: TOKENS.inkSoft }}>{p.category} · {p.unit}</div>
                    </div>
                  </div>
                  <div style={{ fontFamily: "'IBM Plex Mono', monospace" }}>${p.price.toFixed(2)}</div>
                  <div style={{ display: "flex", flexDirection: "column", gap: 4 }}>
                    <StockBar stock={p.stock} maxStock={p.maxStock} />
                    <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 11, color: TOKENS.inkSoft }}>{p.stock} / {p.maxStock}</span>
                  </div>
                  <Badge status={status} />
                  <div style={{ textAlign: "right", display: "flex", gap: 6, justifyContent: "flex-end" }}>
                    {isOwner ? (
                      <>
                        <button onClick={() => startEdit(p)} style={{ border: `1px solid ${TOKENS.pine}`, background: "none", color: TOKENS.pine, borderRadius: 7, padding: "5px 8px", cursor: "pointer" }}><Pencil size={12} /></button>
                        <button onClick={() => deleteProduct(p.id)} style={{ border: `1px solid ${TOKENS.brick}`, background: "none", color: TOKENS.brick, borderRadius: 7, padding: "5px 8px", cursor: "pointer" }}><Trash2 size={12} /></button>
                      </>
                    ) : (
                      <button onClick={() => restock(p.id, Math.round(p.maxStock * 0.5))} disabled={p.stock >= p.maxStock} style={{ display: "inline-flex", alignItems: "center", gap: 5, border: `1px solid ${TOKENS.pine}`, background: "none", color: TOKENS.pine, borderRadius: 7, padding: "5px 10px", fontSize: 11.5, fontWeight: 600, cursor: p.stock >= p.maxStock ? "default" : "pointer", opacity: p.stock >= p.maxStock ? 0.35 : 1 }}>
                        <RotateCcw size={12} /> Restock
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
            {isOwner && (
              <div style={{ padding: "12px 18px", borderTop: `1px solid ${TOKENS.line}` }}>
                {addingNew ? (
                  <ProductForm draft={newDraft} setDraft={setNewDraft} onSave={saveNew} onCancel={() => setAddingNew(false)} saving={saving} />
                ) : (
                  <button onClick={() => setAddingNew(true)} style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px dashed ${TOKENS.pine}`, background: "none", color: TOKENS.pine, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: 12.5 }}>
                    <Plus size={14} /> Add product
                  </button>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
