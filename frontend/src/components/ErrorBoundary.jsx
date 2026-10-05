import React from 'react';
export default class ErrorBoundary extends React.Component {
  state={error:null};
  static getDerivedStateFromError(error){return {error};}
  render(){
    if(this.state.error)return <main className="section"><div className="container"><div className="card"><h1>خطای غیرمنتظره</h1><p className="muted">صفحه نتوانست به‌درستی بارگذاری شود. لطفاً صفحه را تازه‌سازی کنید.</p><button className="btn btn-primary" onClick={()=>window.location.reload()}>تلاش دوباره</button></div></div></main>;
    return this.props.children;
  }
}
