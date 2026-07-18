import { useState, useEffect, useMemo, useRef } from "react";
import {
  Globe2, Plus, Minus, Trash2, AlertTriangle, X, Check, Pencil, Lock, Unlock,
  RotateCcw, Loader2, MessageCircle, Bell, PlayCircle, Home as HomeIcon, User,
  Search, ArrowLeft, SlidersHorizontal, ShoppingCart, Settings as SettingsIcon,
  Star, Truck, PackageCheck, Send, Sparkles, LogOut, ChevronRight, Clock, CreditCard,
  QrCode, Phone, Mail, ShieldCheck, RefreshCw,
} from "lucide-react";

const TOKENS = {
  pine: "#1F3A34", pineDark: "#152722", parchment: "#F2E9D8", paper: "#FFFDF8",
  brick: "#C1443D", gold: "#E0A62E", ink: "#2B2620", inkSoft: "#6B6255", line: "#D8CBAE",
};

const OWNER_USER = "Moha";
const OWNER_PASS = "mo9090";
const K = {
  catalog: "mohazan-catalog-v1",
  ads: "mohazan-ads-v1",
  account: "mohazan-account-v1",
  messages: "mohazan-messages-v1",
  notifications: "mohazan-notifications-v1",
  orders: "mohazan-orders-v1",
};

const CATEGORY_ICONS = {
  "Electronics": "📱", "Fashion": "👗", "Home & Living": "🏠",
  "Beauty": "💄", "Groceries": "🛒", "Fitness": "🏋️",
};

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

const DEFAULT_ADS = [
  { id: "a1", title: "Weekend Flash Sale", desc: "Up to 20% off Electronics — today only.", emoji: "⚡", color: "#1F3A34" },
  { id: "a2", title: "New In: Home & Living", desc: "Fresh arrivals to upgrade your space.", emoji: "🏠", color: "#C1443D" },
  { id: "a3", title: "Free Shipping Fridays", desc: "No minimum spend, every Friday.", emoji: "🚚", color: "#E0A62E" },
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
  const segments = 12, filled = Math.round(pct * segments);
  return <div style={{ display: "flex", gap: 2 }}>{Array.from({ length: segments }).map((_, i) => (
    <div key={i} style={{ width: 6, height: 14, borderRadius: 1, background: i < filled ? color : TOKENS.line }} />
  ))}</div>;
}
function Badge({ status }) {
  const isGood = status.label === "In Stock";
  return <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10.5, fontWeight: 600, color: isGood ? TOKENS.pine : "#fff", background: isGood ? "transparent" : status.color, border: isGood ? `1px solid ${status.color}` : "none", padding: "3px 7px", borderRadius: 20, whiteSpace: "nowrap" }}>{status.label.toUpperCase()}</span>;
}
const inputStyle = { width: "100%", boxSizing: "border-box", padding: "7px 9px", borderRadius: 6, border: `1px solid ${TOKENS.line}`, fontFamily: "'Space Grotesk', sans-serif", fontSize: 12.5, background: TOKENS.paper, color: TOKENS.ink };
const labelStyle = { fontSize: 10, color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace", marginBottom: 2, display: "block" };

function ProductForm({ draft, setDraft, onSave, onCancel, saving }) {
  const field = (key, label, type = "text") => (
    <div><label style={labelStyle}>{label}</label>
      <input style={inputStyle} type={type} value={draft[key]} onChange={(e) => setDraft({ ...draft, [key]: e.target.value })} /></div>
  );
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>{field("emoji", "Icon (emoji)")}{field("category", "Category")}</div>
      {field("name", "Product name")}{field("unit", "Unit / variant")}
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 8 }}>{field("price", "Price ($)", "number")}{field("stock", "Stock", "number")}{field("maxStock", "Max stock", "number")}</div>
      <div style={{ display: "flex", gap: 8, marginTop: 4 }}>
        <button onClick={onSave} disabled={saving} style={{ flex: 1, background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 7, padding: "7px 0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>{saving ? "Saving…" : "Save"}</button>
        <button onClick={onCancel} style={{ flex: 1, background: "none", color: TOKENS.inkSoft, border: `1px solid ${TOKENS.line}`, borderRadius: 7, padding: "7px 0", fontWeight: 600, fontSize: 12.5, cursor: "pointer" }}>Cancel</button>
      </div>
    </div>
  );
}

function ProductCard({ p, isOwner, cart, addToCart, editingId, startEdit, deleteProduct, editDraft, setEditDraft, saveEdit, setEditingId, saving }) {
  const status = stockStatus(p.stock, p.maxStock);
  const qtyInCart = cart[p.id] || 0;
  const soldOut = p.stock === 0;
  if (isOwner && editingId === p.id) {
    return <div className="pk-card" style={{ background: TOKENS.paper, borderRadius: 12, border: `1px solid ${TOKENS.gold}`, padding: 14 }}>
      <ProductForm draft={editDraft} setDraft={setEditDraft} onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving} />
    </div>;
  }
  return (
    <div className="pk-card" style={{ background: TOKENS.paper, borderRadius: 12, border: `1px solid ${TOKENS.line}`, padding: 14, display: "flex", flexDirection: "column", gap: 8, position: "relative" }}>
      {isOwner && <div style={{ position: "absolute", top: 10, right: 10, display: "flex", gap: 6 }}>
        <button onClick={() => startEdit(p)} style={{ border: "none", background: TOKENS.parchment, borderRadius: 6, padding: 5, cursor: "pointer", color: TOKENS.pine }}><Pencil size={12} /></button>
        <button onClick={() => deleteProduct(p.id)} style={{ border: "none", background: TOKENS.parchment, borderRadius: 6, padding: 5, cursor: "pointer", color: TOKENS.brick }}><Trash2 size={12} /></button>
      </div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
        <div style={{ fontSize: 30 }}>{p.emoji}</div>{!isOwner && <Badge status={status} />}
      </div>
      <div><div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15 }}>{p.name}</div>
        <div style={{ fontSize: 11, color: TOKENS.inkSoft }}>{p.category} · {p.unit}</div></div>
      {isOwner && <Badge status={status} />}
      <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600, fontSize: 15, color: TOKENS.pine }}>${p.price.toFixed(2)}</div>
      {soldOut ? <div style={{ fontSize: 12, color: TOKENS.brick, fontWeight: 600, textAlign: "center", padding: "7px 0" }}>Out of stock</div>
        : qtyInCart === 0 ? <button onClick={() => addToCart(p.id, 1)} style={{ background: TOKENS.pine, color: TOKENS.paper, border: "none", borderRadius: 8, padding: "8px 0", fontWeight: 600, fontSize: 13, cursor: "pointer" }}>+ Add to cart</button>
        : <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: TOKENS.parchment, borderRadius: 8, padding: "4px 8px" }}>
            <button onClick={() => addToCart(p.id, -1)} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.pine }}><Minus size={15} /></button>
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{qtyInCart}</span>
            <button onClick={() => addToCart(p.id, 1)} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.pine }}><Plus size={15} /></button>
          </div>}
    </div>
  );
}

