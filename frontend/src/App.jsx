import React from 'react';
import { Routes, Route } from 'react-router-dom';
import Layout from './components/Layout.jsx';
import Home from './pages/Home.jsx';
import About from './pages/About.jsx';
import Services from './pages/Services.jsx';
import Portfolio from './pages/Portfolio.jsx';
import Courses from './pages/Courses.jsx';
import Blog from './pages/Blog.jsx';
import BlogDetail from './pages/BlogDetail.jsx';
import Contact from './pages/Contact.jsx';
import Admin from './pages/Admin.jsx';
import NotFound from './pages/NotFound.jsx';
import Auth from './pages/Auth.jsx';
import Account from './pages/Account.jsx';
import CourseDetail from './pages/CourseDetail.jsx';
import Teacher from './pages/Teacher.jsx';
import Subscriptions from './pages/Subscriptions.jsx';
import Employee from './pages/Employee.jsx';
import Cart from './pages/Cart.jsx';
import ContractSign from './pages/ContractSign.jsx';
import PageTracker from './components/PageTracker.jsx';

export default function App() {
  return <Layout><Routes>
    <Route path="/" element={<Home />} /><Route path="/about" element={<About />} />
    <Route path="/services" element={<Services />} /><Route path="/portfolio" element={<Portfolio />} />
    <Route path="/courses" element={<Courses />} />
    <Route path="/courses/:id" element={<CourseDetail />} />
    <Route path="/auth" element={<Auth />} />
    <Route path="/account" element={<Account />} />
    <Route path="/teacher" element={<Teacher />} />
    <Route path="/subscriptions" element={<Subscriptions />} />
    <Route path="/cart" element={<Cart />} />
    <Route path="/employee" element={<Employee />} />
    <Route path="/contract-sign/:token" element={<ContractSign />} /><Route path="/blog" element={<Blog />} />
    <Route path="/blog/:id" element={<BlogDetail />} />
    <Route path="/contact" element={<Contact />} /><Route path="/admin" element={<Admin />} /><Route path="/admin/login" element={<Admin />} />
    <Route path="*" element={<NotFound />} />
  </Routes></Layout>;
}
