import {useEffect} from 'react';import {useLocation} from 'react-router-dom';import {trackPageView} from '../api/client.js';
export default function PageTracker(){const l=useLocation();useEffect(()=>{const section=l.pathname.split('/')[1]||'home';trackPageView(l.pathname,section)},[l.pathname]);return null}
