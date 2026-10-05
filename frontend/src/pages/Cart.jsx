import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { getCart, removeCartItem, checkoutCart, previewCheckout } from '../api/client.js';

export default function Cart() {
  const [items, setItems] = useState([]);
  const [busy, setBusy] = useState(false);
  const [points, setPoints] = useState(0);
  const [benefit, setBenefit] = useState(null);
  const user = JSON.parse(localStorage.getItem('codesazan-user') || 'null');
  const nav = useNavigate();

  const load = () => getCart().then(setItems).catch(() => {});

  useEffect(() => {
    if (user) load();
  }, []);

  if (!user) {
    return (
      <section className="section">
        <div className="container empty-state">
          <h2>برای مشاهده سبد خرید وارد شوید.</h2>
          <Link className="btn btn-primary" to="/auth">ورود / ثبت‌نام</Link>
        </div>
      </section>
    );
  }

  const total = items.reduce((sum, item) => sum + Number(item.price || 0), 0);

  const calc = async () => {
    try {
      const response = await previewCheckout(points);
      setBenefit(response.data);
    } catch {
      setBenefit(null);
    }
  };

  const checkout = async () => {
    setBusy(true);
    const checkoutKey = sessionStorage.getItem('codesazan-checkout-key') || (
      globalThis.crypto?.randomUUID?.() ||
      `checkout_${Date.now()}_${Math.random().toString(16).slice(2)}`
    );
    sessionStorage.setItem('codesazan-checkout-key', checkoutKey);

    try {
      const response = await checkoutCart('online', checkoutKey, points);
      alert(`پرداخت با موفقیت ثبت شد. شماره سفارش: ${response.data?.orders?.[0]?.id || '-'}`);
      sessionStorage.removeItem('codesazan-checkout-key');
      nav('/account#orders');
    } catch (error) {
      alert(error.response?.data?.message || 'پرداخت انجام نشد');
    } finally {
      setBusy(false);
    }
  };

  return (
    <section className="section">
      <div className="container">
        <div className="section-head">
          <span className="eyebrow">SHOPPING CART</span>
          <h1>سبد خرید</h1>
          <p>پرداخت آنلاین آماده اتصال به درگاه واقعی است؛ در این نسخه تراکنش با درگاه آزمایشی ثبت می‌شود.</p>
        </div>

        {!items.length ? (
          <div className="empty-state">
            سبد خرید شما خالی است.
            <br />
            <Link to="/subscriptions">مشاهده طرح‌ها</Link>
          </div>
        ) : (
          <div className="cart-layout">
            <div className="card cart-items">
              {items.map((item) => (
                <div className="cart-row" key={item.id}>
                  <div>
                    <span className="badge">اشتراک</span>
                    <h3>{item.title}</h3>
                    <small>{item.priceLabel}</small>
                  </div>
                  <button
                    className="icon-btn danger"
                    onClick={async () => {
                      await removeCartItem(item.id);
                      load();
                    }}
                  >
                    ⌫
                  </button>
                </div>
              ))}
            </div>

            <aside className="card checkout-card">
              <span className="eyebrow">CHECKOUT</span>
              <h2>خلاصه سفارش</h2>

              <div className="checkout-total">
                <span>مبلغ پایه</span>
                <strong>{total.toLocaleString('fa-IR')} تومان</strong>
              </div>

              <div className="field">
                <span>استفاده از امتیاز باشگاه</span>
                <input
                  type="number"
                  min="0"
                  value={points}
                  onChange={(event) => setPoints(event.target.value)}
                  onBlur={calc}
                />
              </div>

              {benefit && (
                <>
                  <small>
                    تخفیف سطح: {benefit.tierDiscountPercent}% · ارزش امتیاز:{' '}
                    {Number(benefit.pointsValue || 0).toLocaleString('fa-IR')} تومان
                  </small>
                  <div className="checkout-total">
                    <span>تخفیف نهایی</span>
                    <strong>{Number(benefit.discountAmount || 0).toLocaleString('fa-IR')} تومان</strong>
                  </div>
                  <div className="checkout-total">
                    <span>مبلغ نهایی</span>
                    <strong>{Number(benefit.total || 0).toLocaleString('fa-IR')} تومان</strong>
                  </div>
                </>
              )}

              <button className="btn btn-primary full-btn" disabled={busy} onClick={checkout}>
                {busy ? 'در حال اتصال به درگاه...' : 'پرداخت آنلاین و ثبت سفارش'}
              </button>
              <small className="muted">پس از پرداخت، طرح عضویت حساب شما فعال می‌شود.</small>
            </aside>
          </div>
        )}
      </div>
    </section>
  );
}
