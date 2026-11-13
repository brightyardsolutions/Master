// GSAP and ScrollTrigger (same versions as the old vendor/ files). anim is false when the visitor asks for less motion.
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { reduced } from './dom.js';
gsap.registerPlugin(ScrollTrigger);
export const G = gsap;
export const ST = ScrollTrigger;
export const anim = !reduced;
