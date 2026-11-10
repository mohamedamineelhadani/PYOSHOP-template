/* PYOSHOP · product.js — quantity stepper + gallery for product pages (replaces scriptpro.js). */
const qtyInput = () => document.getElementById('number');
function plus() { const i = qtyInput(); i.value = Math.min(99, (parseInt(i.value, 10) || 1) + 1); }
function moin() { const i = qtyInput(); i.value = Math.max(1, (parseInt(i.value, 10) || 1) - 1); }

function change(src) {
  const main = document.getElementById('photo');
  main.classList.add('swap');
  setTimeout(() => { main.src = src; main.classList.remove('swap'); }, 300);
  document.querySelectorAll('.seconds_images div').forEach(d => d.classList.toggle('is-active', d.querySelector('img').src === src));
}
document.addEventListener('DOMContentLoaded', () => {
  document.querySelector('.seconds_images div')?.classList.add('is-active');
  qtyInput()?.addEventListener('change', e => { e.target.value = Math.min(99, Math.max(1, parseInt(e.target.value, 10) || 1)); });
});