export default function Mohazan() {
  const [products, setProducts] = useState([]);
  const [ads, setAds] = useState([]);
  const [account, setAccount] = useState(null);
  const [messages, setMessages] = useState([]);
  const [notifications, setNotifications] = useState([]);
  const [orders, setOrders] = useState([]);
  const [loaded, setLoaded] = useState(false);
  const [saving, setSaving] = useState(false);

  const [tab, setTab] = useState("home");
  const [cart, setCart] = useState({});
  const [cartOpen, setCartOpen] = useState(false);
  const [orderConfirm, setOrderConfirm] = useState(null);

  const [category, setCategory] = useState(null);
  const [query, setQuery] = useState("");
  const [sortBy, setSortBy] = useState("");
  const [showSort, setShowSort] = useState(false);

  const [isOwner, setIsOwner] = useState(false);
  const [showLogin, setShowLogin] = useState(false);
  const [loginForm, setLoginForm] = useState({ user: "", pass: "" });
  const [loginError, setLoginError] = useState("");

  const [editingId, setEditingId] = useState(null);
  const [editDraft, setEditDraft] = useState(null);
  const [addingNew, setAddingNew] = useState(false);
  const [newDraft, setNewDraft] = useState({ emoji: "🛍️", category: "", name: "", unit: "", price: "0", stock: "0", maxStock: "10" });

  const [editingAdId, setEditingAdId] = useState(null);
  const [adDraft, setAdDraft] = useState(null);
  const [addingAd, setAddingAd] = useState(false);
  const [newAdDraft, setNewAdDraft] = useState({ title: "", desc: "", emoji: "📣", color: TOKENS.pine });

  const [profileForm, setProfileForm] = useState({ name: "" });
  const [showProfileForm, setShowProfileForm] = useState(false);
  const [profileStep, setProfileStep] = useState("form"); // 'form' | 'otp'
  const [contactType, setContactType] = useState("email"); // 'email' | 'phone'
  const [contactValue, setContactValue] = useState("");
  const [generatedOtp, setGeneratedOtp] = useState("");
  const [otpInput, setOtpInput] = useState("");
  const [otpError, setOtpError] = useState("");
  const [showSettings, setShowSettings] = useState(false);
  const [showPayment, setShowPayment] = useState(false);
  const [pendingOrder, setPendingOrder] = useState(null);
  const [paying, setPaying] = useState(false);
  const [msgFilter, setMsgFilter] = useState(null); // order status filter within Me
  const [chatInput, setChatInput] = useState("");
  const chatEndRef = useRef(null);

  useEffect(() => {
    (async () => {
      const safeGet = async (key, shared, fallback) => {
        try { const r = await window.storage.get(key, shared); return r ? JSON.parse(r.value) : fallback; }
        catch (e) { return fallback; }
      };
      const cat = await safeGet(K.catalog, true, null);
      if (cat && cat.length) setProducts(cat); else { setProducts(DEFAULT_PRODUCTS); try { await window.storage.set(K.catalog, JSON.stringify(DEFAULT_PRODUCTS), true); } catch (e) {} }
      const adList = await safeGet(K.ads, true, null);
      if (adList && adList.length) setAds(adList); else { setAds(DEFAULT_ADS); try { await window.storage.set(K.ads, JSON.stringify(DEFAULT_ADS), true); } catch (e) {} }
      setAccount(await safeGet(K.account, false, null));
      setMessages(await safeGet(K.messages, false, []));
      setNotifications(await safeGet(K.notifications, false, []));
      setOrders(await safeGet(K.orders, false, []));
      setLoaded(true);
    })();
  }, []);

  const persistCatalog = async (next) => { setSaving(true); setProducts(next); try { await window.storage.set(K.catalog, JSON.stringify(next), true); } catch (e) {} finally { setSaving(false); } };
  const persistAds = async (next) => { setSaving(true); setAds(next); try { await window.storage.set(K.ads, JSON.stringify(next), true); } catch (e) {} finally { setSaving(false); } };
  const persistAccount = async (next) => { setAccount(next); try { await window.storage.set(K.account, JSON.stringify(next), false); } catch (e) {} };
  const persistMessages = async (next) => { setMessages(next); try { await window.storage.set(K.messages, JSON.stringify(next), false); } catch (e) {} };
  const persistNotifications = async (next) => { setNotifications(next); try { await window.storage.set(K.notifications, JSON.stringify(next), false); } catch (e) {} };
  const persistOrders = async (next) => { setOrders(next); try { await window.storage.set(K.orders, JSON.stringify(next), false); } catch (e) {} };

  const addToCart = (id, delta) => {
    setCart((prev) => {
      const product = products.find((p) => p.id === id);
      const current = prev[id] || 0;
      const next = Math.max(0, Math.min(product.stock, current + delta));
      const copy = { ...prev, [id]: next }; if (next === 0) delete copy[id]; return copy;
    });
  };
  const cartLines = useMemo(() => Object.entries(cart).map(([id, qty]) => { const product = products.find((p) => p.id === id); return { product, qty, lineTotal: product.price * qty }; }), [cart, products]);
  const totalItems = cartLines.reduce((s, l) => s + l.qty, 0);
  const subtotal = cartLines.reduce((s, l) => s + l.lineTotal, 0);
  const discountPct = Math.min(totalItems * 0.1, 20);
  const discountAmount = subtotal * (discountPct / 100);
  const grandTotal = subtotal - discountAmount;

  const openPayment = () => {
    if (cartLines.length === 0) return;
    const orderId = Math.floor(1000 + Math.random() * 9000);
    setPendingOrder({ id: orderId, lines: cartLines, total: grandTotal });
    setShowPayment(true);
  };

  const confirmPayment = async () => {
    if (!pendingOrder) return;
    setPaying(true);
    const next = products.map((p) => (cart[p.id] ? { ...p, stock: Math.max(0, p.stock - cart[p.id]) } : p));
    await persistCatalog(next);
    const order = { id: pendingOrder.id, items: pendingOrder.lines.map((l) => ({ name: l.product.name, emoji: l.product.emoji, qty: l.qty, price: l.product.price })), total: pendingOrder.total, status: "toShip", placedAt: Date.now() };
    await persistOrders([order, ...orders]);
    await persistNotifications([{ id: "n" + Date.now(), text: `Order #${pendingOrder.id} paid! Total $${pendingOrder.total.toFixed(2)}. We'll notify you when it ships.`, ts: Date.now(), read: false }, ...notifications]);
    setOrderConfirm({ id: pendingOrder.id, items: pendingOrder.lines.reduce((s, l) => s + l.qty, 0), total: pendingOrder.total });
    setCart({}); setShowPayment(false); setPendingOrder(null); setCartOpen(false); setPaying(false);
  };

  const generateCode = () => String(Math.floor(100000 + Math.random() * 900000));

  const sendOtp = () => {
    if (!contactValue.trim()) return;
    setGeneratedOtp(generateCode());
    setOtpInput(""); setOtpError(""); setProfileStep("otp");
  };
  const verifyOtp = async () => {
    if (otpInput.trim() === generatedOtp) {
      await persistAccount({ name: profileForm.name.trim() || "Customer", contact: contactValue.trim(), contactType, verified: true });
      setShowProfileForm(false); setProfileStep("form"); setOtpInput(""); setOtpError("");
    } else {
      setOtpError("Incorrect code. Please try again.");
    }
  };

  const advanceOrder = async (id, newStatus) => {
    const next = orders.map((o) => o.id === id ? { ...o, status: newStatus } : o);
    await persistOrders(next);
    if (newStatus === "toReceive") await persistNotifications([{ id: "n" + Date.now(), text: `Order #${id} has shipped and is on its way.`, ts: Date.now(), read: false }, ...notifications]);
  };
  const rateOrder = async (id, stars) => {
    const next = orders.map((o) => o.id === id ? { ...o, status: "completed", rating: stars } : o);
    await persistOrders(next);
  };

  const restock = async (id, amount) => { const next = products.map((p) => (p.id === id ? { ...p, stock: Math.min(p.maxStock, p.stock + amount) } : p)); await persistCatalog(next); };
  const startEdit = (p) => { setEditingId(p.id); setEditDraft({ ...p, price: String(p.price), stock: String(p.stock), maxStock: String(p.maxStock) }); };
  const saveEdit = async () => {
    const next = products.map((p) => p.id === editingId ? { ...p, ...editDraft, price: parseFloat(editDraft.price) || 0, stock: Math.max(0, parseInt(editDraft.stock) || 0), maxStock: Math.max(1, parseInt(editDraft.maxStock) || 1) } : p);
    await persistCatalog(next); setEditingId(null); setEditDraft(null);
  };
  const deleteProduct = async (id) => { await persistCatalog(products.filter((p) => p.id !== id)); };
  const saveNew = async () => {
    const item = { id: "p" + Date.now(), name: newDraft.name || "Untitled product", unit: newDraft.unit || "1 unit", category: newDraft.category || "General", emoji: newDraft.emoji || "🛍️", price: parseFloat(newDraft.price) || 0, stock: Math.max(0, parseInt(newDraft.stock) || 0), maxStock: Math.max(1, parseInt(newDraft.maxStock) || 1) };
    await persistCatalog([...products, item]); setAddingNew(false); setNewDraft({ emoji: "🛍️", category: "", name: "", unit: "", price: "0", stock: "0", maxStock: "10" });
  };

  const saveAdEdit = async () => { const next = ads.map((a) => a.id === editingAdId ? { ...a, ...adDraft } : a); await persistAds(next); setEditingAdId(null); setAdDraft(null); };
  const deleteAd = async (id) => { await persistAds(ads.filter((a) => a.id !== id)); };
  const saveNewAd = async () => { await persistAds([...ads, { id: "a" + Date.now(), ...newAdDraft }]); setAddingAd(false); setNewAdDraft({ title: "", desc: "", emoji: "📣", color: TOKENS.pine }); };

  const handleLogin = () => {
    if (loginForm.user === OWNER_USER && loginForm.pass === OWNER_PASS) { setIsOwner(true); setShowLogin(false); setLoginError(""); setLoginForm({ user: "", pass: "" }); }
    else setLoginError("Incorrect username or password.");
  };

  const sendChat = async () => {
    if (!chatInput.trim()) return;
    const userMsg = { from: "user", text: chatInput.trim(), ts: Date.now() };
    const next = [...messages, userMsg];
    await persistMessages(next);
    setChatInput("");
    setTimeout(async () => {
      const reply = { from: "store", text: "Thanks for messaging MOHAZAN! Our team will reply shortly.", ts: Date.now() };
      await persistMessages([...next, reply]);
    }, 900);
  };

  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages, tab]);
  useEffect(() => { if (tab === "notifications" && notifications.some(n => !n.read)) { persistNotifications(notifications.map(n => ({ ...n, read: true }))); } }, [tab]);

  const categories = useMemo(() => [...new Set(products.map((p) => p.category))], [products]);
  const lowStockCount = products.filter((p) => stockStatus(p.stock, p.maxStock).pct < 0.4).length;
  const unreadCount = notifications.filter((n) => !n.read).length;

  const visibleProducts = useMemo(() => {
    let list = products;
    if (query.trim()) list = list.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()));
    else if (category) list = list.filter((p) => p.category === category);
    else return [];
    const sorted = [...list];
    if (sortBy === "priceHigh") sorted.sort((a, b) => b.price - a.price);
    else if (sortBy === "priceLow") sorted.sort((a, b) => a.price - b.price);
    else if (sortBy === "nameAZ") sorted.sort((a, b) => a.name.localeCompare(b.name));
    else if (sortBy === "nameZA") sorted.sort((a, b) => b.name.localeCompare(a.name));
    return sorted;
  }, [products, query, category, sortBy]);

  const recommended = useMemo(() => [...products].sort(() => 0.5 - Math.random()).slice(0, 4), [products.length]);

  const cardProps = { isOwner, cart, addToCart, editingId, startEdit, deleteProduct, editDraft, setEditDraft, saveEdit, setEditingId, saving };

  if (!loaded) return (
    <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 400, background: TOKENS.parchment, borderRadius: 14, fontFamily: "'Space Grotesk', sans-serif", color: TOKENS.inkSoft, gap: 8 }}>
      <Loader2 className="pk-spin" size={18} /> Loading storefront…
      <style>{`.pk-spin { animation: pkspin 1s linear infinite; } @keyframes pkspin { to { transform: rotate(360deg); } }`}</style>
    </div>
  );

  const NavBtn = ({ id, icon, label, badge }) => (
    <button onClick={() => setTab(id)} style={{ flex: 1, background: "none", border: "none", cursor: "pointer", display: "flex", flexDirection: "column", alignItems: "center", gap: 3, padding: "8px 0", color: tab === id ? TOKENS.gold : TOKENS.parchment, position: "relative" }}>
      {icon}
      <span style={{ fontSize: 9.5, fontFamily: "'IBM Plex Mono', monospace", fontWeight: 600 }}>{label}</span>
      {badge > 0 && <span style={{ position: "absolute", top: 2, right: "28%", background: TOKENS.brick, color: "#fff", fontSize: 9, borderRadius: 10, padding: "1px 4px", fontFamily: "'IBM Plex Mono', monospace" }}>{badge}</span>}
    </button>
  );

  const orderCounts = {
    toPay: 0,
    toShip: orders.filter((o) => o.status === "toShip").length,
    toReceive: orders.filter((o) => o.status === "toReceive").length,
    toRate: orders.filter((o) => o.status === "toRate").length,
  };

  return (
    <div style={{ fontFamily: "'Space Grotesk', sans-serif", background: TOKENS.parchment, color: TOKENS.ink, minHeight: 640, borderRadius: 14, overflow: "hidden", border: `1px solid ${TOKENS.line}`, position: "relative", display: "flex", flexDirection: "column" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,600;9..144,700&family=Space+Grotesk:wght@500;600;700&family=IBM+Plex+Mono:wght@500;600&display=swap');
        .pk-scroll::-webkit-scrollbar { width: 6px; } .pk-scroll::-webkit-scrollbar-thumb { background: ${TOKENS.line}; border-radius: 4px; }
        .pk-card { transition: transform 0.15s ease, box-shadow 0.15s ease; } .pk-card:hover { transform: translateY(-2px); box-shadow: 0 8px 20px rgba(31,58,52,0.12); }
        .pk-perforate { background-image: radial-gradient(circle, ${TOKENS.parchment} 3px, transparent 3.5px); background-size: 14px 8px; background-position: top; height: 8px; }
        .pk-tile:hover { background: ${TOKENS.paper}; }
      `}</style>

      {/* Modals */}
      {showLogin && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(21,39,34,0.55)", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
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

      {cartOpen && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(21,39,34,0.55)", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: TOKENS.paper, borderRadius: 4, border: `1px solid ${TOKENS.line}`, width: 320, maxHeight: "85%", overflowY: "auto" }} className="pk-scroll">
            <div className="pk-perforate" />
            <div style={{ padding: "6px 18px 18px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 12, letterSpacing: 1, color: TOKENS.inkSoft }}>— ORDER RECEIPT —</div>
                <button onClick={() => setCartOpen(false)} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.inkSoft }}><X size={16} /></button>
              </div>
              {orderConfirm && <div style={{ background: "#EAF3EC", border: `1px solid ${TOKENS.pine}`, borderRadius: 8, padding: 10, marginBottom: 12, fontSize: 12, display: "flex", gap: 8 }}>
                <Check size={16} color={TOKENS.pine} style={{ flexShrink: 0, marginTop: 1 }} />
                <div>Order #{orderConfirm.id} placed! {orderConfirm.items} item(s), ${orderConfirm.total.toFixed(2)}.</div>
              </div>}
              {cartLines.length === 0 ? <div style={{ textAlign: "center", color: TOKENS.inkSoft, fontSize: 13, padding: "20px 0" }}>Cart is empty.</div> : <>
                <div style={{ display: "flex", flexDirection: "column", gap: 10, marginBottom: 12 }}>
                  {cartLines.map(({ product, qty, lineTotal }) => (
                    <div key={product.id} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12.5 }}>
                      <div style={{ display: "flex", gap: 8, alignItems: "center" }}><span>{product.emoji}</span>
                        <div><div style={{ fontWeight: 600 }}>{product.name}</div><div style={{ color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>{qty} × ${product.price.toFixed(2)}</div></div></div>
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
                  <div style={{ display: "flex", justifyContent: "space-between", fontWeight: 700, fontSize: 15, color: TOKENS.pine, borderTop: `1px dashed ${TOKENS.line}`, paddingTop: 6 }}><span>TOTAL</span><span>${grandTotal.toFixed(2)}</span></div>
                </div>
                <button onClick={openPayment} style={{ width: "100%", marginTop: 14, background: TOKENS.brick, color: "#fff", border: "none", borderRadius: 8, padding: "11px 0", fontWeight: 700, fontSize: 13.5, cursor: "pointer" }}>PROCEED TO PAYMENT</button>
              </>}
            </div>
          </div>
        </div>
      )}

      {showPayment && pendingOrder && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(21,39,34,0.6)", zIndex: 35, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: TOKENS.paper, borderRadius: 14, padding: 22, width: 300, textAlign: "center" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 10 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 16, display: "flex", alignItems: "center", gap: 6 }}><QrCode size={17} /> Scan to Pay</div>
              <button onClick={() => { setShowPayment(false); setPendingOrder(null); }} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.inkSoft }}><X size={18} /></button>
            </div>
            <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginBottom: 12 }}>Order #{pendingOrder.id}</div>
            <div style={{ background: "#fff", border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 10, display: "inline-block", marginBottom: 12 }}>
              <img
                alt="Payment QR code"
                width={200}
                height={200}
                src={`https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(`MOHAZAN-PAY|order:${pendingOrder.id}|amount:${pendingOrder.total.toFixed(2)}|currency:USD`)}`}
              />
            </div>
            <div style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 22, fontWeight: 700, color: TOKENS.pine, marginBottom: 4 }}>${pendingOrder.total.toFixed(2)}</div>
            <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginBottom: 16 }}>Scan with your banking or e-wallet app to pay this exact amount.</div>
            <button onClick={confirmPayment} disabled={paying} style={{ width: "100%", background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 8, padding: "10px 0", fontWeight: 700, fontSize: 13, cursor: "pointer", marginBottom: 8 }}>
              {paying ? "Confirming…" : "I've Paid"}
            </button>
            <div style={{ fontSize: 10.5, color: TOKENS.inkSoft }}>This is a demo QR for prototyping — no real payment gateway is connected yet.</div>
          </div>
        </div>
      )}


        <div style={{ position: "absolute", inset: 0, background: "rgba(21,39,34,0.55)", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: TOKENS.paper, borderRadius: 12, padding: 20, width: 280 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17 }}>Settings</div>
              <button onClick={() => setShowSettings(false)} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.inkSoft }}><X size={18} /></button>
            </div>
            <div style={{ display: "flex", flexDirection: "column", gap: 8, fontSize: 13 }}>
              <button onClick={() => { setShowSettings(false); setProfileForm({ name: account?.name || "" }); setContactValue(account?.contact || ""); setContactType(account?.contactType || "email"); setProfileStep("form"); setShowProfileForm(true); }} style={{ textAlign: "left", background: "none", border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}>Edit profile</button>
              {account && <button onClick={async () => { await persistAccount(null); setShowSettings(false); }} style={{ textAlign: "left", background: "none", border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", color: TOKENS.brick }}>Log out profile</button>}
              {isOwner ? (
                <button onClick={() => { setIsOwner(false); setShowSettings(false); }} style={{ textAlign: "left", background: "none", border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer", color: TOKENS.brick }}>Log out of Owner Mode</button>
              ) : (
                <button onClick={() => { setShowSettings(false); setShowLogin(true); }} style={{ textAlign: "left", background: "none", border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: "10px 12px", cursor: "pointer" }}>Store owner? Log in</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showProfileForm && (
        <div style={{ position: "absolute", inset: 0, background: "rgba(21,39,34,0.55)", zIndex: 30, display: "flex", alignItems: "center", justifyContent: "center", padding: 20 }}>
          <div style={{ background: TOKENS.paper, borderRadius: 12, padding: 20, width: 290 }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 14 }}>
              <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 17 }}>{profileStep === "form" ? (account ? "Edit profile" : "Create account") : "Verify it's you"}</div>
              <button onClick={() => { setShowProfileForm(false); setProfileStep("form"); setOtpError(""); }} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.inkSoft }}><X size={18} /></button>
            </div>

            {profileStep === "form" ? (
              <>
                <label style={labelStyle}>Name</label>
                <input style={{ ...inputStyle, marginBottom: 10 }} value={profileForm.name} onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })} />

                <label style={labelStyle}>Verify with</label>
                <div style={{ display: "flex", gap: 6, marginBottom: 10 }}>
                  <button onClick={() => setContactType("email")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 0", borderRadius: 7, border: `1px solid ${contactType === "email" ? TOKENS.pine : TOKENS.line}`, background: contactType === "email" ? TOKENS.pine : "none", color: contactType === "email" ? "#fff" : TOKENS.ink, cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Mail size={13} /> Email</button>
                  <button onClick={() => setContactType("phone")} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: "7px 0", borderRadius: 7, border: `1px solid ${contactType === "phone" ? TOKENS.pine : TOKENS.line}`, background: contactType === "phone" ? TOKENS.pine : "none", color: contactType === "phone" ? "#fff" : TOKENS.ink, cursor: "pointer", fontSize: 12, fontWeight: 600 }}><Phone size={13} /> Phone</button>
                </div>
                <label style={labelStyle}>{contactType === "email" ? "Email address" : "Phone number (with country code)"}</label>
                <input
                  style={{ ...inputStyle, marginBottom: 12 }}
                  placeholder={contactType === "email" ? "you@example.com" : "+60 12-345 6789"}
                  value={contactValue}
                  onChange={(e) => setContactValue(e.target.value)}
                />
                <button onClick={sendOtp} style={{ width: "100%", background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 600, cursor: "pointer" }}>Send verification code</button>
              </>
            ) : (
              <>
                <div style={{ fontSize: 12.5, color: TOKENS.inkSoft, marginBottom: 10 }}>
                  We sent a 6-digit code to <strong style={{ color: TOKENS.ink }}>{contactValue}</strong>.
                </div>
                <div style={{ background: TOKENS.parchment, border: `1px dashed ${TOKENS.line}`, borderRadius: 8, padding: "8px 10px", fontSize: 11, color: TOKENS.inkSoft, marginBottom: 12, display: "flex", gap: 6, alignItems: "flex-start" }}>
                  <ShieldCheck size={14} style={{ flexShrink: 0, marginTop: 1 }} />
                  <span>Sandbox preview — there's no real SMS/email service connected here, so your code is shown below instead of delivered. In a live version this box wouldn't exist.<br /><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontWeight: 700, fontSize: 16, color: TOKENS.pine }}>{generatedOtp}</span></span>
                </div>
                <label style={labelStyle}>Enter code</label>
                <input style={{ ...inputStyle, marginBottom: 8, letterSpacing: 4, fontFamily: "'IBM Plex Mono', monospace", textAlign: "center", fontSize: 16 }} maxLength={6} value={otpInput} onChange={(e) => setOtpInput(e.target.value.replace(/\D/g, ""))} onKeyDown={(e) => e.key === "Enter" && verifyOtp()} />
                {otpError && <div style={{ color: TOKENS.brick, fontSize: 12, marginBottom: 8 }}>{otpError}</div>}
                <button onClick={verifyOtp} style={{ width: "100%", background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 8, padding: "9px 0", fontWeight: 600, cursor: "pointer", marginBottom: 8 }}>Verify & Continue</button>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11.5 }}>
                  <button onClick={() => setProfileStep("form")} style={{ background: "none", border: "none", color: TOKENS.inkSoft, cursor: "pointer" }}>Change {contactType}</button>
                  <button onClick={sendOtp} style={{ background: "none", border: "none", color: TOKENS.pine, cursor: "pointer", display: "flex", alignItems: "center", gap: 4 }}><RefreshCw size={11} /> Resend code</button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {/* Top bar */}
      <div style={{ background: TOKENS.pine, padding: "14px 20px", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
          <Globe2 color={TOKENS.gold} size={22} />
          <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, color: TOKENS.paper }}>MOHAZAN</div>
          {isOwner && <span style={{ background: TOKENS.gold, color: TOKENS.pineDark, fontSize: 10, fontWeight: 700, padding: "2px 7px", borderRadius: 10, fontFamily: "'IBM Plex Mono', monospace" }}>OWNER</span>}
        </div>
        <button onClick={() => setCartOpen(true)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: TOKENS.parchment }}>
          <ShoppingCart size={20} />
          {totalItems > 0 && <span style={{ position: "absolute", top: -6, right: -8, background: TOKENS.brick, color: "#fff", fontSize: 10, borderRadius: 10, padding: "1px 5px", fontFamily: "'IBM Plex Mono', monospace" }}>{totalItems}</span>}
        </button>
      </div>

      {/* Main content */}
      <div className="pk-scroll" style={{ flex: 1, overflowY: "auto", minHeight: 480 }}>
        {tab === "home" && (
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
              <div style={{ flex: 1, display: "flex", alignItems: "center", gap: 8, background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: "9px 12px" }}>
                <Search size={16} color={TOKENS.inkSoft} />
                <input value={query} onChange={(e) => setQuery(e.target.value)} placeholder="Search products…" style={{ border: "none", outline: "none", background: "none", fontFamily: "'Space Grotesk', sans-serif", fontSize: 13, flex: 1, color: TOKENS.ink }} />
                {query && <button onClick={() => setQuery("")} style={{ border: "none", background: "none", cursor: "pointer", color: TOKENS.inkSoft }}><X size={14} /></button>}
              </div>
            </div>

            {!category && !query ? (
              <>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, marginBottom: 10 }}>Shop by category</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 10, marginBottom: 20 }}>
                  {categories.map((c) => (
                    <button key={c} onClick={() => setCategory(c)} className="pk-tile" style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 12, padding: "16px 8px", display: "flex", flexDirection: "column", alignItems: "center", gap: 6, cursor: "pointer" }}>
                      <div style={{ fontSize: 26 }}>{CATEGORY_ICONS[c] || "🛍️"}</div>
                      <div style={{ fontSize: 11.5, fontWeight: 600, textAlign: "center" }}>{c}</div>
                    </button>
                  ))}
                </div>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, marginBottom: 10, display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={16} color={TOKENS.gold} /> Recommended for you</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                  {recommended.map((p) => <ProductCard key={p.id} p={p} {...cardProps} />)}
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 12, flexWrap: "wrap", gap: 8 }}>
                  <button onClick={() => { setCategory(null); setQuery(""); setSortBy(""); }} style={{ display: "flex", alignItems: "center", gap: 6, background: "none", border: "none", cursor: "pointer", fontWeight: 600, fontSize: 13.5, color: TOKENS.pine }}>
                    <ArrowLeft size={15} /> {query ? `Results for "${query}"` : category}
                  </button>
                  <div style={{ position: "relative" }}>
                    <button onClick={() => setShowSort((s) => !s)} style={{ display: "flex", alignItems: "center", gap: 5, background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: "6px 10px", cursor: "pointer", fontSize: 12 }}>
                      <SlidersHorizontal size={13} /> Sort
                    </button>
                    {showSort && (
                      <div style={{ position: "absolute", right: 0, top: "110%", background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 8, zIndex: 10, boxShadow: "0 6px 16px rgba(0,0,0,0.1)", overflow: "hidden", width: 180 }}>
                        {[["", "Default"], ["priceHigh", "Price: High to Low"], ["priceLow", "Price: Low to High"], ["nameAZ", "Name: A to Z"], ["nameZA", "Name: Z to A"]].map(([val, label]) => (
                          <button key={val} onClick={() => { setSortBy(val); setShowSort(false); }} style={{ display: "block", width: "100%", textAlign: "left", padding: "8px 12px", background: sortBy === val ? TOKENS.parchment : "none", border: "none", cursor: "pointer", fontSize: 12.5 }}>{label}</button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(160px, 1fr))", gap: 14 }}>
                  {isOwner && category && (addingNew ? (
                    <div className="pk-card" style={{ background: TOKENS.paper, borderRadius: 12, border: `1px dashed ${TOKENS.pine}`, padding: 14 }}>
                      <ProductForm draft={newDraft} setDraft={setNewDraft} onSave={saveNew} onCancel={() => setAddingNew(false)} saving={saving} />
                    </div>
                  ) : (
                    <button onClick={() => { setNewDraft({ ...newDraft, category }); setAddingNew(true); }} className="pk-card" style={{ background: "none", border: `1.5px dashed ${TOKENS.pine}`, borderRadius: 12, minHeight: 160, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 6, cursor: "pointer", color: TOKENS.pine, fontWeight: 600, fontSize: 13 }}><Plus size={22} /> Add product</button>
                  ))}
                  {visibleProducts.map((p) => <ProductCard key={p.id} p={p} {...cardProps} />)}
                  {visibleProducts.length === 0 && <div style={{ color: TOKENS.inkSoft, fontSize: 13, gridColumn: "1/-1", textAlign: "center", padding: 30 }}>No products found.</div>}
                </div>
              </>
            )}
          </div>
        )}

        {tab === "messages" && (
          <div style={{ display: "flex", flexDirection: "column", height: 480 }}>
            <div style={{ padding: "12px 18px", borderBottom: `1px solid ${TOKENS.line}`, fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 15, background: TOKENS.paper }}>Message MOHAZAN Store</div>
            <div className="pk-scroll" style={{ flex: 1, overflowY: "auto", padding: 16, display: "flex", flexDirection: "column", gap: 10 }}>
              {messages.length === 0 && <div style={{ color: TOKENS.inkSoft, fontSize: 12.5, textAlign: "center", marginTop: 20 }}>Ask us anything about your order, products, or shipping.</div>}
              {messages.map((m, i) => (
                <div key={i} style={{ alignSelf: m.from === "user" ? "flex-end" : "flex-start", maxWidth: "75%" }}>
                  <div style={{ background: m.from === "user" ? TOKENS.pine : TOKENS.paper, color: m.from === "user" ? TOKENS.paper : TOKENS.ink, border: m.from === "user" ? "none" : `1px solid ${TOKENS.line}`, borderRadius: 12, padding: "8px 12px", fontSize: 13 }}>{m.text}</div>
                </div>
              ))}
              <div ref={chatEndRef} />
            </div>
            <div style={{ display: "flex", gap: 8, padding: 14, borderTop: `1px solid ${TOKENS.line}`, background: TOKENS.paper }}>
              <input value={chatInput} onChange={(e) => setChatInput(e.target.value)} onKeyDown={(e) => e.key === "Enter" && sendChat()} placeholder="Type a message…" style={{ ...inputStyle, flex: 1 }} />
              <button onClick={sendChat} style={{ background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 8, padding: "0 14px", cursor: "pointer" }}><Send size={15} /></button>
            </div>
          </div>
        )}

        {tab === "notifications" && (
          <div style={{ padding: 18 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Notifications</div>
            {notifications.length === 0 ? <div style={{ color: TOKENS.inkSoft, fontSize: 13, textAlign: "center", padding: 30 }}>No notifications yet.</div> :
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {notifications.map((n) => (
                  <div key={n.id} style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 12, display: "flex", gap: 10, alignItems: "flex-start" }}>
                    <Bell size={16} color={TOKENS.gold} style={{ marginTop: 2, flexShrink: 0 }} />
                    <div><div style={{ fontSize: 13 }}>{n.text}</div><div style={{ fontSize: 11, color: TOKENS.inkSoft, marginTop: 3, fontFamily: "'IBM Plex Mono', monospace" }}>{new Date(n.ts).toLocaleString()}</div></div>
                  </div>
                ))}
              </div>}
          </div>
        )}

        {tab === "ads" && (
          <div style={{ padding: 18 }}>
            <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, marginBottom: 14 }}>Featured & Promotions</div>
            <div style={{ display: "flex", flexDirection: "column", gap: 14 }}>
              {isOwner && (addingAd ? (
                <div style={{ background: TOKENS.paper, border: `1px dashed ${TOKENS.pine}`, borderRadius: 12, padding: 14 }}>
                  <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                    <input style={inputStyle} placeholder="Title" value={newAdDraft.title} onChange={(e) => setNewAdDraft({ ...newAdDraft, title: e.target.value })} />
                    <input style={inputStyle} placeholder="Description" value={newAdDraft.desc} onChange={(e) => setNewAdDraft({ ...newAdDraft, desc: e.target.value })} />
                    <input style={inputStyle} placeholder="Emoji" value={newAdDraft.emoji} onChange={(e) => setNewAdDraft({ ...newAdDraft, emoji: e.target.value })} />
                    <div style={{ display: "flex", gap: 8 }}>
                      <button onClick={saveNewAd} style={{ flex: 1, background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 7, padding: "7px 0", fontWeight: 600, cursor: "pointer" }}>Save</button>
                      <button onClick={() => setAddingAd(false)} style={{ flex: 1, background: "none", border: `1px solid ${TOKENS.line}`, borderRadius: 7, padding: "7px 0", cursor: "pointer" }}>Cancel</button>
                    </div>
                  </div>
                </div>
              ) : (
                <button onClick={() => setAddingAd(true)} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, border: `1.5px dashed ${TOKENS.pine}`, background: "none", color: TOKENS.pine, borderRadius: 12, padding: "14px 0", cursor: "pointer", fontWeight: 600, fontSize: 13 }}><Plus size={16} /> Add promotion</button>
              ))}
              {ads.map((a) => (
                editingAdId === a.id ? (
                  <div key={a.id} style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.gold}`, borderRadius: 12, padding: 14 }}>
                    <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                      <input style={inputStyle} value={adDraft.title} onChange={(e) => setAdDraft({ ...adDraft, title: e.target.value })} />
                      <input style={inputStyle} value={adDraft.desc} onChange={(e) => setAdDraft({ ...adDraft, desc: e.target.value })} />
                      <div style={{ display: "flex", gap: 8 }}>
                        <button onClick={saveAdEdit} style={{ flex: 1, background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 7, padding: "7px 0", fontWeight: 600, cursor: "pointer" }}>Save</button>
                        <button onClick={() => setEditingAdId(null)} style={{ flex: 1, background: "none", border: `1px solid ${TOKENS.line}`, borderRadius: 7, padding: "7px 0", cursor: "pointer" }}>Cancel</button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div key={a.id} style={{ borderRadius: 14, overflow: "hidden", border: `1px solid ${TOKENS.line}`, position: "relative" }}>
                    <div style={{ background: a.color || TOKENS.pine, height: 130, display: "flex", alignItems: "center", justifyContent: "center", position: "relative" }}>
                      <div style={{ fontSize: 44 }}>{a.emoji}</div>
                      <div style={{ position: "absolute", inset: 0, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.15)" }}>
                        <PlayCircle size={40} color="rgba(255,255,255,0.85)" />
                      </div>
                      <span style={{ position: "absolute", top: 8, left: 8, background: "rgba(0,0,0,0.4)", color: "#fff", fontSize: 9.5, padding: "2px 7px", borderRadius: 6, fontFamily: "'IBM Plex Mono', monospace" }}>SPONSORED</span>
                      {isOwner && <div style={{ position: "absolute", top: 8, right: 8, display: "flex", gap: 6 }}>
                        <button onClick={() => { setEditingAdId(a.id); setAdDraft({ ...a }); }} style={{ border: "none", background: "rgba(255,255,255,0.85)", borderRadius: 6, padding: 5, cursor: "pointer", color: TOKENS.pine }}><Pencil size={12} /></button>
                        <button onClick={() => deleteAd(a.id)} style={{ border: "none", background: "rgba(255,255,255,0.85)", borderRadius: 6, padding: 5, cursor: "pointer", color: TOKENS.brick }}><Trash2 size={12} /></button>
                      </div>}
                    </div>
                    <div style={{ background: TOKENS.paper, padding: "10px 14px" }}>
                      <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 14.5 }}>{a.title}</div>
                      <div style={{ fontSize: 12, color: TOKENS.inkSoft, marginTop: 2 }}>{a.desc}</div>
                    </div>
                  </div>
                )
              ))}
            </div>
          </div>
        )}

        {tab === "me" && (
          <div style={{ padding: 18 }}>
            <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginBottom: 6 }}>
              <button onClick={() => setCartOpen(true)} style={{ position: "relative", background: "none", border: "none", cursor: "pointer", color: TOKENS.pine }}>
                <ShoppingCart size={19} />
                {totalItems > 0 && <span style={{ position: "absolute", top: -6, right: -8, background: TOKENS.brick, color: "#fff", fontSize: 9.5, borderRadius: 10, padding: "1px 5px" }}>{totalItems}</span>}
              </button>
              <button onClick={() => setShowSettings(true)} style={{ background: "none", border: "none", cursor: "pointer", color: TOKENS.pine }}><SettingsIcon size={19} /></button>
            </div>

            {isOwner ? (
              <>
                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 18, marginBottom: 4 }}>Owner Dashboard</div>
                <div style={{ display: "flex", gap: 12, marginBottom: 16, flexWrap: "wrap" }}>
                  <div style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: "10px 16px", flex: "1 1 120px" }}>
                    <div style={{ fontSize: 10.5, color: TOKENS.inkSoft, fontFamily: "'IBM Plex Mono', monospace" }}>PRODUCTS</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: TOKENS.pine }}>{products.length}</div>
                  </div>
                  <div style={{ background: "#FBEEEC", border: `1px solid ${TOKENS.brick}`, borderRadius: 10, padding: "10px 16px", flex: "1 1 120px" }}>
                    <div style={{ fontSize: 10.5, color: TOKENS.brick, fontFamily: "'IBM Plex Mono', monospace" }}>LOW STOCK</div>
                    <div style={{ fontFamily: "'Fraunces', serif", fontSize: 22, fontWeight: 700, color: TOKENS.brick }}>{lowStockCount}</div>
                  </div>
                </div>
                <div className="pk-scroll" style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 12, overflow: "hidden" }}>
                  <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 0.8fr 0.9fr", gap: 6, padding: "9px 14px", background: TOKENS.pine, color: TOKENS.parchment, fontSize: 10, fontFamily: "'IBM Plex Mono', monospace" }}>
                    <div>PRODUCT</div><div>PRICE</div><div>STOCK</div><div>STATUS</div><div style={{ textAlign: "right" }}>ACTION</div>
                  </div>
                  {[...products].sort((a, b) => stockStatus(a.stock, a.maxStock).pct - stockStatus(b.stock, b.maxStock).pct).map((p) => {
                    const status = stockStatus(p.stock, p.maxStock);
                    if (editingId === p.id) return <div key={p.id} style={{ padding: 12, borderTop: `1px solid ${TOKENS.line}` }}><ProductForm draft={editDraft} setDraft={setEditDraft} onSave={saveEdit} onCancel={() => setEditingId(null)} saving={saving} /></div>;
                    return (
                      <div key={p.id} style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1.3fr 0.8fr 0.9fr", gap: 6, padding: "9px 14px", alignItems: "center", borderTop: `1px solid ${TOKENS.line}`, fontSize: 12 }}>
                        <div style={{ display: "flex", gap: 6, alignItems: "center" }}><span>{p.emoji}</span><div style={{ fontWeight: 600 }}>{p.name}</div></div>
                        <div style={{ fontFamily: "'IBM Plex Mono', monospace" }}>${p.price.toFixed(2)}</div>
                        <div><StockBar stock={p.stock} maxStock={p.maxStock} /><span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: 10, color: TOKENS.inkSoft }}>{p.stock}/{p.maxStock}</span></div>
                        <Badge status={status} />
                        <div style={{ textAlign: "right", display: "flex", gap: 4, justifyContent: "flex-end" }}>
                          <button onClick={() => startEdit(p)} style={{ border: `1px solid ${TOKENS.pine}`, background: "none", color: TOKENS.pine, borderRadius: 6, padding: "4px 6px", cursor: "pointer" }}><Pencil size={11} /></button>
                          <button onClick={() => deleteProduct(p.id)} style={{ border: `1px solid ${TOKENS.brick}`, background: "none", color: TOKENS.brick, borderRadius: 6, padding: "4px 6px", cursor: "pointer" }}><Trash2 size={11} /></button>
                        </div>
                      </div>
                    );
                  })}
                  <div style={{ padding: 12, borderTop: `1px solid ${TOKENS.line}` }}>
                    {addingNew ? <ProductForm draft={newDraft} setDraft={setNewDraft} onSave={saveNew} onCancel={() => setAddingNew(false)} saving={saving} /> :
                      <button onClick={() => setAddingNew(true)} style={{ display: "flex", alignItems: "center", gap: 6, border: `1.5px dashed ${TOKENS.pine}`, background: "none", color: TOKENS.pine, borderRadius: 8, padding: "8px 14px", cursor: "pointer", fontWeight: 600, fontSize: 12.5 }}><Plus size={14} /> Add product</button>}
                  </div>
                </div>
              </>
            ) : (
              <>
                <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 18 }}>
                  <div style={{ width: 52, height: 52, borderRadius: "50%", background: TOKENS.pine, color: TOKENS.gold, display: "flex", alignItems: "center", justifyContent: "center", fontFamily: "'Fraunces', serif", fontWeight: 700, fontSize: 20 }}>
                    {account ? account.name.charAt(0).toUpperCase() : <User size={22} />}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 16, display: "flex", alignItems: "center", gap: 5 }}>
                      {account ? account.name : "Guest"}
                      {account?.verified && <ShieldCheck size={14} color={TOKENS.pine} />}
                    </div>
                    <div style={{ fontSize: 11.5, color: TOKENS.inkSoft }}>{account ? account.contact : "Tap to create your account"}</div>
                  </div>
                  <button onClick={() => { setProfileForm({ name: account?.name || "" }); setContactValue(account?.contact || ""); setContactType(account?.contactType || "email"); setProfileStep("form"); setShowProfileForm(true); }} style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 8, padding: "7px 12px", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>{account ? "Edit" : "Create"}</button>
                </div>

                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 14, marginBottom: 8 }}>My Purchases</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 8, marginBottom: 18 }}>
                  {[["toPay", CreditCard, "To Pay"], ["toShip", Clock, "To Ship"], ["toReceive", Truck, "To Receive"], ["toRate", Star, "To Rate"]].map(([key, Icon, label]) => (
                    <button key={key} onClick={() => setMsgFilter(key)} style={{ background: msgFilter === key ? TOKENS.parchment : TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: "10px 4px", display: "flex", flexDirection: "column", alignItems: "center", gap: 4, cursor: "pointer", position: "relative" }}>
                      <Icon size={17} color={TOKENS.pine} />
                      <span style={{ fontSize: 9.5, fontWeight: 600, textAlign: "center" }}>{label}</span>
                      {orderCounts[key] > 0 && <span style={{ position: "absolute", top: 2, right: 4, background: TOKENS.brick, color: "#fff", fontSize: 9, borderRadius: 10, padding: "1px 4px" }}>{orderCounts[key]}</span>}
                    </button>
                  ))}
                </div>

                {msgFilter && (
                  <div style={{ marginBottom: 20 }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                      <div style={{ fontSize: 12.5, fontWeight: 600, color: TOKENS.inkSoft }}>Showing: {({ toPay: "To Pay", toShip: "To Ship", toReceive: "To Receive", toRate: "To Rate" })[msgFilter]}</div>
                      <button onClick={() => setMsgFilter(null)} style={{ background: "none", border: "none", color: TOKENS.brick, cursor: "pointer", fontSize: 12 }}>Close</button>
                    </div>
                    {orders.filter((o) => o.status === msgFilter).length === 0 && <div style={{ color: TOKENS.inkSoft, fontSize: 12.5, padding: "10px 0" }}>Nothing here right now.</div>}
                    {orders.filter((o) => o.status === msgFilter).map((o) => (
                      <div key={o.id} style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 12, marginBottom: 8 }}>
                        <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 6 }}>
                          <span style={{ fontFamily: "'IBM Plex Mono', monospace" }}>Order #{o.id}</span>
                          <span style={{ fontWeight: 700, color: TOKENS.pine }}>${o.total.toFixed(2)}</span>
                        </div>
                        <div style={{ fontSize: 11.5, color: TOKENS.inkSoft, marginBottom: 8 }}>{o.items.map((it) => `${it.emoji} ${it.name} ×${it.qty}`).join(", ")}</div>
                        {o.status === "toShip" && <button onClick={() => advanceOrder(o.id, "toReceive")} style={{ width: "100%", background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Mark as Shipped</button>}
                        {o.status === "toReceive" && <button onClick={() => advanceOrder(o.id, "toRate")} style={{ width: "100%", background: TOKENS.pine, color: "#fff", border: "none", borderRadius: 7, padding: "7px 0", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Confirm Receipt</button>}
                        {o.status === "toRate" && (
                          <div style={{ display: "flex", gap: 6, justifyContent: "center" }}>
                            {[1, 2, 3, 4, 5].map((n) => <button key={n} onClick={() => rateOrder(o.id, n)} style={{ background: "none", border: "none", cursor: "pointer", color: TOKENS.gold }}><Star size={20} /></button>)}
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}

                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 14, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}><PackageCheck size={15} color={TOKENS.pine} /> Received</div>
                {orders.filter((o) => o.status === "completed").length === 0 && <div style={{ color: TOKENS.inkSoft, fontSize: 12.5, marginBottom: 18 }}>No completed orders yet.</div>}
                {orders.filter((o) => o.status === "completed").map((o) => (
                  <div key={o.id} style={{ background: TOKENS.paper, border: `1px solid ${TOKENS.line}`, borderRadius: 10, padding: 10, marginBottom: 8, display: "flex", justifyContent: "space-between", alignItems: "center", fontSize: 12 }}>
                    <span>Order #{o.id} — ${o.total.toFixed(2)}</span>
                    <span style={{ display: "flex", gap: 2 }}>{Array.from({ length: o.rating || 0 }).map((_, i) => <Star key={i} size={13} fill={TOKENS.gold} color={TOKENS.gold} />)}</span>
                  </div>
                ))}

                <div style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 14, margin: "18px 0 8px", display: "flex", alignItems: "center", gap: 6 }}><Sparkles size={15} color={TOKENS.gold} /> Recommended</div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))", gap: 12 }}>
                  {recommended.map((p) => <ProductCard key={p.id} p={p} {...cardProps} />)}
                </div>

                <button onClick={() => setShowLogin(true)} style={{ width: "100%", marginTop: 20, background: "none", border: `1px dashed ${TOKENS.line}`, borderRadius: 8, padding: "9px 0", fontSize: 12, color: TOKENS.inkSoft, cursor: "pointer" }}>Store owner? Log in</button>
              </>
            )}
          </div>
        )}
      </div>

      {/* Bottom nav */}
      <div style={{ display: "flex", background: TOKENS.pineDark, borderTop: `1px solid ${TOKENS.pine}` }}>
        <NavBtn id="messages" icon={<MessageCircle size={19} />} label="Messages" />
        <NavBtn id="notifications" icon={<Bell size={19} />} label="Alerts" badge={unreadCount} />
        <NavBtn id="ads" icon={<PlayCircle size={19} />} label="Videos" />
        <NavBtn id="home" icon={<HomeIcon size={19} />} label="Home" />
        <NavBtn id="me" icon={<User size={19} />} label="Me" />
      </div>
    </div>
  );
}
